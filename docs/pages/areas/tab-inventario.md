# Tab Inventario

Segundo tab de `/areas/[id]`. Muestra los items de inventario almacenados en esta area.

## Listado

Grid de cards (`md:grid-cols-2 lg:grid-cols-3`). Cada card muestra:

- **Header**: nombre del producto + SKU + numero de lote
- **Badge de status**: segun nivel de stock (Adecuado, Bajo, Critico, Agotado, Exceso)
- **Cantidad**: cantidad disponible con unidad
- **Alerta stock bajo** (si aplica): warning con punto de reorden
- **Reservado/Comprometido** (si > 0): cantidades reservadas y comprometidas
- **Vencimiento** (si tiene): fecha, en rojo si vence en < 30 dias
- **Costo unitario** (si tiene): precio por unidad

### Estados de Stock

| Estado | Color badge |
|--------|-------------|
| adequate | Verde (active) |
| low | Amarillo (maintenance) |
| critical | Rojo (inactive) |
| out_of_stock | Rojo (inactive) |
| overstocked | Amarillo (maintenance) |

## Estado Vacio

Icono Package, titulo "No hay inventario en esta area", mensaje descriptivo.

## Componentes

- `components/areas/area-inventory-tab.tsx` — tab completo
- Query: `api.inventory.list` con `companyId` y `area_id`, limite 50
