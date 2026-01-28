# Module 05: User Invitation & Acceptance

## Overview

El modulo de Invitaciones permite a administradores invitar nuevos usuarios a unirse a su empresa. Los usuarios invitados reciben un email con un link unico, y al aceptar, configuran su contrasena y se unen automaticamente a la empresa y sus instalaciones asignadas. Este flujo es alternativo al registro normal (M01-M04).

**Estado**: Implementado (Convex Auth session pendiente)

---

## User Stories

### US-05.1: Crear invitacion (Admin)
**Como** administrador de empresa
**Quiero** invitar a un nuevo miembro al equipo
**Para** que se una a nuestra organizacion

**Criterios de Aceptacion:**
- [x] Boton "Invitar Usuario" en pagina de Team (M17)
- [x] Modal con formulario de invitacion:
  - Email* (formato valido, no existente en sistema)
  - Nombre (opcional — campo en schema, no en UI aun)
  - Apellido (opcional — campo en schema, no en UI aun)
  - Rol* (RoleSelector component)
  - Instalaciones* (FacilityAccessSelect multi-select)
  - Mensaje personalizado (opcional)
- [x] Validacion: email no existe en sistema + no pending invitation
- [x] Genera token unico de invitacion (UUID)
- [x] Token expira en 72 horas
- [x] Envia email con link de invitacion via Resend
- [x] Toast de confirmacion "Invitación enviada a [email]"

**Escribe:** `invitations.create({ email, roleId, facilityIds })` (action, auth-based)

**Componentes:** [invite-user-modal.tsx](components/users/invite-user-modal.tsx), [role-selector.tsx](components/users/role-selector.tsx), [facility-access-select.tsx](components/users/facility-access-select.tsx)

---

### US-05.2: Ver landing de invitacion
**Como** usuario invitado
**Quiero** ver los detalles de la invitacion
**Para** decidir si la acepto

**Criterios de Aceptacion:**
- [x] Pagina accesible en `/accept-invitation?token=XXX`
- [x] Valida token al cargar la pagina
- [x] Si token invalido/expirado → redirige a `/invitation-invalid`
- [x] Muestra informacion de la invitacion:
  - CheckCircle2 icon verde
  - "Has sido invitado a unirte a una empresa en Alquemist"
  - Nombre de la empresa
  - Rol asignado
  - Nombre del invitador
  - Lista de instalaciones asignadas
  - Countdown timer de expiracion
- [x] Email del usuario invitado (read-only)
- [x] Botones "Aceptar Invitacion" (amber-500) y "Rechazar"

**Consulta:** `invitations.validate({ token })`

**Componentes:** [accept-invitation/page.tsx](app/(auth)/accept-invitation/page.tsx)

---

### US-05.3: Rechazar invitacion
**Como** usuario invitado
**Quiero** rechazar una invitacion
**Para** declinar unirme a la empresa

**Criterios de Aceptacion:**
- [x] Boton "Rechazar" abre dialogo de confirmacion
- [x] Mensaje "Estas seguro que deseas rechazar esta invitacion?"
- [x] Al confirmar, marca invitacion como rejected
- [x] Toast "Invitación rechazada"
- [x] Redirige a `/login`
- [ ] Invitador recibe notificacion (opcional, futuro)

**Escribe:** `invitations.reject({ token })`

---

### US-05.4: Configurar contrasena
**Como** usuario invitado que acepto
**Quiero** crear mi contrasena
**Para** activar mi cuenta

**Criterios de Aceptacion:**
- [x] Formulario en pagina `/set-password` al hacer clic en "Aceptar Invitacion"
- [x] **Campos del formulario:**
  - Contrasena* (mismos requisitos que registro)
  - Confirmar Contrasena*
  - Telefono (opcional, PhoneInput)
  - Idioma Preferido (radio: Espanol/English)
- [x] PasswordRequirements component con indicador de fortaleza
- [x] Lista de requisitos de contrasena
- [x] Botones "Volver" y "Crear Cuenta" (amber-500)

**Componentes:** [set-password/page.tsx](app/(auth)/set-password/page.tsx), [set-password/actions.ts](app/(auth)/set-password/actions.ts)

---

### US-05.5: Aceptar invitacion y crear cuenta
**Como** usuario invitado
**Quiero** completar el proceso de aceptacion
**Para** tener acceso a la plataforma

**Criterios de Aceptacion:**
- [x] Crea usuario en tabla `users`
- [x] Usuario automaticamente verificado (email_verified = true)
- [x] Vincula a company_id de la invitacion
- [x] Asigna rol especificado
- [x] Vincula a facilities especificadas via `facility_users`
- [x] Marca invitacion como accepted
- [ ] Genera session token via Convex Auth (pendiente — actualmente placeholder)
- [x] Redirige a `/welcome-invited`

**Escribe:** `invitations.accept({ token, password, phone?, language? })`

---

### US-05.6: Ver bienvenida de usuario invitado
**Como** usuario recien unido
**Quiero** ver confirmacion de mi incorporacion
**Para** saber que tengo acceso

**Criterios de Aceptacion:**
- [x] Pagina `/welcome-invited`
- [x] Icono de check verde grande
- [x] Titulo "¡Bienvenido a Alquemist!"
- [x] "Tu cuenta ha sido creada exitosamente"
- [x] Muestra empresa a la que se unio
- [x] Muestra rol asignado
- [x] Lista de instalaciones con acceso
- [x] Proximos pasos (explorar panel, familiarizarse, revisar permisos, contactar admin)
- [x] Boton "Ir al Panel de Control" (amber-500)
- [x] Redirige a `/dashboard`

**Componentes:** [welcome-invited/page.tsx](app/(auth)/welcome-invited/page.tsx)

---

### US-05.7: Ver pagina de invitacion invalida
**Como** usuario con link invalido
**Quiero** ver un mensaje claro del problema
**Para** saber que hacer

**Criterios de Aceptacion:**
- [x] Pagina `/invitation-invalid`
- [x] Icono de advertencia (AlertTriangle amber)
- [x] Titulo "Invitación No Válida"
- [x] Mensaje descriptivo
- [x] Lista de posibles razones:
  - El enlace ha expirado (72 horas)
  - La invitacion ya fue utilizada
  - El enlace es incorrecto o modificado
  - La invitacion fue rechazada o cancelada
- [x] Instruccion de contactar al administrador + link soporte
- [x] Boton "Ir a Iniciar Sesión"

**Componentes:** [invitation-invalid/page.tsx](app/(auth)/invitation-invalid/page.tsx)

---

### US-05.8: Reenviar invitacion (Admin)
**Como** administrador
**Quiero** reenviar una invitacion pendiente
**Para** recordar al usuario

**Criterios de Aceptacion:**
- [x] Boton "Reenviar" en InvitationCard
- [x] Genera nuevo token (invalida el anterior)
- [x] Nuevo expiry de 72 horas
- [x] Envia nuevo email via Resend
- [x] Toast de confirmacion

**Escribe:** `invitations.resend({ invitationId })`

---

### US-05.9: Revocar invitacion (Admin)
**Como** administrador
**Quiero** cancelar una invitacion pendiente
**Para** prevenir acceso no deseado

**Criterios de Aceptacion:**
- [x] Boton "Cancelar" en InvitationCard (nombrado `cancel` en implementacion)
- [x] Dialogo de confirmacion (AlertDialog)
- [x] Marca invitacion como revoked
- [x] Token ya no es valido (validate query checks revoked status)
- [x] Toast de confirmacion

**Escribe:** `invitations.cancel({ invitationId })` (mutation, auth-based)

---

## Schema

### Tabla: `invitations`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `email` | `string` | Email del invitado |
| `first_name` | `string?` | Nombre (opcional) |
| `last_name` | `string?` | Apellido (opcional) |
| `company_id` | `id("companies")` | Empresa destino |
| `role_id` | `id("roles")` | Rol asignado |
| `facility_ids` | `array<id>` | Instalaciones con acceso |
| `invited_by` | `id("users")` | Usuario que invito |
| `token` | `string` | Token unico de invitacion |
| `status` | `string` | pending/accepted/rejected/revoked/expired |
| `expires_at` | `number` | Timestamp de expiracion (72h) |
| `accepted_at` | `number?` | Timestamp de aceptacion |
| `created_at` | `number` | Timestamp de creacion |

---

## Estados de Invitacion

| Estado | Descripcion |
|--------|-------------|
| `pending` | Enviada, esperando respuesta |
| `accepted` | Usuario acepto y creo cuenta |
| `rejected` | Usuario rechazo la invitacion |
| `revoked` | Admin cancelo la invitacion |
| `expired` | Pasaron 72 horas sin respuesta |

---

## Diferencias: Usuario Nuevo vs Invitado

| Aspecto | Usuario Nuevo (M01-M04) | Usuario Invitado (M05) |
|---------|-------------------------|------------------------|
| Entry | Signup publico | Email con link |
| Email Verification | Requerida | Automatica (link = verificacion) |
| Crear Empresa | Si | No (se une a existente) |
| Crear Facility | Si | No (acceso a existentes) |
| Asignar Rol | Auto: COMPANY_OWNER | Pre-asignado por admin |
| Paginas | 7 | 4 |
| Destino | Dashboard | Dashboard |

---

## Email de Invitacion

**Asunto:** "Has sido invitado a [Nombre Empresa] en Alquemist"

**Contenido:**
- Logo de Alquemist
- Mensaje de invitacion personalizado
- Nombre del invitador
- Nombre de la empresa
- Rol asignado
- Boton "Aceptar Invitacion" con link
- Nota de expiracion (72 horas)
- Link de texto alternativo

---

## Integraciones

| Modulo | Relacion | Descripcion |
|--------|----------|-------------|
| M17-Team | Origen | Invitaciones se crean desde Team Management |
| M02-Auth | Destino | Usuario invitado puede hacer login |
| M18-Facility | Referencia | Usuario asignado a facilities |
| Email Service | Externo | Envio de emails de invitacion |

---

## API Backend

### Actions (side effects — email)
| Funcion | Parametros | Retorna |
|---------|------------|---------|
| `create` | `email, roleId, facilityIds` | `{ invitationId, token }` — auth-based, sends email via Resend |
| `accept` | `token, password, phone?, language?` | `{ userId, sessionToken }` — creates user + facility_users |
| `resend` | `invitationId` | `{ newToken }` — auth-based, regenerates token + sends email |

### Mutations
| Funcion | Parametros | Retorna |
|---------|------------|---------|
| `reject` | `token` | `{ success }` |
| `cancel` | `invitationId` | `void` — auth-based, sets status to revoked |

### Internal Mutations (not publicly exposed)
| Funcion | Descripcion |
|---------|-------------|
| `_createInvitationRecord` | Insert invitation row (called by create action) |
| `_resendInvitationRecord` | Update token + expiry (called by resend action) |
| `getInvitationByToken` | Fetch invitation by token |
| `createUserFromInvitation` | Create user + facility_users records |
| `markInvitationAccepted` | Set status=accepted |

### Queries
| Funcion | Parametros | Retorna |
|---------|------------|---------|
| `validate` | `token` | `{ valid, invitation?, reason? }` — checks expired/revoked |
| `getByCompany` | `companyId` | All invitations — auth-based |
| `getPendingByCompany` | `companyId` | Pending invitations — auth-based |

---

## Flujo de Usuario Invitado

```
[Email recibido]
    |
    v
/accept-invitation?token=XXX
    |
    +-- [Token invalido] --> /invitation-invalid
    |
    v
[Ver detalles de invitacion]
    |
    +-- [Rechazar] --> /login
    |
    +-- [Aceptar] --> [Formulario de contrasena]
                           |
                           v
                      [Crear cuenta]
                           |
                           v
                      /welcome-invited
                           |
                           v
                       /dashboard
```
