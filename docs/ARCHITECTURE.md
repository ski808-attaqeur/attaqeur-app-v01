# Architecture — attaqeur-app-v01

## Stack
- **Frontend**: Next.js 14 (App Router) + Tailwind CSS + Monaco Editor
- **Backend**: Supabase (Postgres + RLS + Storage + Edge Functions)
- **AI**: OpenAI API via Next.js API routes (never called from client directly)
- **Deploy**: Vercel

## Now vs Later (feature terms)
**Now**: Note CRUD, Monaco editor, language auto-detect, tag filter, regex tester, diff view, TODO scanner, snippet library, template slots, share link, Markdown/HTML export.
**Later**: AI explain/fix/docstring, voice input, wiki links, git attachment, snippet version history, Gist import, inline comments, auth/RLS lockdown.

## Key User Action — End-to-End Flow
1. **User pastes code** into the editor → language heuristic runs client-side → `language` field updated in `notes` table.
2. **User saves** → `UPSERT notes` via Supabase client → `updated_at` stamped → activity row written.
3. **Note list** re-queries, shows updated note with language badge.
4. **User runs regex tester** → pattern evaluated in-browser against note body → highlights rendered in Monaco decorations (no DB call).
5. **User shares** → API route creates `shared_links` row with random slug → returns public URL.
6. **Public share page** reads `shared_links` + `notes` with permissive RLS → renders read-only Monaco.

## Layer Plan
1. **Data first** — all tables, RLS policies, seed data.
2. **App logic** — CRUD, editor, search, diff, snippets, export (core runs without AI).
3. **Smart features** — AI suggestions stored and surfaced; voice input; agent actions.

## Why the Core Runs Without AI
Every primary action (write, tag, search, diff, share, export) is pure database + client logic. AI suggestions are additive rows in `ai_suggestions`; removing the AI layer leaves a fully functional notepad.
