# Subpaginas de Templates

## `/templates/[id]` — Detalle de Template de Produccion

Muestra informacion completa de un template de produccion:
- **Header**: nombre, tipo cultivo, categoria, estado, acciones (editar, duplicar, archivar)
- **Info general**: descripcion, fecha creacion, usos, tasa de exito
- **Fases**: lista ordenada de fases con duracion, actividades asignadas
- **Timeline**: visualizacion temporal de las fases
- **Breadcrumbs**: Inicio > Templates > [nombre]

**Ruta**: `app/(dashboard)/templates/[id]/page.tsx`

## `/templates/[id]/edit` — Edicion de Template de Produccion

Editor del template de produccion:
- Informacion basica (nombre, tipo cultivo, categoria, descripcion)
- Editor de fases: agregar, reordenar, eliminar fases
- Asignar actividades a cada fase
- Guardar cambios o cancelar
- **Breadcrumbs**: Inicio > Templates > [nombre] > Editar

**Ruta**: `app/(dashboard)/templates/[id]/edit/page.tsx`

## `/activity-templates/[id]` — Wizard de Activity Template

Reutiliza el wizard de 4 pasos (ver [wizard-actividades.md](./wizard-actividades.md)):
- Si `[id]` = "new": modo creacion
- Si `[id]` = ID existente: modo edicion, carga datos
- **Breadcrumbs**: Inicio > Templates > Actividades > [nombre/Nuevo]

**Ruta**: `app/(dashboard)/activity-templates/[id]/page.tsx`

## `/quality-checks/templates/[id]` — Detalle de QC Template

Muestra informacion completa de un template de control de calidad:
- **Header**: nombre, tipo cultivo, tipo procedimiento, nivel inspeccion
- **Badges**: regulatorio, AI, compliance standard
- **Preview del formulario**: vista previa de las secciones y campos definidos
- **Etapas aplicables**: lista de fases del cultivo donde se usa
- **Stats**: usos totales, tiempo promedio de completado
- **Breadcrumbs**: Inicio > Templates > Calidad > [nombre]

**Ruta**: `app/(dashboard)/quality-checks/templates/[id]/page.tsx`

## `/quality-checks/inspections/[id]` — Detalle de Inspeccion Ejecutada

Muestra una inspeccion completada:
- **Header**: template usado, entidad inspeccionada (batch/planta), fecha, inspector
- **Resultados**: respuestas del formulario completado
- **Resultado general**: pass/fail/conditional, score, notas
- **Analisis AI** (si aplica): resultados del analisis automatico
- **Breadcrumbs**: Inicio > Templates > Calidad > Inspecciones > [id]

**Ruta**: `app/(dashboard)/quality-checks/inspections/[id]/page.tsx`

## Nota sobre ActivityExecutionSheet

El formulario de reporte de actividad (`ActivityExecutionSheet`) NO es una subpagina de Templates. Es un sheet (panel lateral) que pertenece al modulo de Actividades y se usa desde areas, batches y ordenes de produccion. Se documentara en el modulo de Actividades.
