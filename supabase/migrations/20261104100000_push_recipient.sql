-- Every push notification says who it is for (data.uid). A phone that switched accounts
-- (e.g. from the admin to a customer) shows only notifications for the account that is
-- logged in now; see useNotificationLinks and the notification handler in lib/push.native.ts.

create or replace function public.push_to(p_users uuid[], p_title text, p_body text, p_data jsonb) returns void
language plpgsql security definer set search_path = public, extensions as $$
declare
  msgs jsonb;
begin
  select jsonb_agg(jsonb_build_object('to', t.token, 'title', p_title, 'body', left(p_body, 180),
                                      'sound', 'default', 'channelId', 'berichten',
                                      'data', p_data || jsonb_build_object('uid', t.user_id)))
  into msgs from public.push_tokens t where t.user_id = any (p_users);
  if msgs is null then return; end if;
  for i in 0 .. (jsonb_array_length(msgs) - 1) / 100 loop
    perform net.http_post(
      url := 'https://exp.host/--/api/v2/push/send',
      body := (select jsonb_agg(m) from jsonb_array_elements(msgs) with ordinality x(m, n)
               where n > i * 100 and n <= (i + 1) * 100),
      headers := '{"Content-Type": "application/json", "Accept": "application/json"}'::jsonb
    );
  end loop;
end;
$$;

create or replace function public.send_lesson_reminders() returns integer
language plpgsql security definer set search_path = public, extensions as $$
declare
  local_now timestamp := now() at time zone 'Europe/Amsterdam';
  messages jsonb;
  sent integer;
begin
  -- Lessons starting 23–24 hours from now; the hour of slack covers a missed run.
  with lessons as (
    select s.id as session_id, d::date as date, s.start_time,
      case s.style when 'yin' then 'Yin Yoga' when 'flow' then 'Flow Yoga' else 'Gentle Yoga' end as label
    from public.sessions s
    cross join generate_series(local_now::date, local_now::date + 1, interval '1 day') d
    where extract(isodow from d) = array_position(
        array['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'], s.day)
      and (s.from_date is null or d::date >= s.from_date)
      and (s.until_date is null or d::date <= s.until_date)
      and d::date + s.start_time > local_now + interval '23 hours'
      and d::date + s.start_time <= local_now + interval '24 hours'
  ),
  due as (
    insert into public.lesson_reminders (session_id, date, user_id)
    select l.session_id, l.date, u from lessons l, public.lesson_participants(l.session_id, l.date) u
    on conflict do nothing
    returning session_id, date, user_id
  )
  select jsonb_agg(jsonb_build_object(
      'to', t.token,
      'title', 'Soulful Yoga',
      'body', format('Morgen om %s heb je %s. Namasté 🧘', to_char(l.start_time, 'HH24.MI'), l.label),
      'sound', 'default',
      'channelId', 'lessen',
      'data', jsonb_build_object('sessionId', l.session_id, 'date', l.date, 'uid', t.user_id)
    )), count(distinct (due.session_id, due.date, due.user_id))
  into messages, sent
  from due
  join lessons l on l.session_id = due.session_id and l.date = due.date
  join public.push_tokens t on t.user_id = due.user_id;

  if messages is not null then
    -- Expo accepts up to 100 messages per request.
    for i in 0 .. (jsonb_array_length(messages) - 1) / 100 loop
      perform net.http_post(
        url := 'https://exp.host/--/api/v2/push/send',
        body := (select jsonb_agg(m) from (select m from jsonb_array_elements(messages) with ordinality x(m, n)
                                           where n > i * 100 and n <= (i + 1) * 100) b),
        headers := '{"Content-Type": "application/json", "Accept": "application/json"}'::jsonb
      );
    end loop;
  end if;
  return coalesce(sent, 0);
end;
$$;
