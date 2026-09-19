# Hotel Pulse — contrato de backend

Este documento define la estructura mínima que debe respetar el futuro backend compartido.

## Principio de seguridad

El cliente nunca decide a qué hotel puede acceder un usuario. El backend obtiene el `hotelId` autorizado desde la sesión autenticada y aplica ese filtro en cada lectura y escritura.

## Sesión

```ts
{
  userId: string;
  hotelId: string;
  role: 'admin' | 'reception' | 'staff';
  staffId?: string;
}
```

El rol `guest` no utiliza una sesión de empleado. El acceso del huésped deberá resolverse mediante un token temporal asociado a hotel + habitación + estadía.

## Entidades multi-hotel

Las siguientes entidades deben almacenar `hotelId` obligatorio:

- rooms
- staff
- guest_requests
- maintenance_incidents
- upsell_opportunities
- experience_services

Los identificadores de habitación sólo necesitan ser únicos dentro de un hotel. Restricción recomendada: `UNIQUE(hotel_id, number)`.

## Permisos iniciales

| Acción | Admin | Recepción | Staff |
| --- | --- | --- | --- |
| Ver dashboard | Sí | Limitado | No |
| Configurar hotel | Sí | No | No |
| Crear/asignar solicitudes | Sí | Sí | No |
| Aceptar/completar tarea propia | Sí | Sí | Sí |
| Gestionar mantenimiento | Sí | Sí | Según asignación |
| Gestionar oportunidades | Sí | Sí | No |
| Gestionar catálogo comercial | Sí | No | No |

## Reglas obligatorias del servidor

1. Toda consulta operativa se filtra por el `hotelId` de la sesión.
2. No se acepta un `hotelId` enviado por el navegador como autorización.
3. Staff sólo puede modificar tareas del hotel de su sesión.
4. Las transiciones de solicitud válidas son: `nueva -> asignada -> en_proceso -> resuelta`.
5. Los tiempos de resolución se calculan en servidor.
6. Acciones sensibles deben registrar actor y fecha.
7. Configuración requiere rol admin.

## Implementación disponible

El adaptador remoto de Supabase implementa `HotelPulseRepository` sin reescribir los componentes visuales. La selección se controla con `VITE_DATA_SOURCE`:

- `local`: usa `localStorage`, apropiado para la demo aislada;
- `remote`: exige una sesión de Supabase, obtiene los hoteles desde `hotel_members` y sincroniza las seis colecciones con PostgreSQL.

La migración versionada vive en `supabase/migrations/`. Todas las tablas tienen RLS y las escrituras se validan contra el rol de la membresía. El cambio de estado de solicitudes también se valida en PostgreSQL.
