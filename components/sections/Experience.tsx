"use client";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { ease } from "@/lib/motion";
import { certifications, education, experience } from "@/content/content";
import { TextReveal } from "@/components/ui/TextReveal";

/** Left column pins (sticky) while the timeline scrolls; the line draws with scroll. */
export function Experience() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".xp-line", { scaleY: 0 }, {
        scaleY: 1, ease: "none",
        scrollTrigger: { trigger: ".xp-list", start: "top 70%", end: "bottom 60%", scrub: true },
      });
      gsap.utils.toArray<HTMLElement>(".xp-item").forEach((el) => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 80%" } });
        tl.from(el.querySelectorAll(".xp-mask > *"), { yPercent: 110, duration: 1, ease: ease.expo, stagger: 0.08 })
          .from(el.querySelectorAll(".xp-fade"), { autoAlpha: 0, y: 16, duration: 0.7, ease: ease.out, stagger: 0.06 }, "-=0.6")
          .from(el.querySelector(".xp-dot"), { scale: 0, duration: 0.5, ease: "back.out(3)" }, 0);
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="experience" aria-labelledby="xp-title" className="relative py-[clamp(5rem,12vh,14rem)]">
      <div className="wrap grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_1.1fr]">
        <div className="lg:sticky lg:top-[18vh] lg:self-start">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-mute">Experience & education</p>
          <TextReveal as="h2" text="WHERE I'VE BEEN BREWING." accent={["BREWING."]} className="display text-[clamp(3rem,8vw,14rem)]" />
        </div>

        <div className="xp-list relative pl-10 md:pl-14">
          <span className="absolute left-[7px] top-2 bottom-2 w-px bg-bone/10 md:left-[11px]" aria-hidden />
          <span className="xp-line absolute left-[7px] top-2 bottom-2 w-px origin-top bg-blaze md:left-[11px]" aria-hidden />

          <ol className="space-y-[clamp(3rem,8vh,8rem)]">
            {experience.map((j) => (
              <li key={j.company} className="xp-item relative">
                <span className="xp-dot absolute -left-10 top-2 h-4 w-4 rounded-full bg-blaze ring-4 ring-ink md:-left-14 md:h-6 md:w-6" aria-hidden />
                <p className="xp-fade text-xs uppercase tracking-[0.3em] text-blaze">{j.period}</p>
                <h3 className="xp-mask mt-2 overflow-hidden"><span className="display block text-[clamp(2.2rem,4.5vw,7rem)]">{j.company}</span></h3>
                <p className="xp-fade mt-1 text-lg text-bone/85">{j.role} · {j.domain}</p>
                <p className="xp-fade mt-4 max-w-[40rem] text-bone/70">{j.summary}</p>
                <ul className="mt-5 space-y-3">
                  {j.achievements.map((a) => (
                    <li key={a} className="xp-fade flex gap-3 text-bone/80"><span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blaze" />{a}</li>
                  ))}
                </ul>
              </li>
            ))}

            {education.map((e) => (
              <li key={e.school} className="xp-item relative">
                <span className="xp-dot absolute -left-10 top-2 h-4 w-4 rounded-full border-2 border-blaze bg-ink md:-left-14 md:h-6 md:w-6" aria-hidden />
                <p className="xp-fade text-xs uppercase tracking-[0.3em] text-mute">Education · {e.score}</p>
                <h3 className="xp-mask mt-2 overflow-hidden"><span className="display block text-[clamp(1.8rem,3.2vw,5rem)]">{e.school}</span></h3>
                <p className="xp-fade mt-1 text-bone/75">{e.degree} — {e.place}</p>
              </li>
            ))}

            <li className="xp-item relative">
              <span className="xp-dot absolute -left-10 top-2 h-4 w-4 rounded-full border-2 border-blaze bg-ink md:-left-14 md:h-6 md:w-6" aria-hidden />
              <p className="xp-fade text-xs uppercase tracking-[0.3em] text-mute">Certifications</p>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {certifications.map((c) => (
                  <li key={c.title} className="xp-fade rounded-2xl border border-bone/10 p-4">
                    <p className="font-medium">{c.title}</p>
                    <p className="text-sm text-mute">{c.issuer}</p>
                  </li>
                ))}
              </ul>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}
