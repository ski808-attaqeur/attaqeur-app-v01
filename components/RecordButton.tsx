"use client";

import { useRef, useState } from "react";
import { startCapture, type CaptureHandle } from "@/lib/speech";
import { uploadToBucket } from "@/lib/storage";
import { createNote, createRecording } from "@/lib/db";
import { formatTranscript } from "@/lib/format";
import { useToast } from "@/components/Toast";
import type { Note } from "@/lib/types";

type Props = {
  /** Resolve the folder the note should land in, creating one if needed. */
  ensureActiveFolder: () => Promise<string>;
  onNoteCreated: (note: Note) => void;
};

type Phase = "idle" | "recording" | "processing";

export default function RecordButton({ ensureActiveFolder, onNoteCreated }: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [live, setLive] = useState("");
  const handleRef = useRef<CaptureHandle | null>(null);
  const toast = useToast();

  async function start() {
    setLive("");
    try {
      handleRef.current = await startCapture({
        onInterim: (text) => setLive(text),
      });
      setPhase("recording");
    } catch {
      toast("Microphone permission needed to record.", "error");
    }
  }

  async function stop() {
    const handle = handleRef.current;
    if (!handle) return;
    setPhase("processing");
    try {
      const result = await handle.stop();
      handleRef.current = null;

      const folderId = await ensureActiveFolder();

      const hasTranscript = result.transcript.trim().length > 0;
      const body = hasTranscript
        ? formatTranscript(result.transcript)
        : "[transcription pending]";
      const reviewStatus =
        result.confidence !== null && result.confidence < 0.6
          ? "needs_review"
          : "unreviewed";

      const note = await createNote({ folder_id: folderId, body });

      // Audio + recording metadata are best-effort; the note already exists.
      let storagePath = "recordings/local/no-audio";
      if (result.audio) {
        const uploaded = await uploadToBucket("recordings", result.audio, "webm");
        if (uploaded) storagePath = uploaded;
      }
      await createRecording({
        note_id: note.id,
        storage_path: storagePath,
        duration_seconds: result.durationSeconds,
        transcript: hasTranscript ? result.transcript : null,
        transcript_source: hasTranscript ? result.source : null,
        transcript_confidence: result.confidence,
        review_status: reviewStatus,
      });

      onNoteCreated(note);
      if (hasTranscript) {
        toast("Note transcribed ✓", "success");
      } else {
        toast(
          "Saved. Transcription unavailable — tap the note to type it.",
          "info",
        );
      }
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Could not save the recording.",
        "error",
      );
    } finally {
      setPhase("idle");
      setLive("");
    }
  }

  const recording = phase === "recording";
  const processing = phase === "processing";

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        onClick={recording ? stop : processing ? undefined : start}
        disabled={processing}
        aria-pressed={recording}
        aria-label={recording ? "Stop recording" : "Start recording"}
        className={`glass-strong relative flex h-28 w-28 items-center justify-center rounded-full transition-transform active:scale-95 ${
          recording ? "recording-pulse" : ""
        } ${processing ? "opacity-80" : "hover:scale-105"}`}
        style={{
          background: recording
            ? "radial-gradient(circle at 50% 40%, rgba(239,68,68,0.55), rgba(239,68,68,0.15))"
            : undefined,
        }}
      >
        {processing ? (
          <span className="spin h-9 w-9 rounded-full border-[3px] border-white/40 border-t-white" />
        ) : recording ? (
          <span className="h-8 w-8 rounded-md bg-white" />
        ) : (
          <span className="h-9 w-9 rounded-full bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.7)]" />
        )}
      </button>

      <p className="h-5 text-sm font-medium text-white/80">
        {recording
          ? "Listening… tap to stop"
          : processing
            ? "Transcribing…"
            : "Tap to record an idea"}
      </p>

      {recording && (
        <div className="glass fade-in max-h-28 w-[min(92vw,540px)] overflow-y-auto rounded-2xl px-4 py-3 text-sm text-white/90">
          {live || <span className="text-white/50">Speak now…</span>}
        </div>
      )}
    </div>
  );
}
