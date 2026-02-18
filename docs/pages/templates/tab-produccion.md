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
| Crear | Abre modal de creacion con nombre, tipo cultivo, categoria |
| Ver detalle | Navega a `/templates/[id]` |
| Editar | Navega a `/templates/[id]/edit` |
| Duplicar | Crea copia del template via mutation |
| Archivar | Confirma via dialog, marca como archivado |
| Restaurar | Disponible en vista archivados, restaura a activo |

## Estado Vacio

Cuando no hay templates: icono, mensaje descriptivo, boton CTA "Crear template" (amber-500).

## Componentes

- `components/templates/template-list.tsx` — lista completa con filtros
- `components/templates/template-card.tsx` — card individual
- `components/templates/template-create-modal.tsx` — modal de creacion
- Query: `api.productionTemplates.list`
