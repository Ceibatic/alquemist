# Module 07: Reference Data

## Overview

El modulo de Datos de Referencia gestiona informacion estatica del sistema que es compartida globalmente: ubicaciones geograficas (departamentos, municipios), tipos de cultivo, roles del sistema, y otros catalogos. Estos datos son pre-cargados y generalmente solo leidos por otros modulos.

**Estado**: Implementado

---

## User Stories

### US-07.1: Cargar datos geograficos
**Como** sistema
**Quiero** tener cargados los datos geograficos de Colombia
**Para** que usuarios puedan seleccionar ubicaciones

**Criterios de Aceptacion:**
- [ ] Tabla `geographic_locations` con todos los departamentos
- [ ] Tabla con todos los municipios vinculados a departamentos
- [ ] Cada registro tiene: code, name, administrative_level, parent_code
- [ ] Departamentos tienen timezone asociado
- [ ] Datos cargados via seed script

**Seed:** `convex/seedGeography.ts`

---

### US-07.2: Consultar departamentos
**Como** formulario de empresa o instalacion
**Quiero** obtener lista de departamentos
**Para** mostrar en dropdown

**Criterios de Aceptacion:**
- [ ] Query retorna todos los departamentos (administrative_level = 1)
- [ ] Ordenados alfabeticamente por nombre
- [ ] Incluye code y name
- [ ] Cache de resultados en cliente

**Consulta:** `geography.getDepartments()`

---

### US-07.3: Consultar municipios por departamento
**Como** formulario de empresa o instalacion
**Quiero** obtener municipios de un departamento
**Para** mostrar opciones filtradas

**Criterios de Aceptacion:**
- [ ] Query recibe departmentCode como parametro
- [ ] Retorna municipios con parent_code = departmentCode
- [ ] Ordenados alfabeticamente
- [ ] Respuesta rapida (< 100ms)

**Consulta:** `geography.getMunicipalities({ departmentCode })`

---

### US-07.4: Cargar tipos de cultivo
**Como** sistema
**Quiero** tener cargados los tipos de cultivo soportados
**Para** que usuarios los seleccionen al configurar facilities y areas

**Criterios de Aceptacion:**
- [ ] Tabla `crop_types` con tipos: Cannabis, Cafe, Cacao, Flores
- [ ] Cada registro tiene: name, code, status
- [ ] Status puede ser active/inactive
- [ ] Datos pre-cargados via seed

**Seed:** `convex/seedCropTypes.ts`

---

### US-07.5: Consultar tipos de cultivo
**Como** formulario de facility o area
**Quiero** obtener tipos de cultivo disponibles
**Para** mostrar en checkboxes o dropdown

**Criterios de Aceptacion:**
- [ ] Query retorna todos los crop_types activos
- [ ] Opcion para incluir inactivos (para admin)
- [ ] Cada registro incluye id, name, code

**Consulta:** `crops.getCropTypes({ includeInactive?: boolean })`

---

### US-07.6: Cargar roles del sistema
**Como** sistema
**Quiero** tener cargados los roles predefinidos
**Para** asignar permisos a usuarios

**Criterios de Aceptacion:**
- [ ] Tabla `roles` con roles: SUPER_ADMIN, COMPANY_OWNER, FACILITY_MANAGER, OPERATOR, VIEWER
- [ ] Cada rol tiene: name, code, description, permissions[]
- [ ] Roles son globales (no por empresa)
- [ ] Datos pre-cargados via seed

**Seed:** `convex/seedRoles.ts`

---

### US-07.7: Consultar roles disponibles
**Como** formulario de invitacion o gestion de usuarios
**Quiero** obtener roles que puedo asignar
**Para** mostrar en dropdown

**Criterios de Aceptacion:**
- [ ] Query retorna roles segun nivel del usuario actual
- [ ] COMPANY_OWNER puede asignar: FACILITY_MANAGER, OPERATOR, VIEWER
- [ ] FACILITY_MANAGER puede asignar: OPERATOR, VIEWER
- [ ] Excluye SUPER_ADMIN de seleccion normal

**Consulta:** `roles.getAssignableRoles({ currentUserRole })`

---

### US-07.8: Cargar unidades de medida
**Como** sistema
**Quiero** tener unidades de medida estandarizadas
**Para** uso en inventario y produccion

**Criterios de Aceptacion:**
- [ ] Tabla `units` o catalogo con unidades
- [ ] Categorias: peso, volumen, area, cantidad
- [ ] Unidades comunes: kg, g, mg, L, mL, m², unidad, planta
- [ ] Factores de conversion entre unidades relacionadas

**Seed:** `convex/seedUnits.ts`

---

## Schema

### Tabla: `geographic_locations`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `code` | `string` | Codigo unico (DANE) |
| `name` | `string` | Nombre del lugar |
| `administrative_level` | `number` | 1=departamento, 2=municipio |
| `parent_code` | `string?` | Codigo del padre (depto para municipio) |
| `timezone` | `string?` | Zona horaria (solo departamentos) |
| `country` | `string` | Codigo pais (CO) |

### Tabla: `crop_types`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `name` | `string` | Nombre del cultivo |
| `code` | `string` | Codigo unico |
| `description` | `string?` | Descripcion |
| `status` | `string` | active/inactive |
| `created_at` | `number` | Timestamp |

### Tabla: `roles`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `name` | `string` | Nombre visible |
| `code` | `string` | Codigo unico |
| `description` | `string?` | Descripcion del rol |
| `permissions` | `array<string>` | Lista de permisos |
| `level` | `number` | Jerarquia (1=mas alto) |
| `is_system` | `boolean` | Si es rol de sistema |

---

## Departamentos de Colombia

| Code | Nombre |
|------|--------|
| 05 | Antioquia |
| 08 | Atlantico |
| 11 | Bogota D.C. |
| 13 | Bolivar |
| 15 | Boyaca |
| ... | (32 departamentos) |
| 99 | Vichada |

---

## Tipos de Cultivo

| Code | Nombre ES | Nombre EN |
|------|-----------|-----------|
| `cannabis` | Cannabis | Cannabis |
| `coffee` | Cafe | Coffee |
| `cocoa` | Cacao | Cocoa |
| `flowers` | Flores | Flowers |

---

## Roles del Sistema

| Code | Nombre | Nivel | Descripcion |
|------|--------|-------|-------------|
| `SUPER_ADMIN` | Super Administrador | 1 | Acceso total al sistema |
| `COMPANY_OWNER` | Dueno de Empresa | 2 | Administra toda la empresa |
| `FACILITY_MANAGER` | Gerente de Instalacion | 3 | Administra facilities asignadas |
| `OPERATOR` | Operador | 4 | Operaciones diarias |
| `VIEWER` | Visualizador | 5 | Solo lectura |

---

## Unidades de Medida

| Category | Units |
|----------|-------|
| Peso | kg, g, mg, lb, oz |
| Volumen | L, mL, gal |
| Area | m², ha, ft² |
| Cantidad | unidad, planta, semilla, esqueje |
| Tiempo | dias, semanas, meses |

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

### Geography Queries
| Funcion | Parametros | Retorna |
|---------|------------|---------|
| `getDepartments` | - | `[{ code, name }]` |
| `getMunicipalities` | `departmentCode` | `[{ code, name }]` |
| `getLocation` | `code` | Location completo |

### Crop Types Queries
| Funcion | Parametros | Retorna |
|---------|------------|---------|
| `getCropTypes` | `includeInactive?` | `[{ id, name, code }]` |
| `getCropType` | `id` | CropType completo |

### Roles Queries
| Funcion | Parametros | Retorna |
|---------|------------|---------|
| `getRoles` | - | `[{ id, name, code, level }]` |
| `getAssignableRoles` | `currentUserRole` | Roles que puede asignar |
| `getRole` | `id` | Role completo con permisos |

---

## Seed Scripts

### Ejecucion de Seeds

```bash
# Cargar todos los datos de referencia
npx convex run seedAll

# O individualmente
npx convex run seedGeography
npx convex run seedCropTypes
npx convex run seedRoles
npx convex run seedUnits
```

### Orden de Ejecucion
1. `seedGeography` - Primero (sin dependencias)
2. `seedCropTypes` - Segundo (sin dependencias)
3. `seedRoles` - Tercero (sin dependencias)
4. `seedUnits` - Cuarto (sin dependencias)
5. Otros seeds de datos de prueba

---

## Notas

- Datos de referencia son **read-only** para usuarios normales
- Solo SUPER_ADMIN puede modificar datos de referencia
- Cambios a crop_types activos pueden afectar registros existentes
- Geography data basada en codigos DANE oficiales
- Roles son fijos en MVP, extensibles en futuras fases
