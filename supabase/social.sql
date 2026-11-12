-- ==========================================================================
-- Runiverso · comunidad: seguidores, muro (fotos y reacciones) y clubes
-- Pegar entero en Supabase → SQL Editor → New query → Run.
-- Se puede ejecutar varias veces: no borra datos. Necesita schema.sql ya aplicado.
-- ==========================================================================

-- ---------- 1. Gente: nombre y provincia visibles para quien ha iniciado sesión ----------
-- (Las marcas y el ranking siguen dependiendo de "Aparecer en el ranking".)
create or replace view public.people as
  select id, name, prov, ccaa from public.profiles;
revoke all on public.people from anon, public;
grant select on public.people to authenticated;

-- ---------- 2. Seguidores ----------
create table if not exists public.follows (
  follower    uuid not null references auth.users (id) on delete cascade default auth.uid(),
  followed    uuid not null references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (follower, followed),
  check (follower <> followed)
);
create index if not exists follows_followed_idx on public.follows (followed);

-- ---------- 3. Clubes ----------
create table if not exists public.clubs (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 3 and 60),
  prov        text,
  city        text check (char_length(city) <= 60),
  about       text check (char_length(about) <= 300),
  owner       uuid references auth.users (id) on delete set null default auth.uid(),
  created_at  timestamptz not null default now()
);
create unique index if not exists clubs_name_idx on public.clubs (lower(name));
create table if not exists public.club_members (
  club_id     uuid not null references public.clubs (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade default auth.uid(),
  created_at  timestamptz not null default now(),
  primary key (club_id, user_id)
);
create index if not exists club_members_user_idx on public.club_members (user_id);

-- Quien crea un club entra como primer miembro
create or replace function public.club_owner_joins() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.owner is not null then
    insert into public.club_members (club_id, user_id) values (new.id, new.owner) on conflict do nothing;
  end if;
  return new;
end $$;
drop trigger if exists club_owner_joins on public.clubs;
create trigger club_owner_joins after insert on public.clubs
  for each row execute function public.club_owner_joins();

-- ---------- 4. Muro ----------
create table if not exists public.posts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade default auth.uid(),
  body        text check (char_length(body) <= 500),
  img         text,                      -- ruta de la foto en el bucket "muro"
  club_id     uuid references public.clubs (id) on delete set null,
  hidden      boolean not null default false,  -- oculta por denuncias o por un administrador
  created_at  timestamptz not null default now(),
  check (coalesce(char_length(body), 0) > 0 or img is not null)
);
create index if not exists posts_created_idx on public.posts (created_at desc);
create index if not exists posts_user_idx on public.posts (user_id, created_at desc);

create table if not exists public.reactions (
  post_id     uuid not null references public.posts (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade default auth.uid(),
  kind        text not null check (kind in ('👏', '🔥', '💪', '❤️')),
  created_at  timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.reports (
  post_id     uuid not null references public.posts (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade default auth.uid(),
  reason      text check (char_length(reason) <= 200),
  created_at  timestamptz not null default now(),
  primary key (post_id, user_id)
);

-- Con 3 denuncias de personas distintas la publicación se oculta hasta que la revise un administrador
create or replace function public.hide_reported() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.reports where post_id = new.post_id) >= 3 then
    update public.posts set hidden = true where id = new.post_id;
  end if;
  return new;
end $$;
drop trigger if exists hide_reported on public.reports;
create trigger hide_reported after insert on public.reports
  for each row execute function public.hide_reported();

-- Tope de publicaciones por persona y día (contra el spam)
create or replace function public.posts_today() returns integer
language sql stable security definer set search_path = public as $$
  select count(*)::int from public.posts where user_id = auth.uid() and created_at > now() - interval '1 day';
$$;

-- ---------- 5. Seguridad ----------
alter table public.follows      enable row level security;
alter table public.clubs        enable row level security;
alter table public.club_members enable row level security;
alter table public.posts        enable row level security;
alter table public.reactions    enable row level security;
alter table public.reports      enable row level security;

drop policy if exists "seguir: ver" on public.follows;
create policy "seguir: ver" on public.follows for select to authenticated using (true);
drop policy if exists "seguir: seguir yo" on public.follows;
create policy "seguir: seguir yo" on public.follows for insert to authenticated with check (follower = auth.uid());
drop policy if exists "seguir: dejar de seguir yo" on public.follows;
create policy "seguir: dejar de seguir yo" on public.follows for delete to authenticated using (follower = auth.uid());

drop policy if exists "clubes: ver" on public.clubs;
create policy "clubes: ver" on public.clubs for select to authenticated using (true);
drop policy if exists "clubes: crear" on public.clubs;
create policy "clubes: crear" on public.clubs for insert to authenticated with check (owner = auth.uid());
drop policy if exists "clubes: editar el mío" on public.clubs;
create policy "clubes: editar el mío" on public.clubs for update to authenticated
  using (owner = auth.uid() or public.is_admin()) with check (owner = auth.uid() or public.is_admin());
drop policy if exists "clubes: borrar el mío" on public.clubs;
create policy "clubes: borrar el mío" on public.clubs for delete to authenticated using (owner = auth.uid() or public.is_admin());

drop policy if exists "miembros: ver" on public.club_members;
create policy "miembros: ver" on public.club_members for select to authenticated using (true);
drop policy if exists "miembros: unirme" on public.club_members;
create policy "miembros: unirme" on public.club_members for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "miembros: salirme" on public.club_members;
create policy "miembros: salirme" on public.club_members for delete to authenticated using (user_id = auth.uid());

drop policy if exists "muro: ver" on public.posts;
create policy "muro: ver" on public.posts for select to authenticated
  using (not hidden or user_id = auth.uid() or public.is_admin());
drop policy if exists "muro: publicar" on public.posts;
create policy "muro: publicar" on public.posts for insert to authenticated
  with check (user_id = auth.uid() and not hidden and public.posts_today() < 20);
drop policy if exists "muro: borrar lo mío" on public.posts;
create policy "muro: borrar lo mío" on public.posts for delete to authenticated using (user_id = auth.uid() or public.is_admin());
drop policy if exists "muro: moderar" on public.posts;
create policy "muro: moderar" on public.posts for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "reacciones: ver" on public.reactions;
create policy "reacciones: ver" on public.reactions for select to authenticated using (true);
drop policy if exists "reacciones: la mía" on public.reactions;
create policy "reacciones: la mía" on public.reactions for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "denuncias: denunciar" on public.reports;
create policy "denuncias: denunciar" on public.reports for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "denuncias: ven los admins" on public.reports;
create policy "denuncias: ven los admins" on public.reports for select to authenticated using (public.is_admin() or user_id = auth.uid());

-- ---------- 6. Vistas para la app ----------
create or replace view public.wall with (security_invoker = on) as
select p.id, p.user_id, p.body, p.img, p.club_id, p.created_at,
       pe.name as author, pe.prov as author_prov,
       c.name as club,
       (select coalesce(jsonb_object_agg(x.kind, x.n), '{}'::jsonb)
          from (select r.kind, count(*) as n from public.reactions r where r.post_id = p.id group by r.kind) x) as reacs,
       (select r.kind from public.reactions r where r.post_id = p.id and r.user_id = auth.uid()) as mine
from public.posts p
left join public.people pe on pe.id = p.user_id
left join public.clubs c on c.id = p.club_id;
grant select on public.wall to authenticated;

create or replace view public.club_list with (security_invoker = on) as
select c.id, c.name, c.prov, c.city, c.about, c.owner, c.created_at,
       (select count(*) from public.club_members m where m.club_id = c.id)::int as members
from public.clubs c;
grant select on public.club_list to authenticated;

-- ---------- 7. Fotos del muro (Storage) ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('muro', 'muro', true, 2097152, array['image/jpeg', 'image/webp', 'image/png'])
on conflict (id) do update set public = true, file_size_limit = 2097152, allowed_mime_types = array['image/jpeg', 'image/webp', 'image/png'];

drop policy if exists "muro fotos: subir a mi carpeta" on storage.objects;
create policy "muro fotos: subir a mi carpeta" on storage.objects for insert to authenticated
  with check (bucket_id = 'muro' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "muro fotos: borrar las mías" on storage.objects;
create policy "muro fotos: borrar las mías" on storage.objects for delete to authenticated
  using (bucket_id = 'muro' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
