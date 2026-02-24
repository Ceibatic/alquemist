# Instalaciones — Vista General

## URL

`/facilities` — pagina de listado sin tabs.

## Estructura

Pagina de listado con indicador de limite del plan, barra de filtros, y grid de cards. El detalle de cada instalacion (`/facilities/[id]`) tiene 5 tabs de solo lectura. Edicion en subpagina separada.

## Deep Linking

No aplica en la pagina principal. El detalle usa tabs internos sin reflejo en URL.

## Sidebar

Una sola entrada "Instalaciones" apunta a `/facilities`.

## Subpaginas

| Ruta | Proposito |
|------|-----------|
| `/facilities/[id]` | Detalle de instalacion con 5 tabs (General, Ubicacion, Licencia, Areas, Utilities) |
| `/facilities/[id]/edit` | Formulario de edicion de instalacion |

Ver [subpaginas.md](./subpaginas.md) para detalle de cada subpagina.

## Archivos Clave

| Archivo | Rol |
|---------|-----|
| `app/(dashboard)/facilities/page.tsx` | Pagina principal con listado |
| `app/(dashboard)/facilities/[id]/page.tsx` | Detalle con 5 tabs |
| `app/(dashboard)/facilities/[id]/edit/page.tsx` | Edicion de instalacion |
| `components/facilities/facility-list.tsx` | Lista con filtros, busqueda, grid |
| `components/facilities/facility-card.tsx` | Card individual con gradiente por tipo |
| `components/facilities/facility-form.tsx` | Form reutilizable crear/editar (5 secciones) |
| `components/facilities/facility-create-modal.tsx` | Modal de creacion con limite de plan |
| `components/facilities/utility-readings-table.tsx` | Tabla de lecturas de utilities |
| `components/facilities/utility-reading-modal.tsx` | Modal de registro de lectura |
| `components/facilities/plan-limit-indicator.tsx` | Indicador de uso del plan |
| `convex/facilities.ts` | Backend: queries y mutations de instalaciones |
| `convex/utilities.ts` | Backend: lecturas de utilities y prorrateo |
| `lib/validations/facilities.ts` | Zod schemas + limites del plan |
