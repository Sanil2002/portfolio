"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { ease } from "@/lib/motion";
import { profile } from "@/content/content";
import { getLenis } from "@/providers/SmoothScroll";

export const PRELOADER_DONE = "preloader:done";

export function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = sessionStorage.getItem("sm-loaded") === "1";
    document.documentElement.style.overflow = "hidden";
    getLenis()?.stop();

    const finish = () => {
      document.documentElement.style.overflow = "";
      getLenis()?.start();
      sessionStorage.setItem("sm-loaded", "1");
      (window as unknown as { __smLoaded?: boolean }).__smLoaded = true;
      window.dispatchEvent(new Event(PRELOADER_DONE));
      setGone(true);
    };

    const obj = { v: 0 };
    const tl = gsap.timeline({ onComplete: finish });
    tl.to(obj, {
      v: 100,
      duration: reduce ? 0.2 : seen ? 0.9 : 2.4,
      ease: "power2.inOut",
      onUpdate: () => setCount(Math.round(obj.v)),
    })
      .to(".pl-fade", { autoAlpha: 0, y: -20, duration: 0.4, ease: ease.out, stagger: 0.05 })
      .to(".pl-panel", { yPercent: -100, duration: reduce ? 0.01 : 1, ease: ease.inOut, stagger: 0.08 }, "-=0.1");

    return () => {
      tl.kill();
      document.documentElement.style.overflow = "";
    };
  }, []);

  if (gone) return null;

  return (
    <div ref={root} className="fixed inset-0 z-[200]" role="status" aria-live="polite" aria-label={`Loading ${count}%`}>
      <div className="pl-panel absolute inset-0 bg-blaze" />
      <div className="pl-panel absolute inset-0 flex flex-col justify-between bg-ink p-6 md:p-12">
        <div className="pl-fade flex items-center justify-between text-xs uppercase tracking-[0.3em] text-mute">
          <span className="display text-2xl tracking-normal text-bone">{profile.initials}<span className="text-blaze">.</span></span>
          <span>{profile.preloaderLine}</span>
        </div>
        <div className="pl-fade">
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-mute">Dialing in…</p>
          <p className="display text-[32vw] leading-none md:text-[22vw]">
            {count}
            <span className="text-blaze">%</span>
          </p>
          <div className="mt-4 h-[2px] w-full bg-bone/10">
            <div className="h-full bg-blaze" style={{ width: `${count}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
