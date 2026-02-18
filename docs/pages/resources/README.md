# Recursos — Vista General

## URL

`/resources` con parametro de tab: `?tab=products|suppliers`

## Estructura

Pagina unica con 2 tabs:

| Tab | Valor URL | Contenido |
|-----|-----------|-----------|
| Productos | `products` (default) | Catalogo de productos con CRUD completo |
| Proveedores | `suppliers` | Listado de proveedores con CRUD |

## Deep Linking

- La URL refleja el tab activo (`/resources?tab=suppliers`)
- Navegar directo a una URL con `?tab` abre el tab correcto
- Tab default (sin parametro): `products`

## Compatibilidad — Redirects

| Ruta antigua | Redirige a |
|-------------|------------|
| `/products` | `/resources` |
| `/suppliers` | `/resources?tab=suppliers` |
| `/inventory` | Se elimina como pagina independiente (el inventario se accede desde el detalle de cada producto) |

## Sidebar

Una sola entrada "Recursos" apunta a `/resources`. Las entradas antiguas de Productos, Proveedores e Inventario se remueven.

## Subpaginas

| Ruta | Proposito |
|------|-----------|
| `/resources/products/[id]` | Detalle de producto con sub-tabs (Info, Inventario, Calidad) |
| `/resources/products/[id]/edit` | Edicion de producto |
| `/resources/products/new` | Creacion de producto nuevo |
| `/resources/suppliers/[id]` | Detalle de proveedor |
| `/resources/suppliers/[id]/edit` | Edicion de proveedor |
| `/resources/suppliers/new` | Creacion de proveedor nuevo |

Ver [subpaginas.md](./subpaginas.md) para detalle de cada subpagina.

## Archivos Clave

| Archivo | Rol |
|---------|-----|
| `app/(dashboard)/resources/page.tsx` | Pagina principal con tabs |
| `components/products/product-list.tsx` | Lista de productos |
| `components/suppliers/supplier-list.tsx` | Lista de proveedores |
| `convex/products.ts` | Backend productos |
| `convex/suppliers.ts` | Backend proveedores |
| `convex/inventory.ts` | Backend inventario |
