# Module 18: Facility Management

## Overview

El modulo de Instalaciones permite gestionar las instalaciones de cultivo licenciadas de la empresa. Cada instalacion tiene informacion de licencia, ubicacion geografica, areas de cultivo, y tipos de cultivo permitidos. Los usuarios pueden tener acceso a multiples instalaciones y cambiar entre ellas.

**Estado**: Implementado

---

## User Stories

### US-18.1: Ver lista de instalaciones
**Como** administrador de empresa
**Quiero** ver todas las instalaciones de mi empresa
**Para** gestionar mis sitios de produccion

**Criterios de Aceptacion:**
- [ ] Grid de cards con todas las instalaciones de la empresa
- [ ] Cada card muestra: nombre, numero de licencia, tipo, estado, cultivos permitidos (badges), ubicacion
- [ ] Badge "Actual" en la instalacion activa del usuario
- [ ] Cards clickeables navegan a `/facilities/[id]`
- [ ] Menu kebab con opciones: Ver, Editar, Cambiar a esta instalacion
- [ ] Indicador de limite de plan: "X de Y instalaciones"
- [ ] Barra de progreso si se acerca al limite
- [ ] Estado vacio: icono Factory + mensaje + CTA "Nueva Instalacion"

**Consulta:**
- `facilities.list({ companyId, status? })` → lista de instalaciones
- `users.getUserById({ userId })` → para saber instalacion actual
- `crops.getCropTypes({})` → para resolver nombres de cultivos

**Componentes:** [facilities/page.tsx](app/(dashboard)/facilities/page.tsx), [facilities-content.tsx](app/(dashboard)/facilities/facilities-content.tsx), [facility-card.tsx](components/facilities/facility-card.tsx)

---

### US-18.2: Indicador de limite de plan
**Como** administrador de empresa
**Quiero** ver cuantas instalaciones tengo vs el limite de mi plan
**Para** saber si puedo crear mas

**Criterios de Aceptacion:**
- [ ] Componente en header de pagina de instalaciones
- [ ] Muestra: "X de Y instalaciones" con barra de progreso
- [ ] Color verde si < 80%, amarillo si >= 80%, rojo si = 100%
- [ ] Mensaje de upgrade si alcanza limite
- [ ] Link a pagina de planes si disponible

**Consulta:** `facilities.list({ companyId })` para contar total

**Limites por Plan:**
| Plan | Limite |
|------|--------|
| Basic | 1 |
| Professional | 3 |
| Business | 10 |
| Enterprise | Ilimitado |

**Componentes:** [plan-limit-indicator.tsx](components/facilities/plan-limit-indicator.tsx)

---

### US-18.3: Crear nueva instalacion
**Como** administrador de empresa
**Quiero** registrar una nueva instalacion de cultivo
**Para** expandir mis operaciones

**Criterios de Aceptacion:**
- [ ] Boton "Nueva Instalacion" abre modal
- [ ] Valida limite de plan antes de permitir crear
- [ ] **Seccion Informacion Basica:**
  - Nombre* (unico por empresa)
  - Tipo de instalacion (indoor, outdoor, greenhouse, mixed)
  - Tipos de cultivo permitidos* (multi-select de crop_types)
- [ ] **Seccion Licencia:**
  - Numero de licencia* (unico globalmente)
  - Tipo de licencia (fabricacion, cultivo, etc.)
  - Autoridad emisora
  - Fecha de emision
  - Fecha de vencimiento
- [ ] **Seccion Ubicacion:**
  - Direccion
  - Ciudad, Departamento
  - Codigo postal
  - Latitud/Longitud (opcional, para mapa)
  - Altitud metros
- [ ] **Seccion Areas:**
  - Area total m²
  - Area de cultivo m²
  - Area de canopy m²
- [ ] Toast de exito al crear
- [ ] Si es primera instalacion, se establece como actual automaticamente

**Escribe:** `facilities.create({ company_id, name, license_number, license_type?, ... })`

**Validaciones backend:**
- license_number unico globalmente
- primary_crop_type_ids validos

**Componentes:** [facility-create-modal.tsx](components/facilities/facility-create-modal.tsx), [facility-form.tsx](components/facilities/facility-form.tsx)

---

### US-18.4: Ver detalle de instalacion
**Como** administrador de empresa
**Quiero** ver toda la informacion de una instalacion
**Para** conocer su configuracion y estado

**Criterios de Aceptacion:**
- [ ] Pagina `/facilities/[id]` con informacion completa
- [ ] Header con nombre + badge de estado + boton Editar
- [ ] Badge "Instalacion Actual" si es la activa
- [ ] Breadcrumb: Inicio > Instalaciones > [Nombre]
- [ ] **Card Informacion General:**
  - Tipo de instalacion con icono
  - Estado (active/inactive)
  - Cultivos permitidos como badges
- [ ] **Card Licencia:**
  - Numero de licencia
  - Tipo, Autoridad
  - Fechas emision/vencimiento
  - Alerta si vencimiento < 30 dias (banner rojo)
- [ ] **Card Ubicacion:**
  - Direccion completa
  - Ciudad, Departamento
  - Coordenadas (si existen)
  - Mapa embebido (si coords disponibles)
- [ ] **Card Areas:**
  - Area total, cultivo, canopy en m²
  - Visualizacion proporcional
- [ ] Boton "Cambiar a esta instalacion" si no es la actual
- [ ] Fechas creacion/actualizacion

**Consulta:** `facilities.get({ id, companyId })`

**Componentes:** [facilities/[id]/page.tsx](app/(dashboard)/facilities/[id]/page.tsx)

---

### US-18.5: Editar instalacion
**Como** administrador de empresa
**Quiero** actualizar informacion de una instalacion
**Para** mantener datos actualizados

**Criterios de Aceptacion:**
- [ ] Pagina `/facilities/[id]/edit` con formulario pre-poblado
- [ ] Mismos campos que creacion
- [ ] Numero de licencia no editable (read-only)
- [ ] Botones: Cancelar + Guardar Cambios
- [ ] Toast de exito al guardar
- [ ] Redirige a detalle

**Consulta:** `facilities.get({ id, companyId })` para pre-poblar
**Escribe:** `facilities.update({ id, companyId, ...campos })`

**Componentes:** [facilities/[id]/edit/page.tsx](app/(dashboard)/facilities/[id]/edit/page.tsx), [facility-form.tsx](components/facilities/facility-form.tsx)

---

### US-18.6: Cambiar instalacion activa
**Como** usuario con acceso a multiples instalaciones
**Quiero** cambiar mi instalacion de trabajo actual
**Para** gestionar otra instalacion

**Criterios de Aceptacion:**
- [ ] Boton "Cambiar a esta instalacion" en detalle
- [ ] Opcion en menu kebab de card en lista
- [ ] Selector de instalacion en header/sidebar
- [ ] Al cambiar:
  - Actualiza primary_facility_id del usuario
  - Redirige a dashboard
  - Todos los datos se filtran por nueva instalacion
- [ ] Toast de confirmacion

**Escribe:** `users.setCurrentFacility({ userId, facilityId })`

**Componentes:** [facility-selector.tsx](components/layout/facility-selector.tsx), [facility-card.tsx](components/facilities/facility-card.tsx)

---

### US-18.7: Eliminar instalacion (soft delete)
**Como** administrador de empresa
**Quiero** desactivar una instalacion que ya no uso
**Para** limpiar mi lista sin perder historial

**Criterios de Aceptacion:**
- [ ] Confirmacion antes de eliminar
- [ ] No permite eliminar si hay lotes activos
- [ ] No permite eliminar si es la unica instalacion
- [ ] Soft delete: cambia status a "inactive"
- [ ] Instalacion no aparece en lista con filtros por defecto
- [ ] Si era la instalacion actual, selecciona otra automaticamente

**Escribe:** `facilities.remove({ id, companyId })`

**Validaciones backend:**
- Verificar ownership
- No eliminar si tiene dependencias activas

---

## Schema

### Tabla: `facilities`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `company_id` | `id("companies")` | Empresa propietaria |
| `name` | `string` | Nombre de la instalacion |
| `license_number` | `string` | Numero de licencia (unico) |
| `license_type` | `string?` | Tipo de licencia |
| `license_authority` | `string?` | Autoridad emisora |
| `license_issued_date` | `number?` | Fecha emision |
| `license_expiry_date` | `number?` | Fecha vencimiento |
| `facility_type` | `string?` | indoor/outdoor/greenhouse/mixed |
| `primary_crop_type_ids` | `array<id>` | Cultivos permitidos |
| `address` | `string?` | Direccion |
| `city` | `string?` | Ciudad |
| `administrative_division_1` | `string?` | Departamento |
| `administrative_division_2` | `string?` | Subdivision |
| `regional_code` | `string?` | Codigo regional |
| `postal_code` | `string?` | Codigo postal |
| `latitude` | `number?` | Latitud GPS |
| `longitude` | `number?` | Longitud GPS |
| `altitude_meters` | `number?` | Altitud |
| `total_area_m2` | `number?` | Area total |
| `cultivation_area_m2` | `number?` | Area de cultivo |
| `canopy_area_m2` | `number?` | Area de canopy |
| `status` | `string` | active/inactive |
| `created_at` | `number` | Timestamp creacion |
| `updated_at` | `number` | Timestamp actualizacion |

---

## Tipos de Instalacion

| Valor | Label | Descripcion |
|-------|-------|-------------|
| `indoor` | Interior | Cultivo en espacios cerrados |
| `outdoor` | Exterior | Cultivo al aire libre |
| `greenhouse` | Invernadero | Cultivo bajo cubierta |
| `mixed` | Mixto | Combinacion de tipos |

---

## Tipos de Licencia

| Valor | Label |
|-------|-------|
| `cultivation` | Cultivo |
| `manufacturing` | Fabricacion |
| `processing` | Procesamiento |
| `distribution` | Distribucion |
| `retail` | Venta |
| `research` | Investigacion |

---

## Estados

| Estado | Color | Uso |
|--------|-------|-----|
| `active` | Verde | Operativa |
| `inactive` | Rojo | Desactivada |

---

## Integraciones

| Modulo | Relacion | Descripcion |
|--------|----------|-------------|
| M08-Areas | Hijo | Areas pertenecen a facility |
| M19-Inventory | Hijo | Inventario se filtra por facility |
| M07-Reference Data | Lookup | `crop_types` para cultivos permitidos |
| M20-Settings | Config | Settings de la facility |
| M24-Batches | Hijo | Batches pertenecen a facility |

---

## API Backend

### Queries
| Funcion | Parametros | Retorna |
|---------|------------|---------|
| `list` | `companyId, status?, limit?, offset?` | `{ facilities, total }` |
| `get` | `id, companyId` | Facility (verifica ownership) |
| `getById` | `facilityId, companyId` | Facility (alias) |
| `getFacilitiesByCompany` | `companyId` | Facility[] |
| `checkLicenseAvailability` | `licenseNumber` | `{ available: boolean }` |

### Mutations
| Funcion | Parametros | Validaciones |
|---------|------------|--------------|
| `create` | `company_id, name, license_number, ...` | license_number unico, crop_types validos |
| `update` | `id, companyId, ...campos` | ownership |
| `remove` | `id, companyId` | ownership → soft delete |
| `linkCultivars` | `facilityId, companyId, cultivarIds[]` | facility y cultivars existen |
