# Module 04: Facility Creation (Onboarding)

## Overview

El modulo de Creacion de Instalacion permite al fundador crear su primera instalacion (facility) durante el onboarding. Una instalacion representa un lugar fisico de operaciones: finca, invernadero, bodega, etc. Este modulo se divide en dos pasos: informacion basica y ubicacion.

**Estado**: Implementado

---

## User Stories

### US-04.1: Ver formulario de instalacion - Paso 1
**Como** fundador
**Quiero** ver el formulario de creacion de instalacion
**Para** registrar mi primer lugar de operaciones

**Criterios de Aceptacion:**
- [x] Pagina accesible en `/facility-basic`
- [x] Solo accesible para usuarios con empresa pero sin facility (redirect guard via sessionStorage)
- [x] Redirige a setup-complete si ya tiene facility
- [x] Titulo "Información Básica de la Instalación"
- [x] Indicador de progreso (Paso 3 de 4)
- [x] Indicador de sub-paso (1/2 - Facility)
- [ ] Formulario en dos columnas (desktop) o una columna (mobile)

**Componentes:** [facility-basic/page.tsx](app/(onboarding)/facility-basic/page.tsx)

---

### US-04.2: Ingresar informacion basica de instalacion
**Como** fundador
**Quiero** ingresar los datos basicos de mi instalacion
**Para** identificarla en el sistema

**Criterios de Aceptacion:**
- [x] **Campos del formulario:**
  - Nombre de la Instalacion* (ej: "Finca La Esperanza")
  - Numero de Licencia* (alfanumerico, unico)
  - Tipo de Licencia* (select: Cultivo Comercial, Investigacion, Procesamiento, Otro)
  - Area Licenciada (m²) (numerico, opcional)
  - Cultivos Principales* (checkboxes multi-select: Cannabis, Cafe, Cacao, Flores)
- [x] Al menos un cultivo debe estar seleccionado
- [x] Validacion en tiempo real (Zod + React Hook Form)
- [x] Boton "Continuar a Ubicación" navega al paso 2
- [x] Datos se guardan temporalmente en sessionStorage

**Componentes:** [facility-basic/page.tsx](app/(onboarding)/facility-basic/page.tsx)

---

### US-04.3: Ingresar ubicacion de instalacion - Paso 2
**Como** fundador
**Quiero** especificar donde esta ubicada mi instalacion
**Para** establecer su contexto geografico

**Criterios de Aceptacion:**
- [x] Pagina `/facility-location`
- [x] **Campos del formulario:**
  - Departamento* (cascading select)
  - Municipio* (filtrado por departamento)
  - Direccion (texto libre, opcional)
  - Latitud (numerico, opcional)
  - Longitud (numerico, opcional)
  - Zona Climatica* (select: Tropical, Subtropical, Templado)
- [x] Boton "Obtener Mi Ubicacion" para GPS automatico (GeolocationButton)
- [ ] Mapa de preview (opcional, futuro)
- [x] Botones "Volver a Información Básica" y "Completar Configuración"

**Componentes:** [facility-location/page.tsx](app/(onboarding)/facility-location/page.tsx), [actions.ts](app/(onboarding)/facility-location/actions.ts)

---

### US-04.4: Obtener ubicacion GPS
**Como** fundador
**Quiero** capturar mis coordenadas automaticamente
**Para** no tener que ingresarlas manualmente

**Criterios de Aceptacion:**
- [x] Boton "Obtener Mi Ubicacion" con icono MapPin
- [x] Solicita permiso de geolocalizacion al navegador
- [x] Muestra estado de carga mientras obtiene coordenadas
- [x] Llena campos de latitud y longitud automaticamente
- [x] Mensaje de error si se niega permiso o falla
- [x] Precision de al menos 6 decimales

**Componentes:** [facility-location/page.tsx](app/(onboarding)/facility-location/page.tsx), [geolocation-button.tsx](components/shared/geolocation-button.tsx)

---

### US-04.5: Crear instalacion exitosamente
**Como** fundador
**Quiero** que mi instalacion se cree correctamente
**Para** comenzar a operar en la plataforma

**Criterios de Aceptacion:**
- [x] Instalacion creada en tabla `facilities`
- [x] Vinculada a la empresa del usuario
- [x] Usuario agregado a `facility_users` con rol heredado
- [x] Usuario actualizado con `primaryFacilityId`
- [x] Tipos de cultivo vinculados a la instalacion
- [x] Toast de exito "Instalación creada correctamente"
- [x] Redirige a `/setup-complete`

**Escribe:**
- `facilities.create(...)` → crea instalacion
- `users.update({ userId, currentFacilityId })` → establece facility activa

---

### US-04.8: Generar datos de ejemplo automaticamente
**Como** fundador
**Quiero** tener datos de ejemplo pre-cargados
**Para** explorar la plataforma sin configurar todo manualmente

**Criterios de Aceptacion:**
- [x] Checkbox "Generar datos de ejemplo" visible en paso 2 (ubicacion)
- [x] Checkbox marcado por defecto
- [x] Texto explicativo de que incluye
- [x] Al crear instalacion, si checkbox activo:
  - [x] Genera 6 areas (Almacen, Propagacion, Vegetativo, Floracion, Secado, Curado)
  - [x] Genera 5 cultivares segun tipo de cultivo
  - [x] Genera 4 proveedores demo
  - [x] Genera 14 productos (nutrientes, sustratos, pesticidas, equipos)
  - [x] Genera inventario inicial en area de almacen
  - [x] Genera template de produccion completo con 5 fases y 15 actividades
- [x] Todos los datos demo tienen sufijo "(Demo)" en nombre
- [x] SKUs de productos tienen prefijo "DEMO-"
- [x] Error en generacion no bloquea el onboarding

**Componentes:**
- Frontend: `app/(onboarding)/facility-location/page.tsx`
- Backend: `convex/seedOnboardingData.ts`
- Action: `app/(onboarding)/facility-location/actions.ts`

**Datos generados por tipo de cultivo:**

| Tipo | Areas | Cultivares | Fases Template | Duracion |
|------|-------|------------|----------------|----------|
| Cannabis | 6 | 5 | 5 (Propagacion→Vegetativo→Floracion→Secado→Curado) | 133 dias |
| Coffee | Futuro | Futuro | Futuro | - |
| Cocoa | Futuro | Futuro | Futuro | - |
| Flowers | Futuro | Futuro | Futuro | - |

**Utilidades:**
- `hasSampleData(facilityId)` - Verifica si hay datos demo
- `clearSampleData(companyId, facilityId)` - Elimina datos demo

---

### US-04.6: Ver pagina de onboarding completo
**Como** fundador
**Quiero** ver un resumen de lo que configure
**Para** confirmar que todo esta listo

**Criterios de Aceptacion:**
- [x] Pagina `/setup-complete`
- [x] Icono de check verde grande
- [x] Titulo "¡Configuración Completa!"
- [x] Resumen: Empresa Registrada + Instalación Configurada
- [x] Lista de proximos pasos sugeridos:
  - Crear areas de cultivo
  - Agregar cultivares
  - Registrar inventario inicial
  - Invitar equipo
- [x] Boton "Ir al Dashboard"
- [x] Redirige a `/dashboard`

**Componentes:** [setup-complete/page.tsx](app/(onboarding)/setup-complete/page.tsx)

---

### US-04.7: Validar limites de suscripcion
**Como** sistema
**Quiero** validar que el usuario puede crear mas instalaciones
**Para** respetar los limites del plan

**Criterios de Aceptacion:**
- [x] Verifica company.max_facilities antes de crear
- [x] Si limite alcanzado, muestra error descriptivo
- [x] Sugiere actualizar plan si es trial
- [x] Valida automaticamente contando facilities existentes (sin skipLimitValidation)

**Validaciones backend:**
- Cuenta facilities existentes de la empresa
- Compara con max_facilities del plan
- Retorna error si limite alcanzado

---

## Schema

### Tabla: `facilities`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `company_id` | `id("companies")` | Empresa propietaria |
| `name` | `string` | Nombre de la instalacion |
| `license_number` | `string` | Numero de licencia (unico) |
| `license_type` | `string` | Tipo de licencia |
| `total_area_m2` | `number?` | Area total en m² |
| `primary_crop_type_ids` | `array<id>` | IDs de tipos de cultivo |
| `administrative_division_1` | `string?` | Nombre departamento |
| `administrative_division_2` | `string?` | Nombre municipio |
| `regional_code` | `string?` | Codigo DANE municipio |
| `address` | `string?` | Direccion fisica |
| `latitude` | `number?` | Coordenada GPS |
| `longitude` | `number?` | Coordenada GPS |
| `climate_zone` | `string` | Zona climatica |
| `status` | `string` | active/inactive/suspended |
| `created_at` | `number` | Timestamp creacion |

### Tabla: `facility_users`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `facility_id` | `id("facilities")` | Instalacion |
| `user_id` | `id("users")` | Usuario |
| `role_id` | `id("roles")?` | Rol especifico (opcional) |
| `created_at` | `number` | Timestamp asignacion |

---

## Tipos de Licencia

| Valor | Label ES | Label EN |
|-------|----------|----------|
| `commercial_growing` | Cultivo Comercial | Commercial Growing |
| `research` | Investigacion | Research |
| `processing` | Procesamiento | Processing |
| `other` | Otro | Other |

---

## Zonas Climaticas

| Valor | Label ES | Label EN |
|-------|----------|----------|
| `tropical` | Tropical | Tropical |
| `subtropical` | Subtropical | Subtropical |
| `temperate` | Templado | Temperate |

---

## Tipos de Cultivo (crop_types)

| Valor | Label ES | Label EN |
|-------|----------|----------|
| `cannabis` | Cannabis | Cannabis |
| `coffee` | Cafe | Coffee |
| `cocoa` | Cacao | Cocoa |
| `flowers` | Flores | Flowers |

---

## Integraciones

| Modulo | Relacion | Descripcion |
|--------|----------|-------------|
| M03-Company | Padre | Facility pertenece a company |
| M07-Reference | Lookup | crop_types para cultivos |
| M08-Areas | Hijo | Areas pertenecen a facility |
| M17-Team | Hijo | Usuarios asignados via facility_users |
| M20-Settings | Config | Configuracion de la instalacion |

---

## API Backend

### Mutations
| Funcion | Parametros | Retorna |
|---------|------------|---------|
| `create` | `companyId, name, licenseNumber, licenseType, cropTypeIds, departmentCode, municipalityCode, address?, latitude?, longitude?, climateZone, totalAreaM2?` | `{ facilityId }` |

### Queries
| Funcion | Parametros | Retorna |
|---------|------------|---------|
| `get` | `id, companyId` | Facility completo |
| `list` | `companyId, status?, limit?, offset?` | Lista paginada de facilities |
| `getFacilitiesByCompany` | `companyId` | Lista de facilities |
| `getById` | `facilityId, companyId` | Facility completo |
| `checkLicenseAvailability` | `licenseNumber` | `{ available, licenseNumber }` |

---

## Flujo de Pantallas

```
/company-setup (completado)
    |
    v
/facility-basic (Paso 1: Info Basica)
    |
    v
/facility-location (Paso 2: Ubicacion + Datos de Ejemplo)
    |
    v
[Facility creada + seed data]
    |
    v
/setup-complete
    |
    v
/dashboard
```

---

## Progreso de Onboarding

```
[ 1. Empresa ] --> [ 2. Instalacion ] --> [ Dashboard ]
                        ^^^
                   Paso actual
```

---

## Estados de Facility

| Estado | Color | Uso |
|--------|-------|-----|
| `active` | Verde | Operativa |
| `inactive` | Gris | Deshabilitada |
| `suspended` | Rojo | Suspendida por admin |
