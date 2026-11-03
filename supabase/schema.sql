-- ==========================================================================
-- Runiverso · base de datos (Supabase / Postgres)
-- Pegar entero en Supabase → SQL Editor → New query → Run.
-- Se puede ejecutar varias veces: no borra datos.
-- ==========================================================================

-- ---------- 1. Perfiles de usuario ----------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  name        text check (char_length(name) <= 40),
  prov        text,                      -- provincia (Cádiz, Sevilla…)
  ccaa        text,                      -- comunidad autónoma
  club        text check (char_length(club) <= 60),
  public      boolean not null default false,  -- aparece en rankings solo si lo activa
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Crea el perfil automáticamente al registrarse
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name'))
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- 2. Marcas de cada corredor ----------
create table if not exists public.marks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade default auth.uid(),
  race_id     text,                      -- identificador de la carrera en Runiverso (si la hay)
  race_name   text not null check (char_length(race_name) <= 120),
  km          numeric(6,3) not null check (km > 0 and km <= 300),
  sec         integer not null check (sec > 0 and sec < 200000),
  date        date not null,
  created_at  timestamptz not null default now()
);
create index if not exists marks_user_idx on public.marks (user_id, date desc);

-- ---------- 3. Carreras a las que se apunta cada usuario ----------
create table if not exists public.signups (
  user_id     uuid not null references auth.users (id) on delete cascade default auth.uid(),
  race_id     text not null,
  created_at  timestamptz not null default now(),
  primary key (user_id, race_id)
);

-- ---------- 4. Resultados oficiales (base de datos propia de Runiverso) ----------
-- Solo los administradores escriben aquí; todo el mundo puede leer.
create table if not exists public.races (
  id          text primary key,          -- mismo identificador que en la web
  name        text not null,
  city        text,
  prov        text,
  ccaa        text,
  date        date not null,
  kind        text,                      -- 21K, 42K, 10K, TR, SS, POP
  km          numeric(6,3),
  official_url text,                     -- clasificación oficial (fuente)
  source      text,                      -- de dónde vienen los datos y con qué permiso
  created_at  timestamptz not null default now()
);
create table if not exists public.results (
  id          bigint generated always as identity primary key,
  race_id     text not null references public.races (id) on delete cascade,
  pos         integer,
  bib         text,
  name        text not null,
  sex         text check (sex in ('M', 'F', 'X')),
  category    text,
  club        text,
  sec         integer check (sec > 0),
  user_id     uuid references auth.users (id) on delete set null  -- si el corredor reclama su resultado
);
create index if not exists results_race_idx on public.results (race_id, pos);
create index if not exists results_name_idx on public.results (lower(name));

create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------- 5. Seguridad (cada uno solo toca lo suyo) ----------
alter table public.profiles enable row level security;
alter table public.marks    enable row level security;
alter table public.signups  enable row level security;
alter table public.races    enable row level security;
alter table public.results  enable row level security;
alter table public.admins   enable row level security;

drop policy if exists "perfil: ver el propio o los públicos" on public.profiles;
create policy "perfil: ver el propio o los públicos" on public.profiles
  for select using (id = auth.uid() or public);
drop policy if exists "perfil: editar el propio" on public.profiles;
create policy "perfil: editar el propio" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "marcas: ver las propias o de perfiles públicos" on public.marks;
create policy "marcas: ver las propias o de perfiles públicos" on public.marks
  for select using (user_id = auth.uid() or exists (select 1 from public.profiles p where p.id = marks.user_id and p.public));
drop policy if exists "marcas: crear las propias" on public.marks;
create policy "marcas: crear las propias" on public.marks
  for insert with check (user_id = auth.uid());
drop policy if exists "marcas: editar las propias" on public.marks;
create policy "marcas: editar las propias" on public.marks
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "marcas: borrar las propias" on public.marks;
create policy "marcas: borrar las propias" on public.marks
  for delete using (user_id = auth.uid());

drop policy if exists "apuntadas: solo las propias" on public.signups;
create policy "apuntadas: solo las propias" on public.signups
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "carreras: lectura pública" on public.races;
create policy "carreras: lectura pública" on public.races for select using (true);
drop policy if exists "carreras: escriben admins" on public.races;
create policy "carreras: escriben admins" on public.races for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "resultados: lectura pública" on public.results;
create policy "resultados: lectura pública" on public.results for select using (true);
drop policy if exists "resultados: escriben admins" on public.results;
create policy "resultados: escriben admins" on public.results for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins: solo admins" on public.admins;
create policy "admins: solo admins" on public.admins for select using (public.is_admin());

-- ---------- 6. Ranking de la temporada (solo perfiles públicos) ----------
create or replace view public.ranking with (security_invoker = on) as
select p.id as user_id, p.name, p.prov, p.ccaa, p.club,
       count(*)                                        as carreras,
       count(*) filter (where m.km between 9.9 and 10.1)    as diezmil,
       count(*) filter (where m.km between 21 and 21.2)     as medias,
       count(*) filter (where m.km between 42 and 42.3)     as maratones,
       round(sum(m.km))                                as km
from public.profiles p
join public.marks m on m.user_id = p.id
where p.public
  and m.date >= (case when extract(month from now()) >= 9
                      then make_date(extract(year from now())::int, 9, 1)
                      else make_date(extract(year from now())::int - 1, 9, 1) end)
group by p.id;

-- Después: haz administrador a tu propia cuenta (cambia el correo):
-- insert into public.admins (user_id) select id from auth.users where email = 'TU_CORREO' on conflict do nothing;
