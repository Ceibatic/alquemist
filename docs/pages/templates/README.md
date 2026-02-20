# Templates — Vista General

## URL

`/templates` con parametro de tab: `?tab=production|activities|quality`

## Estructura

Pagina unica con 3 tabs:

| Tab | Valor URL | Contenido |
|-----|-----------|-----------|
| Produccion | `production` (default) | Templates de produccion con fases y actividades |
| Actividades | `activities` | Templates de actividades estandarizadas |
| Calidad | `quality` | Templates de control de calidad / inspecciones |

## Deep Linking

- La URL refleja el tab activo (`/templates?tab=activities`)
- Navegar directo a una URL con `?tab` abre el tab correcto
- Tab default (sin parametro): `production`

## Compatibilidad — Redirects

| Ruta antigua | Redirige a |
|-------------|------------|
| `/activity-templates` | `/templates?tab=activities` |
| `/quality-checks` | `/templates?tab=quality` |

Los redirects estan en `app/(dashboard)/activity-templates/page.tsx` y `app/(dashboard)/quality-checks/page.tsx` usando `redirect()` de Next.js.

## Sidebar

Una sola entrada "Templates" apunta a `/templates`. Las entradas antiguas de actividades y calidad fueron removidas.

## Subpaginas

| Ruta | Proposito |
|------|-----------|
| `/templates/new` | Wizard de creacion de template de produccion (2 pasos) |
| `/templates/[id]` | Detalle de template de produccion (info + fases) |
| `/templates/[id]/edit` | Editar template de produccion |
| `/templates/[id]/phases/[phaseId]` | Detalle de fase con cronograma dia a dia |
| `/activity-templates/[id]` | Wizard de activity template (crear/editar) |
| `/activity-templates/new` | Wizard para nuevo activity template |
| `/quality-checks/templates/[id]` | Detalle de QC template |
| `/quality-checks/inspections/[id]` | Detalle de inspeccion ejecutada |

Ver [subpaginas.md](./subpaginas.md) para detalle de cada subpagina.

## Archivos Clave

| Archivo | Rol |
|---------|-----|
| `app/(dashboard)/templates/page.tsx` | Pagina principal con tabs |
| `app/(dashboard)/templates/new/page.tsx` | Wizard de creacion |
| `app/(dashboard)/templates/[id]/page.tsx` | Detalle de template |
| `app/(dashboard)/templates/[id]/phases/[phaseId]/page.tsx` | Detalle de fase |
| `components/templates/template-list.tsx` | Lista de templates de produccion |
| `components/templates/template-create-wizard.tsx` | Wizard 2 pasos |
| `components/templates/phase-detail-view.tsx` | Vista de fase con cronograma |
| `components/templates/add-activity-dialog.tsx` | Dialog para agregar actividad a dia |
| `components/activity-templates/activity-template-list.tsx` | Lista de activity templates |
| `components/quality-checks/quality-template-list.tsx` | Lista de QC templates |
| `convex/productionTemplates.ts` | Backend produccion |
| `convex/templatePhases.ts` | Backend fases |
| `convex/templateActivities.ts` | Backend actividades de fase |
| `convex/activityTemplates.ts` | Backend activity templates |
| `convex/qualityCheckTemplates.ts` | Backend calidad |
