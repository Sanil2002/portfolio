/** Infinite ticker strip between sections. Pure CSS; pauses for reduced motion. */
export function Marquee({ items, reverse = false, accent = false }: { items: string[]; reverse?: boolean; accent?: boolean }) {
  const row = [...items, ...items];
  return (
    <div
      aria-hidden
      className={`relative overflow-hidden border-y py-[clamp(0.75rem,1.5vw,2rem)] ${accent ? "border-blaze bg-blaze text-ink" : "border-bone/10"}`}
    >
      <div className="flex w-max" style={{ animation: `marquee 30s linear infinite ${reverse ? "reverse" : ""}` }}>
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0">
            {row.map((t, i) => (
              <span key={i} className="display flex items-center px-[clamp(1rem,2vw,3rem)] text-[clamp(2rem,5vw,9rem)]">
                {t}
                <span className={`ml-[clamp(1rem,2vw,3rem)] inline-block h-[0.25em] w-[0.25em] rounded-full ${accent ? "bg-ink" : "bg-blaze"}`} />
              </span>
            ))}
          </div>
        ))}
      </div>
      <style>{`@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
    </div>
  );
}
