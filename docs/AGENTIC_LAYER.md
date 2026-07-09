# Agentic Layer — Idé

## Risk Levels & Actions

### Low — Auto (no approval)
- `transcribe_audio` — call Whisper, write transcript to recordings row
- `generate_summary` — call GPT-4o, write to ai_insights (type=summary)
- `auto_tag_note` — call GPT-4o, write to ai_insights (type=tags)
- `detect_language` — write language_code to notes row

### Medium — Light Approval (user confirms)
- `generate_share_link` — set share_token on note (user taps Share → confirm)
- `append_recording_to_note` — merge new transcript into existing note body

### High — Always Approval
- `delete_note` — irreversible; modal confirmation required
- `delete_folder` — deletes all child notes; explicit "Delete all X notes?" confirmation

### Critical — Human Only
- Data export / bulk delete — not in v1

## Named Tools (Edge Functions)
- `fn_transcribe` — accepts storage_path, returns transcript + confidence
- `fn_summarise` — accepts note body text, returns summary JSON
- `fn_chat_note` — accepts note body + user message, returns reply

## Audit Log Fields
`id, actor_id (nullable), action, object_type, object_id, payload jsonb, created_at`

## v1 vs Later
**v1:** `fn_transcribe` only
**Next:** `fn_summarise`, `fn_chat_note`
**Later:** proactive nudge agent, cross-note synthesis