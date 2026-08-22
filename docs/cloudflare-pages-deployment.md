# Cloudflare Pages Deployment

The site is a fully static build — Next.js with `output: "export"` (see `next.config.ts`),
content read from `content/*.json` at build time (see `docs/architecture.md`). No server runtime,
no database, no environment variables required.

## Project settings

| Setting                | Value                                                                                                            |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Framework preset       | Next.js (Static HTML Export)                                                                                     |
| Build command          | `npx next build`                                                                                                 |
| Build output directory | `out`                                                                                                            |
| Root directory         | `/` (repo root)                                                                                                  |
| Environment variables  | none required                                                                                                    |
| Node.js version        | set `NODE_VERSION` in the Pages project's environment variables — match the version used locally (currently v24) |

`npx next build` (equivalently, `npm run build` — `package.json`'s `build` script is just
`next build`) runs the Next.js compiler; because `next.config.ts` sets `output: "export"`, that
alone produces a static `out/` directory directly — there's no separate export step to configure.

## Connecting the repository

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Select this repository and the branch to deploy from (e.g. `main`).
3. Set the build settings from the table above.
4. Deploy. Every push to the connected branch triggers an automatic rebuild + redeploy.

## Preview deployments

Cloudflare Pages builds a preview deployment for every other branch and pull request
automatically, using the same build settings — no extra configuration needed, since there are no
environment-specific secrets to differ between preview and production.

## Root redirect (`/` → `/en`)

`src/app/page.tsx` calls `redirect("/en")`, but under static export that only resolves via
client-side JavaScript after the page loads — a no-JS client or crawler would see a broken error
state instead of a redirect. `public/_redirects` (copied into `out/` by the build) is the real
fix: Cloudflare Pages reads this file and issues an actual HTTP redirect before any HTML is even
served, no JS required. Verified locally with `npx serve out` + a browser check — without
`_redirects`, `/` only worked because the browser executed JS; with it, Cloudflare will redirect
at the edge regardless.

## Image rules

Public recipe photos live in the repository, under `public/images/recipes/<slug>/` — no Supabase
Storage, no external image-hosting service. `output: "export"` copies everything under `public/`
into `out/` verbatim, so a file at `public/images/recipes/ragi-dosa/featured.svg` is served at
`/images/recipes/ragi-dosa/featured.svg` with no extra configuration.

- **Never copy an original Google Drive scan into `public/`.** Scans stay private in Drive
  (`01_Original_Scans`), permanently. A public recipe photo is a categorically different thing: an
  owner-curated photo, staged in Drive's `06_Recipe_Images` folder, then manually copied into
  `public/images/recipes/<slug>/` — the same "export to Drive, then a human copies it into the
  repo" pattern the recipe content itself already follows (`import-export-format.md`). Apps Script
  does not do this copy; there is no automation between `06_Recipe_Images` and `public/`.
  `ExportApproved.gs` always writes `featured_image_url: null` — a human adds the real path when
  they add the photo.
- `content/recipes/<slug>.json`'s `featured_image_url` holds the resulting repository-local path
  (e.g. `/images/recipes/ragi-dosa/featured.svg`), never a Drive file ID, Doc ID, or URL.
- `featured_image_alt_ta`/`featured_image_alt_en` carry the localized alt text for that image —
  fill both in whenever `featured_image_url` is set. Components fall back to the recipe title if
  either is `null`, but that's a safety net, not a substitute for writing real alt text.
- `null` is the correct, expected value for a recipe with no photo yet — components already
  render a text placeholder in that case. Don't invent a path just to avoid `null`.
- No image optimization pipeline exists (`images.unoptimized: true` in `next.config.ts`, plain
  `<img>` tags in components) — keep source files reasonably small by hand, since nothing resizes
  or compresses them at build time.

## Custom domain

Configure under the Pages project's **Custom domains** tab once ready; not required for the site
to build or deploy.

## Local build parity

To reproduce exactly what Cloudflare will build:

```bash
npm run build
npx serve out
```

(`serve` or any static file server — the point is confirming `out/` is a complete, correct static
site before pushing.)

## Why no environment variables

The previous (Supabase-based) architecture needed `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` at build/runtime. None of that
exists anymore — the build reads `content/*.json` directly off disk, so there is nothing to
configure per-environment. If a future stage adds something environment-specific (analytics, a
search service, etc.), add it here rather than assuming there's still nothing to configure.
