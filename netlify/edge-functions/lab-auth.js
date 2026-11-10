// VisionSpect lab: access-code gate for data under /lab/ (same pattern as the Mensuro app).
// - Lab pages themselves load without a code. They hold no data and no engine code, are never
//   linked from the site, and are marked noindex.
// - /lab/camera-health/data.json requires the header X-VisionSpect-Access to match LAB_PASSWORD.
//   The page asks for the code once and remembers it in that browser.
// - The data is fetched server-side from CAMERA_HEALTH_DATA_URL, so the storage URL never
//   reaches the browser.
// Both values are Netlify environment variables (scope: Functions). Nothing secret lives in this repo.
// If LAB_PASSWORD isn't set, the data stays closed.

const DATA_PATH = '/lab/camera-health/data.json';
const noStore = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow' };

function sameString(a, b) {
  // compare without stopping at the first difference
  const len = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < len; i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

export default async (request, context) => {
  const url = new URL(request.url);

  if (url.pathname !== DATA_PATH) {
    const response = await context.next();
    const out = new Response(response.body, response);
    for (const [k, v] of Object.entries(noStore)) out.headers.set(k, v);
    return out;
  }

  const expected = Netlify.env.get('LAB_PASSWORD');
  if (!expected) return Response.json({ error: 'The lab is closed.' }, { status: 503, headers: noStore });

  const given = request.headers.get('x-visionspect-access') || '';
  if (!given || !sameString(given, expected)) {
    return Response.json({ error: 'That access code isn’t right.' }, { status: 401, headers: noStore });
  }

  const source = Netlify.env.get('CAMERA_HEALTH_DATA_URL');
  if (!source) return Response.json({ error: 'Data source not configured' }, { status: 503, headers: noStore });
  const upstream = await fetch(source, { headers: { 'Cache-Control': 'no-cache' } });
  if (!upstream.ok) return Response.json({ error: `Data source returned ${upstream.status}` }, { status: 502, headers: noStore });
  return new Response(upstream.body, { status: 200, headers: { ...noStore, 'Content-Type': 'application/json; charset=utf-8' } });
};

export const config = { path: ['/lab', '/lab/*'] };
