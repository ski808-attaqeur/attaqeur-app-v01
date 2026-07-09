# Tasks — Idé

## Sprint 1 — DB + Core Data (Goal: schema live, seed data visible)
- [ ] Write and apply migration SQL (folders, notes, recordings, note_images, ai_insights, audit_logs)
- [ ] Seed 4 demo folders, 6 demo notes, 2 demo recordings
- [ ] Confirm all tables visible in Supabase dashboard with open RLS policies
- [ ] Supabase Storage bucket `recordings/` created
**DoD:** Supabase table editor shows all tables with seed rows; no migration errors.

## Sprint 2 — Home Screen UI (Goal: app looks alive, no login)
- [ ] Full-bleed background image (Unsplash URL as CSS background)
- [ ] "Idé." italic Times New Roman heading
- [ ] Live clock top-right (client-side, updates every second)
- [ ] Glassmorphism hero record toggle button (translucent, backdrop-blur, animated pulse when recording)
- [ ] Folder carousel below button (swipe left/right, glassmorphism cards, auto-titled)
- [ ] All five states: loading skeleton, empty (no folders), 1 folder, 6+ folders, error toast
**DoD:** App opens at `/` without login; background image + clock + record button + folders visible; seeded folders appear in carousel.

## Sprint 3 — Record → Transcribe → Note (Core Engine) ★ v1 functional
- [ ] Browser MediaRecorder captures audio on toggle tap
- [ ] On stop: upload blob to Supabase Storage
- [ ] Edge Function `fn_transcribe` calls OpenAI Whisper; writes transcript + confidence to `recordings` row
- [ ] Note auto-created (folder_id = active folder, title = timestamp, body = transcript)
- [ ] Realtime subscription → new note appears in folder instantly
- [ ] If Whisper fails: note created with body = "[transcription pending]"; error toast shown
- [ ] Transcript formatted into clean paragraphs (no wall of text)
**DoD:** Record 10 seconds of speech → stop → note with transcribed text appears in folder within 20 seconds. Works in Chrome and Safari.

## Sprint 4 — Note Editor
- [ ] Tap folder → note list view (glassmorphism panel)
- [ ] Tap note → full editor: view + edit body text
- [ ] Add recording to existing note (append transcript to body)
- [ ] Upload image to note (stored in `note_images`, displayed inline)
- [ ] Create new note manually (blank body)
- [ ] Delete note (confirmation modal)
- [ ] Copy note body to clipboard
- [ ] 50+ language display (font stack + `lang` attribute)
- [ ] All five states per view (loading, empty note list, partial, error, ready)
**DoD:** Every button persists to DB; deleted notes are gone on refresh; images display inline.

## Sprint 5 — Folders CRUD + Share
- [ ] Create folder manually (auto-title generated)
- [ ] Delete folder (confirm "delete X notes inside?")
- [ ] Copy note to different folder
- [ ] Generate shareable link (`share_token` → public `/share/[token]` route, read-only)
- [ ] Audit log row written for every share-link generation and delete action
**DoD:** Share link opens note read-only in new tab without login; folder delete removes all child notes in DB.

## Sprint 6 — AI Insights + Note Chat
- [ ] Edge Function `fn_summarise` → auto-summary on note save (low-risk, auto)
- [ ] Edge Function `fn_chat_note` → "Ask this note" chat panel
- [ ] ai_insights rows stored with value + source + confidence + review_status
- [ ] Low-confidence transcript segments shown with amber badge
- [ ] Insight panel: summary + tags displayed below note body
**DoD:** Summary appears within 5 seconds of note save; chat reply references note content; all ai_insights rows visible in DB.

## Sprint 7 — Lock It Down (Auth + Per-User RLS)
- [ ] Supabase Auth (email/magic link)
- [ ] Sign-up / sign-in screens (not the homepage)
- [ ] Replace open RLS policies with `auth.uid() = user_id` on all tables
- [ ] Add `NOT NULL` to `user_id` columns
- [ ] Storage bucket set to authenticated-only; signed URLs for audio playback
- [ ] Migrate demo seed rows to a system user
**DoD:** User A cannot read User B's notes. Anonymous visitor sees marketing/demo page only.

## Gantt (Sprint → Deliverable)
```
Sprint 1  |████| DB schema + seed
Sprint 2  |████| Home screen UI
Sprint 3  |████| Record→Transcribe→Note  ← v1 functional ★
Sprint 4  |████| Note editor
Sprint 5  |████| Folders CRUD + Share
Sprint 6  |████| AI insights + chat
Sprint 7  |████| Auth + RLS lock-down
```