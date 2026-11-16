"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { ease } from "@/lib/motion";
import { useIsTouch, useReducedMotion, useWebGL } from "@/lib/hooks";
import { profile } from "@/content/content";
import { PRELOADER_DONE } from "@/components/sections/Preloader";
import { Magnetic } from "@/components/ui/Magnetic";
import { scrollTo } from "@/providers/SmoothScroll";

const OrbScene = dynamic(() => import("@/components/three/OrbScene"), { ssr: false });

export const ORB_CLICK = "orb:click";

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const reduced = useReducedMotion();
  const touch = useIsTouch();
  const webgl = useWebGL();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(".h-line", { yPercent: 110 });
      gsap.set(".h-fade", { autoAlpha: 0, y: 20 });

      const intro = () =>
        gsap
          .timeline()
          .to(".h-line", { yPercent: 0, duration: 1.2, ease: ease.expo, stagger: 0.1 })
          .to(".h-fade", { autoAlpha: 1, y: 0, duration: 0.8, ease: ease.out, stagger: 0.08 }, "-=0.7");

      if ((window as unknown as { __smLoaded?: boolean }).__smLoaded) intro();
      else window.addEventListener(PRELOADER_DONE, intro, { once: true });

      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (s) => (progress.current = s.progress),
      });

      // Headline drifts up + fades as you leave the hero.
      gsap.to(".h-title", {
        yPercent: -18,
        opacity: 0.2,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="top" aria-label="Intro" className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden">
      {/* 3D orb (or a static gradient fallback) */}
      <div className="absolute inset-0" aria-hidden>
        {webgl === false ? (
          <div className="absolute right-[-10%] top-1/2 aspect-square w-[min(70vw,70vh)] -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_35%_30%,#ffb18a,#ff5b1f_45%,#7a2405_80%)] opacity-90 blur-[2px]" />
        ) : webgl ? (
          <OrbScene progress={progress} reduced={reduced} mobile={touch} onOrbClick={() => window.dispatchEvent(new Event(ORB_CLICK))} />
        ) : null}
      </div>

      <div className="wrap pointer-events-none relative pb-[clamp(1.5rem,5vh,6rem)] pt-[clamp(5rem,12vh,10rem)]">
        <p className="h-fade mb-[2vh] text-[clamp(0.7rem,0.9vw,1rem)] uppercase tracking-[0.3em] text-mute">
          {profile.role} — {profile.location}
        </p>

        {/* Sized by BOTH width and height so 3 lines fit any screen: phone, laptop, TV. */}
        <h1 className="h-title display text-[min(19vw,19svh)] md:text-[min(13.5vw,21svh)]">
          {profile.heroLines.map((line, i) => (
            <span key={line} className="block overflow-hidden pb-[0.04em]">
              <span className={`h-line block ${i === profile.heroLines.length - 1 ? "text-blaze" : ""}`}>{line}</span>
            </span>
          ))}
        </h1>

        <div className="mt-[4vh] flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="h-fade max-w-[34rem]">
            <p className="text-[clamp(1.1rem,1.6vw,2rem)] font-medium">{profile.tagline}</p>
            <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-bone/15 px-4 py-2 text-xs uppercase tracking-[0.2em] text-bone/80">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blaze opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blaze" />
              </span>
              {profile.availability}
            </p>
          </div>

          <div className="h-fade pointer-events-auto flex items-center gap-4">
            <Magnetic>
              <button
                type="button"
                onClick={() => scrollTo("#work")}
                className="rounded-full bg-blaze px-8 py-4 text-sm font-semibold uppercase tracking-widest text-ink transition-transform hover:scale-105"
              >
                View work
              </button>
            </Magnetic>
            <Magnetic>
              <button
                type="button"
                onClick={() => scrollTo("#contact")}
                className="rounded-full border border-bone/25 px-8 py-4 text-sm font-semibold uppercase tracking-widest transition-colors hover:border-blaze hover:text-blaze"
              >
                Contact
              </button>
            </Magnetic>
          </div>
        </div>

        <div className="h-fade mt-[4vh] hidden items-center gap-3 text-xs uppercase tracking-[0.3em] text-mute md:flex" aria-hidden>
          <span className="block h-10 w-px origin-top animate-pulse bg-blaze" /> Scroll
        </div>
      </div>
    </section>
  );
}
