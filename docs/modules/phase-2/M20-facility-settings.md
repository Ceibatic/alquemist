# Module 20: Facility Settings

## Overview

El modulo de Configuracion de Instalacion permite a los administradores configurar parametros especificos de cada instalacion: informacion general, ubicacion geografica, licencias, horarios de operacion, y notificaciones. La configuracion se organiza en 5 tabs para facilitar la navegacion.

**Estado**: Implementado

---

## User Stories

### US-20.1: Acceder a configuracion de instalacion
**Como** administrador de instalacion
**Quiero** acceder a la configuracion de mi instalacion
**Para** modificar parametros operativos

**Criterios de Aceptacion:**
- [ ] Acceso via menu lateral: Configuracion > Instalacion
- [ ] URL: `/settings/facility`
- [ ] PageHeader con nombre de instalacion + descripcion
- [ ] Breadcrumb: Inicio > Configuracion > Instalacion
- [ ] Sistema de 5 tabs navegables: General, Ubicacion, Licencias, Operaciones, Notificaciones
- [ ] Tab activo marcado en URL como query param: `?tab=general`
- [ ] Carga datos de instalacion actual del usuario
- [ ] Estado de carga con skeletons
- [ ] Error si no hay instalacion seleccionada

**Consulta:**
- `users.getUserById({ userId })` → para obtener facilityId
- `facilities.get({ id, companyId })` → datos de instalacion

**Componentes:** [settings/facility/page.tsx](app/(dashboard)/settings/facility/page.tsx), [facility-settings-tabs.tsx](components/settings/facility-settings-tabs.tsx)

---

### US-20.2: Tab General - Informacion basica
**Como** administrador de instalacion
**Quiero** editar la informacion general de la instalacion
**Para** mantener datos actualizados

**Criterios de Aceptacion:**
- [ ] Tab "General" como default al cargar pagina
- [ ] **Campos del formulario:**
  - Nombre de la instalacion* (3-200 caracteres)
  - Tipo de instalacion (select: Indoor, Outdoor, Greenhouse, Mixed)
  - Cultivos primarios* (checkboxes multi-select de crop_types)
  - Area total m² (numerico)
  - Estado (radio: Activa, Inactiva)
- [ ] Validacion en tiempo real con feedback visual
- [ ] Boton "Guardar Cambios" (verde primario)
- [ ] Loading spinner durante guardado
- [ ] Toast de exito al guardar

**Consulta:** `crops.getCropTypes({})` para lista de cultivos
**Escribe:** `facilities.update({ id, companyId, name, facility_type, status, total_area_m2 })`

**Componentes:** [general-info-form.tsx](components/settings/general-info-form.tsx)

---

### US-20.3: Tab Ubicacion - Datos geograficos
**Como** administrador de instalacion
**Quiero** configurar la ubicacion de mi instalacion
**Para** registro regulatorio y visualizacion en mapa

**Criterios de Aceptacion:**
- [ ] Tab "Ubicacion" accesible via `?tab=ubicacion`
- [ ] **Campos del formulario:**
  - Direccion (texto)
  - Ciudad (texto)
  - Departamento/Estado (select o texto)
  - Codigo postal (texto)
  - Pais (select, default: Colombia)
  - Latitud GPS (numerico, -90 a 90)
  - Longitud GPS (numerico, -180 a 180)
  - Altitud metros (numerico)
- [ ] Mapa preview si hay coordenadas (futuro)
- [ ] Boton "Obtener ubicacion actual" (futuro)
- [ ] Validacion de formato coordenadas
- [ ] Toast de exito al guardar

**Escribe:** `facilities.update({ id, companyId, address, city, administrative_division_1, postal_code, gps_latitude, gps_longitude, altitude_meters })`

**Componentes:** [location-form.tsx](components/settings/location-form.tsx)

---

### US-20.4: Tab Licencias - Informacion regulatoria
**Como** administrador de instalacion
**Quiero** gestionar informacion de licencias
**Para** cumplimiento regulatorio y alertas de vencimiento

**Criterios de Aceptacion:**
- [ ] Tab "Licencias" accesible via `?tab=licencias`
- [ ] **Campos del formulario:**
  - Numero de licencia* (read-only, no editable)
  - Tipo de licencia (select: Cultivo, Fabricacion, Procesamiento, etc.)
  - Autoridad emisora (texto)
  - Fecha de emision (date picker)
  - Fecha de vencimiento (date picker)
- [ ] Alerta visual si vencimiento < 30 dias (banner amarillo)
- [ ] Alerta si licencia ya vencio (banner rojo)
- [ ] Dias restantes calculados automaticamente
- [ ] Toast de exito al guardar

**Escribe:** `facilities.update({ id, companyId, license_type, license_authority, license_issued_date, license_expiry_date })`

**Componentes:** [license-form.tsx](components/settings/license-form.tsx)

---

### US-20.5: Tab Operaciones - Horarios y programacion
**Como** administrador de instalacion
**Quiero** configurar horarios de operacion
**Para** automatizar programacion de actividades

**Criterios de Aceptacion:**
- [ ] Tab "Operaciones" accesible via `?tab=operaciones`
- [ ] **Campos del formulario:**
  - Zona horaria* (select: America/Bogota, America/New_York, etc.)
  - Hora de inicio de jornada* (time picker, default: 08:00)
  - Hora de fin de jornada* (time picker, default: 17:00)
  - Dias laborales* (checkboxes: Lun, Mar, Mie, Jue, Vie, Sab, Dom)
  - Duracion por defecto de actividades (minutos, default: 60)
  - Programacion automatica (switch toggle)
- [ ] Descripcion de cada campo
- [ ] Validacion: hora fin > hora inicio
- [ ] Minimo 1 dia laboral seleccionado
- [ ] Toast de exito al guardar

**Escribe:** `facilities.update({ id, companyId, timezone, workday_start, workday_end, workdays, default_activity_duration, auto_scheduling })`

**Validaciones backend:**
- timezone formato valido (Continent/City)
- workday_start/end formato HH:MM
- workdays array de dias validos
- default_activity_duration entre 1-480 minutos

**Componentes:** [operations-form.tsx](components/settings/operations-form.tsx)

---

### US-20.6: Tab Notificaciones - Alertas de instalacion
**Como** administrador de instalacion
**Quiero** configurar que notificaciones recibir
**Para** estar informado de eventos importantes

**Criterios de Aceptacion:**
- [ ] Tab "Notificaciones" accesible via `?tab=notificaciones`
- [ ] **Toggles de notificacion:**
  - Notificaciones habilitadas (master switch)
  - Alertas de stock bajo
  - Alertas de actividades vencidas
  - Alertas de vencimiento de licencia
- [ ] Email para alertas criticas (texto, validacion email)
- [ ] Seccion deshabilitada si master switch = off
- [ ] Feedback visual de estado actual
- [ ] Toast de exito al guardar

**Escribe:** `facilities.update({ id, companyId, notifications_enabled, low_stock_alert_enabled, overdue_activity_alert_enabled, license_expiration_alert_enabled, critical_alert_email })`

**Componentes:** [facility-notifications-form.tsx](components/settings/facility-notifications-form.tsx)

---

## Schema

### Campos de configuracion en `facilities`

| Campo | Tipo | Descripcion | Default |
|-------|------|-------------|---------|
| `timezone` | `string?` | Zona horaria | America/Bogota |
| `workday_start` | `string?` | Hora inicio (HH:MM) | 08:00 |
| `workday_end` | `string?` | Hora fin (HH:MM) | 17:00 |
| `workdays` | `array<string>?` | Dias laborales | [mon-fri] |
| `default_activity_duration` | `number?` | Duracion default minutos | 30 |
| `auto_scheduling` | `boolean?` | Programacion auto | true |
| `notifications_enabled` | `boolean?` | Master switch notif | true |
| `low_stock_alert_enabled` | `boolean?` | Alerta stock bajo | true |
| `overdue_activity_alert_enabled` | `boolean?` | Alerta actividad vencida | true |
| `license_expiration_alert_enabled` | `boolean?` | Alerta licencia | true |
| `critical_alert_email` | `string?` | Email alertas criticas | null |

---

## Zonas Horarias

| Valor | Label |
|-------|-------|
| `America/Bogota` | Colombia (America/Bogota) |
| `America/New_York` | Nueva York (America/New_York) |
| `America/Los_Angeles` | Los Angeles (America/Los_Angeles) |
| `Europe/Madrid` | Madrid (Europa/Madrid) |
| `America/Mexico_City` | Ciudad de Mexico (America/Mexico_City) |

---

## Dias de la Semana

| Valor | Label |
|-------|-------|
| `monday` | Lunes |
| `tuesday` | Martes |
| `wednesday` | Miercoles |
| `thursday` | Jueves |
| `friday` | Viernes |
| `saturday` | Sabado |
| `sunday` | Domingo |

---

## Integraciones

| Modulo | Relacion | Descripcion |
|--------|----------|-------------|
| M18-Facility | Padre | Settings son campos de facility |
| M25-Activities | Config | Usa timezone y workdays para scheduling |
| M19-Inventory | Config | Usa low_stock_alert_enabled |
| Notificaciones | Config | Todos los alert_enabled campos |

---

## API Backend

### Queries
| Funcion | Parametros | Retorna |
|---------|------------|---------|
| `facilities.get` | `id, companyId` | Facility con todos los campos |
| `facilities.getSettings` | `facilityId` | Objeto con defaults aplicados |

### Mutations
| Funcion | Parametros | Validaciones |
|---------|------------|--------------|
| `facilities.update` | `id, companyId, ...campos` | ownership, formatos validos |
| `facilities.updateSettings` | `facilityId, ...settings` | timezone, workday formats |
