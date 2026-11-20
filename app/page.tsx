import { Hero } from "@/components/sections/Hero";
import { Projects } from "@/components/sections/Projects";
import { Stack } from "@/components/sections/Stack";
import { Experience } from "@/components/sections/Experience";
import { Faq } from "@/components/sections/Faq";
import { Contact } from "@/components/sections/Contact";
import { Marquee } from "@/components/ui/Marquee";
import { marquee, marquee2, marquee3 } from "@/content/content";

export default function Home() {
  return (
    <main id="main">
      <Hero />
      <Marquee items={marquee} accent />
      <Projects />
      <Marquee items={marquee2} reverse />
      <Stack />
      <Experience />
      <Marquee items={marquee3} accent />
      <Faq />
      <Contact />
    </main>
  );
}
