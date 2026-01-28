# Module 07: Reference Data

## Overview

El modulo de Datos de Referencia gestiona informacion estatica del sistema que es compartida globalmente: ubicaciones geograficas (departamentos, municipios), tipos de cultivo, roles del sistema, unidades de medida, y otros catalogos. Estos datos son pre-cargados y generalmente solo leidos por otros modulos.

**Estado**: Implementado

---

## User Stories

### US-07.1: Cargar datos geograficos
**Como** sistema
**Quiero** tener cargados los datos geograficos de Colombia
**Para** que usuarios puedan seleccionar ubicaciones

**Criterios de Aceptacion:**
- [x] Tabla `geographic_locations` con todos los departamentos
- [x] Tabla con todos los municipios vinculados a departamentos
- [x] Cada registro tiene: country_code, administrative_level, division_1_code/name, division_2_code/name, parent_division_1_code
- [x] Departamentos tienen timezone asociado
- [x] Datos cargados via seed script

**Seed:** `convex/seedGeographic.ts` (tambien: `seedGeographicComplete.ts`, `seedGeographicSimple.ts`)

---

### US-07.2: Consultar departamentos
**Como** formulario de empresa o instalacion
**Quiero** obtener lista de departamentos
**Para** mostrar en dropdown

**Criterios de Aceptacion:**
- [x] Query retorna todos los departamentos (administrative_level = 1)
- [x] Ordenados alfabeticamente por nombre
- [x] Incluye division_1_code y division_1_name
- [x] Cache de resultados en cliente (Convex reactive queries)

**Consulta:** `geographic.getDepartments({ countryCode })`

---

### US-07.3: Consultar municipios por departamento
**Como** formulario de empresa o instalacion
**Quiero** obtener municipios de un departamento
**Para** mostrar opciones filtradas

**Criterios de Aceptacion:**
- [x] Query recibe countryCode y departmentCode como parametros
- [x] Retorna municipios con parent_division_1_code = departmentCode
- [x] Ordenados alfabeticamente
- [x] Respuesta rapida (Convex indexed query)

**Consulta:** `geographic.getMunicipalities({ countryCode, departmentCode })`

---

### US-07.4: Cargar tipos de cultivo
**Como** sistema
**Quiero** tener cargados los tipos de cultivo soportados
**Para** que usuarios los seleccionen al configurar facilities y areas

**Criterios de Aceptacion:**
- [x] Tabla `crop_types` con tipos: Cannabis, Coffee, Cocoa, Flowers
- [x] Cada registro tiene: name, display_name_es, display_name_en, scientific_name, compliance_profile, default_phases
- [x] is_active puede ser true/false
- [x] Datos pre-cargados via seed

**Seed:** `convex/seedCropTypes.ts`

---

### US-07.5: Consultar tipos de cultivo
**Como** formulario de facility o area
**Quiero** obtener tipos de cultivo disponibles
**Para** mostrar en checkboxes o dropdown

**Criterios de Aceptacion:**
- [x] Query retorna todos los crop_types activos
- [x] Opcion para incluir inactivos (para admin)
- [x] Cada registro incluye _id, name, display_name_es/en

**Consulta:** `crops.getCropTypes({ includeInactive?: boolean })`

---

### US-07.6: Cargar roles del sistema
**Como** sistema
**Quiero** tener cargados los roles predefinidos
**Para** asignar permisos a usuarios

**Criterios de Aceptacion:**
- [x] Tabla `roles` con roles: PLATFORM_ADMIN, COMPANY_OWNER, FACILITY_MANAGER, PRODUCTION_SUPERVISOR, WORKER, VIEWER
- [x] Cada rol tiene: name, display_name_es, display_name_en, description, permissions, level, scope_level
- [x] Roles son globales (is_system_role = true)
- [x] Datos pre-cargados via seed

**Seed:** `convex/seedRoles.ts`

---

### US-07.7: Consultar roles disponibles
**Como** formulario de invitacion o gestion de usuarios
**Quiero** obtener roles que puedo asignar
**Para** mostrar en dropdown

**Criterios de Aceptacion:**
- [x] Query retorna roles segun nivel del usuario actual (server-side)
- [x] Filtra roles con level <= nivel del usuario autenticado
- [x] Excluye PLATFORM_ADMIN de seleccion normal
- [x] Funciona sin parametros (usa getAuthUserId internamente)

**Consultas:**
- `roles.list()` — todos los roles activos del sistema
- `roles.getAssignableRoles()` — roles asignables segun usuario autenticado
- `roles.getById({ id })` — rol completo con permisos

---

### US-07.8: Cargar unidades de medida
**Como** sistema
**Quiero** tener unidades de medida estandarizadas
**Para** uso en inventario y produccion

**Criterios de Aceptacion:**
- [x] Tabla `units_of_measure` con unidades
- [x] Categorias: weight, volume, area, quantity, time
- [x] Unidades comunes: kg, g, mg, L, mL, m², unit, plant, seed, cutting
- [x] Factores de conversion a unidad base por categoria

**Seed:** `convex/seedUnits.ts`

---

## Schema

### Tabla: `geographic_locations`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `country_code` | `string` | ISO 3166-1 alpha-2 (ej: "CO") |
| `country_name` | `string` | Nombre del pais |
| `administrative_level` | `number` | 1=departamento, 2=municipio |
| `division_1_code` | `string?` | Codigo DANE del departamento |
| `division_1_name` | `string?` | Nombre del departamento |
| `division_2_code` | `string?` | Codigo DANE del municipio |
| `division_2_name` | `string?` | Nombre del municipio |
| `parent_division_1_code` | `string?` | Codigo del departamento padre |
| `latitude` | `number?` | Latitud |
| `longitude` | `number?` | Longitud |
| `timezone` | `string?` | Zona horaria IANA |
| `is_active` | `boolean` | Activo/inactivo |
| `created_at` | `number` | Timestamp |

**Indices:** `by_country`, `by_division_1`, `by_division_2`, `by_parent`, `by_is_active`

### Tabla: `crop_types`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `name` | `string` | Nombre unico (Cannabis, Coffee, etc.) |
| `display_name_es` | `string` | Nombre en espanol |
| `display_name_en` | `string` | Nombre en ingles |
| `scientific_name` | `string?` | Nombre cientifico |
| `default_tracking_level` | `string` | "batch" o "individual" |
| `individual_tracking_optional` | `boolean` | Si tracking individual es opcional |
| `compliance_profile` | `any` | Requisitos regulatorios regionales |
| `default_phases` | `array<any>` | Fases de produccion |
| `environmental_requirements` | `any?` | Requisitos ambientales |
| `average_cycle_days` | `number?` | Dias promedio del ciclo |
| `average_yield_per_plant` | `number?` | Rendimiento promedio |
| `yield_unit` | `string?` | Unidad de rendimiento |
| `is_active` | `boolean` | Activo/inactivo |
| `created_at` | `number` | Timestamp |

**Indices:** `by_name`, `by_is_active`

### Tabla: `roles`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `name` | `string` | Codigo del rol (COMPANY_OWNER, etc.) |
| `display_name_es` | `string` | Nombre visible en espanol |
| `display_name_en` | `string` | Nombre visible en ingles |
| `description` | `string?` | Descripcion del rol |
| `level` | `number` | Jerarquia (10-1000, mayor = mas alto) |
| `scope_level` | `string` | company/facility/area |
| `permissions` | `any` | Matriz de permisos |
| `inherits_from_role_ids` | `array<any>` | Roles de los que hereda |
| `is_system_role` | `boolean` | Si es rol de sistema |
| `is_active` | `boolean` | Activo/inactivo |
| `created_at` | `number` | Timestamp |

**Indices:** `by_name`, `by_level`, `by_is_active`

### Tabla: `units_of_measure`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `name` | `string` | Nombre (ej: "kilogram") |
| `symbol` | `string` | Simbolo (ej: "kg") |
| `category` | `string` | weight/volume/area/quantity/time |
| `base_unit_symbol` | `string?` | Simbolo de la unidad base |
| `conversion_factor` | `number?` | Factor de conversion a unidad base |
| `is_active` | `boolean` | Activo/inactivo |
| `created_at` | `number` | Timestamp |

**Indices:** `by_category`, `by_symbol`, `by_is_active`

---

## Departamentos de Colombia

| Code | Nombre |
|------|--------|
| 05 | Antioquia |
| 08 | Atlantico |
| 11 | Bogota D.C. |
| 13 | Bolivar |
| 15 | Boyaca |
| ... | (33 departamentos total) |
| 99 | Vichada |

---

## Tipos de Cultivo

| Name | Nombre ES | Nombre EN |
|------|-----------|-----------|
| `Cannabis` | Cannabis | Cannabis |
| `Coffee` | Cafe | Coffee |
| `Cocoa` | Cacao | Cocoa |
| `Flowers` | Flores | Flowers |

---

## Roles del Sistema

| Name | Nombre ES | Nivel | Scope | Descripcion |
|------|-----------|-------|-------|-------------|
| `PLATFORM_ADMIN` | Admin Plataforma | 1000 | company | Acceso total al sistema |
| `COMPANY_OWNER` | Propietario | 1000 | company | Administra toda la empresa |
| `FACILITY_MANAGER` | Gerente de Instalacion | 500 | facility | Administra facilities asignadas |
| `PRODUCTION_SUPERVISOR` | Supervisor de Produccion | 300 | facility | Supervisa actividades de produccion |
| `WORKER` | Trabajador | 100 | area | Operaciones diarias |
| `VIEWER` | Observador | 10 | company | Solo lectura |

---

## Unidades de Medida

| Category | Units |
|----------|-------|
| Weight | kg, g, mg, lb, oz |
| Volume | L, mL, gal |
| Area | m², ha, ft² |
| Quantity | unit, plant, seed, cutting |
| Time | day, week, month |

---

## Integraciones

| Modulo | Relacion | Descripcion |
|--------|----------|-------------|
| M03-Company | Usa | Departamentos y municipios |
| M04-Facility | Usa | Geografia y crop_types |
| M08-Areas | Usa | crop_types para compatibilidad |
| M17-Team | Usa | Roles para asignacion |
| M19-Inventory | Usa | Unidades de medida |

---

## API Backend

### Geography Queries (`convex/geographic.ts`)
| Funcion | Parametros | Retorna |
|---------|------------|---------|
| `getDepartments` | `countryCode` | `[{ division_1_code, division_1_name, ... }]` |
| `getMunicipalities` | `countryCode, departmentCode` | `[{ division_2_code, division_2_name, ... }]` |
| `getLocationByCode` | `countryCode, divisionCode` | Location completo |

### Crop Types Queries (`convex/crops.ts`)
| Funcion | Parametros | Retorna |
|---------|------------|---------|
| `getCropTypes` | `includeInactive?` | `[CropType]` |
| `getCropTypeById` | `id` | CropType completo |
| `getCropTypeByName` | `name` | CropType o null |

### Roles Queries (`convex/roles.ts`)
| Funcion | Parametros | Retorna |
|---------|------------|---------|
| `list` | - | `[{ _id, name, display_name_es/en, level, scope_level }]` |
| `getById` | `id` | Role completo con permisos |
| `getAssignableRoles` | - (usa auth) | Roles asignables segun nivel del usuario |

### Units Queries (`convex/units.ts`)
| Funcion | Parametros | Retorna |
|---------|------------|---------|
| `getUnits` | `category?, includeInactive?` | `[Unit]` |
| `getById` | `id` | Unit completo |
| `getBySymbol` | `symbol` | Unit o null |
| `getCategories` | - | `[string]` categorias disponibles |

---

## Frontend Components

| Componente | Path | Uso |
|------------|------|-----|
| `CascadingSelect` | `components/shared/cascading-select.tsx` | Dropdown departamento > municipio |
| `RoleSelector` | `components/users/role-selector.tsx` | Selector de roles con filtro por nivel |

---

## Seed Scripts

### Ejecucion de Seeds

```bash
# Cargar todos los datos de referencia
npx convex run seedAll:seedAllReferenceData

# O individualmente
npx convex run seedGeographic:seedColombianGeography
npx convex run seedCropTypes:seedCropTypes
npx convex run seedRoles:seedSystemRoles
npx convex run seedUnits:seedUnits
```

### Orden de Ejecucion
1. `seedGeographic` - Primero (sin dependencias)
2. `seedCropTypes` - Segundo (sin dependencias)
3. `seedRoles` - Tercero (sin dependencias)
4. `seedUnits` - Cuarto (sin dependencias)
5. Otros seeds de datos de prueba

---

## Notas

- Datos de referencia son **read-only** para usuarios normales
- Solo PLATFORM_ADMIN puede modificar datos de referencia
- Cambios a crop_types activos pueden afectar registros existentes
- Geography data basada en codigos DANE oficiales
- Roles son fijos en MVP, extensibles en futuras fases
- Unidades de medida incluyen factores de conversion a unidad base por categoria
