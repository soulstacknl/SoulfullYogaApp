-- A booking made by approving a request remembers when it was requested and approved,
-- so the admin portal can show the approvals of the last 3 months. A booking added by
-- the admin without a request keeps both empty.
alter table public.bookings add column requested_at timestamptz, add column approved_at timestamptz;

create function public.stamp_booking() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  select created_at, now() into new.requested_at, new.approved_at from public.requests
  where session_id = new.session_id and date = new.date and user_id = new.user_id
  order by created_at limit 1;
  return new;
end;
$$;
create trigger stamp_booking before insert on public.bookings for each row execute function public.stamp_booking();

create or replace function public.push_request_approved() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.approved_at is not null then
    perform public.push_to(array[new.user_id],
      'Je les is goedgekeurd',
      '✓ ' || public.lesson_label(new.session_id, new.date) || ' · tot dan!',
      jsonb_build_object('url', '/lessen'));
  end if;
  return new;
end;
$$;
