# Produccion — Vista General

## URL

`/production` con parametro de tab: `?tab=actividades|ordenes|analiticas`

## Estructura

Pagina unica con 3 tabs:

| Tab | Valor URL | Contenido |
|-----|-----------|-----------|
| Actividades | `actividades` (default) | Calendario de actividades programadas con vistas dia/semana/mes |
| Ordenes | `ordenes` | Listado de ordenes de produccion en formato cards |
| Analiticas | `analiticas` | Dashboard de productividad |

## Deep Linking

- La URL refleja el tab activo (`/production?tab=ordenes`)
- Navegar directo a una URL con `?tab` abre el tab correcto
- Tab default (sin parametro): `actividades`

## Sidebar

Una sola entrada "Produccion" apunta a `/production`.

## Subpaginas

| Ruta | Proposito |
|------|-----------|
| `/production/activities/new` | Wizard de nueva actividad no planeada (4 pasos) |
| `/production/activities/[id]` | Detalle de actividad programada |
| `/production/activities/[id]/edit` | Wizard de edicion de actividad programada |
| `/production/orders/[id]` | Detalle de orden de produccion (existente) |
| `/production/phases/[phase]` | Drill-down de fase (existente) |

Ver [subpaginas.md](./subpaginas.md) para detalle de cada subpagina.
Ver [tab-actividades.md](./tab-actividades.md) para detalle del tab de actividades.

## Archivos Clave

| Archivo | Rol |
|---------|-----|
| `app/(dashboard)/production/page.tsx` | Pagina principal con tabs |
| `app/(dashboard)/production/activities/new/page.tsx` | Wizard nueva actividad |
| `app/(dashboard)/production/activities/[id]/page.tsx` | Detalle de actividad |
| `app/(dashboard)/production/activities/[id]/edit/page.tsx` | Wizard edicion |
| `components/production/activities-tab.tsx` | Container del tab actividades |
| `components/production/activity-calendar.tsx` | Orquestador del calendario |
| `components/production/calendar-toolbar.tsx` | Toolbar: nav + vistas + nueva actividad |
| `components/production/calendar-week-view.tsx` | Vista semana |
| `components/production/calendar-day-view.tsx` | Vista dia (agenda) |
| `components/production/calendar-month-view.tsx` | Vista mes |
| `components/production/calendar-activity-pill.tsx` | Chip de actividad reutilizable |
| `components/production/activity-detail-page.tsx` | Contenido del detalle |
| `components/production/schedule-activity-wizard.tsx` | Wizard 4 pasos nueva actividad |
| `components/production/edit-activity-wizard.tsx` | Wizard 2 pasos edicion |
| `convex/scheduledActivities.ts` | Backend actividades programadas |
| `convex/activities.ts` | Backend actividades ejecutadas |
