# visionspect.com

Marketing site for VisionSpect Solutions. Static HTML/CSS/JS, deployed by Netlify from
`main`. House rules for editing are in [CLAUDE.md](CLAUDE.md).

## Files

| Path | What it is |
| --- | --- |
| `index.html` | The landing page: hero with the inspection animation, services, vendor-neutral, process, about, contact form |
| `privacy.html` | Privacy page (form + analytics) |
| `thanks.html` | Shown after the contact form is sent (noindex) |
| `404.html` | Page-not-found, used automatically by Netlify |
| `assets/site.css` | All styles. Brand tokens at the top |
| `assets/site.js` | Mobile nav, UTM capture, Cloudflare analytics, hero animation |
| `assets/fonts/` | Montserrat (variable) and Lato, self-hosted, with their OFL licenses |
| `assets/img/` | Logo files and the social preview image |
| `netlify.toml` | Headers, deploy-skip rule, redirects from old Squarespace URLs |
| `robots.txt`, `sitemap.xml` | For search engines |
| `favicon.*`, `apple-touch-icon.png`, `icon-512.png` | Icons |

## Preview locally

```
python3 -m http.server 8000
```
then open http://localhost:8000. (The contact form only works on Netlify.)

## One-time setup

1. **Netlify**: Add new project → Import from GitHub → `visionspect/site`. Branch `main`,
   build command empty, publish directory `.`.
2. **Visibility**: Site configuration → Access & security → make sure visitor access is public.
3. **Forms**: Forms → Enable form detection. Then Form notifications → Email →
   nick@visionspect.com for the `contact` form. Send a real test after the first deploy.
4. **Analytics**: Cloudflare → Web Analytics → Add a site → visionspect.com → JS snippet.
   Paste the token into `CF_TOKEN` in `assets/site.js`.
5. **Domain**: follow the DNS cutover checklist (keep every Google Workspace email record).

## Tagging links

Add `?utm_source=...&utm_campaign=...` to links you share. The tag is saved with the
contact form submission. Example for the conference flyer:
`https://visionspect.com/?utm_source=flyer&utm_campaign=semc26`

## Adding photos

Put images in `assets/img/` (JPG or WebP, under ~300 KB, at least 1600px wide for full
width). Always set `width`, `height` and `alt`, and add `loading="lazy"` for anything below
the hero.
