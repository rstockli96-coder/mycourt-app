# Epic 2: Gestión de Canchas (Administrador)

**ID:** EP-02  
**Prioridad:** Crítica  
**Timeline:** Semanas 3–4  
**Objetivo:** Administradores pueden registrar y gestionar sus canchas.

---

## Descripción
Flujo completo para que un administrador de cancha pueda registrar su establecimiento, cargar fotos, definir horarios, precios y disponibilidad. Incluye la aprobación por parte del Super Admin de MyCourt.

## Stories

### ST-07: Registro de Cancha
- Formulario multi-step (3 pasos):
  1. Info básica: nombre, deporte, descripción.
  2. Ubicación: búsqueda por dirección (Google Places API), selección en mapa.
  3. Detalles: precio/hora, tipo de superficie, comodidades (checkbox), fotos.
- Validación con Zod.
- Subida de hasta 8 fotos a Supabase Storage.
- Estado inicial: `pending` (requiere aprobación de Super Admin).

### ST-08: Panel de Canchas del Administrador
- Lista de todas las canchas del admin con estado (activa/pausada/pendiente).
- Acciones: editar, pausar/activar, ver reservas.
- Estadísticas rápidas por cancha: reservas del mes, ingresos.

### ST-09: Gestión de Horarios
- Configurar horario de apertura/cierre por día de semana.
- Duración del slot: 1h o 2h (configurable por cancha).
- Preview del calendario de disponibilidad generado.

### ST-10: Bloqueo Manual de Disponibilidad
- Seleccionar rango de fechas/horas para bloquear.
- Motivo del bloqueo (opcional): mantenimiento, evento privado, etc.
- Ver y eliminar bloqueos activos.

### ST-11: Aprobación de Canchas (Super Admin)
- Panel de canchas pendientes de aprobación.
- Ver detalle completo (fotos, ubicación en mapa, datos del dueño).
- Aprobar → status: `active` + email de confirmación al admin.
- Rechazar con motivo → email al admin con razón.

### ST-12: Edición de Cancha
- Editar todos los campos excepto ubicación (requiere re-aprobación si cambia).
- Gestionar fotos: agregar/eliminar hasta 8.
- Cambios de precio aplican solo a nuevas reservas.

## Criterios de Aceptación del Epic
- [ ] Admin puede registrar cancha con fotos y ubicación en mapa.
- [ ] Cancha queda en estado `pending` hasta aprobación.
- [ ] Super Admin puede aprobar/rechazar desde panel.
- [ ] Admin puede configurar horarios y bloqueos.
- [ ] Admin ve todas sus canchas en un panel centralizado.
