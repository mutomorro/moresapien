# Moresapien — Full SEO Audit

**Date:** 25 May 2026
**Auditor:** Claude (Sonnet 4.6) at user request
**Scope:** Full site — code, content, build output, redirects, sitemap, schema
**Method:** Static read of `src/` + `public/`, ran `npm run build`, inspected `dist/` HTML and `dist/sitemap-0.xml`
**Entries in scope:** 149 (the brief said ~98; the site has grown)
**Pages built:** 350 (incl. 174 tag pages; 88 of those are noindex'd singletons)
**No code changes were made.**

---

## 1. Executive summary

The site is in much better shape than the GSC noise suggests — the structural fundamentals (canonicals, OG tags, Twitter cards, https everywhere, trailing-slash discipline, valid sitemap with image extensions, fast static HTML, no client-side rendering for content) are all correct. The recovery from the May redirect-loop incident is genuine.

The **five highest-leverage issues**, in order:

1. **No 404 page exists, and the `_redirects` safety net is too aggressive.** There is no `src/pages/404.astro`, so `dist/404.html` is never built. Combined with ~30 catch-all rules that 301 unknown old WP URLs to `/`, Google sees a stream of soft-404s every time it tries a stale URL. This is almost certainly part of what GSC is grumbling about. **CRITICAL.**
2. **Zero BreadcrumbList schema anywhere on the site.** GSC has told you this. Entry pages, category pages, and collection pages all need it; collection and tag pages even render visual breadcrumbs already, so the markup is just missing the JSON-LD wrapper. **CRITICAL.**
3. **`<html lang="en">` everywhere, not `en-GB`.** Trivial to fix; the audit brief calls it out specifically, and you write in British English (and even surface a "British English" project rule). **IMPORTANT.**
4. **8 broken internal links and 4 broken `relatedConcepts` slugs in entry content** — every reference to `conformity-bias`, `dark-patterns`, and `attention-economy` resolves to a 404 (no such entries exist). This is dead-weight signal loss across 6+ entries. **CRITICAL.**
5. **`/connections/` has no `<h1>` and no server-rendered content** — `client:only="react"` means Googlebot sees an empty body. Soft 404 risk on a page that's linked from the homepage and footer. **IMPORTANT.**

Two systemic patterns worth calling out beyond the punch list:

- **Internal linking is patchy.** 24 entries are full orphans (no inbound link from any body or `relatedConcepts`); 31 are orphan in body content alone. The 4 entries with the highest inbound are `framing-effect` (68), `confirmation-bias` (65), `motivated-reasoning` (64), `social-proof` (54) — those concepts carry most of the link equity. Spreading inbound links to the long tail would lift the orphans into Google's index.
- **Stale Netlify-dashboard redirects.** `.netlify/netlify.toml` (pulled from the Netlify UI, `publishOrigin = "ui"`) still contains the redirect rules that almost certainly caused the May redirect loop (`/false-dilemma/ → /false-dilemma`, etc., 27 of them). They're `force = false` so they're inert as long as a static file exists at the URL, but if anyone toggles `force = true` or deletes an entry, the loop returns. Clear them out of the dashboard.

---

## 2. CRITICAL issues (fix immediately — could block or actively harm indexing)

### 2.1 No `404.astro` page → soft 404s on every catch-all redirect
- **What:** `src/pages/` contains no `404.astro`, so the build produces no `dist/404.html`. When a user (or Googlebot) hits an unknown URL, Netlify's default 404 page is returned (or, for paths matching a catch-all 301 in `public/_redirects`, the request gets 301'd to `/`). Google flags 301-to-homepage-for-unknown-URLs as soft 404s.
- **Where:** missing file `src/pages/404.astro`; aggravated by `public/_redirects` lines 60–87 (the WordPress-era safety net that 301s 27 dead slugs to `/`).
- **Fix:** Add `src/pages/404.astro` that returns a proper 404 (Astro's static 404 sets the right status on Netlify when configured). Then change the WP catch-all rules to either point to a relevant browse/category page where possible, or remove them and let the 404 page handle it. Don't 301-to-home for content URLs.
- **Affects:** every page type indirectly — Google's "soft 404" verdict drags on the whole property.

### 2.2 BreadcrumbList schema is missing site-wide
- **What:** GSC confirmed it. No JSON-LD `BreadcrumbList` exists on any page type. Visual breadcrumbs are already rendered on `/tag/[tag]/` ([src/pages/tag/[tag].astro:84-88](src/pages/tag/[tag].astro:84)) and `/collections/[slug]/` ([src/pages/collections/[slug].astro:94-96](src/pages/collections/[slug].astro:94)), but the markup isn't backed by schema.
- **Where:** entry pages ([src/pages/[slug].astro:128](src/pages/[slug].astro:128) — `DefinedTerm` is there, no breadcrumb), category pages ([src/pages/browse/[category].astro:41](src/pages/browse/[category].astro:41)), tag pages ([src/pages/tag/[tag].astro:54](src/pages/tag/[tag].astro:54)), collection pages ([src/pages/collections/[slug].astro](src/pages/collections/[slug].astro) — no JSON-LD at all).
- **Fix per template:**
  - Entry: `Home › Browse › {Category} › {Title}`
  - Category: `Home › Browse › {Category}`
  - Tag: `Home › Browse › #{tag}` (already shown visually)
  - Collection index: `Home › Collections`
  - Collection: `Home › Collections › {Collection title}` (already shown visually)
- **Affects:** every page except the homepage.

### 2.3 Broken internal links to non-existent slugs
- **What:** 8 markdown body links and 4 `relatedConcepts` slugs point to entries that don't exist.
- **Bodies (markdown `]( /slug/ )` references):**
  - `/conformity-bias/` referenced by: `appeal-to-tradition.md`, `astroturfing.md`, `no-true-scotsman.md`, `obedience-to-authority.md`, `spiral-of-silence.md`, `spotlight-effect.md`
  - `/dark-patterns/` referenced by: `status-quo-bias.md`
  - `/attention-economy/` referenced by: `weaponised-hopelessness.md` (the canonical slug is `the-attention-economy`)
- **`relatedConcepts` (frontmatter, target slug doesn't match any file):**
  - `conformity-bias`: `groupthink.md`, `obedience-to-authority.md`, `spiral-of-silence.md`
  - `attention-economy`: `weaponised-hopelessness.md`
- **Fix:** either remove the references, point them at the canonical slug (`the-attention-economy`), or write the missing entries (`conformity-bias` and `dark-patterns` are both worth having).
- **Affects:** 9 entries directly.

### 2.4 27 entries are shipping without an OG image
- **What:** 149 entries in `src/content/entries/`, but only 122 corresponding `*.png` files in `public/og/` are tracked in git. The Satori-based `scripts/generate-og-images.mjs` is set to write one PNG per entry on `prebuild`, and Netlify runs the full build on deploy, so production *should* be self-healing — but until the next deploy fires, the live site is referencing `og:image` URLs that 404 for share previews on these entries.
- **Entries missing OG (live site likely affected):** `appeal-to-common-sense, appeal-to-tradition, astroturfing, chestertons-fence, competitive-victimhood, curse-of-knowledge, decision-fatigue, displacement, divide-and-conquer, fog-fear-obligation-guilt, groupthink, loaded-question, love-bombing, network-effects, no-true-scotsman, obedience-to-authority, optimism-bias, reactance, reaction-formation, regulatory-capture, repetition-as-persuasion, spiral-of-silence, spotlight-effect, steel-manning, streisand-effect, tipping-points, weaponised-hopelessness` (27 total).
- **Fix:** redeploy (which will run `prebuild` → generate-og-images and ship them). Then verify via `curl -I https://moresapien.org/og/astroturfing.png` on each. Also delete the 27 stale OG PNGs in the repo for entries that no longer exist (see §4.5).
- **Affects:** social share previews for 27 entries.

### 2.5 Stale Netlify-dashboard redirects (the likely original cause of the May loop)
- **What:** `.netlify/netlify.toml` (synced from the Netlify dashboard, `publishOrigin = "ui"`) still contains 27 redirect rules like `/false-dilemma/ → /false-dilemma` (trailing slash stripped). Astro's `trailingSlash: 'always'` plus Netlify's "Pretty URLs" feature mean these rules can produce loops if `force = true` is ever flipped on, or if a build artefact ever stops being present at the path. They currently sit at `force = false`, so they're inert against pages that exist — but they are landmines.
- **Where:** Netlify dashboard for the site (not committed to repo, but reflected in `.netlify/netlify.toml`).
- **Fix:** delete every entry-slug-stripping rule from the Netlify UI. Keep redirects in version control under `public/_redirects` only — single source of truth.
- **Affects:** site-wide stability.

---

## 3. IMPORTANT issues (fix this week — strengthens signals)

### 3.1 `<html lang="en">` should be `<html lang="en-GB">`
- **Where:** [src/layouts/BaseLayout.astro:37](src/layouts/BaseLayout.astro:37) — `<html lang="en" style={htmlStyle}>`.
- **Fix:** change `"en"` to `"en-GB"`. Brief notes the site is "British English" throughout, and this is a one-line fix that improves locale signals to search engines and screen readers.
- **Affects:** every page.

### 3.2 `/connections/` has no `<h1>` and no SSR content
- **What:** `dist/connections/index.html` contains the nav, PostHog snippet, an empty `.graph-container` div, and the footer. No `<main>`, no `<h1>`. The graph is `client:only="react"` ([src/pages/connections.astro:15](src/pages/connections.astro:15)) so nothing is server-rendered.
- **Fix:** wrap the graph in `<main id="main">` and add a visually-deprioritised but real `<h1>` (e.g. `<h1 class="visually-hidden">Connections — the Moresapien knowledge graph</h1>`) plus a paragraph of crawler-visible descriptive text (could match the existing meta description). The graph stays interactive; crawlers get something to chew on.
- **Affects:** `/connections/` page indexing.

### 3.3 No JSON-LD on collection pages, about, contact, connections
- **What:** entry pages get `DefinedTerm`, category and tag pages get `CollectionPage`, the homepage gets `WebSite`. But collection pages, `/about/`, `/contact/`, and `/connections/` get nothing.
- **Fix:**
  - `/collections/[slug]/` ([src/pages/collections/[slug].astro](src/pages/collections/[slug].astro)) — add `CollectionPage` (or `Article` if you treat the editorial intro as the main content). Reference each linked entry as `hasPart`/`mainEntity` so Google sees the curation graph.
  - `/collections/` ([src/pages/collections/index.astro](src/pages/collections/index.astro)) — `CollectionPage` listing the curated collections.
  - `/about/` — `AboutPage` with `mainEntity` pointing at the `Organization`.
  - `/contact/` — `ContactPage`.
  - `/connections/` — `WebPage` (along with the SSR fix from §3.2).
- **Affects:** 14 pages (1 about + 1 contact + 1 connections + 1 collections index + 11 collection pages).

### 3.4 Homepage `WebSite` schema is missing `SearchAction` (sitelinks search box)
- **Where:** [src/pages/index.astro:37-49](src/pages/index.astro:37) — `WebSite` is present but has no `potentialAction`. You ship a full client-side search at `dist/search.json`, so this is wasted potential.
- **Fix:** add to the JSON-LD:
  ```json
  "potentialAction": {
    "@type": "SearchAction",
    "target": { "@type": "EntryPoint", "urlTemplate": "https://moresapien.org/?q={search_term_string}" },
    "query-input": "required name=search_term_string"
  }
  ```
  Then make `/?q=…` actually open the search panel via a `URLSearchParams` read on page load. (The mechanic must work for the SearchAction to qualify in Google's eyes.)
- **Affects:** homepage SERP appearance.

### 3.5 Stale OG images in `public/og/` for entries that don't exist
- **What:** 27 PNG files in `public/og/` correspond to entries deleted in the WordPress migration: `anthropocentrism, apophenia, arrival-fallacy, attentional-bias, base-rate-fallacy, bizarreness-effect, clustering-illusion, common-source-bias, complexity-bias, conservative-bias, context-effect, cue-dependent-forgetting, frequency-illusion, functional-fixedness, hot-cold-empathy-gap, humour-effect, illusory-correlation, implicit-association, law-of-the-instrument, mood-congruent-memory-bias, omission-bias, pareidolia, picture-superiority-effect, salience-bias, self-reference-effect, von-restorff-effect`. Plus a redundant `homepage.png` that duplicates `home.png` (kept as a "legacy filename" per [scripts/generate-og-images.mjs:36](scripts/generate-og-images.mjs:36) — and [src/pages/index.astro](src/pages/index.astro) now uses `home.png`, so `homepage.png` can go).
- **Fix:** `git rm public/og/{listed}.png public/og/homepage.png` and remove the legacy-filename write from the generator.
- **Affects:** repo hygiene only; not a live SEO issue.

### 3.6 Duplicate internal links on the same page (minor)
- **What:** 27 entries link to the same target entry more than once in their body. Not strictly wrong, but it splits anchor-text signal and reads as redundant. Worst offenders:
  - `normalisation.md`: duplicates 4 targets (`illusory-truth-effect`, `social-proof`, `framing-effect`, `cultural-hegemony`)
  - `tone-policing.md`: duplicates 3 (`red-herring`, `concern-trolling`, `ad-hominem`)
  - Full list in the table below (column "dup" if non-empty).
- **Fix:** keep the first natural mention as the link, plain-text the rest.
- **Affects:** 27 entries.

### 3.7 Two `oneLiner`s exceed 160 chars (truncates as meta description)
- `symbolic-racism.md`: 177 chars
- `the-attention-economy.md`: 162 chars
- **Fix:** trim each to ≤160. They're rendered into `<meta name="description">` indirectly via the pageDescription template ([src/pages/[slug].astro:98](src/pages/[slug].astro:98)) — that line concatenates `title + ': ' + oneLiner + ' Learn about this ' + category.toLowerCase() + …'`, so the resulting description is already 200+ chars for normal entries (see §3.9).
- **Affects:** 2 entries directly, but see §3.9.

### 3.8 Three entries are missing `whyItMattersNow`
- `cognitive-dissonance.md`
- `dunning-kruger-effect.md`
- `sunk-cost-fallacy.md`
- **Fix:** write them. These are three of the most-linked-to concepts on the site (50, 13, 19 inbound links respectively), so they deserve the section. The schema currently marks the field optional ([src/content.config.ts:64](src/content.config.ts:64) — `whyItMattersNow: z.string().optional()`); the brief treats it as required.

### 3.9 Meta-description template produces 200+ char descriptions on every entry
- **What:** [src/pages/[slug].astro:98](src/pages/[slug].astro:98) constructs:
  ```
  pageDescription = title + ': ' + oneLiner + ' Learn about this ' + category.toLowerCase() + ' and how it affects your thinking.'
  ```
  For a typical entry like `confirmation-bias` the result is 199 characters. Google truncates around 155–160 in search results. The "Learn about this cognitive bias and how it affects your thinking" boilerplate gets eaten on every entry.
- **Fix:** either (a) just use `oneLiner` (already kept ≤160 by editorial), or (b) build a smarter template that fits the limit. Option (a) is one line of code.
- **Affects:** 149 entries.

### 3.10 Two entries below the 1,200-word target
- `straw-man.md`: 1,114 words
- `effort-justification.md`: 1,139 words
- **Fix:** expand. `straw-man` is high-traffic (15 inbound links, regularly used as a destination from the homepage's featured grid).

### 3.11 21 entries have zero external links in their body
Target is 1–3 per entry. Entries: `appeal-to-common-sense, astroturfing, ben-franklin-effect, competitive-victimhood, displacement, effort-justification, false-consensus-effect, fog-fear-obligation-guilt, groupthink, loaded-question, love-bombing, moral-hypocrisy-judgement, network-effects, no-true-scotsman, reactance, reaction-formation, relative-deprivation, spiral-of-silence, steel-manning, weaponised-hopelessness, zero-sum-thinking`. Adding a Wikipedia and/or primary-research link to each strengthens E-E-A-T signals.

### 3.12 24 entries are full orphans (zero inbound from any source)
None of the existing entries link to them in body content *or* via `relatedConcepts`:
`alienation, appeal-to-common-sense, appeal-to-tradition, astroturfing, chestertons-fence, competitive-victimhood, curse-of-knowledge, decision-fatigue, displacement, false-consensus-effect, loaded-question, moral-hypocrisy-judgement, moral-panic, no-true-scotsman, reaction-formation, regulatory-capture, repetition-as-persuasion, spiral-of-silence, spotlight-effect, state-of-nature-assumption, the-culture-industry, weaponised-hopelessness, weasel-words, woozle-effect`.
- **Fix:** add each as a `relatedConcepts` target on 2–3 thematically near entries, then mention each in at least one body paragraph somewhere. Several of these (e.g. `moral-panic`, `chestertons-fence`, `weasel-words`) are concepts you reach for editorially; surface them in the entries that should obviously be linking to them.

### 3.13 Render-blocking external font CSS in `<head>`
- **Where:** [src/layouts/BaseLayout.astro:67-74](src/layouts/BaseLayout.astro:67) — two synchronous `<link rel="stylesheet">` to `fonts.googleapis.com` and `api.fontshare.com`.
- **Why it matters:** these block first paint until the font CSS is fetched and parsed. You already preconnect, which helps, but `font-display: swap` (default in the Google Fonts CSS) means text *will* render with fallbacks — fine for perceived perf, but the `<link>` itself is still render-blocking.
- **Fix:** either self-host (you already have the `@fontsource` packages installed and used by the OG generator), or switch to the `preload` + `onload` swap pattern for Google Fonts. Self-hosting also removes a third-party DNS dependency, which is a tiny privacy win consistent with the site's "no tracking" stance.

---

## 4. NICE-TO-HAVE (fix when convenient)

### 4.1 Entry meta-description trailing punctuation
The template in [src/pages/[slug].astro:98](src/pages/[slug].astro:98) ends with a full stop only if the `oneLiner` already had one. Several `oneLiner`s end without punctuation, producing meta descriptions like "… how we think. Learn about this cognitive bias and how it affects your thinking." — fine, but inconsistent. Tied to the §3.9 fix.

### 4.2 PostHog inline script in `<head>` is large
The snippet at [src/layouts/BaseLayout.astro:77-83](src/layouts/BaseLayout.astro:77) is ~3KB minified inline. Not render-blocking (no `src=`), but inflates every HTML response. Acceptable for the tracker-bypass proxy use case; consider moving to a deferred external script if you can.

### 4.3 `<meta name="theme-color">` is missing
Won't move SEO needles, but improves Android/Chrome address-bar tinting and is a small polish win.

### 4.4 86 noindex'd tag pages still build and ship
Tag pages with ≤1 entry are noindex'd ([src/pages/tag/[tag].astro:72](src/pages/tag/[tag].astro:72)) and excluded from sitemap (good, see [astro.config.mjs:36](astro.config.mjs:36)). But they still build and get crawled before Googlebot reads `<meta robots>`. Consider not generating the page at all (skip in `getStaticPaths`) — or, equivalently, hide the tag link in `displayTags` in [src/pages/[slug].astro:58](src/pages/[slug].astro:58) when count==1.

### 4.5 Repo cruft (also referenced in §3.5)
- `public/og/homepage.png` — duplicate of `home.png`; the comment in [scripts/generate-og-images.mjs:36](scripts/generate-og-images.mjs:36) says "Legacy filename used by index.astro until that meta tag is updated" — but [src/pages/index.astro:56](src/pages/index.astro:56) already uses `home.png`. Safe to remove.
- `handoff/` directory and `package-lock.json` look fine but the `handoff/` dir is in `.gitignore` (good).

### 4.6 `<a class="ms-card-title">` uses `<h2>` inside `<a>`
[src/components/ConceptCard.astro:26](src/components/ConceptCard.astro:26) wraps the card link around an `<h2>`. Valid HTML5 (block content inside `<a>` is allowed), but several screen-reader analysers warn about wrapping headings in anchors. Consider a `<span>` styled as a heading instead. (Low-confidence; some teams disagree on this — leave it if the visual reads better.)

### 4.7 External body links don't open in new tabs
Astro renders markdown body links as plain `<a href="…">` without `target="_blank"` or `rel`. For SEO this is neutral; for UX, opening external references in new tabs is generally preferred. The Further Reading footer already does this with `rel="noopener noreferrer"` ([src/pages/[slug].astro:249](src/pages/[slug].astro:249)).

### 4.8 Stale `_redirects` safety net
`public/_redirects` lines 60–87 send 27 dead WP slugs to `/`. They're 301s, but to the homepage — Google reads these as soft 404s. Either (a) point each to the most relevant `/browse/{category}/` page (e.g. `salience-bias` → `/browse/cognitive-bias/`), or (b) delete them and let the §2.1 404 page handle it. Option (b) is cleaner and is the right move once 2.1 lands. If `wp-content/*`, `wp-admin/*`, etc. were chosen to dampen exploit-scanner noise rather than for SEO, they should be 410 Gone, not 301 to home. Netlify supports `410` as a status code in `_redirects`.

### 4.9 Sitemap doesn't list collection pages with `priority`/`changefreq`
Astro's sitemap integration writes a bare urlset (only `<loc>` and `<lastmod>`). That's fine — Google publicly says these fields are ignored. No action needed.

### 4.10 No `Article` schema for collection pages
Currently no JSON-LD at all on collections; once §3.3 is fixed, consider `Article` rather than `CollectionPage` for the editorial collection pages, since they have substantial body content (an editorial intro plus stage commentary).

### 4.11 Cookie banner / privacy text
`/contact/` mentions Formspree but the site has no `/privacy/` or `/terms/` route. `/privacy-policy/` and `/cookie-policy/` are both 301'd to `/` in `_redirects` — but the footer's "No tracking" claim is technically inconsistent with the PostHog snippet (even though it's anonymised and self-proxied). Not a search-engine issue; could be a trust signal one. Worth a paragraph somewhere.

---

## 5. Content audit table

All 149 entries. Columns: `wc` = body word count; `tags` = tag count; `rel` = `relatedConcepts` count; `fr` = `furtherReading` count; `int` = unique internal links in body; `ext` = external links in body; `in` = inbound links (body + relatedConcepts) from other entries; `missing` = absent required frontmatter fields (per brief's list).

| slug | wc | tags | rel | fr | int | ext | in | missing |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| ad-hominem | 1283 | 7 | 5 | 1 | 5 | 2 | 12 | — |
| affect-heuristic | 1371 | 6 | 5 | 0 | 8 | 2 | 5 | — |
| alienation | 1659 | 8 | 5 | 0 | 7 | 1 | 0 | — |
| anchoring-bias | 1519 | 6 | 5 | 0 | 8 | 1 | 20 | — |
| appeal-to-common-sense | 1365 | 6 | 5 | 0 | 7 | 0 | 0 | — |
| appeal-to-emotion | 1515 | 7 | 5 | 0 | 11 | 1 | 22 | — |
| appeal-to-false-authority | 1682 | 6 | 5 | 0 | 8 | 1 | 7 | — |
| appeal-to-nature | 1664 | 6 | 5 | 0 | 8 | 3 | 1 | — |
| appeal-to-tradition | 1309 | 6 | 5 | 0 | 5 | 1 | 0 | broken `/conformity-bias` link |
| astroturfing | 1268 | 6 | 5 | 0 | 8 | 0 | 0 | broken `/conformity-bias` link |
| authority-bias | 1275 | 7 | 6 | 2 | 6 | 1 | 4 | — |
| availability-heuristic | 1347 | 7 | 5 | 0 | 8 | 1 | 46 | — |
| aversive-racism | 1573 | 6 | 5 | 0 | 7 | 3 | 2 | — |
| backfire-effect | 1610 | 6 | 5 | 0 | 6 | 1 | 7 | — |
| bandwagon-effect | 1457 | 7 | 5 | 0 | 8 | 1 | 29 | — |
| ben-franklin-effect | 1204 | 7 | 6 | 2 | 4 | 0 | 1 | — |
| betrayal-aversion | 1540 | 6 | 5 | 0 | 6 | 2 | 1 | — |
| blind-spot-bias | 1384 | 6 | 5 | 0 | 8 | 2 | 1 | dup link |
| bread-and-circuses | 1509 | 8 | 5 | 0 | 7 | 1 | 1 | — |
| burden-of-proof | 1842 | 6 | 5 | 0 | 5 | 2 | 6 | — |
| bystander-effect | 1369 | 6 | 5 | 0 | 5 | 2 | 6 | — |
| capitalist-realism | 1542 | 7 | 6 | 1 | 8 | 3 | 12 | — |
| chestertons-fence | 1478 | 6 | 5 | 0 | 5 | 1 | 0 | dup link |
| circle-of-competence | 1783 | 6 | 5 | 0 | 11 | 1 | 3 | — |
| circular-reasoning | 1516 | 6 | 5 | 0 | 8 | 1 | 1 | — |
| cognitive-dissonance | 1221 | 6 | 4 | 1 | 6 | 2 | 50 | **whyItMattersNow** |
| collective-amnesia | 1502 | 8 | 5 | 0 | 5 | 1 | 2 | — |
| commodification | 1617 | 7 | 6 | 1 | 5 | 3 | 10 | dup link |
| compartmentalisation | 1447 | 6 | 5 | 0 | 9 | 1 | 5 | — |
| compassion-fatigue | 1344 | 6 | 5 | 0 | 5 | 2 | 4 | — |
| competitive-victimhood | 1373 | 7 | 5 | 0 | 5 | 0 | 0 | — |
| conceptual-gentrification | 2008 | 7 | 6 | 1 | 4 | 4 | 3 | dup link |
| concern-trolling | 1543 | 6 | 5 | 0 | 8 | 1 | 6 | — |
| confirmation-bias | 1229 | 7 | 5 | 0 | 6 | 3 | 65 | — |
| contrast-effect | 1588 | 6 | 5 | 0 | 5 | 2 | 1 | — |
| cultural-defaults | 1616 | 7 | 5 | 0 | 7 | 1 | 2 | dup link |
| cultural-hegemony | 1905 | 8 | 6 | 1 | 9 | 2 | 12 | dup link |
| curse-of-knowledge | 1605 | 6 | 5 | 0 | 5 | 1 | 0 | dup link |
| darvo | 1576 | 6 | 5 | 0 | 8 | 2 | 5 | dup link |
| decision-fatigue | 1260 | 6 | 5 | 0 | 5 | 1 | 0 | — |
| denial | 1358 | 6 | 5 | 0 | 7 | 2 | 9 | — |
| diffusion-of-responsibility | 1393 | 6 | 5 | 0 | 5 | 1 | 3 | — |
| displacement | 1273 | 6 | 5 | 0 | 5 | 0 | 0 | — |
| divide-and-conquer | 1440 | 6 | 5 | 0 | 5 | 1 | 1 | — |
| dog-whistling | 1748 | 6 | 5 | 0 | 7 | 1 | 4 | — |
| dunning-kruger-effect | 1220 | 6 | 4 | 1 | 6 | 2 | 13 | **whyItMattersNow** |
| effort-justification | 1139 | 6 | 5 | 1 | 4 | 0 | 1 | **under 1,200 words** |
| emergence | 1738 | 6 | 5 | 0 | 7 | 2 | 6 | — |
| euphemism | 1451 | 6 | 5 | 0 | 7 | 3 | 3 | — |
| expectancy-violation | 1658 | 6 | 5 | 0 | 7 | 1 | 1 | dup link |
| false-balance | 1483 | 6 | 5 | 0 | 7 | 2 | 5 | — |
| false-consciousness | 1732 | 8 | 5 | 0 | 7 | 1 | 1 | — |
| false-consensus-effect | 1215 | 7 | 6 | 2 | 4 | 0 | 0 | — |
| false-dilemma | 1649 | 6 | 5 | 0 | 9 | 1 | 10 | — |
| false-equivalence | 1239 | 7 | 5 | 0 | 9 | 1 | 12 | — |
| feedback-loops | 1691 | 6 | 5 | 0 | 7 | 2 | 23 | — |
| firehose-of-falsehood | 1600 | 6 | 5 | 0 | 10 | 1 | 8 | — |
| first-principles-thinking | 1557 | 6 | 5 | 0 | 9 | 2 | 19 | — |
| fog-fear-obligation-guilt | 1389 | 6 | 5 | 0 | 6 | 0 | 1 | — |
| framing-effect | 1264 | 7 | 5 | 0 | 9 | 2 | 68 | dup link |
| fundamental-attribution-error | 1488 | 6 | 5 | 0 | 5 | 2 | 24 | — |
| gaslighting | 1336 | 7 | 5 | 0 | 9 | 2 | 20 | — |
| gish-gallop | 1785 | 6 | 5 | 0 | 6 | 1 | 3 | dup link |
| groupthink | 1279 | 6 | 5 | 0 | 9 | 0 | 6 | broken `conformity-bias` related |
| halo-effect | 1395 | 7 | 5 | 0 | 7 | 1 | 23 | — |
| hanlons-razor | 1505 | 6 | 5 | 0 | 7 | 1 | 1 | — |
| hasty-generalisation | 1811 | 6 | 5 | 0 | 7 | 2 | 5 | — |
| hindsight-bias | 1608 | 6 | 5 | 0 | 5 | 1 | 2 | — |
| illusory-truth-effect | 1507 | 6 | 5 | 0 | 5 | 2 | 14 | — |
| in-group-out-group-bias | 1641 | 6 | 5 | 0 | 6 | 2 | 12 | — |
| independent-evaluation | 1749 | 6 | 5 | 0 | 10 | 2 | 10 | — |
| inversion | 1703 | 6 | 5 | 0 | 9 | 3 | 7 | — |
| just-world-fallacy | 1678 | 6 | 5 | 0 | 7 | 1 | 6 | — |
| learned-helplessness | 1414 | 6 | 5 | 0 | 6 | 1 | 4 | — |
| loaded-language | 1600 | 6 | 5 | 0 | 8 | 2 | 10 | — |
| loaded-question | 1306 | 6 | 5 | 0 | 6 | 0 | 0 | — |
| loss-aversion | 1480 | 7 | 5 | 0 | 8 | 1 | 21 | — |
| love-bombing | 1244 | 6 | 5 | 0 | 4 | 0 | 1 | — |
| lump-of-labour-fallacy | 1360 | 6 | 5 | 0 | 4 | 2 | 1 | — |
| manufactured-consent | 1705 | 7 | 5 | 0 | 5 | 1 | 23 | — |
| manufacturing-desire | 1415 | 7 | 5 | 0 | 6 | 2 | 2 | — |
| map-is-not-the-territory | 1713 | 6 | 5 | 0 | 7 | 2 | 5 | — |
| mere-exposure-effect | 1450 | 7 | 5 | 0 | 5 | 1 | 4 | — |
| microaggressions | 1612 | 7 | 5 | 0 | 8 | 4 | 2 | — |
| moral-hypocrisy | 1702 | 7 | 5 | 0 | 11 | 1 | 2 | — |
| moral-hypocrisy-judgement | 1308 | 7 | 6 | 2 | 4 | 0 | 0 | — |
| moral-licensing | 1697 | 6 | 5 | 0 | 5 | 1 | 9 | — |
| moral-panic | 1753 | 7 | 5 | 0 | 8 | 2 | 0 | — |
| motivated-reasoning | 1354 | 7 | 5 | 0 | 10 | 1 | 64 | dup link |
| motte-and-bailey | 1663 | 6 | 5 | 0 | 6 | 1 | 2 | — |
| moving-the-goalposts | 1711 | 6 | 5 | 0 | 6 | 1 | 5 | — |
| naive-realism | 1663 | 6 | 5 | 0 | 6 | 2 | 20 | — |
| negativity-bias | 1592 | 6 | 5 | 0 | 6 | 2 | 2 | — |
| network-effects | 1304 | 6 | 5 | 0 | 7 | 0 | 1 | — |
| no-true-scotsman | 1337 | 6 | 5 | 0 | 7 | 0 | 0 | broken `/conformity-bias` link |
| normalcy-bias | 1685 | 6 | 5 | 0 | 7 | 1 | 9 | — |
| normalisation | 1893 | 7 | 6 | 1 | 7 | 2 | 10 | dup links (4) |
| obedience-to-authority | 1400 | 6 | 5 | 0 | 6 | 1 | 2 | broken `/conformity-bias` link + related |
| occams-razor | 1659 | 6 | 5 | 0 | 6 | 3 | 4 | — |
| opportunity-cost | 1991 | 6 | 5 | 0 | 9 | 1 | 3 | — |
| optimism-bias | 1351 | 6 | 5 | 0 | 6 | 2 | 1 | — |
| overton-window | 1551 | 6 | 5 | 0 | 7 | 1 | 12 | — |
| paradox-of-tolerance | 1714 | 6 | 5 | 0 | 6 | 1 | 1 | — |
| pluralistic-ignorance | 1513 | 6 | 5 | 0 | 6 | 1 | 13 | — |
| post-hoc | 1681 | 6 | 5 | 0 | 5 | 3 | 1 | — |
| probabilistic-thinking | 1742 | 6 | 5 | 0 | 9 | 3 | 13 | — |
| psychological-projection | 1538 | 6 | 5 | 0 | 9 | 1 | 6 | — |
| rationalisation | 1548 | 6 | 5 | 0 | 10 | 1 | 12 | — |
| reactance | 1328 | 6 | 5 | 0 | 9 | 0 | 2 | — |
| reaction-formation | 1555 | 6 | 5 | 0 | 5 | 0 | 0 | — |
| recuperation | 1595 | 7 | 6 | 1 | 7 | 4 | 2 | dup link |
| red-herring | 1484 | 7 | 5 | 0 | 9 | 1 | 13 | — |
| regulatory-capture | 1521 | 6 | 5 | 0 | 5 | 1 | 0 | dup link |
| reification | 1669 | 8 | 5 | 0 | 5 | 1 | 1 | — |
| relative-deprivation | 1243 | 7 | 6 | 2 | 6 | 0 | 1 | — |
| repetition-as-persuasion | 1352 | 6 | 5 | 0 | 7 | 1 | 0 | — |
| scapegoating | 1575 | 6 | 5 | 0 | 10 | 2 | 9 | — |
| sealioning | 1759 | 6 | 5 | 0 | 6 | 1 | 4 | dup links (2) |
| second-order-thinking | 1777 | 6 | 5 | 0 | 9 | 2 | 17 | — |
| self-serving-bias | 1497 | 6 | 5 | 0 | 6 | 1 | 3 | dup link |
| slippery-slope | 1433 | 6 | 5 | 0 | 8 | 1 | 3 | — |
| social-proof | 1545 | 7 | 5 | 0 | 7 | 1 | 54 | dup link |
| source-laundering | 1841 | 6 | 5 | 0 | 5 | 1 | 1 | dup links (2) |
| spiral-of-silence | 1375 | 6 | 5 | 0 | 5 | 0 | 0 | broken `/conformity-bias` link + related |
| spotlight-effect | 1385 | 6 | 5 | 0 | 5 | 1 | 0 | broken `/conformity-bias` link |
| state-of-nature-assumption | 1224 | 7 | 6 | 2 | 6 | 1 | 0 | — |
| status-quo-bias | 1424 | 6 | 5 | 0 | 6 | 1 | 7 | broken `/dark-patterns` link |
| steel-manning | 1428 | 6 | 5 | 0 | 10 | 0 | 1 | dup link |
| straw-man | 1114 | 7 | 5 | 1 | 8 | 2 | 15 | **under 1,200 words**, dup link |
| streisand-effect | 1254 | 6 | 5 | 0 | 6 | 1 | 1 | — |
| structural-violence | 1637 | 8 | 5 | 0 | 6 | 1 | 1 | — |
| sunk-cost-fallacy | 1267 | 5 | 4 | 1 | 7 | 3 | 19 | **whyItMattersNow** |
| survivorship-bias | 1432 | 7 | 5 | 0 | 7 | 1 | 9 | — |
| symbolic-racism | 1733 | 6 | 5 | 0 | 7 | 1 | 1 | **oneLiner >160 chars** |
| the-attention-economy | 1600 | 7 | 6 | 1 | 6 | 1 | 5 | **oneLiner >160 chars**, dup links |
| the-culture-industry | 1493 | 8 | 5 | 0 | 6 | 1 | 0 | — |
| the-meritocracy-myth | 1825 | 8 | 5 | 0 | 8 | 1 | 1 | dup link |
| the-spectacle | 1533 | 7 | 5 | 0 | 6 | 1 | 1 | — |
| thought-terminating-cliche | 1660 | 6 | 5 | 0 | 9 | 1 | 9 | — |
| tipping-points | 1368 | 6 | 5 | 0 | 6 | 1 | 1 | — |
| tone-policing | 1867 | 6 | 5 | 0 | 6 | 1 | 9 | dup links (3) |
| tragedy-of-the-commons | 1589 | 6 | 5 | 0 | 5 | 3 | 6 | — |
| unintended-consequences | 1665 | 6 | 5 | 0 | 8 | 2 | 7 | — |
| victim-perpetrator-cycle | 1618 | 8 | 5 | 0 | 5 | 2 | 1 | — |
| weaponised-hopelessness | 1284 | 6 | 6 | 0 | 5 | 0 | 0 | broken `/attention-economy` link + related |
| weasel-words | 1534 | 6 | 5 | 0 | 9 | 1 | 0 | — |
| whataboutism | 1507 | 7 | 5 | 0 | 8 | 1 | 9 | — |
| woozle-effect | 1628 | 6 | 5 | 0 | 5 | 2 | 0 | — |
| zero-sum-thinking | 1283 | 7 | 6 | 2 | 6 | 0 | 1 | dup link |

**Aggregate stats:**
- 149 entries audited
- Mean word count: ~1,544; median ~1,533; min 1,114 (`straw-man`); max 2,008 (`conceptual-gentrification`)
- Entries under 1,200 words: 2 (target: 0)
- Entries missing `whyItMattersNow`: 3
- Entries with broken internal links: 9
- Entries with broken `relatedConcepts` slugs: 4
- Entries with duplicate internal links: 27
- Orphan entries (zero inbound from any source): 24
- Entries with zero external links: 21

---

## 6. Clean bill of health (things already done well)

A non-exhaustive list of correct decisions, for context and reassurance:

### Build / infrastructure
- Astro 5 config is correct: `trailingSlash: 'always'`, `format: 'directory'`, correct `site` URL (`https://moresapien.org`).
- `@astrojs/sitemap` is configured and `serialize` adds `lastmod` per URL.
- The custom `filter` in [astro.config.mjs:42-46](astro.config.mjs:42) correctly excludes single-entry tag pages from the sitemap — clever and sound.
- Postbuild script `enrich-sitemap.mjs` adds `image:image` blocks to entry URLs in the sitemap → 151 images surfaced to Google Image Search.
- Sitemap-index → `sitemap-0.xml` structure is valid; all 264 URLs use HTTPS and trailing slashes.
- `robots.txt` allows all, references the sitemap correctly.
- HTML is statically rendered for every content page — Googlebot doesn't need JS to read entries, categories, or tags.

### Meta tags (per page)
- `<title>` is unique per page, suffixed with "- Moresapien", and under 60 chars for entries.
- `<link rel="canonical">` present on every page; uses trailing slash; absolute `https://moresapien.org/` URL.
- OG `og:type` correctly switches between `website` (default) and `article` (entries, collections).
- OG `og:title`/`og:description`/`og:image`/`og:url`/`og:site_name` all present.
- Twitter card uses `summary_large_image` with title/description/image.
- `<meta charset="utf-8">` and viewport are present in every HTML response.
- `noIndex` mechanism is wired up correctly (tag pages with ≤1 entry).
- Single `<h1>` on every page that has one (homepage, entries, browse, categories, tags, collections, about, contact). Only `/connections/` lacks an `<h1>` (§3.2).

### Structured data (where present)
- `WebSite` schema on homepage with `Organization` publisher.
- `DefinedTerm` schema on entry pages, with `inDefinedTermSet`, `mainEntityOfPage`, `publisher`, and `image` (one or two `ImageObject` entries depending on diagrams).
- `CollectionPage` schema on category and tag pages, with `isPartOf` back to the `WebSite`.
- All JSON-LD validates as valid JSON (verified by parsing); no missing required fields for the types used.

### Internal linking
- Every internal link uses a trailing slash (zero exceptions found in body content).
- No links to entry slugs that match the catch-all redirect list (i.e. no entry body links to a slug that would 301 away).
- `relatedConcepts` is well-populated: every entry has ≥4 (most have 5–6).
- Two-way "How this connects" mini-map renders per-entry from `relatedConcepts` — good editorial scaffolding.

### Images
- Every `<img>` in the built site has an `alt` attribute.
- Every `<img>` has `width` and `height` attributes (no CLS risk).
- Diagram fallback `<img>` is visually hidden but provides crawler-readable alt text.
- Inline SVG knowledge cards on entry pages have `role="img"`, `aria-label`, `<title>`, and `<desc>` — exemplary.
- OG images are 1200×630 PNGs, correctly sized for Twitter `summary_large_image` and OG.
- OG images appear in the sitemap as `<image:image>` blocks with `image:loc`, `image:caption`, `image:title`.

### Accessibility (SEO-relevant subset)
- Skip-to-content link at top of every page ([src/layouts/BaseLayout.astro:88](src/layouts/BaseLayout.astro:88)).
- Nav uses `aria-label="Primary"` and `aria-current="page"` for the active link.
- Mobile drawer uses `aria-expanded`, `aria-controls`, focus management, escape handling.
- Search panel is fully keyboard-accessible (arrow keys, enter, escape, Cmd-K).
- Form labels on `/contact/` are properly associated with inputs.
- Visually-hidden text uses correct CSS (clip-path / position-absolute), not `display: none`.
- All link icons in the nav have `aria-label` (Search, Contact).
- All decorative SVGs have `aria-hidden="true"` and `focusable="false"`.
- Tag pills use semantic `<a>` (not `<button>`); category chips on `/browse/` use `<button>` for filtering (correct).

### Redirects (current state, with §2.5 caveat)
- `public/_redirects` doesn't contain any redirect loops at the file level.
- All 301 destinations use trailing slashes (avoiding double-hop).
- WordPress-style admin paths (`wp-content/*`, `wp-admin/*`, `wp-login.php`, `xmlrpc.php`) are caught — good safety against exploit-scanner noise.
- The cognitive-dissonance/effort-justification path rewrite is in place.

### Content quality
- Every entry has `title`, `oneLiner`, `category`, `tags`, `howToSpotIt`, `thoughtToHoldOnto`, and `relatedConcepts` populated.
- Every entry has 4+ tags (the lowest is 5).
- Every entry has 4+ `relatedConcepts` (the lowest is 4; most have 5–6).
- Median word count of 1,533 is well above the 1,200-word floor.
- Every opening paragraph contains the concept name (spot-check sample of 15: 15/15 pass).
- Editorial voice is consistent; British English is consistent.
- 11 curated collections threaded across 149 entries — strong topic clustering signal.

### Performance & assets
- Total `dist/` size: 24MB (across 350 pages + JS + CSS + OG PNGs + diagram PNGs).
- Largest JS chunk is the React client bundle at 187KB (gzipped will be ~60KB) — only hydrated where needed.
- ConceptGraph + D3 bundle (85KB) is loaded only on `/connections/`, not on entry pages — correct island isolation.
- CSS chunks are split per route; largest is 15KB.
- No unused-CSS warnings from the build.
- Fonts preconnect to both `fonts.googleapis.com` and `api.fontshare.com`.
- PostHog runs from a same-origin `/ingest/*` proxy → no third-party domain in network requests, no cookie-banner exposure.

### URL hygiene
- Every internal URL on the site uses a trailing slash and lowercase slug — clean, consistent contract.
- No mixed content; everything is HTTPS.
- All `<a>` to external domains in nav, footer, and Further Reading use `rel="noopener"` (or `noopener noreferrer`).
- Homepage `og:image` correctly references `home.png` (not the legacy `homepage.png`).

---

## 7. Suggested fix order

If you want to work through this in one or two sittings, the order I'd choose:

1. **Today (1–2 hours):** §2.3 broken links, §3.1 `lang="en-GB"`, §3.7 long oneLiners, §3.10 short entries. All small, all in content/markdown.
2. **Today (30 min):** §2.5 stale Netlify dashboard redirects — go into the Netlify UI and delete them.
3. **This week (half-day):** §2.1 404 page, §2.2 BreadcrumbList schema (one template update each), §3.2 `/connections/` SSR shell, §3.3 JSON-LD on collection/about/contact, §3.4 SearchAction on homepage.
4. **Next deploy fixes itself:** §2.4 missing OG images (re-runs on prebuild).
5. **Background:** §3.8 missing whyItMattersNow entries, §3.11 zero-external-link entries, §3.12 orphan promotion through `relatedConcepts` patches.
6. **Eventually:** §3.5 stale OG cleanup, §3.13 self-host fonts, §4.x polish.

Once §2.1, §2.2, §2.3, and §3.1 land, the GSC complaints should quiet down significantly — those four address the structural problems Google is most likely to be raising flags about.
