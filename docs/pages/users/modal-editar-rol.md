# Modal Editar Rol de Usuario

## Vista General

Dialog para actualizar el rol y acceso a instalaciones de un usuario existente.

## Header

- Icono: UserCog (green-900)
- Titulo: "Editar Rol de Usuario"
- Descripcion: "Actualiza el rol y acceso a instalaciones de {userName}"

## Contenido

### Info del Usuario

Caja gris con nombre (bold) y email del usuario. Solo lectura.

### Campos del Form

| Campo | Tipo | Requerido | Detalle |
|-------|------|-----------|---------|
| Rol | RoleSelector dropdown | Si | Mismos roles que modal de invitacion. Descripcion en caja azul |
| Acceso a Instalaciones | FacilityAccessSelect | Si | Mismo componente que modal de invitacion |

## Acciones

| Boton | Estilo | Estado loading |
|-------|--------|----------------|
| Cancelar | outline | — |
| Guardar Cambios | green-900 | "Guardando..." con spinner |

## Validaciones

- Rol debe estar seleccionado
- Al menos una instalacion seleccionada
- No se puede remover el ultimo owner de la compania

## Resultado

- **Exito:** Toast "Rol actualizado" / "Se ha actualizado el rol de {name} exitosamente." Cierra modal
- **Error:** Toast destructivo con mensaje

## Data Source

| Mutation | Datos |
|----------|-------|
| `users.updateUserRole({ userId, roleId?, facilityAccess? })` | Actualiza rol y/o acceso |

## Componentes

| Componente | Archivo |
|-----------|---------|
| EditUserRoleModal | `components/users/edit-user-role-modal.tsx` |
| RoleSelector | `components/users/role-selector.tsx` |
| FacilityAccessSelect | `components/users/facility-access-select.tsx` |
