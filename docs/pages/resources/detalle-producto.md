# Detalle de Producto

Pagina de detalle de un producto con 3 sub-tabs para organizar la informacion.

## URL

`/resources/products/[id]` con parametro de sub-tab: `?section=info|inventory|quality`

## Header

- Breadcrumbs: Inicio > Recursos > [nombre del producto]
- Nombre del producto como titulo
- SKU y categoria como badges
- Botones de accion: Editar, Duplicar, mas opciones (descontinuar/eliminar)

---

## Sub-Tab: Informacion (default)

Muestra los datos basicos del producto organizados en cards:

### Card Informacion General
- Nombre, SKU, GTIN
- Categoria y subcategoria
- Descripcion
- Estado (activo/descontinuado)

### Card Proveedor y Precio
- Proveedor preferido (con link al detalle del proveedor)
- Proveedores regionales
- Precio, moneda, unidad de precio
- Historial de precios (tabla con cambios recientes)

### Card Especificaciones
- Unidad base
- Peso y dimensiones (si aplica)
- Vida util (shelf_life_days)
- Tipo de adquisicion (comprado/producido/ambos)
- Tracking de lote (requerido/opcional/ninguno)

### Card Transformacion (si aplica)
- Producto que produce (transformation_produces_id)
- Rendimiento por defecto (default_yield_pct)
- Cadena de transformacion visual

### Card Equipo (si aplica, solo categoria equipment)
- Valor de adquisicion
- Vida util en meses
- Valor residual
- Metodo de depreciacion

---

## Sub-Tab: Inventario

Muestra todos los lotes/items de inventario existentes de este producto, filtrados por product_id.

### Resumen
- Cantidad total disponible (suma de quantity_available de todos los items)
- Cantidad reservada (suma de quantity_reserved)
- Cantidad comprometida (suma de quantity_committed)
- Alertas de stock bajo (items por debajo de minimum_stock_level)
- Items proximos a vencer (expiration_date cercana)

### Listado de items de inventario

Tabla con cada item mostrando:
- Numero de lote (batch_number)
- Area donde esta almacenado
- Cantidad disponible / reservada / comprometida
- Fecha de recepcion
- Fecha de vencimiento (con indicador visual si esta proximo)
- Estado del lote (available/quarantined/reserved/expired/waste)
- Proveedor del lote (si tiene)
- Costo por unidad

### Filtros

| Filtro | Tipo | Descripcion |
|--------|------|-------------|
| Area | Dropdown | Filtra por area de almacenamiento |
| Estado lote | Dropdown | available / quarantined / reserved / expired / waste |

### Acciones

| Accion | Descripcion |
|--------|-------------|
| Ajustar inventario | Abre el wizard de ajuste de inventario para un item especifico |
| Ver trazabilidad | Muestra el historial completo de movimientos del item |
| Ver transacciones | Muestra el historial de transacciones del item |

---

## Sub-Tab: Calidad

Muestra la informacion regulatoria y de certificacion del producto.

### Card Registro Regulatorio
- Registrado: si/no (regulatory_registered)
- Numero de registro (regulatory_registration_number)
- Estado del registro

### Card Certificacion Organica
- Certificado: si/no (organic_certified)
- Numero de certificacion (organic_cert_number)
- Entidad certificadora (si se agrega)

### Acciones
- Editar informacion regulatoria (navega a edicion del producto con seccion enfocada)

**Nota:** Esta seccion muestra los campos regulatorios que ya existen en la tabla products. No gestiona certificados por lote individual (esos se ven en el detalle de cada item de inventario).

---

## Componentes

- `app/(dashboard)/resources/products/[id]/page.tsx` — pagina de detalle
- `components/products/product-form.tsx` — formulario de producto
- `components/products/product-price-history.tsx` — historial de precios
- `components/products/transformation-chain.tsx` — cadena de transformacion
- `components/inventory/inventory-list.tsx` — lista de inventario (filtrada por producto)
- `components/inventory/inventory-transaction-history.tsx` — historial de transacciones
- `components/inventory/item-traceability.tsx` — trazabilidad completa
- Query: `api.products.getById`, `api.inventory.list`, `api.inventory.getTransactionHistory`
