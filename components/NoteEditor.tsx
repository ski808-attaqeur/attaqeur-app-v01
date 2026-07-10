"use client";

import { useEffect, useRef, useState } from "react";
import type { Folder, Note, NoteImage, Recording } from "@/lib/types";
import {
  updateNote,
  deleteNote,
  listNoteImages,
  createNoteImage,
  deleteNoteImage,
  listRecordings,
  createRecording,
  ensureShareToken,
  copyNoteToFolder,
} from "@/lib/db";
import { uploadToBucket } from "@/lib/storage";
import { publicUrl } from "@/lib/supabase/browser";
import { startCapture, type CaptureHandle } from "@/lib/speech";
import { dirFor, formatTranscript, shortDateTime, wordCount } from "@/lib/format";
import { useToast } from "@/components/Toast";
import ConfirmModal from "@/components/ConfirmModal";
import InsightPanel from "@/components/InsightPanel";

type Props = {
  note: Note;
  folders: Folder[];
  onClose: () => void;
  onChanged: (note: Note) => void;
  onDeleted: (id: string) => void;
};

export default function NoteEditor({
  note,
  folders,
  onClose,
  onChanged,
  onDeleted,
}: Props) {
  const [body, setBody] = useState(note.body);
  const [saved, setSaved] = useState(true);
  const [images, setImages] = useState<NoteImage[]>([]);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [recording, setRecording] = useState(false);
  const [appending, setAppending] = useState(false);
  const captureRef = useRef<CaptureHandle | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toast = useToast();

  useEffect(() => {
    setBody(note.body);
    setSaved(true);
    listNoteImages(note.id).then(setImages);
    listRecordings(note.id).then(setRecordings);
  }, [note.id, note.body]);

  const needsReview = recordings.some(
    (r) => r.transcript_review_status === "needs_review",
  );

  function scheduleSave(next: string) {
    setBody(next);
    setSaved(false);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => void persist(next), 700);
  }

  async function persist(next: string) {
    try {
      await updateNote(note.id, { body: next });
      setSaved(true);
      onChanged({ ...note, body: next });
    } catch {
      toast("Couldn't save — check your connection.", "error");
    }
  }

  async function startAppendRecording() {
    try {
      captureRef.current = await startCapture();
      setRecording(true);
    } catch {
      toast("Microphone permission needed.", "error");
    }
  }

  async function stopAppendRecording() {
    const handle = captureRef.current;
    if (!handle) return;
    setRecording(false);
    setAppending(true);
    try {
      const result = await handle.stop();
      captureRef.current = null;
      const addition = result.transcript.trim()
        ? formatTranscript(result.transcript)
        : "[transcription pending]";
      const next = body.trim() ? `${body.trim()}\n\n${addition}` : addition;
      await persist(next);
      setBody(next);

      let storagePath = "recordings/local/no-audio";
      if (result.audio) {
        const uploaded = await uploadToBucket("recordings", result.audio, "webm");
        if (uploaded) storagePath = uploaded;
      }
      const rec = await createRecording({
        note_id: note.id,
        storage_path: storagePath,
        duration_seconds: result.durationSeconds,
        transcript: result.transcript || null,
        transcript_source: result.transcript ? result.source : null,
        transcript_confidence: result.confidence,
        review_status:
          result.confidence !== null && result.confidence < 0.6
            ? "needs_review"
            : "unreviewed",
      });
      if (rec) setRecordings((r) => [...r, rec]);
      toast("Recording appended ✓", "success");
    } finally {
      setAppending(false);
    }
  }

  async function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const ext = file.name.split(".").pop() || "png";
    const path = await uploadToBucket("note-images", file, ext);
    if (!path) {
      toast("Image upload unavailable (storage not reachable).", "error");
      return;
    }
    const row = await createNoteImage(note.id, path);
    if (row) {
      setImages((imgs) => [...imgs, row]);
      toast("Image added ✓", "success");
    }
  }

  async function removeImage(img: NoteImage) {
    setImages((imgs) => imgs.filter((x) => x.id !== img.id));
    await deleteNoteImage(img.id);
  }

  async function copyBody() {
    try {
      await navigator.clipboard.writeText(body);
      toast("Copied to clipboard ✓", "success");
    } catch {
      toast("Copy failed.", "error");
    }
  }

  async function share() {
    try {
      const token = await ensureShareToken(note);
      const url = `${window.location.origin}/share/${token}`;
      await navigator.clipboard.writeText(url).catch(() => {});
      onChanged({ ...note, share_token: token });
      toast("Share link copied ✓", "success");
    } catch {
      toast("Couldn't create share link.", "error");
    }
  }

  async function moveOrCopy(targetFolderId: string, mode: "move" | "copy") {
    if (mode === "move") {
      await updateNote(note.id, { folder_id: targetFolderId });
      onChanged({ ...note, folder_id: targetFolderId });
      toast("Note moved ✓", "success");
    } else {
      await copyNoteToFolder(note, targetFolderId);
      toast("Note copied ✓", "success");
    }
  }

  async function doDelete() {
    setConfirmDelete(false);
    try {
      await deleteNote(note.id);
      onDeleted(note.id);
      toast("Note deleted", "info");
    } catch {
      toast("Delete failed.", "error");
    }
  }

  const dir = dirFor(body);

  return (
    <div
      className="fixed inset-0 z-[80] flex justify-end bg-black/40"
      onClick={onClose}
    >
      <div
        className="glass-strong fade-in flex h-full w-full max-w-2xl flex-col overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-white/50">
              {shortDateTime(note.created_at)}
            </div>
            <h2 className="wordmark text-2xl">{note.title}</h2>
            <div className="mt-1 flex items-center gap-2 text-xs text-white/55">
              <span>{wordCount(body)} words</span>
              <span>· {saved ? "Saved" : "Saving…"}</span>
              {needsReview && (
                <span className="rounded-full bg-amber-400/25 px-2 py-0.5 text-amber-200">
                  ⚠ low-confidence transcript
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="glass flex h-9 w-9 items-center justify-center rounded-full text-lg"
            aria-label="Close editor"
          >
            ✕
          </button>
        </div>

        <textarea
          value={body}
          dir={dir}
          lang={note.language_code}
          onChange={(e) => scheduleSave(e.target.value)}
          onBlur={() => !saved && persist(body)}
          placeholder="Start typing, or add a recording…"
          className="note-body min-h-[38vh] w-full flex-1 resize-none rounded-2xl bg-white/8 p-4 text-[15px] leading-relaxed outline-none placeholder:text-white/40"
        />

        {images.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-3">
            {images.map((img) => (
              <div key={img.id} className="group relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={publicUrl("note-images", img.storage_path)}
                  alt="note attachment"
                  className="h-28 w-full rounded-xl object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(img)}
                  className="glass-strong absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full text-xs opacity-0 transition group-hover:opacity-100"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Action bar */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={recording ? stopAppendRecording : startAppendRecording}
            disabled={appending}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              recording
                ? "bg-red-500/90 text-white recording-pulse"
                : "bg-white/15 hover:bg-white/25"
            }`}
          >
            {recording ? "◼ Stop" : appending ? "Transcribing…" : "🎙 Add recording"}
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="rounded-full bg-white/15 px-4 py-2 text-sm font-medium hover:bg-white/25"
          >
            🖼 Add image
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={onPickImage}
          />
          <button
            type="button"
            onClick={copyBody}
            className="rounded-full bg-white/15 px-4 py-2 text-sm font-medium hover:bg-white/25"
          >
            ⧉ Copy
          </button>
          <button
            type="button"
            onClick={share}
            className="rounded-full bg-white/15 px-4 py-2 text-sm font-medium hover:bg-white/25"
          >
            🔗 Share
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="rounded-full bg-red-500/20 px-4 py-2 text-sm font-medium text-red-200 hover:bg-red-500/30"
          >
            🗑 Delete
          </button>
        </div>

        {folders.length > 1 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-white/60">
            <span>Move / copy to:</span>
            {folders
              .filter((f) => f.id !== note.folder_id)
              .map((f) => (
                <span key={f.id} className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveOrCopy(f.id, "move")}
                    className="rounded-full bg-white/10 px-2 py-1 hover:bg-white/20"
                    title={`Move to ${f.name}`}
                  >
                    → {f.name.replace("Folder · ", "")}
                  </button>
                  <button
                    type="button"
                    onClick={() => moveOrCopy(f.id, "copy")}
                    className="rounded-full bg-white/10 px-1.5 py-1 hover:bg-white/20"
                    title={`Copy to ${f.name}`}
                  >
                    ⧉
                  </button>
                </span>
              ))}
          </div>
        )}

        <div className="mt-5">
          <InsightPanel note={{ ...note, body }} />
        </div>
      </div>

      <ConfirmModal
        open={confirmDelete}
        title="Delete note?"
        message="This permanently removes the note and its recordings. This can't be undone."
        confirmLabel="Delete"
        danger
        onConfirm={doDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
