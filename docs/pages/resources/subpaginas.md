# Subpaginas de Recursos

## `/resources/products/[id]` — Detalle de Producto

Pagina con 3 sub-tabs (ver [detalle-producto.md](./detalle-producto.md)):
- **Info**: datos basicos, proveedor, precio, especificaciones
- **Inventario**: items de inventario de este producto, ajuste via wizard
- **Calidad**: informacion regulatoria y certificaciones organicas
- **Breadcrumbs**: Inicio > Recursos > [nombre]

**Ruta**: `app/(dashboard)/resources/products/[id]/page.tsx`

## `/resources/products/[id]/edit` — Edicion de Producto

Formulario completo de edicion del producto con todas las secciones.
- **Breadcrumbs**: Inicio > Recursos > [nombre] > Editar

**Ruta**: `app/(dashboard)/resources/products/[id]/edit/page.tsx`

## `/resources/products/new` — Crear Producto

Formulario de creacion de producto nuevo. Misma estructura que edicion pero en modo creacion.
- **Breadcrumbs**: Inicio > Recursos > Nuevo producto

**Ruta**: `app/(dashboard)/resources/products/new/page.tsx`

## `/resources/suppliers/[id]` — Detalle de Proveedor

Muestra informacion completa del proveedor:
- **Header**: nombre, estado, aprobacion
- **Info**: datos legales, contacto, ubicacion
- **Rendimiento**: rating, confiabilidad, score de calidad
- **Categorias**: productos que maneja, especializacion
- **Certificaciones y licencias**
- **Breadcrumbs**: Inicio > Recursos > Proveedores > [nombre]

**Ruta**: `app/(dashboard)/resources/suppliers/[id]/page.tsx`

## `/resources/suppliers/[id]/edit` — Edicion de Proveedor

Formulario de edicion del proveedor.
- **Breadcrumbs**: Inicio > Recursos > Proveedores > [nombre] > Editar

**Ruta**: `app/(dashboard)/resources/suppliers/[id]/edit/page.tsx`

## `/resources/suppliers/new` — Crear Proveedor

Formulario de creacion de proveedor nuevo.
- **Breadcrumbs**: Inicio > Recursos > Proveedores > Nuevo proveedor

**Ruta**: `app/(dashboard)/resources/suppliers/new/page.tsx`

## Nota sobre el Wizard de Inventario

El wizard de ajuste de inventario NO es una subpagina. Es un Sheet (panel lateral) que se abre desde el tab de Inventario del detalle de producto. Se documenta en [wizard-inventario.md](./wizard-inventario.md).
