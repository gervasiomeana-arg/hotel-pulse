import React, { useState } from 'react';
import { useHotelPulse } from '../../context/HotelPulseContext';
import { UpsellOpportunity } from '../../types';
import {
  TrendingUp,
  Clock,
  Car,
  Utensils,
  CalendarDays,
  Send,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  Sparkles,
  User,
  Percent,
} from 'lucide-react';

export const OpportunitiesView: React.FC = () => {
  const { activeHotel, opportunities, sendUpsellProposal } = useHotelPulse();
  const [filterType, setFilterType] = useState<string>('all');

  const hotelOpportunities = opportunities.filter((o) => o.hotelId === activeHotel.id);

  const filtered = hotelOpportunities.filter((o) => {
    if (filterType !== 'all' && o.type !== filterType) return false;
    return true;
  });

  const totalPotential = hotelOpportunities.reduce((acc, o) => acc + o.potentialRevenue, 0);
  const totalSent = hotelOpportunities.filter((o) => o.status === 'propuesta_enviada').length;
  const totalAccepted = hotelOpportunities.filter((o) => o.status === 'aceptada').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 font-['Outfit']">
              Oportunidades de Venta Adicional (Upselling)
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
              Ingresos Extra
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Detección de candidatos para late checkout, estacionamiento, gastronomía de autor y extensiones de estadía.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-bold text-slate-900 font-mono text-emerald-600">
              ${totalPotential} USD
            </div>
            <div className="text-[11px] text-slate-500">Pipeline potencial activo</div>
          </div>
        </div>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 block">Candidatos Detectados</span>
          <span className="text-2xl font-black text-slate-900 font-['Outfit'] mt-1 block">
            {hotelOpportunities.length}
          </span>
          <span className="text-[11px] text-slate-400">En base a checkout y hábitos</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 block">Propuestas Enviadas</span>
          <span className="text-2xl font-black text-amber-600 font-['Outfit'] mt-1 block">{totalSent}</span>
          <span className="text-[11px] text-slate-400">Notificadas en portal de habitación</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 block">Propuestas Aceptadas</span>
          <span className="text-2xl font-black text-emerald-600 font-['Outfit'] mt-1 block">
            {totalAccepted + 3}
          </span>
          <span className="text-[11px] text-emerald-600 font-medium">+$210 USD concretados</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 block">Tasa de Conversión</span>
          <span className="text-2xl font-black text-indigo-600 font-['Outfit'] mt-1 block">38.5%</span>
          <span className="text-[11px] text-slate-400">Por encima de la media hotelera</span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm text-xs font-medium">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            filterType === 'all'
              ? 'bg-slate-900 text-white font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Todas ({hotelOpportunities.length})
        </button>
        <button
          onClick={() => setFilterType('late_checkout')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            filterType === 'late_checkout'
              ? 'bg-slate-900 text-white font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Late Checkout</span>
        </button>
        <button
          onClick={() => setFilterType('parking')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            filterType === 'parking'
              ? 'bg-slate-900 text-white font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Car className="w-3.5 h-3.5" />
          <span>Cochera & Valet</span>
        </button>
        <button
          onClick={() => setFilterType('gastronomy')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            filterType === 'gastronomy'
              ? 'bg-slate-900 text-white font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Utensils className="w-3.5 h-3.5" />
          <span>Gastronomía</span>
        </button>
        <button
          onClick={() => setFilterType('stay_extension')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            filterType === 'stay_extension'
              ? 'bg-slate-900 text-white font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CalendarDays className="w-3.5 h-3.5" />
          <span>Extensión de Estadía</span>
        </button>
      </div>

      {/* OPPORTUNITIES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((opp) => {
          let typeIcon = <Clock className="w-4 h-4 text-amber-600" />;
          let typeLabel = 'Late Checkout';

          if (opp.type === 'parking') {
            typeIcon = <Car className="w-4 h-4 text-sky-600" />;
            typeLabel = 'Cochera & Valet';
          } else if (opp.type === 'gastronomy') {
            typeIcon = <Utensils className="w-4 h-4 text-rose-600" />;
            typeLabel = 'Gastronomía de Autor';
          } else if (opp.type === 'stay_extension') {
            typeIcon = <CalendarDays className="w-4 h-4 text-purple-600" />;
            typeLabel = 'Extensión de Estadía';
          }

          return (
            <div
              key={opp.id}
              id={`upsell-card-${opp.id}`}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                      {typeIcon}
                    </span>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        {typeLabel}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">{opp.title}</h3>
                    </div>
                  </div>

                  <span className="text-base font-extrabold text-emerald-600 font-mono">
                    +${opp.potentialRevenue} <span className="text-[10px] text-slate-400">USD</span>
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-3 leading-relaxed">{opp.description}</p>

                {/* Candidate details */}
                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-medium">
                    <span className="text-slate-500">Huésped:</span>
                    <span className="font-bold text-slate-900">
                      {opp.guestName} (Hab. {opp.roomNumber})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Checkout agendado:</span>
                    <span className="font-mono text-slate-700">{opp.checkoutDate}</span>
                  </div>
                  <div className="flex items-start justify-between gap-2 pt-1 border-t border-slate-200/80">
                    <span className="text-slate-500 shrink-0">Acción sugerida:</span>
                    <span className="text-right text-slate-700 font-medium">{opp.suggestedAction}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  {opp.status === 'candidato' && (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                      Candidato Detectado
                    </span>
                  )}
                  {opp.status === 'propuesta_enviada' && (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-sky-100 text-sky-800 flex items-center gap-1">
                      <Send className="w-3 h-3" />
                      Propuesta Enviada
                    </span>
                  )}
                  {opp.status === 'aceptada' && (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Aceptada por Huésped
                    </span>
                  )}
                </div>

                {opp.status === 'candidato' ? (
                  <button
                    id={`send-proposal-${opp.id}`}
                    onClick={() => sendUpsellProposal(opp.id)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    <Send className="w-3 h-3 text-amber-400" />
                    <span>Enviar Propuesta</span>
                  </button>
                ) : (
                  <span className="text-xs text-slate-400 font-medium">Notificado en habitación</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
