# MyCourt — Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** 2026-04-28  
**Method:** BMad  
**Status:** Approved for Architecture

---

## 1. Resumen Ejecutivo

MyCourt es una plataforma marketplace para la reserva de canchas deportivas en Lima, Perú. Conecta a jugadores con administradores de canchas de vóley, tenis y pádel (Fase 1), con expansión a fútbol y otros deportes (Fase 2). El modelo de negocio es por comisión sobre cada reserva completada.

**Propuesta de valor:**
- Para **jugadores**: encontrar, comparar y reservar canchas deportivas en Lima de forma rápida y segura.
- Para **administradores**: gestionar su inventario de canchas, disponibilidad y pagos en un solo lugar.

---

## 2. Objetivos del Producto

### 2.1 Objetivos de Negocio
- Lanzar MVP en < 3 meses con canchas en toda Lima.
- Generar comisiones del 8–12% por cada reserva completada.
- Alcanzar 50 canchas registradas y 500 reservas en el primer mes post-lanzamiento.

### 2.2 Objetivos de Usuario
- Jugadores: reservar una cancha en < 3 minutos desde cualquier dispositivo.
- Administradores: reducir llamadas/WhatsApp de reservas con gestión digital centralizada.

---

## 3. Usuarios y Roles

### 3.1 Jugador (Player)
- Adulto 18–45 años, Lima.
- Busca cancha por deporte, zona, fecha y hora.
- Paga online y recibe confirmación.
- Puede dejar reseñas.

### 3.2 Administrador de Cancha (Court Owner / Admin)
- Dueño o encargado de 1+ canchas en Lima.
- Registra canchas con fotos, precios, horarios.
- Gestiona disponibilidad y visualiza reservas.
- Recibe pago neto (precio - comisión MyCourt).

### 3.3 Super Admin (Internal)
- Equipo MyCourt.
- Aprueba/rechaza registro de canchas.
- Gestiona comisiones y disputas.

---

## 4. Deportes y Fase

| Deporte      | Fase |
|--------------|------|
| Vóley        | 1    |
| Tenis        | 1    |
| Pádel        | 1    |
| Fútbol       | 2    |
| Básquet      | 2    |
| Otros        | 2    |

---

## 5. Funcionalidades Requeridas (Fase 1)

### 5.1 Autenticación y Onboarding
- FR-01: Registro con email/password.
- FR-02: Login con Google y Apple.
- FR-03: Selección de rol al registrarse: Jugador o Administrador.
- FR-04: Verificación de email.
- FR-05: Onboarding diferenciado por rol (3 pasos máximo).

### 5.2 Catálogo de Canchas (Jugador)
- FR-06: Búsqueda por deporte, distrito de Lima, fecha y rango horario.
- FR-07: Vista de resultados en lista y mapa (Google Maps).
- FR-08: Filtros: precio, tipo de superficie, techada/descubierta, estacionamiento, vestuarios.
- FR-09: Página de detalle de cancha: fotos, descripción, servicios, reseñas, mapa de ubicación.
- FR-10: Selección de slot de tiempo disponible (calendario interactivo).

### 5.3 Sistema de Reservas
- FR-11: Flujo de reserva: seleccionar cancha → slot → pago → confirmación.
- FR-12: Reserva bloqueada 10 minutos durante el proceso de pago.
- FR-13: Confirmación por email y notificación push.
- FR-14: Vista de mis reservas: próximas, pasadas, canceladas.
- FR-15: Cancelación por jugador (política: reembolso 100% si es > 24h antes).
- FR-16: Recordatorio automático 2h antes de la reserva.

### 5.4 Gestión de Canchas (Administrador)
- FR-17: Registrar cancha: nombre, deporte, dirección (con mapa), fotos (hasta 8), precio/hora.
- FR-18: Gestionar horarios de apertura y cierre por día de semana.
- FR-19: Bloquear fechas/horas no disponibles manualmente.
- FR-20: Ver panel de reservas: calendario semanal de ocupación.
- FR-21: Ver historial de pagos recibidos y comisiones cobradas.
- FR-22: Estado de cancha: activa, pausada, pendiente de aprobación.

### 5.5 Pagos
- FR-23: Métodos de pago: tarjeta de crédito/débito, Yape, Plin.
- FR-24: Proveedor: MercadoPago (soporte LATAM y Perú).
- FR-25: Comisión MyCourt: 10% del valor de la reserva.
- FR-26: Pago neto al administrador: procesado T+1 hábil tras reserva completada.
- FR-27: Reembolso automático en cancelaciones dentro de política.
- FR-28: Factura/boleta digital por cada transacción.

### 5.6 Reseñas y Ratings
- FR-29: Jugador puede calificar (1–5 estrellas) y dejar comentario tras reserva completada.
- FR-30: Administrador puede responder reseñas.
- FR-31: Rating promedio visible en la cancha.
- FR-32: Reporte de reseñas inapropiadas.

### 5.7 Notificaciones
- FR-33: Push notifications (móvil) para: confirmación, recordatorio, cancelación.
- FR-34: Email transaccional para: confirmación, cancelación, recibo de pago.
- FR-35: Notificación al admin cuando llega nueva reserva.

### 5.8 Panel Super Admin
- FR-36: Dashboard: métricas clave (reservas, ingresos, canchas activas, usuarios).
- FR-37: Aprobar/rechazar nuevas canchas.
- FR-38: Gestión de usuarios y canchas (activar, suspender).
- FR-39: Ver y gestionar disputas y reembolsos.

---

## 6. Requisitos No Funcionales

| Categoría       | Requisito |
|-----------------|-----------|
| **Rendimiento** | Página de búsqueda carga < 2s en 4G |
| **Disponibilidad** | 99.5% uptime |
| **Seguridad** | HTTPS, JWT tokens, datos de pago tokenizados (PCI-DSS via MercadoPago) |
| **Escalabilidad** | Soportar 10,000 usuarios concurrentes |
| **Accesibilidad** | WCAG 2.1 AA básico |
| **Localización** | Español (Perú), moneda PEN (Soles) |
| **Mobile** | iOS 15+ y Android 10+ |

---

## 7. Métricas de Éxito (KPIs)

- **Mes 1**: 50 canchas activas, 500 reservas, GMV > S/. 25,000.
- **Mes 3**: 200 canchas, 3,000 reservas/mes, NPS > 40.
- **Conversión**: > 30% de búsquedas resultan en reserva.
- **Retención**: > 40% de jugadores repiten dentro de 30 días.

---

## 8. Fuera de Alcance (Fase 1)

- Fútbol y otros deportes.
- Torneos y ligas.
- Chat entre jugadores y admins.
- Programa de lealtad/puntos.
- App para wearables.
- Integración con redes sociales de terceros más allá de login.

---

## 9. Supuestos y Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| Baja adopción de admins | Onboarding asistido (WhatsApp/llamada) en primeros 30 días |
| Fraude en pagos | MercadoPago maneja antifraude; revisión manual en primeras semanas |
| Disponibilidad desactualizada | Bloqueo optimista de slots + confirmación automática |
| Competencia (CanchaYa, etc.) | Diferenciación por UX superior y foco en vóley/pádel |

---

## 10. Timeline de Entrega (< 3 meses)

| Semana | Hito |
|--------|------|
| 1–2 | Setup infraestructura, autenticación, modelos de datos |
| 3–4 | Gestión de canchas (admin), catálogo básico (jugador) |
| 5–6 | Sistema de reservas + integración MercadoPago |
| 7–8 | Reseñas, notificaciones, panel admin interno |
| 9–10 | App móvil (React Native), pulido UX |
| 11–12 | QA, beta testing con canchas piloto, lanzamiento |
