// VisionSpect lab: password gate for everything under /lab/.
// - HTTP Basic Auth. Any username; the password must match LAB_PASSWORD.
// - /lab/camera-health/data.json is fetched server-side from CAMERA_HEALTH_DATA_URL,
//   so the storage URL never reaches the browser.
// Both values are Netlify environment variables (scope: Functions). Nothing secret lives in this repo.
// If LAB_PASSWORD isn't set, the lab stays closed.

const REALM = 'VisionSpect Lab';

function sameString(a, b) {
  // compare without stopping at the first difference
  const len = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < len; i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

function passwordFrom(request) {
  const header = request.headers.get('authorization') || '';
  const [scheme, encoded] = header.split(' ');
  if (!encoded || scheme.toLowerCase() !== 'basic') return null;
  try {
    const decoded = new TextDecoder().decode(Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0)));
    const i = decoded.indexOf(':');
    return i >= 0 ? decoded.slice(i + 1) : null;
  } catch {
    return null;
  }
}

const noStore = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow' };

export default async (request, context) => {
  const expected = Netlify.env.get('LAB_PASSWORD');
  if (!expected) {
    return new Response('The lab is closed.', { status: 503, headers: { ...noStore, 'Content-Type': 'text/plain; charset=utf-8' } });
  }
  const given = passwordFrom(request);
  if (given === null || !sameString(given, expected)) {
    return new Response('Password required.', {
      status: 401,
      headers: { ...noStore, 'Content-Type': 'text/plain; charset=utf-8', 'WWW-Authenticate': `Basic realm="${REALM}", charset="UTF-8"` }
    });
  }

  const url = new URL(request.url);
  if (url.pathname === '/lab/camera-health/data.json') {
    const source = Netlify.env.get('CAMERA_HEALTH_DATA_URL');
    if (!source) {
      return Response.json({ error: 'Data source not configured' }, { status: 503, headers: noStore });
    }
    const upstream = await fetch(source, { headers: { 'Cache-Control': 'no-cache' } });
    if (!upstream.ok) {
      return Response.json({ error: `Data source returned ${upstream.status}` }, { status: 502, headers: noStore });
    }
    return new Response(upstream.body, { status: 200, headers: { ...noStore, 'Content-Type': 'application/json; charset=utf-8' } });
  }

  const response = await context.next();
  const out = new Response(response.body, response);
  for (const [k, v] of Object.entries(noStore)) out.headers.set(k, v);
  return out;
};

export const config = { path: ['/lab', '/lab/*'] };
