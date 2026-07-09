# Test Plan — Idé

## Success Scenario (manual, end-to-end)
1. Open `/` — background image visible, "Idé." heading present, live clock ticking, record button visible, folder carousel shows seeded folders. **Pass if:** no login prompt.
2. Swipe carousel to second folder. **Pass if:** folder name updates in header.
3. Tap record button — button animates (pulsing glow). **Pass if:** browser asks for mic permission once, then recording begins.
4. Speak: "The quick brown fox jumps over the lazy dog." Tap stop.
5. **Pass if:** within 20 seconds a new note appears in the active folder with transcribed text in clean paragraphs.
6. Tap the new note — editor opens. Edit the body by typing " Additional text.". Tap save. **Pass if:** edit persists on refresh.
7. Tap the image icon — upload a JPEG. **Pass if:** image displays inline in the note.
8. Tap Share → confirm. **Pass if:** a `/share/[token]` URL is generated and opens the note read-only in a new tab without login.
9. Tap Delete on the note → confirm. **Pass if:** note is gone from the list and absent from DB.

## Empty State Tests
- Delete all folders → carousel shows "No folders yet. Tap + to create one."
- Open folder with no notes → note list shows "No notes yet. Tap record to start."

## Error State Tests
- Disconnect network before tapping stop → error toast: "Upload failed. Audio saved locally. Retry when online." (v1: toast only)
- Whisper returns error → note created with body `[transcription pending]`; amber badge shown
- Share link with invalid token → `/share/invalid` shows "Note not found."

## Confidence / AI Tests
- Record audio with heavy background noise → if `transcript_confidence < 0.6`, amber "Low confidence" badge appears on note
- Request summary → `ai_insights` row exists in DB with `review_status = 'unreviewed'`