# Epic 3: Búsqueda y Reservas (Jugador)

**ID:** EP-03  
**Prioridad:** Crítica  
**Timeline:** Semanas 5–6  
**Objetivo:** Jugadores pueden buscar, ver y reservar canchas disponibles.

---

## Descripción
El núcleo del producto para jugadores: búsqueda por deporte/zona/fecha, filtros avanzados, detalle de cancha y flujo completo de reserva con selección de slot.

## Stories

### ST-13: Página de Búsqueda
- Barra de búsqueda principal: deporte + distrito + fecha.
- Resultados en vista de tarjetas (lista) y mapa (Google Maps).
- Toggle list/map en mobile.
- Resultado muestra: foto, nombre, precio/hora, rating, distrito.
- Estado vacío amigable si no hay resultados.

### ST-14: Filtros Avanzados
- Precio: rango deslizable (S/. mín – máx).
- Tipo de superficie: arcilla, grass, concreto, sintético, alfombra.
- Techada/Descubierta (is_indoor).
- Con estacionamiento.
- Con vestuarios.
- Disponible ahora (filtro rápido).
- Chips de filtros activos con opción de limpiar.

### ST-15: Página de Detalle de Cancha
- Galería de fotos (carousel).
- Nombre, deporte, descripción.
- Precio por hora en Soles.
- Mapa con ubicación exacta + botón "Cómo llegar" (Google Maps deep link).
- Lista de comodidades (iconos).
- Rating promedio + número de reseñas.
- Últimas 3 reseñas con preview.
- CTA: "Reservar ahora" → abre calendario.

### ST-16: Calendario de Disponibilidad
- Vista semanal del calendario de slots.
- Slots: disponible (verde), ocupado (gris), bloqueado (gris oscuro).
- Selección de fecha → muestra slots de esa fecha.
- Duración configurable según la cancha (1h o 2h slots).
- Resumen: fecha, hora, precio antes de confirmar.

### ST-17: Flujo de Reserva
- Step 1: Confirmar datos (cancha, fecha, hora, precio total).
- Step 2: Seleccionar método de pago → redirección a MercadoPago.
- Step 3: Pantalla de éxito con resumen y número de reserva.
- Manejo de errores: slot ocupado, pago rechazado.
- Bloqueo optimista del slot por 10 minutos durante proceso de pago.

### ST-18: Mis Reservas
- Tabs: Próximas | Pasadas | Canceladas.
- Tarjeta de reserva: cancha, fecha/hora, estado, precio.
- Acción "Ver detalle" con QR/código de reserva para mostrar en cancha.
- Acción "Cancelar" (si es > 24h antes).
- Acción "Repetir reserva" (pre-llena el flujo con misma cancha).

### ST-19: Cancelación por Jugador
- Verificar política (> 24h → reembolso 100%).
- Confirmar cancelación con modal de confirmación.
- Iniciar proceso de reembolso en MercadoPago.
- Email de confirmación de cancelación.

## Criterios de Aceptación del Epic
- [ ] Jugador puede buscar canchas por deporte + distrito + fecha.
- [ ] Vista de mapa y lista funcionan con datos reales.
- [ ] Calendario muestra disponibilidad real en tiempo real.
- [ ] Flujo de reserva completo crea registro en DB y pago en MP.
- [ ] Jugador ve sus reservas organizadas por estado.
- [ ] Cancelación con reembolso funciona dentro de política.
