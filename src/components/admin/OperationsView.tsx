import React, { useState } from 'react';
import { useHotelPulse } from '../../context/HotelPulseContext';
import { GuestRequest, RequestStatus, PriorityType, SectorType } from '../../types';
import {
  Filter,
  Search,
  UserCheck,
  Clock,
  AlertCircle,
  CheckCircle2,
  Send,
  MoreVertical,
  Plus,
  RefreshCw,
  UserPlus,
} from 'lucide-react';

export const OperationsView: React.FC = () => {
  const {
    activeHotel,
    requests,
    staff,
    assignRequest,
    updateRequestStatus,
    staffAcceptTask,
    staffCompleteTask,
    createGuestRequest,
    rooms,
  } = useHotelPulse();

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRoom, setFilterRoom] = useState<string>('all');
  const [filterSector, setFilterSector] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // Fast manual request modal
  const [showNewModal, setShowNewModal] = useState(false);
  const [newRoom, setNewRoom] = useState('304');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<GuestRequest['category']>('toallas');
  const [newDetails, setNewDetails] = useState('');
  const [newPriority, setNewPriority] = useState<PriorityType>('media');

  // Quick assign modal
  const [assigningReqId, setAssigningReqId] = useState<string | null>(null);

  const hotelRooms = rooms.filter((room) => room.hotelId === activeHotel.id);
  const hotelRequests = requests.filter((req) => req.hotelId === activeHotel.id);

  // Filter logic
  const filteredRequests = hotelRequests.filter((req) => {
    if (filterRoom !== 'all' && req.roomNumber !== filterRoom) return false;
    if (filterSector !== 'all' && req.sector !== filterSector) return false;
    if (filterStatus !== 'all' && req.status !== filterStatus) return false;
    if (filterPriority !== 'all' && req.priority !== filterPriority) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        req.title.toLowerCase().includes(q) ||
        req.guestName.toLowerCase().includes(q) ||
        req.roomNumber.includes(q) ||
        req.details.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreateManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    createGuestRequest({
      category: newCategory,
      title: newTitle,
      details: newDetails || `Solicitud registrada manualmente para habitación ${newRoom}`,
      quantity: 1,
      priority: newPriority,
      roomNumber: newRoom,
    });
    setNewTitle('');
    setNewDetails('');
    setShowNewModal(false);
  };

  // Helper for elapsed time calculation
  const getElapsedTimeText = (createdAt: string) => {
    const diffMs = Date.now() - new Date(createdAt).getTime();
    const diffMin = Math.max(1, Math.floor(diffMs / 60000));
    if (diffMin < 60) return `${diffMin} min`;
    const hours = Math.floor(diffMin / 60);
    const remMin = diffMin % 60;
    return `${hours}h ${remMin}m`;
  };

  const isOverdue = (createdAt: string, status: RequestStatus) => {
    if (status === 'resuelta') return false;
    const diffMs = Date.now() - new Date(createdAt).getTime();
    return diffMs > 15 * 60 * 1000; // >15 minutes
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Title and Fast Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 font-['Outfit']">
              Centro de Operaciones & Despacho
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
              Tiempo Real
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitoreo en vivo de pedidos de huéspedes, asignación a personal y tiempos de cumplimiento.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="open-manual-request-modal-btn"
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Solicitud Manual</span>
          </button>
        </div>
      </div>

      {/* FILTER CONTROLS (Habitación, Sector, Estado, Prioridad, Buscador) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              id="operations-search-input"
              type="text"
              placeholder="Buscar huésped, pedido..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Filter by Room */}
          <div>
            <select
              id="filter-room-select"
              value={filterRoom}
              onChange={(e) => setFilterRoom(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="all">Todas las Habitaciones</option>
              {hotelRooms.map((r) => (
                <option key={r.id} value={r.number}>
                  Habitación {r.number} ({r.type})
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Sector */}
          <div>
            <select
              id="filter-sector-select"
              value={filterSector}
              onChange={(e) => setFilterSector(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="all">Todos los Sectores</option>
              <option value="housekeeping">Limpieza & Pisos</option>
              <option value="maintenance">Mantenimiento Técnico</option>
              <option value="room_service">Room Service / Gastronomía</option>
              <option value="concierge">Concierge / Experiencias</option>
              <option value="front_desk">Recepción</option>
            </select>
          </div>

          {/* Filter by Status */}
          <div>
            <select
              id="filter-status-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="all">Todos los Estados</option>
              <option value="nueva">Nueva</option>
              <option value="asignada">Asignada</option>
              <option value="en_proceso">En Proceso</option>
              <option value="resuelta">Resuelta</option>
            </select>
          </div>

          {/* Filter by Priority */}
          <div>
            <select
              id="filter-priority-select"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="all">Todas las Prioridades</option>
              <option value="urgente">Urgente</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
          <div>
            Mostrando <span className="font-bold text-slate-800">{filteredRequests.length}</span> solicitudes
          </div>
          {(filterRoom !== 'all' || filterSector !== 'all' || filterStatus !== 'all' || filterPriority !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setFilterRoom('all');
                setFilterSector('all');
                setFilterStatus('all');
                setFilterPriority('all');
                setSearchQuery('');
              }}
              className="text-amber-700 hover:text-amber-800 font-semibold"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* OPERATIONS TABLE / REAL-TIME LIST */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3.5 px-4">Habitación</th>
                <th className="py-3.5 px-4">Huésped</th>
                <th className="py-3.5 px-4">Solicitud</th>
                <th className="py-3.5 px-4">Sector</th>
                <th className="py-3.5 px-4">Hora</th>
                <th className="py-3.5 px-4">Prioridad</th>
                <th className="py-3.5 px-4">Responsable</th>
                <th className="py-3.5 px-4">Tiempo Transcurrido</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4 text-right">Acción Rápida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No se encontraron solicitudes con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const elapsed = getElapsedTimeText(req.createdAt);
                  const delayed = isOverdue(req.createdAt, req.status);

                  // Priority Pill
                  let priorityBadge = (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 uppercase">
                      {req.priority}
                    </span>
                  );
                  if (req.priority === 'urgente') {
                    priorityBadge = (
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-100 text-rose-700 uppercase animate-pulse">
                        Urgente
                      </span>
                    );
                  } else if (req.priority === 'alta') {
                    priorityBadge = (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                        Alta
                      </span>
                    );
                  }

                  // Status Pill
                  let statusBadge = (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      Nueva
                    </span>
                  );
                  if (req.status === 'asignada') {
                    statusBadge = (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        Asignada
                      </span>
                    );
                  } else if (req.status === 'en_proceso') {
                    statusBadge = (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
                        En Proceso
                      </span>
                    );
                  } else if (req.status === 'resuelta') {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Resuelta
                      </span>
                    );
                  }

                  return (
                    <tr
                      key={req.id}
                      id={`request-row-${req.id}`}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        delayed ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      {/* Habitación */}
                      <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                        <div className="flex items-center gap-1.5">
                          <span className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-xs">
                            {req.roomNumber}
                          </span>
                        </div>
                      </td>

                      {/* Huésped */}
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        <div>{req.guestName}</div>
                      </td>

                      {/* Solicitud */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-bold text-slate-900 truncate">{req.title}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">{req.details}</div>
                      </td>

                      {/* Sector */}
                      <td className="py-3.5 px-4 capitalize text-slate-600 font-medium">
                        {req.sector === 'housekeeping' && 'Limpieza'}
                        {req.sector === 'maintenance' && 'Mantenimiento'}
                        {req.sector === 'room_service' && 'Room Service'}
                        {req.sector === 'front_desk' && 'Recepción'}
                        {req.sector === 'concierge' && 'Concierge'}
                      </td>

                      {/* Hora */}
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      {/* Prioridad */}
                      <td className="py-3.5 px-4">{priorityBadge}</td>

                      {/* Responsable */}
                      <td className="py-3.5 px-4">
                        {req.assignedToName ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="font-semibold text-slate-800">{req.assignedToName}</span>
                          </div>
                        ) : (
                          <button
                            id={`assign-btn-${req.id}`}
                            onClick={() => setAssigningReqId(req.id)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-200 transition-colors"
                          >
                            <UserPlus className="w-3 h-3" />
                            <span>Asignar</span>
                          </button>
                        )}
                      </td>

                      {/* Tiempo transcurrido */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <Clock className={`w-3.5 h-3.5 ${delayed ? 'text-rose-500' : 'text-slate-400'}`} />
                          <span
                            className={`font-semibold text-xs ${
                              delayed ? 'text-rose-700 font-bold' : 'text-slate-700'
                            }`}
                          >
                            {req.status === 'resuelta'
                              ? `${req.resolutionTimeMinutes || 12} min (total)`
                              : elapsed}
                          </span>
                          {delayed && (
                            <span
                              className="text-[9px] font-bold px-1 bg-rose-100 text-rose-700 rounded"
                              title="Supera los 15 min de atención estándar"
                            >
                              &gt;15m!
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Estado */}
                      <td className="py-3.5 px-4">{statusBadge}</td>

                      {/* Acción Rápida */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {req.status === 'nueva' && (
                            <button
                              id={`quick-assign-staff-1-${req.id}`}
                              onClick={() => assignRequest(req.id, 'staff-1')}
                              className="px-2 py-1 rounded bg-slate-900 text-white hover:bg-slate-800 text-[11px] font-bold transition-all"
                              title="Asignar a Carlos Méndez (Limpieza)"
                            >
                              Asignar a Carlos
                            </button>
                          )}
                          {req.status === 'asignada' && (
                            <button
                              id={`quick-transit-${req.id}`}
                              onClick={() => staffAcceptTask(req.id)}
                              className="px-2 py-1 rounded bg-amber-500 text-slate-950 hover:bg-amber-400 text-[11px] font-bold transition-all"
                            >
                              Aceptar (En camino)
                            </button>
                          )}
                          {req.status === 'en_proceso' && (
                            <button
                              id={`quick-complete-${req.id}`}
                              onClick={() => staffCompleteTask(req.id)}
                              className="px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-500 text-[11px] font-bold transition-all"
                            >
                              Entregar
                            </button>
                          )}
                          {req.status === 'resuelta' && (
                            <span className="text-[11px] text-slate-400 font-medium">Finalizado</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ASSIGNMENT MODAL */}
      {assigningReqId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Asignar Responsable</h3>
            <p className="text-xs text-slate-500 mb-4">
              Selecciona el empleado de guardia disponible para ejecutar la tarea.
            </p>
            <div className="space-y-2">
              {staff.map((member) => (
                <button
                  key={member.id}
                  id={`assign-member-${member.id}`}
                  onClick={() => {
                    assignRequest(assigningReqId, member.id);
                    setAssigningReqId(null);
                  }}
                  className="w-full p-3 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 flex items-center justify-between text-left transition-all"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">{member.name}</div>
                      <div className="text-[11px] text-slate-500">{member.roleTitle}</div>
                    </div>
                  </div>
                  <div className="text-right text-[11px]">
                    <span
                      className={`px-2 py-0.5 rounded-full font-semibold ${
                        member.status === 'disponible'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {member.activeTasks} tareas activas
                    </span>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setAssigningReqId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE MANUAL REQUEST MODAL */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Nueva Solicitud Manual</h3>
            <p className="text-xs text-slate-500 mb-4">
              Carga una solicitud recibida por teléfono, intercomunicador o mostrador.
            </p>

            <form onSubmit={handleCreateManual} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Habitación</label>
                <select
                  value={newRoom}
                  onChange={(e) => setNewRoom(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.number}>
                      Habitación {r.number} &mdash; {r.type} ({r.currentGuest?.name || 'Sin huésped'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Categoría</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="toallas">Toallas adicionales</option>
                  <option value="limpieza">Limpieza de habitación</option>
                  <option value="almohadas">Almohadas / Ropa blanca</option>
                  <option value="mantenimiento">Mantenimiento técnico</option>
                  <option value="room_service">Room Service / Gastronomía</option>
                  <option value="late_checkout">Late Checkout</option>
                  <option value="recepcion">Consulta a Recepción</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Título de la Solicitud</label>
                <input
                  type="text"
                  placeholder="Ej. 2 Toallas adicionales, Revisión de ducha..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Detalles / Instrucciones</label>
                <textarea
                  rows={2}
                  placeholder="Detalles adicionales..."
                  value={newDetails}
                  onChange={(e) => setNewDetails(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Prioridad</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as PriorityType)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800"
                >
                  Crear Solicitud
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
