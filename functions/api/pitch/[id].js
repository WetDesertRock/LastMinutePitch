
export async function onRequestGet(context) {
  let publicId = context.params.id

  let db = context.env.DB
  let pitchDeck = await db.prepare('SELECT id, company_type, company_name, created_date FROM PitchDeck WHERE public_id = ?')
    .bind(publicId)
    .first();

  let slides = await db.prepare('SELECT order_index, title, content, image_location FROM Slide WHERE pitch_deck_id = ?')
    .bind(pitchDeck.id)
    .all()

  let response = {
    companyName: pitchDeck.company_name,
    companyType: pitchDeck.company_type,
    createdDate: pitchDeck.created_date,
    slides: []
  }

  for (let slide of slides.results) {
    response.slides.push({
      order: slide.order_index,
      title: slide.title,
      content: slide.content,
      imageLocation: slide.image_location
    })
  }

  return new Response(JSON.stringify(response))
}