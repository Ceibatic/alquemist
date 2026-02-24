# Tab Usuarios Activos — Lista de Usuarios

## Vista General

Tabla de usuarios de la compania con filtros por rol y busqueda por nombre/email.

## Filtros

| Zona | Contenido |
|------|-----------|
| Izquierda | Dropdown de roles (Todos, Propietario, Gerente, Supervisor, Trabajador, Observador) |
| Centro | Input de busqueda "Buscar por nombre o email..." (max-width: 24rem) |
| Derecha | — |

Busqueda: case-insensitive sobre nombre completo (firstName + lastName) y email.

## User Row

Cada fila muestra:

| Zona | Contenido |
|------|-----------|
| Izquierda | Avatar (iniciales, fondo green-900) + nombre + rol badge + email |
| Centro | Status (dot verde "Activo" / dot gris "Inactivo") + ultimo login (tiempo relativo en espanol) |
| Derecha | Menu dropdown con acciones |

### Role Badges

| Rol | Color |
|-----|-------|
| Propietario | purple |
| Administrador | blue |
| Gerente | green |
| Otros | gray |

### Menu Dropdown

- **Si es Owner:** Una opcion deshabilitada "El propietario no puede ser editado"
- **Si no es Owner:**
  - "Editar Rol" (icono Edit2) → abre `EditUserRoleModal`
  - "Desactivar" (icono UserX, texto rojo) → abre dialog de confirmacion

### Dialog Desactivar

- Titulo: "Desactivar usuario?"
- Mensaje: Advierte perdida de acceso inmediato y sesiones invalidadas
- Botones: "Cancelar" / "Desactivar" (rojo)
- Mutation: `users.deactivateUser`

### Click en Fila

Click en la fila → navega a `/users/{id}`. Clicks en botones/menu no disparan navegacion.

## Paginacion

20 usuarios por pagina.

## Data Source

| Query | Datos |
|-------|-------|
| `users.listByCompany({ companyId })` | Lista de usuarios con id, email, nombre, roleId, roleName, status, lastLogin |

## Componentes

| Componente | Archivo |
|-----------|---------|
| UserRow | `components/users/user-row.tsx` |
