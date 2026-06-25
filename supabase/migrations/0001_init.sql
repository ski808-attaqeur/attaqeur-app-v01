create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  title text not null default 'Untitled',
  body text not null default '',
  language text not null default 'plaintext',
  language_source text,
  language_confidence numeric,
  language_review_status text default 'unreviewed',
  tags text[] not null default '{}',
  is_locked boolean not null default false,
  is_archived boolean not null default false,
  expires_at timestamptz,
  git_ref text,
  word_count integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table notes enable row level security;
drop policy if exists "notes_v1_read" on notes;
create policy "notes_v1_read" on notes for select using (true);
drop policy if exists "notes_v1_write" on notes;
create policy "notes_v1_write" on notes for all using (true) with check (true);

create table if not exists snippets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  title text not null,
  body text not null,
  language text not null default 'plaintext',
  namespace text,
  variables jsonb not null default '[]',
  source_gist_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table snippets enable row level security;
drop policy if exists "snippets_v1_read" on snippets;
create policy "snippets_v1_read" on snippets for select using (true);
drop policy if exists "snippets_v1_write" on snippets;
create policy "snippets_v1_write" on snippets for all using (true) with check (true);

create table if not exists snippet_versions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  snippet_id uuid references snippets(id) on delete cascade,
  body text not null,
  version_number integer not null,
  created_at timestamptz not null default now()
);

alter table snippet_versions enable row level security;
drop policy if exists "snippet_versions_v1_read" on snippet_versions;
create policy "snippet_versions_v1_read" on snippet_versions for select using (true);
drop policy if exists "snippet_versions_v1_write" on snippet_versions;
create policy "snippet_versions_v1_write" on snippet_versions for all using (true) with check (true);

create table if not exists shared_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  note_id uuid references notes(id) on delete cascade,
  slug text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table shared_links enable row level security;
drop policy if exists "shared_links_v1_read" on shared_links;
create policy "shared_links_v1_read" on shared_links for select using (true);
drop policy if exists "shared_links_v1_write" on shared_links;
create policy "shared_links_v1_write" on shared_links for all using (true) with check (true);

create table if not exists ai_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  note_id uuid references notes(id) on delete cascade,
  suggestion_type text not null,
  value text not null,
  source text not null default 'openai',
  confidence numeric,
  review_status text not null default 'unreviewed',
  applied_at timestamptz,
  rejected_at timestamptz,
  created_at timestamptz not null default now()
);

alter table ai_suggestions enable row level security;
drop policy if exists "ai_suggestions_v1_read" on ai_suggestions;
create policy "ai_suggestions_v1_read" on ai_suggestions for select using (true);
drop policy if exists "ai_suggestions_v1_write" on ai_suggestions;
create policy "ai_suggestions_v1_write" on ai_suggestions for all using (true) with check (true);

create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  payload jsonb,
  created_at timestamptz not null default now()
);

alter table activities enable row level security;
drop policy if exists "activities_v1_read" on activities;
create policy "activities_v1_read" on activities for select using (true);
drop policy if exists "activities_v1_write" on activities;
create policy "activities_v1_write" on activities for all using (true) with check (true);

insert into notes (id, title, body, language, tags) values
(
  'a1000000-0000-0000-0000-000000000001',
  'Express API boilerplate',
  E'const express = require(''express'');\nconst app = express();\n\napp.use(express.json());\n\n// TODO: add auth middleware\napp.get(''/health'', (req, res) => res.json({ status: ''ok'' }));\n\n// FIXME: port should come from env\napp.listen(3000, () => console.log(''Running on 3000''));',
  'javascript',
  '{backend, express, node}'
),
(
  'a1000000-0000-0000-0000-000000000002',
  'Pandas data cleaning snippet',
  E'import pandas as pd\n\ndf = pd.read_csv(''data.csv'')\n\n# Drop duplicates and nulls\ndf = df.drop_duplicates().dropna()\n\n# Normalise column names\ndf.columns = [c.strip().lower().replace('' '', ''_'') for c in df.columns]\n\nprint(df.dtypes)',
  'python',
  '{data, pandas, etl}'
),
(
  'a1000000-0000-0000-0000-000000000003',
  'Postgres slow query audit',
  E'-- Find queries taking > 1s\nSELECT query, calls, total_exec_time, mean_exec_time\nFROM pg_stat_statements\nWHERE mean_exec_time > 1000\nORDER BY mean_exec_time DESC\nLIMIT 20;',
  'sql',
  '{postgres, performance, dba}'
),
(
  'a1000000-0000-0000-0000-000000000004',
  'Docker cleanup script',
  E'#!/bin/bash\n# Remove stopped containers\ndocker container prune -f\n\n# Remove dangling images\ndocker image prune -f\n\n# TODO: add volume cleanup prompt\necho "Done. Disk freed:";\ndf -h / | tail -1',
  'bash',
  '{devops, docker, cleanup}'
);

insert into snippets (id, title, body, language, namespace, variables) values
(
  'b2000000-0000-0000-0000-000000000001',
  'Async fetch with error handling',
  E'async function fetchData(url) {\n  try {\n    const res = await fetch({{url}});\n    if (!res.ok) throw new Error(`HTTP ${{res.status}}`);\n    return await res.json();\n  } catch (err) {\n    console.error(''Fetch failed:'', err);\n    throw err;\n  }\n}',
  'javascript',
  'js-utils',
  '[{"name":"url","default":"\"https://api.example.com/data\""}]'
),
(
  'b2000000-0000-0000-0000-000000000002',
  'Python dataclass template',
  E'from dataclasses import dataclass, field\nfrom typing import List\n\n@dataclass\nclass {{ClassName}}:\n    name: str\n    items: List[str] = field(default_factory=list)\n\n    def summary(self) -> str:\n        return f"{self.name}: {len(self.items)} items"',
  'python',
  'py-patterns',
  '[{"name":"ClassName","default":"MyModel"}]'
),
(
  'b2000000-0000-0000-0000-000000000003',
  'SQL upsert pattern',
  E'INSERT INTO {{table}} ({{pk}}, {{cols}})\nVALUES ({{values}})\nON CONFLICT ({{pk}}) DO UPDATE\n  SET {{update_cols}}, updated_at = now();',
  'sql',
  'sql-utils',
  '[{"name":"table","default":"records"},{"name":"pk","default":"id"},{"name":"cols","default":"name, value"},{"name":"values","default":"gen_random_uuid(), $1, $2"},{"name":"update_cols","default":"name = EXCLUDED.name"}]'
);