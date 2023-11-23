import OpenAI from 'openai';
import { Buffer } from 'node:buffer';

export async function onRequestPut(context) {
  let data = await context.request.formData()
  let companyType = data.get("companyType")
  let companyName = data.get("companyName")
  let openaiAPIKey = context.env.OPENAI_KEY

  let publicId = Date.now().toString(36) + Math.floor(Math.pow(10, 12) + Math.random() * 9 * Math.pow(10, 12)).toString(36)
  console.log("Creating pitch " + publicId)

  let prompt = generatePrompt(companyType, companyName)
  console.log("\tUsing prompt " + prompt)

  let slides = await generateSlides(openaiAPIKey, prompt)

  let dallEPromises = []
  for (let i = 0; i < slides.length; i++) {
    let slide = slides[i]
    slide.imageLocation = `${publicId}/${publicId}_${i}.webp`

    console.log("\tGenerating image from prompt " + slide.imagePrompt)
    let promise = generateDallEImage(openaiAPIKey, slide.imagePrompt)
      .then((image) => {
        return context.env.STORAGE.put(slide.imageLocation, image);
      })
      .then(() => {
        console.log("Done uploading image")
      })

    dallEPromises.push(promise)
  }
  await Promise.all(dallEPromises)

  console.log("\tStoring in database")
  let db = context.env.DB

  let pitchDeckInsert = await db.prepare("INSERT INTO PitchDeck (public_id, company_type, company_name, prompt) values (?, ?, ?, ?)")
    .bind(publicId, companyType, companyName, prompt)
    .run()

  console.log("\tInserting slides")
  let pitchDeckId = pitchDeckInsert.meta.last_row_id
  let insertSlideStmt = db.prepare("INSERT INTO Slide (pitch_deck_id, order_index, title, content, image_location) values (?, ?, ?, ?, ?)")

  let slideInsertBatch = []
  for (let i = 0; i < slides.length; i++) {
    let slide = slides[i]
    slideInsertBatch.push(insertSlideStmt.bind(pitchDeckId, i, slide.title, slide.content, slide.imageLocation))
  }

  await db.batch(slideInsertBatch);

  return new Response(JSON.stringify({
    pitchdeck_id: publicId
  }))
}

const gptSystemMessage = `Please create a 2 slide slide deck using the prompt the user gives you. To do this start by coming up with the title for each slide. Then fill it in with 3-4 bullet points going into more depth about each slide topic. These bullet points should be short and concise. Finally come up with a Dall-E prompt for an image on each slide. This prompt should include a style for Dall-E to use when generating the image. Your answer should be formatted in proper markdown. Do not include any slide numbering.

You must produce JSON. The JSON you produce should be an object with one property ("slides") which is a list of slides, each slide containing the image prompt (stored in imagePrompt), the title (stored in title), and the content (stored in content) stored as a markdown string
`

function generatePrompt(companyType, companyName) {
  return `Tell me about a ${companyType} named "${companyName}". `
}

async function generateSlides(openaiAPIKey, prompt) {
  const openai = new OpenAI({
    apiKey: openaiAPIKey,
  })
  const chat_completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-1106",
    messages: [
      { role: "system", content: gptSystemMessage },
      { role: "user", content: prompt }
    ],
    response_format: { "type": "json_object" }
  })

  let usage = chat_completion.usage
  console.log(`\tChatGPT token usage info: Prompt: ${usage.prompt_tokens}, Completion: ${usage.completion_tokens}, Total: ${usage.total_tokens}`)

  let choice = chat_completion.choices[0]

  return JSON.parse(choice.message.content).slides
}

async function generateDallEImage(apiKey, prompt) {
  const openai = new OpenAI({
    apiKey: apiKey,
  })

  let request = {
    prompt: prompt,
    n: 1,
    response_format: "b64_json",
    model: "dall-e-2",
    size: "1024x1024"
  }
  // let request = {
  //   prompt: prompt,
  //   n: 1,
  //   response_format: "b64_json",
  //   model: "dall-e-3",
  //   // quality: "hd",
  //   size: "1024x1792"
  // }

  let response = await openai.images.generate(request)

  console.log("Revised prompt: ", response.data[0].revised_prompt)
  return Buffer.from(response.data[0].b64_json, 'base64');
}