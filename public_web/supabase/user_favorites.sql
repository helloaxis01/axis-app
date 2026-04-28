-- Run once in Supabase SQL Editor (Project: gndgtmwuxsotqgdwbata)
-- After creating the table, enable RLS and add a policy so the anon key can read/write
-- (tighten for production, e.g. only when auth.uid() matches — requires Supabase Auth or Edge Functions for Firebase UIDs)

create table if not exists public.user_favorites (
  user_id text not null,
  track_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, track_id)
);

alter table public.user_favorites enable row level security;

-- Development / single-user testing: allow anon to read and write (replace with a secure policy for production)
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'user_favorites' and policyname = 'user_favorites_anon_all') then
    create policy "user_favorites_anon_all" on public.user_favorites
      for all using (true) with check (true);
  end if;
end
$$;
