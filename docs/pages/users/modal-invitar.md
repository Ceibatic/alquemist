# Modal Invitar Usuario

## Vista General

Dialog para enviar invitacion por email a un nuevo miembro del equipo.

## Header

- Icono: Mail (dorado)
- Titulo: "Invitar Usuario"
- Descripcion: "Envia una invitacion por correo electronico para agregar un nuevo miembro al equipo"

## Campos del Form

| Campo | Tipo | Requerido | Detalle |
|-------|------|-----------|---------|
| Email | email input | Si | Placeholder "usuario@ejemplo.com". Validacion Zod |
| Rol | RoleSelector dropdown | Si | Muestra descripcion en caja azul al seleccionar |
| Acceso a Instalaciones | FacilityAccessSelect | Si | Checkbox "seleccionar todas" + checkboxes individuales. Contador "{N} de {total}" |
| Mensaje Personalizado | textarea (3 rows) | No | Placeholder "Ej: Bienvenido al equipo!..." Incluido en email |

## Roles Disponibles

| Rol | Nivel | Descripcion |
|-----|-------|-------------|
| Propietario | 1000 | Acceso total a todos los recursos |
| Gerente de Instalacion | 500 | Administra operaciones de instalacion |
| Supervisor de Produccion | 300 | Supervisa actividades de produccion |
| Trabajador | 100 | Ejecuta tareas asignadas |
| Observador | 10 | Acceso solo lectura |

Solo se muestran roles al nivel del usuario actual o inferior (query `roles.getAssignableRoles`).

## FacilityAccessSelect

- Checkbox "Seleccionar todas las instalaciones" en header
- Checkboxes individuales por instalacion (nombre + ciudad/region)
- Hover: fondo gris claro
- Error si ninguna seleccionada

## Acciones

| Boton | Estilo | Estado loading |
|-------|--------|----------------|
| Cancelar | outline | Deshabilitado durante submit |
| Enviar Invitacion | amber | "Enviando..." con spinner |

## Resultado

- **Exito:** Toast "Invitacion enviada" / "Se ha enviado una invitacion a {email}". Cierra modal, reset form
- **Error:** Toast destructivo con mensaje de error

## Validaciones Backend

- Email formato valido
- Email no existe en la compania
- No hay invitacion pendiente para el mismo email
- Rol existe y pertenece a la compania
- Todas las instalaciones existen y pertenecen a la compania
- Invitacion expira en 72 horas

## Data Source

| Mutation | Datos |
|----------|-------|
| `invitations.create({ email, roleId, facilityIds, invitedBy })` | Crea invitacion con token UUID, expira en 72h |

## Componentes

| Componente | Archivo |
|-----------|---------|
| InviteUserModal | `components/users/invite-user-modal.tsx` |
| RoleSelector | `components/users/role-selector.tsx` |
| FacilityAccessSelect | `components/users/facility-access-select.tsx` |
