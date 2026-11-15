-- Pixel Orbit: clan chat + clans (Supabase SQL Editor)

create table if not exists public.clan_chat (
  id bigserial primary key,
  clan_code text not null,
  user_id uuid references auth.users(id),
  display_name text,
  message text,
  created_at timestamptz default now()
);

create index if not exists clan_chat_code_idx
  on public.clan_chat (clan_code, created_at);

create table if not exists public.clans (
  code text primary key,
  name text,
  updated_at timestamptz default now()
);

alter table public.clan_chat enable row level security;
alter table public.clans enable row level security;

-- drop old policies if re-running
drop policy if exists "clan_chat_read" on public.clan_chat;
drop policy if exists "clan_chat_insert" on public.clan_chat;
drop policy if exists "clans_select" on public.clans;
drop policy if exists "clans_upsert" on public.clans;
drop policy if exists "clans_all" on public.clans;

create policy "clan_chat_read"
  on public.clan_chat for select
  to authenticated
  using (true);

create policy "clan_chat_insert"
  on public.clan_chat for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "clans_select"
  on public.clans for select
  to authenticated
  using (true);

create policy "clans_upsert"
  on public.clans for insert
  to authenticated
  with check (true);

create policy "clans_update"
  on public.clans for update
  to authenticated
  using (true)
  with check (true);
