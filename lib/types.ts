export type Folder = {
  id: string;
  user_id: string | null;
  name: string;
  cover_color: string;
  created_at: string;
};

export type Note = {
  id: string;
  user_id: string | null;
  folder_id: string | null;
  title: string;
  body: string;
  language_code: string;
  share_token: string | null;
  created_at: string;
};

export type Recording = {
  id: string;
  user_id: string | null;
  note_id: string | null;
  storage_path: string;
  duration_seconds: number;
  transcript: string | null;
  transcript_source: string | null;
  transcript_confidence: number | null;
  transcript_review_status: string;
  created_at: string;
};

export type NoteImage = {
  id: string;
  user_id: string | null;
  note_id: string | null;
  storage_path: string;
  created_at: string;
};

export type AiInsight = {
  id: string;
  user_id: string | null;
  note_id: string | null;
  insight_type: "summary" | "tags" | "chat_reply" | string;
  value: string;
  source: string;
  confidence: number;
  review_status: string;
  prompt: string | null;
  created_at: string;
};

export type AuditLog = {
  id: string;
  user_id: string | null;
  action: string;
  object_type: string;
  object_id: string | null;
  payload: Record<string, unknown> | null;
  created_at: string;
};
