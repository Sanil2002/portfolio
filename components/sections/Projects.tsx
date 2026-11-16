"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useIsTouch, useReducedMotion, useWebGL } from "@/lib/hooks";
import { projects } from "@/content/content";
import { TextReveal } from "@/components/ui/TextReveal";
import { Magnetic } from "@/components/ui/Magnetic";
import { ProjectCard } from "./ProjectCard";

const LaptopScene = dynamic(() => import("@/components/three/LaptopScene"), { ssr: false });

// Featured project first.
const ordered = [...projects].sort((a, b) => Number(!!b.featured) - Number(!!a.featured));

export function Projects() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const open = useRef(0);
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  const touch = useIsTouch();
  const webgl = useWebGL();

  // Lid opens as the section scrolls in.
  useEffect(() => {
    if (reduced) { open.current = 1; return; }
    const st = ScrollTrigger.create({
      trigger: root.current,
      start: "top 80%",
      end: "top 10%",
      scrub: true,
      onUpdate: (s) => (open.current = s.progress),
    });
    return () => st.kill();
  }, [reduced]);

  // Mouse drag-to-scroll (touch uses native scroll).
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let down = false, startX = 0, startLeft = 0, moved = 0;
    const pd = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      down = true; moved = 0; startX = e.clientX; startLeft = el.scrollLeft;
      el.style.scrollSnapType = "none";
    };
    const pm = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      el.scrollLeft = startLeft - dx;
    };
    const pu = () => {
      if (!down) return;
      down = false;
      el.style.scrollSnapType = "";
    };
    // Swallow the click that ends a drag so cards don't open.
    const click = (e: MouseEvent) => { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } };
    el.addEventListener("pointerdown", pd);
    window.addEventListener("pointermove", pm);
    window.addEventListener("pointerup", pu);
    el.addEventListener("click", click, true);
    return () => {
      el.removeEventListener("pointerdown", pd);
      window.removeEventListener("pointermove", pm);
      window.removeEventListener("pointerup", pu);
      el.removeEventListener("click", click, true);
    };
  }, []);

  const go = (dir: 1 | -1) => {
    const next = (active + dir + ordered.length) % ordered.length;
    setActive(next);
    const card = track.current?.children[next] as HTMLElement | undefined;
    if (card && track.current) {
      gsap.to(track.current, {
        scrollLeft: card.offsetLeft - (track.current.clientWidth - card.clientWidth) / 2,
        duration: 0.8,
        ease: "power3.out",
      });
    }
  };

  return (
    <section ref={root} id="work" aria-labelledby="work-title" className="relative py-[clamp(5rem,12vh,14rem)]">
      <div className="wrap grid items-end gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-mute">Selected work · {ordered.length} projects</p>
          <TextReveal as="h2" text="THINGS I'VE SHIPPED." accent={["SHIPPED."]} className="display text-[clamp(3rem,9vw,16rem)]" />
          <p className="mt-6 max-w-[30rem] text-bone/70">
            AI tools I&apos;ve built on my own, plus production work shipped at Netstratum. Hover a card to load it on the screen.
          </p>
        </div>

        {/* 3D laptop showing the active project */}
        <div className="relative aspect-[4/3] w-full lg:aspect-[5/4]" aria-hidden>
          {webgl ? (
            <LaptopScene images={ordered.map((p) => p.image)} active={active} open={open} reduced={reduced} mobile={touch} />
          ) : null}
        </div>
      </div>

      <div className="wrap mt-[clamp(2rem,6vh,6rem)] flex items-center justify-between">
        <p className="text-sm text-mute" aria-live="polite">
          <span className="display text-2xl text-bone">{String(active + 1).padStart(2, "0")}</span> / {String(ordered.length).padStart(2, "0")} — {ordered[active].title}
        </p>
        <div className="flex gap-3">
          {([-1, 1] as const).map((d) => (
            <Magnetic key={d}>
              <button
                type="button"
                onClick={() => go(d)}
                aria-label={d < 0 ? "Previous project" : "Next project"}
                className="grid h-14 w-14 place-items-center rounded-full border border-bone/20 text-xl transition-colors hover:border-blaze hover:bg-blaze hover:text-ink"
              >
                {d < 0 ? "←" : "→"}
              </button>
            </Magnetic>
          ))}
        </div>
      </div>

      <div
        ref={track}
        data-cursor="Drag"
        className="mt-8 flex snap-x snap-mandatory gap-[clamp(1rem,2.5vw,3rem)] overflow-x-auto px-[clamp(1.25rem,4vw,6rem)] pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden select-none"
        style={{ perspective: 1200 }}
      >
        {ordered.map((p, i) => (
          <ProjectCard key={p.slug} project={p} index={i} active={i === active} onActive={() => setActive(i)} />
        ))}
        <div className="w-[10vw] shrink-0" aria-hidden />
      </div>
    </section>
  );
}
