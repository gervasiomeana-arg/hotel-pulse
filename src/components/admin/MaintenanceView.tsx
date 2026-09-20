import React, { useState } from 'react';
import { useHotelPulse } from '../../context/HotelPulseContext';
import { MaintenanceIncident, PriorityType } from '../../types';
import {
  Wrench,
  AlertTriangle,
  Plus,
  Clock,
  DollarSign,
  History,
  CheckCircle2,
  Image as ImageIcon,
  ChevronRight,
  ShieldCheck,
  Building,
  User,
  ExternalLink,
} from 'lucide-react';

export const MaintenanceView: React.FC = () => {
  const {
    activeHotel,
    incidents,
    rooms,
    staff,
    createMaintenanceIncident,
    updateIncidentStatus,
    assetHistories,
    selectedAssetHistory,
    setSelectedAssetHistory,
  } = useHotelPulse();

  const activeHotelId = activeHotel?.id || 'hotel-grand-pulse';
  const hotelRooms = rooms.filter((room) => room.hotelId === activeHotelId);
  const hotelIncidents = incidents.filter((incident) => incident.hotelId === activeHotelId);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roomNumber, setRoomNumber] = useState('407');
  const [assetName, setAssetName] = useState('Aire Acondicionado Split Inverter');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80');
  const [priority, setPriority] = useState<PriorityType>('alta');
  const [assignedTo, setAssignedTo] = useState('Roberto Silva (Técnico HVAC)');
  const [estimatedCost, setEstimatedCost] = useState(180);

  // Default to Hab 407 AC history as requested by prompt
  const activeAsset = selectedAssetHistory || assetHistories['asset-ac-407'];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName.trim() || !description.trim()) return;

    createMaintenanceIncident({
      roomNumber,
      assetName,
      description,
      photoUrl,
      priority,
      assignedTo,
      status: 'pendiente',
      estimatedCost: Number(estimatedCost) || 0,
      historyAssetId: roomNumber === '407' ? 'asset-ac-407' : undefined,
    });

    setDescription('');
    setShowCreateModal(false);
  };

  const handleStatusChange = (id: string, newStatus: MaintenanceIncident['status']) => {
    const finalCost = newStatus === 'reparado' ? 175 : undefined;
    updateIncidentStatus(id, newStatus, finalCost);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 font-['Outfit']">
              Gestión de Mantenimiento & Control de Activos
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">
              Módulo Técnico
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro de incidencias, costos de reparación e historial acumulado por equipo y habitación.
          </p>
        </div>

        <button
          id="open-new-incident-modal-btn"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Reportar Nueva Incidencia</span>
        </button>
      </div>

      {/* HIGHLIGHTED ASSET HISTORICAL PROFILE: HABITACIÓN 407 (REQUIRED BY PROMPT) */}
      {activeAsset && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white rounded-2xl p-6 border border-slate-800 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-400/30">
                <History className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-400 text-slate-950">
                    Historial de Activo
                  </span>
                  <span className="text-xs font-mono text-slate-400">Habitación {activeAsset.roomNumber}</span>
                </div>
                <h2 className="text-lg font-bold text-white mt-1 font-['Outfit']">
                  {activeAsset.assetName}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Registro preventivo y correctivo para toma de decisiones de reemplazo vs reparación.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Reparaciones</span>
                <span className="text-lg font-bold text-amber-400">{activeAsset.repairsCount} registradas</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Costo Acumulado</span>
                <span className="text-lg font-bold text-white">${activeAsset.accumulatedCost} USD</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Último Service</span>
                <span className="text-xs font-semibold text-slate-200 mt-1 block truncate">12 Ago 2026</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Próxima Revisión</span>
                <span className="text-xs font-semibold text-emerald-400 mt-1 block">25 Oct 2026</span>
              </div>
            </div>
          </div>

          {/* Asset Historical Logs List */}
          <div className="mt-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              Línea de Tiempo de Intervenciones
            </h3>
            <div className="space-y-2.5">
              {activeAsset.recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-slate-800/50 border border-slate-700/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] text-slate-400 w-24">{log.date}</span>
                    <span className="font-semibold text-white">{log.issue}</span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-300">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-500" />
                      {log.technician}
                    </span>
                    <span className="font-mono font-bold text-amber-300">${log.cost} USD</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        log.status === 'resuelto'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300 animate-pulse'
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE INCIDENTS LIST */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-900 font-['Outfit']">
            Incidencias Activas ({hotelIncidents.length})
          </h2>
          <span className="text-xs text-slate-500">
            {hotelIncidents.filter((i) => i.status !== 'reparado').length} pendientes de resolución
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hotelIncidents.map((incident) => {
            let priorityPill = (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                {incident.priority}
              </span>
            );
            if (incident.priority === 'urgente' || incident.priority === 'alta') {
              priorityPill = (
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-rose-100 text-rose-800">
                  {incident.priority}
                </span>
              );
            }

            return (
              <div
                key={incident.id}
                id={`incident-card-${incident.id}`}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Photo if present */}
                  {incident.photoUrl && (
                    <div className="mb-3 h-32 rounded-xl overflow-hidden relative border border-slate-200">
                      <img
                        src={incident.photoUrl}
                        alt={incident.assetName}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-950/70 text-white text-[10px] font-semibold backdrop-blur-sm flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" />
                        Foto adjunta
                      </span>
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-6 h-6 rounded bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center">
                          {incident.roomNumber}
                        </span>
                        <span className="text-xs font-bold text-slate-900 truncate">{incident.assetName}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">{incident.description}</p>
                    </div>
                    {priorityPill}
                  </div>

                  {/* Details block */}
                  <div className="mt-4 p-2.5 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Técnico responsable:</span>
                      <span className="font-semibold text-slate-900">{incident.assignedTo}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Fecha de reporte:</span>
                      <span className="font-mono text-slate-700">{incident.date}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Costo Estimado:</span>
                      <span className="font-mono font-semibold text-slate-900">${incident.estimatedCost} USD</span>
                    </div>
                    {incident.finalCost !== undefined && (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                        <span className="font-bold text-emerald-800">Costo Final:</span>
                        <span className="font-mono font-bold text-emerald-800">${incident.finalCost} USD</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* State selector & Quick actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <select
                    id={`incident-status-select-${incident.id}`}
                    value={incident.status}
                    onChange={(e) => handleStatusChange(incident.id, e.target.value as any)}
                    className="text-xs px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg font-bold text-slate-800"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en_revision">En Revisión</option>
                    <option value="esperando_repuesto">Esperando Repuesto</option>
                    <option value="reparado">Reparado / Resuelto</option>
                  </select>

                  {incident.historyAssetId && (
                    <button
                      onClick={() => {
                        const hist = assetHistories[incident.historyAssetId!];
                        if (hist) setSelectedAssetHistory(hist);
                      }}
                      className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                    >
                      <span>Ver historial</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CREATE NEW INCIDENT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Registrar Incidencia de Mantenimiento</h3>
            <p className="text-xs text-slate-500 mb-4">
              Crea un ticket técnico con cálculo de costo estimado y asignación.
            </p>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Habitación</label>
                  <select
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    {hotelRooms.map((r) => (
                      <option key={r.id} value={r.number}>
                        Habitación {r.number}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Prioridad</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as PriorityType)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Elemento / Activo Afectado</label>
                <input
                  type="text"
                  placeholder="Ej. Aire Acondicionado, Cerradura, Grifería..."
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Descripción del Problema</label>
                <textarea
                  rows={3}
                  placeholder="Detallar síntoma, ruidos, fugas..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Técnico Asignado</label>
                  <input
                    type="text"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Costo Estimado (USD)</label>
                  <input
                    type="number"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Fotografía / Evidencia (URL)</label>
                <input
                  type="text"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800"
                >
                  Guardar Incidencia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
