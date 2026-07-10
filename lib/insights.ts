/* Rule-based, on-device "intelligence" (Intelligence Layer v1). No API key or
 * network needed, so the AI-off guarantee holds. Everything is labelled with
 * source "local-heuristic-v1" and stored with a confidence score. */

const STOP = new Set([
  "the", "a", "an", "and", "or", "but", "of", "to", "in", "on", "for", "with",
  "is", "are", "was", "were", "be", "been", "it", "this", "that", "these",
  "those", "i", "you", "we", "they", "he", "she", "as", "at", "by", "from",
  "so", "if", "then", "than", "too", "very", "can", "will", "just", "about",
  "into", "up", "out", "not", "no", "yes", "do", "does", "did", "have", "has",
  "had", "my", "your", "our", "their", "its", "me", "us", "them", "um", "uh",
]);

function sentences(text: string): string[] {
  return (text.match(/[^.!?\n]+[.!?]*/g) ?? [])
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Extractive summary: the 1–2 most keyword-dense sentences. */
export function summarise(body: string): string {
  const sents = sentences(body);
  if (sents.length <= 2) return body.trim();

  const freq = keywordFreq(body);
  const scored = sents.map((s) => {
    const words = s.toLowerCase().match(/[a-zà-ÿ']+/g) ?? [];
    const score = words.reduce((acc, w) => acc + (freq[w] ?? 0), 0) / (words.length || 1);
    return { s, score };
  });
  const top = [...scored]
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .sort((a, b) => sents.indexOf(a.s) - sents.indexOf(b.s))
    .map((x) => x.s);
  return top.join(" ");
}

function keywordFreq(body: string): Record<string, number> {
  const words = body.toLowerCase().match(/[a-zà-ÿ']{3,}/g) ?? [];
  const freq: Record<string, number> = {};
  for (const w of words) {
    if (STOP.has(w)) continue;
    freq[w] = (freq[w] ?? 0) + 1;
  }
  return freq;
}

/** Top keyword tags by frequency. */
export function extractTags(body: string, max = 5): string[] {
  const freq = keywordFreq(body);
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([w]) => w);
}

/** Retrieval-style answer: pull the sentences most relevant to the question. */
export function answerFromNote(body: string, question: string): string {
  const qWords = (question.toLowerCase().match(/[a-zà-ÿ']{3,}/g) ?? []).filter(
    (w) => !STOP.has(w),
  );
  const sents = sentences(body);
  if (!sents.length) return "This note is empty — nothing to answer from yet.";
  if (!qWords.length) return summarise(body);

  const scored = sents
    .map((s) => {
      const lower = s.toLowerCase();
      const score = qWords.reduce((acc, w) => acc + (lower.includes(w) ? 1 : 0), 0);
      return { s, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map((x) => x.s);

  if (!scored.length) {
    return "I couldn't find that in this note. Here's the gist instead: " + summarise(body);
  }
  return scored.join(" ");
}

export const INSIGHT_SOURCE = "local-heuristic-v1";
