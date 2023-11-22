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

  let rawSlides = await generateSlides(openaiAPIKey, prompt)
  console.log("RawSlides " + rawSlides)

  console.log("\tParsing response")
  let slides = parseGPTResponse(rawSlides)

  let dallEPromises = []
  for (let i = 0; i < slides.length; i++) {
    let slide = slides[i]
    slide.imageLocation = `${publicId}/${publicId}_${i}`

    console.log("\tGenerating image from prompt " + slide.imagePrompt)
    let promise = generateDallEImage(openaiAPIKey, slide.imagePrompt)
      .then((image) => {
        let image_name =
          context.env.STORAGE.put(slide.imageLocation, image);
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

const gptSystemMessage = `Please create a 2 slide slide deck using the prompt the user gives you. To do this start by coming up with the title for each slide. Then fill it in with 3-4 bullet points going into more depth about each slide topic. These bullet points should be short and concise. Then come up with a Dall-E prompt for an image on each slide. Finally, ensure your response matches the format example I will provide and make any necessary edits. This prompt should include a style for Dall-E to use when generating the image. Your answer should be formatted in proper markdown, using a horizontal separator ("---") to split out the slides. Do not include any slide numbering. Here is an example slide:

Title = <Slide Title>
Image = <Dall-E prompt>

 - <Bullet 1>
 - <Bullet 2>
 - <more bullets>
`

function generatePrompt(companyType, companyName) {
  return `Tell me about a ${companyType} named "${companyName}". `
}

async function generateSlides(openaiAPIKey, prompt) {
  const openai = new OpenAI({
    apiKey: openaiAPIKey,
  })
  const chat_completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: gptSystemMessage },
      { role: "user", content: prompt }
    ]
  })

  let usage = chat_completion.usage
  console.log(`\tChatGPT token usage info: Prompt: ${usage.prompt_tokens}, Completion: ${usage.completion_tokens}, Total: ${usage.total_tokens}`)

  let choice = chat_completion.choices[0]

  return choice.message.content
}

function parseGPTResponse(response) {
  let rawSlides = response.split(/^---/m)
  let slides = []
  for (let rawSlide of rawSlides) {
    if (rawSlide.trim().length == 0)
      continue

    let foundTitle = rawSlide.match(/^Title:? =? (.*)/m)
    let title = foundTitle[1]

    let foundImagePrompt = rawSlide.match(/^Image:? =? (.*)/m)
    let imagePrompt = foundImagePrompt[1]

    // Strip out the title/image portions
    let content = rawSlide.replace(foundTitle[0], "").replace(foundImagePrompt[0], "").trim()

    slides.push({
      title,
      imagePrompt,
      content
    })
  }

  return slides
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
    // quality: "hd",
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