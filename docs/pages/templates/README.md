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
| `/templates/[id]` | Detalle de template de produccion |
| `/templates/[id]/edit` | Editar template de produccion |
| `/activity-templates/[id]` | Wizard de activity template (crear/editar) |
| `/activity-templates/new` | Wizard para nuevo activity template |
| `/quality-checks/templates/[id]` | Detalle de QC template |
| `/quality-checks/inspections/[id]` | Detalle de inspeccion ejecutada |

Ver [subpaginas.md](./subpaginas.md) para detalle de cada subpagina.

## Archivos Clave

| Archivo | Rol |
|---------|-----|
| `app/(dashboard)/templates/page.tsx` | Pagina principal con tabs |
| `components/templates/template-list.tsx` | Lista de templates de produccion |
| `components/activity-templates/activity-template-list.tsx` | Lista de activity templates |
| `components/quality-checks/quality-template-list.tsx` | Lista de QC templates |
| `convex/productionTemplates.ts` | Backend produccion |
| `convex/activityTemplates.ts` | Backend actividades |
| `convex/qualityCheckTemplates.ts` | Backend calidad |
