# Sanil M — Portfolio

A 3D, scroll-choreographed portfolio. Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · React Three Fiber + drei + rapier · GSAP ScrollTrigger · Lenis · Framer Motion.

```bash
npm install        # first time only
npm run dev        # local preview → http://localhost:3000
npm run build      # production build (also type-checks — run before pushing)
npm start          # serve the production build locally
```

**Contents**
1. [Editing your content](#1-editing-your-content--contentcontentts)
2. [Going live: full setup & deploy guide](#2-going-live-full-setup--deploy-guide)
3. [Updating the live site later](#3-updating-the-live-site-later)
4. [Troubleshooting](#4-troubleshooting)
5. [Hidden extras](#5-hidden-extras) · [Design tokens](#6-design-tokens) · [Project structure](#7-project-structure)

---

## 1. Editing your content — `content/content.ts`

**Every piece of text and data on the site lives in this one file.** You never need to touch the components. Save the file and `npm run dev` updates the page instantly.

| To change… | Edit this export in `content.ts` |
| --- | --- |
| Name, initials, hero lines, tagline, bio, availability, email, phone | `profile` |
| Social links (contact, footer, mobile menu, SEO) | `socials` |
| Jobs / achievements | `experience` (newest first) |
| Education, certifications | `education`, `certifications` |
| Project cards + case-study pages | `projects` |
| Tech stack tabs + 3D can labels | `stack` |
| "Also familiar with" line | `familiar` |
| FAQ | `faqs` |
| Ticker strip words | `marquee` |
| Contact headline / success message | `contact` |
| Easter-egg dialog | `easterEgg` |

> Rules of thumb: keep the quotes `"..."` and the commas `,` at the end of each item. If the dev server shows a red error after an edit, you most likely removed a comma, quote or bracket.

### 1.1 Add a project
1. In `content.ts`, find `export const projects` and copy an existing `{ ... },` block. Paste it where you want it in the list.
2. Fill it in:
   ```ts
   {
     slug: "my-new-app",                 // URL → /projects/my-new-app (lowercase, dashes, must be unique)
     title: "My New App",
     pitch: "One-line description shown on the card.",
     problem: "What problem it solves.",
     solution: [
       "What you built — point 1.",
       "Point 2.",
     ],
     stack: ["React", "Node.js", "MongoDB"],
     role: "Solo developer",
     context: "Personal project",        // or "Built at Netstratum"
     image: "/covers/my-new-app.svg",
     imageHover: "/covers/my-new-app-alt.svg",
     liveUrl: "https://...",             // optional — delete the line if none
     githubUrl: "https://github.com/...",// optional — delete the line if none
   },
   ```
   The **Live site ↗ / GitHub ↗** buttons only appear when `liveUrl` / `githubUrl` exist. Leave both out for company work.
3. Create its cover art:
   - Open `scripts/covers.mjs` and add a line to the `items` list:
     ```js
     ["my-new-app", "MY NEW APP", "SHORT SUBTITLE", "code", 1],
     ```
     - 1st value = the `slug` (must match exactly)
     - 2nd = big title on the cover · 3rd = small subtitle
     - 4th = motif: `grid`, `nodes`, `calendar`, `code`, `chat`, `wave`, `mail`
     - 5th = colour theme: `0` orange · `1` dark · `2` off-white
   - In a terminal inside the project folder run: `node scripts/covers.mjs`

**Change** a project → just edit its text. **Remove** one → delete its whole `{ ... },` block (and its line in `covers.mjs`). **Reorder** → move the blocks. **Featured** → put `featured: true,` on the one you want first (only one).

### 1.2 Add a new tech you learned
Find `export const stack` and add a line inside the right category's `items`:
```ts
{ name: "Next.js", use: "How you use it, in one line." },
```
Categories: Frontend, Backend, AI / ML, Database, Tools & Testing.

**New category** → copy a whole category block and change `id` (unique, lowercase), `title`, `blurb`, `canLabel` (text printed on its 3D can). A new can appears automatically.

**Skills you only know a little** → add to `familiar`, e.g. `["C++", "Java", "Go"]`.

### 1.3 Add a job or achievement
In `experience`, add a new block at the **top** (newest first):
```ts
{
  company: "Company Name",
  role: "Software Developer",
  domain: "Industry",
  period: "Jan 2026 — Present",
  summary: "One or two lines about the role.",
  achievements: ["Achievement 1.", "Achievement 2."],
},
```
Update the old job's `period` end date (e.g. `"July 2024 — Dec 2025"`).

### 1.4 Other quick edits
- **Certification** → add `{ title: "Course name", issuer: "Coursera" },` to `certifications`.
- **Social link** → add `{ label: "X", handle: "yourname", href: "https://x.com/yourname" },` to `socials`.
- **FAQ** → add `{ q: "Question?", a: "Answer." },` to `faqs`.
- **Availability** → change `profile.availability` (e.g. `"Not available right now"`).

---

## 2. Going live: full setup & deploy guide

Do these once, in order. Total time ≈ 30–45 minutes.

### Step 1 — Check your tools
Open **PowerShell** and run:
```powershell
node -v     # needs v18.18 or newer (you have v22 ✓)
git --version
```
If `git` is not found: install it from https://git-scm.com/download/win (keep all defaults), then **close and reopen** PowerShell. First-time Git setup:
```powershell
git config --global user.name "Sanil M"
git config --global user.email "sanilm4637@gmail.com"
```

### Step 2 — Test the site locally
```powershell
cd C:\Users\Sanil\Desktop\portfolio
npm install
npm run dev
```
Open http://localhost:3000 and click through everything (desktop + narrow the window for mobile). Stop the server with **Ctrl + C**. Then confirm the production build works:
```powershell
npm run build
```
It must end without errors (a route table is printed). Fix any error before continuing.

### Step 3 — Set up the contact form (Formspree)
1. Go to https://formspree.io → **Sign up** (free) using `sanilm4637@gmail.com` and verify your email.
2. Click **+ New Form** → name it `Portfolio contact` → submissions go to `sanilm4637@gmail.com` → **Create Form**.
3. You'll see an endpoint like `https://formspree.io/f/xyzabcd1`. The part after `/f/` (`xyzabcd1`) is your **Form ID**.
4. In the project folder create a file named **`.env.local`** (copy `.env.example` and rename it) containing:
   ```
   NEXT_PUBLIC_FORMSPREE_ID=xyzabcd1
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```
5. Restart `npm run dev`, send yourself a test message from the Contact section, and check your inbox. The first submission may ask you to confirm the form in Formspree.

> `.env.local` is private and is **not** uploaded to GitHub (it's in `.gitignore`). You'll enter the same values in Vercel in Step 6.

### Step 4 — Put the code on GitHub
1. Sign in at https://github.com (account **Sanil2002**) → top-right **+** → **New repository**.
   - Name: `portfolio` · Public or Private (either works with Vercel) · **don't** tick "Add a README" → **Create repository**.
2. In PowerShell:
   ```powershell
   cd C:\Users\Sanil\Desktop\portfolio
   git init
   git add .
   git commit -m "Initial portfolio"
   git branch -M main
   git remote add origin https://github.com/Sanil2002/portfolio.git
   git push -u origin main
   ```
   A browser window may ask you to sign in to GitHub — approve it.
3. Refresh the GitHub page — your files should be there (no `node_modules`, `.next` or `.env.local` — that's correct).

### Step 5 — Import the project into Vercel
1. Go to https://vercel.com/signup → **Continue with GitHub** (use the same account).
2. **Add New… → Project** → find `portfolio` → **Import**. (If it's not listed, click "Adjust GitHub App Permissions" and give Vercel access to the repo.)
3. Framework Preset shows **Next.js** automatically. Leave Build/Output settings as they are.

### Step 6 — Add environment variables in Vercel
Still on the import screen, open **Environment Variables** and add:

| Key | Value |
| --- | --- |
| `NEXT_PUBLIC_FORMSPREE_ID` | your Form ID from Step 3 |
| `NEXT_PUBLIC_SITE_URL` | `https://portfolio.vercel.app` for now — you'll correct it in Step 8 |

Click **Deploy**. Wait ~1–2 minutes for "Congratulations!". Click the preview to open your live site.

### Step 7 — Rename your URL (optional but nicer)
Vercel → your project → **Settings → Domains**. Edit the `*.vercel.app` domain to something like `sanil-m.vercel.app` (must be free). Note the final URL.

### Step 8 — Fix the site URL and redeploy
1. Vercel → **Settings → Environment Variables** → edit `NEXT_PUBLIC_SITE_URL` → set it to your real URL, e.g. `https://sanil-m.vercel.app` (no trailing slash) → Save.
2. **Deployments** tab → on the latest deployment click **⋯ → Redeploy**. (Env variables are only applied at build time, so this step is required.)

### Step 9 — Allow your domain in Formspree
Formspree → your form → **Settings** → **Restrict to domain** (if available on your plan) → add your Vercel domain. Then send a test message from the **live** site and confirm it arrives.

### Step 10 — Verify the live site
- [ ] Everything loads: preloader, orb, projects, cans, timeline, FAQ, contact
- [ ] `https://<your-site>/sitemap.xml` and `/robots.txt` open
- [ ] Paste your URL into WhatsApp/LinkedIn → the orange share card appears
- [ ] All links work: LinkedIn, GitHub, Instagram, project Live/GitHub buttons
- [ ] Open on your phone: Menu button, swiping projects, cans, form
- [ ] Chrome → F12 → **Lighthouse** → Mode: Navigation, Device: Desktop → **Analyze**. Aim for 90+ on Performance.

### Step 11 — Tell search engines & share it (optional)
- Google Search Console (https://search.google.com/search-console) → add your URL → verify (choose the HTML tag method or Vercel domain) → **Sitemaps** → submit `sitemap.xml`.
- Add the URL to your LinkedIn profile (Contact info → Website), GitHub profile, and resume.

### Step 12 — Custom domain (optional, paid)
Buy a domain (e.g. `sanilm.dev`) from Namecheap/GoDaddy/Cloudflare → Vercel → **Settings → Domains → Add** → follow the DNS records Vercel shows → wait for "Valid Configuration" → update `NEXT_PUBLIC_SITE_URL` to the new domain → Redeploy → add the new domain in Formspree too.

---

## 3. Updating the live site later

Every time you change content (new project, new tech, etc.):
```powershell
cd C:\Users\Sanil\Desktop\portfolio
npm run dev            # check your change locally, then Ctrl + C
npm run build          # make sure there are no errors
git add .
git commit -m "Add new project"
git push
```
Vercel detects the push and redeploys automatically in ~1 minute. Watch progress in the Vercel **Deployments** tab.

---

## 4. Troubleshooting

| Problem | Fix |
| --- | --- |
| Red error screen after editing `content.ts` | A missing comma, quote or bracket near the line you edited. The error message shows the line number. |
| Contact form says "Couldn't send right now" | `NEXT_PUBLIC_FORMSPREE_ID` is missing/wrong. Locally: check `.env.local` and restart `npm run dev`. On Vercel: check env vars, then **Redeploy**. |
| Vercel build fails | Open the failed deployment → **Build Logs** → read the first error. Run `npm run build` locally to reproduce. |
| `__webpack_modules__[moduleId] is not a function` locally | Stop the dev server, delete the `.next` folder, run `npm run dev` again. |
| New project cover is missing | The slug in `scripts/covers.mjs` must exactly match the `slug` in `content.ts`; re-run `node scripts/covers.mjs`. |
| Share card shows localhost or old image | Set `NEXT_PUBLIC_SITE_URL` correctly and redeploy. Social apps cache previews — use https://www.linkedin.com/post-inspector/ to refresh. |
| No sound | Browsers only play audio after your first click/key. Check the Sound toggle in the top bar. |
| `git push` rejected | Run `git pull --rebase origin main`, then `git push` again. |

---

## 5. Hidden extras
- Easter egg: click the hero orb 5× quickly, enter the Konami code (↑↑↓↓←→←→BA), or type `dialed`.
- The sound toggle choice is saved per visitor.
- `prefers-reduced-motion` disables smooth scroll, heavy motion, physics and confetti.
- Touch devices: no custom cursor/scrollbar, cans float instead of physics, lighter 3D.

## 6. Design tokens
- Colours / fonts: top of `app/globals.css` (`@theme`). Accent is `--color-blaze` (`#FF5B1F`).
- Easing + durations: `lib/motion.ts`.
- Sound effects: `lib/sound.ts` (synthesized, no audio files).
- Project covers: `scripts/covers.mjs`.

## 7. Project structure
```
app/                 layout (SEO, JSON-LD, providers), home, /projects/[slug], OG image, sitemap, robots, 404
content/content.ts   ← all copy & data
components/
  sections/          Preloader, Hero, Projects (+ProjectCard), Stack, Experience, Faq, Contact
  three/             OrbScene, LaptopScene, CansScene (lazy-loaded, paused offscreen)
  layout/            TopBar (+ mobile menu), Footer
  ui/                Cursor, Magnetic, ScrollBar, StickyCta, EasterEgg, TextReveal, Marquee, SoundToggle, SharedTransition, UiSounds
lib/                 motion tokens, gsap setup, sound engine, hooks
providers/           SmoothScroll (Lenis ⇄ ScrollTrigger), SoundProvider
scripts/covers.mjs   generates /public/covers/*.svg
```

> Dev tip: `NEXT_DIST_DIR=.next-check npm run build` builds into a separate folder so it never clashes with a running `npm run dev`.
