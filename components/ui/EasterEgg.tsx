"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { easterEgg } from "@/content/content";
import { bezier } from "@/lib/motion";
import { play } from "@/lib/sound";
import { ORB_CLICK } from "@/components/sections/Hero";

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
const WORD = "dialed";

/**
 * Three hidden triggers: click the hero orb 5× quickly, the Konami code, or type "dialed".
 * Fires confetti + a modal.
 */
export function EasterEgg() {
  const [open, setOpen] = useState(false);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  const fire = useCallback(async () => {
    lastFocus.current = document.activeElement as HTMLElement;
    setOpen(true);
    play("success");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const confetti = (await import("canvas-confetti")).default;
    const colors = ["#ff5b1f", "#f2ede4", "#ffb18a"];
    const shot = (x: number, angle: number) =>
      confetti({ particleCount: 90, spread: 70, angle, startVelocity: 55, origin: { x, y: 0.75 }, colors, zIndex: 400, disableForReducedMotion: true });
    shot(0.1, 60);
    shot(0.9, 120);
    setTimeout(() => confetti({ particleCount: 140, spread: 120, origin: { y: 0.4 }, colors, zIndex: 400, scalar: 1.2 }), 250);
  }, []);

  // Orb: 5 clicks within 3s.
  useEffect(() => {
    let clicks: number[] = [];
    const on = () => {
      const now = Date.now();
      clicks = [...clicks.filter((t) => now - t < 3000), now];
      if (clicks.length >= 5) { clicks = []; fire(); }
    };
    window.addEventListener(ORB_CLICK, on);
    return () => window.removeEventListener(ORB_CLICK, on);
  }, [fire]);

  // Konami code or typed word (ignored while typing in form fields).
  useEffect(() => {
    let seq: string[] = [];
    let typed = "";
    const on = (e: KeyboardEvent) => {
      const t = e.target;
      if (t instanceof Element && t.closest("input, textarea, [contenteditable]")) return;
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      seq = [...seq, k].slice(-KONAMI.length);
      typed = (typed + (k.length === 1 ? k : "")).slice(-WORD.length);
      if (seq.join() === KONAMI.join() || typed === WORD) { seq = []; typed = ""; fire(); }
    };
    window.addEventListener("keydown", on);
    // A hint for the curious ones who open DevTools.
    console.log("%cpsst — ↑ ↑ ↓ ↓ ← → ← → B A", "color:#ff5b1f;font:600 14px monospace");
    return () => window.removeEventListener("keydown", on);
  }, [fire]);

  // Modal: Esc to close, focus management.
  useEffect(() => {
    if (!open) return;
    closeBtn.current?.focus();
    const on = (e: KeyboardEvent) => { if (e.key === "Escape" || e.key === "Tab") { e.preventDefault(); if (e.key === "Escape") setOpen(false); } };
    window.addEventListener("keydown", on);
    return () => { window.removeEventListener("keydown", on); lastFocus.current?.focus?.(); };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[350] grid place-items-center bg-ink/70 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="egg-title"
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 40, scale: 0.9, rotate: -3, opacity: 0 }}
            animate={{ y: 0, scale: 1, rotate: 0, opacity: 1 }}
            exit={{ y: 20, scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.6, ease: bezier.expo }}
            className="relative w-full max-w-[34rem] rounded-[2rem] bg-blaze p-[clamp(1.75rem,4vw,3.5rem)] text-ink"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.3em]">Easter egg unlocked</p>
            <h2 id="egg-title" className="display mt-3 text-[clamp(2.75rem,6vw,6rem)]">{easterEgg.title}</h2>
            <p className="mt-4 text-lg">{easterEgg.body}</p>
            <button
              ref={closeBtn}
              type="button"
              onClick={() => setOpen(false)}
              className="mt-8 rounded-full bg-ink px-7 py-4 text-sm font-semibold uppercase tracking-widest text-blaze transition-transform hover:scale-105"
            >
              Nice, back to it
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
