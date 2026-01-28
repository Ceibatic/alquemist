# Module 03: Company Setup

## Overview

El modulo de Configuracion de Empresa permite al primer usuario (fundador) crear su empresa en la plataforma. Define el nombre, tipo de negocio, industria y ubicacion geografica. El usuario que crea la empresa automaticamente recibe el rol COMPANY_OWNER.

**Estado**: Implementado

---

## User Stories

### US-03.1: Ver formulario de creacion de empresa
**Como** usuario recien verificado sin empresa
**Quiero** ver el formulario de creacion de empresa
**Para** comenzar a configurar mi organizacion

**Criterios de Aceptacion:**
- [ ] Pagina accesible en `/company-setup`
- [ ] Solo accesible para usuarios verificados sin company_id
- [ ] Redirige a dashboard si ya tiene empresa
- [ ] Logo de Alquemist y titulo "Crea tu Empresa"
- [ ] Descripcion del paso en el onboarding
- [ ] Indicador de progreso (Paso 1 de 2)
- [ ] Formulario centrado con ancho maximo

**Componentes:** [company-setup/page.tsx](app/(onboarding)/company-setup/page.tsx), [company-form.tsx](components/onboarding/company-form.tsx)

---

### US-03.2: Ingresar datos de la empresa
**Como** fundador
**Quiero** ingresar la informacion de mi empresa
**Para** registrarla en el sistema

**Criterios de Aceptacion:**
- [ ] **Campos del formulario:**
  - Nombre de la Empresa* (min 2 caracteres)
  - Tipo de Negocio* (select: S.A.S, S.A., Ltda, E.U., Persona Natural)
  - Industria* (select: Cannabis, Cafe, Cacao, Flores, Mixto)
  - Departamento* (select dinamico de Colombia)
  - Municipio* (select filtrado por departamento)
- [ ] Dropdowns de departamento y municipio cargados desde backend
- [ ] Municipio se filtra automaticamente al cambiar departamento
- [ ] Validacion en tiempo real de campos obligatorios
- [ ] Boton "Crear Empresa" (amber-500)
- [ ] Estado de carga durante submit

**Escribe:** `companies.create({ name, businessEntityType, companyType, departmentCode, municipalityCode })`

**Validaciones backend:**
- Nombre minimo 2 caracteres
- Valores de enums validos
- Codes geograficos existen
- Usuario no tiene otra empresa

**Componentes:** [company-form.tsx](components/onboarding/company-form.tsx)

---

### US-03.3: Seleccionar ubicacion geografica
**Como** fundador
**Quiero** seleccionar la ubicacion de mi empresa
**Para** establecer el contexto geografico correcto

**Criterios de Aceptacion:**
- [ ] Dropdown de Departamento con todos los departamentos de Colombia
- [ ] Al seleccionar departamento, se carga municipios de ese departamento
- [ ] Dropdown de Municipio deshabilitado hasta seleccionar departamento
- [ ] Placeholder "Selecciona primero un departamento" cuando no hay seleccion
- [ ] Carga asincrona de municipios con estado loading
- [ ] Municipios ordenados alfabeticamente

**Consulta:**
- `geography.getDepartments()` → lista de departamentos
- `geography.getMunicipalities({ departmentCode })` → municipios filtrados

**Componentes:** [company-form.tsx](components/onboarding/company-form.tsx)

---

### US-03.4: Crear empresa exitosamente
**Como** fundador
**Quiero** que mi empresa se cree correctamente
**Para** continuar con el onboarding

**Criterios de Aceptacion:**
- [ ] Empresa creada en tabla `companies`
- [ ] Usuario actualizado con `company_id`
- [ ] Usuario asignado rol `COMPANY_OWNER`
- [ ] Plan de suscripcion: "trial" (30 dias)
- [ ] Limites iniciales: max_facilities = 1, max_users = 3
- [ ] Toast de exito "Empresa creada correctamente"
- [ ] Redirige automaticamente a `/facility-basic`

**Escribe:**
- `companies.create(...)` → crea empresa
- `users.update({ userId, companyId })` → vincula usuario
- `roles.assignRole({ userId, roleId: 'COMPANY_OWNER' })` → asigna rol

---

### US-03.5: Manejar errores de creacion
**Como** fundador
**Quiero** ver mensajes claros si hay problemas
**Para** poder corregir y reintentar

**Criterios de Aceptacion:**
- [ ] "Nombre de empresa muy corto" - menos de 2 caracteres
- [ ] "Selecciona un tipo de negocio valido"
- [ ] "Selecciona una industria valida"
- [ ] "Selecciona un departamento"
- [ ] "Selecciona un municipio"
- [ ] Error generico si falla el servidor
- [ ] Formulario no se limpia en caso de error

---

## Schema

### Tabla: `companies`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `name` | `string` | Nombre de la empresa |
| `business_entity_type` | `string` | Tipo legal (S.A.S, etc.) |
| `company_type` | `string` | Industria (cannabis, coffee, etc.) |
| `country` | `string` | Pais (default: "CO") |
| `department_code` | `string` | Codigo departamento |
| `municipality_code` | `string` | Codigo municipio |
| `subscription_plan` | `string` | Plan actual (trial/starter/pro/enterprise) |
| `subscription_tier` | `string` | Tier de facturacion |
| `max_facilities` | `number` | Limite de instalaciones |
| `max_users` | `number` | Limite de usuarios |
| `status` | `string` | active/suspended/inactive |
| `created_at` | `number` | Timestamp creacion |

---

## Tipos de Negocio (Business Entity Types)

| Valor | Label ES | Label EN |
|-------|----------|----------|
| `S.A.S` | S.A.S | Simplified Corporation |
| `S.A.` | S.A. | Corporation |
| `Ltda` | Ltda | Limited Liability |
| `E.U.` | E.U. | Sole Proprietorship |
| `Persona Natural` | Persona Natural | Individual |

---

## Tipos de Industria (Company Types)

| Valor | Label ES | Label EN |
|-------|----------|----------|
| `cannabis` | Cannabis | Cannabis |
| `coffee` | Cafe | Coffee |
| `cocoa` | Cacao | Cocoa |
| `flowers` | Flores | Flowers |
| `mixed` | Mixto | Mixed |

---

## Planes de Suscripcion (Iniciales)

| Plan | Facilities | Users | Duracion |
|------|------------|-------|----------|
| `trial` | 1 | 3 | 30 dias |
| `starter` | 5 | 10 | Mensual |
| `pro` | 20 | 50 | Mensual |
| `enterprise` | Ilimitado | Ilimitado | Anual |

---

## Integraciones

| Modulo | Relacion | Descripcion |
|--------|----------|-------------|
| M01-Registration | Previo | Usuario debe estar verificado |
| M02-Auth | Session | Valida sesion activa |
| M04-Facility | Siguiente | Redirige a crear primera facility |
| M17-Team | Hijo | Usuarios pertenecen a company |
| M07-Geography | Lookup | Consulta departamentos y municipios |

---

## API Backend

### Mutations
| Funcion | Parametros | Retorna |
|---------|------------|---------|
| `create` | `name, businessEntityType, companyType, departmentCode, municipalityCode` | `{ companyId }` |

### Queries
| Funcion | Parametros | Retorna |
|---------|------------|---------|
| `get` | `companyId` | Company completo |
| `getByUser` | `userId` | Company del usuario |

### Geography Queries
| Funcion | Parametros | Retorna |
|---------|------------|---------|
| `getDepartments` | - | `[{ code, name }]` |
| `getMunicipalities` | `departmentCode` | `[{ code, name }]` |

---

## Flujo de Pantallas

```
/verify-email (completado)
    |
    v
/company-setup
    |
    v
[Empresa creada]
    |
    v
/facility-basic (M04)
```

---

## Progreso de Onboarding

```
[ 1. Empresa ] --> [ 2. Instalacion ] --> [ Dashboard ]
     ^^^
   Paso actual
```
