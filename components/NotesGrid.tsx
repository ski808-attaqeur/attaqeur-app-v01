"use client";

import type { Note } from "@/lib/types";
import { shortDateTime } from "@/lib/format";

type Props = {
  notes: Note[];
  loading: boolean;
  onOpen: (note: Note) => void;
  onCreate: () => void;
};

export default function NotesGrid({ notes, loading, onOpen, onCreate }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-28 rounded-2xl" aria-hidden />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <button
        type="button"
        onClick={onCreate}
        className="glass flex min-h-28 flex-col items-center justify-center gap-1 rounded-2xl text-white/80 transition hover:ring-1 hover:ring-white/50"
      >
        <span className="text-2xl leading-none">＋</span>
        <span className="text-sm font-medium">New note</span>
      </button>

      {notes.length === 0 ? (
        <div className="glass col-span-full rounded-2xl p-6 text-center text-sm text-white/70 sm:col-span-1 xl:col-span-2">
          No notes here yet. Tap the record button above, or “New note”.
        </div>
      ) : (
        notes.map((n) => (
          <button
            type="button"
            key={n.id}
            onClick={() => onOpen(n)}
            className="glass fade-in flex min-h-28 flex-col rounded-2xl p-4 text-left transition hover:ring-1 hover:ring-white/40"
          >
            <div className="flex items-center justify-between text-xs text-white/50">
              <span>{shortDateTime(n.created_at)}</span>
              <span className="uppercase">{n.language_code}</span>
            </div>
            <p className="note-body mt-1 line-clamp-3 text-sm text-white/90">
              {n.body.trim() || "(empty note)"}
            </p>
          </button>
        ))
      )}
    </div>
  );
}
