# Module 17: Team Management

## Overview

El modulo de Team Management permite gestionar los usuarios de la empresa: ver miembros activos, invitar nuevos usuarios por email, asignar roles y acceso a instalaciones, y gestionar invitaciones pendientes. Incluye control de limites segun plan de suscripcion.

**Estado**: Implementado

---

## User Stories

### US-17.1: Ver lista de miembros del equipo
**Como** administrador de empresa
**Quiero** ver todos los usuarios de mi empresa
**Para** gestionar el equipo y sus accesos

**Criterios de Aceptacion:**
- [ ] Tabla/lista con todos los usuarios activos de la empresa
- [ ] Columnas: Nombre, Email, Rol, Estado, Ultimo acceso
- [ ] Badge de estado: active (verde), inactive (rojo), suspended (amarillo)
- [ ] Filas clickeables para ver detalle
- [ ] Menu kebab con: Ver perfil, Editar rol, Desactivar
- [ ] Contador de usuarios vs limite del plan
- [ ] Estado vacio si solo hay 1 usuario (el owner)

**Consulta:** `users.listByCompany({ companyId })`

**Componentes:** [users/page.tsx](app/(dashboard)/users/page.tsx), [user-list.tsx](components/users/user-list.tsx)

---

### US-17.2: Ver invitaciones pendientes
**Como** administrador de empresa
**Quiero** ver las invitaciones enviadas que no han sido aceptadas
**Para** hacer seguimiento y reenviar si es necesario

**Criterios de Aceptacion:**
- [ ] Seccion separada o tab "Pendientes"
- [ ] Lista con: Email, Rol asignado, Instalaciones, Invitado por, Fecha, Expira en
- [ ] Estado: pending (amarillo), expired (gris)
- [ ] Acciones: Reenviar, Cancelar
- [ ] Filtrar invitaciones expiradas automaticamente
- [ ] Mostrar tiempo restante antes de expiracion

**Consulta:** `users.getPendingInvitations({ companyId })`

**Componentes:** [user-list.tsx](components/users/user-list.tsx)

---

### US-17.3: Invitar nuevo usuario
**Como** administrador de empresa
**Quiero** invitar a un nuevo miembro por email
**Para** darle acceso al sistema

**Criterios de Aceptacion:**
- [ ] Boton "Invitar Usuario" abre modal
- [ ] Validar limite de usuarios segun plan antes de permitir
- [ ] **Campos del formulario:**
  - Email* (validacion formato, unico en empresa)
  - Rol* (select de roles disponibles)
  - Instalaciones* (multi-select de facilities)
- [ ] Al enviar:
  - Crea registro en `invitations` con token unico
  - Envia email con link de invitacion
  - Token expira en 72 horas
- [ ] Toast de exito con email enviado
- [ ] Error si email ya existe en empresa

**Escribe:** `invitations.create({ companyId, email, roleId, facilityIds, invitedBy })`

**Integracion:** Envia email via Resend con link `/accept-invitation?token=[token]`

**Componentes:** [invite-user-modal.tsx](components/users/invite-user-modal.tsx)

---

### US-17.4: Reenviar invitacion
**Como** administrador de empresa
**Quiero** reenviar una invitacion pendiente
**Para** recordarle al usuario que acepte

**Criterios de Aceptacion:**
- [ ] Boton "Reenviar" en invitacion pendiente
- [ ] Genera nuevo token y actualiza expiracion
- [ ] Envia nuevo email
- [ ] Toast de confirmacion
- [ ] No permite reenviar si ya fue aceptada/rechazada

**Escribe:** `invitations.resend({ invitationId, companyId })`

---

### US-17.5: Cancelar invitacion
**Como** administrador de empresa
**Quiero** cancelar una invitacion pendiente
**Para** revocar el acceso antes de que se acepte

**Criterios de Aceptacion:**
- [ ] Boton "Cancelar" en invitacion pendiente
- [ ] Confirmacion antes de cancelar
- [ ] Cambia status a "cancelled" o elimina
- [ ] Token ya no es valido
- [ ] Toast de confirmacion

**Escribe:** `invitations.cancel({ invitationId, companyId })`

---

### US-17.6: Editar rol de usuario
**Como** administrador de empresa
**Quiero** cambiar el rol de un usuario existente
**Para** ajustar sus permisos

**Criterios de Aceptacion:**
- [ ] Modal o pagina de edicion
- [ ] Select de rol (excluye COMPANY_OWNER si ya hay uno)
- [ ] Multi-select de instalaciones accesibles
- [ ] No puede remover el ultimo COMPANY_OWNER
- [ ] Toast de exito al guardar

**Escribe:** `users.updateUserRole({ userId, roleId?, facilityAccess? })`

**Validaciones backend:**
- No permite dejar empresa sin owner

**Componentes:** [edit-user-role-modal.tsx](components/users/edit-user-role-modal.tsx)

---

### US-17.7: Desactivar usuario
**Como** administrador de empresa
**Quiero** desactivar un usuario que ya no trabaja con nosotros
**Para** revocar su acceso sin perder historial

**Criterios de Aceptacion:**
- [ ] Confirmacion antes de desactivar
- [ ] No puede desactivar el ultimo owner activo
- [ ] Cambia status a "inactive"
- [ ] Invalida todas las sesiones activas del usuario
- [ ] Usuario no puede hacer login
- [ ] Toast de confirmacion

**Escribe:** `users.deactivateUser({ userId })`

**Validaciones backend:**
- Cuenta owners activos antes de permitir
- Revoca sesiones automaticamente

---

### US-17.8: Ver perfil de usuario
**Como** administrador de empresa
**Quiero** ver el perfil completo de un miembro
**Para** conocer sus datos y accesos

**Criterios de Aceptacion:**
- [ ] Pagina `/users/[id]` con informacion completa
- [ ] **Card Informacion Personal:**
  - Nombre completo, email, telefono
  - Tipo y numero de identificacion
- [ ] **Card Rol y Accesos:**
  - Rol actual con badge
  - Lista de instalaciones accesibles
- [ ] **Card Actividad:**
  - Ultimo login
  - Fecha de creacion
  - Estado de verificacion email
- [ ] Boton Editar (si tiene permisos)

**Consulta:** `users.getUserById({ userId })`

**Componentes:** [users/[id]/page.tsx](app/(dashboard)/users/[id]/page.tsx)

---

## Schema

### Tabla: `users` (campos relevantes para team)

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `company_id` | `id("companies")?` | Empresa del usuario |
| `email` | `string` | Email unico |
| `first_name` | `string?` | Nombre |
| `last_name` | `string?` | Apellido |
| `role_id` | `id("roles")` | Rol asignado |
| `primary_facility_id` | `id("facilities")?` | Instalacion principal |
| `accessible_facility_ids` | `array<id>` | Instalaciones accesibles |
| `status` | `string` | active/inactive/suspended |
| `last_login` | `number?` | Timestamp ultimo login |

### Tabla: `invitations`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `company_id` | `id("companies")` | Empresa |
| `email` | `string` | Email invitado |
| `role_id` | `id("roles")` | Rol a asignar |
| `facility_ids` | `array<id>` | Instalaciones a dar acceso |
| `token` | `string` | Token unico (UUID) |
| `expires_at` | `number` | Expiracion (72h desde creacion) |
| `invited_by` | `id("users")` | Usuario que invito |
| `status` | `string` | pending/accepted/rejected/expired |
| `created_at` | `number` | Timestamp creacion |
| `accepted_at` | `number?` | Timestamp aceptacion |

---

## Roles del Sistema

| Nombre | Nivel | Scope | Descripcion |
|--------|-------|-------|-------------|
| `COMPANY_OWNER` | 1000 | company | Propietario, acceso total |
| `FACILITY_MANAGER` | 500 | facility | Gerente de instalacion |
| `PRODUCTION_SUPERVISOR` | 300 | facility | Supervisor de produccion |
| `PRODUCTION_OPERATOR` | 100 | area | Operador de cultivo |
| `QUALITY_INSPECTOR` | 200 | facility | Inspector de calidad |
| `INVENTORY_MANAGER` | 250 | facility | Gestor de inventario |

---

## Estados de Usuario

| Estado | Color | Descripcion |
|--------|-------|-------------|
| `active` | Verde | Usuario activo, puede acceder |
| `inactive` | Rojo | Desactivado, sin acceso |
| `suspended` | Amarillo | Suspendido temporalmente |

---

## Estados de Invitacion

| Estado | Descripcion |
|--------|-------------|
| `pending` | Enviada, esperando aceptacion |
| `accepted` | Usuario acepto y creo cuenta |
| `rejected` | Usuario rechazo |
| `expired` | Token expiro (72h) |
| `cancelled` | Admin cancelo |

---

## Integraciones

| Modulo | Relacion | Descripcion |
|--------|----------|-------------|
| M01-Registration | Flujo | Usuario acepta invitacion → registro |
| M05-Roles | Lookup | Roles disponibles para asignar |
| M04-Facility | Referencia | Instalaciones para dar acceso |
| Email (Resend) | Notificacion | Envio de invitaciones |

---

## API Backend

### Queries
| Funcion | Parametros | Retorna |
|---------|------------|---------|
| `listByCompany` | `companyId` | User[] con rol |
| `getPendingInvitations` | `companyId` | Invitation[] activas |
| `getUserById` | `userId` | User con detalles |
| `getUsersByCompany` | `companyId` | User[] (legacy) |

### Mutations (users.ts)
| Funcion | Parametros | Validaciones |
|---------|------------|--------------|
| `updateUserRole` | `userId, roleId?, facilityAccess?` | no quitar ultimo owner |
| `deactivateUser` | `userId` | no desactivar ultimo owner |

### Mutations (invitations.ts)
| Funcion | Parametros | Validaciones |
|---------|------------|--------------|
| `create` | `companyId, email, roleId, facilityIds, invitedBy` | limite plan, email unico |
| `resend` | `invitationId, companyId` | status pending |
| `cancel` | `invitationId, companyId` | status pending |
| `accept` | `token, userData` | token valido, no expirado |
