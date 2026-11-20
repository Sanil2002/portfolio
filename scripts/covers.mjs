// Generates on-brand cover art for every project into /public/covers.
// Company work can't show screenshots, so each project gets a typographic cover with a motif.
// Run: node scripts/covers.mjs
import { mkdirSync, writeFileSync } from "node:fs";

const INK = "#0e0e0c", BONE = "#f2ede4", BLAZE = "#ff5b1f";

// Motifs drawn in a 600x600 box, placed on the right of the cover.
const motifs = {
  grid: (c) => Array.from({ length: 5 }, (_, i) => Array.from({ length: 5 }, (_, j) =>
    `<rect x="${i * 120 + 10}" y="${j * 120 + 10}" width="100" height="100" rx="18" fill="${(i + j) % 3 === 0 ? c : "none"}" stroke="${c}" stroke-width="4"/>`).join("")).join(""),
  nodes: (c) => {
    const p = [[300, 300], [110, 120], [500, 110], [520, 470], [90, 480], [300, 60], [300, 540]];
    return p.slice(1).map(([x, y]) => `<line x1="300" y1="300" x2="${x}" y2="${y}" stroke="${c}" stroke-width="4"/>`).join("") +
      p.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i ? 34 : 90}" fill="${i ? "none" : c}" stroke="${c}" stroke-width="6"/>`).join("");
  },
  calendar: (c) => `<rect x="40" y="70" width="520" height="480" rx="40" fill="none" stroke="${c}" stroke-width="8"/><line x1="40" y1="180" x2="560" y2="180" stroke="${c}" stroke-width="8"/>` +
    Array.from({ length: 12 }, (_, k) => `<circle cx="${120 + (k % 4) * 120}" cy="${260 + Math.floor(k / 4) * 100}" r="26" fill="${k === 6 ? c : "none"}" stroke="${c}" stroke-width="5"/>`).join(""),
  code: (c) => `<text x="300" y="400" text-anchor="middle" font-family="Consolas, monospace" font-size="340" font-weight="700" fill="${c}">&lt;/&gt;</text>`,
  chat: (c) => `<rect x="30" y="80" width="400" height="230" rx="60" fill="${c}"/><path d="M110 300 L90 380 L190 305Z" fill="${c}"/><rect x="170" y="340" width="400" height="200" rx="60" fill="none" stroke="${c}" stroke-width="8"/><text x="230" y="225" text-anchor="middle" font-family="Impact, sans-serif" font-size="120" fill="${INK}">Q?</text>`,
  wave: (c) => Array.from({ length: 15 }, (_, i) => {
    const h = [80, 160, 260, 380, 300, 460, 220, 520, 340, 180, 420, 260, 140, 220, 90][i];
    return `<rect x="${i * 40}" y="${300 - h / 2}" width="22" height="${h}" rx="11" fill="${c}"/>`;
  }).join(""),
  mail: (c) => `<rect x="40" y="130" width="520" height="360" rx="36" fill="none" stroke="${c}" stroke-width="10"/><path d="M60 160 L300 340 L540 160" fill="none" stroke="${c}" stroke-width="10" stroke-linejoin="round"/><path d="M470 40 l20 50 50 20 -50 20 -20 50 -20 -50 -50 -20 50 -20z" fill="${c}"/>`,
};

const items = [
  ["rag-model-builder", "RAG MODEL BUILDER", "CONTEXT-AWARE AI", "nodes", 0],
  ["enterprise-network-intelligence-platform", "ENTERPRISE NETWORK INTELLIGENCE PLATFORM", "TELECOM OPS PORTAL", "grid", 1],
  ["bookncal", "BOOKNCAL", "MEETING SCHEDULER", "calendar", 2],
  ["code-explainer", "CODE EXPLAINER", "AI CODE WALKTHROUGHS", "code", 0],
  ["interview-practice", "INTERVIEW PRACTICE", "AI MOCK INTERVIEWS", "chat", 1],
  ["meeting-summarizer", "MEETING SUMMARIZER", "SPEECH → SUMMARY", "wave", 2],
  ["mailmind-ai", "MAILMIND AI", "AI EMAIL ASSISTANT", "mail", 0],
];

// Three alternating themes keep the slider rhythmic.
const themes = [
  { bg: BLAZE, fg: INK, motif: INK },
  { bg: "#1a1a17", fg: BONE, motif: BLAZE },
  { bg: BONE, fg: INK, motif: BLAZE },
];

mkdirSync("public/covers", { recursive: true });

items.forEach(([slug, title, sub, motif, t], n) => {
  for (const alt of [false, true]) {
    const th = alt ? { bg: themes[t].fg === INK ? INK : BLAZE, fg: themes[t].fg === INK ? BLAZE : INK, motif: themes[t].fg === INK ? BLAZE : INK } : themes[t];
    const words = title.split(" ");
    const size = title.length > 24 ? 118 : title.length > 12 ? 150 : 190;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000">
  <rect width="1600" height="1000" fill="${th.bg}"/>
  <g transform="translate(${alt ? 880 : 900} ${alt ? 220 : 200}) rotate(${alt ? -8 : 0} 300 300)" opacity="${alt ? 1 : 0.9}">${motifs[motif](th.motif)}</g>
  <text x="100" y="140" font-family="Arial, sans-serif" font-size="30" letter-spacing="10" fill="${th.fg}" fill-opacity=".7">${String(n + 1).padStart(2, "0")} — ${sub}</text>
  ${words.map((w, i) => `<text x="90" y="${880 - (words.length - 1 - i) * size * 0.92}" font-family="Impact, 'Arial Black', sans-serif" font-size="${size}" fill="${th.fg}">${w}</text>`).join("")}
</svg>`;
    writeFileSync(`public/covers/${slug}${alt ? "-alt" : ""}.svg`, svg);
  }
});
console.log(`covers written: ${items.length * 2}`);
