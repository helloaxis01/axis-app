-- AXIS: tester consent + save_consent RPC for onboarding.html
-- Run once in Supabase Dashboard → SQL Editor.

create table if not exists public.tester_signups (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  consent boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists tester_signups_created_at_idx on public.tester_signups (created_at desc);

alter table public.tester_signups enable row level security;

drop policy if exists "tester_signups_anon_insert" on public.tester_signups;
create policy "tester_signups_anon_insert"
  on public.tester_signups for insert
  to anon, authenticated
  with check (true);

create or replace function public.save_consent(p_name text, p_consent boolean default true)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.tester_signups (name, consent, created_at)
  values (
    coalesce(nullif(trim(p_name), ''), 'Anonymous'),
    coalesce(p_consent, true),
    now()
  );
end;
$$;

grant execute on function public.save_consent(text, boolean) to anon, authenticated;
