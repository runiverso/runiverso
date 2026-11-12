-- ==========================================================================
-- Runiverso · panel de administrador (Comunidad → Usuarios)
-- Pegar entero en Supabase → SQL Editor → New query → Run. Se puede repetir.
-- Solo responde a quien está en la tabla admins; al resto le devuelve null.
-- ==========================================================================
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
                         (select count(*) from public.posts po where po.user_id = u.id) as posts
                  from auth.users u left join public.profiles p on p.id = u.id
                  order by u.created_at desc limit 500) x)
  ) end;
$$;
revoke all on function public.admin_users() from public, anon;
grant execute on function public.admin_users() to authenticated;
