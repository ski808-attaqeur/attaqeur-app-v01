# Intelligence Layer — attaqeur-app-v01

## Messy Inputs
- Raw pasted code with no declared language
- Freeform note bodies mixing prose, code, TODOs
- Spoken dictation with no punctuation

## Auto-Structure Schema
```json
{
  "note_id": "uuid",
  "detected_language": "python",
  "language_confidence": 0.91,
  "language_source": "heuristic",
  "tags_suggested": ["data", "pandas"],
  "todos": [{"line": 7, "text": "add auth middleware"}],
  "ai_suggestions": [
    {
      "type": "docstring",
      "value": """Cleans a CSV DataFrame by dropping duplicates...""",
      "confidence": 0.87,
      "review_status": "unreviewed"
    }
  ]
}
```

## Events to Track
- `note.saved` — triggers language re-detect if language=`unreviewed`
- `note.reopened_after_24h` — triggers `summary` AI suggestion
- `snippet.inserted` — logs namespace + language
- `ai_suggestion.accepted` / `.rejected` — feeds confidence calibration

## Scoring Rules (rule-based first)
- **Language detect**: regex heuristics for 10 common languages → score 0.7; OpenAI fallback → score 0.5–0.95
- **Bug severity**: pattern-matched (e.g. bare `except:`, `eval(`) → score 1.0; AI-flagged → score 0.6–0.9
- **Tag relevance**: keyword overlap with detected language ecosystem

## What Gets Ranked
- AI suggestions shown in order of confidence DESC
- Snippets search ranked by fuzzy match score
- TODO items ranked by line proximity to cursor

## v1 vs Later
**v1**: language heuristic, TODO regex scan — no AI calls.
**Next**: OpenAI explain, bug detector, docstring, 'What changed?' summary — all stored with review_status.
**Later**: refactor apply/reject, intent inference, chat-with-note, voice dictation pipeline.
