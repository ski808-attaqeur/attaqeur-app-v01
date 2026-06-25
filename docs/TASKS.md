# Tasks — attaqeur-app-v01

## Sprint 1 — DB, core note CRUD, demo data
**Goal**: App renders with real data and a working editor — no login required.
- [ ] Run migration SQL; verify all tables exist with seed rows
- [ ] Next.js project scaffold + Tailwind + Monaco Editor installed
- [ ] `/` page: note list with title, language badge, tags — loads from Supabase
- [ ] Note detail page `/notes/[id]`: Monaco editor, language selector, tag input
- [ ] Create note (modal or inline form) → persists to DB
- [ ] Edit note body → auto-save with debounce → `updated_at` stamped
- [ ] Delete note → confirm dialog → removed from list
- [ ] Language auto-detect on paste (heuristic, client-side)
- [ ] Tag filter sidebar — click tag → filters note list
- [ ] Empty state (no notes), loading skeleton, error toast

**DoD**: Four demo notes visible on load; create/edit/delete all persist; tag filter works.

---

## Sprint 2 — Smart editing tools
**Goal**: Regex tester, diff view, TODO scanner all functional against real notes.
- [ ] Inline regex tester panel: input field, live Monaco decorations on matches
- [ ] Column/block selection toggle (Monaco `columnSelection` option)
- [ ] Diff page `/diff`: pick Note A + Note B → Monaco DiffEditor side-by-side
- [ ] TODO/FIXME scanner: parse active note body, list items in sidebar with line numbers
- [ ] Fuzzy note search (title + first 200 chars of body) — search bar in header
- [ ] Breadcrumb anchors for markdown headings in long notes

**DoD**: Regex highlights update as user types; diff renders two real notes; TODO list clickable to line.

---

## Sprint 3 — Snippets & templates
**Goal**: Snippet library is browsable, searchable, and insertable.
- [ ] `/snippets` page: list all snippets, language + namespace badges
- [ ] Fuzzy search across snippet title + body
- [ ] Create / edit / delete snippet → persists to DB
- [ ] Per-language namespace filter
- [ ] Live template slot modal: parse `{{variable}}` placeholders, fill form, preview result
- [ ] Insert snippet at cursor position in active note
- [ ] Import from GitHub Gist URL → fetch files → create snippet rows

**DoD**: All three seed snippets listed; user creates a new snippet with a `{{var}}`, fills it, inserts into a note.

---

## Sprint 4 — Sharing, export, note metadata ✦ v1 functional milestone
**Goal**: Full success scenario from PRD is completable end-to-end.
- [ ] Share note → POST `/api/share` → creates `shared_links` row → copies URL
- [ ] `/share/[slug]` public page → read-only Monaco, no login needed
- [ ] Export Markdown → client-side download
- [ ] Export HTML → server-rendered styled HTML download
- [ ] Note lock toggle → editor becomes read-only when `is_locked=true`
- [ ] Expiry timestamp field → Supabase cron / pg_cron sets `is_archived=true` at expiry
- [ ] Daily scratch note → pg_cron creates one note titled `Scratch — YYYY-MM-DD` at 00:00 UTC
- [ ] One-click post to GitHub Gist via `/api/gist` (requires GITHUB_TOKEN env var)

**DoD**: PRD success scenario fully walkable; share link works without login; exports download correctly.

---

## Sprint 5 — AI assistance layer
**Goal**: AI suggestions appear inline, stored, and require user acceptance before applying.
- [ ] `/api/ai/explain` → stream explanation for selected text → display inline
- [ ] `/api/ai/bugs` → return `[{line, description, severity}]` → gutter markers
- [ ] `/api/ai/autocomplete` → ghost-text next line, Tab to accept
- [ ] `/api/ai/docstring` → draft in panel, Apply / Dismiss buttons
- [ ] `/api/ai/summary` → 'What changed?' on note reopen after 24 h
- [ ] All AI outputs written to `ai_suggestions` with source/confidence/review_status
- [ ] Accept / Reject updates `review_status`, stamps `applied_at` / `rejected_at`

**DoD**: Each AI feature produces a stored suggestion; user can accept or reject; no AI key visible in browser.

---

## Sprint 6 — Voice & diction
**Goal**: Hands-free note input works in Chrome/Edge.
- [ ] Voice-to-text button → Web Speech API → appends transcript to note body
- [ ] Punctuation inference pass (regex post-process)
- [ ] Code dictation mode: token map ("open curly" → `{`, "arrow" → `=>`)
- [ ] Speak comment → `/api/ai/comment-to-code` → inserts code stub below comment
- [ ] Tone-aware rewrite button → `/api/ai/rewrite` → diff preview before apply
- [ ] Hands-free nav: speech command parser → `goToLine(n)`, `selectFunction(name)`

**DoD**: User dictates a variable assignment, it appears correctly in editor; hands-free line navigation works.

---

## Sprint 7 — Lock it down (auth + per-user RLS)
**Goal**: Real users can sign up; data is private by default.
- [ ] Supabase Auth: email/password + GitHub OAuth
- [ ] Sign-up / login pages + session management
- [ ] Populate `user_id` on all writes post-auth
- [ ] Replace all `v1_read` / `v1_write` policies with `auth.uid() = user_id` owner policies
- [ ] `shared_links` SELECT policy stays open (public by design)
- [ ] Unauthenticated write attempts → redirect to /login
- [ ] Existing demo seed rows tagged with a `demo` user_id (remain visible until replaced)

**DoD**: Two separate user accounts see only their own notes; share links still work publicly.

---

## Sprint 8 — Wiki links, git attach, collaboration
**Goal**: Notes can reference each other; inline comments; snippet history.
- [ ] `[[double bracket]]` parser → auto-link to matching note titles
- [ ] Git ref field UI: input branch/SHA → badge shown on note card
- [ ] Inline comment threads: highlight lines, open comment panel, persist threads
- [ ] Snippet version history: snapshot on every edit, diff view between versions
- [ ] Embed URL `/embed/[slug]` → minimal iframe-friendly read-only view

**DoD**: Wiki links navigate between notes; snippet diff shows v1 vs v2; embed URL renders in an iframe.

---

## Gantt (sprint → feature area)
```
Sprint 1  |████ DB + note CRUD + demo data
Sprint 2  |████ Smart editing (regex, diff, TODO)
Sprint 3  |████ Snippets + templates
Sprint 4  |████ Share + export + metadata  ← v1 functional ✦
Sprint 5  |████ AI assistance
Sprint 6  |████ Voice + diction
Sprint 7  |████ Auth + RLS lock-down
Sprint 8  |████ Wiki links + comments + embed
```
