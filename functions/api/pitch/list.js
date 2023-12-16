
export async function onRequestGet(context) {
  const { searchParams } = new URL(context.request.url)
  let offset = searchParams.get('offset') ?? 0
  let count = searchParams.get('count') ?? 30

  count = Math.min(Math.max(count, 0), 100)

  let db = context.env.DB
  let { total } = await db.prepare('SELECT COUNT(*) AS total FROM PitchDeck')
    .first();

  let pitchDecksRaw = await db.prepare('SELECT public_id, company_type, company_name, created_date FROM PitchDeck WHERE id > ? ORDER BY Id LIMIT ?')
    .bind(offset, count)
    .all();

  let pitchDecks = pitchDecksRaw.results.map(elem => {
    return {
      Id: elem.public_id,
      companyType: elem.company_type,
      companyName: elem.company_name,
      createdDate: elem.created_date,
    }
  })

  return new Response(JSON.stringify({ pitchDecks, total }))
}