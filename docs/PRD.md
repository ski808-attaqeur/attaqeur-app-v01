# PRD — Idé

## Problem
Capturing spoken ideas is slow and fragmented. People lose thoughts because switching to a notes app, typing, and organising takes too long. There is no single tool that records, transcribes, organises, and lets you ask questions about your own notes.

## Target User
Solo thinkers, creatives, and knowledge workers who think out loud and want instant, searchable notes without typing.

## Core Objects
- **Folder** — named container for notes (auto-titled with date/time)
- **Note** — transcribed or typed document inside a folder
- **Recording** — audio attachment linked to a note
- **AI Insight** — extracted summary, tags, or chat response derived from a note

## MVP Must-Haves (v1)
- [ ] Home screen: full-bleed background image, "Idé." italic heading, live clock top-right
- [ ] Glassmorphism hero record toggle: one tap starts, one tap stops recording
- [ ] Audio transcribed → auto-appended to new note in active folder (auto-title: date + time)
- [ ] Folder carousel below record button (swipe left/right, glassmorphism cards)
- [ ] Note editor: view/edit transcription, add text, add recording, upload image
- [ ] Create / delete folders and notes manually
- [ ] Copy note content; share via shareable link
- [ ] 50+ language syntax display support
- [ ] App works for anonymous visitors (no login required in v1)

## Non-Goals (v1)
- User authentication & per-user data isolation
- AI chat / AI insights (Next sprint)
- Billing, teams, offline sync

## Success Criteria
A visitor opens the app, taps the record button, speaks two sentences, taps stop, sees the transcribed text appear as a new note inside the current folder — all within 15 seconds, no login required.