# How this portfolio works

A companion to `README.md`. The README explains **how to edit and deploy**. This file explains **what is used, how it works and why**, section by section. File paths are clickable in most editors.

**Contents**
1. [The stack at a glance](#1-the-stack-at-a-glance)
2. [How the app is put together](#2-how-the-app-is-put-together)
3. [Shared foundations (scroll, timing, sound, cursor, scrollbar)](#3-shared-foundations)
4. [Section by section](#4-section-by-section)
5. [How the 3D works (R3F primer + the three scenes)](#5-how-the-3d-works)
6. [Responsiveness: phone to 4K TV](#6-responsiveness-phone-to-4k-tv)
7. [Performance techniques](#7-performance-techniques)
8. [Accessibility](#8-accessibility)
9. [SEO & sharing](#9-seo--sharing)
10. [Glossary](#10-glossary)

---

## 1. The stack at a glance

| Tool | Version | What it does here | Why it was chosen |
| --- | --- | --- | --- |
| **Next.js** (App Router) | 15 | Framework: routing, pages, fonts, images, SEO files, static generation | Every page is pre-rendered to static HTML at build time, so it loads fast and deploys to Vercel with zero config |
| **React** | 19 | UI components | Industry standard; required by Next.js and React Three Fiber |
| **TypeScript** | 5 | Types for all code and for `content.ts` | Catches mistakes (e.g. a project missing a `slug`) before the site builds. Pinned to v5 because TS 7 breaks Next 15's config loader |
| **Tailwind CSS** | 4 | Styling via utility classes (`text-blaze`, `rounded-full`…) | Fast to write, consistent spacing/colours, and it ships only the CSS actually used |
| **Three.js** | latest | The 3D engine (WebGL) | The standard way to draw 3D in a browser |
| **React Three Fiber (R3F)** | 9 | Lets you write Three.js scenes as React components | Scenes live alongside normal React code and clean themselves up on unmount |
| **@react-three/drei** | 10 | Ready-made R3F helpers: `MeshDistortMaterial`, `Float`, `RoundedBox`, `Environment`, `Lightformer`, `useTexture` | Saves hundreds of lines of 3D boilerplate |
| **@react-three/rapier** | 2 | Physics engine (Rapier, compiled to WebAssembly) | Real gravity/collisions for the draggable cans; WASM makes it fast |
| **GSAP + ScrollTrigger** | 3 | Timeline animations and scroll-linked animation | The most precise, reliable scroll-animation library; perfect for "scrub" effects tied to scroll position |
| **Lenis** | 1 | Smooth (inertia) scrolling | Gives the premium "buttery" scroll feel; integrates cleanly with ScrollTrigger |
| **Framer Motion** | 12 | React UI micro-interactions: enter/exit, accordion height, card tilt springs, modal | Declarative and React-friendly; handles "animate when removed" (`AnimatePresence`), which GSAP doesn't do as easily in React |
| **canvas-confetti** | — | Confetti for the easter egg | Tiny, and loaded only when the easter egg fires |
| **Web Audio API** | built-in | Sound effects | Sounds are *synthesized* in code, so there are zero audio files to download |
| **Formspree** | service | Receives contact form submissions and emails them to you | No backend/server to maintain |
| **Vercel** | host | Builds and serves the site | Made by the Next.js team; push-to-deploy |

**Why two animation libraries?** GSAP is best at *timelines and scroll-linked* motion (preloader, hero reveal, timeline line drawing). Framer Motion is best at *React state-driven* motion (things mounting/unmounting, hover springs). Each is used where it's strongest.

---

## 2. How the app is put together

### 2.1 Rendering model
- **Server/static by default.** Pages such as `app/page.tsx` and `app/projects/[slug]/page.tsx` are *server components*. Next.js turns them into plain HTML at build time (`generateStaticParams` pre-builds all 7 project pages).
- **Client components where interaction is needed.** Any file starting with `"use client"` runs in the browser (animations, 3D, cursor, form). The HTML still arrives pre-rendered, then React "hydrates" it to make it interactive.
- **3D is never server-rendered.** The scenes are loaded with `next/dynamic(..., { ssr: false })` because WebGL only exists in a browser.

### 2.2 The layout tree (`app/layout.tsx`)
```
<html>  fonts (Anton + Inter via next/font), metadata, JSON-LD
 <body>
   Skip-to-content link
   <SoundProvider>             ← mute state for the whole site
     <SmoothScroll>            ← Lenis smooth scrolling
       <Preloader/>            ← counter + curtain
       <TopBar/>               ← logo, nav, sound toggle, mobile menu
       {page}                  ← wrapped by app/template.tsx (fade-in transition)
       <Footer/>
     </SmoothScroll>
     <Cursor/> <UiSounds/> <SharedElementCleanup/> <ScrollBar/> <StickyCta/> <EasterEgg/>
   </SoundProvider>
   <div class="grain"/>        ← film-grain overlay
```
Global pieces sit in the layout, so they persist across page navigations and every page gets them for free.

### 2.3 Content is data
All copy lives in `content/content.ts` as typed arrays and objects (`profile`, `projects`, `stack`…). Components only *read* from it. That's why adding a project needs no component changes: the slider, the laptop textures, the case-study route and the sitemap all loop over `projects`.

### 2.4 Components talk through events
Some features are decoupled with tiny browser events instead of shared state:
- `preloader:done`: the Preloader fires this when it finishes, and the Hero listens and starts its headline reveal.
- `orb:click`: the Hero orb fires this on each click, and the EasterEgg counts them.
This keeps the components independent and easy to remove or replace.

---

## 3. Shared foundations

### 3.1 Motion tokens: `lib/motion.ts`
One place defines the "feel" of the whole site:
- `ease.out` = `power3.out`, `ease.expo` = `expo.out`, `ease.inOut` = `power3.inOut` (GSAP names)
- `bezier.*`: the *same* curves as cubic-bezier arrays for Framer Motion
- `dur.fast/base/slow` = 0.35s / 0.8s / 1.2s

**Why:** consistent easing is what makes motion feel designed rather than random. `expo.out` (very fast start, long gentle settle) is the signature curve used for most reveals.

### 3.2 Smooth scrolling: `providers/SmoothScroll.tsx`
- **Lenis** intercepts wheel/trackpad input and moves the page with inertia (`lerp: 0.1` means each frame it moves 10% of the remaining distance, giving a smooth glide).
- **Sync with GSAP:** `lenis.on("scroll", ScrollTrigger.update)` tells ScrollTrigger about every smooth-scroll frame, and Lenis is driven from GSAP's ticker (`gsap.ticker.add`) so both run on the **same animation frame**. Without this, scroll-linked animations would jitter.
- Lenis starts **stopped** until the preloader finishes (no scrolling during the counter).
- `scrollTo()` is a helper used by nav links, CTA buttons and "Back to top". It uses Lenis when available and native smooth scroll otherwise.
- **Reduced motion:** Lenis is not created at all, so native scrolling is used.

### 3.3 Sound engine: `lib/sound.ts` + `providers/SoundProvider.tsx`
- Uses the **Web Audio API**: an `OscillatorNode` (a pure tone generator) is passed through a `GainNode` (volume envelope: quick fade-in, exponential fade-out) and out to the speakers.
- Each effect is just a recipe: `hover` = 1800 Hz sine, 50 ms, very quiet · `click` = triangle wave sliding 520→260 Hz · `pop` = rising slide · `whoosh` = low sawtooth sweep · `success` = three-note arpeggio.
- **Why synthesized:** zero download size, instant playback, and on-brand "UI blips".
- **Browser autoplay rule:** browsers block audio until the user interacts, so the `AudioContext` is created lazily on the first sound after a click/keypress.
- Hover sounds are throttled (max one per 60 ms) so sweeping across buttons doesn't buzz.
- `SoundProvider` holds `muted` in React state, persists it to `localStorage`, and tells the engine. Default = unmuted. Reduced-motion users get no sound.
- `components/ui/UiSounds.tsx` uses **event delegation**: one listener on `window` plays hover/click for *any* `a`, `button`, `summary` or `[data-sfx]`, so individual buttons don't need sound code.

### 3.4 Custom cursor: `components/ui/Cursor.tsx`
- Two fixed elements: a small orange **dot** and a larger **ring**.
- `gsap.quickTo()` creates optimized setters for x/y. The dot follows almost instantly (0.08 s), while the ring lags behind (0.45 s), which creates the trailing "follower" feel.
- One `pointerover` listener inspects the element under the cursor:
  - inside a link/button → ring grows to 56 px with an orange tint
  - inside an element with `data-cursor="View"` (or `Drag`, `Next`…) → ring becomes a 96 px orange pill showing that label
- Press = ring shrinks to 85%.
- Only enabled when `(hover: hover) and (pointer: fine)` (a real mouse). The class `has-cursor` on `<html>` hides the system cursor. Touch devices keep native behaviour.

### 3.5 Magnetic buttons: `components/ui/Magnetic.tsx`
- Wraps any element. On `pointermove` it measures the distance from the element's centre and moves the element 35% of that distance toward the cursor; on leave it springs back.
- Uses `elastic.out` easing for the springy return. Mouse-only.

### 3.6 Custom scrollbar: `components/ui/ScrollBar.tsx`
- The native page scrollbar is hidden with CSS (`html.custom-scrollbar { scrollbar-width: none }`) only on mouse devices.
- A fixed track on the right with an orange thumb. On every scroll (batched with `requestAnimationFrame`), the thumb height = viewport ÷ page height, and its position = scroll progress.
- A `ResizeObserver` on `<body>` recalculates when the page grows (e.g. the accordion opens).
- Drag: pointer moves are converted to a scroll position and sent to Lenis with `immediate: true` (no lag while dragging). Click on the track = smooth glide.
- Hover widens it and shows a `%` badge. It fades to 40% opacity after 1.2 s idle.
- Inner scroll areas (textarea, mobile tabs) get native thin orange scrollbars from CSS (`scrollbar-color` + `::-webkit-scrollbar`).

### 3.7 Text reveals: `components/ui/TextReveal.tsx`
- Splits a string into words. Each word is wrapped in an `overflow: hidden` span (the "mask") with an inner span.
- GSAP animates the inner spans from `yPercent: 110` (hidden below the mask) to 0, staggered 0.06 s, triggered when the heading reaches 85% down the viewport (`ScrollTrigger start: "top 85%"`).
- The parent keeps an `aria-label` with the full sentence so screen readers read it normally.

### 3.8 Marquee: `components/ui/Marquee.tsx`
- Pure CSS: the word list is duplicated, laid out in one long row, and animated `translateX(0 → -50%)` on an infinite linear loop. Because the second half is identical to the first, the loop is seamless. No JavaScript at runtime.

### 3.9 Film grain: `.grain` in `app/globals.css`
- An inline SVG `feTurbulence` noise texture as a background on a fixed full-screen layer at 7% opacity, jittered with a stepped CSS animation. It adds analogue texture. `pointer-events: none` so it never blocks clicks.

---

## 4. Section by section

### 4.1 Preloader: `components/sections/Preloader.tsx`
**What you see:** "Dialing in…" with a giant 0→100% counter and a progress line, then an orange panel and a dark panel wipe upward to reveal the hero.

**How:**
1. On mount it locks scrolling (`overflow: hidden` + Lenis stopped).
2. A GSAP timeline tweens a plain object `{ v: 0 → 100 }` with `power2.inOut`. On every update it sets React state so the number and bar width redraw.
3. The text fades up (`autoAlpha: 0, y: -20`).
4. Both `.pl-panel` layers slide `yPercent: -100` with a 0.08 s stagger. The orange one sits *behind* the dark one, so you see a flash of orange as they part (the "curtain").
5. On complete it unlocks scroll, sets `sessionStorage` + `window.__smLoaded`, fires `preloader:done`, and removes itself.

**Why the variations:** first visit = 2.4 s; repeat visits in the same tab = 0.9 s (don't make people wait again); reduced motion = 0.2 s.

### 4.2 Top bar & mobile menu: `components/layout/TopBar.tsx`
- Fixed header over a dark gradient (readable over any background). Nav links have an underline that wipes in from the left on hover (`after:` pseudo-element `scale-x` with switching `transform-origin`).
- **Mobile:** an orange **Menu** button opens a full-screen overlay. It's revealed with a `clipPath: inset(0 0 100% 0) → inset(0 0 0% 0)` animation (a curtain dropping), and each link slides up from a mask with a stagger. Scroll is locked while it's open, and Esc closes it.
- Links call `scrollTo("#section")` on the home page; on other pages they navigate to `/#section`.

### 4.3 Hero: `components/sections/Hero.tsx` + `components/three/OrbScene.tsx`
**Headline:** each line sits in an `overflow-hidden` mask. On `preloader:done`, GSAP slides the lines up from `yPercent: 110` with `expo.out` (1.2 s, 0.1 s stagger), then fades in the tagline, badge and buttons.

**Scroll choreography:** a ScrollTrigger spans the hero (`start: "top top"` → `end: "bottom top"`, `scrub: true`). Its progress (0→1) is written into a React **ref** (`progress.current`) that the 3D scene reads every frame. A ref is used instead of state because state would re-render React 60 times a second; a ref is free. A second scrubbed tween drifts the headline up 18% and fades it to 20%.

**Sizing:** the headline uses `min(13.5vw, 21svh)` so the three lines always fit, whether the screen is wide (limited by height) or narrow (limited by width).

**The orb** is explained in detail in [§5.3](#53-the-hero-orb--componentsthreeorbscenetsx).

**Fallback:** if WebGL isn't available, a CSS radial-gradient circle is shown instead.

### 4.4 Projects: `components/sections/Projects.tsx`, `ProjectCard.tsx`, `components/three/LaptopScene.tsx`
**Slider track:** a horizontal `overflow-x: auto` row with CSS scroll-snap (`snap-x snap-mandatory`, cards `snap-center`).
- **Mouse drag-to-scroll:** on `pointerdown` it records the start X and `scrollLeft`; on `pointermove` it sets `scrollLeft = start − dx`. Snapping is disabled during the drag and restored after. If the pointer moved more than 6 px, the click that ends the drag is swallowed so a card doesn't open by accident.
- **Touch:** native swipe + snap (no custom code needed).
- **Prev/Next:** updates the active index and tweens `scrollLeft` with GSAP to centre that card.

**Card tilt (Framer Motion):** pointer position over the card (0→1 on each axis) is stored in `useMotionValue`s, mapped to rotation (`useTransform`: ±8° X, ±10° Y), and smoothed with `useSpring` (stiffness 200, damping 20). Motion values update without React re-renders, so it stays at 60 fps.

**Hover image swap:** two `next/image` layers stacked; the second has `opacity-0 → group-hover:opacity-100` and the first scales 105%. Pure CSS.

**Shared-element transition: `components/ui/SharedTransition.tsx`**
1. On click, it measures the card image (`getBoundingClientRect`) and **clones** it into a fixed-position element exactly on top.
2. GSAP expands the clone to full width × 70% of the viewport height at the top of the screen (the exact frame the case-study hero uses).
3. Then `router.push()` navigates. The new page renders its hero image in the same spot underneath.
4. `SharedElementCleanup` (in the layout) notices the path change and fades the clone out.
The result: the image appears to fly from the card into the new page. Ctrl/⌘-click still opens a normal new tab. Reduced motion skips the effect.

**The laptop:** see [§5.4](#54-the-project-laptop--componentsthreelaptopscenetsx).

**Cover art: `scripts/covers.mjs`**: Node script that writes SVG files: a coloured background, a motif drawn from basic shapes (`<rect>`, `<circle>`, `<path>`), and the title in big type. Two variants per project (main + hover), three rotating colour themes. SVG is used because it's tiny, sharp at any size (important for 4K), and needs no design tool. It also replaces screenshots, which can't be shown for company work.

### 4.5 Tech Stack: `components/sections/Stack.tsx` + `components/three/CansScene.tsx`
- **Tabs** follow the WAI-ARIA tabs pattern: `role="tablist"/"tab"/"tabpanel"`, arrow keys move between tabs, only the active tab is in the Tab order.
- **Panel transition:** `AnimatePresence mode="wait"` fades the old category out before the new one rises in. Items stagger in 0.05 s apart.
- **Cans:** see [§5.5](#55-the-tech-stack-cans--componentsthreecansscenetsx). Selecting a tab makes its can hop; grabbing a can selects its tab (two-way link via `active` / `onSelect` props).

### 4.6 Experience: `components/sections/Experience.tsx`
- **Pinning:** the left column uses CSS `position: sticky` (`lg:sticky lg:top-[18vh]`), so the heading stays put while the timeline scrolls. CSS sticky was chosen over GSAP pinning because it's simpler, never "jumps", and costs nothing.
- **Line draw:** an orange 1 px line with `transform-origin: top` is scrubbed from `scaleY: 0 → 1` across the list's scroll range.
- **Entry reveals:** each item gets its own ScrollTrigger timeline: title slides up from a mask, the text lines fade up in a stagger, and the dot pops in with `back.out(3)` (a slight overshoot "bounce").

### 4.7 FAQ: `components/sections/Faq.tsx`
- Each answer is wrapped in `AnimatePresence`; it animates `height: 0 → "auto"` and back. Framer Motion measures the real content height for you, which plain CSS can't animate to.
- The "+" icon is two bars; the vertical bar `scale-y-0`s to make a "−".
- Buttons have `aria-expanded` / `aria-controls`; answers are `role="region"` labelled by their question.

### 4.8 Contact: `components/sections/Contact.tsx`
- **Validation** runs on submit: name ≥ 2 chars, a valid email pattern, message ≥ 10 chars. Errors render under each field, are linked via `aria-describedby`, and focus jumps to the first invalid field. Typing in a field clears its error.
- **Spam protection:** a hidden "honeypot" field (`company`). Humans never see it; bots fill every field, so if it has a value the submit is silently ignored.
- **Sending:** `fetch` POST (JSON) to `https://formspree.io/f/<NEXT_PUBLIC_FORMSPREE_ID>`. Formspree emails you.
- **States:** idle → sending (button disabled, "Sending…") → done (orange "Submission received!" card + success chime) or error (mailto fallback shown).
- `NEXT_PUBLIC_` vars are inlined into the browser bundle at **build time**, which is why changing them on Vercel requires a redeploy.

### 4.9 Sticky CTA: `components/ui/StickyCta.tsx`
- Shows when `scrollY > 85%` of the viewport height (past the hero) **and** the contact section isn't visible (`IntersectionObserver`), so it never covers the form it points to.
- Slides in/out with Framer Motion. `env(safe-area-inset-bottom)` keeps it above the iPhone home bar.

### 4.10 Footer: `components/layout/Footer.tsx`
- The rotating badge is an SVG `<textPath>` laid along a circular path, spun with a CSS `animation: spin 14s linear infinite`. The "SM." mark sits static in the middle.

### 4.11 Easter egg: `components/ui/EasterEgg.tsx`
Three triggers:
- **Orb:** keeps timestamps of `orb:click` events; 5 within 3 s fires it.
- **Konami code / typed "dialed":** a rolling buffer of the last 10 keys and the last 6 letters, compared on every `keydown`. Ignored while typing in form fields.
- On fire: `canvas-confetti` is **dynamically imported** (so it costs nothing until used), three bursts in brand colours, success sound, and a modal (`role="dialog"`, `aria-modal`, Esc / click-outside to close, focus moved to the button and restored afterwards).
- A console hint is logged for developers who open DevTools.

### 4.12 Page transitions: `app/template.tsx`
A Next.js `template` re-mounts on every navigation (unlike `layout`). It wraps each page in a Framer Motion `div` that fades from `opacity 0, y 24` to its resting state.

---

## 5. How the 3D works

### 5.1 R3F in 60 seconds
- `<Canvas>` creates a WebGL renderer, a scene and a camera, and runs a render loop.
- Inside it, JSX tags map to Three.js objects: `<mesh>` = `THREE.Mesh`, `<icosahedronGeometry args={[1, 64]}/>` = `new THREE.IcosahedronGeometry(1, 64)`, `<meshStandardMaterial color="…"/>` = a physically-based material.
- `useFrame((state, delta) => …)` runs every frame (≈60×/s). That's where all the motion lives.
- `useThree()` gives access to the camera, viewport size (in 3D units) and `pointer` (cursor position normalized to −1…1).
- When the component unmounts, R3F automatically **disposes** geometries, materials and textures (frees GPU memory).

### 5.2 Techniques shared by all three scenes
- **`THREE.MathUtils.damp(current, target, lambda, delta)`:** frame-rate-independent easing. Every frame the value moves a fraction of the way to its target, so motion is smooth on 60 Hz and 144 Hz screens alike. This is how the orb follows the cursor and the laptop tilts.
- **Delta clamping** (`Math.min(dt, 1/30)`): if a tab was in the background, the first frame back doesn't cause a huge jump.
- **Lighting without downloads:** drei's `<Environment>` with `<Lightformer>`s builds a reflection map from glowing virtual panels *inside the scene*, instead of downloading an HDR image file. That's what gives the glossy highlights. Plus a key `directionalLight`, soft `ambientLight` and an orange `pointLight` rim.
- **Transparent canvases** (`alpha: true`) so the page background shows through.
- **Pixel ratio capped** with `dpr={[1, 2]}` (1.5 on touch) to avoid rendering 3×/4× pixels on high-density screens.
- **Rendering only when visible:** an `IntersectionObserver` switches the canvas `frameloop` to `"never"` offscreen (zero GPU cost). The laptop and cans canvases aren't even created until you scroll near them.
- **Global pointer for hero/laptop:** `eventSource={document.body}` lets the scene track the cursor even when text is layered over the canvas.

### 5.3 The hero orb: `components/three/OrbScene.tsx`
- **Geometry:** an icosahedron (a 20-sided ball) subdivided 64 times (24 on touch). The fine subdivision gives the distortion smooth curves to work with.
- **Material:** drei's `MeshDistortMaterial`, a standard PBR material whose vertex shader pushes each vertex in/out using animated **noise**, so the sphere wobbles like liquid. `distort` controls strength, `speed` the animation speed. Colour `#FF5B1F`, low roughness (0.15) = glossy, slight metalness.
- **Every frame (`useFrame`):**
  - **Position** damps toward `pointer × 0.6` (cursor follow) plus a scroll offset: as `progress` goes 0→1 the orb drifts right and down out of the hero.
  - **Rotation:** tilts against the cursor (parallax) and slowly spins on Y.
  - **Scale:** based on the visible viewport (so it fits every screen), shrinks 45% with scroll, +6% on hover, plus a decaying "punch" on click.
  - **Distortion** rises on hover, with scroll, and spikes on click (the jelly "boing").
- **`<Float>`** (drei) adds a gentle idle bob and sway.
- **Clicks** dispatch `orb:click` for the easter egg.
- **Phones:** orb centred behind the text, fewer subdivisions, lower pixel ratio. **Reduced motion:** no spin, no float, `frameloop="demand"` (renders only when something changes).

### 5.4 The project laptop: `components/three/LaptopScene.tsx`
- **Procedural model**, built from primitives rather than a downloaded model file:
  - Base: a `RoundedBox` (drei) 3.2 × 0.12 × 2.1 in dark metal.
  - Keyboard deck and trackpad: flat `planeGeometry`s laid on top.
  - An orange accent stripe on the front edge.
  - Lid: a group whose **pivot is the back edge** (the hinge), containing a thin `RoundedBox` shell and a screen plane.
- **Lid opening:** a ScrollTrigger in `Projects.tsx` maps section entry (top at 80% → 10% of viewport) to `open.current` 0→1. Each frame the lid's `rotation.x` damps toward `−open × 1.85 rad` (≈106°). The screen plane is pre-rotated so it faces down when closed and toward the camera when open.
- **Screen content:** `useTexture` preloads every project cover as a texture (colour space set to sRGB so colours match the page). The screen uses `meshBasicMaterial` with `toneMapped={false}`, so it's **unlit** and looks like a glowing display rather than a painted surface.
- **Switching projects:** when `active` changes, a `flash` value jumps to 1 and decays. The screen dims along a `sin(flash × π)` curve, and at the darkest moment the texture is swapped, giving a TV-style blink transition.
- **Idle motion:** tilts toward the cursor and bobs with a slow sine wave.

### 5.5 The tech-stack cans: `components/three/CansScene.tsx`
**Can model** (procedural):
- An **open-ended cylinder** (radius 0.85, height 2.3) for the body, plus two metallic `circleGeometry` lids and a `torusGeometry` rim.
- `thetaStart = π` rotates the texture's starting seam to the back, so the **centre of the label faces the camera**.

**Labels** are painted at runtime onto a hidden 1024 × 512 `<canvas>` with the 2D Canvas API (background colour, stripes, "SM. CODE CO.", the group name, the big `canLabel` text, small print), then turned into a `THREE.CanvasTexture`. Long words are **auto-fitted**: the text is measured with `measureText` and the font shrunk until it fits the camera-facing third of the can. Textures are disposed on unmount.

**Physics (Rapier, in WebAssembly):**
- `<Physics gravity={[0, -18, 0]}>`: stronger than real gravity so cans feel snappy at this scale.
- **Walls:** four invisible fixed `CuboidCollider`s (floor, ceiling, left, right) sized from the visible viewport, so cans can't leave the frame on any screen size.
- **Each can** is a `RigidBody` with a `CylinderCollider`, `restitution 0.35` (bounciness), `friction 1`, linear/angular damping (air resistance) so they settle instead of sliding forever.
- **2.5D constraint:** `enabledTranslations={[true, true, false]}` and `enabledRotations={[false, false, true]}`. Cans move only left/right/up/down and can only tip over sideways. This keeps them facing the camera and makes mouse dragging intuitive.
- **Drop-in:** cans spawn above the visible area, staggered, so they fall in one after another when the section first appears.

**Drag & flick:**
1. `pointerdown` on a can stores which can and the grab offset.
2. Every frame, a ray from the camera through the cursor is intersected with the z = 0 plane (`raycaster.ray.intersectPlane`) to get the cursor's 3D position.
3. Instead of teleporting the can, its **velocity** is set toward that point (`setLinvel((target − position) × 14)`). The can stays fully physical while held (it still collides with the others).
4. On release nothing is reset, so the can keeps its last velocity. That's the **flick**.

**Extras:** selecting a tab applies an upward impulse + spin (`applyImpulse`, `applyTorqueImpulse`). Hard impacts (`onContactForce` > threshold) play a tick sound. Physics pauses when offscreen.

**Touch / reduced motion:** no physics at all. The cans float gently in a row (`<Float>`) and tapping one selects its tab. This avoids fighting the page swipe on phones.

---

## 6. Responsiveness: phone to 4K TV

| Technique | Where | Effect |
| --- | --- | --- |
| **Fluid root font size** | `globals.css`: `html` is 14 px (≤360 px wide) · 16 px default · 18 px at 1920 · 24 px at 2560 · 34 px at 3840 | Everything sized in `rem` (padding, buttons, cards, body text) scales up on big screens and TVs automatically |
| **`clamp(min, preferred, max)`** | Most headings & spacing, e.g. `text-[clamp(3rem,9vw,16rem)]` | Type grows smoothly with the screen but never gets too small or too huge |
| **Viewport units** | Hero type `min(13.5vw, 21svh)`; `svh` for heights | Fits both wide and short screens; `svh` avoids mobile browser-bar jumps |
| **`.wrap` container** | Every section | Shared gutter `clamp(1.25rem, 4vw, 6rem)` and max width `160rem` |
| **Tailwind breakpoints** | `sm` 640 · `md` 768 · `lg` 1024 | Layouts switch from stacked (mobile) to multi-column (desktop) |
| **3D sizing from the viewport** | Orb scale, can spacing, walls | The 3D scales to fit any canvas size |
| **Input-aware features** | `(hover: hover) and (pointer: fine)` | Custom cursor, magnetic pull, custom scrollbar and can physics are mouse-only; touch gets native behaviour |

---

## 7. Performance techniques

- **Static generation:** all pages are pre-built HTML; nothing is computed per visit.
- **Code splitting:** each 3D scene is its own chunk (`next/dynamic`), so the first page load doesn't include Three.js scenes it doesn't need yet. Confetti is only fetched when the easter egg fires.
- **Lazy canvases + paused render loops** offscreen (see §5.2).
- **No large assets:** no 3D model files, no HDR files, no audio files, no photos. Covers are small SVGs, labels are drawn at runtime.
- **DPR cap** and lower geometry detail on touch devices.
- **Refs and motion values instead of React state** for anything updated every frame (scroll progress, tilt, drag), so there are no re-renders while animating.
- **`requestAnimationFrame` batching** for the scrollbar; throttled hover sounds.
- **`next/font`** self-hosts Anton + Inter with `display: swap`, so there's no external font request and no invisible text.
- **`next/image`** serves sized, lazy-loaded images.
- **GPU-friendly animation:** almost everything animates `transform` and `opacity`, the two properties browsers can animate without re-layout.

---

## 8. Accessibility

- **Skip link** ("Skip to content") is the first focusable element.
- **Semantic HTML:** `header`, `nav`, `main`, `section` with `aria-labelledby`, `article`, `footer`, ordered lists for the timeline.
- **Visible focus rings** (orange outline via `:focus-visible`) on everything interactive.
- **Keyboard:** all buttons and links are reachable. Stack tabs use arrow keys. FAQ, mobile menu and modal support Esc.
- **Screen readers:** decorative 3D canvases, marquees and the grain are `aria-hidden`. Split text keeps a full `aria-label`. The preloader is a live `role="status"`. Form errors are announced and linked to their fields.
- **`prefers-reduced-motion`:** native scroll, near-instant preloader, no orb spin, static cans, no shared-element animation, no confetti, no sound, CSS animations disabled.
- **Colour contrast:** off-white `#F2EDE4` on near-black `#0E0E0C` is ~16:1; orange is used for accents and large text.

---

## 9. SEO & sharing

| File | Purpose |
| --- | --- |
| `app/layout.tsx` → `metadata` | Title, description, keywords, canonical, Open Graph + Twitter card tags, robots |
| `app/layout.tsx` → `personLd` | **JSON-LD Person schema** (name, job, Kerala/IN, Netstratum, college, skills, social profiles) so Google understands who the site is about |
| `app/opengraph-image.tsx` | Generates the 1200×630 share image (PNG) at build time with `next/og`, the orange-on-dark card shown when the link is shared |
| `app/sitemap.ts` | `/sitemap.xml` listing the home page + every project page |
| `app/robots.ts` | `/robots.txt` allowing indexing and pointing to the sitemap |
| `app/icon.svg` | Favicon ("SM" + orange dot) |
| `app/not-found.tsx` | Branded 404 |
| `lib/site.ts` | Works out the public URL: `NEXT_PUBLIC_SITE_URL` → Vercel's production domain → localhost |
| `app/projects/[slug]/page.tsx` → `generateMetadata` | Unique title/description per project page |

---

## 10. Glossary

| Term | Meaning |
| --- | --- |
| **WebGL** | Browser API for GPU-accelerated graphics; what Three.js draws with |
| **Mesh / Geometry / Material** | A 3D object = its shape (geometry) + its surface look (material) |
| **PBR** | Physically-based rendering: materials defined by roughness/metalness that react realistically to light |
| **Shader** | A small program that runs on the GPU for each vertex/pixel (the orb's wobble is a vertex shader) |
| **Texture** | An image wrapped onto a 3D surface (the laptop screen, can labels) |
| **Rigid body / Collider** | In physics: the object that moves (body) and the invisible shape used for collisions (collider) |
| **Impulse** | An instant push applied to a physics body |
| **Scrub** | An animation whose progress is tied directly to scroll position (scroll back = animation reverses) |
| **Easing** | The acceleration curve of a motion (e.g. `expo.out` = fast start, slow finish) |
| **Lerp / damp** | Moving a value part of the way toward a target each frame for smooth follow |
| **DPR** | Device pixel ratio: how many physical pixels per CSS pixel (2 on Retina) |
| **Hydration** | React attaching interactivity to HTML that was pre-rendered on the server |
| **SSG** | Static site generation: pages built to HTML at build time |
| **Honeypot** | A hidden form field that only bots fill in, used to filter spam |
| **JSON-LD** | Structured data in a `<script>` tag that search engines read |
