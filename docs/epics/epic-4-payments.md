# Epic 4: Pagos y Comisiones

**ID:** EP-04  
**Prioridad:** Crítica  
**Timeline:** Semanas 5–6 (paralelo con EP-03)  
**Objetivo:** Procesamiento de pagos end-to-end con MercadoPago y distribución de comisiones.

---

## Descripción
Integración completa con MercadoPago para pagos con tarjeta, Yape y Plin. Sistema de comisiones automático (10% MyCourt), pagos a dueños T+1 hábil, y gestión de reembolsos.

## Stories

### ST-20: Integración MercadoPago — Checkout
- Crear Preference de pago en MP (desde Edge Function `create-booking`).
- Configurar métodos de pago: tarjeta crédito/débito, Yape, Plin.
- Redirect al checkout de MP (web) / SDK nativo MP (móvil).
- URLs de retorno: success, failure, pending.

### ST-21: Webhook MercadoPago
- Edge Function `mp-webhook` en Supabase.
- Verificar firma HMAC-SHA256 del webhook.
- Procesar eventos: `payment.created`, `payment.updated`.
- Lógica:
  - `approved` → confirmar reserva + crear payout.
  - `rejected` → cancelar reserva + liberar slot.
  - `refunded` → actualizar estado a `refunded`.

### ST-22: Sistema de Comisiones
- Cálculo automático al crear reserva: 10% del total = comisión MyCourt.
- `net_amount` = `total_amount` - `commission_amount`.
- Registro en tabla `payments` con breakdown.
- Acumulado de comisiones visible en panel Super Admin.

### ST-23: Payouts a Administradores
- Edge Function `process-payouts` (cron diario 8 AM).
- Seleccionar reservas completadas con payout `pending` de día anterior.
- Transferir `net_amount` a cuenta bancaria/MP del admin.
- Actualizar payout status → `processed`.
- Manejo de errores y reintentos.

### ST-24: Panel de Pagos del Administrador
- Tab "Ingresos" en dashboard del admin.
- Lista de reservas pagadas: fecha, cancha, jugador, total, comisión, neto.
- Resumen mensual: total bruto / comisiones / neto recibido.
- Estado de cada payout: pendiente / procesado.
- Botón "Exportar CSV" del historial.

### ST-25: Reembolsos
- Iniciar reembolso via API de MP al cancelar reserva dentro de política.
- Reembolso total (100%) para cancelaciones > 24h antes.
- Sin reembolso para cancelaciones < 24h (queda como crédito).
- Estado del reembolso visible en "Mis Reservas" del jugador.

### ST-26: Boleta/Recibo Digital
- Generar recibo PDF por cada pago aprobado.
- Datos: número de reserva, cancha, fecha/hora, monto, impuesto (IGV 18%).
- Enviado por email y disponible en "Mis Reservas".

## Criterios de Aceptación del Epic
- [ ] Pago con tarjeta Visa/Mastercard funciona en staging de MP.
- [ ] Webhook recibe y procesa correctamente estados de pago.
- [ ] Comisión 10% se calcula y registra automáticamente.
- [ ] Payout al admin se crea con status `pending` tras pago aprobado.
- [ ] Reembolso se procesa automáticamente en cancelación dentro de política.
- [ ] Admin ve historial de ingresos con breakdown de comisiones.
