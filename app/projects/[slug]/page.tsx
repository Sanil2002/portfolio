import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects, profile } from "@/content/content";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = projects.find((x) => x.slug === slug);
  if (!p) return {};
  return { title: `${p.title} — ${profile.name}`, description: p.pitch };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const i = projects.findIndex((x) => x.slug === slug);
  if (i < 0) notFound();
  const p = projects[i];
  const next = projects[(i + 1) % projects.length];

  return (
    <main id="main">
      {/* Same frame as the shared-element clone: full width, 70svh, top. */}
      <div className="relative h-[70svh] w-full overflow-hidden bg-ink-2">
        <Image src={p.image} alt={`${p.title} — cover art`} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
        {/* Mutes the cover's own title so it doesn't fight the page headline. */}
        <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/50 to-transparent" />
      </div>

      <article className="wrap -mt-[clamp(4rem,12vh,12rem)] relative pb-[clamp(5rem,12vh,12rem)]">
        <Link href="/#work" className="text-xs uppercase tracking-[0.3em] text-mute hover:text-blaze">← All work</Link>
        <h1 className="display mt-4 text-[clamp(3.5rem,12vw,20rem)]">{p.title}<span className="text-blaze">.</span></h1>
        <p className="mt-4 max-w-[48rem] text-[clamp(1.1rem,1.8vw,2.2rem)] text-bone/85">{p.pitch}</p>

        <dl className="mt-12 grid gap-8 border-y border-bone/10 py-8 sm:grid-cols-3">
          <div><dt className="text-xs uppercase tracking-[0.3em] text-mute">Role</dt><dd className="mt-2">{p.role}</dd></div>
          <div><dt className="text-xs uppercase tracking-[0.3em] text-mute">Context</dt><dd className="mt-2">{p.context}</dd></div>
          <div>
            <dt className="text-xs uppercase tracking-[0.3em] text-mute">Stack</dt>
            <dd className="mt-2 flex flex-wrap gap-2">
              {p.stack.map((s) => <span key={s} className="rounded-full border border-bone/15 px-3 py-1 text-xs">{s}</span>)}
            </dd>
          </div>
        </dl>

        <div className="mt-16 grid gap-12 lg:grid-cols-2">
          <section>
            <h2 className="display text-[clamp(2rem,4vw,6rem)]">The problem</h2>
            <p className="mt-4 text-lg text-bone/80">{p.problem}</p>
          </section>
          <section>
            <h2 className="display text-[clamp(2rem,4vw,6rem)]">What I built</h2>
            <ul className="mt-4 space-y-4">
              {p.solution.map((s) => (
                <li key={s} className="flex gap-3 text-lg text-bone/80"><span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-blaze" />{s}</li>
              ))}
            </ul>
          </section>
        </div>

        <div className="relative mt-16 aspect-[16/10] overflow-hidden rounded-[clamp(1rem,1.5vw,2rem)]">
          <Image src={p.imageHover} alt="" aria-hidden fill sizes="(max-width: 1024px) 100vw, 80vw" className="object-cover" />
        </div>

        {(p.liveUrl || p.githubUrl) && (
          <div className="mt-10 flex gap-4">
            {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noreferrer" className="rounded-full bg-blaze px-6 py-3 text-sm font-semibold uppercase tracking-widest text-ink">Live site ↗</a>}
            {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noreferrer" className="rounded-full border border-bone/25 px-6 py-3 text-sm font-semibold uppercase tracking-widest">GitHub ↗</a>}
          </div>
        )}

        <Link href={`/projects/${next.slug}`} data-cursor="Next" className="group mt-24 block border-t border-bone/10 pt-10">
          <p className="text-xs uppercase tracking-[0.3em] text-mute">Next project</p>
          <p className="display mt-2 text-[clamp(3rem,10vw,16rem)] transition-colors group-hover:text-blaze">{next.title} →</p>
        </Link>
      </article>
    </main>
  );
}
