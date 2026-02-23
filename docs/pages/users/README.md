# Usuarios — Vista General

## URL

`/users` — pagina de listado con 2 tabs.

## Estructura

Pagina con stats compactos, 2 tabs (usuarios activos e invitaciones pendientes), y subpagina de perfil de usuario.

## Deep Linking

No aplica — los tabs no se reflejan en URL.

## Sidebar

Una sola entrada "Usuarios" apunta a `/users`.

## Tabs

| Tab | Contenido |
|-----|-----------|
| Usuarios Activos | Tabla de usuarios con filtros por rol y busqueda. Badge con conteo total |
| Invitaciones Pendientes | Cards de invitaciones con acciones reenviar/cancelar. Badge amber con conteo |

Ver [tab-usuarios.md](./tab-usuarios.md) para detalle del tab de usuarios activos.
Ver [tab-invitaciones.md](./tab-invitaciones.md) para detalle del tab de invitaciones.

## Subpaginas

| Ruta | Proposito |
|------|-----------|
| `/users/[id]` | Perfil de usuario con 3 cards informativas (personal, rol, actividad) |

Ver [subpaginas.md](./subpaginas.md) para detalle de la subpagina.

## Stats

4 cards en header:

| Stat | Data Source |
|------|-------------|
| Total | Total de usuarios en la compania |
| Activos | Usuarios con status = 'active' |
| Invitaciones | Invitaciones pendientes |
| Limite del Plan | Usuarios actuales / max_users del plan |

## Modales

| Modal | Trigger | Archivo |
|-------|---------|---------|
| Invitar Usuario | Boton "Invitar Usuario" (amber) en header | `invite-user-modal.tsx` |
| Editar Rol | Menu dropdown en user row o boton en perfil | `edit-user-role-modal.tsx` |

Ver [modal-invitar.md](./modal-invitar.md) para detalle del modal de invitacion.
Ver [modal-editar-rol.md](./modal-editar-rol.md) para detalle del modal de edicion de rol.

## Archivos Clave

| Archivo | Rol |
|---------|-----|
| `app/(dashboard)/users/page.tsx` | Pagina principal con tabs |
| `app/(dashboard)/users/[id]/page.tsx` | Perfil de usuario |
| `components/users/user-row.tsx` | Fila de usuario con avatar, rol, status, menu |
| `components/users/invite-user-modal.tsx` | Modal de invitacion con form completo |
| `components/users/edit-user-role-modal.tsx` | Modal de edicion de rol y acceso |
| `components/users/role-selector.tsx` | Dropdown de roles con descripcion |
| `components/users/facility-access-select.tsx` | Multi-select de instalaciones |
| `convex/users.ts` | Backend: queries y mutations de usuarios |
| `convex/invitations.ts` | Backend: crear, reenviar, cancelar invitaciones |
| `convex/roles.ts` | Backend: listar roles, roles asignables |
