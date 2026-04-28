# Epic 5: Reseñas y Notificaciones

**ID:** EP-05  
**Prioridad:** Alta  
**Timeline:** Semanas 7–8  
**Objetivo:** Sistema de reseñas para construir confianza + notificaciones push y email.

---

## Descripción
Reseñas verificadas (solo jugadores con reserva completada) para construir confianza en el marketplace. Sistema de notificaciones push (móvil) y email transaccional para todos los eventos clave.

## Stories

### ST-27: Dejar Reseña (Jugador)
- Prompt automático 2h después de completada la reserva.
- Rating 1–5 estrellas + comentario de texto libre.
- Solo disponible para reservas con status `completed`.
- Una reseña por reserva (constraint en DB).
- Animación de confirmación tras enviar.

### ST-28: Responder Reseña (Administrador)
- Notificación al admin cuando llega nueva reseña.
- Campo de respuesta en panel del admin.
- Respuesta visible públicamente bajo la reseña.
- Solo una respuesta por reseña (editable 24h).

### ST-29: Visualización de Reseñas (Jugador)
- Rating promedio con distribución de estrellas (barra de porcentajes).
- Lista paginada de reseñas con: nombre jugador (anonimizado parcialmente), fecha, rating, comentario, respuesta del admin.
- Ordenar por: más recientes, mejor calificadas, peor calificadas.

### ST-30: Moderación de Reseñas (Super Admin)
- Jugador puede reportar reseña inapropiada.
- Super Admin ve lista de reseñas reportadas.
- Acciones: ocultar reseña, dejar como está.
- Reseña oculta no afecta el promedio de rating.

### ST-31: Notificaciones Push (Móvil)
- Setup Expo Notifications + OneSignal.
- Registrar push token al hacer login en app móvil.
- Notificaciones implementadas:
  - Reserva confirmada (jugador).
  - Nueva reserva (admin).
  - Recordatorio 2h antes (jugador).
  - Reserva cancelada (jugador y admin).
  - Reseña nueva (admin).

### ST-32: Emails Transaccionales
- Setup Resend + React Email.
- Templates implementados:
  - Confirmación de registro + verificación email.
  - Reserva confirmada (jugador): detalle completo.
  - Nueva reserva (admin): cancha, jugador, fecha/hora.
  - Recordatorio 2h antes: cancha, hora, dirección.
  - Cancelación (jugador): monto a reembolsar.
  - Cancha aprobada (admin).
  - Cancha rechazada con motivo (admin).

### ST-33: Centro de Notificaciones (In-App)
- Ícono de campana con badge de no leídas.
- Lista de notificaciones con timestamp.
- Marcar como leída al tocar.
- Deep link a la sección relevante.

## Criterios de Aceptación del Epic
- [ ] Jugador recibe prompt de reseña tras reserva completada.
- [ ] Rating promedio se actualiza en tiempo real en página de cancha.
- [ ] Push notification llega al móvil en < 30s tras evento.
- [ ] Emails transaccionales se entregan con diseño correcto.
- [ ] Admin puede responder reseñas desde su panel.
