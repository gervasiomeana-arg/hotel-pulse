import { Hotel } from '../types';
import { PersistedHotelPulseState } from './persistence';
import { HotelPulseRepository, HotelPulseSession } from './backendContract';
import { supabase } from './supabaseClient';

export interface AuthorizedMembership {
  hotelId: string;
  role: 'admin' | 'reception' | 'staff';
  staffId?: string;
}

type CollectionKey = Exclude<keyof PersistedHotelPulseState, 'version'>;

const tables: Record<CollectionKey, string> = {
  rooms: 'rooms',
  staff: 'staff',
  requests: 'guest_requests',
  incidents: 'maintenance_incidents',
  opportunities: 'upsell_opportunities',
  experiences: 'experience_services',
};

const writableCollections: Record<HotelPulseSession['role'], CollectionKey[]> = {
  admin: ['rooms', 'staff', 'requests', 'incidents', 'opportunities', 'experiences'],
  reception: ['requests', 'incidents', 'opportunities'],
  staff: ['requests', 'incidents'],
};

type CollectionSnapshot = Map<string, string>;

const snapshots = new Map<string, Partial<Record<CollectionKey, CollectionSnapshot>>>();
const saveQueues = new Map<string, Promise<void>>();
const rolesByHotel = new Map<string, HotelPulseSession['role']>();

const requireClient = () => {
  if (!supabase) throw new Error('Supabase no está configurado. Revisá VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.');
  return supabase;
};

export const getAuthorizedHotels = async (): Promise<Hotel[]> => {
  const { data, error } = await requireClient().from('hotels').select('id,name,code,city,total_rooms,rating,logo_text').order('name');
  if (error) throw error;
  return (data ?? []).map((hotel) => ({ id: hotel.id, name: hotel.name, code: hotel.code, city: hotel.city, totalRooms: hotel.total_rooms, rating: Number(hotel.rating), logoText: hotel.logo_text }));
};

export const getAuthorizedMemberships = async (): Promise<AuthorizedMembership[]> => {
  const { data, error } = await requireClient()
    .from('hotel_members')
    .select('hotel_id,role,staff_id');
  if (error) throw error;
  const memberships = (data ?? []).map((membership) => ({
    hotelId: membership.hotel_id,
    role: membership.role as HotelPulseSession['role'],
    staffId: membership.staff_id || undefined,
  }));
  rolesByHotel.clear();
  memberships.forEach((membership) => rolesByHotel.set(membership.hotelId, membership.role));
  return memberships;
};

const loadCollection = async <T>(table: string, hotelId: string): Promise<T[]> => {
  const { data, error } = await requireClient().from(table).select('payload').eq('hotel_id', hotelId);
  if (error) throw error;
  return (data ?? []).map((row) => row.payload as T);
};

const saveCollection = async (
  table: string,
  hotelId: string,
  values: Array<{ id: string }>,
  previous: CollectionSnapshot
): Promise<CollectionSnapshot> => {
  const client = requireClient();
  const next = new Map(values.map((value) => [value.id, JSON.stringify(value)]));
  const changedValues = values.filter((value) => previous.get(value.id) !== next.get(value.id));
  const staleIds = [...previous.keys()].filter((id) => !next.has(id));

  if (changedValues.length) {
    const { error } = await client.from(table).upsert(changedValues.map((value) => ({ id: value.id, hotel_id: hotelId, payload: value })), { onConflict: 'hotel_id,id' });
    if (error) throw error;
  }
  if (staleIds.length) {
    const { error } = await client.from(table).delete().eq('hotel_id', hotelId).in('id', staleIds);
    if (error) throw error;
  }
  return next;
};

export const supabaseRepository: HotelPulseRepository = {
  async loadState(hotelId) {
    const [rooms, staff, requests, incidents, opportunities, experiences] = await Promise.all([
      loadCollection<PersistedHotelPulseState['rooms'][number]>(tables.rooms, hotelId), loadCollection<PersistedHotelPulseState['staff'][number]>(tables.staff, hotelId),
      loadCollection<PersistedHotelPulseState['requests'][number]>(tables.requests, hotelId), loadCollection<PersistedHotelPulseState['incidents'][number]>(tables.incidents, hotelId),
      loadCollection<PersistedHotelPulseState['opportunities'][number]>(tables.opportunities, hotelId), loadCollection<PersistedHotelPulseState['experiences'][number]>(tables.experiences, hotelId),
    ]);
    const state = { version: 1 as const, rooms, staff, requests, incidents, opportunities, experiences };
    snapshots.set(hotelId, Object.fromEntries(
      (Object.keys(tables) as CollectionKey[]).map((key) => [
        key,
        new Map(state[key].map((item) => [item.id, JSON.stringify(item)])),
      ])
    ));
    return state;
  },
  async saveState(hotelId, state) {
    const role = rolesByHotel.get(hotelId);
    if (!role) throw new Error('No hay una membresía autorizada para guardar cambios en este hotel.');
    const queuedSave = (saveQueues.get(hotelId) ?? Promise.resolve())
      .catch(() => undefined)
      .then(async () => {
        const previous = snapshots.get(hotelId) ?? {};
        const nextSnapshots = { ...previous };
        await Promise.all(writableCollections[role].map(async (key) => {
          const values = state[key].filter((item) => item.hotelId === hotelId);
          nextSnapshots[key] = await saveCollection(tables[key], hotelId, values, previous[key] ?? new Map());
        }));
        snapshots.set(hotelId, nextSnapshots);
      });

    saveQueues.set(hotelId, queuedSave);
    try {
      await queuedSave;
    } finally {
      if (saveQueues.get(hotelId) === queuedSave) saveQueues.delete(hotelId);
    }
  },
};
