import {
  Room,
  StaffMember,
  GuestRequest,
  MaintenanceIncident,
  UpsellOpportunity,
  ExperienceService,
} from '../types';

export interface PersistedHotelPulseState {
  version: 1;
  rooms: Room[];
  staff: StaffMember[];
  requests: GuestRequest[];
  incidents: MaintenanceIncident[];
  opportunities: UpsellOpportunity[];
  experiences: ExperienceService[];
}

const STORAGE_KEY = 'hotel-pulse:mvp-state:v1';

export const loadPersistedState = (): PersistedHotelPulseState | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedHotelPulseState;
    if (parsed.version !== 1) return null;
    if (
      !Array.isArray(parsed.rooms) ||
      !Array.isArray(parsed.staff) ||
      !Array.isArray(parsed.requests) ||
      !Array.isArray(parsed.incidents) ||
      !Array.isArray(parsed.opportunities) ||
      !Array.isArray(parsed.experiences)
    ) return null;
    return parsed;
  } catch {
    return null;
  }
};

export const savePersistedState = (state: PersistedHotelPulseState) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Persistence is best-effort in the MVP; UI state continues to work in memory.
  }
};

export const clearPersistedState = () => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore browser storage failures.
  }
};
