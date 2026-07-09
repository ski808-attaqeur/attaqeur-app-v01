# Intelligence Layer — Idé

## Messy Inputs
- Raw audio blob (any language, background noise, filler words)
- Unstructured spoken text after transcription

## Auto-Structure (on transcription complete)
```json
{
  "note_id": "uuid",
  "raw_transcript": "so yeah I was thinking about the pitch deck um...",
  "cleaned_body": "I was thinking about the pitch deck...",
  "detected_language": "en",
  "word_count": 142,
  "duration_seconds": 48
}
```

## Events Tracked
- `recording.started`, `recording.stopped`, `transcription.completed`, `transcription.failed`
- `insight.requested`, `insight.delivered`, `chat.message_sent`

## Scoring Rules (rule-based v1)
- Confidence = Whisper `avg_logprob` mapped 0–1
- If confidence < 0.6 → `review_status = 'needs_review'`; UI shows amber badge
- Transcript shown immediately; low-confidence segments italicised

## What Gets Ranked
- Notes sorted by `created_at` desc within folder (v1)
- Later: relevance ranking by semantic similarity to search query

## v1 vs Later
**v1:** Whisper transcription only; confidence badge; cleaned paragraph formatting
**Next:** GPT-4o summary + tags auto-generated on note save
**Later:** Semantic search across notes; proactive insight push ("You mentioned this 3 times this week")