import React from 'react';
import { useHotelPulse } from '../../context/HotelPulseContext';
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  X,
  Smartphone,
  ConciergeBell,
  HardHat,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

export const DemoWalkthroughModal: React.FC = () => {
  const {
    guidedTourActive,
    setGuidedTourActive,
    tourStep,
    nextTourStep,
    prevTourStep,
    setCurrentRole,
    setAdminView,
    setGuestRoomNumber,
    requests,
    staff,
    createGuestRequest,
    assignRequest,
    staffAcceptTask,
    staffCompleteTask,
  } = useHotelPulse();

  if (!guidedTourActive) return null;

  // Let's find the current towel request if it exists
  const towelRequest = requests.find(
    (r) => r.roomNumber === '304' && (r.category === 'toallas' || r.title.toLowerCase().includes('toallas'))
  );

  const steps = [
    {
      title: 'Paso 1: Huésped solicita 2 toallas desde la Habitación 304',
      description:
        'El huésped no instala ninguna app. Accede desde su teléfono escaneando el código QR de la habitación 304 y toca el botón "Solicitar 2 Toallas".',
      role: 'guest' as const,
      icon: Smartphone,
      actionLabel: 'Ver como Huésped (Hab. 304)',
      action: () => {
        setGuestRoomNumber('304');
        setCurrentRole('guest');
      },
      quickTriggerLabel: 'Simular solicitud de 2 toallas ya',
      quickTrigger: () => {
        createGuestRequest({
          category: 'toallas',
          title: '2 Toallas adicionales de baño',
          details: 'Solicitud estándar de toallas extra para Habitación 304.',
          quantity: 2,
          sector: 'housekeeping',
          priority: 'alta',
          roomNumber: '304',
        });
        nextTourStep();
      },
      statusCheck: towelRequest ? 'Solicitud creada con éxito' : 'Pendiente de solicitar',
      isComplete: !!towelRequest,
    },
    {
      title: 'Paso 2: Recepción recibe el pedido y asigna la tarea',
      description:
        'En el Centro de Operaciones de Recepción, la solicitud de la Habitación 304 entra en tiempo real en estado "Nueva". Recepción la asigna a Carlos Méndez (Personal de Limpieza).',
      role: 'reception' as const,
      icon: ConciergeBell,
      actionLabel: 'Ir al panel de Recepción',
      action: () => {
        setCurrentRole('reception');
      },
      quickTriggerLabel: towelRequest && towelRequest.status === 'nueva' ? 'Asignar a Carlos Méndez' : undefined,
      quickTrigger: () => {
        if (towelRequest) {
          assignRequest(towelRequest.id, 'staff-1');
          nextTourStep();
        }
      },
      statusCheck:
        towelRequest && towelRequest.status !== 'nueva'
          ? `Asignada a ${towelRequest.assignedToName || 'Personal'}`
          : 'En espera de asignación',
      isComplete: !!towelRequest && towelRequest.status !== 'nueva',
    },
    {
      title: 'Paso 3: Personal acepta la tarea y va en camino',
      description:
        'Carlos Méndez ve la tarea en su teléfono de servicio. Presiona "Aceptar y poner en camino". El huésped ve en su pantalla cómo cambia el estado en vivo: Solicitado → Aceptado → En camino.',
      role: 'staff' as const,
      icon: HardHat,
      actionLabel: 'Ver pantalla de Personal',
      action: () => {
        setCurrentRole('staff');
      },
      quickTriggerLabel:
        towelRequest && towelRequest.status === 'asignada' ? 'Aceptar tarea (En camino)' : undefined,
      quickTrigger: () => {
        if (towelRequest) {
          staffAcceptTask(towelRequest.id);
        }
      },
      statusCheck:
        towelRequest && (towelRequest.status === 'en_proceso' || towelRequest.status === 'resuelta')
          ? 'Tarea aceptada y en proceso'
          : 'Esperando aceptación del empleado',
      isComplete: !!towelRequest && (towelRequest.status === 'en_proceso' || towelRequest.status === 'resuelta'),
    },
    {
      title: 'Paso 4: Personal entrega las toallas y completa el servicio',
      description:
        'Al llegar a la Habitación 304, el empleado entrega las toallas y presiona "Marcar como entregado". El sistema calcula inmediatamente el tiempo de respuesta.',
      role: 'staff' as const,
      icon: CheckCircle2,
      actionLabel: 'Completar desde Personal',
      action: () => {
        setCurrentRole('staff');
      },
      quickTriggerLabel:
        towelRequest && towelRequest.status === 'en_proceso' ? 'Marcar como Entregado' : undefined,
      quickTrigger: () => {
        if (towelRequest) {
          staffCompleteTask(towelRequest.id, 'Entregadas 2 toallas blancas a la huésped Sofía Martínez en mano.');
          nextTourStep();
        }
      },
      statusCheck: towelRequest && towelRequest.status === 'resuelta' ? '¡Entregado con éxito!' : 'En tránsito',
      isComplete: !!towelRequest && towelRequest.status === 'resuelta',
    },
    {
      title: 'Paso 5: Administrador revisa el tiempo de resolución y desempeño',
      description:
        'El Dueño / Administrador observa la métrica actualizada en el Dashboard y en el Centro de Operaciones con el tiempo exacto transcurrido y la satisfacción registrada.',
      role: 'admin' as const,
      icon: ShieldCheck,
      actionLabel: 'Ver Dashboard de Administrador',
      action: () => {
        setCurrentRole('admin');
        setAdminView('dashboard');
      },
      quickTriggerLabel: 'Ver en Operaciones',
      quickTrigger: () => {
        setCurrentRole('admin');
        setAdminView('operaciones');
      },
      statusCheck:
        towelRequest?.resolutionTimeMinutes !== undefined
          ? `Tiempo registrado: ${towelRequest.resolutionTimeMinutes} minutos`
          : 'Listo para ver métricas',
      isComplete: !!towelRequest && towelRequest.status === 'resuelta',
    },
  ];

  const currentStepData = steps[tourStep] || steps[0];
  const StepIcon = currentStepData.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Recorrido Funcional Interactivo</h3>
              <p className="text-[11px] text-slate-400">Paso a paso del flujo solicitado para Hotel Pulse</p>
            </div>
          </div>
          <button
            id="close-demo-tour-modal-btn"
            onClick={() => setGuidedTourActive(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps Progress Pills */}
        <div className="px-6 pt-4 pb-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-1 overflow-x-auto">
          {steps.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                s.action();
              }}
              className={`flex-1 py-1.5 px-2 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1 transition-all whitespace-nowrap ${
                idx === tourStep
                  ? 'bg-slate-900 text-white shadow-sm'
                  : s.isComplete
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-200/70 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{idx + 1}</span>
              {s.isComplete && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
            </button>
          ))}
        </div>

        {/* Active Step Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0 shadow-sm">
              <StepIcon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded">
                Etapa {tourStep + 1} de {steps.length}
              </span>
              <h4 className="text-base font-bold text-slate-900 mt-1">{currentStepData.title}</h4>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{currentStepData.description}</p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Estado del pedido:</span>
            <span
              className={`font-semibold px-2 py-0.5 rounded-full ${
                currentStepData.isComplete
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {currentStepData.statusCheck}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
            <button
              id="tour-step-primary-action-btn"
              onClick={() => {
                currentStepData.action();
                setGuidedTourActive(false);
              }}
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <span>{currentStepData.actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {currentStepData.quickTriggerLabel && (
              <button
                id="tour-step-quick-trigger-btn"
                onClick={currentStepData.quickTrigger}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-500/20"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                <span>{currentStepData.quickTriggerLabel}</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <button
            onClick={prevTourStep}
            disabled={tourStep === 0}
            className="text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none font-semibold px-3 py-1.5 rounded-lg"
          >
            ← Anterior
          </button>
          <span className="text-slate-400 text-[11px]">
            Podés saltar de rol con los botones superiores en cualquier momento
          </span>
          <button
            onClick={nextTourStep}
            disabled={tourStep === steps.length - 1}
            className="text-amber-700 hover:text-amber-800 disabled:opacity-30 disabled:pointer-events-none font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"
          >
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  );
};
