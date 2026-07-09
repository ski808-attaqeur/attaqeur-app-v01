# Data Model — Idé

## folders
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | gen_random_uuid() |
| user_id | uuid nullable | owner (null = demo) |
| name | text | auto: "Folder · DD MMM YYYY HH:mm" |
| cover_color | text | hex or gradient key |
| created_at | timestamptz | default now() |

## notes
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid nullable | |
| folder_id | uuid FK → folders.id | |
| title | text | auto: ISO datetime string |
| body | text | transcribed + typed content |
| language_code | text | detected language |
| share_token | text unique nullable | for shareable link |
| created_at | timestamptz | |

## recordings
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid nullable | |
| note_id | uuid FK → notes.id | |
| storage_path | text | Supabase Storage key |
| duration_seconds | numeric | |
| transcript | text | Whisper output |
| transcript_source | text | e.g. "openai-whisper-1" |
| transcript_confidence | numeric | 0–1 |
| transcript_review_status | text | default 'unreviewed' |
| created_at | timestamptz | |

## note_images
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| note_id | uuid FK → notes.id | |
| storage_path | text | |
| created_at | timestamptz | |

## ai_insights
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| note_id | uuid FK → notes.id | |
| insight_type | text | 'summary' \| 'tags' \| 'chat_reply' |
| value | text | AI output |
| source | text | e.g. "gpt-4o" |
| confidence | numeric | 0–1 |
| review_status | text | default 'unreviewed' |
| prompt | text | user prompt if chat |
| created_at | timestamptz | |

**RLS:** All tables have open v1 policies (select/all using true). Locked to `auth.uid() = user_id` in the Lock-Down sprint.