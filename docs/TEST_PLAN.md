# Test Plan — attaqeur-app-v01

## v1 Success Scenario (manual walkthrough)

### Setup
- Open app at `/` with no account. Confirm four demo notes appear (Express, Pandas, SQL, Bash).

### Note editing
1. Click **Express API boilerplate** → editor opens with JS syntax highlighting.
2. Paste a Python snippet → confirm language badge auto-changes to `python`.
3. Edit body → wait 1 s → confirm `updated_at` changes (check Supabase table or network tab).

### Regex tester
4. Open regex panel → enter `\bapp\.\w+` → confirm function calls highlight in editor.
5. Clear pattern → confirm highlights disappear.

### Diff view
6. Navigate to `/diff` → select **Express** as Note A, **Bash script** as Note B → confirm side-by-side diff renders with change markers.

### TODO scanner
7. Return to Express note → confirm TODO sidebar lists "add auth middleware" at line 5 and "port should come from env" at line 8.

### Snippets
8. Open `/snippets` → confirm three seed snippets listed.
9. Search "async" → only **Async fetch** snippet shown.
10. Open **Python dataclass** → click **Use** → template modal opens → change `ClassName` to `UserProfile` → click **Insert** → text inserted at cursor in active note.

### Tag filter
11. Click tag `#backend` in sidebar → only Express note shown → click **All** → all notes return.

### Export
12. Open any note → click **Export Markdown** → `.md` file downloads with correct content.
13. Click **Export HTML** → `.html` file downloads with styled note.

### Share link
14. Click **Share** → URL copied → open URL in incognito → read-only Monaco renders, no login prompt.

---

## Empty / Error Cases
| Scenario | Expected |
|---|---|
| No notes in DB | Empty state illustration + **Create your first note** CTA |
| Note body empty on save | Auto-saves; empty body is valid |
| Regex pattern invalid (e.g. `[`) | Show inline error "Invalid regex" — no crash |
| Diff with same note selected twice | Show "Select two different notes" warning |
| Share API fails (DB error) | Toast: "Could not create share link — try again" |
| Gist URL invalid / 404 | Toast: "Gist not found or not accessible" |
| AI route called but OPENAI_API_KEY missing | Toast: "AI unavailable — check configuration" |
| Note opened at expired slug | `is_active=false` → render "This link has been deactivated" page |
