# Agentic Layer — attaqeur-app-v01

## Risk Levels & Actions

### Low — auto-execute, log only
- Detect note language on paste → write `language` + `language_confidence`
- Auto-tag suggestion → write `tags_suggested` to `ai_suggestions`
- Generate 'What changed?' summary → write `ai_suggestions` row with `review_status=unreviewed`
- Scan for TODO/FIXME → display in sidebar (no DB write)

### Medium — draft → user confirms → execute
- AI bug detector → flags stored in `ai_suggestions`; user reviews each flag before it's highlighted permanently
- AI docstring → drafted in panel; user clicks **Apply** or **Dismiss**
- AI autocomplete → ghost-text; user presses Tab to accept
- AI refactor suggestion → diff preview; user clicks **Apply** or **Reject**

### High — always requires explicit approval
- Post note to GitHub Gist (external write) → user clicks **Post**, confirms destination
- Import from GitHub Gist URL → user confirms URL + target snippet before write

### Critical — human-only, no agent
- Permanent note deletion
- Disabling a shared link
- Auth credential changes

## Named Tools (approved set)
- `detect_language(body: string) → {language, confidence}`
- `generate_docstring(code: string, language: string) → string`
- `explain_code(code: string) → string`
- `detect_bugs(code: string) → [{line, description, severity}]`
- `summarise_diff(old: string, new: string) → string`
- `post_to_gist(title, body, token) → {gist_url}`
- `fetch_gist(url) → {files}`

## Audit Log Fields (activities table)
`entity_type`, `entity_id`, `action`, `payload` (includes tool name, input hash, output excerpt, review_status at time of action)

## v1 vs Later
**v1**: language detect + TODO scan only (no external API calls).
**Next**: explain, bug detect, docstring, summary — all via Next.js API routes, logged.
**Later**: refactor apply, intent inference, voice pipeline, Gist post.
