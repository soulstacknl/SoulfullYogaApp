-- Klantenbeheer: the admin keeps the full customer file in the app, also for
-- customers who don't use the app. origin shows how a customer came in.

-- 'aanvraag' = via an account request (uses the app), 'beheer' = added by hand by the admin.
alter table public.profiles add column origin text not null default 'aanvraag' check (origin in ('aanvraag', 'beheer'));

-- Customers without an e-mail address get a placeholder on the reserved .invalid
-- domain (never delivered); the app shows "geen e-mailadres".
drop function public.admin_create_customer(text, text, text);
create function public.admin_create_customer(p_name text, p_email text default '', p_phone text default '', p_origin text default 'beheer') returns uuid
language plpgsql security definer set search_path = public, extensions as $$
declare
  uid uuid := gen_random_uuid();
  mail text := lower(btrim(coalesce(p_email, '')));
begin
  if not public.is_admin() then raise exception 'Alleen de beheerder kan klanten toevoegen'; end if;
  if btrim(coalesce(p_name, '')) = '' then raise exception 'Vul een naam in'; end if;
  if p_origin not in ('aanvraag', 'beheer') then raise exception 'Onbekende herkomst'; end if;
  if mail = '' then
    if p_origin = 'aanvraag' then raise exception 'Voor een accountaanvraag is een e-mailadres nodig'; end if;
    mail := 'zonder-email-' || left(replace(uid::text, '-', ''), 10) || '@soulfulyoga.invalid';
  elsif mail !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' then
    raise exception 'Ongeldig e-mailadres';
  end if;
  if exists (select 1 from auth.users where lower(email) = mail) then raise exception 'Er bestaat al een klant met dit e-mailadres'; end if;
  insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token)
  values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', mail,
    crypt(gen_random_uuid()::text, gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', jsonb_build_object('name', btrim(p_name)), now(), now(),
    '', '', '', '');
  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (gen_random_uuid(), uid, uid::text, jsonb_build_object('sub', uid::text, 'email', mail, 'email_verified', true), 'email', now(), now(), now());
  update public.profiles set phone = coalesce(btrim(p_phone), ''), origin = p_origin where id = uid;
  return uid;
end;
$$;

-- The admin removes a customer and everything that belongs to them.
create function public.admin_delete_customer(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Alleen de beheerder kan klanten verwijderen'; end if;
  if exists (select 1 from public.profiles where id = p_id and role = 'admin') then
    raise exception 'Een beheerder kan niet worden verwijderd';
  end if;
  delete from auth.users where id = p_id;
end;
$$;

revoke execute on function public.admin_create_customer(text, text, text, text) from public, anon;
revoke execute on function public.admin_delete_customer(uuid) from public, anon;
grant execute on function public.admin_create_customer(text, text, text, text) to authenticated;
grant execute on function public.admin_delete_customer(uuid) to authenticated;

-- +1 / −1 strip in one step on the server, so quick taps never get lost.
create function public.admin_adjust_strips(p_id uuid, p_delta integer) returns integer
language plpgsql security definer set search_path = public as $$
declare
  result integer;
begin
  if not public.is_admin() then raise exception 'Alleen de beheerder kan strippen aanpassen'; end if;
  update public.profiles set strippen = greatest(0, coalesce(strippen, 0) + p_delta) where id = p_id returning strippen into result;
  return result;
end;
$$;
revoke execute on function public.admin_adjust_strips(uuid, integer) from public, anon;
grant execute on function public.admin_adjust_strips(uuid, integer) to authenticated;
