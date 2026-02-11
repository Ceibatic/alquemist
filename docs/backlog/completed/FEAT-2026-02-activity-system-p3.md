# FEAT-2026-02-activity-system-p3

## Metadata
- **Creado:** 2026-02-10
- **Prioridad:** medium
- **Modulo relacionado:** activities, monitoring, quality
- **Tipo:** enhancement
- **Parte de:** Activity System Overhaul (P3 de 3)
- **Requiere:** FEAT-2026-02-activity-system-p1 (completado)
- **Paralelo con:** FEAT-2026-02-activity-system-p2 (no depende de P2)

## Descripcion

Normalizacion de datos de monitoreo, lecturas ambientales y archivos adjuntos en tablas dedicadas. Reemplaza los campos embebidos actuales (`photos[]`, `files[]`, `environmental_data`, `quality_check_data`) con tablas estructuradas que permiten queries directas, dashboards de problemas activos, historial ambiental por zona y gestion de archivos con metadata rica (GPS, EXIF, thumbnails).

El modelo de referencia esta en `docs/data-model-references/activity-model.jsx` (secciones: activity_observations, activity_environmental_readings, activity_attachments).

## User Stories

### US-OBS.1: Schema activity_observations + CRUD backend

**Como** agronomo/scout
**quiero** registrar hallazgos estructurados de monitoreo (plagas, enfermedades, deficiencias) vinculados a actividades
**para** tener un historial consultable de problemas por zona, batch y tipo, con seguimiento de resolucion

#### Criterios de Aceptacion
- [x] Tabla `activity_observations` en schema.ts con campos:
  - `activity_id` (FK activities), `company_id` (FK companies)
  - Clasificacion: `observation_type` (pest/disease/deficiency/excess/mechanical_damage/environmental_stress/growth/positive/other), `severity` (opcional: none/low/medium/high/critical)
  - Organismo: `organism_id` (opcional FK pest_diseases — tabla existente), `organism_name` (opcional string, para cuando no hay FK)
  - Alcance: `affected_area_pct` (opcional number 0-100), `affected_plant_count` (opcional number), `plant_part` (opcional: root/stem/leaf/flower/fruit/whole)
  - Contenido: `description` (string), `recommended_action` (opcional string)
  - Seguimiento: `follow_up_date` (opcional number), `resolved` (boolean default false), `resolved_at` (opcional number), `resolved_by` (opcional FK users), `resolved_by_activity_id` (opcional FK activities — la actividad que resolvio el problema)
  - `attachment_ids` (opcional array string — IDs de activity_attachments especificos de esta observacion)
  - `created_at`
- [x] Indexes: by_activity, by_company, by_observation_type, by_organism, by_follow_up_date, by_resolved
- [x] Backend `convex/activityObservations.ts`:
  - Queries: `listByActivity(activityId)`, `listUnresolved(companyId, observationType?, severity?, zoneId?)`, `listByOrganism(companyId, organismId)`, `getStats(companyId, dateRange?)`
  - Mutations: `create(activityId, observationData)`, `update(observationId, fields)`, `resolve(observationId, resolvedBy, resolvedByActivityId?)`, `reopen(observationId)`
- [x] getStats retorna: total activas, por tipo, por severidad, overdue (follow_up_date < hoy && !resolved)
- [x] `npx next build` pasa

#### Backend
- Tabla nueva: `activity_observations`
- Archivo nuevo: `convex/activityObservations.ts`

#### Dependencias
- Requiere: P1 US-ACT.5 (activities evolucionada con company_id)

---

### US-OBS.2: Schema activity_environmental_readings + CRUD backend

**Como** operador/agronomo
**quiero** registrar lecturas ambientales (temperatura, humedad, VPD, CO2, pH, EC) asociadas a actividades
**para** tener un historial de condiciones ambientales correlacionado con las operaciones realizadas

#### Criterios de Aceptacion
- [x] Tabla `activity_environmental_readings` en schema.ts con campos:
  - `activity_id` (FK activities), `company_id` (FK companies)
  - `reading_type` (string: temperature/humidity/vpd/co2/light_ppfd/light_dli/ph/ec/dissolved_oxygen/wind_speed/soil_moisture)
  - `value` (number), `unit` (string: "C"/"F"/"%"/"kPa"/"ppm"/"umol/m2/s"/"mol/m2/d"/"mS/cm")
  - `measured_at` (number timestamp)
  - `sensor_id` (opcional string — para lecturas automaticas de IoT)
  - `location_note` (opcional string — "Canopy level", "Root zone", "Ambient")
  - `created_at`
- [x] Indexes: by_activity, by_company, by_reading_type, by_measured_at
- [x] Backend `convex/activityEnvironmental.ts`:
  - Query: `listByActivity(activityId)` — retorna todas las lecturas de una actividad ordenadas por reading_type
  - Query: `getHistory(companyId, readingType, zoneId?, dateRange?)` — historial de un tipo de lectura para graficos
  - Mutation: `create(activityId, readings[])` — crear multiples lecturas de una vez (batch insert)
  - Mutation: `update(readingId, value, unit?)` — corregir una lectura
  - Mutation: `remove(readingId)` — eliminar lectura erronea
- [x] Constantes `lib/constants/environmental-readings.ts` con: READING_TYPES (array con type, label, defaultUnit, icon, normalRange)
  - temperature: {label: "Temperatura", unit: "C", icon: "Thermometer", range: [18, 30]}
  - humidity: {label: "Humedad Relativa", unit: "%", icon: "Droplets", range: [40, 70]}
  - vpd: {label: "VPD", unit: "kPa", icon: "Wind", range: [0.8, 1.4]}
  - co2: {label: "CO2", unit: "ppm", icon: "Cloud", range: [400, 1500]}
  - light_ppfd: {label: "Luz PPFD", unit: "umol/m2/s", icon: "Sun", range: [200, 1000]}
  - ph: {label: "pH", unit: "", icon: "Flask", range: [5.5, 6.5]}
  - ec: {label: "EC", unit: "mS/cm", icon: "Zap", range: [1.0, 2.5]}
  - (y demas)
- [x] `npx next build` pasa

#### Backend
- Tabla nueva: `activity_environmental_readings`
- Archivo nuevo: `convex/activityEnvironmental.ts`
- Constantes: `lib/constants/environmental-readings.ts`

#### Dependencias
- Requiere: P1 US-ACT.5 (activities evolucionada)

---

### US-OBS.3: Schema activity_attachments + CRUD backend + file upload

**Como** operador
**quiero** adjuntar fotos y documentos a actividades con metadata rica (tipo, caption, GPS, timestamp)
**para** tener evidencia fotografica organizada y consultable, no solo URLs sin contexto

#### Criterios de Aceptacion
- [x] Tabla `activity_attachments` en schema.ts con campos:
  - `activity_id` (FK activities), `company_id` (FK companies)
  - Clasificacion: `type` (photo/document/video/certificate/lab_result/other)
  - Archivo: `storage_id` (string — Convex storage ID), `file_url` (string — URL publica), `thumbnail_url` (opcional string)
  - Metadata archivo: `file_name` (string), `file_size_bytes` (opcional number), `mime_type` (opcional string)
  - Contenido: `caption` (opcional string — descripcion de la foto/doc)
  - Temporal: `taken_at` (opcional number — cuando se tomo la foto, de EXIF o manual)
  - Geolocation: `geo_lat` (opcional number), `geo_lng` (opcional number)
  - Orden: `sort_order` (number default 0)
  - `uploaded_by` (FK users), `created_at`
- [x] Indexes: by_activity, by_company, by_type
- [x] Backend `convex/activityAttachments.ts`:
  - Query: `listByActivity(activityId)` — ordenadas por sort_order
  - Query: `listByType(companyId, type, limit?)` — ej: todos los lab_results
  - Mutation: `create(activityId, attachmentData)` — crear attachment
  - Mutation: `update(attachmentId, caption?, sort_order?)` — actualizar metadata
  - Mutation: `remove(attachmentId)` — eliminar (tambien elimina de Convex storage)
  - Mutation: `reorder(activityId, attachmentIds[])` — reordenar
  - `generateUploadUrl()` — genera URL de upload para Convex storage
- [x] Integracion con Convex file storage (usa `ctx.storage.generateUploadUrl()` y `ctx.storage.getUrl()`)
- [x] Al eliminar attachment, tambien elimina el archivo de storage
- [x] `npx next build` pasa

#### Backend
- Tabla nueva: `activity_attachments`
- Archivo nuevo: `convex/activityAttachments.ts`

#### Dependencias
- Requiere: P1 US-ACT.5 (activities evolucionada)

---

### US-OBS.4: UI registro de observaciones en actividad de monitoreo

**Como** scout/agronomo
**quiero** un formulario dentro del reporte de actividad para registrar hallazgos de monitoreo
**para** documentar plagas, enfermedades y deficiencias de forma estructurada durante el scouting

#### Criterios de Aceptacion
- [x] Componente `ObservationForm` embebible en cualquier formulario de actividad:
  - Boton "Agregar observacion" que expande un form inline
  - Campos: tipo de observacion (select con iconos), severidad (radio buttons con colores: green/yellow/orange/red), descripcion (textarea)
  - Campos opcionales expandibles: organismo (select de pest_diseases + busqueda), % area afectada (slider 0-100), plantas afectadas (number), parte de planta (select), accion recomendada (textarea), fecha follow-up (date picker)
  - Multiples observaciones por actividad (lista con boton agregar mas)
  - Cada observacion puede tener fotos vinculadas (seleccionar de activity_attachments)
- [x] Dashboard de problemas activos: componente `ActiveIssuesDashboard`
  - Accesible desde pagina de facility o batch
  - Tabla de observaciones no resueltas con: fecha detectada, zona, tipo, severidad (badge color), descripcion corta, dias desde deteccion, fecha follow-up
  - Filtros: por tipo, severidad, zona
  - Ordenar por: severidad (desc), fecha follow-up (asc), fecha deteccion (desc)
  - Accion "Resolver" que pide seleccionar la actividad que resolvio el problema
  - Counter en header: "X problemas activos (Y criticos, Z overdue)"
- [x] Badge en tab de batch: si hay observaciones no resueltas vinculadas al batch, mostrar count badge rojo
- [x] `npx next build` pasa

#### Frontend
- Componentes: `components/observations/observation-form.tsx`, `components/observations/observation-card.tsx`, `components/observations/active-issues-dashboard.tsx`
- Integrar en: formularios de actividad, pagina de batch, pagina de facility

#### Dependencias
- Requiere: US-OBS.1

---

### US-OBS.5: UI lecturas ambientales + galeria de fotos en actividad

**Como** operador
**quiero** registrar lecturas ambientales rapidas y ver/subir fotos organizadas durante una actividad
**para** documentar las condiciones y evidencia visual de cada operacion

#### Criterios de Aceptacion
- [x] Componente `EnvironmentalReadingsInput` embebible en formularios de actividad:
  - Grid de cards de lectura rapida: temperatura, humedad, VPD, CO2, pH, EC (las mas comunes)
  - Cada card: icono + label, input numerico, unidad auto-detectada, indicador de rango (verde/amarillo/rojo segun normalRange de constantes)
  - Boton "Mas lecturas" para tipos menos comunes (light, dissolved_oxygen, etc.)
  - Auto-calculo de VPD si se ingresan temperatura y humedad
  - Timestamp: default now, pero editable
- [x] Componente `ActivityPhotoGallery` para subir y ver fotos:
  - Zona de drop / boton de upload (acepta multiples archivos)
  - Preview de fotos subidas con: thumbnail, nombre, caption editable, tipo (select: photo/document/certificate/lab_result)
  - Drag-and-drop para reordenar fotos
  - Click en foto abre lightbox con caption
  - Indicador de upload progress
  - Usa Convex file storage (generateUploadUrl → upload → create attachment)
- [x] Ambos componentes se renderizan condicionalmente en el formulario de actividad segun activity_type flags:
  - Si type.requires_photos: mostrar PhotoGallery como requerido
  - Siempre mostrar Environmental Readings como seccion opcional (colapsable)
- [x] `npx next build` pasa

#### Frontend
- Componentes: `components/environmental/environmental-readings-input.tsx`, `components/attachments/activity-photo-gallery.tsx`, `components/attachments/file-upload-zone.tsx`

#### Dependencias
- Requiere: US-OBS.2, US-OBS.3

---

### US-OBS.6: Migracion de datos legacy + cleanup

**Como** desarrollador
**quiero** migrar los datos existentes de photos[], files[], environmental_data y quality_check_data a las tablas normalizadas
**para** completar la transicion al nuevo modelo y poder deprecar los campos embebidos

#### Criterios de Aceptacion
- [x] Mutation `migrateAttachments(companyId)` en `convex/activityAttachments.ts`:
  - Para cada activity con photos[] no vacio: crear activity_attachment por cada URL con type="photo"
  - Para cada activity con files[] no vacio: crear activity_attachment por cada URL con type="document"
  - Idempotente: skip si activity ya tiene attachments en la tabla normalizada
  - Procesa en batches de 100
- [x] Mutation `migrateEnvironmentalData(companyId)` en `convex/activityEnvironmental.ts`:
  - Para cada activity con environmental_data no vacio: extraer campos conocidos (temperature, humidity, etc.) y crear activity_environmental_reading por cada uno
  - Mapear campos: temp → temperature, humidity → humidity, vpd → vpd, etc.
  - Idempotente
- [x] Mutation `migrateObservations(companyId)` en `convex/activityObservations.ts`:
  - Para cada activity con quality_check_data que tenga datos de observacion: crear activity_observation
  - Para cada pest_disease_record existente vinculado a una activity: crear activity_observation con organism_id
  - Idempotente
- [x] Reporte de migracion: retorna {attachments_migrated, readings_migrated, observations_migrated, errors[]}
- [x] Despues de migracion verificada, marcar campos como deprecated en comentarios del schema (NO eliminar aun)
- [x] `npx next build` pasa

#### Backend
- Mutations de migracion en los 3 archivos nuevos
- Posibles comentarios en schema.ts marcando campos deprecated

#### Dependencias
- Requiere: US-OBS.1, US-OBS.2, US-OBS.3 (las 3 tablas deben existir)

---

## Schema Changes

### Nueva tabla: `activity_observations`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `activity_id` | `v.id("activities")` | Actividad de monitoreo |
| `company_id` | `v.id("companies")` | Empresa |
| `observation_type` | `v.string()` | pest/disease/deficiency/excess/mechanical_damage/environmental_stress/growth/positive/other |
| `severity` | `v.optional(v.string())` | none/low/medium/high/critical |
| `organism_id` | `v.optional(v.id("pest_diseases"))` | Organismo (FK existente) |
| `organism_name` | `v.optional(v.string())` | Nombre libre si no hay FK |
| `affected_area_pct` | `v.optional(v.number())` | % area afectada (0-100) |
| `affected_plant_count` | `v.optional(v.number())` | Plantas afectadas |
| `plant_part` | `v.optional(v.string())` | root/stem/leaf/flower/fruit/whole |
| `description` | `v.string()` | Descripcion del hallazgo |
| `recommended_action` | `v.optional(v.string())` | Accion recomendada |
| `follow_up_date` | `v.optional(v.number())` | Fecha re-inspeccion |
| `resolved` | `v.boolean()` | Resuelto o no |
| `resolved_at` | `v.optional(v.number())` | Cuando se resolvio |
| `resolved_by` | `v.optional(v.id("users"))` | Quien resolvio |
| `resolved_by_activity_id` | `v.optional(v.id("activities"))` | Actividad que resolvio |
| `attachment_ids` | `v.optional(v.array(v.string()))` | Fotos vinculadas |
| `created_at` | `v.number()` | Timestamp |

### Nueva tabla: `activity_environmental_readings`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `activity_id` | `v.id("activities")` | Actividad asociada |
| `company_id` | `v.id("companies")` | Empresa |
| `reading_type` | `v.string()` | temperature/humidity/vpd/co2/light_ppfd/ph/ec/etc |
| `value` | `v.number()` | Valor de la lectura |
| `unit` | `v.string()` | Unidad (C, %, kPa, ppm, mS/cm) |
| `measured_at` | `v.number()` | Cuando se midio |
| `sensor_id` | `v.optional(v.string())` | ID de sensor IoT |
| `location_note` | `v.optional(v.string())` | "Canopy level", "Root zone" |
| `created_at` | `v.number()` | Timestamp |

### Nueva tabla: `activity_attachments`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `activity_id` | `v.id("activities")` | Actividad padre |
| `company_id` | `v.id("companies")` | Empresa |
| `type` | `v.string()` | photo/document/video/certificate/lab_result/other |
| `storage_id` | `v.string()` | Convex storage ID |
| `file_url` | `v.string()` | URL publica |
| `thumbnail_url` | `v.optional(v.string())` | Thumbnail para fotos |
| `file_name` | `v.string()` | Nombre original |
| `file_size_bytes` | `v.optional(v.number())` | Tamano en bytes |
| `mime_type` | `v.optional(v.string())` | Tipo MIME |
| `caption` | `v.optional(v.string())` | Descripcion |
| `taken_at` | `v.optional(v.number())` | Cuando se tomo (EXIF) |
| `geo_lat` | `v.optional(v.number())` | Latitud GPS |
| `geo_lng` | `v.optional(v.number())` | Longitud GPS |
| `sort_order` | `v.number()` | Orden display |
| `uploaded_by` | `v.id("users")` | Quien subio |
| `created_at` | `v.number()` | Timestamp |

## Consideraciones Tecnicas

- **Independencia de P2:** P3 no depende de templates ni scheduling. Se puede implementar en paralelo con P2 despues de que P1 este completo.
- **File storage:** Usa Convex built-in file storage (`ctx.storage`). No S3 externo. Convex genera URLs publicas automaticamente.
- **Migracion de photos[]:** Los URLs existentes en photos[] pueden ser de Convex storage o URLs externas. La migracion debe manejar ambos casos.
- **pest_diseases tabla existente:** La tabla `pest_diseases` (schema.ts) ya tiene un catalogo de organismos. activity_observations.organism_id hace FK a esta tabla. Si el usuario reporta un organismo no catalogado, usa organism_name como texto libre.
- **VPD auto-calculo:** VPD = (SVP × (1 - RH/100)) donde SVP = 610.7 × 10^(7.5×T/(237.3+T)) / 1000. Se calcula client-side al ingresar T y RH.
- **Performance:** Las queries de historial ambiental pueden crecer rapido. El index by_measured_at permite range queries eficientes. Limitar a ultimos 30 dias por defecto.

## Out of Scope

- Integracion con sensores IoT automaticos (se registran manualmente o via API futura)
- Reconocimiento de plagas por IA desde fotos
- Alertas automaticas basadas en lecturas fuera de rango
- Graficos avanzados de tendencias ambientales (basico en esta fase)
- Compresion/resize de fotos server-side
- OCR de documentos/certificados
- Integracion con laboratorios para importar resultados automaticamente

---

## Implementacion

### Commits
- `e1cbbf1` — feat(activities): US-OBS.1 schema activity_observations + CRUD backend
- `78712b8` — feat(activities): US-OBS.2 schema activity_environmental_readings + CRUD backend
- `092c2ac` — feat(activities): US-OBS.3 schema activity_attachments + CRUD backend + file upload
- `93800f3` — feat(observations): US-OBS.4 observation UI + active issues dashboard
- `4d59e8e` — feat(activities): US-OBS.5 environmental readings input + photo gallery UI
- `114d381` — feat(activities): US-OBS.6 legacy data migration + deprecated field markers

### Archivos Modificados
- `convex/schema.ts` — 3 new tables (activity_observations, activity_environmental_readings, activity_attachments) + deprecated field comments
- `convex/activityObservations.ts` — CRUD + stats + batch count + migration
- `convex/activityEnvironmental.ts` — CRUD + history + migration
- `convex/activityAttachments.ts` — CRUD + file storage integration + migration
- `lib/constants/environmental-readings.ts` — 11 reading types with normal ranges
- `components/observations/observation-form.tsx` — Inline form for adding observations
- `components/observations/observation-card.tsx` — Display card with severity/type badges
- `components/observations/active-issues-dashboard.tsx` — Filterable dashboard of active issues
- `components/environmental/environmental-readings-input.tsx` — Quick-input cards with range indicators
- `components/attachments/activity-photo-gallery.tsx` — Multi-file upload + gallery with lightbox
- `components/attachments/file-upload-zone.tsx` — Reusable drag-and-drop upload zone
- `app/(dashboard)/batches/[id]/page.tsx` — Observations tab with unresolved count badge

### Fecha de Completado
2026-02-10
