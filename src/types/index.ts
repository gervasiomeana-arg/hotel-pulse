export type UserRole = 'admin' | 'reception' | 'staff' | 'guest';

export type SectorType = 'housekeeping' | 'maintenance' | 'room_service' | 'concierge' | 'front_desk';

export type PriorityType = 'baja' | 'media' | 'alta' | 'urgente';

export type RequestStatus = 'nueva' | 'asignada' | 'en_proceso' | 'resuelta';

export interface Hotel {
  id: string;
  name: string;
  code: string;
  city: string;
  totalRooms: number;
  rating: number;
  logoText: string;
}

export interface Room {
  id: string;
  hotelId: string;
  number: string;
  type: 'Standard' | 'Deluxe Suite' | 'Executive Penthouse' | 'Junior Suite';
  floor: number;
  status: 'ocupada' | 'limpieza' | 'mantenimiento' | 'disponible';
  currentGuest?: {
    name: string;
    checkIn: string;
    checkOut: string;
    phone: string;
    guestsCount: number;
    vip: boolean;
  };
  activeIssuesCount: number;
  activeRequestsCount: number;
}

export interface GuestRequest {
  id: string;
  hotelId: string;
  roomNumber: string;
  guestName: string;
  title: string;
  category: 'toallas' | 'limpieza' | 'almohadas' | 'mantenimiento' | 'room_service' | 'late_checkout' | 'cochera' | 'traslado' | 'experiencias' | 'recepcion' | 'otro';
  details: string;
  quantity?: number;
  sector: SectorType;
  createdAt: string; // ISO string
  priority: PriorityType;
  assignedToId?: string;
  assignedToName?: string;
  assignedSector?: SectorType;
  status: RequestStatus;
  acceptedAt?: string;
  inTransitAt?: string;
  completedAt?: string;
  resolutionTimeMinutes?: number;
  notes?: string;
  timeline: {
    stage: 'solicitado' | 'aceptado' | 'en_camino' | 'entregado';
    timestamp: string;
    actor: string;
  }[];
}

export interface StaffMember {
  id: string;
  name: string;
  sector: SectorType;
  roleTitle: string;
  phone: string;
  activeTasks: number;
  avatar: string;
  status: 'disponible' | 'en_tarea' | 'descanso';
}

export interface MaintenanceIncident {
  id: string;
  hotelId: string;
  roomNumber: string;
  assetName: string; // e.g. "Aire Acondicionado", "Ducha termostática", "Cerradura magnética"
  description: string;
  photoUrl?: string;
  priority: PriorityType;
  assignedTo: string;
  status: 'pendiente' | 'en_revision' | 'reparado' | 'esperando_repuesto';
  date: string;
  estimatedCost: number;
  finalCost?: number;
  historyAssetId?: string;
}

export interface AssetMaintenanceHistory {
  id: string;
  assetName: string;
  roomNumber: string;
  repairsCount: number;
  lastMaintenance: string;
  accumulatedCost: number;
  nextScheduledReview: string;
  healthScore: number; // 0 - 100
  recentLogs: {
    id: string;
    date: string;
    issue: string;
    technician: string;
    cost: number;
    status: 'resuelto' | 'en_curso';
  }[];
}

export interface UpsellOpportunity {
  id: string;
  guestName: string;
  roomNumber: string;
  type: 'late_checkout' | 'parking' | 'gastronomy' | 'stay_extension';
  title: string;
  description: string;
  potentialRevenue: number;
  checkoutDate: string;
  status: 'candidato' | 'propuesta_enviada' | 'aceptada' | 'rechazada';
  urgency: 'alta' | 'media' | 'baja';
  suggestedAction: string;
}

export interface ExperienceService {
  id: string;
  title: string;
  category: 'gastronomia' | 'espectaculos' | 'traslados' | 'estacionamiento' | 'excursiones' | 'spa' | 'actividades';
  provider: string;
  providerType: 'propio' | 'externo';
  price: number;
  hotelCommissionRate: number; // e.g., 20 = 20%
  hotelCommissionAmount: number;
  availability: 'inmediata' | 'con_reserva_previa' | 'cupos_limitados';
  activeBookings: number;
  active: boolean;
  image: string;
  description: string;
  duration?: string;
}

export interface AttentionItem {
  id: string;
  type: 'critical_incident' | 'delayed_request' | 'upsell_checkout' | 'shift_performance';
  title: string;
  description: string;
  severity: 'urgente' | 'alerta' | 'oportunidad' | 'informativo';
  actionLabel: string;
  targetView: 'operaciones' | 'mantenimiento' | 'oportunidades';
  relatedRoom?: string;
}
