-- ==========================================================================
-- Runiverso · bloquear y denunciar usuarios (lo exige Google Play en apps con
-- contenido de usuarios). Pegar entero en SQL Editor → Run. Se puede repetir.
-- ==========================================================================
create table if not exists public.blocks (
  blocker     uuid not null references auth.users (id) on delete cascade default auth.uid(),
  blocked     uuid not null references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (blocker, blocked),
  check (blocker <> blocked)
);
create table if not exists public.user_reports (
  reported    uuid not null references auth.users (id) on delete cascade,
  reporter    uuid not null references auth.users (id) on delete cascade default auth.uid(),
  reason      text check (char_length(reason) <= 200),
  created_at  timestamptz not null default now(),
  primary key (reported, reporter)
);
alter table public.blocks       enable row level security;
alter table public.user_reports enable row level security;

drop policy if exists "bloqueos: los míos" on public.blocks;
create policy "bloqueos: los míos" on public.blocks for all to authenticated
  using (blocker = auth.uid()) with check (blocker = auth.uid());
drop policy if exists "denuncias de usuario: denunciar" on public.user_reports;
create policy "denuncias de usuario: denunciar" on public.user_reports for insert to authenticated
  with check (reporter = auth.uid() and reported <> auth.uid());
drop policy if exists "denuncias de usuario: ven los admins" on public.user_reports;
create policy "denuncias de usuario: ven los admins" on public.user_reports for select to authenticated
  using (public.is_admin() or reporter = auth.uid());

-- Al bloquear a alguien se deja de seguir en los dos sentidos
create or replace function public.block_unfollow() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  delete from public.follows where (follower = new.blocker and followed = new.blocked) or (follower = new.blocked and followed = new.blocker);
  return new;
end $$;
drop trigger if exists block_unfollow on public.blocks;
create trigger block_unfollow after insert on public.blocks
  for each row execute function public.block_unfollow();

-- El panel de administrador pasa a contar las denuncias de cada usuario
create or replace function public.admin_users() returns json
language sql stable security definer set search_path = public as $$
  select case when not public.is_admin() then null else json_build_object(
    'total',   (select count(*) from auth.users),
    'today',   (select count(*) from auth.users where (created_at at time zone 'Europe/Madrid')::date = (now() at time zone 'Europe/Madrid')::date),
    'week',    (select count(*) from auth.users where created_at > now() - interval '7 days'),
    'active7', (select count(*) from auth.users where last_sign_in_at > now() - interval '7 days'),
    'posts',   (select count(*) from public.posts),
    'clubs',   (select count(*) from public.clubs),
    'pro',     (select count(*) from public.profiles where pro_interest is not null),
    'users',   (select coalesce(json_agg(x), '[]'::json) from (
                  select u.id, u.email, u.created_at, u.last_sign_in_at,
                         p.name, p.prov, p.avatar, coalesce(p.public, false) as public, (p.pro_interest is not null) as pro,
                         (select count(*) from public.signups s where s.user_id = u.id) as races,
                         (select count(*) from public.marks m where m.user_id = u.id) as marks,
                         (select count(*) from public.posts po where po.user_id = u.id) as posts,
                         (select count(*) from public.user_reports ur where ur.reported = u.id) as reports
                  from auth.users u left join public.profiles p on p.id = u.id
                  order by u.created_at desc limit 500) x)
  ) end;
$$;
revoke all on function public.admin_users() from public, anon;
grant execute on function public.admin_users() to authenticated;
