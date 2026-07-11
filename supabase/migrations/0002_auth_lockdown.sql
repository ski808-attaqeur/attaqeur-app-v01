-- Sprint 7 — Lock It Down: per-user ownership + RLS.
-- Assumes 0001_init.sql has been applied.

-- 1. Backfill existing demo/seed rows to a fixed system user so they remain
--    valid (and are owned) but stay invisible to real users under RLS.
do $$
declare sys uuid := '00000000-0000-0000-0000-000000000000';
begin
  update folders     set user_id = sys where user_id is null;
  update notes       set user_id = sys where user_id is null;
  update recordings  set user_id = sys where user_id is null;
  update note_images set user_id = sys where user_id is null;
  update ai_insights set user_id = sys where user_id is null;
  update audit_logs  set user_id = sys where user_id is null;
end $$;

-- 2. New rows default to the caller's auth uid; ownership is required.
alter table folders     alter column user_id set default auth.uid();
alter table notes       alter column user_id set default auth.uid();
alter table recordings  alter column user_id set default auth.uid();
alter table note_images alter column user_id set default auth.uid();
alter table ai_insights alter column user_id set default auth.uid();
alter table audit_logs  alter column user_id set default auth.uid();

alter table folders     alter column user_id set not null;
alter table notes       alter column user_id set not null;
alter table recordings  alter column user_id set not null;
alter table note_images alter column user_id set not null;
alter table ai_insights alter column user_id set not null;
alter table audit_logs  alter column user_id set not null;

-- 3. Replace the open v1 policies with per-user ownership.
drop policy if exists "folders_v1_read" on folders;
drop policy if exists "folders_v1_write" on folders;
create policy "folders_owner" on folders
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "notes_v1_read" on notes;
drop policy if exists "notes_v1_write" on notes;
create policy "notes_owner" on notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "recordings_v1_read" on recordings;
drop policy if exists "recordings_v1_write" on recordings;
create policy "recordings_owner" on recordings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "note_images_v1_read" on note_images;
drop policy if exists "note_images_v1_write" on note_images;
create policy "note_images_owner" on note_images
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "ai_insights_v1_read" on ai_insights;
drop policy if exists "ai_insights_v1_write" on ai_insights;
create policy "ai_insights_owner" on ai_insights
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "audit_logs_v1_read" on audit_logs;
drop policy if exists "audit_logs_v1_write" on audit_logs;
create policy "audit_logs_owner" on audit_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 4. Public share links must still work without a login. Rather than open a
--    broad SELECT policy on notes (which would leak all shared rows to every
--    query), expose one narrow security-definer function keyed by token.
create or replace function public.get_shared_note(p_token text)
returns table (
  id uuid,
  title text,
  body text,
  language_code text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select n.id, n.title, n.body, n.language_code, n.created_at
  from notes n
  where n.share_token = p_token
  limit 1;
$$;

revoke all on function public.get_shared_note(text) from public;
grant execute on function public.get_shared_note(text) to anon, authenticated;
