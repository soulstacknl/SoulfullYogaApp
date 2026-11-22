-- Customers see their own strip history in Mijn lessen → Afgenomen (strips added).
create policy "strip events: customer reads own" on public.strip_events for select using (user_id = auth.uid());
