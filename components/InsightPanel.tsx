"use client";

import { useEffect, useState } from "react";
import type { AiInsight, Note } from "@/lib/types";
import { listInsights, saveInsight } from "@/lib/db";
import { summarise, extractTags, answerFromNote, INSIGHT_SOURCE } from "@/lib/insights";
import { useToast } from "@/components/Toast";

type ChatTurn = { role: "user" | "assistant"; text: string };

export default function InsightPanel({ note }: { note: Note }) {
  const [summary, setSummary] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [chat, setChat] = useState<ChatTurn[]>([]);
  const [q, setQ] = useState("");
  const toast = useToast();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const rows = await listInsights(note.id);
      if (cancelled) return;
      const s = rows.find((r) => r.insight_type === "summary");
      const t = rows.find((r) => r.insight_type === "tags");
      if (s) setSummary(s.value);
      if (t) setTags(t.value.split(",").map((x) => x.trim()).filter(Boolean));
      setChat(
        rows
          .filter((r) => r.insight_type === "chat_reply")
          .reverse()
          .flatMap((r): ChatTurn[] => [
            { role: "user", text: r.prompt ?? "" },
            { role: "assistant", text: r.value },
          ]),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [note.id]);

  async function generate() {
    if (!note.body.trim()) {
      toast("Add some content first.", "info");
      return;
    }
    setBusy(true);
    try {
      const s = summarise(note.body);
      const t = extractTags(note.body);
      setSummary(s);
      setTags(t);
      await Promise.all([
        saveInsight({
          note_id: note.id,
          insight_type: "summary",
          value: s,
          source: INSIGHT_SOURCE,
          confidence: 0.7,
        }),
        saveInsight({
          note_id: note.id,
          insight_type: "tags",
          value: t.join(", "),
          source: INSIGHT_SOURCE,
          confidence: 0.7,
        }),
      ]);
      toast("Insights generated ✓", "success");
    } finally {
      setBusy(false);
    }
  }

  async function ask() {
    const question = q.trim();
    if (!question) return;
    setQ("");
    setChat((c) => [...c, { role: "user", text: question }]);
    const reply = answerFromNote(note.body, question);
    setChat((c) => [...c, { role: "assistant", text: reply }]);
    await saveInsight({
      note_id: note.id,
      insight_type: "chat_reply",
      value: reply,
      source: INSIGHT_SOURCE,
      confidence: 0.6,
      prompt: question,
    });
  }

  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-white/90">AI insights</h4>
        <button
          type="button"
          onClick={generate}
          disabled={busy}
          className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium hover:bg-white/25 disabled:opacity-60"
        >
          {busy ? "Thinking…" : summary ? "Regenerate" : "Summarise"}
        </button>
      </div>

      {summary ? (
        <p className="mt-3 text-sm text-white/85">{summary}</p>
      ) : (
        <p className="mt-3 text-xs text-white/50">
          No summary yet — tap Summarise to extract the key point.
        </p>
      )}

      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-white/12 px-2.5 py-0.5 text-xs text-white/80"
            >
              #{t}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 border-t border-white/15 pt-3">
        <div className="mb-2 text-xs font-medium text-white/70">Ask this note</div>
        {chat.length > 0 && (
          <div className="mb-2 max-h-40 space-y-2 overflow-y-auto pr-1">
            {chat.map((turn, i) => (
              <div
                key={i}
                className={`rounded-xl px-3 py-1.5 text-sm ${
                  turn.role === "user"
                    ? "ml-6 bg-white/15 text-white"
                    : "mr-6 bg-black/20 text-white/85"
                }`}
              >
                {turn.text}
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && ask()}
            placeholder="e.g. What's the main action?"
            className="flex-1 rounded-full bg-white/10 px-3 py-1.5 text-sm outline-none placeholder:text-white/40"
          />
          <button
            type="button"
            onClick={ask}
            className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-black hover:bg-white"
          >
            Ask
          </button>
        </div>
      </div>
    </div>
  );
}
