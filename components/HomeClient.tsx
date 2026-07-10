"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Folder, Note } from "@/lib/types";
import {
  listFolders,
  countNotesByFolder,
  createFolder,
  deleteFolder,
  listNotes,
  createNote,
} from "@/lib/db";
import { getSupabase } from "@/lib/supabase/browser";
import { useToast } from "@/components/Toast";
import Clock from "@/components/Clock";
import RecordButton from "@/components/RecordButton";
import FolderCarousel from "@/components/FolderCarousel";
import NoteListPanel from "@/components/NoteListPanel";
import NoteEditor from "@/components/NoteEditor";
import ConfirmModal from "@/components/ConfirmModal";

export default function HomeClient() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loadingFolders, setLoadingFolders] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const [openFolderId, setOpenFolderId] = useState<string | null>(null);
  const [folderNotes, setFolderNotes] = useState<Note[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);

  const [openNote, setOpenNote] = useState<Note | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<Folder | null>(null);

  const activeIdRef = useRef<string | null>(null);
  activeIdRef.current = activeId;
  const toast = useToast();

  const refreshFolders = useCallback(async () => {
    try {
      const [fs, cs] = await Promise.all([listFolders(), countNotesByFolder()]);
      setFolders(fs);
      setCounts(cs);
      setError(null);
      setActiveId((prev) => prev ?? fs[0]?.id ?? null);
    } catch (e) {
      setError(
        e instanceof Error
          ? "Database not reachable yet. The app shell is live; data loads once the database is connected."
          : "Something went wrong.",
      );
    } finally {
      setLoadingFolders(false);
    }
  }, []);

  const refreshOpenFolderNotes = useCallback(async (folderId: string) => {
    setLoadingNotes(true);
    try {
      setFolderNotes(await listNotes(folderId));
    } catch {
      setFolderNotes([]);
    } finally {
      setLoadingNotes(false);
    }
  }, []);

  useEffect(() => {
    refreshFolders();
  }, [refreshFolders]);

  // Realtime: reflect inserts/updates/deletes without a manual refresh.
  useEffect(() => {
    const supabase = getSupabase();
    const channel = supabase
      .channel("ide-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notes" },
        () => {
          void refreshFolders();
          const open = openFolderIdRef.current;
          if (open) void refreshOpenFolderNotes(open);
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "folders" },
        () => void refreshFolders(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openFolderIdRef = useRef<string | null>(null);
  openFolderIdRef.current = openFolderId;

  async function ensureActiveFolder(): Promise<string> {
    if (activeIdRef.current) return activeIdRef.current;
    if (folders[0]) return folders[0].id;
    const f = await createFolder();
    setFolders((prev) => [f, ...prev]);
    setActiveId(f.id);
    return f.id;
  }

  async function onCreateFolder() {
    try {
      const f = await createFolder();
      setFolders((prev) => [f, ...prev]);
      setActiveId(f.id);
      toast("Folder created ✓", "success");
    } catch {
      toast("Couldn't create folder.", "error");
    }
  }

  async function confirmDeleteFolder() {
    const f = folderToDelete;
    if (!f) return;
    setFolderToDelete(null);
    try {
      await deleteFolder(f.id);
      setFolders((prev) => prev.filter((x) => x.id !== f.id));
      if (activeId === f.id) setActiveId(null);
      if (openFolderId === f.id) setOpenFolderId(null);
      toast("Folder and its notes deleted", "info");
      void refreshFolders();
    } catch {
      toast("Couldn't delete folder.", "error");
    }
  }

  async function openFolder(id: string) {
    setActiveId(id);
    setOpenFolderId(id);
    await refreshOpenFolderNotes(id);
  }

  async function createNoteInOpenFolder() {
    if (!openFolderId) return;
    const note = await createNote({ folder_id: openFolderId });
    setFolderNotes((prev) => [note, ...prev]);
    setOpenNote(note);
    void refreshFolders();
  }

  async function onRecordedNote(note: Note) {
    // Surface the fresh transcript immediately.
    setOpenNote(note);
    void refreshFolders();
    if (openFolderIdRef.current === note.folder_id) {
      void refreshOpenFolderNotes(note.folder_id!);
    }
  }

  const openFolder_ = folders.find((f) => f.id === openFolderId) ?? null;

  return (
    <main className="relative flex min-h-screen flex-col">
      <div className="app-bg" />

      {/* Top bar */}
      <header className="flex items-start justify-between px-6 pt-6">
        <div>
          <h1 className="wordmark text-5xl sm:text-6xl">Idé.</h1>
          <p className="mt-1 text-sm text-white/70">
            Speak your mind. We&apos;ll write it down.
          </p>
        </div>
        <Clock />
      </header>

      {error && (
        <div className="mx-6 mt-4 rounded-2xl border border-amber-300/30 bg-amber-400/10 px-4 py-2 text-sm text-amber-100">
          {error}
        </div>
      )}

      {/* Hero record */}
      <section className="flex flex-col items-center justify-center gap-6 py-10">
        <RecordButton
          ensureActiveFolder={ensureActiveFolder}
          onNoteCreated={onRecordedNote}
        />
      </section>

      {/* Folder carousel */}
      <section className="pb-16">
        <div className="mb-2 flex items-center justify-between px-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white/60">
            Folders
          </h2>
          {activeId && folders.length > 0 && (
            <button
              type="button"
              onClick={() => openFolder(activeId)}
              className="text-xs text-white/70 underline-offset-2 hover:underline"
            >
              Open active folder →
            </button>
          )}
        </div>
        <FolderCarousel
          folders={folders}
          counts={counts}
          activeId={activeId}
          loading={loadingFolders}
          onSelect={setActiveId}
          onOpen={openFolder}
          onCreate={onCreateFolder}
          onDelete={(f) => setFolderToDelete(f)}
        />
      </section>

      {openFolder_ && (
        <NoteListPanel
          folder={openFolder_}
          notes={folderNotes}
          loading={loadingNotes}
          onOpen={(n) => setOpenNote(n)}
          onCreate={createNoteInOpenFolder}
          onClose={() => setOpenFolderId(null)}
        />
      )}

      {openNote && (
        <NoteEditor
          note={openNote}
          folders={folders}
          onClose={() => setOpenNote(null)}
          onChanged={(n) => {
            setOpenNote(n);
            setFolderNotes((prev) =>
              prev.map((x) => (x.id === n.id ? n : x)),
            );
            void refreshFolders();
          }}
          onDeleted={(id) => {
            setOpenNote(null);
            setFolderNotes((prev) => prev.filter((x) => x.id !== id));
            void refreshFolders();
          }}
        />
      )}

      <ConfirmModal
        open={Boolean(folderToDelete)}
        title="Delete folder?"
        message={`This deletes “${folderToDelete?.name ?? ""}” and all notes inside it. This can't be undone.`}
        confirmLabel="Delete folder"
        danger
        onConfirm={confirmDeleteFolder}
        onCancel={() => setFolderToDelete(null)}
      />
    </main>
  );
}
