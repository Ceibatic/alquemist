# Tab Productos

Tab default de `/resources`. Muestra el catalogo de productos de la empresa con CRUD completo.

## Listado

Grid de cards o tabla con cada producto mostrando:
- SKU y nombre
- Categoria (badge): semilla, nutriente, pesticida, sustrato, biocontrol, equipo, etc.
- Precio y unidad
- Estado: activo / descontinuado
- Proveedor preferido (si tiene)
- Menu de acciones (3 puntos)

## Filtros

| Filtro | Tipo | Descripcion |
|--------|------|-------------|
| Categoria | Dropdown | Filtra por categoria de producto (seed, nutrient, pesticide, etc.) |
| Estado | Dropdown | Activo / Descontinuado |
| Busqueda | Input texto | Filtra por nombre, SKU, descripcion |

## Stats (CompactStats)

| Stat | Calculo |
|------|---------|
| Productos | Total de productos activos |
| Categorias | Cantidad de categorias distintas en uso |
| Con proveedor | Productos que tienen proveedor preferido asignado |
| Descontinuados | Productos con status "discontinued" |

## Acciones

| Accion | Descripcion |
|--------|-------------|
| Crear | Navega a `/resources/products/new` o abre modal de creacion |
| Ver detalle | Navega a `/resources/products/[id]` |
| Editar | Navega a `/resources/products/[id]/edit` |
| Duplicar | Crea copia del producto via mutation |
| Descontinuar | Confirma via dialog, marca como discontinued |
| Eliminar | Solo si no tiene inventario asociado, confirma con dialog |

## Estado Vacio

Icono de producto, mensaje descriptivo, boton CTA "Crear producto" (amber-500).

## Componentes

- `components/products/product-list.tsx` — lista completa con filtros
- `components/products/product-table.tsx` — tabla de datos
- `components/products/product-create-modal.tsx` — modal de creacion
- Query: `api.products.list`
