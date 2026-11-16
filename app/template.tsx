"use client";
import { motion } from "framer-motion";
import { bezier } from "@/lib/motion";

/** Route transition: each page fades/rises in on navigation. */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: bezier.expo }}>
      {children}
    </motion.div>
  );
}
