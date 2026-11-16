"use client";
/**
 * Tiny synthesized sound engine (Web Audio) — no audio files to download.
 * Browsers only allow audio after a user gesture, so the context is created lazily.
 */
type Sfx = "hover" | "click" | "whoosh" | "success" | "pop";

let ctx: AudioContext | null = null;
let muted = false;
let lastHover = 0;

export const setMuted = (m: boolean) => {
  muted = m;
};

function ac() {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, dur: number, type: OscillatorType, gain: number, slideTo?: number, delay = 0) {
  const c = ac();
  if (!c) return;
  const t = c.currentTime + delay;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

export function play(s: Sfx) {
  if (muted || typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  switch (s) {
    case "hover": {
      const now = performance.now();
      if (now - lastHover < 60) return; // throttle
      lastHover = now;
      return tone(1800, 0.05, "sine", 0.025);
    }
    case "click":
      return tone(520, 0.09, "triangle", 0.08, 260);
    case "pop":
      return tone(300, 0.12, "sine", 0.1, 900);
    case "whoosh":
      return tone(180, 0.6, "sawtooth", 0.025, 60);
    case "success":
      tone(660, 0.15, "triangle", 0.07);
      tone(880, 0.15, "triangle", 0.07, undefined, 0.1);
      tone(1320, 0.3, "triangle", 0.06, undefined, 0.2);
  }
}
