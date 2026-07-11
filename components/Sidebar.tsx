"use client";

import type { Folder } from "@/lib/types";
import { coverBackground } from "@/lib/format";

type Props = {
  folders: Folder[];
  counts: Record<string, number>;
  activeId: string | null;
  userEmail: string | null;
  loading: boolean;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (folder: Folder) => void;
  onSignOut: () => void;
  onHome: () => void;
};

export default function Sidebar({
  folders,
  counts,
  activeId,
  userEmail,
  loading,
  onSelect,
  onCreate,
  onDelete,
  onSignOut,
  onHome,
}: Props) {
  return (
    <div className="flex h-full flex-col">
      <button
        type="button"
        onClick={onHome}
        className="px-5 pt-6 text-left"
        aria-label="Home"
      >
        <span className="wordmark text-3xl">Idé.</span>
      </button>

      <div className="mt-6 flex items-center justify-between px-5">
        <span className="text-xs font-semibold uppercase tracking-wide text-white/50">
          Folders
        </span>
        <button
          type="button"
          onClick={onCreate}
          title="New folder"
          className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-lg leading-none hover:bg-white/25"
        >
          ＋
        </button>
      </div>

      <nav className="mt-2 flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {loading ? (
          [0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton mx-2 h-11 rounded-xl" aria-hidden />
          ))
        ) : folders.length === 0 ? (
          <p className="px-4 py-6 text-center text-xs text-white/50">
            No folders yet. Tap ＋ or just record — we&apos;ll make one for you.
          </p>
        ) : (
          folders.map((f) => {
            const active = f.id === activeId;
            return (
              <div
                key={f.id}
                className={`group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition ${
                  active ? "bg-white/20" : "hover:bg-white/10"
                }`}
                onClick={() => onSelect(f.id)}
              >
                <span
                  className="h-6 w-6 shrink-0 rounded-lg"
                  style={{ background: coverBackground(f.cover_color) }}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {f.name.replace("Folder · ", "")}
                  </span>
                  <span className="block text-[11px] text-white/50">
                    {counts[f.id] ?? 0}{" "}
                    {(counts[f.id] ?? 0) === 1 ? "note" : "notes"}
                  </span>
                </span>
                <button
                  type="button"
                  title="Delete folder"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(f);
                  }}
                  className="hidden h-6 w-6 items-center justify-center rounded-full text-xs text-red-200 hover:bg-red-500/30 group-hover:flex"
                >
                  ✕
                </button>
              </div>
            );
          })
        )}
      </nav>

      <div className="border-t border-white/15 p-4">
        <div className="mb-2 truncate text-xs text-white/60" title={userEmail ?? ""}>
          {userEmail ?? "Signed in"}
        </div>
        <button
          type="button"
          onClick={onSignOut}
          className="w-full rounded-xl bg-white/10 py-2 text-sm font-medium text-white/85 hover:bg-white/20"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
