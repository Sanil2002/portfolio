"use client";
import { useEffect } from "react";
import { play } from "@/lib/sound";

/** Global, delegated hover/click sounds for interactive elements. */
export function UiSounds() {
  useEffect(() => {
    let lastEl: Element | null = null;
    const sel = "a, button, [role=button], summary, [data-sfx]";
    const over = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const el = (e.target as HTMLElement).closest(sel);
      if (el && el !== lastEl) play("hover");
      lastEl = el;
    };
    const click = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest(sel)) play("click");
    };
    window.addEventListener("pointerover", over);
    window.addEventListener("click", click);
    return () => {
      window.removeEventListener("pointerover", over);
      window.removeEventListener("click", click);
    };
  }, []);
  return null;
}
