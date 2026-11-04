-- Clasificaciones propias: el corredor reclama su resultado y se le crea la marca.
create or replace function public.claim_result(rid bigint) returns uuid
language plpgsql security definer set search_path = public as $$
declare r record; ra record; mid uuid;
begin
  if auth.uid() is null then raise exception 'login'; end if;
  select * into r from public.results where id = rid;
  if not found then raise exception 'no existe'; end if;
  if r.user_id is not null and r.user_id <> auth.uid() then raise exception 'ya reclamado'; end if;
  select * into ra from public.races where id = r.race_id;
  update public.results set user_id = auth.uid() where id = rid;
  select id into mid from public.marks where user_id = auth.uid() and race_id = r.race_id limit 1;
  if mid is null and r.sec is not null and ra.km is not null then
    insert into public.marks (user_id, race_id, race_name, km, sec, date)
    values (auth.uid(), r.race_id, ra.name, ra.km, r.sec, ra.date) returning id into mid;
  end if;
  return mid;
end $$;
revoke all on function public.claim_result(bigint) from public, anon;
grant execute on function public.claim_result(bigint) to authenticated;

-- Soltar un resultado reclamado por error
create or replace function public.unclaim_result(rid bigint) returns void
language sql security definer set search_path = public as $$
  update public.results set user_id = null where id = rid and user_id = auth.uid();
$$;
revoke all on function public.unclaim_result(bigint) from public, anon;
grant execute on function public.unclaim_result(bigint) to authenticated;
