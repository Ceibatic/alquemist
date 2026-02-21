# Tab Historial

Tercer tab de `/areas/[id]`. Muestra todas las actividades ejecutadas en el area con filtros y acciones.

## Tabla de Actividades

DataTable con columnas sortables:

| Columna | Descripcion |
|---------|-------------|
| Fecha | Timestamp (dd/mm/yy hh:mm), sortable |
| Tipo | Nombre del tipo de actividad, sortable |
| Lote | Codigo de lote en monospace |
| Fase | Fase del cultivo (label traducido) |
| Responsable | Nombre del ejecutor |
| Estado | Planificado / En progreso / Completado / Verificado / Cancelado |

Click en fila → `/areas/[id]/activities/[actId]`

Busqueda interna por tipo de actividad.

## Filtros

| Filtro | Tipo | Descripcion |
|--------|------|-------------|
| Categoria | Select dropdown | Todas / categorias de `ACTIVITY_CATEGORIES` |

## Acciones

| Accion | Descripcion |
|--------|-------------|
| Programar | Abre `ScheduleActivityDialog` para crear actividad futura |
| Registrar actividad | Abre `ActivityExecutionSheet` para registrar actividad ejecutada |

Ambos botones aparecen siempre (tanto con datos como en estado vacio).

## Estado Vacio

Icono Activity, titulo "Sin actividades registradas", mensaje descriptivo.

## Componentes

- `components/areas/area-history-tab.tsx` — tab completo
- `components/activities/activity-execution-sheet.tsx` — sheet de registro (modulo Actividades)
- `components/activities/schedule-activity-dialog.tsx` — dialog de programacion (modulo Actividades)
- Query: `api.activities.listByArea` con `areaId` y `category` opcional
