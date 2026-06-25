# PRD — attaqeur-app-v01

## Problem
Developers constantly juggle throwaway code snippets, scratchpad notes, and ad-hoc experiments across disconnected tools. No single notepad understands code, manages reusable snippets, and layers in AI assistance without becoming bloated or requiring a full IDE.

## Target User
A solo developer or technical builder who writes code daily and wants one fast, code-aware scratchpad — not an IDE, not a wiki, not a chat tool.

## Core Objects
- **Note** — titled code/text document with language, tags, body, lock state, expiry
- **Snippet** — reusable code fragment with template variables and per-language namespace
- **Snippet Version** — immutable snapshot of a snippet body for diffing
- **Shared Link** — public read-only slug pointing to a note
- **AI Suggestion** — AI-generated output (explanation, fix, docstring) with value/source/confidence/review_status
- **Activity** — log of every meaningful user or agent action

## MVP (v1) Must-Haves
- [ ] Create, edit, delete notes with Monaco syntax highlighting (50+ languages)
- [ ] Auto-detect language on paste
- [ ] Tag notes with #labels; filter note list by tag
- [ ] Inline regex tester with live match highlights
- [ ] Scratchpad diff: compare any two notes side-by-side
- [ ] TODO/FIXME scanner sidebar
- [ ] Snippet library: create, search (fuzzy), insert into note with live template slots
- [ ] Share note as read-only public link
- [ ] Export note as Markdown or HTML
- [ ] Note locking (read-only toggle)
- [ ] Seed demo notes visible without login

## Non-Goals (v1)
- Authentication / per-user data isolation (scheduled: Sprint 7)
- AI features (Sprint 5)
- Voice input (Sprint 6)
- Team collaboration / comments (Sprint 8)
- Mobile-native app

## Success Criteria
A visitor opens the app, sees four demo notes, opens the Express boilerplate, runs the regex tester on a pattern, opens the diff view against the Bash script, finds a snippet, fills its template variable, inserts it, tags the note `#node`, exports it as Markdown, and shares a public link — all without creating an account.
