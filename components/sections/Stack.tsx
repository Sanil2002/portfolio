"use client";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { familiar, stack } from "@/content/content";
import { bezier } from "@/lib/motion";
import { useIsTouch, useReducedMotion, useWebGL } from "@/lib/hooks";
import { TextReveal } from "@/components/ui/TextReveal";

const CansScene = dynamic(() => import("@/components/three/CansScene"), { ssr: false });

const cans = stack.map((g) => ({ id: g.id, label: g.canLabel, group: g.title }));

export function Stack() {
  const [active, setActive] = useState(stack[0].id);
  const touch = useIsTouch();
  const reduced = useReducedMotion();
  const webgl = useWebGL();
  const group = stack.find((g) => g.id === active)!;

  return (
    <section id="stack" aria-labelledby="stack-title" className="relative py-[clamp(5rem,12vh,14rem)]">
      <div className="wrap">
        <p className="mb-4 text-xs uppercase tracking-[0.3em] text-mute">Tech stack · {stack.length} blends</p>
        <TextReveal as="h2" text="REAL STACK. REAL PERFORMANCE." accent={["PERFORMANCE."]} className="display text-[clamp(3rem,9vw,16rem)]" />
        <p className="mt-6 max-w-[34rem] text-bone/70">
          Every can is a part of the stack I ship with. {touch ? "Tap a can or a category." : "Grab a can and flick it — or pick a category."}
        </p>
      </div>

      {/* Physics playground */}
      <div className="relative mt-8 h-[clamp(22rem,55vh,60rem)] w-full border-y border-bone/10 bg-[radial-gradient(ellipse_at_50%_100%,rgba(255,91,31,.12),transparent_60%)]" aria-hidden>
        {webgl ? <CansScene cans={cans} active={active} onSelect={setActive} staticMode={touch || reduced} /> : null}
      </div>

      <div className="wrap mt-[clamp(2rem,6vh,6rem)] grid gap-10 lg:grid-cols-[minmax(0,22rem)_1fr]">
        {/* Category list */}
        <div role="tablist" aria-label="Stack categories" aria-orientation="vertical" className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
          {stack.map((g, i) => {
            const on = g.id === active;
            return (
              <button
                key={g.id}
                role="tab"
                id={`tab-${g.id}`}
                aria-selected={on}
                aria-controls="stack-panel"
                onClick={() => setActive(g.id)}
                onKeyDown={(e) => {
                  const dir = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
                  if (!dir) return;
                  e.preventDefault();
                  const n = stack[(i + dir + stack.length) % stack.length];
                  setActive(n.id);
                  document.getElementById(`tab-${n.id}`)?.focus();
                }}
                tabIndex={on ? 0 : -1}
                className={`flex shrink-0 items-baseline gap-4 rounded-2xl px-5 py-4 text-left transition-colors ${on ? "bg-blaze text-ink" : "bg-ink-2 hover:bg-bone/10"}`}
              >
                <span className={`text-xs ${on ? "text-ink/70" : "text-mute"}`}>{String(i + 1).padStart(2, "0")}</span>
                <span className="display text-[clamp(1.6rem,2.4vw,3.5rem)]">{g.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active category */}
        <div id="stack-panel" role="tabpanel" aria-labelledby={`tab-${active}`} className="min-h-[18rem]">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.45, ease: bezier.expo }}
            >
              <p className="text-[clamp(1.2rem,2vw,2.6rem)] font-medium">{group.blurb}</p>
              <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                {group.items.map((it, k) => (
                  <motion.li
                    key={it.name}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * k, duration: 0.5, ease: bezier.expo }}
                    className="rounded-2xl border border-bone/10 p-5"
                  >
                    <p className="display text-[clamp(1.5rem,2vw,3rem)]">{it.name}</p>
                    <p className="mt-1 text-bone/70">{it.use}</p>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
          <p className="mt-8 text-sm text-mute">Also familiar with: {familiar.join(" · ")}</p>
        </div>
      </div>
    </section>
  );
}
