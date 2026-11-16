"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { faqs } from "@/content/content";
import { bezier } from "@/lib/motion";
import { TextReveal } from "@/components/ui/TextReveal";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" aria-labelledby="faq-title" className="py-[clamp(5rem,12vh,14rem)]">
      <div className="wrap grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_1.1fr]">
        <div>
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-mute">FAQ</p>
          <TextReveal as="h2" text="SOME ANSWERS." accent={["ANSWERS."]} className="display text-[clamp(3rem,8vw,14rem)]" />
        </div>
        <ul className="divide-y divide-bone/10 border-y border-bone/10">
          {faqs.map((f, i) => {
            const on = open === i;
            return (
              <li key={f.q}>
                <h3>
                  <button
                    type="button"
                    id={`faq-q-${i}`}
                    aria-expanded={on}
                    aria-controls={`faq-a-${i}`}
                    onClick={() => setOpen(on ? null : i)}
                    className="flex w-full items-center justify-between gap-6 py-[clamp(1.25rem,2.5vh,2.5rem)] text-left"
                  >
                    <span className="text-[clamp(1.2rem,2vw,2.6rem)] font-medium">{f.q}</span>
                    <span
                      aria-hidden
                      className={`relative grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-colors duration-300 ${on ? "border-blaze bg-blaze text-ink" : "border-bone/20"}`}
                    >
                      <span className="absolute h-[2px] w-3.5 bg-current" />
                      <span className={`absolute h-3.5 w-[2px] bg-current transition-transform duration-300 ${on ? "scale-y-0" : ""}`} />
                    </span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {on && (
                    <motion.div
                      id={`faq-a-${i}`}
                      role="region"
                      aria-labelledby={`faq-q-${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: bezier.expo }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-[42rem] pb-8 text-bone/75">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
