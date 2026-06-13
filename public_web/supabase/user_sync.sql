-- Run once in Supabase SQL Editor (Project: gndgtmwuxsotqgdwbata)
-- Stores per-user sync state for: session history, pain log, exercise bookmarks, track bookmarks.
-- RLS is open-anon for now (mirrors user_favorites policy). Tighten for production
-- by replacing the policy with: USING (user_id = auth.uid()::text) once Supabase Auth is wired.

create table if not exists public.user_sync (
  user_id          text        not null primary key,
  history          jsonb       not null default '[]'::jsonb,
  pain_log         jsonb       not null default '[]'::jsonb,
  favs             jsonb       not null default '{}'::jsonb,
  favorite_tracks  jsonb       not null default '[]'::jsonb,
  synced_at        timestamptz not null default now()
);

alter table public.user_sync enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'user_sync' and policyname = 'user_sync_anon_all'
  ) then
    create policy "user_sync_anon_all" on public.user_sync
      for all using (true) with check (true);
  end if;
end
$$;
