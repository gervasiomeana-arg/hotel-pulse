import { PersistedHotelPulseState } from './persistence';

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

export const getConfiguredDataSource = (): HotelPulseDataSource =>
  import.meta.env.VITE_DATA_SOURCE === 'remote' ? 'remote' : 'local';

export const remoteBackendConfigured = (): boolean =>
  getConfiguredDataSource() === 'remote' &&
  Boolean(import.meta.env.VITE_SUPABASE_URL?.trim() && import.meta.env.VITE_SUPABASE_ANON_KEY?.trim());
