import { Hotel } from '../types';
import { PersistedHotelPulseState } from './persistence';
import { HotelPulseRepository } from './backendContract';
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

const snapshots = new Map<string, Partial<Record<CollectionKey, string>>>();

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
  return (data ?? []).map((membership) => ({
    hotelId: membership.hotel_id,
    role: membership.role,
    staffId: membership.staff_id || undefined,
  }));
};

const loadCollection = async <T>(table: string, hotelId: string): Promise<T[]> => {
  const { data, error } = await requireClient().from(table).select('payload').eq('hotel_id', hotelId);
  if (error) throw error;
  return (data ?? []).map((row) => row.payload as T);
};

const saveCollection = async (table: string, hotelId: string, values: Array<{ id: string }>) => {
  const client = requireClient();
  const ids = values.map((value) => value.id);
  if (values.length) {
    const { error } = await client.from(table).upsert(values.map((value) => ({ id: value.id, hotel_id: hotelId, payload: value })), { onConflict: 'hotel_id,id' });
    if (error) throw error;
  }
  const { data: existing, error: listError } = await client.from(table).select('id').eq('hotel_id', hotelId);
  if (listError) throw listError;
  const staleIds = (existing ?? []).map((row) => row.id as string).filter((id) => !ids.includes(id));
  if (staleIds.length) {
    const { error } = await client.from(table).delete().eq('hotel_id', hotelId).in('id', staleIds);
    if (error) throw error;
  }
};

export const supabaseRepository: HotelPulseRepository = {
  async loadState(hotelId) {
    const [rooms, staff, requests, incidents, opportunities, experiences] = await Promise.all([
      loadCollection<PersistedHotelPulseState['rooms'][number]>(tables.rooms, hotelId), loadCollection<PersistedHotelPulseState['staff'][number]>(tables.staff, hotelId),
      loadCollection<PersistedHotelPulseState['requests'][number]>(tables.requests, hotelId), loadCollection<PersistedHotelPulseState['incidents'][number]>(tables.incidents, hotelId),
      loadCollection<PersistedHotelPulseState['opportunities'][number]>(tables.opportunities, hotelId), loadCollection<PersistedHotelPulseState['experiences'][number]>(tables.experiences, hotelId),
    ]);
    const state = { version: 1 as const, rooms, staff, requests, incidents, opportunities, experiences };
    snapshots.set(hotelId, Object.fromEntries((Object.keys(tables) as CollectionKey[]).map((key) => [key, JSON.stringify(state[key])])));
    return state;
  },
  async saveState(hotelId, state) {
    const previous = snapshots.get(hotelId) ?? {};
    await Promise.all((Object.keys(tables) as CollectionKey[]).map(async (key) => {
      const values = state[key].filter((item) => item.hotelId === hotelId);
      const serialized = JSON.stringify(values);
      if (previous[key] === serialized) return;
      await saveCollection(tables[key], hotelId, values);
      previous[key] = serialized;
    }));
    snapshots.set(hotelId, previous);
  },
};
