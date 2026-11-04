-- Avisos en el móvil (Web Push). Se puede ejecutar varias veces.
create table if not exists public.push_subs (
  endpoint   text primary key,
  user_id    uuid not null references auth.users (id) on delete cascade default auth.uid(),
  p256dh     text not null,
  auth       text not null,
  created_at timestamptz not null default now()
);
create index if not exists push_subs_user_idx on public.push_subs (user_id);
alter table public.push_subs enable row level security;
drop policy if exists "avisos: solo los propios" on public.push_subs;
create policy "avisos: solo los propios" on public.push_subs
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Registro de avisos enviados (para no repetir). Solo lo usa el servidor.
create table if not exists public.push_log (
  user_id  uuid not null references auth.users (id) on delete cascade,
  race_id  text not null,
  kind     text not null,
  sent_at  timestamptz not null default now(),
  primary key (user_id, race_id, kind)
);
alter table public.push_log enable row level security;
