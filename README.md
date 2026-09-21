# Hotel Pulse

Hotel Pulse es una plataforma SaaS complementaria para hoteles orientada a operación, experiencia del huésped, mantenimiento y generación de ingresos adicionales.

## Estado actual

La versión inicial es un MVP demostrable creado con React, TypeScript, Vite y Tailwind CSS. Incluye:

- Dashboard ejecutivo.
- Centro de operaciones.
- Gestión de habitaciones.
- Mantenimiento e historial de activos.
- Oportunidades de upselling.
- Experiencias y servicios.
- Portal de huésped.
- Portal de recepción.
- Portal de personal operativo.
- Recorrido guiado del flujo huésped → recepción → personal → administrador.

## Objetivo del producto

Hotel Pulse no busca reemplazar al PMS del hotel. Su función es agregar una capa operativa y comercial que permita:

- reducir tiempos de respuesta;
- ordenar solicitudes internas;
- medir incidencias recurrentes;
- detectar oportunidades de ingresos;
- centralizar servicios propios y externos;
- dar visibilidad ejecutiva al dueño o gerente.

## Próximas etapas

1. Endurecer la demo y eliminar inconsistencias de datos.
2. Persistencia real y autenticación.
3. Modelo multi-hotel completo.
4. Integraciones con WhatsApp y PMS.
5. Motor de reglas y recomendaciones.
6. IA aplicada sobre datos reales del hotel.
7. Analítica de costos, mantenimiento e ingresos.

## Desarrollo

```bash
npm install
npm run dev
```

Para validar tipos:

```bash
npm run lint
```

Para generar producción:

```bash
npm run build
```

## Persistencia con Supabase

El modo local continúa disponible por defecto. Para habilitar persistencia compartida:

1. Crear un proyecto en Supabase.
2. Ejecutar `supabase/migrations/202609200001_hotel_pulse_persistence.sql`.
3. Ejecutar `supabase/seed.sql` para crear los hoteles de demostración.
4. Crear cada usuario en **Authentication → Users** y agregar su UUID a `hotel_members` con el rol correspondiente.
5. Configurar las variables del archivo `.env.example` y establecer `VITE_DATA_SOURCE="remote"`.

Para habilitar **¿Olvidaste tu contraseña?**, configurar en **Authentication → URL Configuration** la URL pública de la aplicación como `Site URL` y agregarla a `Redirect URLs`. Supabase enviará el enlace de recuperación a esa dirección y Hotel Pulse mostrará el formulario para definir la nueva contraseña.

En modo remoto la aplicación exige autenticación. Las políticas RLS derivan los hoteles autorizados de `auth.uid()` y de `hotel_members`; nunca confían en un `hotelId` enviado por el navegador como prueba de acceso.

```sql
insert into public.hotel_members (hotel_id, user_id, role)
values ('hotel-grand-pulse', '<UUID_DEL_USUARIO>', 'admin');
```

Las seis colecciones operativas se guardan en PostgreSQL: habitaciones, personal, solicitudes, mantenimiento, oportunidades y experiencias. Cada registro tiene una clave compuesta por hotel e identificador, por lo que identificadores iguales pueden existir en hoteles diferentes sin mezclar datos.

## Nota

Los datos actuales son de demostración. No representan información operativa real de un hotel.
