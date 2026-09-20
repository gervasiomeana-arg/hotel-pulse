-- Restrict staff writes to their own assigned requests.
-- Admin and reception retain full operational request management.

drop policy if exists operations_write on public.guest_requests;

drop policy if exists request_insert on public.guest_requests;
create policy request_insert on public.guest_requests
for insert to authenticated
with check (public.has_hotel_role(hotel_id, array['admin', 'reception']));

drop policy if exists request_update on public.guest_requests;
create policy request_update on public.guest_requests
for update to authenticated
using (
  public.has_hotel_role(hotel_id, array['admin', 'reception'])
  or exists (
    select 1
    from public.hotel_members membership
    where membership.hotel_id = guest_requests.hotel_id
      and membership.user_id = auth.uid()
      and membership.role = 'staff'
      and membership.staff_id = guest_requests.payload->>'assignedToId'
  )
)
with check (
  public.has_hotel_role(hotel_id, array['admin', 'reception'])
  or exists (
    select 1
    from public.hotel_members membership
    where membership.hotel_id = guest_requests.hotel_id
      and membership.user_id = auth.uid()
      and membership.role = 'staff'
      and membership.staff_id = guest_requests.payload->>'assignedToId'
  )
);

drop policy if exists request_delete on public.guest_requests;
create policy request_delete on public.guest_requests
for delete to authenticated
using (public.has_hotel_role(hotel_id, array['admin', 'reception']));

create or replace function public.validate_staff_request_update()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if public.has_hotel_role(old.hotel_id, array['staff'])
    and not public.has_hotel_role(old.hotel_id, array['admin', 'reception'])
    and (
      new.payload - array['status', 'inTransitAt', 'completedAt', 'resolutionTimeMinutes', 'notes', 'timeline']::text[]
      is distinct from
      old.payload - array['status', 'inTransitAt', 'completedAt', 'resolutionTimeMinutes', 'notes', 'timeline']::text[]
    )
  then
    raise exception 'El personal sólo puede actualizar el progreso de sus tareas asignadas';
  end if;
  return new;
end $$;

drop trigger if exists validate_staff_request_update on public.guest_requests;
create trigger validate_staff_request_update
before update on public.guest_requests
for each row execute function public.validate_staff_request_update();
