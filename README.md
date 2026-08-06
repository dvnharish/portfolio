# harishduddupudi.com

Cinematic canvas scrollytelling portfolio. Next.js 14 App Router · TypeScript ·
Tailwind · Framer Motion. Zero `any`, zero ESLint warnings.

## Getting the real hero frames in

Drop the sequential frames straight into `public/sequence/`:

```
public/sequence/frame_00_delay-0.067s.webp
public/sequence/frame_01_delay-0.067s.webp
...
```

Nothing else needs editing. `scripts/build-manifest.mjs` runs on every
`npm run dev` / `npm run build`, scans that folder, natural-sorts the filenames
(so `frame_100` lands after `frame_20`), and writes `lib/sequence-manifest.json`.
`.webp`, `.avif`, `.jpg` and `.png` are all accepted.

Delete the generated placeholder frames first — the scanner picks up everything
in the folder:

```bash
rm public/sequence/*.webp
```

## Section 02 — Agentic Engineering

`components/sections/AgenticEngineering.tsx` is the interactive orchestration
board: a stage rail (Discover → Define → Build → Verify → Release), a role
selector, and a datasheet panel for the selected role-agent.

It is a WAI-ARIA **tablist with automatic activation** — roving `tabindex`, arrow
keys wrapping at both ends, `Home`/`End`, and a `tabpanel` whose
`aria-labelledby` tracks the active tab. Deliberately not another card grid: the
content is a pipeline, so it is presented as one.

> **Correct the U.S. Bank harness ledger before publishing.**
> `USBANK_HARNESSES` in `lib/content.ts` lists six agent harnesses against real
> delivery surfaces (APIGEE governance, threat-modelled APIs, SonarQube gates,
> data contracts, environment promotion, design review) — every one of those
> surfaces is a responsibility named in the U.S. Bank role bullets. But the
> harness *names and descriptions* were written by joining "Harish built skills
> and components at U.S. Bank" to "Harish owns these surfaces". They are a
> plausible shape, not a transcript, and they are attributable to a named
> employer. Replace them. The block deliberately carries no metrics.

> **Correct the role data before publishing.** `AGENT_ROLES` in
> `lib/content.ts` carries a `persona`, `skills` and `outputs` per role. The
> architecture (agent per role, composed from persona + rules + skills) is real,
> but the individual skill lists were written from each role's *standard remit*,
> not from your actual skill definitions. This is the part a technical
> interviewer will drill into — replace it with the real thing.

Roles live at `AGENT_ROLES`; each `stage` must match an entry in `PDLC_STAGES`.
Adding a role is one array entry — the board, the rail and the keyboard bindings
all derive from the data.

## Dialogs

Two live on the page, both on the native `<dialog>` element via
`hooks/useDialog.ts` + `components/Modal.tsx`:

- **Section-heading explainer** — any `Section` given an `explanation` prop turns
  its heading into a trigger (`components/ExplainButton.tsx`). Domains uses it.
- **Domain detail** — one per card, joining the domain, its role and its case
  study.

`useDialog` exists because a correct modal has three non-obvious traps, and each
dialog would otherwise re-solve them. They are documented in that file; the two
that actually bit during development are repeated below.

## Section 03 — Domains, and the dialog

Each domain card opens a detail dialog joining three datasets: the domain blurb,
the `Role` it maps to, and the `Project` case study with its outcome and stack.

`Domain.company` and `Domain.project` are **explicit joins**, not derived by
matching the display label — `org` is `"Fluentgrid"` while `Role.company` is
`"Fluentgrid Limited"`, so string matching would silently drop that row.

Built on the native `<dialog>` so the focus trap, Escape handling, background
inertness and focus restoration come from the platform. Two non-obvious things
this required:

- **React 18 has no synthetic `onClose` for `<dialog>`** (that arrived in React
  19). An `onClose` prop silently never fires, leaving React's state stale after
  the element closes — the scroll lock never releases and re-clicking the same
  card does nothing. A native `addEventListener('close', …)` is required.
- **`body { overflow: hidden }` does not lock page scroll** when `html` is the
  scrolling element, which it is by default. `lib/scroll-lock.ts` locks the
  document element instead, and is keyed by owner so the preloader and the dialog
  cannot corrupt each other's restore value.

## Theming

**Light is the default.** The design language is ink on warm paper — not an
inverted dark theme. Every colour comes from CSS variables in
`app/globals.css`; nothing is hardcoded except two places that are deliberately
fixed and commented as such (the portrait band, which sits over a dark
photograph in both themes, and the OG card).

Tailwind consumes the tokens as semantic colours — `bg-paper`, `text-ink`,
`text-ink-muted`, `text-ink-subtle`, `border-line/12` — so `/<alpha-value>`
works against them.

The canvas scenes read the same tokens via `lib/scenes/palette.ts`. Light and
dark are genuinely different rendering models, not a palette swap:

| | Dark | Light |
| --- | --- | --- |
| Structure reads from | Emitted light | Ink on paper |
| `glow()` | Additive luminous halo | Weak flat colour wash |
| `node()` | Bright core + halo | Ink dot ringed in paper |
| `lineBoost` | 1 | 2.6 (a 6% black line on paper is invisible) |
| Accents | Bright | Darkened for contrast |

A theme flip repaints every scene, including offscreen ones and reduced-motion
stills. The active theme lives on `<html data-theme>`, set by an inline script
in `<head>` before first paint so switching never flashes.

### Hero copy contrast is measured, not assumed

Your frame sequence is arbitrary artwork and may be bright or dark regardless of
which theme the page is in. `hooks/useFrameTone.ts` samples the real luminance of
three frames and colours the hero copy accordingly. Drop in a dark sequence and
the copy goes light; drop in a bright one and it goes dark. No configuration.

## Deployment — Hostinger (static)

Hostinger shared hosting runs Apache/LiteSpeed with **no Node runtime**, so this
project ships as a static export. `next.config.mjs` sets `output: 'export'`;
`npm run build` writes a self-contained `out/`.

```bash
npm run build      # prebuild assets -> next build -> finalize + audit
npm run preview    # serve out/ exactly as Apache will, at :4300
```

`npm run preview` is dependency-free on purpose — it proves the export works
with no toolchain behind it.

### What static export changes, and how it is handled

| Constraint | Handling |
| --- | --- |
| `headers()` is silently ignored | All caching, compression, MIME and security headers live in `deploy/.htaccess` |
| Next's image optimizer does not run | Portraits are pre-encoded to AVIF/WebP at 4 widths by `scripts/build-images.mjs` and served via `<picture>` (`components/Photo.tsx`) |
| `next start` unavailable | Removed; use `npm run preview` |
| No middleware / route handlers / ISR | Not used by this site |

`scripts/finalize-export.mjs` runs as `postbuild`. It copies `.htaccess` into
`out/` (Next does not reliably carry dotfiles out of `public/`), prints a size
audit, and **fails the build** if a `localhost` URL leaked into the HTML or if
`index.html`, `robots.txt`, `sitemap.xml`, `og.jpg` or `404.html` is missing.

### Continuous deployment from GitHub

`.github/workflows/deploy.yml` builds on every push to `main` and uploads `out/`
to Hostinger over FTPS. The build cannot run on Hostinger itself — no Node
runtime — so CI produces the static export and only the result is transferred.

The workflow gates on `typecheck`, `lint` and `verify` before it will deploy, and
asserts the critical files exist in `out/` before transferring anything.

**Repository → Settings → Secrets and variables → Actions.**

Three **secrets** (tab: *Secrets*):

| Secret | Where to find it | Example |
| --- | --- | --- |
| `FTP_HOST` | hPanel → Files → FTP Accounts | `ftp.harishduddupudi.com` |
| `FTP_USERNAME` | same page | `u123456789.deploy` |
| `FTP_PASSWORD` | set when you create the FTP account | |

Two optional **variables** (tab: *Variables*), both with working defaults:

| Variable | Default | When to set it |
| --- | --- | --- |
| `FTP_SERVER_DIR` | `/public_html/` | Your FTP user lands somewhere else — see below |
| `NEXT_PUBLIC_SITE_URL` | `https://harishduddupudi.com` | The domain changes |

`FTP_SERVER_DIR` is a variable rather than a secret on purpose: it is not
sensitive, and secrets are masked in logs — which is precisely the information
you need when the path is wrong. Verify it rather than guess. Connect once with
FileZilla and look at where you land:

- landing in the account home that *contains* `public_html` → `/public_html/`
- landing directly inside the site root → `./`

A wrong value uploads a perfectly good site into the wrong directory and serves
nothing.

Uploads are **incremental** — the action keeps a state file on the server and
sends only changed files, so the 89-frame sequence is not re-transferred on every
deploy. That state file is a dotfile, which `.htaccess` already blocks from being
served. `dangerous-clean-slate` is deliberately off; enabling it would wipe
`public_html` on every run.

#### Supply-chain note

`SamKirkland/FTP-Deploy-Action` receives your FTP credentials. It is pinned to a
release tag, but tags are mutable — pinning to a commit SHA is stronger:

```yaml
uses: SamKirkland/FTP-Deploy-Action@<full-40-char-sha>
```

If you would rather no third party touch the credentials at all, replace that
step with `lftp`, which keeps everything in-repo:

```yaml
- run: sudo apt-get update && sudo apt-get install -y lftp
- run: |
    lftp -c "set ftp:ssl-force true; set ftp:ssl-protect-data true; \
      open -u '${{ secrets.FTP_USERNAME }}','${{ secrets.FTP_PASSWORD }}' ${{ secrets.FTP_HOST }}; \
      mirror -R --only-newer --verbose out/ ${{ secrets.FTP_SERVER_DIR }}"
```

Add `--delete` to that `mirror` only once you have confirmed the target path is
correct — it removes remote files absent locally.

### Uploading manually

Package it:

```powershell
Compress-Archive -Path "out\*" -DestinationPath "deploy\portfolio-hostinger.zip" -Force
```

Then in **hPanel → Files → File Manager**:

1. Open `public_html` and delete its contents (including any `default.php`).
2. Upload `portfolio-hostinger.zip` into `public_html`.
3. Right-click → **Extract**, then delete the zip.
4. Confirm `index.html` and `.htaccess` sit *directly* in `public_html`, not in a
   nested `out/` folder. Enable **Show hidden files** to see `.htaccess`.

Or over FTP/SFTP: upload the **contents** of `out/` to `public_html`, ensuring
your client is set to transfer dotfiles.

### Domain and TLS

In hPanel → **Domains**, point `harishduddupudi.com` at this hosting, then
**SSL → Install SSL** (free Let's Encrypt). The `.htaccess` already forces HTTPS
and redirects `www` to the apex, so do not add competing redirect rules in hPanel.

`NEXT_PUBLIC_SITE_URL` only needs setting if the domain changes — the production
origin is the default in `lib/site.ts`, and the build fails loudly if a localhost
URL ever reaches the output.

## Photos

Drop originals into **`assets/portrait/`**, named after the slot they fill. Any
of `.jpg .jpeg .png .webp .avif` works.

> Sources live outside `public/` deliberately. Everything under `public/` is
> copied verbatim into the static export, so keeping originals there shipped a
> 414 KB photograph that nothing on the page ever requested.

| File | Used for | Ideal source |
| --- | --- | --- |
| `hero.*` | Full-bleed parallax band **and** the OG/Twitter card | Wide 16:9, ≥ 2560px |
| `about.*` | Portrait beside the About copy | Vertical 4:5 |
| `contact.*` | Portrait in the Contact section | Vertical 4:5 |

`scripts/build-images.mjs` runs on every dev/build and, per slot, writes AVIF +
WebP at up to five widths plus a progressive JPEG fallback into
`public/portrait/`, along with intrinsic dimensions and an inline blur
placeholder. `components/Photo.tsx` serves them through a `<picture>`, so the
browser still picks the smallest suitable format and width with no image server
involved. Derivatives are gitignored; the originals in `assets/` are committed.

Every slot is optional — a missing slot renders nothing and the layout closes up
around it. Check what was picked up with `npm run gen:images`.

## Architecture

### The hero — image-sequence scrubber

`ScrollyCanvas` pins a full-viewport canvas over a tall track and maps scroll
progress onto a preloaded frame list. `Overlay` drives the three hero text
blocks by mutating `style.opacity` / `style.transform` directly inside
`useMotionValueEvent` — never `useTransform` — so scrubbing does not re-render
React at all. The timing model lives in `lib/overlay-timing.ts` as a pure,
dependency-free module and is asserted by `npm run verify`.

### The chapters — one generative scene per role

Each role in `lib/content.ts` maps to a hand-written canvas scene depicting what
that platform actually did:

| Company | Scene | Accent |
| --- | --- | --- |
| U.S. Bank | Transactions crossing an API gateway; threats refused at the boundary, a tripped circuit breaker rerouting, governance rings tightening | Blue |
| GSK | A monolith fracturing into orbiting services, dependency chords thinning, an identity ring closing | Violet |
| Robert Bosch | Fleet on a receding road plane beaming telemetry to an ingest cloud, a diagnostic fault flaring, a CQRS read/write fork | Amber |
| Fluentgrid | Substation energising feeders, an outage darkening a branch, a SCADA sweep detecting it, restoration propagating | Green |

Scenes are pure functions in `lib/scenes/*.ts` — `(SceneFrame) => void`, no React,
no DOM lookups, deterministic PRNG so every load looks identical. `SceneCanvas`
runs them, driving narrative state from scroll progress (`t`) and ambient motion
from a wall clock (`time`). One rAF loop total: the loop is gated on an
`IntersectionObserver`, so offscreen chapters cost nothing.

To add a role scene: write the renderer, export a `Scene`, and register it in
`lib/scenes/index.ts` keyed by `Role.company`. A role with no scene renders
without a background — nothing else to change.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server (rebuilds the manifest first) |
| `npm run build` | Production build (manifest + OG image first) |
| `npm run verify` | Assert the hero overlay timing contract |
| `npm run weight` | Byte-weight report for `public/sequence` |
| `npm run gen:sequence` | Regenerate the placeholder sequence |
| `npm run gen:og` | Regenerate `public/og.jpg` from the hero portrait |
| `npm run preview` | Serve `out/` as static files, the way Apache will |
| `npm run typecheck` | `tsc --noEmit` |

## Performance budget

`npm run weight` warns above **4 MB** total for `public/sequence` and prints the
exact ezgif re-export settings needed to get back under it.

## Device and motion profiles

| Condition | Hero track | Frames loaded | Chapters |
| --- | --- | --- | --- |
| Desktop | 500vh | every frame | pinned, 200vh each |
| `< 768px` or viewport shorter than 800px | 200vh | every 3rd frame | unpinned, content height |
| `prefers-reduced-motion: reduce` | ~100vh, no scrub | one hero frame | unpinned, scenes drawn as stills |

Reduced motion is enforced at three levels: a blanket CSS rule in
`globals.css`, the React branches above, and `SceneCanvas` never starting its
rAF loop. Verify with Chrome DevTools → ⋮ → More tools → Rendering → *Emulate
CSS prefers-reduced-motion*.

## Configuration

`lib/site.ts` holds identity constants — including `GITHUB_URL`, which the
navbar and footer render conditionally. `lib/content.ts` holds all copy; every
metric in it comes from the source résumé. `NEXT_PUBLIC_SITE_URL` overrides the
canonical origin (see `.env.example`).
