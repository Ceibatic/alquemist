# Cultivares — Vista General

## URL

`/cultivars` — pagina de listado sin tabs.

## Estructura

Pagina de listado con stats compactos, barra de filtros y grid de cards. Sin tabs en la pagina principal.

## Deep Linking

No aplica (sin tabs).

## Sidebar

Una sola entrada "Cultivares" apunta a `/cultivars`.

## Subpaginas

| Ruta | Proposito |
|------|-----------|
| `/cultivars/[id]` | Detalle de cultivar (info, cannabinoides, metricas) |
| `/cultivars/[id]/edit` | Formulario de edicion de cultivar |

Ver [subpaginas.md](./subpaginas.md) para detalle de cada subpagina.

## Archivos Clave

| Archivo | Rol |
|---------|-----|
| `app/(dashboard)/cultivars/page.tsx` | Pagina principal con stats y listado |
| `app/(dashboard)/cultivars/[id]/page.tsx` | Detalle de cultivar |
| `app/(dashboard)/cultivars/[id]/edit/page.tsx` | Edicion de cultivar |
| `components/cultivars/cultivar-list.tsx` | Lista con filtros, busqueda, toggle |
| `components/cultivars/cultivar-card.tsx` | Card individual de cultivar |
| `components/cultivars/cultivar-form.tsx` | Form reutilizable crear/editar |
| `components/cultivars/cultivar-create-modal.tsx` | Modal de creacion |
| `components/cultivars/cannabinoid-range-input.tsx` | Input de rango THC/CBD |
| `components/cultivars/crop-type-filter.tsx` | Dropdown de tipo de cultivo |
| `components/cultivars/link-cultivars-modal.tsx` | Modal para vincular cultivares de sistema |
| `convex/cultivars.ts` | Backend cultivares (queries + mutations) |
| `convex/crops.ts` | Backend tipos de cultivo |
| `lib/validations/cultivar.ts` | Zod schemas cultivar |
| `lib/types/phase2.ts` | Tipos TypeScript (Cultivar, CultivarCharacteristics, etc.) |
