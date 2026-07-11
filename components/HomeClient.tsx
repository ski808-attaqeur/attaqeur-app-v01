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
import Sidebar from "@/components/Sidebar";
import NotesGrid from "@/components/NotesGrid";
import NoteEditor from "@/components/NoteEditor";
import ConfirmModal from "@/components/ConfirmModal";

export default function HomeClient() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loadingFolders, setLoadingFolders] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const [activeNotes, setActiveNotes] = useState<Note[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);

  const [openNote, setOpenNote] = useState<Note | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<Folder | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const activeIdRef = useRef<string | null>(null);
  activeIdRef.current = activeId;
  const toast = useToast();

  useEffect(() => {
    getSupabase()
      .auth.getUser()
      .then(({ data }) => setUserEmail(data.user?.email ?? null));
  }, []);

  const refreshFolders = useCallback(async () => {
    try {
      const [fs, cs] = await Promise.all([listFolders(), countNotesByFolder()]);
      setFolders(fs);
      setCounts(cs);
      setError(null);
      setActiveId((prev) => prev ?? fs[0]?.id ?? null);
    } catch {
      setError("Couldn't load your folders. Check your connection and refresh.");
    } finally {
      setLoadingFolders(false);
    }
  }, []);

  const loadNotes = useCallback(async (folderId: string) => {
    setLoadingNotes(true);
    try {
      setActiveNotes(await listNotes(folderId));
    } catch {
      setActiveNotes([]);
    } finally {
      setLoadingNotes(false);
    }
  }, []);

  useEffect(() => {
    refreshFolders();
  }, [refreshFolders]);

  // Load notes whenever the active folder changes.
  useEffect(() => {
    if (activeId) loadNotes(activeId);
    else setActiveNotes([]);
  }, [activeId, loadNotes]);

  // Realtime: reflect changes from any device without a manual refresh.
  useEffect(() => {
    const supabase = getSupabase();
    const channel = supabase
      .channel("ide-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notes" },
        () => {
          void refreshFolders();
          if (activeIdRef.current) void loadNotes(activeIdRef.current);
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
  }, [refreshFolders, loadNotes]);

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
      setMobileNavOpen(false);
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
      toast("Folder and its notes deleted", "info");
      void refreshFolders();
    } catch {
      toast("Couldn't delete folder.", "error");
    }
  }

  async function createNoteInActive() {
    const folderId = await ensureActiveFolder();
    const note = await createNote({ folder_id: folderId });
    setActiveNotes((prev) => [note, ...prev]);
    setOpenNote(note);
    void refreshFolders();
  }

  async function onRecordedNote(note: Note) {
    setOpenNote(note);
    void refreshFolders();
    if (activeIdRef.current === note.folder_id) {
      void loadNotes(note.folder_id!);
    } else if (note.folder_id) {
      setActiveId(note.folder_id);
    }
  }

  async function signOut() {
    // Clear client-side session state, then hit the server route that can
    // delete the httpOnly auth cookies and redirect to /login.
    try {
      await getSupabase().auth.signOut();
    } catch {
      /* ignore — server route is the source of truth */
    }
    window.location.assign("/auth/signout");
  }

  function selectFolder(id: string) {
    setActiveId(id);
    setMobileNavOpen(false);
  }

  const activeFolder = folders.find((f) => f.id === activeId) ?? null;

  const sidebar = (
    <Sidebar
      folders={folders}
      counts={counts}
      activeId={activeId}
      userEmail={userEmail}
      loading={loadingFolders}
      onSelect={selectFolder}
      onCreate={onCreateFolder}
      onDelete={(f) => setFolderToDelete(f)}
      onSignOut={signOut}
      onHome={() => {
        if (folders[0]) setActiveId(folders[0].id);
        setMobileNavOpen(false);
      }}
    />
  );

  return (
    <div className="relative min-h-screen md:grid md:grid-cols-[264px_1fr]">
      <div className="app-bg" />

      {/* Desktop sidebar */}
      <aside className="glass-strong sticky top-0 hidden h-screen border-r border-white/15 md:block">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 md:hidden"
          onClick={() => setMobileNavOpen(false)}
        >
          <div
            className="glass-strong fade-in absolute left-0 top-0 h-full w-72 max-w-[82vw] border-r border-white/15"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebar}
          </div>
        </div>
      )}

      {/* Main column */}
      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open menu"
              className="glass flex h-10 w-10 items-center justify-center rounded-xl text-lg md:hidden"
            >
              ☰
            </button>
            <span className="wordmark text-2xl md:hidden">Idé.</span>
            <h1 className="hidden text-lg font-semibold text-white/90 md:block">
              {activeFolder
                ? activeFolder.name.replace("Folder · ", "")
                : "Your notes"}
            </h1>
          </div>
          <Clock />
        </header>

        {error && (
          <div className="mx-4 mb-2 rounded-2xl border border-amber-300/30 bg-amber-400/10 px-4 py-2 text-sm text-amber-100 sm:mx-6">
            {error}
          </div>
        )}

        <section className="flex flex-col items-center gap-6 px-4 py-8 sm:py-10">
          <RecordButton
            ensureActiveFolder={ensureActiveFolder}
            onNoteCreated={onRecordedNote}
          />
        </section>

        <section className="px-4 pb-20 sm:px-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-white/60">
              {activeFolder
                ? activeFolder.name.replace("Folder · ", "")
                : "Notes"}
            </h2>
            {activeFolder && (
              <span className="text-xs text-white/45">
                {activeNotes.length}{" "}
                {activeNotes.length === 1 ? "note" : "notes"}
              </span>
            )}
          </div>
          <NotesGrid
            notes={activeNotes}
            loading={loadingNotes || loadingFolders}
            onOpen={(n) => setOpenNote(n)}
            onCreate={createNoteInActive}
          />
        </section>
      </div>

      {openNote && (
        <NoteEditor
          note={openNote}
          folders={folders}
          onClose={() => setOpenNote(null)}
          onChanged={(n) => {
            setOpenNote(n);
            setActiveNotes((prev) => prev.map((x) => (x.id === n.id ? n : x)));
            void refreshFolders();
          }}
          onDeleted={(id) => {
            setOpenNote(null);
            setActiveNotes((prev) => prev.filter((x) => x.id !== id));
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
    </div>
  );
}
