
-- Friend requests policies (run in SQL Editor)
create table if not exists public.friend_requests (
  id bigserial primary key,
  sender_id uuid references auth.users(id),
  receiver_id uuid references auth.users(id),
  status text default 'pending',
  created_at timestamptz default now()
);

alter table public.friend_requests enable row level security;

drop policy if exists "fr_select" on public.friend_requests;
drop policy if exists "fr_insert" on public.friend_requests;
drop policy if exists "fr_update" on public.friend_requests;
drop policy if exists "fr_delete" on public.friend_requests;

create policy "fr_select" on public.friend_requests for select to authenticated
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "fr_insert" on public.friend_requests for insert to authenticated
  with check (auth.uid() = sender_id);

create policy "fr_update" on public.friend_requests for update to authenticated
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "fr_delete" on public.friend_requests for delete to authenticated
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

-- Allow reading other pilots by code (for friend search)
drop policy if exists "pilots_read_all" on public.pilot_profiles;
create policy "pilots_read_all" on public.pilot_profiles for select to authenticated using (true);
