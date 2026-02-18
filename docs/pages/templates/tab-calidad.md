# Tab Calidad

Tab de `/templates?tab=quality`. Muestra templates de control de calidad para inspecciones y chequeos.

## Listado

Grid de cards (`md:grid-cols-2 lg:grid-cols-3`) con cada template mostrando:
- Nombre
- Tipo de cultivo (con icono Leaf)
- Tipo de procedimiento (badge): Salud de Planta, Inspeccion de Plagas, Nutricion, Calidad Cosecha, Ambiental, Cumplimiento
- Nivel de inspeccion (badge): Basico, Estandar, Detallado, Completo
- Badge "Regulatorio" (si aplica, azul)
- Badge "AI" (si tiene analisis AI, morado)
- Etapas aplicables (badges, max 3 visibles + counter)
- Stats: cantidad de usos y tiempo promedio de completado
- Tipos de analisis AI (si aplica)

## Filtros

| Filtro | Tipo | Descripcion |
|--------|------|-------------|
| Tipo cultivo | Dropdown | Filtra por crop type |
| Tipo procedimiento | Dropdown | health_check, pest_inspection, nutrient_check, harvest_quality, environmental, compliance |
| Busqueda | Input texto | Filtra por nombre |
| Archivados | Toggle checkbox | Muestra templates archivados |

## Stats (CompactStats)

| Stat | Calculo |
|------|---------|
| Templates | Total de QC templates |
| Procedimientos | Cantidad de tipos de procedimiento distintos |
| Inspecciones | Suma de `usage_count` de todos los templates |
| Tiempo Prom. | Promedio de `average_completion_time_minutes` |

## Acciones

| Accion | Descripcion |
|--------|-------------|
| Crear | Navega a formulario de creacion de QC template |
| Ver detalle | Navega a `/quality-checks/templates/[id]` |
| Editar | Disponible desde card |
| Duplicar | Crea copia via mutation `qualityCheckTemplates.duplicate` |
| Archivar | Confirma via dialog, marca como archivado |
| Restaurar | Disponible en vista archivados |

## Estado Vacio

Icono ClipboardCheck, mensaje descriptivo, CTA "Crear template" (amber-500).

## Componentes

- `components/quality-checks/quality-template-list.tsx` — lista con filtros
- `components/quality-checks/qc-template-card.tsx` — card individual
- Query: `api.qualityCheckTemplates.list`
- Mutations: `qualityCheckTemplates.archive`, `.restore`, `.duplicate`

## Schema (`quality_check_templates`)

Campos principales:
- `name`, `crop_type_id`, `procedure_type`, `inspection_level`
- `regulatory_requirement` (bool), `compliance_standard`
- `ai_assisted` (bool), `ai_analysis_types` (array)
- `applicable_stages` (array), `frequency_recommendation`
- `usage_count`, `average_completion_time_minutes`
- `status`: "active" | "archived"
