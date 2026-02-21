# Areas — Vista General

## URL

`/areas` — pagina de listado sin tabs.

## Estructura

Pagina de listado con stats compactos, barra de filtros y grid de cards. El detalle de cada area (`/areas/[id]`) tiene 5 tabs.

## Deep Linking

No aplica en la pagina principal (sin tabs). El detalle usa tabs internos sin reflejo en URL.

## Sidebar

Una sola entrada "Areas" apunta a `/areas`.

## Subpaginas

| Ruta | Proposito |
|------|-----------|
| `/areas/[id]` | Detalle de area con 5 tabs (Produccion, Inventario, Historial, Cronograma, Detalle) |
| `/areas/[id]/edit` | Formulario de edicion de area |
| `/areas/[id]/phases/[phase]` | Detalle de fase con stats y tabla de actividades |
| `/areas/[id]/activities/[actId]` | Detalle de actividad con 4 tabs (Esencial, Recursos, Fotos, Documentos) |

Ver [subpaginas.md](./subpaginas.md) para detalle de cada subpagina.

## Archivos Clave

| Archivo | Rol |
|---------|-----|
| `app/(dashboard)/areas/page.tsx` | Pagina principal con stats y listado |
| `app/(dashboard)/areas/[id]/page.tsx` | Detalle de area con 5 tabs |
| `app/(dashboard)/areas/[id]/edit/page.tsx` | Edicion de area |
| `app/(dashboard)/areas/[id]/phases/[phase]/page.tsx` | Detalle de fase |
| `app/(dashboard)/areas/[id]/activities/[actId]/page.tsx` | Detalle de actividad |
| `components/areas/area-list.tsx` | Lista con filtros, busqueda, tipo |
| `components/areas/area-card.tsx` | Card individual de area |
| `components/areas/area-form.tsx` | Form reutilizable crear/editar |
| `components/areas/area-create-modal.tsx` | Modal de creacion |
| `components/areas/area-production-tab.tsx` | Tab produccion (phase cards) |
| `components/areas/area-inventory-tab.tsx` | Tab inventario |
| `components/areas/area-history-tab.tsx` | Tab historial (activities table) |
| `components/areas/area-structures-tab.tsx` | Gestion de estructuras |
| `components/areas/phase-card.tsx` | Card de fase con batches |
| `components/areas/structure-card.tsx` | Card de estructura |
| `components/areas/structure-form.tsx` | Form crear/editar estructura |
| `components/areas/phase-detail-filters.tsx` | Filtros de fase detalle |
| `components/activities/activity-schedule.tsx` | Cronograma de actividades |
| `components/activities/activity-execution-sheet.tsx` | Sheet de registro de actividad |
| `components/activities/schedule-activity-dialog.tsx` | Dialog programar actividad |
| `convex/areas.ts` | Backend areas (queries + mutations) |
| `convex/structures.ts` | Backend estructuras |
| `lib/validations/area.ts` | Zod schemas area |
| `lib/validations/structure.ts` | Zod schemas estructura |
| `lib/constants/structures.ts` | Tipos de estructura por ambiente |
