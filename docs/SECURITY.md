# Security — attaqeur-app-v01

## Secret Handling
- `OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GITHUB_TOKEN` live in Vercel environment variables only.
- All AI calls go through Next.js API routes — never exposed to the browser.
- Supabase anon key is the only key shipped to the client.

## Permission Model (current → lock-down)
- **v1**: permissive RLS — all tables readable and writable by anyone (demo mode).
- **Lock-down sprint**: replace with `auth.uid() = user_id` owner policies on all tables except `shared_links` SELECT (stays public by design).
- `shared_links` is intentionally public-read; `is_active = false` revokes access without deleting the row.

## Approved-Tools Rule
- Agents may only call the named tools listed in `AGENTIC_LAYER.md`.
- No `run_any`, `eval`, or raw shell execution.
- Every tool call is logged to `activities` with input hash + output excerpt.

## Audit Principle
- Every meaningful write (note save, snippet insert, AI suggestion applied/rejected, share link created) writes one `activities` row.
- Audit rows are append-only; no delete policy on `activities`.
- AI-generated fields always store `source`, `confidence`, and `review_status` — no AI value is silently trusted.
