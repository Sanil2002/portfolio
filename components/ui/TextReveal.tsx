"use client";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { ease } from "@/lib/motion";

type Props = {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  /** Highlight these words in the accent colour. */
  accent?: string[];
};

/** Word-by-word mask reveal triggered on scroll. */
export function TextReveal({ text, as: Tag = "h2", className = "", accent = [] }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.from(".tr-w", {
        yPercent: 110,
        duration: 1,
        ease: ease.expo,
        stagger: 0.06,
        scrollTrigger: { trigger: el, start: "top 85%" },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <Tag ref={ref as never} className={className} aria-label={text}>
      {text.split(" ").map((w, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.05em] align-bottom">
          <span className={`tr-w inline-block ${accent.includes(w) ? "text-blaze" : ""}`}>{w}&nbsp;</span>
        </span>
      ))}
    </Tag>
  );
}
