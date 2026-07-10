"use client";

import type { Folder, Note } from "@/lib/types";
import { coverBackground, shortDateTime } from "@/lib/format";

type Props = {
  folder: Folder;
  notes: Note[];
  loading: boolean;
  onOpen: (note: Note) => void;
  onCreate: () => void;
  onClose: () => void;
};

export default function NoteListPanel({
  folder,
  notes,
  loading,
  onOpen,
  onCreate,
  onClose,
}: Props) {
  return (
    <div
      className="fixed inset-0 z-[70] flex justify-start bg-black/40"
      onClick={onClose}
    >
      <div
        className="glass-strong fade-in flex h-full w-full max-w-md flex-col p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-2xl"
              style={{ background: coverBackground(folder.cover_color) }}
            />
            <div>
              <h2 className="text-lg font-semibold leading-tight">{folder.name}</h2>
              <div className="text-xs text-white/55">
                {notes.length} {notes.length === 1 ? "note" : "notes"}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="glass flex h-9 w-9 items-center justify-center rounded-full text-lg"
            aria-label="Close folder"
          >
            ✕
          </button>
        </div>

        <button
          type="button"
          onClick={onCreate}
          className="mb-4 flex items-center justify-center gap-2 rounded-2xl bg-white/15 py-3 text-sm font-medium hover:bg-white/25"
        >
          ＋ New note
        </button>

        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          {loading ? (
            [0, 1, 2].map((i) => (
              <div key={i} className="skeleton h-20 rounded-2xl" aria-hidden />
            ))
          ) : notes.length === 0 ? (
            <div className="glass mt-6 rounded-2xl p-6 text-center text-sm text-white/70">
              No notes here yet. Tap “New note”, or record from the home screen.
            </div>
          ) : (
            notes.map((n) => (
              <button
                type="button"
                key={n.id}
                onClick={() => onOpen(n)}
                className="glass fade-in block w-full rounded-2xl p-4 text-left transition hover:ring-1 hover:ring-white/40"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/55">
                    {shortDateTime(n.created_at)}
                  </span>
                  <span className="text-xs uppercase text-white/40">
                    {n.language_code}
                  </span>
                </div>
                <p className="note-body mt-1 line-clamp-2 text-sm text-white/90">
                  {n.body.trim() || "(empty note)"}
                </p>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
