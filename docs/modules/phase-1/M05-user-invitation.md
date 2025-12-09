# Module 05: User Invitation & Acceptance

## Overview

El modulo de Invitaciones permite a administradores invitar nuevos usuarios a unirse a su empresa. Los usuarios invitados reciben un email con un link unico, y al aceptar, configuran su contrasena y se unen automaticamente a la empresa y sus instalaciones asignadas. Este flujo es alternativo al registro normal (M01-M04).

**Estado**: Parcialmente Implementado

---

## User Stories

### US-05.1: Crear invitacion (Admin)
**Como** administrador de empresa
**Quiero** invitar a un nuevo miembro al equipo
**Para** que se una a nuestra organizacion

**Criterios de Aceptacion:**
- [ ] Boton "Invitar Usuario" en pagina de Team (M17)
- [ ] Modal con formulario de invitacion:
  - Email* (formato valido, no existente en sistema)
  - Nombre (opcional, se puede completar al aceptar)
  - Apellido (opcional)
  - Rol* (select de roles disponibles para la empresa)
  - Instalaciones* (multi-select de facilities accesibles)
- [ ] Validacion: email no existe en sistema
- [ ] Genera token unico de invitacion
- [ ] Token expira en 72 horas
- [ ] Envia email con link de invitacion
- [ ] Toast de confirmacion "Invitacion enviada a [email]"

**Escribe:** `invitations.create({ email, firstName?, lastName?, roleId, facilityIds, invitedBy })`

**Componentes:** Ver M17-Team Management

---

### US-05.2: Ver landing de invitacion
**Como** usuario invitado
**Quiero** ver los detalles de la invitacion
**Para** decidir si la acepto

**Criterios de Aceptacion:**
- [ ] Pagina accesible en `/accept-invitation?token=XXX`
- [ ] Valida token al cargar la pagina
- [ ] Si token invalido/expirado → redirige a `/invitation-invalid`
- [ ] Muestra informacion de la invitacion:
  - Logo de Alquemist
  - "Has sido invitado(a) a:"
  - Nombre de la empresa
  - Rol asignado
  - Nombre del invitador
  - Cantidad de instalaciones
- [ ] Email del usuario invitado (read-only)
- [ ] Botones "Aceptar Invitacion" y "Rechazar"

**Consulta:** `invitations.validate({ token })`

**Componentes:** [accept-invitation/page.tsx](app/(auth)/accept-invitation/page.tsx)

---

### US-05.3: Rechazar invitacion
**Como** usuario invitado
**Quiero** rechazar una invitacion
**Para** declinar unirme a la empresa

**Criterios de Aceptacion:**
- [ ] Boton "Rechazar" abre dialogo de confirmacion
- [ ] Mensaje "Esta seguro que desea rechazar esta invitacion?"
- [ ] Al confirmar, marca invitacion como rejected
- [ ] Toast "Invitacion rechazada"
- [ ] Redirige a `/login`
- [ ] Invitador recibe notificacion (opcional, futuro)

**Escribe:** `invitations.reject({ token })`

---

### US-05.4: Configurar contrasena
**Como** usuario invitado que acepto
**Quiero** crear mi contrasena
**Para** activar mi cuenta

**Criterios de Aceptacion:**
- [ ] Formulario mostrado al hacer clic en "Aceptar Invitacion"
- [ ] **Campos del formulario:**
  - Contrasena* (mismos requisitos que registro)
  - Confirmar Contrasena*
  - Telefono (opcional)
  - Idioma Preferido (Espanol/English)
- [ ] Indicador de fortaleza de contrasena
- [ ] Lista de requisitos de contrasena
- [ ] Botones "Volver" y "Crear Cuenta"

**Componentes:** [accept-invitation/page.tsx](app/(auth)/accept-invitation/page.tsx), [invitation-password-form.tsx](components/auth/invitation-password-form.tsx)

---

### US-05.5: Aceptar invitacion y crear cuenta
**Como** usuario invitado
**Quiero** completar el proceso de aceptacion
**Para** tener acceso a la plataforma

**Criterios de Aceptacion:**
- [ ] Crea usuario en tabla `users`
- [ ] Usuario automaticamente verificado (email_verified = true)
- [ ] Vincula a company_id de la invitacion
- [ ] Asigna rol especificado
- [ ] Vincula a facilities especificadas via `facility_users`
- [ ] Marca invitacion como accepted
- [ ] Genera session token automaticamente (auto-login)
- [ ] Redirige a `/welcome-invited`

**Escribe:** `invitations.accept({ token, password, phone?, language? })`

---

### US-05.6: Ver bienvenida de usuario invitado
**Como** usuario recien unido
**Quiero** ver confirmacion de mi incorporacion
**Para** saber que tengo acceso

**Criterios de Aceptacion:**
- [ ] Pagina `/welcome-invited`
- [ ] Icono de check verde
- [ ] Titulo "Bienvenido(a)!"
- [ ] "Cuenta Creada!" con check
- [ ] Muestra empresa a la que se unio
- [ ] Muestra rol asignado
- [ ] Lista de instalaciones con acceso
- [ ] Mensaje "Puedes empezar a trabajar inmediatamente"
- [ ] Boton "Ir al Panel de Control"
- [ ] Redirige a `/dashboard`

**Componentes:** [welcome-invited/page.tsx](app/(auth)/welcome-invited/page.tsx)

---

### US-05.7: Ver pagina de invitacion invalida
**Como** usuario con link invalido
**Quiero** ver un mensaje claro del problema
**Para** saber que hacer

**Criterios de Aceptacion:**
- [ ] Pagina `/invitation-invalid`
- [ ] Icono de advertencia
- [ ] Titulo "Invitacion No Valida"
- [ ] Mensaje descriptivo
- [ ] Lista de posibles razones:
  - El enlace ya fue usado
  - Han pasado mas de 72 horas
  - La invitacion fue revocada
- [ ] Instruccion de contactar al administrador
- [ ] Boton "Ir a Inicio de Sesion"

**Componentes:** [invitation-invalid/page.tsx](app/(auth)/invitation-invalid/page.tsx)

---

### US-05.8: Reenviar invitacion (Admin)
**Como** administrador
**Quiero** reenviar una invitacion pendiente
**Para** recordar al usuario

**Criterios de Aceptacion:**
- [ ] Boton "Reenviar" en lista de invitaciones pendientes
- [ ] Genera nuevo token (invalida el anterior)
- [ ] Nuevo expiry de 72 horas
- [ ] Envia nuevo email
- [ ] Toast de confirmacion

**Escribe:** `invitations.resend({ invitationId })`

---

### US-05.9: Revocar invitacion (Admin)
**Como** administrador
**Quiero** cancelar una invitacion pendiente
**Para** prevenir acceso no deseado

**Criterios de Aceptacion:**
- [ ] Boton "Revocar" en lista de invitaciones
- [ ] Dialogo de confirmacion
- [ ] Marca invitacion como revoked
- [ ] Token ya no es valido
- [ ] Toast de confirmacion

**Escribe:** `invitations.revoke({ invitationId })`

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

### Mutations
| Funcion | Parametros | Retorna |
|---------|------------|---------|
| `create` | `email, firstName?, lastName?, roleId, facilityIds, invitedBy` | `{ invitationId, token }` |
| `accept` | `token, password, phone?, language?` | `{ userId, sessionToken }` |
| `reject` | `token` | `{ success }` |
| `resend` | `invitationId` | `{ newToken }` |
| `revoke` | `invitationId` | `{ success }` |

### Queries
| Funcion | Parametros | Retorna |
|---------|------------|---------|
| `validate` | `token` | `{ valid, invitation?, reason? }` |
| `listByCompany` | `companyId, status?` | Lista de invitaciones |
| `getByToken` | `token` | Invitacion con detalles |

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
