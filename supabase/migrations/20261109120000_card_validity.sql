-- Strip cards are valid for 4 months. Every time the admin adds strips (+, +10 or a new
-- card) the 4 months start again. The group card and the private-lesson card each have
-- their own date. Refunds (undoing a confirmation, a late cancellation) don't extend it.

alter table public.profiles
  add column strips_valid_until date,
  add column private_valid_until date;

create function public.card_valid_until() returns date
language sql stable as $$
  select ((now() at time zone 'Europe/Amsterdam')::date + interval '4 months')::date;
$$;

-- Existing cards: their 4 months start now.
update public.profiles set strips_valid_until = public.card_valid_until() where strippen is not null;
update public.profiles set private_valid_until = public.card_valid_until() where private_strips is not null;

create or replace function public.protect_profile_fields() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  -- auth.uid() is null for server-side SQL (migrations, seed), which may change anything.
  if auth.uid() is not null and not public.is_admin() and pg_trigger_depth() = 1 and (
    new.role is distinct from old.role or new.strippen is distinct from old.strippen
    or new.total is distinct from old.total or new.email is distinct from old.email
    or new.private_strips is distinct from old.private_strips
    or new.strips_valid_until is distinct from old.strips_valid_until
    or new.private_valid_until is distinct from old.private_valid_until
  ) then
    raise exception 'Alleen de beheerder kan rol, e-mail of strippen aanpassen';
  end if;
  return new;
end;
$$;

create or replace function public.admin_adjust_strips(p_id uuid, p_delta integer) returns integer
language plpgsql security definer set search_path = public as $$
declare
  result integer;
begin
  if not public.is_admin() then raise exception 'Alleen de beheerder kan strippen aanpassen'; end if;
  update public.profiles set strippen = greatest(0, coalesce(strippen, 0) + p_delta),
    strips_valid_until = case when p_delta > 0 then public.card_valid_until() else strips_valid_until end
  where id = p_id returning strippen into result;
  return result;
end;
$$;

-- A new 10-strip card on top of what's left; total follows so it never shows e.g. 12 / 10.
create function public.admin_activate_card(p_id uuid, p_size integer default 10) returns integer
language plpgsql security definer set search_path = public as $$
declare
  result integer;
begin
  if not public.is_admin() then raise exception 'Alleen de beheerder kan strippen aanpassen'; end if;
  update public.profiles set strippen = coalesce(strippen, 0) + p_size,
    total = greatest(p_size, coalesce(strippen, 0) + p_size), strips_valid_until = public.card_valid_until()
  where id = p_id returning strippen into result;
  return result;
end;
$$;
revoke execute on function public.admin_activate_card(uuid, integer) from public, anon;
grant execute on function public.admin_activate_card(uuid, integer) to authenticated;

create or replace function public.admin_adjust_private_strips(p_id uuid, p_delta integer) returns integer
language plpgsql security definer set search_path = public as $$
declare
  result integer;
begin
  if not public.is_admin() then raise exception 'Alleen de beheerder kan strippen aanpassen'; end if;
  update public.profiles set private_strips = greatest(0, coalesce(private_strips, 0) + p_delta),
    private_valid_until = case when p_delta > 0 then public.card_valid_until() else private_valid_until end
  where id = p_id returning private_strips into result;
  return result;
end;
$$;

create or replace function public.admin_remove_private_card(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Alleen de beheerder kan strippen aanpassen'; end if;
  update public.profiles set private_strips = null, private_valid_until = null where id = p_id;
end;
$$;
