-- Demo data: the weekly schedule, the Christmas holiday and the demo accounts
-- from data/users.ts (same passwords — demo only, change before going live).
-- Safe to run again: existing rows are left alone.

insert into public.sessions (id, day, style, start_time, end_time, capacity) values
  ('mon-1', 'Maandag', 'yin', '19:00', '20:00', 14),
  ('mon-2', 'Maandag', 'yin', '20:15', '21:15', 14),
  ('tue-1', 'Dinsdag', 'yin', '19:00', '20:00', 14),
  ('wed-1', 'Woensdag', 'flow', '09:00', '10:00', 14),
  ('thu-1', 'Donderdag', 'yin', '19:00', '20:00', 14),
  ('thu-2', 'Donderdag', 'yin', '20:15', '21:15', 14),
  ('fri-1', 'Vrijdag', 'gentle', '09:00', '10:00', 12),
  ('fri-2', 'Vrijdag', 'yin', '10:15', '11:15', 14)
on conflict (id) do nothing;

-- Christmas holiday: 21 December – 3 January (next one that hasn't passed).
insert into public.closures (from_date, to_date, session_id, reason)
select make_date(y, 12, 21), make_date(y + 1, 1, 3), null, 'Kerstvakantie'
from (select extract(year from current_date - interval '3 days')::int as y) as t
where not exists (select 1 from public.closures where reason = 'Kerstvakantie');

-- Creates a confirmed e-mail/password login (the profile follows via trigger).
create or replace function pg_temp.demo_user(p_email text, p_password text, p_name text) returns uuid
language plpgsql as $$
declare
  uid uuid;
begin
  select id into uid from auth.users where email = p_email;
  if uid is not null then return uid; end if;
  uid := gen_random_uuid();
  insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token)
  values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', p_email,
    extensions.crypt(p_password, extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', jsonb_build_object('name', p_name), now(), now(),
    '', '', '', '');
  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (gen_random_uuid(), uid, uid::text,
    jsonb_build_object('sub', uid::text, 'email', p_email, 'email_verified', true), 'email', now(), now(), now());
  return uid;
end;
$$;

-- Most recent past date (today included) of a session's weekday, minus `weeks_back` weeks.
create or replace function pg_temp.past_lesson(p_session text, weeks_back int) returns date
language sql as $$
  select current_date - ((extract(isodow from current_date)::int - d.n + 7) % 7) - 7 * weeks_back
  from public.sessions s
  join (values ('Maandag', 1), ('Dinsdag', 2), ('Woensdag', 3), ('Donderdag', 4), ('Vrijdag', 5), ('Zaterdag', 6), ('Zondag', 7)) as d(day, n)
    on d.day = s.day
  where s.id = p_session;
$$;

do $$
declare
  admin_id uuid := pg_temp.demo_user('beheer@soulfulyoga.nl', 'admin123', 'Studio Beheer');
  marieke uuid := pg_temp.demo_user('marieke@soulfulyoga.nl', 'yoga123', 'Marieke Jansen');
  daan uuid := pg_temp.demo_user('daan@soulfulyoga.nl', 'yoga123', 'Daan de Vries');
  marjolijn uuid := pg_temp.demo_user('marjolijn_n@hotmail.com', '0000', 'Marjolijn N.');
begin
  update public.profiles set role = 'admin', phone = '06 12680852' where id = admin_id;
  update public.profiles set phone = '06 12345678', strippen = 7 where id = marieke and strippen is null;
  update public.profiles set phone = '06 23456789' where id = daan;
  update public.profiles set phone = '06 34567890', strippen = 5 where id = marjolijn and strippen is null;

  if not exists (select 1 from public.enrollments) then
    insert into public.enrollments (session_id, user_id, start_date, weeks) values
      ('tue-1', marieke, pg_temp.past_lesson('tue-1', 3), 99),
      ('thu-2', marjolijn, pg_temp.past_lesson('thu-2', 2), 12),
      ('fri-2', daan, pg_temp.past_lesson('fri-2', 1), 99);
    insert into public.cancellations (session_id, date, user_id, cancelled_by)
      values ('tue-1', pg_temp.past_lesson('tue-1', 2), marieke, 'klant');
  end if;
end;
$$;
