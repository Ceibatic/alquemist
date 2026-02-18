# Tab Proveedores

Tab de `/resources?tab=suppliers`. Muestra proveedores de la empresa.

## Listado

Grid de cards o tabla con cada proveedor mostrando:
- Nombre y nombre legal
- Categorias de producto que maneja (badges)
- Rating (estrellas o numero de 0 a 5)
- Confiabilidad de entrega (%)
- Estado: activo / inactivo
- Estado de aprobacion: aprobado / pendiente
- Menu de acciones (3 puntos)

## Filtros

| Filtro | Tipo | Descripcion |
|--------|------|-------------|
| Categoria producto | Dropdown | Filtra proveedores por categoria de producto que manejan |
| Estado | Toggle | Activos / Inactivos |
| Busqueda | Input texto | Filtra por nombre, nombre legal, contacto |

## Stats (CompactStats)

| Stat | Calculo |
|------|---------|
| Proveedores | Total de proveedores activos |
| Aprobados | Proveedores con is_approved = true |
| Rating prom. | Promedio de rating de todos los proveedores |
| Categorias | Cantidad de categorias de producto cubiertas |

## Acciones

| Accion | Descripcion |
|--------|-------------|
| Crear | Navega a `/resources/suppliers/new` o abre modal de creacion |
| Ver detalle | Navega a `/resources/suppliers/[id]` |
| Editar | Navega a `/resources/suppliers/[id]/edit` |
| Activar/Desactivar | Toggle de estado activo |
| Eliminar | Confirma con dialog, soft delete (desactiva) |

## Estado Vacio

Icono de proveedor, mensaje descriptivo, boton CTA "Agregar proveedor" (amber-500).

## Componentes

- `components/suppliers/supplier-list.tsx` — lista con filtros
- `components/suppliers/supplier-table.tsx` — tabla de datos
- `components/suppliers/supplier-create-modal.tsx` — modal de creacion
- Query: `api.suppliers.list`
