# Tab Invitaciones Pendientes — Lista de Invitaciones

## Vista General

Cards de invitaciones pendientes con acciones de reenviar y cancelar.

## Estado Vacio

Icono Mail + "No hay invitaciones pendientes" + "Todas las invitaciones han sido aceptadas o han expirado."

## Invitation Cards

Cada card muestra:

| Zona | Contenido |
|------|-----------|
| Izquierda | Icono mail dorado + email (bold) + rol + "Invitado por: {nombre}" + badges de instalaciones + timestamps |
| Derecha | Botones de accion |

### Timestamps

- "Enviada: {tiempo relativo}" (ej: "hace 1 dia")
- Timer de expiracion con icono reloj:
  - Expirada → texto rojo "Expirada"
  - < 24h → texto naranja "Expira en {N}h"
  - Normal → "Expira en {N}h"

### Botones de Accion

| Boton | Icono | Condicion | Accion |
|-------|-------|-----------|--------|
| Reenviar | RefreshCw | Solo si no expirada | Mutation `invitations.resend` + loading "Enviando..." |
| Cancelar | X (rojo) | Siempre | Abre dialog de confirmacion |

### Dialog Cancelar Invitacion

- Titulo: "Cancelar invitacion?"
- Mensaje: "Estas seguro de que deseas cancelar la invitacion para {email}? Esta accion no se puede deshacer."
- Botones: "No, mantener" / "Si, cancelar" (rojo)
- Mutation: `invitations.cancel`

## Data Source

| Query | Datos |
|-------|-------|
| `users.getPendingInvitations({ companyId })` | Invitaciones activas con email, roleName, facilityNames, inviterName, status, expiresAt |

## Componentes

| Componente | Archivo |
|-----------|---------|
| InvitationsTab | Inline en `app/(dashboard)/users/page.tsx` |
