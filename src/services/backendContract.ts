import { PersistedHotelPulseState } from './persistence';
import { publicSupabaseConfigured } from './publicConfig';

export type HotelPulseDataSource = 'local' | 'remote';

export interface HotelPulseSession {
  userId: string;
  hotelId: string;
  role: 'admin' | 'reception' | 'staff';
  staffId?: string;
}

export interface HotelPulseRepository {
  loadState(hotelId: string): Promise<PersistedHotelPulseState | null>;
  saveState(hotelId: string, state: PersistedHotelPulseState): Promise<void>;
}

export const getConfiguredDataSource = (): HotelPulseDataSource => {
  if (import.meta.env.VITE_DATA_SOURCE === 'local') return 'local';
  return import.meta.env.VITE_DATA_SOURCE === 'remote' || publicSupabaseConfigured ? 'remote' : 'local';
};

export const remoteBackendConfigured = (): boolean =>
  getConfiguredDataSource() === 'remote' &&
  publicSupabaseConfigured;
