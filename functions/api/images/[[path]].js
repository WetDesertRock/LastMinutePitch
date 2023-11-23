
export async function onRequestGet(context) {
  const key = context.params.path.join("/")
  console.log(key)

  const object = await context.env.STORAGE.get(key);

  if (object === null) {
    return new Response('Object Not Found', { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);

  return new Response(object.body, {
    headers,
  });
}