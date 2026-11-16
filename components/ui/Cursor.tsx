"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Dot + ring follower. Any element with [data-cursor="Label"] shows that label;
 * links/buttons grow the ring. Disabled on touch / coarse pointers.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState("");
  const [hot, setHot] = useState(false);
  const [down, setDown] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) return;
    setEnabled(true);
    document.documentElement.classList.add("has-cursor");
    return () => document.documentElement.classList.remove("has-cursor");
  }, []);

  useEffect(() => {
    if (!enabled || !dot.current || !ring.current) return;
    const dx = gsap.quickTo(dot.current, "x", { duration: 0.08, ease: "power3" });
    const dy = gsap.quickTo(dot.current, "y", { duration: 0.08, ease: "power3" });
    const rx = gsap.quickTo(ring.current, "x", { duration: 0.45, ease: "power3" });
    const ry = gsap.quickTo(ring.current, "y", { duration: 0.45, ease: "power3" });

    const move = (e: PointerEvent) => {
      dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
    };
    const over = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      const labelled = t.closest<HTMLElement>("[data-cursor]");
      setLabel(labelled?.dataset.cursor ?? "");
      setHot(!!t.closest("a, button, [role=button], input, textarea, label, summary"));
    };
    const pd = () => setDown(true);
    const pu = () => setDown(false);
    const leave = () => gsap.to([dot.current, ring.current], { autoAlpha: 0, duration: 0.2 });
    const enter = () => gsap.to([dot.current, ring.current], { autoAlpha: 1, duration: 0.2 });

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerover", over);
    window.addEventListener("pointerdown", pd);
    window.addEventListener("pointerup", pu);
    document.addEventListener("pointerleave", leave);
    document.addEventListener("pointerenter", enter);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      window.removeEventListener("pointerdown", pd);
      window.removeEventListener("pointerup", pu);
      document.removeEventListener("pointerleave", leave);
      document.removeEventListener("pointerenter", enter);
    };
  }, [enabled]);

  if (!enabled) return null;

  const size = label ? 96 : hot ? 56 : 34;
  return (
    <>
      <div
        ref={ring}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[300] flex items-center justify-center rounded-full border transition-[width,height,background-color,border-color] duration-300 ease-[var(--ease-expo)]"
        style={{
          width: size,
          height: size,
          marginLeft: -size / 2,
          marginTop: -size / 2,
          transform: "translate3d(-100px,-100px,0)",
          borderColor: label ? "transparent" : "rgba(242,237,228,.5)",
          background: label ? "#ff5b1f" : hot ? "rgba(255,91,31,.12)" : "transparent",
          scale: down ? 0.85 : 1,
        }}
      >
        <span className="text-[11px] font-semibold uppercase tracking-widest text-ink">{label}</span>
      </div>
      <div
        ref={dot}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[301] -ml-[3px] -mt-[3px] h-[6px] w-[6px] rounded-full bg-blaze transition-opacity"
        style={{ transform: "translate3d(-100px,-100px,0)", opacity: label ? 0 : 1 }}
      />
    </>
  );
}
