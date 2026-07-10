const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

/** Auto folder name: "Folder · 14 Jul 2025 09:00" */
export function folderName(d: Date = new Date()): string {
  return `Folder · ${pad(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

/** Note auto-title: local ISO-like datetime "2025-07-14 09:05:00" */
export function noteTitle(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/** Friendly short date for note cards. */
export function shortDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${pad(d.getDate())} ${MONTHS[d.getMonth()]} · ${pad(d.getHours())}:${pad(
    d.getMinutes(),
  )}`;
}

/** Collapse ASR run-ons into readable paragraphs (Sprint 3 DoD: no wall of text). */
export function formatTranscript(raw: string): string {
  const text = raw.trim().replace(/\s+/g, " ");
  if (!text) return "";
  // Split into sentences, then group ~3 sentences per paragraph.
  const sentences = text.match(/[^.!?]+[.!?]*/g) ?? [text];
  const paras: string[] = [];
  let buf: string[] = [];
  for (const s of sentences) {
    buf.push(s.trim());
    if (buf.length >= 3) {
      paras.push(buf.join(" "));
      buf = [];
    }
  }
  if (buf.length) paras.push(buf.join(" "));
  return paras.join("\n\n");
}

const GRADIENTS: Record<string, string> = {
  "#7c3aed": "linear-gradient(135deg, #7c3aed, #a855f7)",
  "#0ea5e9": "linear-gradient(135deg, #0ea5e9, #38bdf8)",
  "#10b981": "linear-gradient(135deg, #10b981, #34d399)",
  "#f59e0b": "linear-gradient(135deg, #f59e0b, #fbbf24)",
  "#ef4444": "linear-gradient(135deg, #ef4444, #f87171)",
  "#ec4899": "linear-gradient(135deg, #ec4899, #f472b6)",
};

export const COVER_COLORS = Object.keys(GRADIENTS);

export function coverBackground(color: string): string {
  return GRADIENTS[color] ?? `linear-gradient(135deg, ${color}, ${color})`;
}

export function randomCover(): string {
  return COVER_COLORS[Math.floor(Math.random() * COVER_COLORS.length)];
}

/** Basic RTL detection for the 50+ language display requirement. */
const RTL = /[֐-׿؀-ۿ܀-ݏݐ-ݿࢠ-ࣿ]/;
export function dirFor(text: string): "rtl" | "ltr" {
  return RTL.test(text) ? "rtl" : "ltr";
}

export function wordCount(text: string): number {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}
