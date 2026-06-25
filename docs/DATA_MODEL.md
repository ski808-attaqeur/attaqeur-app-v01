# Data Model — attaqeur-app-v01

## notes
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | gen_random_uuid() |
| user_id | uuid nullable | owner (populated at lock-down) |
| title | text | |
| body | text | full note content |
| language | text | e.g. `javascript`, `python` |
| language_source | text | AI field: `heuristic` / `openai` |
| language_confidence | numeric | AI field: 0–1 |
| language_review_status | text | `unreviewed` / `accepted` / `rejected` |
| tags | text[] | #label array |
| is_locked | boolean | read-only toggle |
| is_archived | boolean | expiry auto-sets true |
| expires_at | timestamptz nullable | auto-archive trigger |
| git_ref | text nullable | branch or commit SHA |
| updated_at | timestamptz | touch on every save |
| created_at | timestamptz | |

## snippets
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid nullable | |
| title | text | |
| body | text | may contain `{{variable}}` slots |
| language | text | |
| namespace | text | per-language grouping |
| variables | jsonb | `[{name, default}]` |
| source_gist_url | text nullable | import origin |

## snippet_versions
| Field | Type |
|---|---|
| id | uuid PK |
| snippet_id | uuid FK → snippets |
| body | text |
| version_number | integer |

## shared_links
| Field | Type |
|---|---|
| id | uuid PK |
| note_id | uuid FK → notes |
| slug | text unique |
| is_active | boolean |

## ai_suggestions
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| note_id | uuid FK → notes | |
| suggestion_type | text | `explain` / `bug` / `docstring` / `autocomplete` / `refactor` / `summary` |
| value | text | AI output |
| source | text | `openai` |
| confidence | numeric | 0–1 |
| review_status | text | `unreviewed` / `accepted` / `rejected` |
| applied_at | timestamptz nullable | |
| rejected_at | timestamptz nullable | |

## activities
| Field | Type |
|---|---|
| entity_type | text |
| entity_id | uuid |
| action | text |
| payload | jsonb |

**RLS**: All tables have permissive v1 policies (read + write open). Lock-down sprint replaces with `auth.uid() = user_id`; `shared_links` SELECT stays public permanently.
