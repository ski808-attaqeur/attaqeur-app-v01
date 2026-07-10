create table if not exists folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text not null,
  cover_color text not null default '#7c3aed',
  created_at timestamptz not null default now()
);
alter table folders enable row level security;
drop policy if exists "folders_v1_read" on folders;
create policy "folders_v1_read" on folders for select using (true);
drop policy if exists "folders_v1_write" on folders;
create policy "folders_v1_write" on folders for all using (true) with check (true);

create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  folder_id uuid references folders(id) on delete cascade,
  title text not null,
  body text not null default '',
  language_code text not null default 'en',
  share_token text unique,
  created_at timestamptz not null default now()
);
alter table notes enable row level security;
drop policy if exists "notes_v1_read" on notes;
create policy "notes_v1_read" on notes for select using (true);
drop policy if exists "notes_v1_write" on notes;
create policy "notes_v1_write" on notes for all using (true) with check (true);

create table if not exists recordings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  note_id uuid references notes(id) on delete cascade,
  storage_path text not null,
  duration_seconds numeric not null default 0,
  transcript text,
  transcript_source text,
  transcript_confidence numeric,
  transcript_review_status text not null default 'unreviewed',
  created_at timestamptz not null default now()
);
alter table recordings enable row level security;
drop policy if exists "recordings_v1_read" on recordings;
create policy "recordings_v1_read" on recordings for select using (true);
drop policy if exists "recordings_v1_write" on recordings;
create policy "recordings_v1_write" on recordings for all using (true) with check (true);

create table if not exists note_images (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  note_id uuid references notes(id) on delete cascade,
  storage_path text not null,
  created_at timestamptz not null default now()
);
alter table note_images enable row level security;
drop policy if exists "note_images_v1_read" on note_images;
create policy "note_images_v1_read" on note_images for select using (true);
drop policy if exists "note_images_v1_write" on note_images;
create policy "note_images_v1_write" on note_images for all using (true) with check (true);

create table if not exists ai_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  note_id uuid references notes(id) on delete cascade,
  insight_type text not null,
  value text not null,
  source text not null,
  confidence numeric not null default 1,
  review_status text not null default 'unreviewed',
  prompt text,
  created_at timestamptz not null default now()
);
alter table ai_insights enable row level security;
drop policy if exists "ai_insights_v1_read" on ai_insights;
create policy "ai_insights_v1_read" on ai_insights for select using (true);
drop policy if exists "ai_insights_v1_write" on ai_insights;
create policy "ai_insights_v1_write" on ai_insights for all using (true) with check (true);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  action text not null,
  object_type text not null,
  object_id uuid,
  payload jsonb,
  created_at timestamptz not null default now()
);
alter table audit_logs enable row level security;
drop policy if exists "audit_logs_v1_read" on audit_logs;
create policy "audit_logs_v1_read" on audit_logs for select using (true);
drop policy if exists "audit_logs_v1_write" on audit_logs;
create policy "audit_logs_v1_write" on audit_logs for all using (true) with check (true);

insert into folders (id, name, cover_color, created_at) values
  ('a1000000-0000-0000-0000-000000000001', 'Folder · 14 Jul 2025 09:00', '#7c3aed', '2025-07-14 09:00:00+00'),
  ('a1000000-0000-0000-0000-000000000002', 'Folder · 13 Jul 2025 15:30', '#0ea5e9', '2025-07-13 15:30:00+00'),
  ('a1000000-0000-0000-0000-000000000003', 'Folder · 12 Jul 2025 11:45', '#10b981', '2025-07-12 11:45:00+00'),
  ('a1000000-0000-0000-0000-000000000004', 'Folder · 10 Jul 2025 08:20', '#f59e0b', '2025-07-10 08:20:00+00')
on conflict (id) do nothing;

insert into notes (id, folder_id, title, body, language_code, created_at) values
  ('b2000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', '2025-07-14 09:05:00', 'The pitch needs a stronger opening slide. Lead with the problem — not the solution. Investors need to feel the pain before they hear the fix.

Consider adding a one-sentence mission statement above the hero image.', 'en', '2025-07-14 09:05:00+00'),
  ('b2000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', '2025-07-14 09:22:00', 'Follow up with Marie about the design system tokens. She mentioned Figma variables could map directly to Tailwind config.', 'en', '2025-07-14 09:22:00+00'),
  ('b2000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', '2025-07-13 15:35:00', 'Idée principale : réduire le nombre d''écrans dans l''onboarding. Trois étapes maximum. L''utilisateur doit atteindre la valeur en moins de soixante secondes.', 'fr', '2025-07-13 15:35:00+00'),
  ('b2000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', '2025-07-13 16:10:00', 'Research note: glassmorphism works best on colorful or photographic backgrounds. Frosted glass effect requires backdrop-filter: blur(12px) and a semi-transparent white fill at around 15% opacity.', 'en', '2025-07-13 16:10:00+00'),
  ('b2000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000003', '2025-07-12 11:50:00', 'Weekly review: shipped the folder carousel. Need to add keyboard accessibility next week. Also — the record button animation feels slightly off on iOS Safari; investigate CSS will-change.', 'en', '2025-07-12 11:50:00+00'),
  ('b2000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000004', '2025-07-10 08:25:00', 'Brainstorm: app name options — Idé, Voix, Mémo, Echo. Idé wins. It is short, French for idea, and the accent gives it a distinct typographic personality.', 'en', '2025-07-10 08:25:00+00')
on conflict (id) do nothing;

insert into recordings (id, note_id, storage_path, duration_seconds, transcript, transcript_source, transcript_confidence, transcript_review_status, created_at) values
  ('c3000000-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001', 'recordings/demo/pitch-note-01.webm', 38, 'The pitch needs a stronger opening slide. Lead with the problem — not the solution. Investors need to feel the pain before they hear the fix. Consider adding a one-sentence mission statement above the hero image.', 'openai-whisper-1', 0.94, 'unreviewed', '2025-07-14 09:05:10+00'),
  ('c3000000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000006', 'recordings/demo/brainstorm-name-01.webm', 21, 'Brainstorm: app name options — Idé, Voix, Mémo, Echo. Idé wins. It is short, French for idea, and the accent gives it a distinct typographic personality.', 'openai-whisper-1', 0.97, 'unreviewed', '2025-07-10 08:25:08+00')
on conflict (id) do nothing;

-- ── Storage buckets (public in v1; locked down in the auth sprint) ───────────
insert into storage.buckets (id, name, public) values ('recordings', 'recordings', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('note-images', 'note-images', true) on conflict (id) do nothing;

-- Open v1 storage policies: anyone can read/write the two demo buckets.
drop policy if exists "storage_v1_read" on storage.objects;
create policy "storage_v1_read" on storage.objects for select using (bucket_id in ('recordings', 'note-images'));
drop policy if exists "storage_v1_insert" on storage.objects;
create policy "storage_v1_insert" on storage.objects for insert with check (bucket_id in ('recordings', 'note-images'));
drop policy if exists "storage_v1_update" on storage.objects;
create policy "storage_v1_update" on storage.objects for update using (bucket_id in ('recordings', 'note-images'));
drop policy if exists "storage_v1_delete" on storage.objects;
create policy "storage_v1_delete" on storage.objects for delete using (bucket_id in ('recordings', 'note-images'));