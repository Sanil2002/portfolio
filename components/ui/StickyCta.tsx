"use client";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { contact, profile } from "@/content/content";
import { bezier } from "@/lib/motion";
import { scrollTo } from "@/providers/SmoothScroll";

/** Slim pill that appears after the hero and hides once the contact section is on screen. */
export function StickyCta() {
  const onHome = usePathname() === "/";
  const [past, setPast] = useState(false);
  const [atContact, setAtContact] = useState(false);

  useEffect(() => {
    const onScroll = () => setPast(window.scrollY > window.innerHeight * 0.85);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const c = document.getElementById("contact");
    const io = c ? new IntersectionObserver(([e]) => setAtContact(e.isIntersecting), { threshold: 0.1 }) : null;
    if (c && io) io.observe(c);
    return () => { window.removeEventListener("scroll", onScroll); io?.disconnect(); };
  }, [onHome]);

  const show = past && !atContact;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ duration: 0.6, ease: bezier.expo }}
          className="fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-[60] flex justify-center px-4"
        >
          <div className="flex w-full max-w-[40rem] items-center justify-between gap-4 rounded-full border border-bone/10 bg-ink-2/85 py-2 pl-6 pr-2 shadow-2xl shadow-black/40 backdrop-blur-md">
            <p className="flex min-w-0 items-center gap-3 text-sm">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blaze opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blaze" />
              </span>
              <span className="truncate"><span className="hidden sm:inline">{profile.availability} — </span>{contact.ctaLine}</span>
            </p>
            {onHome ? (
              <button type="button" onClick={() => scrollTo("#contact")} className="shrink-0 rounded-full bg-blaze px-5 py-3 text-xs font-semibold uppercase tracking-widest text-ink transition-transform hover:scale-105">
                Contact →
              </button>
            ) : (
              <Link href="/#contact" className="shrink-0 rounded-full bg-blaze px-5 py-3 text-xs font-semibold uppercase tracking-widest text-ink transition-transform hover:scale-105">
                Contact →
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
