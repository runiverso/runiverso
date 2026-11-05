-- Runiverso · eliminar la cuenta desde la app
-- Cada persona solo puede borrarse a sí misma. Al borrar el usuario se borran en cascada
-- su perfil, marcas, carreras apuntadas, avisos y permisos; los resultados reclamados quedan sin dueño.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Inicia sesión para eliminar tu cuenta';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
