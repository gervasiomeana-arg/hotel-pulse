import React, { useState } from 'react';
import { useHotelPulse } from '../../context/HotelPulseContext';
import { ExperienceService } from '../../types';
import {
  Sparkles,
  Percent,
  Calendar,
  Building,
  CheckCircle,
  Plus,
  Power,
  Clock,
  Compass,
  DollarSign,
  Tag,
} from 'lucide-react';

export const ExperiencesView: React.FC = () => {
  const { experiences, toggleExperience, bookExperience, guestRoomNumber } = useHotelPulse();
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = experiences.filter((exp) => {
    if (filterCategory !== 'all' && exp.category !== filterCategory) return false;
    return true;
  });

  const totalCommissionsEarned = experiences.reduce(
    (acc, e) => acc + e.hotelCommissionAmount * e.activeBookings,
    0
  );

  const totalBookings = experiences.reduce((acc, e) => acc + e.activeBookings, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 font-['Outfit']">
              Experiencias & Servicios (Propios y Externos)
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">
              Catálogo Comercial
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Comercialización de spa, traslados, gastronomía, shows y actividades con comisión directa para el hotel.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-bold text-slate-900 font-mono text-emerald-600">
              ${totalCommissionsEarned.toFixed(0)} USD
            </div>
            <div className="text-[11px] text-slate-500">Comisiones generadas este mes</div>
          </div>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 block">Servicios Publicados</span>
          <span className="text-2xl font-black text-slate-900 font-['Outfit'] mt-1 block">
            {experiences.filter((e) => e.active).length} activos
          </span>
          <span className="text-[11px] text-slate-400">Visibles en portal de habitaciones</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 block">Reservas Concretadas</span>
          <span className="text-2xl font-black text-amber-600 font-['Outfit'] mt-1 block">
            {totalBookings}
          </span>
          <span className="text-[11px] text-slate-400">Total acumulado en la temporada</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 block">Promedio Comisión</span>
          <span className="text-2xl font-black text-emerald-600 font-['Outfit'] mt-1 block">34.8%</span>
          <span className="text-[11px] text-slate-400">Mezcla servicios propios y terceros</span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm text-xs font-medium">
        <button
          onClick={() => setFilterCategory('all')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            filterCategory === 'all'
              ? 'bg-slate-900 text-white font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Todos ({experiences.length})
        </button>
        <button
          onClick={() => setFilterCategory('spa')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            filterCategory === 'spa'
              ? 'bg-slate-900 text-white font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Spa & Wellness
        </button>
        <button
          onClick={() => setFilterCategory('traslados')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            filterCategory === 'traslados'
              ? 'bg-slate-900 text-white font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Traslados VIP
        </button>
        <button
          onClick={() => setFilterCategory('gastronomia')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            filterCategory === 'gastronomia'
              ? 'bg-slate-900 text-white font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Gastronomía
        </button>
        <button
          onClick={() => setFilterCategory('espectaculos')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            filterCategory === 'espectaculos'
              ? 'bg-slate-900 text-white font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Espectáculos
        </button>
        <button
          onClick={() => setFilterCategory('estacionamiento')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            filterCategory === 'estacionamiento'
              ? 'bg-slate-900 text-white font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Estacionamiento
        </button>
        <button
          onClick={() => setFilterCategory('excursiones')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            filterCategory === 'excursiones'
              ? 'bg-slate-900 text-white font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Excursiones & Catas
        </button>
      </div>

      {/* EXPERIENCES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((exp) => (
          <div
            key={exp.id}
            id={`experience-card-${exp.id}`}
            className={`bg-white rounded-2xl border transition-all overflow-hidden shadow-sm flex flex-col justify-between ${
              exp.active ? 'border-slate-200/90' : 'border-slate-200 opacity-60 bg-slate-50'
            }`}
          >
            <div>
              {/* Image Banner */}
              <div className="h-44 relative overflow-hidden">
                <img src={exp.image} alt={exp.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                <div className="absolute top-3 left-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${
                      exp.providerType === 'propio'
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-slate-900/80 text-white border border-slate-700'
                    }`}
                  >
                    {exp.providerType === 'propio' ? 'Servicio Propio' : 'Proveedor Externo'}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="text-sm font-bold leading-snug drop-shadow">{exp.title}</h3>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3">
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{exp.description}</p>

                {/* Pricing and Commission breakdown required by user */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Proveedor:</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[170px]">{exp.provider}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Precio al Huésped:</span>
                    <span className="font-mono font-bold text-slate-900">${exp.price} USD</span>
                  </div>
                  <div className="flex items-center justify-between text-emerald-700 font-semibold pt-1 border-t border-slate-200">
                    <span>Comisión Hotel ({exp.hotelCommissionRate}%):</span>
                    <span className="font-mono font-bold">+${exp.hotelCommissionAmount.toFixed(2)} USD</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                    <span>Disponibilidad:</span>
                    <span className="capitalize font-medium text-slate-700">
                      {exp.availability.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions / Toggle */}
            <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                id={`toggle-experience-${exp.id}`}
                onClick={() => toggleExperience(exp.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  exp.active
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    : 'bg-amber-100 text-amber-800'
                }`}
                title={exp.active ? 'Pausar servicio' : 'Activar servicio'}
              >
                <Power className="w-3.5 h-3.5" />
                <span>{exp.active ? 'Activo' : 'Pausado'}</span>
              </button>

              <button
                id={`book-experience-${exp.id}`}
                onClick={() => bookExperience(exp.id, guestRoomNumber)}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all"
                title={`Registrar reserva para Habitación ${guestRoomNumber}`}
              >
                <span>Reservar Hab. {guestRoomNumber}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
