-- Push notifications for the admin when a customer cancels a lesson or requests one.

-- "Yin Yoga di 3 nov 19.00"
create function public.lesson_label(p_session text, p_date date) returns text
language sql stable security definer set search_path = public as $$
  select case s.style when 'yin' then 'Yin Yoga' when 'flow' then 'Flow Yoga' else 'Gentle Yoga' end
    || ' ' || (array['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'])[extract(isodow from p_date)]
    || ' ' || extract(day from p_date)
    || ' ' || (array['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'])[extract(month from p_date)]
    || ' ' || to_char(s.start_time, 'HH24.MI')
  from public.sessions s where s.id = p_session;
$$;
revoke execute on function public.lesson_label(text, date) from public, anon, authenticated;

create function public.admin_ids() returns uuid[]
language sql stable security definer set search_path = public as $$
  select array(select id from public.profiles where role = 'admin');
$$;
revoke execute on function public.admin_ids() from public, anon, authenticated;

-- Only cancellations by the customer; the admin knows about their own.
create function public.push_cancellation() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.cancelled_by = 'klant' then
    perform public.push_to(public.admin_ids(),
      (select name from public.profiles where id = new.user_id) || ' meldt zich af',
      '✕ ' || public.lesson_label(new.session_id, new.date) || case when new.charged then ' · binnen 24 uur, 1 strip afgeschreven' else '' end,
      jsonb_build_object('url', '/admin/plekken?sessionId=' || new.session_id || '&date=' || new.date));
  end if;
  return new;
end;
$$;
create trigger push_cancellation after insert on public.cancellations for each row execute function public.push_cancellation();

create function public.push_request() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform public.push_to(public.admin_ids(),
    'Nieuwe aanvraag van ' || (select name from public.profiles where id = new.user_id),
    '📨 ' || public.lesson_label(new.session_id, new.date),
    jsonb_build_object('url', '/admin/reserveringen'));
  return new;
end;
$$;
create trigger push_request after insert on public.requests for each row execute function public.push_request();
