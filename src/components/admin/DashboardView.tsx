import React from 'react';
import { useHotelPulse, AdminViewType } from '../../context/HotelPulseContext';
import {
  Users,
  Percent,
  Inbox,
  Clock,
  Timer,
  AlertOctagon,
  AlertTriangle,
  BadgeDollarSign,
  HeartHandshake,
  ArrowRight,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  TrendingUp,
  Activity,
  Flame,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    activeHotel,
    rooms,
    requests,
    incidents,
    opportunities,
    staff,
    setAdminView,
    setSelectedAssetHistory,
    assetHistories,
  } = useHotelPulse();

  // Computed metrics scoped to the active hotel
  const activeHotelId = activeHotel?.id || 'hotel-grand-pulse';
  const hotelRooms = rooms.filter((r) => r.hotelId === activeHotelId);
  const hotelRequests = requests.filter((r) => r.hotelId === activeHotelId);
  const hotelIncidents = incidents.filter((i) => i.hotelId === activeHotelId);
  const hotelOpportunities = opportunities.filter((o) => o.hotelId === activeHotelId);
  const occupiedRooms = hotelRooms.filter((r) => r.status === 'ocupada').length;
  const occupancyRate = hotelRooms.length > 0 ? Math.round((occupiedRooms / hotelRooms.length) * 100) : 0;
  const totalGuests = hotelRooms.reduce(
    (acc, r) => (r.status === 'ocupada' && r.currentGuest ? acc + (r.currentGuest.guestsCount || 1) : acc),
    0
  );

  const todayRequestsCount = hotelRequests.length;
  const pendingRequestsCount = hotelRequests.filter((r) => r.status === 'nueva' || r.status === 'asignada').length;

  // Average response time
  const resolvedRequests = hotelRequests.filter((r) => r.status === 'resuelta' && r.resolutionTimeMinutes);
  const avgResponseTime =
    resolvedRequests.length > 0
      ? Math.round(
          resolvedRequests.reduce((acc, r) => acc + (r.resolutionTimeMinutes || 0), 0) / resolvedRequests.length
        )
      : null;

  const criticalIncidentsCount = hotelIncidents.filter(
    (i) => i.status !== 'reparado' && (i.priority === 'alta' || i.priority === 'urgente')
  ).length;

  const roomsWithIncidents = new Set(hotelIncidents.filter((i) => i.status !== 'reparado').map((i) => i.roomNumber)).size;

  const totalUpsellRevenue = hotelOpportunities
    .filter((o) => o.status === 'aceptada')
    .reduce((acc, o) => acc + o.potentialRevenue, 0);

  const delayedRequests = hotelRequests.filter(
    (request) =>
      request.status !== 'resuelta' &&
      Date.now() - new Date(request.createdAt).getTime() > 15 * 60 * 1000
  );
  const urgentIncident = hotelIncidents.find(
    (incident) => incident.status !== 'reparado' && (incident.priority === 'urgente' || incident.priority === 'alta')
  );
  const candidateRevenue = hotelOpportunities
    .filter((opportunity) => opportunity.status === 'candidato')
    .reduce((sum, opportunity) => sum + opportunity.potentialRevenue, 0);
  const hotelStaff = staff.filter((member) => member.hotelId === activeHotel.id);
  const busyStaff = new Set(
    hotelRequests
      .filter((request) => request.assignedToId && (request.status === 'asignada' || request.status === 'en_proceso'))
      .map((request) => request.assignedToId)
  ).size;

  const attentionItems = [
    ...(urgentIncident
      ? [{
          id: 'live-critical-incident',
          severity: 'urgente' as const,
          title: `Incidencia prioritaria en habitación ${urgentIncident.roomNumber}`,
          description: `${urgentIncident.assetName}: ${urgentIncident.description}`,
          actionLabel: 'Ir a Mantenimiento',
          targetView: 'mantenimiento' as const,
          relatedRoom: urgentIncident.roomNumber,
        }]
      : []),
    ...(delayedRequests.length > 0
      ? [{
          id: 'live-delayed-requests',
          severity: 'alerta' as const,
          title: `${delayedRequests.length} solicitud(es) superan los 15 minutos`,
          description: 'Hay pedidos activos que requieren seguimiento operativo.',
          actionLabel: 'Ir a Operaciones',
          targetView: 'operaciones' as const,
        }]
      : []),
    ...(candidateRevenue > 0
      ? [{
          id: 'live-upsell',
          severity: 'oportunidad' as const,
          title: `USD ${candidateRevenue} de ingreso potencial detectado`,
          description: `${hotelOpportunities.filter((o) => o.status === 'candidato').length} oportunidades comerciales siguen pendientes de propuesta.`,
          actionLabel: 'Ver Oportunidades',
          targetView: 'oportunidades' as const,
        }]
      : []),
    {
      id: 'live-staff-load',
      severity: 'informativo' as const,
      title: `${busyStaff} miembro(s) del personal están en tarea`,
      description: `${hotelStaff.length - busyStaff} miembro(s) figuran disponibles en el dataset actual.`,
      actionLabel: 'Ver Operaciones',
      targetView: 'operaciones' as const,
    },
  ];

  const handleAttentionAction = (item: (typeof attentionItems)[0]) => {
    if (item.targetView === 'mantenimiento' && item.relatedRoom) {
      const incident = hotelIncidents.find((entry) => entry.roomNumber === item.relatedRoom);
      if (incident?.historyAssetId) {
        setSelectedAssetHistory(assetHistories[incident.historyAssetId] || null);
      }
    }
    setAdminView(item.targetView as AdminViewType);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome & Summary Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
              Vista Ejecutiva
            </span>
            <span className="text-xs text-slate-500">• Sincronizado en tiempo real</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1 font-['Outfit']">
            Centro de Mando &mdash; {activeHotel?.name || 'Hotel Pulse'}
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Supervisión operativa, solicitudes activas, mantenimiento preventivo y desempeño del personal.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-semibold text-slate-900">{activeHotel?.city || 'SaaS Multi-Hotel'}</div>
            <div className="text-[11px] text-slate-500">{hotelStaff.length} miembros cargados • {busyStaff} en tarea</div>
          </div>
          <button
            id="view-live-operations-shortcut-btn"
            onClick={() => setAdminView('operaciones')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <span>Ver Operaciones en Vivo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 9 KEY METRIC CARDS REQUIRED BY SPECIFICATION */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
        {/* 1. Huéspedes alojados */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Huéspedes Alojados</span>
            <Users className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-['Outfit']">{totalGuests}</div>
          <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>Datos del hotel activo</span>
          </div>
        </div>

        {/* 2. Ocupación */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Ocupación</span>
            <Percent className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-['Outfit']">{occupancyRate}%</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {occupiedRooms} de {hotelRooms.length} habs cargadas
          </div>
        </div>

        {/* 3. Solicitudes del día */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Solicitudes del Día</span>
            <Inbox className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-['Outfit']">{todayRequestsCount}</div>
          <div className="text-[11px] text-indigo-600 font-medium mt-1">
            {resolvedRequests.length} completadas
          </div>
        </div>

        {/* 4. Solicitudes pendientes */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Solicitudes Pendientes</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-['Outfit']">
            {pendingRequestsCount}
          </div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">
            {pendingRequestsCount > 0 ? 'Requiere atención operativa' : 'Bandeja al día'}
          </div>
        </div>

        {/* 5. Tiempo promedio de respuesta */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Tiempo de Respuesta</span>
            <Timer className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-['Outfit']">
            {avgResponseTime ?? '—'} {avgResponseTime !== null && <span className="text-sm font-normal text-slate-500">min</span>}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Objetivo hotel: &lt; 15 min</div>
        </div>

        {/* 6. Problemas críticos */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Problemas Críticos</span>
            <AlertOctagon className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-600 mt-2 font-['Outfit']">
            {criticalIncidentsCount}
          </div>
          <div className="text-[11px] text-rose-600 font-medium mt-1">{criticalIncidentsCount > 0 ? 'Requiere atención' : 'Sin críticos activos'}</div>
        </div>

        {/* 7. Habitaciones con incidencias */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Habs con Incidencias</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-['Outfit']">
            {roomsWithIncidents}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{roomsWithIncidents > 0 ? 'Incidencias abiertas' : 'Sin incidencias abiertas'}</div>
        </div>

        {/* 8. Ventas adicionales */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Ventas Adicionales</span>
            <BadgeDollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2 font-['Outfit']">
            ${totalUpsellRevenue} <span className="text-xs font-normal text-slate-500">USD</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Ingresos confirmados</div>
        </div>

        {/* 9. Satisfacción de huéspedes */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm hover:border-slate-300 transition-all col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Satisfacción Huéspedes</span>
            <HeartHandshake className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-['Outfit']">—</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Pendiente de integrar encuestas reales</div>
        </div>
      </div>

      {/* HIGHLIGHTED SECTION: “¿QUÉ NECESITA MI ATENCIÓN HOY?” */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-xl border border-slate-800">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/30">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight font-['Outfit']">
                  ¿Qué necesita mi atención hoy?
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950 uppercase">
                  Pulse Insight
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Alertas generadas automáticamente a partir de solicitudes, incidencias y oportunidades del hotel activo.
              </p>
            </div>
          </div>
        </div>

        {/* 4 Cards required by specification */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {attentionItems.map((item) => {
            let badgeBg = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
            let icon = <AlertOctagon className="w-4 h-4 text-rose-400" />;

            if (item.severity === 'alerta') {
              badgeBg = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
              icon = <Clock className="w-4 h-4 text-amber-400" />;
            } else if (item.severity === 'oportunidad') {
              badgeBg = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
              icon = <BadgeDollarSign className="w-4 h-4 text-emerald-400" />;
            } else if (item.severity === 'informativo') {
              badgeBg = 'bg-sky-500/20 text-sky-300 border-sky-500/30';
              icon = <Activity className="w-4 h-4 text-sky-400" />;
            }

            return (
              <div
                key={item.id}
                id={`attention-card-${item.id}`}
                className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl p-4 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${badgeBg}`}
                    >
                      {icon}
                      {item.severity}
                    </span>
                    {item.relatedRoom && (
                      <span className="text-[11px] text-slate-400 font-mono">Hab. {item.relatedRoom}</span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{item.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Módulo: {item.targetView}</span>
                  <button
                    id={`attention-action-${item.id}`}
                    onClick={() => handleAttentionAction(item)}
                    className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    <span>{item.actionLabel}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Operational Pulse: Live Requests Summary & Quick Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Requests Stream (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-['Outfit']">
                Flujo Operativo en Tiempo Real
              </h3>
              <p className="text-xs text-slate-500">Últimas solicitudes ingresadas desde las habitaciones</p>
            </div>
            <button
              id="dashboard-goto-operations-btn"
              onClick={() => setAdminView('operaciones')}
              className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1"
            >
              <span>Ver todas ({hotelRequests.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {hotelRequests.slice(0, 4).map((req) => {
              let statusBadge = (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                  {req.status}
                </span>
              );
              if (req.status === 'resuelta') {
                statusBadge = (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Resuelta ({req.resolutionTimeMinutes || 12} min)
                  </span>
                );
              } else if (req.status === 'en_proceso') {
                statusBadge = (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 animate-pulse">
                    En Proceso
                  </span>
                );
              }

              return (
                <div key={req.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center font-bold text-slate-900 text-xs">
                      <span className="text-[9px] text-slate-400 font-normal uppercase">Hab</span>
                      {req.roomNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900">{req.title}</h4>
                        {req.priority === 'urgente' && (
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 bg-rose-100 text-rose-700 rounded">
                            Urgente
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {req.guestName} • Sector: {req.sector} • Resp: {req.assignedToName || 'Sin asignar'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">{statusBadge}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sectors Operational Health */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-['Outfit']">Salud por Sectores</h3>
            <p className="text-xs text-slate-500">Carga de trabajo y tiempos de respuesta</p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Limpieza & Pisos</span>
                <span className="text-slate-500">Promedio: 11 min</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-[85%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Room Service & Gastronomía</span>
                <span className="text-slate-500">Promedio: 16 min</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full w-[72%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Mantenimiento Técnico</span>
                <span className="text-amber-700">Promedio: 22 min</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full w-[60%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Recepción / Concierge</span>
                <span className="text-slate-500">Promedio: 4 min</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full w-[94%]" />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Disponibilidad del personal:</span>
            <span className="font-bold text-emerald-600">85% Operativo</span>
          </div>
        </div>
      </div>
    </div>
  );
};
