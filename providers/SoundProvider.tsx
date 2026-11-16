"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { setMuted } from "@/lib/sound";

const KEY = "sm-sound-muted";
const Ctx = createContext<{ muted: boolean; toggle: () => void }>({ muted: false, toggle: () => {} });

export function SoundProvider({ children }: { children: React.ReactNode }) {
  // Default: unmuted (sounds start after the first user gesture — browser rule).
  const [muted, setState] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(KEY) === "1";
    setState(saved);
    setMuted(saved);
  }, []);

  const toggle = useCallback(() => {
    setState((m) => {
      const next = !m;
      setMuted(next);
      localStorage.setItem(KEY, next ? "1" : "0");
      return next;
    });
  }, []);

  return <Ctx.Provider value={{ muted, toggle }}>{children}</Ctx.Provider>;
}

export const useSound = () => useContext(Ctx);
