import React, { useState } from 'react';
import { useHotelPulse } from '../../context/HotelPulseContext';
import { getConfiguredDataSource } from '../../services/backendContract';
import { Room } from '../../types';
import {
  BedDouble,
  QrCode,
  User,
  AlertTriangle,
  Clock,
  ExternalLink,
  Search,
  Filter,
  Sparkles,
  Phone,
  Calendar,
} from 'lucide-react';

export const RoomsView: React.FC = () => {
  const remoteMode = getConfiguredDataSource() === 'remote';
  const { activeHotel, rooms, setGuestRoomNumber, setCurrentRole, requests, incidents, showToast } = useHotelPulse();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterFloor, setFilterFloor] = useState<string>('all');
  const [selectedRoomForQr, setSelectedRoomForQr] = useState<Room | null>(null);

  const hotelRooms = rooms.filter((room) => room.hotelId === activeHotel.id);
  const hotelRequests = requests.filter((request) => request.hotelId === activeHotel.id);
  const hotelIncidents = incidents.filter((incident) => incident.hotelId === activeHotel.id);
  const getOperationalStatus = (room: Room): Room['status'] => {
    const hasOpenIncident = hotelIncidents.some(
      (incident) => incident.roomNumber === room.number && incident.status !== 'reparado'
    );
    return hasOpenIncident ? 'mantenimiento' : room.status;
  };

  const filteredRooms = hotelRooms.filter((r) => {
    if (filterStatus !== 'all' && getOperationalStatus(r) !== filterStatus) return false;
    if (filterFloor !== 'all' && r.floor.toString() !== filterFloor) return false;
    return true;
  });

  const handleOpenGuestPortal = (roomNumber: string) => {
    if (remoteMode) {
      showToast(
        'Portal protegido',
        'El acceso real del huésped requiere un enlace temporal asociado a la estadía. La simulación sólo está disponible en modo demo.',
        'warning'
      );
      return;
    }
    setGuestRoomNumber(roomNumber);
    setCurrentRole('guest');
  };

  const handleOpenQr = (room: Room) => {
    if (remoteMode) {
      showToast(
        'QR todavía no emitido',
        'Para producción se generará un QR firmado y temporal; no se muestra un enlace ficticio.',
        'warning'
      );
      return;
    }
    setSelectedRoomForQr(room);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 font-['Outfit']">
            Estado de Habitaciones & Accesos QR
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Vista del inventario de habitaciones, huéspedes activos y generación de accesos para habitaciones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Floor filter */}
          <select
            value={filterFloor}
            onChange={(e) => setFilterFloor(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700"
          >
            <option value="all">Todos los pisos</option>
            <option value="1">Piso 1</option>
            <option value="2">Piso 2</option>
            <option value="3">Piso 3</option>
            <option value="4">Piso 4</option>
            <option value="5">Piso 5 (Penthouses)</option>
          </select>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700"
          >
            <option value="all">Todos los estados</option>
            <option value="ocupada">Ocupada</option>
            <option value="limpieza">En Limpieza</option>
            <option value="mantenimiento">Mantenimiento</option>
            <option value="disponible">Disponible</option>
          </select>
        </div>
      </div>

      {/* ROOMS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {filteredRooms.map((room) => {
          const roomRequests = hotelRequests.filter((r) => r.roomNumber === room.number && r.status !== 'resuelta');
          const roomIncidents = hotelIncidents.filter((i) => i.roomNumber === room.number && i.status !== 'reparado');
          const operationalStatus = getOperationalStatus(room);

          let statusClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
          let statusText = 'Disponible';

          if (operationalStatus === 'ocupada') {
            statusClass = 'bg-sky-50 text-sky-800 border-sky-200';
            statusText = 'Ocupada';
          } else if (operationalStatus === 'limpieza') {
            statusClass = 'bg-amber-50 text-amber-800 border-amber-200';
            statusText = 'Limpieza';
          } else if (operationalStatus === 'mantenimiento') {
            statusClass = 'bg-rose-50 text-rose-800 border-rose-200';
            statusText = 'Mantenimiento';
          }

          return (
            <div
              key={room.id}
              id={`room-card-${room.number}`}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center justify-center font-mono">
                      {room.number}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">{room.type}</h3>
                      <span className="text-[11px] text-slate-400">Piso {room.floor}</span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${statusClass}`}>
                    {statusText}
                  </span>
                </div>

                {/* Guest Info if Occupied */}
                {room.status === 'ocupada' && room.currentGuest ? (
                  <div className="mt-3.5 p-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-900 flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>
                          {typeof room.currentGuest === 'object'
                            ? room.currentGuest?.name || 'Huésped Registrado'
                            : String(room.currentGuest || 'Huésped')}
                        </span>
                      </div>
                      {typeof room.currentGuest === 'object' && room.currentGuest?.vip && (
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 bg-amber-400 text-slate-950 rounded">
                          VIP
                        </span>
                      )}
                    </div>
                    {typeof room.currentGuest === 'object' && (
                      <div className="text-[11px] text-slate-500 flex items-center justify-between pt-0.5">
                        <span>Checkout: {room.currentGuest?.checkOut || 'A confirmar'}</span>
                        <span>{room.currentGuest?.guestsCount || 1} pers.</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-3.5 p-2.5 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl text-xs text-slate-400 text-center">
                    Sin huésped registrado
                  </div>
                )}

                {/* Alerts / Active Requests indicators */}
                <div className="mt-3 flex items-center gap-2 text-[11px]">
                  {roomRequests.length > 0 && (
                    <span className="flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      <Clock className="w-3 h-3 text-amber-600" />
                      {roomRequests.length} solicitud activa
                    </span>
                  )}
                  {roomIncidents.length > 0 && (
                    <span className="flex items-center gap-1 font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      {roomIncidents.length} incidencia
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  id={`view-qr-room-${room.number}`}
                  onClick={() => handleOpenQr(room)}
                  className={`p-1.5 rounded-lg transition-colors ${remoteMode ? 'text-amber-600 hover:bg-amber-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
                  title={remoteMode ? 'El QR de producción requiere un token temporal' : 'Ver código QR de acceso para la habitación'}
                >
                  <QrCode className="w-4 h-4" />
                </button>

                <button
                  id={`enter-guest-portal-room-${room.number}`}
                  onClick={() => handleOpenGuestPortal(room.number)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-white rounded-lg text-xs font-bold transition-all ${remoteMode ? 'bg-slate-600 hover:bg-slate-500' : 'bg-slate-900 hover:bg-slate-800'}`}
                >
                  <span>{remoteMode ? 'Portal con acceso seguro' : 'Abrir Portal Huésped'}</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* QR MODAL PREVIEW */}
      {selectedRoomForQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto mb-3">
              <QrCode className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900">
              Acceso QR Habitación {selectedRoomForQr.number}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Impreso en el marco de la puerta, velador y carpeta de bienvenida del huésped.
            </p>

            {/* Simulated QR Pattern */}
            <div className="my-5 p-4 bg-white border-2 border-dashed border-slate-300 rounded-2xl inline-block shadow-inner">
              <div className="w-44 h-44 bg-slate-950 p-2.5 rounded-xl flex items-center justify-center text-white relative">
                {/* SVG QR Code Illustration */}
                <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-current">
                  <rect x="0" y="0" width="30" height="30" fill="white" />
                  <rect x="5" y="5" width="20" height="20" fill="black" />
                  <rect x="10" y="10" width="10" height="10" fill="white" />

                  <rect x="70" y="0" width="30" height="30" fill="white" />
                  <rect x="75" y="5" width="20" height="20" fill="black" />
                  <rect x="80" y="10" width="10" height="10" fill="white" />

                  <rect x="0" y="70" width="30" height="30" fill="white" />
                  <rect x="5" y="75" width="20" height="20" fill="black" />
                  <rect x="10" y="80" width="10" height="10" fill="white" />

                  {/* QR Pattern dots */}
                  <circle cx="45" cy="15" r="4" fill="white" />
                  <circle cx="55" cy="25" r="3" fill="white" />
                  <circle cx="40" cy="40" r="4" fill="white" />
                  <circle cx="50" cy="50" r="5" fill="#f59e0b" />
                  <circle cx="60" cy="40" r="4" fill="white" />
                  <circle cx="45" cy="75" r="4" fill="white" />
                  <circle cx="75" cy="50" r="3" fill="white" />
                  <circle cx="85" cy="75" r="4" fill="white" />
                </svg>
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-2">
                hotelpulse.app/room/{selectedRoomForQr.number}
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  handleOpenGuestPortal(selectedRoomForQr.number);
                  setSelectedRoomForQr(null);
                }}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all"
              >
                Abrir Portal de esta Habitación
              </button>
              <button
                onClick={() => setSelectedRoomForQr(null)}
                className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
