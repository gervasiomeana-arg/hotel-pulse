import React, { useState } from 'react';
import { useHotelPulse } from '../../context/HotelPulseContext';
import { UserRole } from '../../types';
import {
  Building2,
  ChevronDown,
  Activity,
  ShieldAlert,
  ConciergeBell,
  HardHat,
  Smartphone,
  RotateCcw,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentRole,
    setCurrentRole,
    activeHotel,
    setActiveHotel,
    availableHotels,
    guestRoomNumber,
    setGuestRoomNumber,
    requests,
    staff,
    currentStaffId,
    resetDemoData,
    setGuidedTourActive,
  } = useHotelPulse();

  const [hotelDropdownOpen, setHotelDropdownOpen] = useState(false);

  // Computed counters for badges
  const newRequestsCount = requests.filter((r) => r.status === 'nueva').length;
  const staffActiveTasks = requests.filter(
    (r) => r.assignedToId === currentStaffId && (r.status === 'asignada' || r.status === 'en_proceso')
  ).length;

  const currentStaffMember = staff.find((s) => s.id === currentStaffId) || staff[0];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      {/* Top Banner / Pulse Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Hotel Selector */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
                <Activity className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold tracking-tight font-['Outfit'] text-white">
                    HOTEL<span className="text-amber-400 ml-1">PULSE</span>
                  </span>
                  <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1" />
                    LIVE
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 hidden sm:block">Plataforma Operativa & PMS Companion</p>
              </div>
            </div>

            {/* Hotel Selector (Multi-hotel SaaS Ready) */}
            <div className="relative hidden md:block">
              <button
                id="hotel-selector-dropdown-btn"
                onClick={() => setHotelDropdownOpen(!hotelDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-xs text-slate-200 border border-slate-700/60 transition-colors"
              >
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-medium truncate max-w-[150px]">{activeHotel.name}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {hotelDropdownOpen && (
                <div className="absolute left-0 mt-1.5 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1.5 z-50">
                  <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Hoteles Registrados
                  </div>
                  {availableHotels.map((hotel) => (
                    <button
                      key={hotel.id}
                      id={`select-hotel-${hotel.id}`}
                      onClick={() => {
                        setActiveHotel(hotel);
                        setHotelDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                        activeHotel.id === hotel.id ? 'text-amber-400 font-semibold bg-slate-800/50' : 'text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="font-medium">{hotel.name}</div>
                        <div className="text-[10px] text-slate-500">{hotel.city} • {hotel.totalRooms} habs</div>
                      </div>
                      {activeHotel.id === hotel.id && <span className="text-xs text-amber-400">●</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Center/Right: Role Switcher Buttons */}
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-[11px] font-semibold text-slate-400 hidden xl:inline-block mr-1">
              Perfil:
            </span>

            {/* Role 1: Dueño / Admin */}
            <button
              id="role-btn-admin"
              onClick={() => setCurrentRole('admin')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentRole === 'admin'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
              title="Panel de Dueño y Gerencia"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">1. Dueño / Admin</span>
              <span className="lg:hidden">Admin</span>
            </button>

            {/* Role 2: Recepción */}
            <button
              id="role-btn-reception"
              onClick={() => setCurrentRole('reception')}
              className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentRole === 'reception'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
              title="Centro de Operaciones y Recepción"
            >
              <ConciergeBell className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">2. Recepción</span>
              <span className="lg:hidden">Recepción</span>
              {newRequestsCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-extrabold rounded-full bg-rose-500 text-white animate-pulse">
                  {newRequestsCount}
                </span>
              )}
            </button>

            {/* Role 3: Personal */}
            <button
              id="role-btn-staff"
              onClick={() => setCurrentRole('staff')}
              className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentRole === 'staff'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
              title={`Personal Operativo: ${currentStaffMember.name}`}
            >
              <HardHat className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">3. Personal ({currentStaffMember.name.split(' ')[0]})</span>
              <span className="lg:hidden">Personal</span>
              {staffActiveTasks > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-extrabold rounded-full bg-amber-400 text-slate-950">
                  {staffActiveTasks}
                </span>
              )}
            </button>

            {/* Role 4: Huésped Mobile */}
            <button
              id="role-btn-guest"
              onClick={() => setCurrentRole('guest')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentRole === 'guest'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-emerald-600/90 text-white hover:bg-emerald-600'
              }`}
              title="Portal Mobile Huésped (Acceso por QR en Habitación)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">4. Huésped (Hab. {guestRoomNumber})</span>
              <span className="sm:hidden">Hab. {guestRoomNumber}</span>
            </button>

            {/* Guide Tour Button */}
            <button
              id="start-demo-tour-btn"
              onClick={() => setGuidedTourActive(true)}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-600/30 to-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all ml-1"
              title="Recorrido completo: Huésped pide toallas -> Recepción asigna -> Personal entrega -> Admin revisa"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xl:inline">Recorrido Demo</span>
            </button>

            {/* Reset Demo Data Button */}
            <button
              id="reset-demo-data-btn"
              onClick={resetDemoData}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Reiniciar datos de demostración"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
