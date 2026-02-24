# Listado de Instalaciones

## Vista General

Grid de cards de instalaciones con filtros por tipo y estado, busqueda, e indicador de limite del plan.

## Indicador de Limite del Plan

- Visible solo si el plan no es ilimitado
- Barra de progreso: `actual / maximo`
- Colores: verde (normal), amarillo (>=80%), rojo (al limite)
- Boton "Actualizar Plan" al llegar al limite

### Limites por Plan

| Plan | Max Instalaciones |
|------|-------------------|
| Basic | 1 |
| Professional | 3 |
| Business | 5 |
| Enterprise | Ilimitado |

## Toolbar

| Zona | Contenido |
|------|-----------|
| Izquierda | Boton filtros (popover con checkboxes status: Activa/Inactiva/Suspendida) + dropdown tipo |
| Centro | Input de busqueda por nombre, licencia o ciudad |
| Derecha | Boton amber "Nueva Instalacion" (deshabilitado si al limite) |

### Filtro por Tipo

Dropdown con opciones: Todos, Indoor, Outdoor, Invernadero, Mixta. Cada opcion con icono.

## Facility Cards

Grid responsive (1/2/3 cols). Cada `FacilityCard` muestra:

### Header Visual

Gradiente de fondo segun tipo:

| Tipo | Gradiente |
|------|-----------|
| Indoor | blue-50 → blue-100 |
| Outdoor | green-50 → green-100 |
| Invernadero | amber-50 → amber-100 |
| Mixta | purple-50 → purple-100 |

- Badge "ACTUAL" (verde con estrella) si es instalacion actual
- Badge status (verde/rojo/amarillo) en esquina superior derecha

### Contenido

- Nombre (bold, truncado si largo) + menu dropdown
- Numero de licencia (texto gris)
- Tipo de instalacion con icono
- Ubicacion (pin + ciudad, departamento)
- Badges de cultivos primarios
- Area total y area de cultivo
- Fecha de creacion

### Menu Dropdown

| Opcion | Icono | Accion |
|--------|-------|--------|
| Editar | Edit | → `/facilities/[id]/edit` |
| Cambiar a esta | — | Mutation `setCurrentFacility` (solo si no es actual) |
| Desactivar | Trash (rojo) | Abre dialog de confirmacion |

### Click en Card

Click → navega a `/facilities/[id]`. No dispara en clicks de menu.

Instalacion actual tiene borde verde.

## Dialog Desactivar

- Advierte si es instalacion actual (usuario sera redirigido)
- No permite desactivar si tiene batches activos
- No permite desactivar si es la unica instalacion activa
- Mutation: `facilities.remove` (soft delete)

## Estados Vacios

1. **Sin instalaciones:** Card grande con icono PackageOpen + "No hay instalaciones configuradas" + boton "Crear Primera Instalacion"
2. **Sin resultados con filtros:** "No se encontraron instalaciones" + link "Limpiar filtros"

## Data Source

| Query | Datos |
|-------|-------|
| `facilities.list({ companyId, status?, limit?, offset? })` | Lista de instalaciones |
| `users.getUserById({ userId })` | Para primary_facility_id y acceso |
| `crops.getCropTypes()` | Tipos de cultivo para enriquecer cards |

## Componentes

| Componente | Archivo |
|-----------|---------|
| FacilityList | `components/facilities/facility-list.tsx` |
| FacilityCard | `components/facilities/facility-card.tsx` |
| PlanLimitIndicator | `components/facilities/plan-limit-indicator.tsx` |
