-- The admin can set the end date of a customer's strip card by hand: a new customer who
-- bought the card earlier, or extra time because of illness. Adding strips (+ / +10)
-- still gives 4 months from today, but never shortens a later end date set by hand.

create function public.admin_set_card_valid_until(p_id uuid, p_date date) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Alleen de beheerder kan de geldigheid aanpassen'; end if;
  if p_date is null then raise exception 'Kies een datum'; end if;
  update public.profiles set strips_valid_until = p_date where id = p_id and strippen is not null;
  if not found then raise exception 'Deze klant heeft geen strippenkaart'; end if;
end;
$$;
revoke execute on function public.admin_set_card_valid_until(uuid, date) from public, anon;
grant execute on function public.admin_set_card_valid_until(uuid, date) to authenticated;

create or replace function public.admin_adjust_strips(p_id uuid, p_delta integer) returns integer
language plpgsql security definer set search_path = public as $$
declare
  result integer;
begin
  if not public.is_admin() then raise exception 'Alleen de beheerder kan strippen aanpassen'; end if;
  update public.profiles set strippen = greatest(0, coalesce(strippen, 0) + p_delta),
    strips_valid_until = case when p_delta > 0
      then greatest(coalesce(strips_valid_until, public.card_valid_until()), public.card_valid_until())
      else strips_valid_until end
  where id = p_id returning strippen into result;
  return result;
end;
$$;

create or replace function public.admin_activate_card(p_id uuid, p_size integer default 10) returns integer
language plpgsql security definer set search_path = public as $$
declare
  result integer;
begin
  if not public.is_admin() then raise exception 'Alleen de beheerder kan strippen aanpassen'; end if;
  update public.profiles set strippen = coalesce(strippen, 0) + p_size,
    total = greatest(p_size, coalesce(strippen, 0) + p_size),
    strips_valid_until = greatest(coalesce(strips_valid_until, public.card_valid_until()), public.card_valid_until())
  where id = p_id returning strippen into result;
  return result;
end;
$$;
