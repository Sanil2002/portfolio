# TODO — Sanil M portfolio

Things only you can do or decide. Everything else is built.

## Before deploying
- [ ] **Formspree**: create a form at https://formspree.io → copy its ID → set `NEXT_PUBLIC_FORMSPREE_ID` (in `.env.local` locally and in Vercel → Settings → Environment Variables).
- [ ] **Site URL**: after the first Vercel deploy, set `NEXT_PUBLIC_SITE_URL` to your real URL (e.g. `https://sanil-m.vercel.app`) so sitemap / Open Graph / canonical links are correct, then redeploy.
- [ ] **Instagram link**: open https://instagram.com/sanilalangad once and confirm it's your profile.

## Content to confirm (`content/content.ts`)
- [ ] `experience[0].achievements` — qualitative bullets I wrote from your projects. Replace with your own wording / real numbers if you have them.
- [ ] **Code Explainer** & **Interview Practice** `stack` — I only listed what the live sites show (Groq, Gemini, Vercel). Add the framework you used (Next.js? React?).
- [ ] **MailMind AI** — description says Gmail *and* Outlook (your wording); the repo README only mentions Gmail. Adjust if Outlook isn't shipped yet.
- [ ] Personal projects `role` is set to "Solo developer" — confirm.
- [ ] `featured: true` is on **RAG Model Builder**. Move it to another project if you prefer (featured always sorts first).
- [ ] `profile.bio` — drafted from your resume; edit freely.

## Optional upgrades
- [ ] Custom domain (Vercel → Settings → Domains), then update `NEXT_PUBLIC_SITE_URL`.
- [ ] Testimonials section — skipped because none were provided. Ask for one on LinkedIn; it can be added later.
- [ ] Real 3D models: the orb / laptop / cans are procedural (built in code, zero downloads). If you ever want a GLB model, compress it with Draco (`npx gltf-pipeline -i model.glb -o model-draco.glb -d`) and load with drei's `useGLTF`.
- [ ] Covers: restyle in `scripts/covers.mjs`, then `node scripts/covers.mjs`.
