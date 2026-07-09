# Architecture — Idé

## Stack
- **Frontend:** Next.js 14 (App Router) + Tailwind CSS + Framer Motion
- **Backend:** Supabase (Postgres + Storage + Realtime + Edge Functions)
- **AI:** OpenAI Whisper (transcription) + GPT-4o (insights/chat) via Edge Function
- **Deploy:** Vercel

## Build Sequence
**Now:** DB schema → record button → Whisper transcription → note saved → folder carousel → note editor
**Next:** AI insights panel, note chat, shareable links, image uploads
**Later:** Auth + per-user RLS, offline PWA, mobile app wrapper

## Key Action Flow (Record → Note)
1. User taps record button → browser MediaRecorder captures audio blob
2. Tap stop → blob uploaded to Supabase Storage (`recordings/` bucket)
3. Edge Function calls OpenAI Whisper → returns transcript text
4. Note row created in `notes` table (folder_id, title = ISO timestamp, body = transcript)
5. Recording row created, linked to note
6. Frontend subscribes via Realtime → note appears in folder view immediately
7. User can edit body, add more text, attach images

## Layer Plan
1. **Data layer** — tables, RLS open policies, seed data
2. **App logic** — CRUD for folders/notes, audio capture, transcription edge function
3. **Smart features** — AI insights, note chat (added after core is stable)

## AI-Off Guarantee
If Whisper or GPT is unavailable, the audio still saves and the note appears with body = `"[transcription pending]"`; the user can type manually. No core feature is blocked.