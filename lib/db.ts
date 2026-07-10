import { getSupabase } from "@/lib/supabase/browser";
import type { Folder, Note, Recording, NoteImage, AiInsight } from "@/lib/types";
import { folderName, noteTitle, randomCover } from "@/lib/format";

/* ------------------------------------------------------------------ folders */

export async function listFolders(): Promise<Folder[]> {
  const { data, error } = await getSupabase()
    .from("folders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Folder[];
}

export async function createFolder(name?: string): Promise<Folder> {
  const { data, error } = await getSupabase()
    .from("folders")
    .insert({ name: name?.trim() || folderName(), cover_color: randomCover() })
    .select("*")
    .single();
  if (error) throw error;
  return data as Folder;
}

export async function renameFolder(id: string, name: string): Promise<void> {
  const { error } = await getSupabase()
    .from("folders")
    .update({ name })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteFolder(id: string): Promise<void> {
  // notes cascade-delete via FK; log the action for the audit trail.
  const { error } = await getSupabase().from("folders").delete().eq("id", id);
  if (error) throw error;
  await logAudit("folder.delete", "folder", id);
}

/* -------------------------------------------------------------------- notes */

export async function listNotes(folderId: string): Promise<Note[]> {
  const { data, error } = await getSupabase()
    .from("notes")
    .select("*")
    .eq("folder_id", folderId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Note[];
}

export async function countNotesByFolder(): Promise<Record<string, number>> {
  const { data, error } = await getSupabase().from("notes").select("folder_id");
  if (error) throw error;
  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const fid = (row as { folder_id: string | null }).folder_id;
    if (fid) counts[fid] = (counts[fid] ?? 0) + 1;
  }
  return counts;
}

export async function getNote(id: string): Promise<Note | null> {
  const { data, error } = await getSupabase()
    .from("notes")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as Note) ?? null;
}

export async function createNote(input: {
  folder_id: string;
  body?: string;
  language_code?: string;
  title?: string;
}): Promise<Note> {
  const { data, error } = await getSupabase()
    .from("notes")
    .insert({
      folder_id: input.folder_id,
      title: input.title ?? noteTitle(),
      body: input.body ?? "",
      language_code: input.language_code ?? "en",
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as Note;
}

export async function updateNote(
  id: string,
  patch: Partial<Pick<Note, "body" | "title" | "language_code" | "folder_id">>,
): Promise<void> {
  const { error } = await getSupabase().from("notes").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteNote(id: string): Promise<void> {
  const { error } = await getSupabase().from("notes").delete().eq("id", id);
  if (error) throw error;
  await logAudit("note.delete", "note", id);
}

/** Copy a note into another folder (duplicates body + title). */
export async function copyNoteToFolder(
  note: Note,
  targetFolderId: string,
): Promise<Note> {
  return createNote({
    folder_id: targetFolderId,
    body: note.body,
    language_code: note.language_code,
    title: note.title,
  });
}

/* ------------------------------------------------------------- share links */

function randomToken(): string {
  return (
    Math.random().toString(36).slice(2, 10) +
    Math.random().toString(36).slice(2, 10)
  );
}

export async function ensureShareToken(note: Note): Promise<string> {
  if (note.share_token) return note.share_token;
  const token = randomToken();
  const { error } = await getSupabase()
    .from("notes")
    .update({ share_token: token })
    .eq("id", note.id);
  if (error) throw error;
  await logAudit("note.share", "note", note.id, { token });
  return token;
}

/* --------------------------------------------------------------- recordings */

export async function createRecording(input: {
  note_id: string;
  storage_path: string;
  duration_seconds: number;
  transcript: string | null;
  transcript_source: string | null;
  transcript_confidence: number | null;
  review_status?: string;
}): Promise<Recording | null> {
  const { data, error } = await getSupabase()
    .from("recordings")
    .insert({
      note_id: input.note_id,
      storage_path: input.storage_path,
      duration_seconds: input.duration_seconds,
      transcript: input.transcript,
      transcript_source: input.transcript_source,
      transcript_confidence: input.transcript_confidence,
      transcript_review_status: input.review_status ?? "unreviewed",
    })
    .select("*")
    .single();
  // Recording metadata is best-effort; never block the note on it.
  if (error) return null;
  return data as Recording;
}

export async function listRecordings(noteId: string): Promise<Recording[]> {
  const { data, error } = await getSupabase()
    .from("recordings")
    .select("*")
    .eq("note_id", noteId)
    .order("created_at", { ascending: true });
  if (error) return [];
  return (data ?? []) as Recording[];
}

/* ------------------------------------------------------------- note images */

export async function createNoteImage(
  noteId: string,
  storagePath: string,
): Promise<NoteImage | null> {
  const { data, error } = await getSupabase()
    .from("note_images")
    .insert({ note_id: noteId, storage_path: storagePath })
    .select("*")
    .single();
  if (error) return null;
  return data as NoteImage;
}

export async function listNoteImages(noteId: string): Promise<NoteImage[]> {
  const { data, error } = await getSupabase()
    .from("note_images")
    .select("*")
    .eq("note_id", noteId)
    .order("created_at", { ascending: true });
  if (error) return [];
  return (data ?? []) as NoteImage[];
}

export async function deleteNoteImage(id: string): Promise<void> {
  await getSupabase().from("note_images").delete().eq("id", id);
}

/* ------------------------------------------------------------- ai insights */

export async function listInsights(noteId: string): Promise<AiInsight[]> {
  const { data, error } = await getSupabase()
    .from("ai_insights")
    .select("*")
    .eq("note_id", noteId)
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as AiInsight[];
}

export async function saveInsight(input: {
  note_id: string;
  insight_type: string;
  value: string;
  source: string;
  confidence?: number;
  prompt?: string | null;
  review_status?: string;
}): Promise<AiInsight | null> {
  const { data, error } = await getSupabase()
    .from("ai_insights")
    .insert({
      note_id: input.note_id,
      insight_type: input.insight_type,
      value: input.value,
      source: input.source,
      confidence: input.confidence ?? 1,
      prompt: input.prompt ?? null,
      review_status: input.review_status ?? "unreviewed",
    })
    .select("*")
    .single();
  if (error) return null;
  return data as AiInsight;
}

/* -------------------------------------------------------------- audit logs */

export async function logAudit(
  action: string,
  objectType: string,
  objectId: string | null,
  payload?: Record<string, unknown>,
): Promise<void> {
  try {
    await getSupabase()
      .from("audit_logs")
      .insert({ action, object_type: objectType, object_id: objectId, payload: payload ?? null });
  } catch {
    // Audit logging must never break a user action.
  }
}
