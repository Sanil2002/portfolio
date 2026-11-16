"use client";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import type { Project } from "@/content/content";
import { useSharedNavigate } from "@/components/ui/SharedTransition";

type Props = { project: Project; index: number; onActive: () => void; active: boolean };

export function ProjectCard({ project, index, onActive, active }: Props) {
  const imgRef = useRef<HTMLDivElement>(null);
  const navigate = useSharedNavigate();
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [8, -8]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(mx, [0, 1], [-10, 10]), { stiffness: 200, damping: 20 });

  const href = `/projects/${project.slug}`;

  return (
    <motion.article
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1200 }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width);
        my.set((e.clientY - r.top) / r.height);
      }}
      onPointerEnter={onActive}
      onPointerLeave={() => { mx.set(0.5); my.set(0.5); }}
      onFocus={onActive}
      className="group w-[min(82vw,44rem)] shrink-0 snap-center"
    >
      <a
        href={href}
        data-cursor="View"
        draggable={false}
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey) return;
          e.preventDefault();
          navigate(href, imgRef.current);
        }}
        className="block rounded-[clamp(1rem,1.5vw,2rem)] outline-offset-4"
      >
        <div
          ref={imgRef}
          className={`relative aspect-[16/10] overflow-hidden rounded-[clamp(1rem,1.5vw,2rem)] bg-ink-2 ring-1 transition-[box-shadow] duration-500 ${active ? "ring-blaze" : "ring-bone/10"}`}
        >
          <Image src={project.image} alt={`${project.title} — cover art`} fill sizes="(max-width: 768px) 82vw, 44rem" className="object-cover transition-transform duration-700 ease-[var(--ease-expo)] group-hover:scale-105" draggable={false} />
          <Image src={project.imageHover} alt="" aria-hidden fill sizes="(max-width: 768px) 82vw, 44rem" className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100" draggable={false} />
          <span className="absolute left-4 top-4 rounded-full bg-ink/70 px-3 py-1 text-[0.7rem] uppercase tracking-[0.2em] backdrop-blur">
            {String(index + 1).padStart(2, "0")} · {project.context}
          </span>
          {project.featured && (
            <span className="absolute right-4 top-4 rounded-full bg-blaze px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-ink">Featured</span>
          )}
        </div>
        <div className="mt-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="display text-[clamp(2rem,3.5vw,5rem)]">{project.title}</h3>
            <p className="mt-2 max-w-[32rem] text-bone/75">{project.pitch}</p>
          </div>
          <span aria-hidden className="mt-2 grid h-12 w-12 shrink-0 place-items-center rounded-full border border-bone/20 transition-all duration-500 group-hover:rotate-[-45deg] group-hover:border-blaze group-hover:bg-blaze group-hover:text-ink">→</span>
        </div>
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Tech stack">
          {project.stack.slice(0, 5).map((s) => (
            <li key={s} className="rounded-full border border-bone/15 px-3 py-1 text-xs text-bone/70">{s}</li>
          ))}
        </ul>
      </a>
    </motion.article>
  );
}
