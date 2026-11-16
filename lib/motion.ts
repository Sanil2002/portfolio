/** Single source of truth for timing + easing. */
export const ease = {
  out: "power3.out",
  expo: "expo.out",
  inOut: "power3.inOut",
} as const;

/** Same curves as cubic-bezier arrays for Framer Motion. */
export const bezier = {
  out: [0.215, 0.61, 0.355, 1] as const,
  expo: [0.16, 1, 0.3, 1] as const,
  inOut: [0.645, 0.045, 0.355, 1] as const,
};

export const dur = { fast: 0.35, base: 0.8, slow: 1.2 } as const;
