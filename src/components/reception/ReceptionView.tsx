import React, { useState } from 'react';
import { useHotelPulse } from '../../context/HotelPulseContext';
import {
  ConciergeBell,
  Clock,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Phone,
  Search,
  Check,
  Send,
  UserCheck,
  User,
  Sparkles,
} from 'lucide-react';

export const ReceptionView: React.FC = () => {
  const {
    requests,
    staff,
    assignRequest,
    staffAcceptTask,
    staffCompleteTask,
    rooms,
    activeHotel,
  } = useHotelPulse();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('all');

  const activeHotelId = activeHotel?.id || 'hotel-grand-pulse';
  const hotelRequests = requests.filter((r) => r.hotelId === activeHotelId);
  const hotelStaff = staff.filter((member) => member.hotelId === activeHotelId);
  const newRequests = hotelRequests.filter((r) => r.status === 'nueva');
  const inProgressRequests = hotelRequests.filter(
    (r) => r.status === 'asignada' || r.status === 'en_proceso'
  );
  const resolvedToday = hotelRequests.filter((r) => r.status === 'resuelta');
  const getActiveTaskCount = (staffId: string) => hotelRequests.filter(
    (request) => request.assignedToId === staffId && (request.status === 'asignada' || request.status === 'en_proceso')
  ).length;

  const getElapsedTimeText = (createdAt: string) => {
    const diffMs = Date.now() - new Date(createdAt).getTime();
    const diffMin = Math.max(1, Math.floor(diffMs / 60000));
    if (diffMin < 60) return `${diffMin} min`;
    const hours = Math.floor(diffMin / 60);
    const rem = diffMin % 60;
    return `${hours}h ${rem}m`;
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
            <ConciergeBell className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 font-['Outfit']">
                Bandeja de Recepción & Despacho
              </h1>
              {newRequests.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                  {newRequests.length} NUEVAS
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Recepción central de llamadas, pedidos desde habitaciones y asignación inmediata a personal en servicio.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Personal Disponible</span>
            <span className="font-bold text-slate-900">
              {hotelStaff.filter((member) => getActiveTaskCount(member.id) === 0).length} de {hotelStaff.length}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 1: INCOMING REQUESTS PENDING ASSIGNMENT (URGENT INBOX) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 font-['Outfit']">
              Bandeja de Entrada Inmediata ({newRequests.length})
            </h2>
            <span className="text-xs text-slate-400">&mdash; Requieren asignar responsable</span>
          </div>
        </div>

        {newRequests.length === 0 ? (
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 text-center text-xs text-emerald-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1.5" />
            <span className="font-bold">¡Sin pedidos pendientes de asignación!</span>
            <p className="text-[11px] text-emerald-700 mt-0.5">
              Cualquier nuevo pedido de huésped ingresará aquí de inmediato con alerta en vivo.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {newRequests.map((req) => (
              <div
                key={req.id}
                id={`reception-new-req-${req.id}`}
                className="bg-white rounded-2xl border-2 border-amber-300 p-5 shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-11 h-11 rounded-xl bg-slate-900 text-white font-black text-sm flex flex-col items-center justify-center font-mono">
                        <span className="text-[8px] uppercase text-slate-400 font-normal">HAB</span>
                        {req.roomNumber}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-extrabold text-slate-900">{req.title}</h3>
                        </div>
                        <p className="text-xs text-slate-500">{req.guestName}</p>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-rose-100 text-rose-800 animate-pulse">
                      Nueva Solicitud
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 leading-relaxed">
                    {req.details}
                  </p>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Hace {getElapsedTimeText(req.createdAt)}
                    </span>
                    <span className="font-semibold text-slate-700 uppercase">
                      Sector: {req.sector}
                    </span>
                  </div>
                </div>

                {/* FAST ASSIGN CONTROLS */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Asignar personal inmediatamente:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {hotelStaff.filter((member) => member.sector === req.sector || member.sector === 'front_desk').slice(0, 4).map((member) => (
                      <button
                        key={member.id}
                        id={`reception-assign-${req.id}-to-${member.id}`}
                        onClick={() => assignRequest(req.id, member.id)}
                        className="p-2 text-left bg-slate-50 hover:bg-amber-50 hover:border-amber-300 border border-slate-200 rounded-xl text-xs transition-all flex items-center gap-2 group"
                      >
                        <img
                          src={member?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                          alt={member?.name || 'Personal'}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate text-[11px] group-hover:text-amber-950">
                            {member?.name ? member.name.split(' ')[0] : 'Personal'}
                          </div>
                          <div className="text-[9px] text-slate-500 truncate">{member?.sector || 'general'}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: REQUESTS IN PROGRESS & RESOLVED TODAY */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-['Outfit']">
              Seguimiento de Tareas Asignadas & en Camino ({inProgressRequests.length})
            </h3>
            <p className="text-xs text-slate-500">Supervisa el avance de los empleados en piso</p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {inProgressRequests.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              No hay tareas en proceso actualmente.
            </div>
          ) : (
            inProgressRequests.map((req) => (
              <div key={req.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-slate-100 font-bold text-slate-900 flex items-center justify-center font-mono">
                    {req.roomNumber}
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900">{req.title}</h4>
                    <p className="text-[11px] text-slate-500">
                      Asignado a: <strong className="text-slate-800">{req.assignedToName}</strong> • {req.guestName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span className="text-[11px] font-mono text-slate-500">
                    {getElapsedTimeText(req.createdAt)}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      req.status === 'en_proceso'
                        ? 'bg-sky-100 text-sky-800 animate-pulse'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {req.status === 'en_proceso' ? 'En Camino a Hab.' : 'Asignada (Por Aceptar)'}
                  </span>

                  {/* Fast completion trigger if receptionist confirms over radio */}
                  <button
                    onClick={() => req.status === 'asignada'
                      ? staffAcceptTask(req.id)
                      : staffCompleteTask(req.id, 'Confirmado por recepción vía radio')}
                    className={`px-2 py-1 text-[10px] font-bold text-white rounded-lg ${req.status === 'asignada' ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}
                    title={req.status === 'asignada' ? 'Confirmar que el personal tomó la tarea' : 'Cerrar como resuelto si el empleado confirmó por intercomunicador'}
                  >
                    {req.status === 'asignada' ? 'Confirmar recepción' : 'Confirmar entrega'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* SECTION 3: STAFF ROSTER & AVAILABILITY */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 font-['Outfit'] mb-3">
          Personal Operativo de Guardia ({hotelStaff.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {hotelStaff.map((member) => (
            <div
              key={member.id}
              className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2.5">
                <img
                  src={member?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                  alt={member?.name || 'Personal'}
                  className="w-9 h-9 rounded-full object-cover border border-slate-300"
                />
                <div>
                  <div className="font-bold text-slate-900">{member?.name || 'Personal'}</div>
                  <div className="text-[10px] text-slate-500">{member?.roleTitle || 'Operativo'}</div>
                </div>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  getActiveTaskCount(member.id) === 0
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {getActiveTaskCount(member.id)} tareas
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
