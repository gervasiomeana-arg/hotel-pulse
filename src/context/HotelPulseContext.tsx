import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  Hotel,
  Room,
  StaffMember,
  GuestRequest,
  MaintenanceIncident,
  AssetMaintenanceHistory,
  UpsellOpportunity,
  ExperienceService,
  AttentionItem,
  RequestStatus,
  PriorityType,
  SectorType,
} from '../types';
import {
  INITIAL_HOTELS,
  INITIAL_STAFF,
  INITIAL_ROOMS,
  INITIAL_REQUESTS,
  INITIAL_MAINTENANCE_INCIDENTS,
  ASSET_HISTORIES,
  INITIAL_UPSELL_OPPORTUNITIES,
  INITIAL_EXPERIENCES,
  INITIAL_ATTENTION_ITEMS,
} from '../data/initialData';
import { clearPersistedState, loadPersistedState, savePersistedState } from '../services/persistence';
import { getConfiguredDataSource } from '../services/backendContract';
import { AuthorizedMembership, getAuthorizedHotels, getAuthorizedMemberships, supabaseRepository } from '../services/supabaseRepository';

export type AdminViewType = 'dashboard' | 'operaciones' | 'habitaciones' | 'mantenimiento' | 'oportunidades' | 'experiencias' | 'configuracion';

interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  timestamp: string;
}

interface HotelPulseContextType {
  // Navigation & Identity
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  adminView: AdminViewType;
  setAdminView: (view: AdminViewType) => void;
  activeHotel: Hotel;
  setActiveHotel: (hotel: Hotel) => void;
  availableHotels: Hotel[];
  guestRoomNumber: string;
  setGuestRoomNumber: (room: string) => void;
  currentStaffId: string;
  setCurrentStaffId: (staffId: string) => void;

  // Data Collections
  rooms: Room[];
  staff: StaffMember[];
  requests: GuestRequest[];
  incidents: MaintenanceIncident[];
  assetHistories: Record<string, AssetMaintenanceHistory>;
  opportunities: UpsellOpportunity[];
  experiences: ExperienceService[];
  attentionItems: AttentionItem[];

  // Request Management Workflow
  createGuestRequest: (params: {
    category: GuestRequest['category'];
    title: string;
    details: string;
    quantity?: number;
    sector?: SectorType;
    priority?: PriorityType;
    roomNumber?: string;
  }) => GuestRequest;
  assignRequest: (requestId: string, staffId: string) => void;
  staffAcceptTask: (requestId: string) => void;
  staffCompleteTask: (requestId: string, notes?: string) => void;
  updateRequestStatus: (requestId: string, status: RequestStatus) => void;

  // Maintenance Workflow
  createMaintenanceIncident: (incident: Omit<MaintenanceIncident, 'id' | 'hotelId' | 'date'>) => void;
  updateIncidentStatus: (id: string, status: MaintenanceIncident['status'], finalCost?: number) => void;

  // Opportunities & Experiences
  sendUpsellProposal: (id: string) => void;
  toggleExperience: (id: string) => void;
  bookExperience: (experienceId: string, roomNumber: string) => void;

  // Hotel Configuration
  addRoom: (room: Pick<Room, 'number' | 'type' | 'floor'>) => boolean;
  addStaffMember: (member: Pick<StaffMember, 'name' | 'sector' | 'roleTitle' | 'phone'>) => void;
  addExperience: (experience: Omit<ExperienceService, 'id' | 'hotelId' | 'activeBookings' | 'hotelCommissionAmount'>) => void;

  // Notification / Toast
  toasts: ToastNotification[];
  dismissToast: (id: string) => void;
  showToast: (title: string, message: string, type?: ToastNotification['type']) => void;

  // Quick Demo Controls
  resetDemoData: () => void;
  selectedAssetHistory: AssetMaintenanceHistory | null;
  setSelectedAssetHistory: (asset: AssetMaintenanceHistory | null) => void;

  // Interactive Guided Tour Helper
  guidedTourActive: boolean;
  setGuidedTourActive: (active: boolean) => void;
  tourStep: number;
  nextTourStep: () => void;
  prevTourStep: () => void;
}

const HotelPulseContext = createContext<HotelPulseContextType | undefined>(undefined);

export const HotelPulseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const remoteMode = getConfiguredDataSource() === 'remote';
  const [initialPersistedState] = useState(() => loadPersistedState());
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  const [adminView, setAdminView] = useState<AdminViewType>('dashboard');
  const [availableHotels, setAvailableHotels] = useState<Hotel[]>(remoteMode ? [] : INITIAL_HOTELS);
  const [remoteHotelsLoaded, setRemoteHotelsLoaded] = useState(!remoteMode);
  const [remoteLoadError, setRemoteLoadError] = useState('');
  const [activeHotel, setActiveHotel] = useState<Hotel>(INITIAL_HOTELS[0]);
  const [guestRoomNumber, setGuestRoomNumber] = useState<string>('304');
  const [currentStaffId, setCurrentStaffId] = useState<string>('staff-1');

  // State collections
  const [rooms, setRooms] = useState<Room[]>(remoteMode ? [] : initialPersistedState?.rooms ?? INITIAL_ROOMS);
  const [staff, setStaff] = useState<StaffMember[]>(remoteMode ? [] : initialPersistedState?.staff ?? INITIAL_STAFF);
  const [requests, setRequests] = useState<GuestRequest[]>(remoteMode ? [] : initialPersistedState?.requests ?? INITIAL_REQUESTS);
  const [incidents, setIncidents] = useState<MaintenanceIncident[]>(remoteMode ? [] : initialPersistedState?.incidents ?? INITIAL_MAINTENANCE_INCIDENTS);
  const [assetHistories] = useState<Record<string, AssetMaintenanceHistory>>(ASSET_HISTORIES);
  const [opportunities, setOpportunities] = useState<UpsellOpportunity[]>(remoteMode ? [] : initialPersistedState?.opportunities ?? INITIAL_UPSELL_OPPORTUNITIES);
  const [experiences, setExperiences] = useState<ExperienceService[]>(remoteMode ? [] : initialPersistedState?.experiences ?? INITIAL_EXPERIENCES);
  const [remoteHydratedHotelId, setRemoteHydratedHotelId] = useState<string | null>(null);
  const [authorizedMemberships, setAuthorizedMemberships] = useState<AuthorizedMembership[]>([]);
  const [attentionItems] = useState<AttentionItem[]>(INITIAL_ATTENTION_ITEMS);
  const [selectedAssetHistory, setSelectedAssetHistory] = useState<AssetMaintenanceHistory | null>(
    ASSET_HISTORIES['asset-ac-407'] || null
  );

  useEffect(() => {
    if (remoteMode) return;
    savePersistedState({
      version: 1,
      rooms,
      staff,
      requests,
      incidents,
      opportunities,
      experiences,
    });
  }, [remoteMode, rooms, staff, requests, incidents, opportunities, experiences]);

  useEffect(() => {
    if (!remoteMode) return;
    let active = true;
    Promise.all([getAuthorizedHotels(), getAuthorizedMemberships()]).then(([hotels, memberships]) => {
      if (!active) return;
      setRemoteLoadError('');
      setAuthorizedMemberships(memberships);
      if (hotels.length > 0) {
        setAvailableHotels(hotels);
        const selectedHotel = hotels.some((hotel) => hotel.id === activeHotel.id) ? activeHotel : hotels[0];
        const membership = memberships.find((item) => item.hotelId === selectedHotel.id);
        setActiveHotel(selectedHotel);
        if (membership) {
          setCurrentRole(membership.role);
          if (membership.staffId) setCurrentStaffId(membership.staffId);
        }
      } else {
        setAvailableHotels([]);
        setRemoteLoadError('Tu usuario inició sesión correctamente, pero todavía no tiene hoteles asignados. Un administrador debe vincularlo en hotel_members.');
      }
    }).catch((error) => {
      console.error('No se pudieron cargar los hoteles autorizados de Supabase:', error);
      setAvailableHotels([]);
      setRemoteLoadError('No pudimos consultar tus hoteles autorizados. Revisá la conexión e intentá iniciar sesión nuevamente.');
    }).finally(() => {
      if (active) setRemoteHotelsLoaded(true);
    });
    return () => { active = false; };
  }, [remoteMode]);

  useEffect(() => {
    if (!remoteMode) return;
    const membership = authorizedMemberships.find((item) => item.hotelId === activeHotel.id);
    if (!membership) return;
    setCurrentRole(membership.role);
    if (membership.staffId) setCurrentStaffId(membership.staffId);
  }, [remoteMode, authorizedMemberships, activeHotel.id]);

  useEffect(() => {
    if (!remoteMode || !remoteHotelsLoaded) return;
    const targetHotelId = activeHotel?.id || INITIAL_HOTELS[0].id;
    let active = true;
    setRemoteHydratedHotelId(null);
    supabaseRepository.loadState(targetHotelId).then((state) => {
      if (!active || !state) return;
      
      setRooms(state.rooms);
      setStaff(state.staff);
      setRequests(state.requests);
      setIncidents(state.incidents);
      setOpportunities(state.opportunities);
      setExperiences(state.experiences);
      setRemoteHydratedHotelId(targetHotelId);
    }).catch((error) => {
      console.error('No se pudieron cargar los datos del hotel de Supabase:', error);
      setRemoteLoadError('No pudimos cargar la información operativa del hotel. No se realizaron cambios.');
    });
    return () => { active = false; };
  }, [remoteMode, remoteHotelsLoaded, activeHotel?.id]);

  useEffect(() => {
    if (!remoteMode || remoteHydratedHotelId !== activeHotel.id) return;
    const timer = window.setTimeout(() => {
      supabaseRepository.saveState(activeHotel.id, { version: 1, rooms, staff, requests, incidents, opportunities, experiences })
        .catch((error) => console.error('No se pudieron guardar los datos del hotel', error));
    }, 400);
    return () => window.clearTimeout(timer);
  }, [remoteMode, remoteHydratedHotelId, activeHotel.id, rooms, staff, requests, incidents, opportunities, experiences]);

  // Notifications
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Guided Tour
  const [guidedTourActive, setGuidedTourActive] = useState<boolean>(false);
  const [tourStep, setTourStep] = useState<number>(0);

  const showToast = (title: string, message: string, type: ToastNotification['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, title, message, type, timestamp: 'Ahora' }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 1. Create Guest Request
  const createGuestRequest = ({
    category,
    title,
    details,
    quantity = 1,
    sector = 'housekeeping',
    priority = 'media',
    roomNumber = guestRoomNumber,
  }: {
    category: GuestRequest['category'];
    title: string;
    details: string;
    quantity?: number;
    sector?: SectorType;
    priority?: PriorityType;
    roomNumber?: string;
  }) => {
    const activeHotelId = activeHotel?.id || 'hotel-grand-pulse';
    const activeRoom = rooms.find((r) => r.hotelId === activeHotelId && r.number === roomNumber);
    const guestName = activeRoom?.currentGuest?.name || 'Huésped Habitación ' + roomNumber;

    // Automatic sector classification if needed
    let determinedSector: SectorType = sector;
    if (category === 'toallas' || category === 'limpieza' || category === 'almohadas') {
      determinedSector = 'housekeeping';
    } else if (category === 'mantenimiento') {
      determinedSector = 'maintenance';
    } else if (category === 'room_service') {
      determinedSector = 'room_service';
    } else if (category === 'recepcion' || category === 'late_checkout' || category === 'cochera' || category === 'traslado') {
      determinedSector = 'front_desk';
    }

    const now = new Date().toISOString();
    const newReq: GuestRequest = {
      id: `req-${Date.now()}`,
      hotelId: activeHotelId,
      roomNumber,
      guestName,
      title,
      category,
      details,
      quantity,
      sector: determinedSector,
      createdAt: now,
      priority,
      status: 'nueva',
      timeline: [
        {
          stage: 'solicitado',
          timestamp: 'Justo ahora',
          actor: `Huésped (${guestName})`,
        },
      ],
    };

    setRequests((prev) => [newReq, ...prev]);

    // Update room active request counter
    setRooms((prev) =>
      prev.map((r) => (r.hotelId === activeHotelId && r.number === roomNumber ? { ...r, activeRequestsCount: r.activeRequestsCount + 1 } : r))
    );

    showToast(
      '¡Solicitud Registrada!',
      `Habitación ${roomNumber}: ${title} enviada a Recepción.`,
      'success'
    );

    return newReq;
  };

  // 2. Assign Request (Reception -> Staff)
  const assignRequest = (requestId: string, staffId: string) => {
    const staffMember = staff.find((s) => s.id === staffId);
    const currentRequest = requests.find((req) => req.id === requestId);
    if (!staffMember || !currentRequest || currentRequest.status !== 'nueva') return;
    if (staffMember.hotelId !== currentRequest.hotelId) {
      showToast('Asignación bloqueada', 'El empleado no pertenece al hotel de la solicitud.', 'error');
      return;
    }

    setRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          const updatedTimeline = [
            ...req.timeline,
            {
              stage: 'aceptado' as const,
              timestamp: 'Justo ahora',
              actor: `Recepción asignó a ${staffMember.name}`,
            },
          ];
          return {
            ...req,
            assignedToId: staffMember.id,
            assignedToName: staffMember.name,
            assignedSector: staffMember.sector,
            status: 'asignada',
            acceptedAt: new Date().toISOString(),
            timeline: updatedTimeline,
          };
        }
        return req;
      })
    );

    // Update staff active tasks count
    setStaff((prev) =>
      prev.map((s) => (s.id === staffId ? { ...s, activeTasks: s.activeTasks + 1, status: 'en_tarea' } : s))
    );

    showToast(
      'Tarea Asignada',
      `Solicitud asignada a ${staffMember.name} (${staffMember.roleTitle}).`,
      'info'
    );
  };

  // 3. Staff Accept / In Transit
  const staffAcceptTask = (requestId: string) => {
    const currentRequest = requests.find((req) => req.id === requestId);
    if (!currentRequest || currentRequest.status !== 'asignada') return;

    setRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          const updatedTimeline = [
            ...req.timeline,
            {
              stage: 'en_camino' as const,
              timestamp: 'Justo ahora',
              actor: `${req.assignedToName || 'Personal'} en camino a Hab. ${req.roomNumber}`,
            },
          ];
          return {
            ...req,
            status: 'en_proceso',
            inTransitAt: new Date().toISOString(),
            timeline: updatedTimeline,
          };
        }
        return req;
      })
    );

    showToast(
      'En Proceso',
      'El personal ha aceptado el pedido y va en camino a la habitación.',
      'info'
    );
  };

  // 4. Staff Complete Task
  const staffCompleteTask = (requestId: string, notes?: string) => {
    const req = requests.find((r) => r.id === requestId);
    if (!req || req.status !== 'en_proceso') return;

    const completedTime = new Date();
    setRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          const createdTime = new Date(req.createdAt).getTime();
          const diffMinutes = Math.max(1, Math.round((completedTime.getTime() - createdTime) / 60000));

          const updatedTimeline = [
            ...req.timeline,
            {
              stage: 'entregado' as const,
              timestamp: 'Completado ahora',
              actor: `${req.assignedToName || 'Personal'} entregó el pedido`,
            },
          ];

          return {
            ...req,
            status: 'resuelta',
            completedAt: completedTime.toISOString(),
            resolutionTimeMinutes: diffMinutes,
            notes: notes || req.notes,
            timeline: updatedTimeline,
          };
        }
        return req;
      })
    );

    // Decrement staff active tasks
    if (req.assignedToId) {
      setStaff((prev) =>
        prev.map((s) =>
          s.id === req.assignedToId
            ? { ...s, activeTasks: Math.max(0, s.activeTasks - 1), status: s.activeTasks <= 1 ? 'disponible' : 'en_tarea' }
            : s
        )
      );
    }

    if (req?.roomNumber) {
      setRooms((prev) =>
        prev.map((r) =>
          r.hotelId === req.hotelId && r.number === req.roomNumber ? { ...r, activeRequestsCount: Math.max(0, r.activeRequestsCount - 1) } : r
        )
      );
    }

    showToast(
      '¡Servicio Entregado!',
      `Pedido resuelto para la habitación ${req?.roomNumber || ''}. Tiempo computado en métricas.`,
      'success'
    );
  };

  const updateRequestStatus = (requestId: string, status: RequestStatus) => {
    const req = requests.find((item) => item.id === requestId);
    if (!req || req.status === status) return;

    if (status === 'en_proceso' && req.status === 'asignada') {
      staffAcceptTask(requestId);
      return;
    }

    if (status === 'resuelta' && req.status === 'en_proceso') {
      staffCompleteTask(requestId);
      return;
    }

    showToast(
      'Cambio de estado no permitido',
      'La solicitud debe avanzar en orden: nueva → asignada → en proceso → resuelta.',
      'warning'
    );
  };

  // Maintenance Actions
  const createMaintenanceIncident = (incidentData: Omit<MaintenanceIncident, 'id' | 'hotelId' | 'date'>) => {
    const activeHotelId = activeHotel?.id || 'hotel-grand-pulse';
    const newInc: MaintenanceIncident = {
      ...incidentData,
      id: `inc-${Date.now()}`,
      hotelId: activeHotelId,
      date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
    };

    setIncidents((prev) => [newInc, ...prev]);

    setRooms((prev) =>
      prev.map((r) =>
        r.hotelId === activeHotelId && r.number === incidentData.roomNumber
          ? { ...r, status: 'mantenimiento', activeIssuesCount: r.activeIssuesCount + 1 }
          : r
      )
    );

    showToast('Incidencia Creada', `Reportada en Habitación ${incidentData.roomNumber}: ${incidentData.assetName}`, 'warning');
  };

  const updateIncidentStatus = (id: string, status: MaintenanceIncident['status'], finalCost?: number) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, status, finalCost: finalCost ?? inc.finalCost } : inc))
    );
    showToast('Incidencia Actualizada', `Estado cambiado a: ${status.replace('_', ' ')}`, 'info');
  };

  // Upsell & Experiences
  const sendUpsellProposal = (id: string) => {
    setOpportunities((prev) =>
      prev.map((opp) => (opp.id === id ? { ...opp, status: 'propuesta_enviada' } : opp))
    );
    showToast('Propuesta Enviada', 'La oferta ha sido notificada al portal del huésped.', 'success');
  };

  const toggleExperience = (id: string) => {
    setExperiences((prev) =>
      prev.map((exp) => (exp.id === id ? { ...exp, active: !exp.active } : exp))
    );
  };

  const bookExperience = (experienceId: string, roomNumber: string) => {
    const activeHotelId = activeHotel?.id || 'hotel-grand-pulse';
    const exp = experiences.find((e) => e.id === experienceId && e.hotelId === activeHotelId);
    if (!exp) return;

    setExperiences((prev) =>
      prev.map((e) => (e.id === experienceId && e.hotelId === activeHotelId ? { ...e, activeBookings: e.activeBookings + 1 } : e))
    );

    // Create a request in reception
    createGuestRequest({
      category: 'experiencias',
      title: `Reserva: ${exp.title}`,
      details: `Huésped reservó servicio '${exp.title}' ($${exp.price} USD). Comisión hotel: $${exp.hotelCommissionAmount.toFixed(2)} USD.`,
      quantity: 1,
      sector: 'concierge',
      priority: 'alta',
      roomNumber,
    });

    showToast('Reserva Registrada', `Se ha procesado la reserva de '${exp.title}' para la Hab. ${roomNumber}`, 'success');
  };

  const addRoom = (room: Pick<Room, 'number' | 'type' | 'floor'>) => {
    const activeHotelId = activeHotel?.id || 'hotel-grand-pulse';
    const normalizedNumber = room.number.trim();
    const duplicate = rooms.some(
      (existingRoom) => existingRoom.hotelId === activeHotelId && existingRoom.number === normalizedNumber
    );
    if (!normalizedNumber || duplicate) {
      showToast('Habitación no guardada', duplicate ? 'Ya existe una habitación con ese número en este hotel.' : 'Ingresá un número de habitación.', 'warning');
      return false;
    }

    setRooms((prev) => [...prev, {
      id: `room-${activeHotelId}-${Date.now()}`,
      hotelId: activeHotelId,
      number: normalizedNumber,
      type: room.type,
      floor: room.floor,
      status: 'disponible',
      activeIssuesCount: 0,
      activeRequestsCount: 0,
    }]);
    showToast('Habitación agregada', `Habitación ${normalizedNumber} disponible en ${activeHotel?.name || 'el hotel'}.`, 'success');
    return true;
  };

  const addStaffMember = (member: Pick<StaffMember, 'name' | 'sector' | 'roleTitle' | 'phone'>) => {
    const activeHotelId = activeHotel?.id || 'hotel-grand-pulse';
    const initials = (member.name || 'P').trim().split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
    setStaff((prev) => [...prev, {
      ...member,
      id: `staff-${Date.now()}`,
      hotelId: activeHotelId,
      activeTasks: 0,
      avatar: initials,
      status: 'disponible',
    }]);
    showToast('Personal agregado', `${member.name} fue incorporado a ${activeHotel?.name || 'el hotel'}.`, 'success');
  };

  const addExperience = (experience: Omit<ExperienceService, 'id' | 'hotelId' | 'activeBookings' | 'hotelCommissionAmount'>) => {
    const activeHotelId = activeHotel?.id || 'hotel-grand-pulse';
    const commission = Number(((experience.price * experience.hotelCommissionRate) / 100).toFixed(2));
    setExperiences((prev) => [...prev, {
      ...experience,
      id: `exp-${Date.now()}`,
      hotelId: activeHotelId,
      activeBookings: 0,
      hotelCommissionAmount: commission,
    }]);
    showToast('Servicio publicado', `${experience.title} ya forma parte del catálogo del hotel.`, 'success');
  };

  const resetDemoData = () => {
    if (remoteMode) {
      showToast('Acción no disponible', 'Los datos compartidos no se reinician desde el modo de demostración.', 'warning');
      return;
    }
    clearPersistedState();
    setRooms(INITIAL_ROOMS);
    setStaff(INITIAL_STAFF);
    setRequests(INITIAL_REQUESTS);
    setIncidents(INITIAL_MAINTENANCE_INCIDENTS);
    setOpportunities(INITIAL_UPSELL_OPPORTUNITIES);
    setExperiences(INITIAL_EXPERIENCES);
    showToast('Datos Reiniciados', 'Valores de demostración restaurados a su estado inicial.', 'info');
  };

  const nextTourStep = () => setTourStep((prev) => prev + 1);
  const prevTourStep = () => setTourStep((prev) => Math.max(0, prev - 1));

  if (remoteMode && (!remoteHotelsLoaded || remoteLoadError || remoteHydratedHotelId !== activeHotel.id)) {
    const loadingMessage = remoteHotelsLoaded
      ? 'Cargando la información operativa del hotel seleccionado.'
      : 'Buscando los hoteles autorizados para tu usuario.';
    return <main className="min-h-screen bg-slate-950 grid place-items-center p-6"><div className="max-w-lg rounded-3xl bg-white p-8"><h1 className="text-xl font-bold text-slate-900">{remoteLoadError ? 'No se pudo abrir Hotel Pulse' : 'Cargando Hotel Pulse…'}</h1><p className="mt-2 text-slate-600">{remoteLoadError || loadingMessage}</p></div></main>;
  }

  return (
    <HotelPulseContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        adminView,
        setAdminView,
        activeHotel,
        setActiveHotel,
        availableHotels,
        guestRoomNumber,
        setGuestRoomNumber,
        currentStaffId,
        setCurrentStaffId,
        rooms,
        staff,
        requests,
        incidents,
        assetHistories,
        opportunities,
        experiences,
        attentionItems,
        createGuestRequest,
        assignRequest,
        staffAcceptTask,
        staffCompleteTask,
        updateRequestStatus,
        createMaintenanceIncident,
        updateIncidentStatus,
        sendUpsellProposal,
        toggleExperience,
        bookExperience,
        addRoom,
        addStaffMember,
        addExperience,
        toasts,
        dismissToast,
        showToast,
        resetDemoData,
        selectedAssetHistory,
        setSelectedAssetHistory,
        guidedTourActive,
        setGuidedTourActive,
        tourStep,
        nextTourStep,
        prevTourStep,
      }}
    >
      {children}
    </HotelPulseContext.Provider>
  );
};

export const useHotelPulse = () => {
  const context = useContext(HotelPulseContext);
  if (!context) {
    throw new Error('useHotelPulse must be used within a HotelPulseProvider');
  }
  return context;
};
