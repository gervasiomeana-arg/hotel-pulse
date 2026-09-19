-- Demo hotels. Create users in Authentication first, then add their UUIDs below.
insert into public.hotels (id, name, code, city, total_rooms, rating, logo_text) values
  ('hotel-grand-pulse', 'Grand Hotel Pulse & Spa', 'GHP-01', 'Buenos Aires, Recoleta', 68, 4.9, 'PULSE GRAND'),
  ('hotel-urban-pulse', 'Pulse Urban Boutique', 'PUB-02', 'Mendoza, Chacras de Coria', 34, 4.8, 'PULSE URBAN')
on conflict (id) do update set name = excluded.name, code = excluded.code, city = excluded.city,
  total_rooms = excluded.total_rooms, rating = excluded.rating, logo_text = excluded.logo_text;

-- Example (replace the UUID):
-- insert into public.hotel_members (hotel_id, user_id, role)
-- values ('hotel-grand-pulse', '00000000-0000-0000-0000-000000000000', 'admin');
