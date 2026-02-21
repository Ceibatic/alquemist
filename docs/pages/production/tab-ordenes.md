# Tab Ordenes — Lista de Ordenes

## Vista General

Listado de ordenes de produccion (`production_orders`) con stats, filtros y busqueda. Misma UX que el tab de produccion en Templates.

## CompactStats

4 stat cards en grid:

| Stat | Icono | Color | Data Source |
|------|-------|-------|-------------|
| Activas | Play | blue | `stats.activeOrders` |
| Planificacion | Clock | amber | `stats.planningOrders` |
| Completadas | CheckCircle | green | `stats.completedOrders` |
| Progreso | ClipboardList | purple | `stats.averageCompletion` + "%" |

Query: `productionOrders.getStats`

## Toolbar

| Zona | Contenido |
|------|-----------|
| Izquierda | Boton filtros (popover con checkboxes estado) + dropdown status |
| Centro | Input de busqueda "Buscar ordenes..." |
| Derecha | Boton amber "Nueva Orden" → `/production/orders/new` |

### Filtros

- Status checkboxes: Planificacion, Activas, Completadas, Canceladas
- Status dropdown: Todos / En Planificacion / Activas / Completadas

## Order Cards

Grid responsive (1/2/3 cols). Cada `ProductionOrderCard` muestra:
- Numero de orden (mono font)
- Status badge
- Tipo cultivo + cultivar
- Template usado
- Barra progreso con porcentaje
- Fechas inicio/fin estimada

Click → navega a `/production/orders/[id]`

## Data Source

- Stats: `productionOrders.getStats({ companyId, facilityId? })`
- Lista: `productionOrders.list({ companyId, facilityId?, status? })`

## Componentes

| Componente | Archivo |
|-----------|---------|
| OrdersTab | `components/production/orders-tab.tsx` |
| CompactStats | inline en `orders-tab.tsx` |
| ProductionOrderList | `components/production-orders/production-order-list.tsx` |
| ProductionOrderCard | `components/production-orders/production-order-card.tsx` |
