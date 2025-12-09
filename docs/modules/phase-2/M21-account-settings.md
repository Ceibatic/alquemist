# Module 21: Account Settings

## Overview

El modulo de Configuracion de Cuenta permite a cada usuario gestionar su perfil personal, preferencias de interfaz, notificaciones y seguridad. Incluye edicion de datos personales, cambio de contrasena, y configuracion de autenticacion de dos factores (futuro).

**Estado**: Implementado

---

## User Stories

### US-21.1: Acceder a configuracion de cuenta
**Como** usuario del sistema
**Quiero** acceder a mi configuracion personal
**Para** gestionar mi perfil y preferencias

**Criterios de Aceptacion:**
- [ ] Acceso via menu lateral: Configuracion > Mi Cuenta
- [ ] Acceso via menu de usuario en header
- [ ] URL: `/settings/account`
- [ ] PageHeader: "Mi Cuenta" + descripcion
- [ ] Breadcrumb: Inicio > Configuracion > Mi Cuenta
- [ ] Sistema de 4 tabs: Perfil, Preferencias, Notificaciones, Seguridad
- [ ] Tab activo en URL: `?tab=profile`
- [ ] Carga datos del usuario autenticado
- [ ] Estado de carga con skeletons
- [ ] Error si sesion no valida

**Consulta:** `users.getUserById({ userId })`

**Componentes:** [settings/account/page.tsx](app/(dashboard)/settings/account/page.tsx), [account-settings-tabs.tsx](components/settings/account-settings-tabs.tsx)

---

### US-21.2: Tab Perfil - Informacion personal
**Como** usuario del sistema
**Quiero** editar mi informacion personal
**Para** mantener mis datos actualizados

**Criterios de Aceptacion:**
- [ ] Tab "Perfil" como default al cargar
- [ ] **Seccion Avatar:**
  - Avatar circular con iniciales del usuario
  - Nombre completo mostrado
  - Email mostrado (no editable)
- [ ] **Campos del formulario:**
  - Nombre* (texto, min 2 caracteres)
  - Apellido* (texto, min 2 caracteres)
  - Email (read-only, gris, con nota explicativa)
  - Telefono (texto, formato colombiano)
  - Tipo de identificacion (select: CC, CE, NIT, Pasaporte)
  - Numero de identificacion (texto)
- [ ] Validacion en tiempo real
- [ ] Boton "Guardar Cambios"
- [ ] Toast de exito al guardar

**Escribe:** `users.updateProfile({ userId, first_name, last_name, phone?, identification_type?, identification_number? })`

**Componentes:** [profile-form.tsx](components/settings/profile-form.tsx)

---

### US-21.3: Tab Preferencias - Personalizacion
**Como** usuario del sistema
**Quiero** personalizar mi experiencia
**Para** adaptar la interfaz a mis necesidades

**Criterios de Aceptacion:**
- [ ] Tab "Preferencias" accesible via `?tab=preferences`
- [ ] **Campos del formulario:**
  - Idioma (select: Espanol, English) - default Espanol
  - Tema (radio: Claro, Oscuro, Sistema) - default Sistema
  - Formato de fecha (select: DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD)
  - Formato de hora (radio: 12h, 24h)
  - Instalacion por defecto (select de facilities accesibles)
- [ ] Preview de formatos seleccionados
- [ ] Cambio de tema aplicado inmediatamente
- [ ] Toast de exito al guardar

**Escribe:** `users.updatePreferences({ userId, language, theme, date_format, time_format, default_facility_id? })`

**Componentes:** [preferences-form.tsx](components/settings/preferences-form.tsx)

---

### US-21.4: Tab Notificaciones - Alertas personales
**Como** usuario del sistema
**Quiero** configurar mis notificaciones
**Para** recibir solo lo que me interesa

**Criterios de Aceptacion:**
- [ ] Tab "Notificaciones" accesible via `?tab=notifications`
- [ ] **Toggles de notificacion:**
  - Notificaciones por email (master switch)
  - Resumen diario de actividades
  - Alertas de tareas asignadas
  - Alertas de menciones
  - Recordatorios de actividades programadas
- [ ] **Toggles de notificacion in-app:**
  - Notificaciones push (si soportado)
  - Sonidos de notificacion
- [ ] Seccion email deshabilitada si master switch = off
- [ ] Toast de exito al guardar

**Escribe:** `users.updateNotificationSettings({ userId, email_notifications, daily_digest, task_alerts, mention_alerts, reminder_alerts, push_notifications, notification_sounds })`

**Componentes:** [user-notifications-form.tsx](components/settings/user-notifications-form.tsx)

---

### US-21.5: Tab Seguridad - Cambio de contrasena
**Como** usuario del sistema
**Quiero** cambiar mi contrasena
**Para** mantener mi cuenta segura

**Criterios de Aceptacion:**
- [ ] Tab "Seguridad" accesible via `?tab=security`
- [ ] **Seccion Cambiar Contrasena:**
  - Contrasena actual* (password input con toggle visibility)
  - Nueva contrasena* (password input con toggle)
  - Confirmar nueva contrasena* (password input con toggle)
- [ ] **Indicador de fortaleza de contrasena:**
  - Barra visual de progreso (rojo/amarillo/azul/verde)
  - Labels: Debil, Media, Buena, Fuerte
  - Calcula: longitud, mayusculas, numeros, caracteres especiales
- [ ] **Requisitos de contrasena mostrados:**
  - Minimo 8 caracteres
  - Al menos 1 mayuscula
  - Al menos 1 numero
  - Al menos 1 caracter especial
- [ ] Validacion: confirm === new
- [ ] Error si contrasena actual incorrecta
- [ ] Toast de exito, formulario se resetea
- [ ] Boton "Cambiar Contrasena"

**Escribe:** `users.changePassword({ userId, currentPassword, newPassword })`

**Validaciones backend:**
- Verificar contrasena actual
- Nueva contrasena cumple requisitos
- No puede ser igual a la actual

**Componentes:** [security-form.tsx](components/settings/security-form.tsx)

---

### US-21.6: Tab Seguridad - Autenticacion 2FA
**Como** usuario del sistema
**Quiero** activar autenticacion de dos factores
**Para** proteger mejor mi cuenta

**Criterios de Aceptacion:**
- [ ] Seccion "Autenticacion de Dos Factores"
- [ ] Estado actual: No configurado (badge gris)
- [ ] Icono ShieldAlert si desactivado
- [ ] Boton "Configurar 2FA" (deshabilitado con "Proximamente")
- [ ] **Flujo futuro:**
  - Generar codigo QR con secreto
  - Verificar con codigo de authenticator app
  - Generar codigos de backup
  - Mostrar estado: Activado (badge verde)

**Estado:** Placeholder para futura implementacion

---

### US-21.7: Tab Seguridad - Sesiones activas
**Como** usuario del sistema
**Quiero** ver donde tengo sesiones iniciadas
**Para** detectar accesos no autorizados

**Criterios de Aceptacion:**
- [ ] Seccion "Sesiones Activas"
- [ ] Icono ShieldCheck verde para sesion actual
- [ ] Muestra: "Esta es tu sesion actual en este dispositivo"
- [ ] Alert informativo: "Gestion de sesiones multiples disponible en futuras versiones"
- [ ] **Flujo futuro:**
  - Lista de sesiones activas con: dispositivo, ubicacion, fecha
  - Boton "Cerrar sesion" por cada una
  - Boton "Cerrar todas las demas sesiones"

**Estado:** Placeholder para futura implementacion

---

## Schema

### Campos de usuario relevantes

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `first_name` | `string?` | Nombre |
| `last_name` | `string?` | Apellido |
| `email` | `string` | Email (inmutable) |
| `phone` | `string?` | Telefono |
| `identification_type` | `string?` | CC/CE/NIT/Passport |
| `identification_number` | `string?` | Numero identificacion |
| `language` | `string?` | Idioma preferido |
| `theme` | `string?` | light/dark/system |
| `date_format` | `string?` | Formato fecha |
| `time_format` | `string?` | 12h/24h |
| `password_hash` | `string` | Hash de contrasena |

---

## Tipos de Identificacion

| Valor | Label |
|-------|-------|
| `CC` | Cedula de Ciudadania |
| `CE` | Cedula de Extranjeria |
| `NIT` | NIT |
| `Passport` | Pasaporte |

---

## Temas

| Valor | Label |
|-------|-------|
| `light` | Claro |
| `dark` | Oscuro |
| `system` | Sistema (automatico) |

---

## Formatos de Fecha

| Valor | Ejemplo |
|-------|---------|
| `DD/MM/YYYY` | 25/12/2024 |
| `MM/DD/YYYY` | 12/25/2024 |
| `YYYY-MM-DD` | 2024-12-25 |

---

## Indicador de Fortaleza de Contrasena

| Score | Label | Color | Condiciones |
|-------|-------|-------|-------------|
| 0-2 | Debil | Rojo | Pocas condiciones |
| 3 | Media | Amarillo | >= 8 chars + algunas |
| 4 | Buena | Azul | >= 12 chars + mix |
| 5 | Fuerte | Verde | Todas las condiciones |

**Condiciones evaluadas:**
- length >= 8
- length >= 12
- [a-z] + [A-Z]
- [0-9]
- [!@#$%^&*]

---

## Integraciones

| Modulo | Relacion | Descripcion |
|--------|----------|-------------|
| M01-Registration | Origen | Usuario creado en registro |
| M02-Auth | Seguridad | Cambio de contrasena |
| M17-Team | Referencia | Perfil visible en team |
| M18-Facility | Preferencia | default_facility_id |

---

## API Backend

### Queries
| Funcion | Parametros | Retorna |
|---------|------------|---------|
| `users.getUserById` | `userId` | User completo |

### Mutations
| Funcion | Parametros | Validaciones |
|---------|------------|--------------|
| `updateProfile` | `userId, first_name, last_name, phone?, ...` | nombres min 2 chars |
| `updatePreferences` | `userId, language?, theme?, date_format?, ...` | valores validos |
| `updateNotificationSettings` | `userId, email_notifications, ...` | booleans |
| `changePassword` | `userId, currentPassword, newPassword` | password actual valido, nuevo cumple requisitos |
