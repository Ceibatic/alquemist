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
| `/production/orders/new` | Wizard de creacion de orden (2 pasos) |
| `/production/orders/[id]` | Detalle de orden (estilo template: info + fases + timeline) |
| `/production/orders/[id]/phases/[phaseId]` | Detalle de fase con schedule de actividades por dia |

Ver [subpaginas.md](./subpaginas.md) para detalle de cada subpagina.
Ver [tab-actividades.md](./tab-actividades.md) para detalle del tab de actividades.
Ver [tab-ordenes.md](./tab-ordenes.md) para detalle del tab de ordenes.

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
| `components/production/orders-tab.tsx` | Container del tab ordenes |
| `components/production-orders/production-order-list.tsx` | Listado de ordenes con filtros |
| `components/production-orders/production-order-card.tsx` | Card de orden individual |
| `components/production-orders/order-phase-detail-view.tsx` | Detalle de fase con schedule por dia |
| `components/production-orders/add-order-activity-dialog.tsx` | Dialog para agregar actividad a fase |
| `components/production-orders/order-create-wizard.tsx` | Wizard 2 pasos creacion de orden |
| `components/production-orders/order-wizard-step-basic.tsx` | Paso 1: datos basicos |
| `components/production-orders/order-wizard-step-phases.tsx` | Paso 2: fases (template o manual) |
| `convex/scheduledActivities.ts` | Backend actividades programadas |
| `convex/orderPhases.ts` | Backend fases de orden (getById, create) |
| `convex/productionOrders.ts` | Backend ordenes de produccion |
| `convex/activities.ts` | Backend actividades ejecutadas |
