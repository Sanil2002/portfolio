import type { Metadata, Viewport } from "next";
import { Anton, Inter } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/providers/SmoothScroll";
import { SoundProvider } from "@/providers/SoundProvider";
import { profile, socials, stack } from "@/content/content";
import { Preloader } from "@/components/sections/Preloader";
import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";
import { Cursor } from "@/components/ui/Cursor";
import { UiSounds } from "@/components/ui/UiSounds";
import { SharedElementCleanup } from "@/components/ui/SharedTransition";
import { ScrollBar } from "@/components/ui/ScrollBar";
import { StickyCta } from "@/components/ui/StickyCta";
import { EasterEgg } from "@/components/ui/EasterEgg";

const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

import { siteUrl } from "@/lib/site";

const title = `${profile.name} — ${profile.role}`;
const description = `${profile.tagline} ${profile.bio[0]}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: title, template: `%s` },
  description,
  applicationName: `${profile.name} Portfolio`,
  authors: [{ name: profile.name, url: siteUrl }],
  keywords: [profile.name, profile.role, "React developer", "TypeScript", "Node.js", "AI", "Kerala", "India", "portfolio"],
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: siteUrl, siteName: profile.name, title, description, locale: "en_IN" },
  twitter: { card: "summary_large_image", title, description },
  robots: { index: true, follow: true },
};

// JSON-LD Person schema for search engines.
const personLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.role,
  url: siteUrl,
  email: `mailto:${profile.email}`,
  address: { "@type": "PostalAddress", addressRegion: "Kerala", addressCountry: "IN" },
  worksFor: { "@type": "Organization", name: "Netstratum Technologies" },
  alumniOf: { "@type": "CollegeOrUniversity", name: "Jawaharlal College of Engineering & Technology" },
  knowsAbout: stack.flatMap((g) => g.items.map((i) => i.name)),
  sameAs: socials.map((s) => s.href),
};

export const viewport: Viewport = { themeColor: "#0e0e0c" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${anton.variable} ${inter.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd).replace(/</g, "\\u003c") }} />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-blaze focus:px-4 focus:py-2 focus:text-ink"
        >
          Skip to content
        </a>
        <SoundProvider>
          <SmoothScroll>
            <Preloader />
            <TopBar />
            {children}
            <Footer />
          </SmoothScroll>
          <Cursor />
          <UiSounds />
          <SharedElementCleanup />
          <ScrollBar />
          <StickyCta />
          <EasterEgg />
        </SoundProvider>
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
