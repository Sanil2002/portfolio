"use client";
import { profile, socials } from "@/content/content";
import { scrollTo } from "@/providers/SmoothScroll";
import { Magnetic } from "@/components/ui/Magnetic";

/** Spinning circular text around the SM. mark. */
function Mark() {
  const text = "SANIL M · SOFTWARE DEVELOPER · BUILDS THINGS · ";
  return (
    <div className="relative h-28 w-28 md:h-36 md:w-36" aria-hidden>
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full animate-[spin_14s_linear_infinite]">
        <defs><path id="ring" d="M50,50 m-40,0 a40,40 0 1,1 80,0 a40,40 0 1,1 -80,0" /></defs>
        <text className="fill-bone/60" fontSize="8.4" letterSpacing="1.5">
          <textPath href="#ring">{text}</textPath>
        </text>
      </svg>
      <span className="display absolute inset-0 grid place-items-center text-3xl md:text-4xl">
        {profile.initials}<span className="text-blaze">.</span>
      </span>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-bone/10">
      <div className="wrap flex flex-col gap-10 py-12 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-6">
          <Mark />
          <div>
            <p className="display text-2xl">{profile.name}</p>
            <p className="text-sm text-mute">{profile.tagline}</p>
          </div>
        </div>
        <nav aria-label="Social">
          <ul className="flex flex-wrap gap-6 text-sm uppercase tracking-[0.2em]">
            {socials.map((s) => (
              <li key={s.label}><a href={s.href} target="_blank" rel="noreferrer" className="hover:text-blaze">{s.label}</a></li>
            ))}
          </ul>
        </nav>
        <Magnetic>
          <button
            type="button"
            onClick={() => scrollTo(0)}
            className="group flex items-center gap-3 rounded-full border border-bone/20 px-6 py-3 text-sm uppercase tracking-[0.2em] transition-colors hover:border-blaze hover:bg-blaze hover:text-ink"
          >
            Back to top <span aria-hidden className="transition-transform group-hover:-translate-y-1">↑</span>
          </button>
        </Magnetic>
      </div>
      <div className="wrap flex flex-col gap-2 border-t border-bone/10 py-6 text-xs text-mute sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} {profile.name}. All rights reserved.</p>
        <p>Designed & built by {profile.name} · {profile.location}</p>
      </div>
    </footer>
  );
}
