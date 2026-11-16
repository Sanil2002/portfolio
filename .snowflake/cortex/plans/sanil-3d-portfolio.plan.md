# Plan: Sanil M — 3D Portfolio

## Folder structure (`c:\Users\Sanil\Desktop\portfolio`)
```
app/
  layout.tsx            fonts (Anton, Inter via next/font), metadata, JSON-LD Person, providers
  page.tsx              home: section composition
  projects/[slug]/page.tsx   case-study detail (static, generateStaticParams)
  opengraph-image.tsx   generated OG image (orange-on-dark)
  sitemap.ts, robots.ts
  template.tsx          route transition wrapper (Framer Motion)
content/
  content.ts            ALL copy + data, typed (Profile, Job, Project, StackGroup, Faq, Social)
lib/
  motion.ts             easing + duration tokens (expo.out, power3.out; fast/base/slow)
  gsap.ts               registers ScrollTrigger once
  sound.ts              tiny Web Audio sfx engine (hover/click/whoosh), synthesized — no audio files
  useReducedMotion.ts, useIsTouch.ts, useWebGL.ts
providers/
  SmoothScroll.tsx      Lenis ⇄ ScrollTrigger sync (disabled for reduced motion)
  SoundProvider.tsx     context: muted state (default unmuted, persisted in localStorage)
components/
  ui/       Cursor, MagneticButton, TextReveal (mask line reveal), Marquee, Grain, SkipLink, SoundToggle, StickyCta, Accordion
  layout/   TopBar (logo mark + sound toggle + nav), Footer (animated mark, back-to-top)
  sections/ Preloader, Hero, Projects (slider), Stack, Experience (pinned timeline), Faq, Contact
  three/    CanvasRoot (lazy, dpr [1,2], frameloop demand when offscreen),
            OrbScene (MeshDistortMaterial-style custom shader, cursor follow, scroll morph),
            LaptopScene (procedural low-poly laptop, screen texture = active project),
            CansScene (procedural cans w/ canvas-texture labels + @react-three/rapier physics, drag/flick),
            Fallback (static SVG/gradient when no WebGL)
  EasterEgg.tsx         Konami code OR 5 clicks on orb → confetti (canvas-confetti) + modal
public/placeholders/   labelled SVG project images
TODO.md, README.md
```

## Key decisions
- **3D models are procedural** (built from primitives in code), so no GLB/Draco assets are needed now; the loader path for Draco GLBs is ready if you supply models later.
- **Physics**: `@react-three/rapier` for the draggable cans (light, WASM).
- **Sound**: synthesized via Web Audio (no files, ~0kb), starts after the first interaction (browser rule), toggle in top bar.
- **Scroll**: Lenis drives scroll; GSAP ScrollTrigger handles pinning (Experience), scrubbed 3D transforms (orb), text reveals. Framer Motion only for UI micro-interactions + route/modal transitions (`layoutId` shared element card → detail page).
- **Mobile/touch**: cursor off, cans static (no physics), orb low-segment, DPR 1.
- **Reduced motion**: no Lenis, no pin, reveals become fades, 3D renders a single still frame.
- **Contact**: client-side validation (zod-lite manual), POST to `https://formspree.io/f/${NEXT_PUBLIC_FORMSPREE_ID}`, success state "Submission received!".
- **Perf**: canvases dynamically imported (`ssr:false`) + mounted via IntersectionObserver, disposed on unmount; each section owns its own canvas (only one active at a time).

## Page flow
Preloader (counter "Dialing in… 0→100%", SM mark, curtain exit) → Hero (stacked SANIL M. / BUILDS THINGS., orb) → Marquee → Projects slider + laptop → Marquee → Stack (5 groups + cans) → Experience (pinned timeline, education, certs) → FAQ → Contact (big headline, form, socials) → Footer. Sticky CTA pill after hero.

## Build order (review after each)
1. Scaffold + tokens + content.ts + providers
2. Preloader
3. Cursor + sound + top bar
4. Hero + orb
5. Projects + laptop + detail pages
6. Stack + cans
7. Experience
8. FAQ + contact + footer + sticky CTA
9. Easter egg
10. Polish: SEO, a11y, fallback, Lighthouse, TODO.md, README, deploy checklist

Run command each step: `npm run dev` → http://localhost:3000
