# Security — Idé

## Secret Handling
- `OPENAI_API_KEY` stored in Vercel environment variables (server-side only)
- Never referenced in any client component or exposed via a public API route
- Supabase `service_role` key used only inside Edge Functions, never in browser
- Only `anon` public key shipped to the frontend

## Permission Model (v1 → Lock-Down)
- **v1:** Open RLS policies on all tables — demo works without login
- **Lock-Down sprint:** Replace all `using (true)` policies with `using (auth.uid() = user_id)`; add `NOT NULL` constraint to `user_id`; storage buckets set to authenticated-only
- Storage bucket `recordings/` — public read disabled; signed URLs generated server-side for playback

## Approved Tools Rule
- Agents call only `fn_transcribe`, `fn_summarise`, `fn_chat_note` — no `exec`, no raw SQL, no `send_any`
- Each Edge Function accepts a validated `note_id` / `recording_id`; it re-fetches the object itself — no client-supplied raw SQL or storage paths pass through unchecked

## Audit Principle
- Every write that changes a note or triggers an AI action inserts a row into `audit_logs`
- Audit rows are append-only; no `update` or `delete` policy exists on `audit_logs`
- If a task involves payments, bulk data deletion, or auth config changes: stop and get a human.