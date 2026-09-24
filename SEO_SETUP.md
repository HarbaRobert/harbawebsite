# SEO setup

This covers the environment variables the technical SEO implementation added, and the manual,
account-level steps Rob needs to complete outside this codebase.

## 1. Required environment variables

Copy `.env.example` to `.env` for local use, or set these as deploy secrets / `fly.toml` `[env]`
entries in production. None are required for the site to work: every one has a safe default or
is simply omitted when unset.

| Variable | Used by | Effect when unset |
|---|---|---|
| `PUBLIC_SITE_URL` | Client bundle, prerendered pages (build time), Express `/robots.txt` and `/sitemap.xml` (request time) | Falls back to `https://harba.fly.dev` (see `config/siteConfig.mjs`) |
| `GOOGLE_SITE_VERIFICATION` | Prerendered `<head>` | No verification meta tag is rendered at all |
| `BING_SITE_VERIFICATION` | Prerendered `<head>` | No verification meta tag is rendered at all |
| `GA_MEASUREMENT_ID` | Client-side GA4 loader (`src/lib/ga.ts`) | GA4 never loads, regardless of consent |

**Important distinction:** `PUBLIC_SITE_URL` is baked into the prerendered HTML and the client
bundle **at build time** (via `vite.config.ts`'s `define`), so changing it for page canonicals
requires a rebuild and redeploy. The Express server reads it **live, at request time**, for
`/robots.txt` and `/sitemap.xml` only — changing it there just needs the running container's
environment variable updated (e.g. `fly secrets set` or editing `fly.toml`'s `[env]`) and a
restart, no rebuild required. See section 8 for exactly how to update it for a domain change.

To bake a different `PUBLIC_SITE_URL` (or the verification/GA values) into a Fly build, pass it
as a build argument: `fly deploy --build-arg PUBLIC_SITE_URL=https://harba.ai`. The `Dockerfile`
already declares these as build `ARG`s.

## 2. Verifying the site in Google Search Console

1. In [Google Search Console](https://search.google.com/search-console), add a property for the
   production URL (e.g. `https://harba.fly.dev` or the permanent domain once live).
2. Choose the "HTML tag" verification method. Google gives you a `content="..."` value.
3. Set `GOOGLE_SITE_VERIFICATION` to that value (as a build secret/arg) and redeploy. The
   prerender script renders `<meta name="google-site-verification" content="...">` on every
   page automatically once the variable is present — no code change needed.
4. Back in Search Console, click Verify.

## 3. Submitting the sitemap to Google

In Search Console, go to Sitemaps, and submit `sitemap.xml` (i.e. enter `sitemap.xml` under the
verified property — it resolves to `https://<your-domain>/sitemap.xml`). It's generated
dynamically by the Express server from `config/siteConfig.mjs`'s `PUBLIC_ROUTES`, so it always
reflects exactly the nine indexable public routes, nothing else.

## 4. Verifying the site in Bing Webmaster Tools

1. In [Bing Webmaster Tools](https://www.bing.com/webmasters), add the site.
2. Choose the "Meta tag" verification method, which gives you a value for `msvalidate.01`.
3. Set `BING_SITE_VERIFICATION` to that value and redeploy. The prerender script renders
   `<meta name="msvalidate.01" content="...">` automatically once present.
4. Alternatively, Bing Webmaster Tools supports importing directly from a verified Google
   Search Console property, which avoids this step entirely.

## 5. Submitting the sitemap to Bing

In Bing Webmaster Tools, go to Sitemaps and submit `https://<your-domain>/sitemap.xml` the same
way as Google.

## 6. Configuring the GA4 property and conversion

1. Create a GA4 property in [Google Analytics](https://analytics.google.com) and get its
   Measurement ID (looks like `G-XXXXXXXXXX`).
2. Set `GA_MEASUREMENT_ID` to that value and redeploy.
3. GA4 will **not** load until a visitor accepts analytics cookies via the banner
   (`src/components/CookieConsentBanner.tsx`) — see section 7 to test this.
4. Event names sent to GA4 (never with form field values or personal information, only the
   event name itself — see `src/lib/analytics.ts` and `src/lib/ga.ts`):
   - `page_view` — sent on every route change, once consent is granted.
   - `primary_cta_clicked`, `secondary_cta_clicked`, `navigation_cta_clicked` — forwarded
     as-is from the existing `harba:analytics` event bus.
   - `working_session_form_started` — forwarded as-is.
   - `working_session_form_submitted` — forwarded as-is, **and** also fires GA4's recommended
     `generate_lead` event, so mark `generate_lead` as a conversion in GA4 (Admin → Events →
     mark as conversion). This is the actual conversion trigger; no form contents are ever
     included.

## 7. Testing that consent prevents premature analytics loading

1. Set `GA_MEASUREMENT_ID` locally and run `npm run build && npm run server`.
2. Open the site in a private/incognito window and open DevTools → Network.
3. Confirm no request to `googletagmanager.com` fires on load, and the cookie banner is visible.
4. Click "Reject analytics" — confirm still no request fires, on this or any subsequent page.
5. Clear site data, reload, click "Accept analytics" — confirm a `gtag/js` request now fires,
   and check Application → Local Storage for `harba-cookie-consent: granted` (this is local
   storage, not a cookie — the site sets no cookies of its own).
6. The automated test in `tests/seo.test.ts` also asserts that no page's initial HTML ever
   references `googletagmanager.com`, regardless of configuration, since GA is only ever
   injected client-side after consent.

## 8. Updating the production hostname later

1. Decide the permanent domain (e.g. `https://harba.ai`).
2. Set `PUBLIC_SITE_URL` to that value for both the build (so canonicals, JSON-LD and the
   sitemap's URLs are correct) and the running container (so `/robots.txt` and `/sitemap.xml`
   also update; note the sitemap route list itself doesn't change, only the hostname it uses).
3. Rebuild and redeploy: `fly deploy --build-arg PUBLIC_SITE_URL=https://harba.ai`, and set the
   same value as a runtime env var (`fly secrets set PUBLIC_SITE_URL=https://harba.ai` or via
   `fly.toml`'s `[env]`).
4. Set up 301 redirects from the old domain if it stays reachable, and add the new domain as a
   new property in Search Console / Bing Webmaster Tools (verification is per-domain).
5. No other code changes are needed — every canonical, sitemap entry, robots.txt line and
   JSON-LD URL is derived from this one value.

## 9. Requesting re-indexing after launch

- **Google:** Search Console → URL Inspection → enter the URL → "Request indexing", for each of
  the nine public routes, or rely on the submitted sitemap for Google to recrawl on its own
  schedule.
- **Bing:** Webmaster Tools → URL Submission, similarly per-URL, or wait for the sitemap crawl.
- Re-run these whenever a title, description or substantial page content changes materially.

## Notes on how this is implemented

- **Local dev (`npm run dev`) and `vite preview` do not run the prerender step or the Express
  server**, so `/robots.txt` and `/sitemap.xml` won't resolve there (their static counterparts
  were removed from `public/` since they're now generated dynamically). Use `npm run build &&
  npm run server` to test the real, deployed behaviour locally — this is also what
  `tests/seo.test.ts` does.
- The prerender script (`scripts/prerender.mjs`) must be re-run (via `npm run build`, which
  already includes it) any time page content, titles or descriptions change — it reads the
  built `dist/.vite/manifest.json` and writes one `dist/<route>/index.html` per route.
