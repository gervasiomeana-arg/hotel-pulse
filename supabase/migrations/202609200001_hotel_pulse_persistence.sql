-- Hotel Pulse: persistent multi-hotel data model.
-- Run with `supabase db push` or paste in the Supabase SQL editor.

create table if not exists public.hotels (
  id text primary key,
  name text not null,
  code text not null unique,
  city text not null,
  total_rooms integer not null default 0 check (total_rooms >= 0),
  rating numeric(2,1) not null default 0 check (rating between 0 and 5),
  logo_text text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.hotel_members (
  hotel_id text not null references public.hotels(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'reception', 'staff')),
  staff_id text,
  created_at timestamptz not null default now(),
  primary key (hotel_id, user_id),
  check (role <> 'staff' or staff_id is not null)
);

create or replace function public.is_hotel_member(target_hotel_id text)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.hotel_members m where m.hotel_id = target_hotel_id and m.user_id = auth.uid()) $$;

create or replace function public.has_hotel_role(target_hotel_id text, allowed_roles text[])
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.hotel_members m where m.hotel_id = target_hotel_id and m.user_id = auth.uid() and m.role = any(allowed_roles)) $$;

revoke all on function public.is_hotel_member(text) from public;
revoke all on function public.has_hotel_role(text, text[]) from public;
grant execute on function public.is_hotel_member(text) to authenticated;
grant execute on function public.has_hotel_role(text, text[]) to authenticated;

do $$
declare table_name text;
begin
  foreach table_name in array array['rooms','staff','guest_requests','maintenance_incidents','upsell_opportunities','experience_services'] loop
    execute format('create table if not exists public.%I (
      hotel_id text not null references public.hotels(id) on delete cascade,
      id text not null,
      payload jsonb not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      primary key (hotel_id, id),
      check (payload->>''id'' = id),
      check (payload->>''hotelId'' = hotel_id)
    )', table_name);
    execute format('create index if not exists %I on public.%I (hotel_id)', table_name || '_hotel_idx', table_name);
  end loop;
end $$;

create unique index if not exists rooms_hotel_number_unique on public.rooms (hotel_id, ((payload->>'number')));

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;

do $$
declare table_name text;
begin
  foreach table_name in array array['rooms','staff','guest_requests','maintenance_incidents','upsell_opportunities','experience_services'] loop
    execute format('drop trigger if exists set_updated_at on public.%I', table_name);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', table_name);
  end loop;
end $$;

create or replace function public.validate_request_transition()
returns trigger language plpgsql set search_path = public as $$
declare old_status text := old.payload->>'status'; new_status text := new.payload->>'status';
begin
  if old_status is distinct from new_status and not (
    (old_status = 'nueva' and new_status = 'asignada') or
    (old_status = 'asignada' and new_status = 'en_proceso') or
    (old_status = 'en_proceso' and new_status = 'resuelta')
  ) then raise exception 'Transición de solicitud inválida: % -> %', old_status, new_status;
  end if;
  return new;
end $$;

drop trigger if exists validate_request_transition on public.guest_requests;
create trigger validate_request_transition before update on public.guest_requests for each row execute function public.validate_request_transition();

alter table public.hotels enable row level security;
alter table public.hotel_members enable row level security;
do $$ declare table_name text; begin
  foreach table_name in array array['rooms','staff','guest_requests','maintenance_incidents','upsell_opportunities','experience_services'] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('drop policy if exists hotel_read on public.%I', table_name);
    execute format('create policy hotel_read on public.%I for select to authenticated using (public.is_hotel_member(hotel_id))', table_name);
  end loop;
end $$;

drop policy if exists member_hotels_read on public.hotels;
create policy member_hotels_read on public.hotels for select to authenticated using (public.is_hotel_member(id));
drop policy if exists own_membership_read on public.hotel_members;
create policy own_membership_read on public.hotel_members for select to authenticated using (user_id = auth.uid());

-- Configuration is admin-only.
do $$ declare table_name text; begin
  foreach table_name in array array['rooms','staff','experience_services'] loop
    execute format('drop policy if exists admin_write on public.%I', table_name);
    execute format('create policy admin_write on public.%I for all to authenticated using (public.has_hotel_role(hotel_id, array[''admin''])) with check (public.has_hotel_role(hotel_id, array[''admin'']))', table_name);
  end loop;
end $$;

-- Operational collections can be changed by hotel personnel; every row remains hotel-scoped.
do $$ declare table_name text; begin
  foreach table_name in array array['guest_requests','maintenance_incidents'] loop
    execute format('drop policy if exists operations_write on public.%I', table_name);
    execute format('create policy operations_write on public.%I for all to authenticated using (public.has_hotel_role(hotel_id, array[''admin'',''reception'',''staff''])) with check (public.has_hotel_role(hotel_id, array[''admin'',''reception'',''staff'']))', table_name);
  end loop;
end $$;

do $$ declare table_name text; begin
  foreach table_name in array array['upsell_opportunities'] loop
    execute format('drop policy if exists commercial_write on public.%I', table_name);
    execute format('create policy commercial_write on public.%I for all to authenticated using (public.has_hotel_role(hotel_id, array[''admin'',''reception''])) with check (public.has_hotel_role(hotel_id, array[''admin'',''reception'']))', table_name);
  end loop;
end $$;
