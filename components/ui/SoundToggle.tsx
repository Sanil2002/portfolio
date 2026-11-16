"use client";
import { useSound } from "@/providers/SoundProvider";

/** Animated equaliser bars; flat when muted. */
export function SoundToggle() {
  const { muted, toggle } = useSound();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={!muted}
      aria-label={muted ? "Unmute sound effects" : "Mute sound effects"}
      className="group flex h-10 items-center gap-2 rounded-full border border-bone/20 px-4 text-xs uppercase tracking-[0.2em] transition-colors hover:border-blaze hover:text-blaze"
    >
      <span className="flex h-3 items-end gap-[2px]" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="w-[2px] rounded-full bg-current"
            style={{
              height: muted ? 2 : 12,
              animation: muted ? "none" : `eq 0.9s ${i * 0.12}s ease-in-out infinite alternate`,
            }}
          />
        ))}
      </span>
      <span className="hidden sm:inline">{muted ? "Sound off" : "Sound on"}</span>
      <style>{`@keyframes eq{0%{transform:scaleY(.25)}100%{transform:scaleY(1)}} [aria-pressed] span span{transform-origin:bottom}`}</style>
    </button>
  );
}
