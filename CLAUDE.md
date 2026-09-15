# omeshkandregula.com

Personal portfolio for **Omesh Kandregula**. MS in Engineering & Technology Innovation Management at Carnegie Mellon (expected Dec 2026), applying for **Product Manager** roles.

The audience is recruiters and hiring managers who skim. Every decision on this site serves one goal: convince them in about 30 seconds that this person ships real products, measures them, and has product judgment.

- **Live:** https://www.omeshkandregula.com
- **Repo:** https://github.com/OmeshKandregula/omeshkandregula.com
- **Deploy:** push to `main`. GitHub Pages builds automatically from the repo root. There is no CI workflow and no `CNAME` file; the custom domain is configured in GitHub repo settings, so do not add a CNAME or a build workflow without checking.
- **`_config.yml`** exists for one reason: `exclude` keeps `CLAUDE.md` and `.claude` out of the published site. This file used to be fetchable at `/CLAUDE.md`, which exposed the whole playbook. Anything internal added to the repo root must go in that exclude list, and the exclusion must be verified live with a 404.

---

## Stack

Static HTML. **No build step, no bundler, no `package.json`.** Edit the `.html` files directly.

| Thing | How it loads |
|---|---|
| Tailwind | CDN (`cdn.tailwindcss.com`), utility classes inline in the HTML |
| Icons | Iconify web component (`<iconify-icon icon="solar:...">`) |
| Font | Inter, Google Fonts. Root font-size is `87.5%`, so `1rem` = 14px |
| 3D hero | Three.js via `<script type="importmap">` pinned to `three@0.160.0`, driven by `assets/js/hero-scene.js` |
| Analytics | GA4 `G-6L2PZ9E8N5` and Microsoft Clarity `wg0c5adccj`, in the `<head>` of every page except `404.html` |

All CSS beyond Tailwind lives in a single `<style>` block in each page's `<head>`.

---

## Run and verify

```bash
# dev server (never use Bash to run servers; use the preview tool with this config)
# .claude/launch.json defines: name "portfolio", npx serve, port 3000
```

Two gotchas that will waste your time otherwise:

1. **`serve` redirects `/page.html` to `/page`.** Navigate to `http://localhost:3000/bulletyn-work`, not `...-work.html`, or you get a 301 and land back on `/`.
2. **The in-app browser pane suspends layout when it is hidden.** When that happens `window.innerWidth` reports `0`, `getBoundingClientRect()` returns all zeros, scrolling does nothing, IntersectionObservers never fire, and screenshots time out or come back black. This is an environment artifact, not a bug in the page. Verify structurally (`querySelectorAll`, `textContent`, fetched HTML) and say plainly that you could not confirm visually.

After deploying, confirm the change is actually live before claiming it is:

```bash
until curl -sL "https://www.omeshkandregula.com/?cb=$RANDOM" | grep -q 'SOME_NEW_STRING'; do sleep 15; done; echo LIVE
```

---

## Hard rules

These are not preferences. Each one cost a round of rework.

### 1. Never use em dashes. Anywhere.

Not in visible copy, not in meta descriptions, not in alt text. Use a period, comma, colon, or middot (`·`). Arrows (`→`) are fine and used throughout.

### 2. Capitalize the letter after a colon in visible text

"My job: Turn that into a buildable spec." Not "my job: turn that into...".

### 3. Design tells the story. Words are the garnish.

This is the rule most often violated. When given content, the job is to turn it into **artifacts**, not to paste it in as prose.

- Cap supporting copy at **one or two short sentences per element**. Nothing over ~40 words.
- Convert lists, findings, and footnotes into visual artifacts: metric bars, chips, stat cards, before/after decision records.
- If a section is a wall of paragraphs, it is wrong, even if every sentence is true.

### 4. Numbers must be attributed, real, and consistent across pages

- Every number carries a one-line attribution naming the product and method. Attributed numbers convince; naked percentages float.
- **Never invent, round up, or inflate a number.** Dropping a weak number is fine; changing one is not.
- **A claim on the homepage must match its case study page.** A recruiter who clicks through and finds a mismatch loses more trust than the claim earned. When you retire a number on a case page, grep the homepage for it in the same change.
- Never present projections, roadmap goals, or TAM figures as achievements.
- Numbers borrowed from published research must be framed as such, never as his own result.

### 5. No superlatives, no self-praise

Banned words: genius, visionary, revolutionary, cutting-edge, passionate. The page must never claim he is a great product thinker. It is engineered so the reader concludes that themselves, from decisions with reasons attached, especially decisions that cost him something.

### 6. Precision at small numbers reads as confidence

"16 readers" beats "a growing user base." Do not soften small numbers, and do not delete a section because it looks like a failure. The audio feature that got 13 plays is the most credible thing on the Bulletyn page, because it proves the other numbers are not curated.

---

## Design system

Dark, minimal, hairline borders. Black background, zinc grays, a single emerald accent (`#10b981` / `emerald-400`/`500`). Reuse these idioms rather than inventing new ones.

```html
<!-- mono kicker label -->
<span class="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Measured outcomes</span>

<!-- provenance line under an artifact -->
<p class="text-[9px] font-mono uppercase tracking-wider text-zinc-600">Bulletyn · closed beta · 53 users · Mar to Jun 2026</p>

<!-- chip -->
<span class="text-[10px] font-mono uppercase tracking-wider text-zinc-500 border border-white/[0.08] px-2 py-1">496 feeds</span>

<!-- metric bar -->
<div class="flex justify-between items-baseline text-[10px] font-mono uppercase tracking-wider">
  <span class="text-zinc-500">Label</span><span class="text-zinc-300">78%</span>
</div>
<div class="h-1 bg-white/[0.06] mt-1.5"><div class="h-full bg-emerald-500/60" style="width:78%"></div></div>

<!-- stat tile grid (hairline via gap-px on a light bg) -->
<div class="grid grid-cols-2 gap-px bg-white/[0.06] border border-white/10">
  <div class="bg-black p-4"><p class="text-3xl font-medium text-white">325</p><p class="text-xs text-zinc-300 mt-1">briefs shipped</p></div>
</div>

<!-- decision record: what I believed, then what I changed it to -->
<div class="border border-white/10 bg-white/[0.02] p-4 space-y-2">
  <p class="text-xs text-zinc-600 line-through decoration-zinc-700">Old belief</p>
  <p class="text-xs text-zinc-200 flex items-start gap-2"><span class="text-emerald-400 shrink-0">→</span><span>What replaced it</span></p>
</div>
```

**Behavioral classes** (wired by the inline script at the bottom of `index.html`):

| Class | Effect |
|---|---|
| `.reveal` | Fades and slides in on scroll. Stagger with inline `style="transition-delay:0.08s"` |
| `.stat-value` with `data-target="325"` | Counts up from 0 when scrolled into view |
| `.card-spotlight` | Cursor-following glow on hover |
| `.loop-connector`, `.loop-node` | The Operating Loop rail: emerald dots light up in sequence, connectors draw left to right |
| `.loop-bar` with `style="--w:78%"` | Metric bar that animates its width on reveal |

Sizing images against type: use `em`, not pixels, so the asset scales with the heading. The Bulletyn wordmark sits at `h-[1em]` in the case study hero and `h-[1.4em]` in the white CTA button, chosen so its cap height matches the adjacent text without changing the button's height.

---

## Page map

`index.html` is the whole pitch. Its left column runs in deliberate narrative order:

| Section | Purpose |
|---|---|
| Hero | The claim: "I ship products people actually use, not just decks about them" |
| `#proof` | Measured Outcomes band. Four counting stats, each attributed. The 30 second payload |
| `#work` | Four project cards with live badges and 2:1 screenshots |
| `#loop` | The Operating Loop: Research → Validate → Ship → Measure, each step a real project with an artifact. The reframe quote is the headline of each card, because insight-as-reframe is what PM screens select for |
| `#writing` | Thinking in Public. Latest Substack essays, newest first |
| Skills marquee | |
| `#about` | Bio, photo, education (CMU, IIT Madras), skills grid |
| `#experience` | Sticky right-hand sidebar, accordion |
| Footer | The ask: "Next product: Yours." |

Case studies: `bulletyn-work.html`, `fovea-work.html`, `taxy-work.html`, `peerfectcv-work.html`, `incident-copilot-work.html`, `screensage-work.html`, `tvasta-work.html`. Plus `404.html` (no analytics on it, which is a known gap).

Each case page has a skim view, then a **Read More toggle** that reveals the expanded content. **Anything below that toggle is invisible to most readers.** The strongest insight belongs above it. On the Bulletyn page that is the "turning point" band carrying the quote at display size plus four stat tiles.

When adding or removing a page, update `sitemap.xml`.

---

## The products

Three are live and publicly usable: **Bulletyn** (readbulletyn.com), **Fovea**, **PeerfectCV** (peerfectcv.com). Taxy is a research concept with no live product; keep it framed honestly and never give it a live badge. Arcane was Bulletyn's original name at the Prodhacks hackathon, not a separate product. The name is retired: it appears nowhere on the site, there is no Arcane case study, and it must not be reintroduced. The old Lovable prototype at arcanenews.lovable.app is dead to us, never link it.

**Bulletyn** is the flagship and the most current. It is an AI-personalized daily news brief: 496 active feeds, 29 topics, 4 reading depths, delivered 7 AM in the reader's local timezone. Rebuilt in July 2026 off the original Supabase and Lovable prototype onto AWS (Next.js, SST, Aurora Serverless v2 with Drizzle, Step Functions, Amazon SES, Bedrock with Claude Haiku). Current system numbers: 325 briefs shipped, 16 active readers, 0 unsubscribes, $0 marketing.

Beta-era email metrics from the retired system were never migrated and must not be restated as current. The current system deliberately does not trust raw open counts, because privacy proxies inflate them.

The page's spine is the lesson from the beta: **"Nobody complained. That was the problem."** No signal is a signal.

---

## Assets

`assets/images/` holds logos, `assets/projects/` holds card screenshots, `assets/js/` holds `hero-scene.js`.

Conventions:

- Card screenshots are **1200x600 (exactly 2:1) JPEGs**, cropped to show the product with its chrome, framed consistently across all four cards. Optimize to roughly 50 to 100 KB.
- **Raw source screenshots and logo exports stay untracked.** Commit only the optimized derivative. There are several 1 MB PNGs sitting untracked in `assets/` on purpose; do not add them.
- Logos are derived per container: a square mark for the 48px card grid boxes, a horizontal lockup for wide contexts, white on dark surfaces and black on the white CTA button. Trim transparent padding before exporting, and pad square marks to about 78% ink coverage to match the sibling logos.

---

## Working style

- Commit and deploy each change as it is finished rather than batching, then verify it live.
- Do not commit `.claude/settings.local.json` or `.claude/worktrees/`.
- Push back when a request would weaken credibility. "More coming soon" was rejected because the site's whole engine is that it only claims what already exists, and an unfulfilled promise ages into looking abandoned. That kind of pushback is wanted, not unwelcome.
- Report honestly what was and was not verified. If the browser pane would not paint, say so.
