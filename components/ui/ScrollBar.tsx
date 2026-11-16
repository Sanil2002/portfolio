"use client";
import { useEffect, useRef, useState } from "react";
import { getLenis } from "@/providers/SmoothScroll";

/**
 * Themed page scrollbar (replaces the native one on pointer devices).
 * Slim track, blaze thumb, % readout; widens on hover; draggable + click-to-jump.
 */
export function ScrollBar() {
  const track = useRef<HTMLDivElement>(null);
  const thumb = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [pct, setPct] = useState(0);
  const [active, setActive] = useState(false);
  const hideT = useRef<number>(0);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    setEnabled(true);
    document.documentElement.classList.add("custom-scrollbar");
    return () => document.documentElement.classList.remove("custom-scrollbar");
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const t = track.current, th = thumb.current;
      if (!t || !th) return;
      const ratio = window.innerHeight / doc.scrollHeight;
      const h = Math.max(48, t.clientHeight * ratio);
      const p = max > 0 ? window.scrollY / max : 0;
      th.style.height = `${h}px`;
      th.style.transform = `translateY(${p * (t.clientHeight - h)}px)`;
      t.style.opacity = max > 0 ? "" : "0";
      setPct(Math.round(p * 100));
      // Show while scrolling, fade after idle.
      setActive(true);
      window.clearTimeout(hideT.current);
      hideT.current = window.setTimeout(() => setActive(false), 1200);
    };
    const req = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener("scroll", req, { passive: true });
    window.addEventListener("resize", req);
    const ro = new ResizeObserver(req);
    ro.observe(document.body);
    update();
    return () => {
      window.removeEventListener("scroll", req);
      window.removeEventListener("resize", req);
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  const scrollToRatio = (clientY: number, grabOffset: number) => {
    const t = track.current!, th = thumb.current!;
    const r = t.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (clientY - r.top - grabOffset) / (r.height - th.clientHeight)));
    const y = p * (document.documentElement.scrollHeight - window.innerHeight);
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(y, { immediate: true });
    else window.scrollTo(0, y);
  };

  const onDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const th = thumb.current!;
    const tr = th.getBoundingClientRect();
    // Hit-test by Y so the whole 12px-wide track grabs the thumb.
    const onThumb = e.clientY >= tr.top && e.clientY <= tr.bottom;
    const grab = onThumb ? e.clientY - tr.top : th.clientHeight / 2;
    if (!onThumb) {
      // Click on the track: glide there.
      const t = track.current!.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (e.clientY - t.top - grab) / (t.height - th.clientHeight)));
      const y = p * (document.documentElement.scrollHeight - window.innerHeight);
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(y, { duration: 1 }); else window.scrollTo({ top: y, behavior: "smooth" });
      return;
    }
    document.body.style.userSelect = "none";
    const move = (ev: PointerEvent) => scrollToRatio(ev.clientY, grab);
    const up = () => {
      document.body.style.userSelect = "";
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  if (!enabled) return null;

  return (
    <div
      ref={track}
      onPointerDown={onDown}
      aria-hidden
      className={`group fixed bottom-3 right-1.5 top-3 z-[120] w-3 transition-opacity duration-500 hover:opacity-100 ${active ? "opacity-100" : "opacity-40"}`}
    >
      <div className="absolute inset-y-0 right-1 w-[2px] rounded-full bg-bone/10 transition-all duration-300 group-hover:w-[6px]" />
      <div
        ref={thumb}
        className="absolute right-1 top-0 w-[2px] rounded-full bg-blaze transition-[width] duration-300 group-hover:w-[6px]"
      >
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-blaze px-2 py-0.5 text-[10px] font-semibold tabular-nums text-ink opacity-0 transition-opacity group-hover:opacity-100">
          {pct}%
        </span>
      </div>
    </div>
  );
}
