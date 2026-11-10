-- Admin round 3: edit a customer's details, and remove a weekly group lesson.

-- Name, phone and e-mail of a customer. A new e-mail also becomes the login of the app
-- account (auth.users and its e-mail identity), so the customer logs in with it from now on.
-- An empty e-mail keeps the placeholder of a customer without one.
create function public.admin_update_customer(p_id uuid, p_name text, p_phone text, p_email text) returns void
language plpgsql security definer set search_path = public, auth as $$
declare
  mail text := lower(btrim(coalesce(p_email, '')));
  current_mail text;
begin
  if not public.is_admin() then raise exception 'Alleen de beheerder kan klantgegevens aanpassen'; end if;
  if btrim(coalesce(p_name, '')) = '' then raise exception 'Vul een naam in'; end if;
  select email into current_mail from public.profiles where id = p_id and role = 'student';
  if current_mail is null then raise exception 'Klant niet gevonden'; end if;
  if mail = '' then
    mail := current_mail;
    if mail not like '%@soulfulyoga.invalid' then raise exception 'Vul een e-mailadres in'; end if;
  elsif mail !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' then
    raise exception 'Ongeldig e-mailadres';
  elsif mail <> current_mail and exists (select 1 from auth.users where lower(email) = mail) then
    raise exception 'Er bestaat al een klant met dit e-mailadres';
  end if;

  if mail <> current_mail then
    update auth.users set email = mail, email_confirmed_at = coalesce(email_confirmed_at, now()), updated_at = now() where id = p_id;
    update auth.identities set identity_data = identity_data || jsonb_build_object('email', mail), updated_at = now()
    where user_id = p_id and provider = 'email';
  end if;
  update public.profiles set name = btrim(p_name), phone = btrim(coalesce(p_phone, '')), email = mail where id = p_id;
end;
$$;
revoke execute on function public.admin_update_customer(uuid, text, text, text) from public, anon;
grant execute on function public.admin_update_customer(uuid, text, text, text) to authenticated;

-- Remove a weekly group lesson. Never given (no attendance confirmed): it is deleted with
-- everything that belongs to it. With history: it stops after yesterday, so the confirmed
-- attendance and the strips that went with it stay; it disappears from the schedule.
create function public.admin_remove_session(p_id text) returns text
language plpgsql security definer set search_path = public as $$
declare
  local_today date := (now() at time zone 'Europe/Amsterdam')::date;
begin
  if not public.is_admin() then raise exception 'Alleen de beheerder kan lessen verwijderen'; end if;
  if exists (select 1 from public.confirmations where session_id = p_id)
     or exists (select 1 from public.attendance_records where session_id = p_id) then
    update public.sessions set until_date = local_today - 1 where id = p_id;
    delete from public.bookings where session_id = p_id and date >= local_today;
    delete from public.requests where session_id = p_id and date >= local_today;
    delete from public.cancellations where session_id = p_id and date >= local_today;
    return 'gestopt';
  end if;
  delete from public.sessions where id = p_id;
  return 'verwijderd';
end;
$$;
revoke execute on function public.admin_remove_session(text) from public, anon;
grant execute on function public.admin_remove_session(text) to authenticated;
