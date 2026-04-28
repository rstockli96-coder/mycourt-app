# Epic 6: App Móvil y Lanzamiento

**ID:** EP-06  
**Prioridad:** Alta  
**Timeline:** Semanas 9–12  
**Objetivo:** App móvil pulida, QA completo y lanzamiento en App Store y Play Store.

---

## Descripción
Adaptar y optimizar la experiencia para iOS y Android usando React Native + Expo, realizar QA exhaustivo con canchas piloto, y preparar el lanzamiento en tiendas.

## Stories

### ST-34: Navegación y UX Móvil
- Expo Router con tabs bottom navigation para jugador.
  - Tabs: Inicio | Buscar | Mis Reservas | Perfil.
- Stack navigation para flujos profundos (detalle cancha, checkout).
- Expo Router para admin con tabs: Dashboard | Canchas | Reservas | Perfil.
- Gestos nativos: swipe back, pull-to-refresh.

### ST-35: Optimizaciones Específicas Móvil
- Imágenes optimizadas con `expo-image` (lazy loading, blur-hash placeholder).
- Mapa nativo con `react-native-maps`.
- Calendario nativo con gestos touch.
- Keyboard-aware scroll en formularios.
- Haptic feedback en acciones clave.

### ST-36: Deep Links y Share
- Universal links / App Links configurados.
- Compartir página de cancha: URL web + App Store link.
- Deep link desde email/notificación a reserva específica.

### ST-37: Configuración EAS Build
- EAS Build configurado para iOS (Simulator + Device) y Android (APK + AAB).
- Certificados iOS (distribution + push).
- Keystore Android.
- OTA updates con EAS Update.

### ST-38: QA y Beta Testing
- TestFlight (10 testers iOS) + Google Play Internal Testing (10 Android).
- Onboarding de 5 canchas piloto en Lima (vóley, tenis, pádel).
- Pruebas de flujo completo: registro → búsqueda → reserva → pago → reseña.
- Pruebas de edge cases: pago fallido, slot ocupado simultáneo, cancelación.
- Performance testing: scroll fluido, tiempo de carga < 2s en 4G.

### ST-39: Assets y Store Listing
- Icono de app (1024x1024 + variantes).
- Splash screen animado.
- Screenshots para App Store (iPhone 6.7") y Play Store.
- Descripción de tienda en español (Perú).
- Privacy Policy y Terms of Service publicados.

### ST-40: Lanzamiento
- Submit a App Store Review (Apple puede tardar 1–3 días).
- Submit a Google Play Review (1–2 días).
- Landing page web: mycourt.pe con SEO básico.
- Configurar Google Analytics 4 + eventos clave.
- Monitoreo de errores: Sentry integrado en web y móvil.

## Criterios de Aceptación del Epic
- [ ] App funciona en iPhone (iOS 15+) y Android (10+) sin crashes.
- [ ] Flujo completo de reserva y pago funciona en dispositivo real.
- [ ] App aprobada y disponible en App Store y Play Store.
- [ ] 5 canchas piloto activas con disponibilidad real.
- [ ] Sentry capturando errores en producción.
