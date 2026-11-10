# VisionSpect site: house rules

Read this before changing anything in this repo.

## What this is
The marketing site for VisionSpect Solutions (visionspect.com). Plain HTML, CSS and a
little JavaScript. No framework, no build step. Netlify publishes the repo folder as-is
on every merge to `main`.

## Workflow
- Never push to `main`. Work on a branch and open a pull request.
- Netlify builds a free deploy preview for every PR. Nick reviews it and merges.
- Batch changes into one PR where possible: every production deploy costs Netlify credits.
- No secrets in the repo, ever. The Cloudflare analytics token in `assets/site.js` is a
  public site token and is fine to commit.

## Brand
- Name: VisionSpect Solutions. Domain: visionspect.com. Email: nick@visionspect.com.
- Focus: vision inspection in **manufacturing only**. No drone inspection, no highway/ITS,
  anywhere on the site.
  Exception: `/lab/` holds unlisted R&D pages behind an access code (currently the SCDOT
  camera-health pilot). Never link to `/lab/` from public pages, the sitemap or robots.txt.
- Positioning: vendor-neutral. "We pick the system that fits your part, not the one we're
  paid to sell." Vendor neutral, no hardware sales. Based in Greenville, SC; serves SC manufacturers.
- We integrate and configure systems; we don't make cameras. Say "integrate" or
  "configure", never "build" a system.
- Fonts: Montserrat for headings, Lato for body. Self-hosted in `assets/fonts/`. Do not
  add Google Fonts or any other font requests.
- Colors live as CSS variables at the top of `assets/site.css`:
  - `--green` #70AD47: graphics, fills, button backgrounds. Too light for text on white.
  - `--green-ink` #3F7A22: green text on light backgrounds.
  - `--ink` #1D2326 text, `--steel` #55626A secondary text, `--paper` #F3F6F5 tinted sections.
  - `--ng` #E5533D for reject/defect states only.
- Logo files in `assets/img/`. The lens mark replaces the "o" in the wordmark. The site uses
  the bold wordmarks (`visionspect-wordmark-bold-white.svg` on the black header and footer;
  `-bold-dark.svg` if a logo is ever needed on a light background). Header and footer are
  pure black (#000) so the lens's black disc blends in.
- Don't name past employers. Say "automotive manufacturing".
- Write "SCMEP" with no space.
- Service names are proper names in Title Case: Vision System Health Check, New Inspection,
  Support & Tuning.
- Credentials that may be shown: SCMEP third-party provider, SourceSC approved supplier,
  work aligned to ISO 9001 and IATF 16949. Don't add certifications, client names, logos
  or numbers that Nick hasn't confirmed.

## Copy
- Short, direct, plain. Founder voice ("I" for Nick's own lines, "we" for the company).
- Sentence case for headings and buttons, except service names. No all-caps labels. No buzzwords ("cutting-edge", "seamless", "solutions
  that empower").
- Graphics over paragraphs: if a section needs more than ~3 sentences, it probably needs
  an illustration instead.

## Lab (`/lab/`)
- Every request under `/lab/` goes through `netlify/edge-functions/lab-auth.js`. Lab pages load
  freely (no data in them); their data needs an access code, the same pattern as the Mensuro app.
  The code is the Netlify env var `LAB_PASSWORD`; the data stays closed if it's unset.
- `lab/camera-health/index.html` is generated from the private `visionspect/quality-gate` repo
  (`node monitor/build-lab-page.js <path>`). Don't hand-edit it; change the template there and regenerate.
- Its data comes from Google Cloud Run via the env var `CAMERA_HEALTH_DATA_URL`, fetched by the edge
  function. Data updates never need a deploy.
- No engine code on this site. The engine stays in the private repo.

## Conventions
- Cache busting: CSS/JS are linked as `site.css?v=YYYYMMDDx`. Bump the value in every
  HTML file when you change those files.
- Every page has a title, meta description, canonical URL and favicon links. Lab pages
  skip the canonical URL and stay out of the sitemap. The homepage
  also has Open Graph tags (og-image is `assets/img/og-image.jpg`, 1200x630).
- Illustrations are inline SVG, colored with the classes in `site.css`, with a `<title>`
  for screen readers.
- The hero animation is in `assets/site.js`. It respects `prefers-reduced-motion` (shows a
  still frame) and pauses when scrolled out of view. Keep both behaviors.
- Mobile first: check every change at 390px wide. No horizontal scrolling.
- Accessibility: real labels on form fields, visible keyboard focus, alt text.
- Contact form uses Netlify Forms (`data-netlify="true"`, honeypot `company-website`).
  If you rename fields, Netlify picks them up on the next deploy.
- Old Squarespace URLs are redirected in `netlify.toml`. Keep those redirects.
