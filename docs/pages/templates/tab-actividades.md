# Tab Actividades

Tab de `/templates?tab=activities`. Muestra templates de actividades estandarizadas que definen operaciones reutilizables (riego, fertilizacion, poda, etc.).

## Listado

Grid de cards (`md:grid-cols-2 lg:grid-cols-3`) con cada template mostrando:
- Nombre y codigo
- Tipo de actividad (badge con color)
- Prioridad
- Fases aplicables (badges)
- Frecuencia y duracion estimada
- Cantidad de recursos requeridos
- Menu de acciones (3 puntos)

## Filtros

| Filtro | Tipo | Descripcion |
|--------|------|-------------|
| Fase | Dropdown | Propagacion, Vegetativo, Floracion, Cosecha, Secado, Curado, Poscosecha |
| Busqueda | Input texto | Filtra por nombre, codigo, descripcion |
| Archivados | Toggle checkbox | Muestra templates archivados |

## Stats (CompactStats)

| Stat | Calculo |
|------|---------|
| Templates | Total de activity templates |
| Tipos | Cantidad de tipos de actividad distintos usados |
| Recurrentes | Templates con frecuencia recurrente (no once/on_demand) |
| Con QC | Templates vinculados a un QC template |

## Acciones

| Accion | Descripcion |
|--------|-------------|
| Crear | Navega a `/activity-templates/new` (wizard 4 pasos) |
| Ver detalle | Navega a `/activity-templates/[id]` |
| Duplicar | Crea copia via mutation `activityTemplates.duplicate` |
| Archivar | Confirma via dialog, marca como archivado |
| Restaurar | Disponible en vista archivados |

## Estado Vacio

Icono FileText, mensaje "No hay templates", CTA "Crear template" (amber-500).

## Componentes

- `components/activity-templates/activity-template-list.tsx` — lista con filtros
- `components/activity-templates/activity-template-card.tsx` — card individual
- Query: `api.activityTemplates.list`

## Nota

El wizard de creacion/edicion se documenta en [wizard-actividades.md](./wizard-actividades.md).
