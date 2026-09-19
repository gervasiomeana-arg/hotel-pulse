import React, { useState } from 'react';
import { useHotelPulse } from '../../context/HotelPulseContext';
import { BedDouble, Users, Sparkles, Plus } from 'lucide-react';
import { ExperienceService, Room, SectorType } from '../../types';

export const ConfigurationView: React.FC = () => {
  const { activeHotel, rooms, staff, experiences, addRoom, addStaffMember, addExperience } = useHotelPulse();
  const hotelRooms = rooms.filter((room) => room.hotelId === activeHotel.id);
  const hotelStaff = staff.filter((member) => member.hotelId === activeHotel.id);
  const hotelExperiences = experiences.filter((experience) => experience.hotelId === activeHotel.id);

  const [roomNumber, setRoomNumber] = useState('');
  const [roomFloor, setRoomFloor] = useState(1);
  const [roomType, setRoomType] = useState<Room['type']>('Standard');
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffSector, setStaffSector] = useState<SectorType>('housekeeping');
  const [serviceTitle, setServiceTitle] = useState('');
  const [serviceProvider, setServiceProvider] = useState('');
  const [servicePrice, setServicePrice] = useState(0);
  const [commissionRate, setCommissionRate] = useState(20);

  const inputClass = "w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50";
  const buttonClass = "inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800";

  return (
    <div className="space-y-6 pb-12">
      <div>
        <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Configuración</span>
        <h1 className="text-2xl font-extrabold text-slate-900 font-['Outfit']">Preparar {activeHotel.name}</h1>
        <p className="text-sm text-slate-500 mt-1">Carga operativa inicial para incorporar un hotel sin modificar código.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {[
          [BedDouble, 'Habitaciones', hotelRooms.length],
          [Users, 'Personal', hotelStaff.length],
          [Sparkles, 'Servicios', hotelExperiences.length],
        ].map(([Icon, label, value]: any) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-200 p-5">
            <Icon className="w-5 h-5 text-amber-600" />
            <div className="text-3xl font-black mt-3">{value}</div>
            <div className="text-xs font-semibold text-slate-500">{label} cargados</div>
          </div>
        ))}
      </div>

      <div className="grid xl:grid-cols-3 gap-5">
        <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <h2 className="font-bold flex items-center gap-2"><BedDouble className="w-4 h-4" /> Nueva habitación</h2>
          <input className={inputClass} placeholder="Número, ej. 304" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} />
          <input className={inputClass} type="number" min="0" value={roomFloor} onChange={(e) => setRoomFloor(Number(e.target.value))} />
          <select className={inputClass} value={roomType} onChange={(e) => setRoomType(e.target.value as Room['type'])}>
            <option>Standard</option><option>Junior Suite</option><option>Deluxe Suite</option><option>Executive Penthouse</option>
          </select>
          <button className={buttonClass} onClick={() => { if (addRoom({ number: roomNumber, floor: roomFloor, type: roomType })) setRoomNumber(''); }}>
            <Plus className="w-4 h-4" /> Agregar habitación
          </button>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <h2 className="font-bold flex items-center gap-2"><Users className="w-4 h-4" /> Nuevo miembro</h2>
          <input className={inputClass} placeholder="Nombre y apellido" value={staffName} onChange={(e) => setStaffName(e.target.value)} />
          <input className={inputClass} placeholder="Rol, ej. Housekeeping" value={staffRole} onChange={(e) => setStaffRole(e.target.value)} />
          <input className={inputClass} placeholder="Teléfono" value={staffPhone} onChange={(e) => setStaffPhone(e.target.value)} />
          <select className={inputClass} value={staffSector} onChange={(e) => setStaffSector(e.target.value as SectorType)}>
            <option value="housekeeping">Housekeeping</option><option value="maintenance">Mantenimiento</option><option value="room_service">Room Service</option><option value="concierge">Concierge</option><option value="front_desk">Recepción</option>
          </select>
          <button className={buttonClass} disabled={!staffName.trim() || !staffRole.trim()} onClick={() => { addStaffMember({ name: staffName.trim(), roleTitle: staffRole.trim(), phone: staffPhone.trim(), sector: staffSector }); setStaffName(''); setStaffRole(''); setStaffPhone(''); }}>
            <Plus className="w-4 h-4" /> Agregar personal
          </button>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <h2 className="font-bold flex items-center gap-2"><Sparkles className="w-4 h-4" /> Nuevo servicio</h2>
          <input className={inputClass} placeholder="Nombre del servicio" value={serviceTitle} onChange={(e) => setServiceTitle(e.target.value)} />
          <input className={inputClass} placeholder="Proveedor" value={serviceProvider} onChange={(e) => setServiceProvider(e.target.value)} />
          <input className={inputClass} type="number" min="0" placeholder="Precio USD" value={servicePrice} onChange={(e) => setServicePrice(Number(e.target.value))} />
          <input className={inputClass} type="number" min="0" max="100" placeholder="Comisión %" value={commissionRate} onChange={(e) => setCommissionRate(Number(e.target.value))} />
          <button className={buttonClass} disabled={!serviceTitle.trim() || servicePrice <= 0} onClick={() => { addExperience({ title: serviceTitle.trim(), category: 'actividades', provider: serviceProvider.trim() || activeHotel.name, providerType: 'externo', price: servicePrice, hotelCommissionRate: commissionRate, availability: 'con_reserva_previa', active: true, image: '', description: 'Servicio configurado por el hotel.' }); setServiceTitle(''); setServiceProvider(''); setServicePrice(0); }}>
            <Plus className="w-4 h-4" /> Publicar servicio
          </button>
        </section>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-slate-700">
        Los cambios se conservan en este navegador aunque recargues HOTEL PULSE. Esta persistencia local protege el MVP; la siguiente etapa será migrarla a una base de datos compartida con autenticación por hotel.
      </div>
    </div>
  );
};
