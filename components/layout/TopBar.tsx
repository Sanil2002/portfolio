"use client";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { profile, socials } from "@/content/content";
import { bezier } from "@/lib/motion";
import { getLenis, scrollTo } from "@/providers/SmoothScroll";
import { SoundToggle } from "@/components/ui/SoundToggle";
import { Magnetic } from "@/components/ui/Magnetic";

const nav = [
  { id: "work", label: "Work" },
  { id: "stack", label: "Stack" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
];

export function TopBar() {
  const onHome = usePathname() === "/";
  const [menu, setMenu] = useState(false);

  // Lock scroll + Esc to close while the mobile menu is open.
  useEffect(() => {
    if (!menu) return;
    getLenis()?.stop();
    document.documentElement.style.overflow = "hidden";
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    window.addEventListener("keydown", esc);
    return () => {
      getLenis()?.start();
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", esc);
    };
  }, [menu]);

  const go = (id: string) => (e: React.MouseEvent) => {
    setMenu(false);
    if (!onHome) return; // let Link navigate to /#id
    e.preventDefault();
    // Wait a frame so the scroll lock is released first.
    requestAnimationFrame(() => scrollTo(id === "top" ? 0 : `#${id}`));
  };

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 bg-gradient-to-b from-ink/85 via-ink/40 to-transparent [&_a]:pointer-events-auto [&_button]:pointer-events-auto">
        <div className="flex items-center justify-between px-[clamp(1.25rem,4vw,6rem)] py-5">
          <Magnetic>
            <Link href="/" onClick={go("top")} aria-label={`${profile.name} — home`} className="display block text-3xl">
              {profile.initials}<span className="text-blaze">.</span>
            </Link>
          </Magnetic>
          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex gap-8 text-xs uppercase tracking-[0.25em]">
              {nav.map((n) => (
                <li key={n.id}>
                  <Link href={`/#${n.id}`} onClick={go(n.id)} className="relative py-1 after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-right after:scale-x-0 after:bg-current after:transition-transform after:duration-500 hover:after:origin-left hover:after:scale-x-100">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-2">
            <SoundToggle />
            <button
              type="button"
              onClick={() => setMenu((m) => !m)}
              aria-expanded={menu}
              aria-controls="mobile-menu"
              className="flex h-10 items-center gap-2 rounded-full bg-blaze px-4 text-xs font-semibold uppercase tracking-[0.2em] text-ink md:hidden"
            >
              {menu ? "Close" : "Menu"}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menu && (
          <motion.div
            id="mobile-menu"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.7, ease: bezier.inOut }}
            className="fixed inset-0 z-40 flex flex-col justify-between bg-ink px-[clamp(1.25rem,4vw,6rem)] pb-10 pt-28 md:hidden"
          >
            <nav aria-label="Mobile">
              <ul>
                {nav.map((n, i) => (
                  <li key={n.id} className="overflow-hidden">
                    <motion.div initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ delay: 0.25 + i * 0.06, duration: 0.8, ease: bezier.expo }}>
                      <Link href={`/#${n.id}`} onClick={go(n.id)} className="display block py-1 text-[clamp(3.5rem,16vw,7rem)] active:text-blaze">
                        {n.label}<span className="text-blaze">.</span>
                      </Link>
                    </motion.div>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="space-y-4">
              <a href={`mailto:${profile.email}`} className="block text-lg">{profile.email}</a>
              <ul className="flex gap-5 text-sm uppercase tracking-[0.2em] text-mute">
                {socials.map((s) => <li key={s.label}><a href={s.href} target="_blank" rel="noreferrer">{s.label}</a></li>)}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
