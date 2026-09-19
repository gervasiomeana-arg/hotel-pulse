import React, { useState } from 'react';
import { useHotelPulse } from '../../context/HotelPulseContext';
import {
  HardHat,
  CheckCircle2,
  Clock,
  ArrowRight,
  Send,
  AlertCircle,
  MapPin,
  Sparkles,
  Phone,
  UserCheck,
  Check,
} from 'lucide-react';

export const StaffPortal: React.FC = () => {
  const {
    staff,
    currentStaffId,
    setCurrentStaffId,
    requests,
    staffAcceptTask,
    staffCompleteTask,
  } = useHotelPulse();

  const [filterView, setFilterView] = useState<'my_tasks' | 'all_sector'>('my_tasks');
  const [completionNotes, setCompletionNotes] = useState<Record<string, string>>({});

  const currentStaff = staff.find((s) => s.id === currentStaffId) || staff[0];

  // Filter tasks for this staff member
  const myTasks = requests.filter(
    (r) =>
      r.assignedToId === currentStaff.id &&
      (r.status === 'asignada' || r.status === 'en_proceso' || r.status === 'resuelta')
  );

  const sectorTasks = requests.filter(
    (r) => r.sector === currentStaff.sector && r.status !== 'resuelta'
  );

  const activeTasksList = filterView === 'my_tasks' ? myTasks : sectorTasks;

  const handleNoteChange = (requestId: string, text: string) => {
    setCompletionNotes((prev) => ({ ...prev, [requestId]: text }));
  };

  const handleComplete = (requestId: string) => {
    const note = completionNotes[requestId] || 'Servicio entregado en mano conforme al estándar del hotel.';
    staffCompleteTask(requestId, note);
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-5 pb-16">
      {/* Staff Identity & Switcher Card */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src={currentStaff.avatar}
              alt={currentStaff.name}
              className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-400 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-white font-['Outfit']">
                  {currentStaff.name}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  En Guardia
                </span>
              </div>
              <p className="text-xs text-amber-400 font-medium">{currentStaff.roleTitle}</p>
              <p className="text-[11px] text-slate-400">Sector: {currentStaff.sector.toUpperCase()}</p>
            </div>
          </div>

          {/* Quick Staff Switcher for demo */}
          <div className="text-right">
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Cambiar Empleado Demo:
            </label>
            <select
              value={currentStaffId}
              onChange={(e) => setCurrentStaffId(e.target.value)}
              className="px-2.5 py-1 text-xs bg-slate-800 text-amber-300 font-semibold rounded-xl border border-slate-700"
            >
              {staff.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} ({member.sector})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>Tareas asignadas hoy: {myTasks.length}</span>
          <span className="text-amber-400 font-bold">
            {myTasks.filter((t) => t.status !== 'resuelta').length} pendientes de entrega
          </span>
        </div>
      </div>

      {/* Tabs: My Tasks vs Sector Tasks */}
      <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm text-xs font-semibold">
        <button
          onClick={() => setFilterView('my_tasks')}
          className={`flex-1 py-2 rounded-lg transition-all ${
            filterView === 'my_tasks'
              ? 'bg-slate-900 text-white font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Mis Tareas Asignadas ({myTasks.filter((t) => t.status !== 'resuelta').length})
        </button>
        <button
          onClick={() => setFilterView('all_sector')}
          className={`flex-1 py-2 rounded-lg transition-all ${
            filterView === 'all_sector'
              ? 'bg-slate-900 text-white font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Bandeja del Sector ({sectorTasks.length})
        </button>
      </div>

      {/* Active Tasks Feed */}
      <div className="space-y-3.5">
        {activeTasksList.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">¡Todo al día!</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No tienes tareas pendientes en este momento. Las nuevas solicitudes que asigne Recepción aparecerán aquí instantáneamente.
            </p>
          </div>
        ) : (
          activeTasksList.map((task) => {
            const isAssignedToMe = task.assignedToId === currentStaff.id;

            return (
              <div
                key={task.id}
                id={`staff-task-card-${task.id}`}
                className={`bg-white rounded-2xl border p-5 shadow-sm transition-all ${
                  task.status === 'resuelta'
                    ? 'border-slate-200 opacity-70 bg-slate-50'
                    : task.status === 'en_proceso'
                    ? 'border-amber-300 ring-2 ring-amber-100 bg-white'
                    : 'border-slate-200/90 hover:border-slate-300'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-900 text-white font-black text-sm flex flex-col items-center justify-center font-mono">
                      <span className="text-[8px] uppercase text-slate-400 font-normal">HAB</span>
                      {task.roomNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-extrabold text-slate-900">{task.title}</h3>
                        {task.priority === 'urgente' && (
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded">
                            Urgente
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{task.details}</p>
                    </div>
                  </div>

                  {/* Status badge */}
                  <div>
                    {task.status === 'asignada' && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                        Por Aceptar
                      </span>
                    )}
                    {task.status === 'en_proceso' && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-100 text-sky-900 border border-sky-200 animate-pulse">
                        En Camino
                      </span>
                    )}
                    {task.status === 'resuelta' && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Completada
                      </span>
                    )}
                  </div>
                </div>

                {/* Additional Info Box */}
                <div className="mt-3.5 p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs flex flex-wrap items-center justify-between gap-2 text-slate-600">
                  <div>
                    <span className="text-slate-400">Huésped:</span>{' '}
                    <strong className="text-slate-900">{task.guestName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Ingreso:</span>{' '}
                    <span className="font-mono text-slate-700">
                      {new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {task.resolutionTimeMinutes && (
                    <div className="text-emerald-700 font-bold">
                      Tiempo total: {task.resolutionTimeMinutes} min
                    </div>
                  )}
                </div>

                {/* ACTION BUTTONS: ACCEPT OR COMPLETE (REQUIRED BY USER WALKTHROUGH) */}
                {task.status !== 'resuelta' && (
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    {task.status === 'asignada' && (
                      <button
                        id={`staff-accept-task-${task.id}`}
                        onClick={() => staffAcceptTask(task.id)}
                        className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                      >
                        <UserCheck className="w-4 h-4 text-slate-950" />
                        <span>Aceptar Tarea e Ir en Camino</span>
                      </button>
                    )}

                    {task.status === 'en_proceso' && (
                      <div className="space-y-2.5">
                        <input
                          type="text"
                          placeholder="Nota de entrega opcional (ej. entregado en mano)..."
                          value={completionNotes[task.id] || ''}
                          onChange={(e) => handleNoteChange(task.id, e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                        />
                        <button
                          id={`staff-complete-task-${task.id}`}
                          onClick={() => handleComplete(task.id)}
                          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Marcar como Entregado / Terminado</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
