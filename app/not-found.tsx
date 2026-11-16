import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="wrap flex min-h-[100svh] flex-col justify-center py-32">
      <p className="text-xs uppercase tracking-[0.3em] text-mute">Error 404</p>
      <h1 className="display mt-4 text-[clamp(4rem,16vw,28rem)]">
        NOT<br /><span className="text-blaze">DIALED.</span>
      </h1>
      <p className="mt-6 max-w-[30rem] text-lg text-bone/75">This page doesn&apos;t exist — but the rest of the portfolio does.</p>
      <Link href="/" className="mt-10 self-start rounded-full bg-blaze px-8 py-4 text-sm font-semibold uppercase tracking-widest text-ink transition-transform hover:scale-105">
        Back home →
      </Link>
    </main>
  );
}
