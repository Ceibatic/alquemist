# Tab Produccion

Tab default de `/templates`. Muestra templates de produccion reutilizables que definen fases y actividades para ciclos de cultivo.

## Listado

Grid de cards (`md:grid-cols-2 lg:grid-cols-3`) con cada template mostrando:
- Nombre y tipo de cultivo
- Categoria (badge): Semilla a Cosecha, Propagacion, Custom
- Cantidad de fases
- Conteo de usos
- Tasa de exito promedio
- Menu de acciones (3 puntos)

## Filtros

| Filtro | Tipo | Descripcion |
|--------|------|-------------|
| Tipo cultivo | Dropdown | Filtra por tipo de cultivo (Cannabis, Cafe, etc.) |
| Categoria | Dropdown | Semilla a cosecha / Propagacion / Custom |
| Archivados | Toggle checkbox | Muestra templates archivados en lugar de activos |
| Busqueda | Input texto | Filtra por nombre, descripcion, tipo cultivo |

## Stats (CompactStats)

| Stat | Calculo |
|------|---------|
| Templates | Total de templates activos |
| Fases | Suma de fases en todos los templates |
| Usos | Suma de `usage_count` de todos los templates |
| Exito | Promedio de `average_success_rate` (como %) |

## Acciones

| Accion | Descripcion |
|--------|-------------|
| Crear | Navega a `/templates/new` (wizard de 2 pasos: datos + fases) |
| Ver detalle | Navega a `/templates/[id]` (info + fases clickables) |
| Editar | Navega a `/templates/[id]/edit` |
| Duplicar | Crea copia del template via mutation |
| Archivar | Confirma via dialog, marca como archivado |
| Restaurar | Disponible en vista archivados, restaura a activo |

## Estado Vacio

Cuando no hay templates: icono, mensaje descriptivo, boton CTA "Crear template" (amber-500).

## Flujo de navegacion

```
/templates              → Lista con cards, filtros, boton "Crear"
/templates/new          → Wizard 2 pasos (datos + fases)
/templates/[id]         → Detalle: info card + lista de fases
/templates/[id]/phases/[phaseId] → Detalle fase: info + cronograma dias
```

## Componentes

- `components/templates/template-list.tsx` — lista completa con filtros
- `components/templates/template-card.tsx` — card individual
- `components/templates/template-create-wizard.tsx` — wizard de creacion (2 pasos)
- `components/templates/wizard-step-basic.tsx` — paso 1 datos basicos
- `components/templates/wizard-step-phases.tsx` — paso 2 fases con drag & drop
- `components/templates/phase-create-dialog.tsx` — dialog crear/editar fase
- `components/templates/phase-detail-view.tsx` — vista de fase con cronograma
- `components/templates/add-activity-dialog.tsx` — dialog agregar actividad a dia
- Query: `api.productionTemplates.list`, `api.productionTemplates.getById`
- Query: `api.templatePhases.getById` (fase con actividades enriquecidas + activity_type_info)
- Mutation: `api.templateActivities.createFromActivityTemplate` (con `startDay`)
