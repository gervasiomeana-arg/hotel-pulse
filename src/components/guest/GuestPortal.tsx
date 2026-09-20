import React, { useState } from 'react';
import { useHotelPulse } from '../../context/HotelPulseContext';
import {
  Sparkles,
  ConciergeBell,
  Utensils,
  Car,
  Clock,
  Wrench,
  Compass,
  MessageCircle,
  CheckCircle2,
  AlertTriangle,
  Send,
  Smartphone,
  Maximize2,
  ChevronRight,
  Plus,
  Minus,
  Bed,
  Check,
  Building2,
} from 'lucide-react';

export const GuestPortal: React.FC = () => {
  const {
    activeHotel,
    guestRoomNumber,
    setGuestRoomNumber,
    rooms,
    requests,
    createGuestRequest,
    opportunities,
    experiences,
  } = useHotelPulse();

  const [mobileFrameMode, setMobileFrameMode] = useState<boolean>(true);

  // Active room data
  const activeHotelId = activeHotel?.id || 'hotel-grand-pulse';
  const hotelRooms = rooms.filter((r) => r.hotelId === activeHotelId);
  const currentRoom =
    rooms.find((r) => r.number === guestRoomNumber && r.hotelId === activeHotelId) ||
    rooms.find((r) => r.number === guestRoomNumber) ||
    hotelRooms[0] ||
    rooms[0] || {
      id: 'room-default',
      hotelId: activeHotelId,
      number: guestRoomNumber || '304',
      type: 'Deluxe Suite' as const,
      floor: 3,
      status: 'ocupada' as const,
      currentGuest: {
        name: 'Sofía Martínez',
        checkIn: '18 Sep, 15:00',
        checkOut: '21 Sep, 11:00',
        phone: '+54 9 11 3321-9988',
        guestsCount: 2,
        vip: true,
      },
      activeIssuesCount: 0,
      activeRequestsCount: 0,
    };
  const guestName = currentRoom?.currentGuest?.name || 'Sofía Martínez';

  // Requests for this room
  const roomRequests = requests.filter((r) => r.roomNumber === guestRoomNumber);

  // Active dialog modal for fast request
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Towels quick counter
  const [towelCount, setTowelCount] = useState<number>(2);
  const [pillowCount, setPillowCount] = useState<number>(2);

  // Problem report state
  const [problemElement, setProblemElement] = useState<string>('Aire Acondicionado');
  const [problemDescription, setProblemDescription] = useState<string>('');

  // Confirmation screen state
  const [lastSubmittedReqTitle, setLastSubmittedReqTitle] = useState<string | null>(null);

  const handleRequestTowels = () => {
    createGuestRequest({
      category: 'toallas',
      title: `${towelCount} Toallas adicionales`,
      details: `Solicitud de ${towelCount} toallas limpias para el baño de la Habitación ${guestRoomNumber}.`,
      quantity: towelCount,
      sector: 'housekeeping',
      priority: 'alta',
      roomNumber: guestRoomNumber,
    });
    setLastSubmittedReqTitle(`${towelCount} Toallas adicionales`);
    setActiveModal(null);
  };

  const handleRequestCleaning = (option: string) => {
    createGuestRequest({
      category: 'limpieza',
      title: `Servicio de Limpieza (${option})`,
      details: `Solicitud de limpieza de habitación: ${option}.`,
      sector: 'housekeeping',
      priority: 'media',
      roomNumber: guestRoomNumber,
    });
    setLastSubmittedReqTitle(`Servicio de Limpieza (${option})`);
    setActiveModal(null);
  };

  const handleRequestPillows = () => {
    createGuestRequest({
      category: 'almohadas',
      title: `${pillowCount} Almohadas viscoelásticas extra`,
      details: `Solicitud de ${pillowCount} almohadas confort para Habitación ${guestRoomNumber}.`,
      quantity: pillowCount,
      sector: 'housekeeping',
      priority: 'media',
      roomNumber: guestRoomNumber,
    });
    setLastSubmittedReqTitle(`${pillowCount} Almohadas extra`);
    setActiveModal(null);
  };

  const handleReportProblem = () => {
    if (!problemDescription.trim()) return;
    createGuestRequest({
      category: 'mantenimiento',
      title: `Reporte Técnico: ${problemElement}`,
      details: problemDescription,
      sector: 'maintenance',
      priority: 'alta',
      roomNumber: guestRoomNumber,
    });
    setLastSubmittedReqTitle(`Reporte: ${problemElement}`);
    setProblemDescription('');
    setActiveModal(null);
  };

  const handleRequestLateCheckout = () => {
    createGuestRequest({
      category: 'late_checkout',
      title: 'Solicitud de Late Checkout hasta 16:00 hs',
      details: `Huésped ${guestName} consulta posibilidad de extender salida hasta las 16:00 hs.`,
      sector: 'front_desk',
      priority: 'media',
      roomNumber: guestRoomNumber,
    });
    setLastSubmittedReqTitle('Late Checkout hasta 16:00 hs');
    setActiveModal(null);
  };

  const handleRequestParking = () => {
    createGuestRequest({
      category: 'cochera',
      title: 'Servicio de Cochera & Valet Parking',
      details: 'Huésped solicita acceso a cochera cubierta para su vehículo con servicio de valet.',
      sector: 'front_desk',
      priority: 'baja',
      roomNumber: guestRoomNumber,
    });
    setLastSubmittedReqTitle('Cochera Cubierta');
    setActiveModal(null);
  };

  const handleRequestTransfer = () => {
    createGuestRequest({
      category: 'traslado',
      title: 'Coordinación de Traslado Aeropuerto',
      details: 'Huésped solicita cotización y horario para transporte ejecutivo a Ezeiza / Aeroparque.',
      sector: 'concierge',
      priority: 'media',
      roomNumber: guestRoomNumber,
    });
    setLastSubmittedReqTitle('Traslado Aeropuerto');
    setActiveModal(null);
  };

  const handleContactReception = () => {
    createGuestRequest({
      category: 'recepcion',
      title: 'Llamada / Asistencia de Recepción',
      details: 'Huésped solicita comunicarse con la recepción para consulta personalizada.',
      sector: 'front_desk',
      priority: 'alta',
      roomNumber: guestRoomNumber,
    });
    setLastSubmittedReqTitle('Asistencia de Recepción');
    setActiveModal(null);
  };

  // Helper for tracking stages: Solicitado → Aceptado → En camino → Entregado
  const getStageIndex = (status: string) => {
    switch (status) {
      case 'nueva':
        return 0; // Solicitado
      case 'asignada':
        return 1; // Aceptado
      case 'en_proceso':
        return 2; // En camino
      case 'resuelta':
        return 3; // Entregado
      default:
        return 0;
    }
  };

  const stages = [
    { key: 'solicitado', label: 'Solicitado' },
    { key: 'aceptado', label: 'Aceptado' },
    { key: 'en_camino', label: 'En camino' },
    { key: 'entregado', label: 'Entregado' },
  ];

  // The inner content of the guest portal
  const renderGuestContent = () => (
    <div className="bg-slate-50 min-h-full text-slate-900 pb-20 select-none">
      {/* Top Mobile Bar */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 rounded-b-3xl shadow-lg border-b border-amber-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] uppercase tracking-wider text-amber-300 font-bold">
              {activeHotel?.name || 'Hotel Pulse'}
            </span>
          </div>

          {/* Quick room selector for demonstration convenience */}
          <select
            value={guestRoomNumber}
            onChange={(e) => setGuestRoomNumber(e.target.value)}
            className="bg-slate-800 text-amber-300 text-xs font-bold px-2.5 py-1 rounded-full border border-slate-700 focus:outline-none"
          >
            {rooms.map((r) => (
              <option key={r.id} value={r.number}>
                Hab. {r.number}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <h1 className="text-xl font-extrabold tracking-tight font-['Outfit']">
            Bienvenido al Hotel
          </h1>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl font-black text-amber-400 font-mono">
              Habitación {guestRoomNumber}
            </span>
            <span className="text-xs text-slate-300">• {guestName}</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 mt-2">
          Todo lo que necesites para tu estadía a un solo toque, sin esperas en el teléfono.
        </p>
      </div>

      {/* Confirmation Banner if recently submitted */}
      {lastSubmittedReqTitle && (
        <div className="mx-4 mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <div className="text-xs font-bold text-emerald-950">¡Solicitud Recibida!</div>
              <div className="text-[11px] text-emerald-700">{lastSubmittedReqTitle}</div>
            </div>
          </div>
          <button
            onClick={() => setLastSubmittedReqTitle(null)}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950"
          >
            ✕
          </button>
        </div>
      )}

      {/* ACTIVE REQUESTS REAL-TIME TRACKER (Solicitado → Aceptado → En camino → Entregado) */}
      {roomRequests.length > 0 && (
        <div className="mx-4 mt-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Tus Pedidos Activos ({roomRequests.length})
            </span>
          </div>

          {roomRequests.map((req) => {
            const currentStageIdx = getStageIndex(req.status);

            return (
              <div
                key={req.id}
                id={`guest-request-tracker-${req.id}`}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{req.title}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">{req.details}</p>
                  </div>
                  {req.status === 'resuelta' ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Entregado
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 animate-pulse">
                      En curso
                    </span>
                  )}
                </div>

                {/* 4-STAGE REAL-TIME STEPPER AS SPECIFIED BY PROMPT */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between relative">
                    {/* Connecting line */}
                    <div className="absolute top-3 left-3 right-3 h-0.5 bg-slate-200 -z-0" />
                    <div
                      className="absolute top-3 left-3 h-0.5 bg-amber-500 transition-all duration-500 -z-0"
                      style={{
                        width: `${(currentStageIdx / (stages.length - 1)) * 100}%`,
                      }}
                    />

                    {stages.map((stage, idx) => {
                      const isPast = idx < currentStageIdx;
                      const isCurrent = idx === currentStageIdx;
                      const isFuture = idx > currentStageIdx;

                      let nodeClass = 'bg-slate-200 text-slate-500 border-slate-300';
                      if (isPast || isCurrent) {
                        nodeClass = isCurrent
                          ? 'bg-amber-500 text-slate-950 font-bold ring-4 ring-amber-100 border-amber-500 scale-110'
                          : 'bg-emerald-600 text-white border-emerald-600';
                      }

                      return (
                        <div
                          key={stage.key}
                          className="flex flex-col items-center relative z-10 text-center"
                        >
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] border transition-all ${nodeClass}`}
                          >
                            {isPast ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                          </div>
                          <span
                            className={`text-[9px] mt-1 font-semibold ${
                              isCurrent
                                ? 'text-amber-700 font-bold'
                                : isPast
                                ? 'text-emerald-700'
                                : 'text-slate-400'
                            }`}
                          >
                            {stage.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {req.assignedToName && req.status !== 'resuelta' && (
                    <div className="mt-3 p-2 bg-slate-50 rounded-xl text-[10px] text-slate-600 flex items-center justify-between">
                      <span>Atendido por:</span>
                      <span className="font-bold text-slate-800">{req.assignedToName}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* BIG ACCESS CARDS (ACCESOS GRANDES PARA EL HUÉSPED) */}
      <div className="p-4 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          Servicios de la Habitación
        </h2>

        {/* 1. Solicitar Toallas (Priority Hero Action) */}
        <button
          id="guest-request-towels-btn"
          onClick={() => setActiveModal('toallas')}
          className="w-full p-4 bg-white hover:bg-amber-50/60 border-2 border-amber-300 rounded-2xl shadow-sm flex items-center justify-between transition-all group text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform">
              🧺
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-extrabold text-slate-900 font-['Outfit']">
                  Solicitar Toallas
                </h3>
                <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-400 text-slate-950 rounded">
                  Frecuente
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Juegos de toallas limpias para baño o piscina
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-amber-500 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* 2. Pedir Limpieza */}
        <button
          id="guest-request-cleaning-btn"
          onClick={() => setActiveModal('limpieza')}
          className="w-full p-4 bg-white hover:bg-slate-100/60 border border-slate-200/90 rounded-2xl shadow-sm flex items-center justify-between transition-all group text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-lg">
              🧹
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-['Outfit']">Pedir Limpieza</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Aseo completo, cambio de sábanas o retiro de residuos
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* 3. Almohadas */}
        <button
          id="guest-request-pillows-btn"
          onClick={() => setActiveModal('almohadas')}
          className="w-full p-4 bg-white hover:bg-slate-100/60 border border-slate-200/90 rounded-2xl shadow-sm flex items-center justify-between transition-all group text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-lg">
              🛏️
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-['Outfit']">Almohadas</h3>
              <p className="text-xs text-slate-500 mt-0.5">Carta de almohadas suaves, firmes o viscoelásticas</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* 4. Reportar un Problema */}
        <button
          id="guest-report-problem-btn"
          onClick={() => setActiveModal('problema')}
          className="w-full p-4 bg-white hover:bg-rose-50/40 border border-slate-200/90 rounded-2xl shadow-sm flex items-center justify-between transition-all group text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-lg">
              🔧
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-['Outfit']">Reportar un Problema</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Aire acondicionado, agua caliente, TV o cerradura
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* 5. Room Service / Gastronomía */}
        <button
          id="guest-room-service-btn"
          onClick={() => setActiveModal('room_service')}
          className="w-full p-4 bg-white hover:bg-slate-100/60 border border-slate-200/90 rounded-2xl shadow-sm flex items-center justify-between transition-all group text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-lg">
              🍽️
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-['Outfit']">
                Room Service / Gastronomía
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Desayunos, café de autor, platos principales y vinos
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* 6. Late Checkout */}
        <button
          id="guest-late-checkout-btn"
          onClick={() => setActiveModal('late_checkout')}
          className="w-full p-4 bg-white hover:bg-slate-100/60 border border-slate-200/90 rounded-2xl shadow-sm flex items-center justify-between transition-all group text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-lg">
              ⏱️
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-['Outfit']">Late Checkout</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Extiende tu estadía hasta las 16:00 o 18:00 hs
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* 7. Cochera */}
        <button
          id="guest-parking-btn"
          onClick={() => setActiveModal('cochera')}
          className="w-full p-4 bg-white hover:bg-slate-100/60 border border-slate-200/90 rounded-2xl shadow-sm flex items-center justify-between transition-all group text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
              🚗
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-['Outfit']">Cochera & Valet</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Estacionamiento cubierto con seguridad las 24 horas
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* 8. Traslado */}
        <button
          id="guest-transfer-btn"
          onClick={() => setActiveModal('traslado')}
          className="w-full p-4 bg-white hover:bg-slate-100/60 border border-slate-200/90 rounded-2xl shadow-sm flex items-center justify-between transition-all group text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-lg">
              ✈️
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-['Outfit']">Traslado Aeropuerto</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Vehículos ejecutivos y chofer bilingüe hacia Ezeiza / Aeroparque
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* 9. Experiencias */}
        <button
          id="guest-experiences-btn"
          onClick={() => setActiveModal('experiencias')}
          className="w-full p-4 bg-white hover:bg-slate-100/60 border border-slate-200/90 rounded-2xl shadow-sm flex items-center justify-between transition-all group text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-lg">
              ✨
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-['Outfit']">Experiencias & Spa</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Masajes relajantes, catas de vino y espectáculos
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* 10. Hablar con Recepción */}
        <button
          id="guest-contact-reception-btn"
          onClick={() => setActiveModal('recepcion')}
          className="w-full p-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl shadow-md flex items-center justify-between transition-all group text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-lg">
              🔔
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-['Outfit']">Hablar con Recepción</h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Atención personalizada de nuestro equipo de conserjería
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* MODAL 1: SOLICITAR 2 TOALLAS (HERO FLOW) */}
      {activeModal === 'toallas' && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🧺</span>
                <h3 className="text-base font-bold text-slate-900">Solicitar Toallas</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="py-6 text-center space-y-4">
              <p className="text-xs text-slate-600">
                Selecciona la cantidad de toallas de baño limpias para la Habitación{' '}
                <strong className="text-slate-900 font-mono">{guestRoomNumber}</strong>:
              </p>

              <div className="flex items-center justify-center gap-5">
                <button
                  onClick={() => setTowelCount((prev) => Math.max(1, prev - 1))}
                  className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-800 font-black text-xl flex items-center justify-center hover:bg-slate-200 transition-colors shadow-sm"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <div className="font-mono text-4xl font-black text-slate-900 w-16">
                  {towelCount}
                </div>
                <button
                  onClick={() => setTowelCount((prev) => Math.min(6, prev + 1))}
                  className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-800 font-black text-xl flex items-center justify-center hover:bg-slate-200 transition-colors shadow-sm"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <span className="text-[11px] text-slate-400 block">
                Toallas 100% algodón egipcio preparadas por nuestro equipo de Housekeeping
              </span>
            </div>

            <div className="pt-2">
              <button
                id="confirm-towel-request-btn"
                onClick={handleRequestTowels}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4 text-slate-950" />
                <span>Confirmar y Enviar Pedido</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: LIMPIEZA */}
      {activeModal === 'limpieza' && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Servicio de Limpieza</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 font-bold">
                ✕
              </button>
            </div>

            <div className="py-4 space-y-2">
              <button
                onClick={() => handleRequestCleaning('Aseo completo e higienización')}
                className="w-full p-3 text-left rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all font-semibold text-xs text-slate-800"
              >
                Aseo completo de habitación
              </button>
              <button
                onClick={() => handleRequestCleaning('Cambio de sábanas y toallas')}
                className="w-full p-3 text-left rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all font-semibold text-xs text-slate-800"
              >
                Cambio de ropa de cama
              </button>
              <button
                onClick={() => handleRequestCleaning('Retiro de residuos y vajilla')}
                className="w-full p-3 text-left rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all font-semibold text-xs text-slate-800"
              >
                Retiro de bandejas y residuos
              </button>
              <button
                onClick={() => handleRequestCleaning('No molestar durante el día')}
                className="w-full p-3 text-left rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all font-semibold text-xs text-slate-800"
              >
                Cartel de &quot;No Molestar&quot;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ALMOHADAS */}
      {activeModal === 'almohadas' && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-center">
            <h3 className="text-base font-bold text-slate-900 mb-1">Carta de Almohadas</h3>
            <p className="text-xs text-slate-500 mb-4">
              ¿Cuántas almohadas viscoelásticas adicionales necesitas?
            </p>

            <div className="flex items-center justify-center gap-4 my-4">
              <button
                onClick={() => setPillowCount((prev) => Math.max(1, prev - 1))}
                className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 font-bold text-lg flex items-center justify-center"
              >
                -
              </button>
              <div className="font-mono text-3xl font-black text-slate-900 w-12">{pillowCount}</div>
              <button
                onClick={() => setPillowCount((prev) => Math.min(4, prev + 1))}
                className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 font-bold text-lg flex items-center justify-center"
              >
                +
              </button>
            </div>

            <button
              onClick={handleRequestPillows}
              className="w-full py-3 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-all"
            >
              Pedir {pillowCount} Almohadas
            </button>
          </div>
        </div>
      )}

      {/* MODAL 4: REPORTAR PROBLEMA */}
      {activeModal === 'problema' && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Reportar un Problema</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 font-bold">
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Elemento Afectado</label>
                <select
                  value={problemElement}
                  onChange={(e) => setProblemElement(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="Aire Acondicionado">Aire Acondicionado</option>
                  <option value="Ducha / Agua Caliente">Ducha / Agua Caliente</option>
                  <option value="Cerradura de Puerta">Cerradura de Puerta</option>
                  <option value="Televisor / Control">Televisor / Control Remoto</option>
                  <option value="Wi-Fi / Conectividad">Wi-Fi / Conectividad</option>
                  <option value="Luces / Tomas">Iluminación / Tomas eléctricos</option>
                  <option value="Otro elemento">Otro elemento</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">¿Qué sucede?</label>
                <textarea
                  rows={3}
                  placeholder="Por favor describe brevemente qué ocurre para que el técnico venga preparado..."
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <button
                onClick={handleReportProblem}
                disabled={!problemDescription.trim()}
                className="w-full py-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition-all"
              >
                Enviar Reporte a Mantenimiento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: ROOM SERVICE */}
      {activeModal === 'room_service' && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2">Room Service</h3>
            <p className="text-xs text-slate-500 mb-4">
              Selecciona una opción o pide la carta completa a tu habitación:
            </p>
            <div className="space-y-2">
              <button
                onClick={() => {
                  createGuestRequest({
                    category: 'room_service',
                    title: 'Desayuno Continental a la Habitación',
                    details: 'Café de filtro, medialunas tibias, jugo de naranja y mermeladas artesanales.',
                    sector: 'room_service',
                    priority: 'alta',
                    roomNumber: guestRoomNumber,
                  });
                  setLastSubmittedReqTitle('Desayuno Continental');
                  setActiveModal(null);
                }}
                className="w-full p-3 text-left rounded-xl border border-slate-200 hover:bg-amber-50/50 font-semibold text-xs"
              >
                ☕ Desayuno Continental ($18 USD)
              </button>
              <button
                onClick={() => {
                  createGuestRequest({
                    category: 'room_service',
                    title: 'Botella de Vino Malbec Reserva + Tabla de Quesos',
                    details: 'Selección de quesos madurados y copa de vino para degustar en la suite.',
                    sector: 'room_service',
                    priority: 'media',
                    roomNumber: guestRoomNumber,
                  });
                  setLastSubmittedReqTitle('Vino Malbec + Tabla de Quesos');
                  setActiveModal(null);
                }}
                className="w-full p-3 text-left rounded-xl border border-slate-200 hover:bg-amber-50/50 font-semibold text-xs"
              >
                🍷 Vino Malbec Reserva + Quesos ($35 USD)
              </button>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full mt-4 py-2 text-xs font-semibold text-slate-500"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* MODAL 6: LATE CHECKOUT */}
      {activeModal === 'late_checkout' && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-center">
            <h3 className="text-base font-bold text-slate-900 mb-1">Extensión de Salida</h3>
            <p className="text-xs text-slate-500 mb-4">
              Disfruta tu habitación hasta las 16:00 hs con tarifa preferencial de cortesía.
            </p>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl mb-4 text-xs font-semibold text-amber-900">
              Tarifa especial: $35 USD (Sujeto a disponibilidad)
            </div>
            <button
              onClick={handleRequestLateCheckout}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all"
            >
              Solicitar Late Checkout
            </button>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full mt-2 py-2 text-xs font-semibold text-slate-500"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* MODAL 7: COCHERA */}
      {activeModal === 'cochera' && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-center">
            <h3 className="text-base font-bold text-slate-900 mb-1">Cochera & Valet</h3>
            <p className="text-xs text-slate-500 mb-4">
              Estacionamiento subterráneo vigilado con acceso por ascensor a tu piso.
            </p>
            <button
              onClick={handleRequestParking}
              className="w-full py-3 bg-slate-900 text-white font-bold text-xs rounded-xl"
            >
              Solicitar Cochera ($25 USD / día)
            </button>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full mt-2 py-2 text-xs font-semibold text-slate-500"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* MODAL 8: TRASLADO */}
      {activeModal === 'traslado' && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-center">
            <h3 className="text-base font-bold text-slate-900 mb-1">Traslado Aeropuerto</h3>
            <p className="text-xs text-slate-500 mb-4">
              Vehículo ejecutivo con chofer particular hacia Ezeiza o Aeroparque.
            </p>
            <button
              onClick={handleRequestTransfer}
              className="w-full py-3 bg-slate-900 text-white font-bold text-xs rounded-xl"
            >
              Solicitar Coordinación con Recepción
            </button>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full mt-2 py-2 text-xs font-semibold text-slate-500"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* MODAL 9: EXPERIENCIAS */}
      {activeModal === 'experiencias' && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Experiencias Destacadas</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 font-bold">
                ✕
              </button>
            </div>
            <div className="py-4 space-y-3">
              {experiences.slice(0, 3).map((exp) => (
                <div key={exp.id} className="p-3 border border-slate-200 rounded-2xl space-y-2">
                  <div className="h-24 rounded-xl overflow-hidden">
                    <img src={exp.image} alt={exp.title} className="w-full h-full object-cover" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">{exp.title}</h4>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-amber-700">${exp.price} USD</span>
                    <button
                      onClick={() => {
                        createGuestRequest({
                          category: 'experiencias',
                          title: `Reserva Huésped: ${exp.title}`,
                          details: `Huésped reservó ${exp.title} ($${exp.price} USD)`,
                          sector: 'concierge',
                          priority: 'alta',
                          roomNumber: guestRoomNumber,
                        });
                        setLastSubmittedReqTitle(`Reserva: ${exp.title}`);
                        setActiveModal(null);
                      }}
                      className="px-3 py-1 bg-slate-900 text-white rounded-lg font-bold text-[11px]"
                    >
                      Reservar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 10: RECEPCIÓN */}
      {activeModal === 'recepcion' && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center mx-auto mb-3 text-xl">
              🔔
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Hablar con Recepción</h3>
            <p className="text-xs text-slate-500 mb-4">
              ¿Deseas que un recepcionista se acerque o te contacte para asistirte?
            </p>
            <button
              onClick={handleContactReception}
              className="w-full py-3 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl"
            >
              Confirmar Solicitud de Asistencia
            </button>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full mt-2 py-2 text-xs font-semibold text-slate-500"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-100 py-6 px-4">
      {/* View Mode Bar for Desktop Evaluator */}
      <div className="max-w-md mx-auto mb-4 flex items-center justify-between text-xs bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-semibold text-slate-700">Simulador de Acceso Huésped (QR)</span>
        </div>
        <button
          onClick={() => setMobileFrameMode(!mobileFrameMode)}
          className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
        >
          {mobileFrameMode ? (
            <>
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Pantalla Completa</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5" />
              <span>Marco Celular</span>
            </>
          )}
        </button>
      </div>

      {mobileFrameMode ? (
        /* Mobile Phone Mockup Frame */
        <div className="max-w-md mx-auto bg-slate-950 p-3 rounded-[40px] shadow-2xl border-4 border-slate-800 relative">
          {/* Phone Speaker & Camera Notch */}
          <div className="w-32 h-4 bg-slate-950 rounded-full mx-auto mb-2 flex items-center justify-center gap-2 z-20">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
            <div className="w-10 h-1.5 rounded-full bg-slate-900" />
          </div>

          {/* Screen Content Container */}
          <div className="bg-slate-50 rounded-[32px] overflow-hidden min-h-[680px] max-h-[780px] overflow-y-auto relative">
            {renderGuestContent()}
          </div>
        </div>
      ) : (
        /* Fluid Full-Width Layout */
        <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          {renderGuestContent()}
        </div>
      )}
    </div>
  );
};
