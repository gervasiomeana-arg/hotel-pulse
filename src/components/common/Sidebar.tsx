import React from 'react';
import { useHotelPulse, AdminViewType } from '../../context/HotelPulseContext';
import {
  LayoutDashboard,
  Layers,
  BedDouble,
  Wrench,
  TrendingUp,
  Sparkles,
  AlertCircle,
  Building,
} from 'lucide-react';

interface NavItem {
  id: AdminViewType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeColor?: string;
}

export const Sidebar: React.FC = () => {
  const { adminView, setAdminView, requests, incidents, opportunities, activeHotel } = useHotelPulse();

  const pendingRequestsCount = requests.filter((r) => r.status === 'nueva' || r.status === 'asignada').length;
  const criticalIncidentsCount = incidents.filter((i) => i.status !== 'reparado' && (i.priority === 'alta' || i.priority === 'urgente')).length;
  const activeOpportunitiesCount = opportunities.filter((o) => o.status === 'candidato').length;

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'operaciones',
      label: 'Operaciones',
      icon: Layers,
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'habitaciones',
      label: 'Habitaciones',
      icon: BedDouble,
    },
    {
      id: 'mantenimiento',
      label: 'Mantenimiento',
      icon: Wrench,
      badge: criticalIncidentsCount > 0 ? criticalIncidentsCount : undefined,
      badgeColor: 'bg-amber-500 text-slate-950 font-bold',
    },
    {
      id: 'oportunidades',
      label: 'Oportunidades',
      icon: TrendingUp,
      badge: activeOpportunitiesCount > 0 ? `$${opportunities.reduce((acc, o) => acc + o.potentialRevenue, 0)}` : undefined,
      badgeColor: 'bg-emerald-500/20 text-emerald-700 border border-emerald-300 font-bold',
    },
    {
      id: 'experiencias',
      label: 'Experiencias',
      icon: Sparkles,
    },
  ];

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col justify-between min-h-[calc(100vh-4rem)]">
      <div className="p-4">
        {/* Active Property Card */}
        <div className="mb-6 p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 font-bold text-xs">
              <Building className="w-4 h-4 text-amber-700" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-slate-900 truncate">{activeHotel.name}</h3>
              <p className="text-[11px] text-slate-500 truncate">{activeHotel.city}</p>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Gestión Hotelera
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = adminView === item.id;
            return (
              <button
                key={item.id}
                id={`admin-nav-${item.id}`}
                onClick={() => setAdminView(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white font-semibold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      item.badgeColor || 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom info widget */}
      <div className="p-4 border-t border-slate-100">
        <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-[11px] text-slate-700 leading-snug">
              <span className="font-bold text-slate-900 block mb-0.5">Complemento de PMS</span>
              Hotel Pulse centraliza solicitudes, huéspedes y mantenimiento sin reemplazar su software de reservas.
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
