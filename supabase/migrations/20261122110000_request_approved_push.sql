-- The customer gets a push when the admin approves a lesson request (the request
-- becomes a booking). A booking the admin adds without a request gets no push.
create function public.push_request_approved() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from public.requests where session_id = new.session_id and date = new.date and user_id = new.user_id) then
    perform public.push_to(array[new.user_id],
      'Je les is goedgekeurd',
      '✓ ' || public.lesson_label(new.session_id, new.date) || ' · tot dan!',
      jsonb_build_object('url', '/lessen'));
  end if;
  return new;
end;
$$;
create trigger push_request_approved after insert on public.bookings
  for each row execute function public.push_request_approved();
