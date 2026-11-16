"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { gsap } from "@/lib/gsap";
import { ease } from "@/lib/motion";
import { play } from "@/lib/sound";

const OVERLAY_ID = "shared-el";

/**
 * Shared-element route transition: clones the clicked image, expands it to the
 * detail page's hero frame (full width, 70svh, top), then navigates underneath.
 */
export function useSharedNavigate() {
  const router = useRouter();
  return (href: string, img: HTMLElement | null) => {
    if (!img || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return router.push(href);
    const r = img.getBoundingClientRect();
    const clone = img.cloneNode(true) as HTMLElement;
    clone.id = OVERLAY_ID;
    Object.assign(clone.style, {
      position: "fixed", left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px`,
      margin: "0", zIndex: "150", borderRadius: getComputedStyle(img).borderRadius, overflow: "hidden", pointerEvents: "none",
    });
    document.body.appendChild(clone);
    play("whoosh");
    gsap.to(clone, {
      left: 0, top: 0, width: window.innerWidth, height: window.innerHeight * 0.7, borderRadius: 0,
      duration: 0.8, ease: ease.inOut,
      onComplete: () => router.push(href),
    });
  };
}

/** Mounted once in the layout: fades the clone out after the new route paints. */
export function SharedElementCleanup() {
  const path = usePathname();
  useEffect(() => {
    const el = document.getElementById(OVERLAY_ID);
    if (!el) return;
    window.scrollTo(0, 0);
    gsap.to(el, { autoAlpha: 0, duration: 0.5, delay: 0.25, onComplete: () => el.remove() });
  }, [path]);
  return null;
}
