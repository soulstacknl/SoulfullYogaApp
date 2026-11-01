-- Server-side actions the app needs beyond plain table access.

-- Confirms a lesson's attendance in one transaction: stores who was there and
-- deducts one strip per present attendee settled as 'strip' (see settleAttendance
-- in lib/schedule.ts, which computes p_records).
create function public.confirm_attendance(p_session text, p_date date, p_records jsonb) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Alleen de beheerder kan presentie bevestigen'; end if;
  insert into public.confirmations (session_id, date, confirmed_by) values (p_session, p_date, auth.uid());
  insert into public.attendance_records (session_id, date, attendee_id, user_id, name, uses_app, walk_in, planned, present, charge)
  select p_session, p_date, r.attendee_id, r.user_id, r.name, r.uses_app, coalesce(r.walk_in, false), r.planned, r.present, r.charge
  from jsonb_to_recordset(p_records) as r(attendee_id text, user_id uuid, name text, uses_app boolean, walk_in boolean, planned boolean, present boolean, charge text);
  update public.profiles p set strippen = greatest(0, coalesce(p.strippen, 0) - 1)
  from public.attendance_records a
  where a.session_id = p_session and a.date = p_date and a.charge = 'strip' and a.user_id = p.id;
  update public.roster_entries e set strips = greatest(0, e.strips - 1)
  from public.attendance_records a
  where a.session_id = p_session and a.date = p_date and a.charge = 'strip' and not a.uses_app and a.attendee_id = e.id::text;
end;
$$;

-- Undoes a confirmation: the deducted strips come back and the list is editable again.
create function public.undo_confirmation(p_session text, p_date date) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Alleen de beheerder kan een bevestiging ongedaan maken'; end if;
  update public.profiles p set strippen = coalesce(p.strippen, 0) + 1
  from public.attendance_records a
  where a.session_id = p_session and a.date = p_date and a.charge = 'strip' and a.user_id = p.id;
  update public.roster_entries e set strips = e.strips + 1
  from public.attendance_records a
  where a.session_id = p_session and a.date = p_date and a.charge = 'strip' and not a.uses_app and a.attendee_id = e.id::text;
  delete from public.confirmations where session_id = p_session and date = p_date;
end;
$$;

-- The admin adds a customer (e.g. after an account request). The account gets no
-- usable password: the customer sets one via "Wachtwoord vergeten".
create function public.admin_create_customer(p_email text, p_name text, p_phone text default '') returns uuid
language plpgsql security definer set search_path = public, extensions as $$
declare
  uid uuid := gen_random_uuid();
  mail text := lower(trim(p_email));
begin
  if not public.is_admin() then raise exception 'Alleen de beheerder kan klanten toevoegen'; end if;
  if mail !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' then raise exception 'Ongeldig e-mailadres'; end if;
  if exists (select 1 from auth.users where lower(email) = mail) then raise exception 'Er bestaat al een account met dit e-mailadres'; end if;
  insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token)
  values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', mail,
    crypt(gen_random_uuid()::text, gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', jsonb_build_object('name', trim(p_name)), now(), now(),
    '', '', '', '');
  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (gen_random_uuid(), uid, uid::text, jsonb_build_object('sub', uid::text, 'email', mail, 'email_verified', true), 'email', now(), now(), now());
  update public.profiles set phone = coalesce(p_phone, '') where id = uid;
  return uid;
end;
$$;

-- A customer deletes their own account and all their data (required by Apple).
create function public.delete_own_account() returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Niet ingelogd'; end if;
  if public.is_admin() then raise exception 'Een beheerdersaccount kan niet in de app worden verwijderd'; end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke execute on function public.confirm_attendance(text, date, jsonb) from public, anon;
revoke execute on function public.undo_confirmation(text, date) from public, anon;
revoke execute on function public.admin_create_customer(text, text, text) from public, anon;
revoke execute on function public.delete_own_account() from public, anon;
grant execute on function public.confirm_attendance(text, date, jsonb) to authenticated;
grant execute on function public.undo_confirmation(text, date) to authenticated;
grant execute on function public.admin_create_customer(text, text, text) to authenticated;
grant execute on function public.delete_own_account() to authenticated;

-- Live updates: the app refreshes when another device (e.g. the admin portal) changes data.
alter publication supabase_realtime add table
  public.profiles, public.sessions, public.enrollments, public.bookings, public.requests,
  public.cancellations, public.closures, public.capacity_overrides, public.roster_entries,
  public.attendance_drafts, public.confirmations, public.attendance_records;
