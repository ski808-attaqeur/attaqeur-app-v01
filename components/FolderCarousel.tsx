"use client";

import type { Folder } from "@/lib/types";
import { coverBackground, shortDateTime } from "@/lib/format";

type Props = {
  folders: Folder[];
  counts: Record<string, number>;
  activeId: string | null;
  loading: boolean;
  onSelect: (id: string) => void;
  onOpen: (id: string) => void;
  onCreate: () => void;
  onDelete: (folder: Folder) => void;
};

export default function FolderCarousel({
  folders,
  counts,
  activeId,
  loading,
  onSelect,
  onOpen,
  onCreate,
  onDelete,
}: Props) {
  if (loading) {
    return (
      <div className="no-scrollbar flex gap-4 overflow-x-auto px-6 py-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="skeleton h-40 w-56 shrink-0 rounded-3xl"
            aria-hidden
          />
        ))}
      </div>
    );
  }

  return (
    <div className="no-scrollbar flex snap-x gap-4 overflow-x-auto px-6 py-2">
      {folders.map((f) => {
        const active = f.id === activeId;
        return (
          <div
            key={f.id}
            className={`glass fade-in group relative flex h-40 w-56 shrink-0 snap-start cursor-pointer flex-col justify-between rounded-3xl p-4 transition-all ${
              active ? "ring-2 ring-white/80" : "hover:ring-1 hover:ring-white/40"
            }`}
            onClick={() => onSelect(f.id)}
            onDoubleClick={() => onOpen(f.id)}
          >
            <div
              className="h-12 w-12 rounded-2xl shadow-inner"
              style={{ background: coverBackground(f.cover_color) }}
            />
            <div>
              <div className="line-clamp-2 text-sm font-semibold leading-tight">
                {f.name}
              </div>
              <div className="mt-1 text-xs text-white/60">
                {counts[f.id] ?? 0} {(counts[f.id] ?? 0) === 1 ? "note" : "notes"} ·{" "}
                {shortDateTime(f.created_at)}
              </div>
            </div>

            <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                title="Open folder"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpen(f.id);
                }}
                className="glass-strong flex h-7 w-7 items-center justify-center rounded-full text-xs"
              >
                ↗
              </button>
              <button
                type="button"
                title="Delete folder"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(f);
                }}
                className="glass-strong flex h-7 w-7 items-center justify-center rounded-full text-xs text-red-200"
              >
                ✕
              </button>
            </div>
          </div>
        );
      })}

      {/* New folder card */}
      <button
        type="button"
        onClick={onCreate}
        className="glass flex h-40 w-40 shrink-0 snap-start flex-col items-center justify-center gap-2 rounded-3xl text-white/80 transition-all hover:ring-1 hover:ring-white/50"
      >
        <span className="text-3xl leading-none">＋</span>
        <span className="text-sm font-medium">New folder</span>
      </button>

      {folders.length === 0 && (
        <div className="glass flex h-40 flex-1 items-center justify-center rounded-3xl px-6 text-center text-sm text-white/70">
          No folders yet — create one, or just tap record and we&apos;ll make one
          for you.
        </div>
      )}
    </div>
  );
}
