# Trazabilidad de Lote

## Tab Trazabilidad en `/batches/[id]`

Vista completa de la cadena de trazabilidad del lote: desde los insumos de origen hasta los productos generados, pasando por todas las actividades ejecutadas.

## Componente

`components/batches/batch-traceability-view.tsx` — `BatchTraceabilityView`

## Query

`batches.getBatchTraceability` — Consulta unificada que retorna:

```typescript
{
  batch: { _id, batchCode, status, currentPhase },
  sourceItems: [...],       // Insumos consumidos/transformados
  outputItems: [...],       // Productos generados (transformation_in)
  activityTimeline: [...],  // Actividades ejecutadas ordenadas cronologicamente
  parentBatch: null | {...}, // Lote padre si fue dividido
  childBatches: [...],       // Lotes derivados
  phaseTransitions: [...],   // Log de transiciones de fase
  stats: { totalActivities, totalSourceItems, totalOutputItems, totalTransactions },
}
```

## Secciones de la vista

### 1. Barra de estadisticas
4 cards compactas con metricas clave:
- Total actividades ejecutadas
- Total insumos consumidos
- Total productos generados
- Total transacciones de inventario

### 2. Transiciones de fase (condicional)
Solo visible si hay transiciones registradas. Lista compacta de cambios de estado de fases con timestamp y tipo de transicion.

### 3. Origen (Insumos)
Cards de los items de inventario consumidos por el lote:
- Nombre del producto + SKU
- Cantidad y unidad
- Proveedor (si disponible)
- Numero de lote del insumo
- Fecha de recepcion

### 4. Genealogia (condicional)
Solo visible si el lote tiene padre o hijos.
- **Lote padre**: Link al lote original (si fue creado por division)
- **Lotes derivados**: Grid de cards con codigo, estado, fase y cantidad de plantas. Click navega al detalle.

### 5. Linea de tiempo de actividades
Timeline vertical con dots amber conectados por linea vertical:
- Tipo de actividad
- Fase (badge)
- Estado (badge coloreado)
- Fecha de inicio y finalizacion
- Responsable
- Recursos consumidos/producidos (lista compacta)
- Notas (si existen)

### 6. Productos generados (condicional)
Solo visible si hay items de output. Cards de productos resultantes de transformaciones:
- Nombre del producto + categoria
- Cantidad y unidad
- Estado de transformacion (badge)
- Fecha de creacion

## Estados vacios
- Sin datos: "Sin datos de trazabilidad disponibles" con icono GitBranch
- Loading: Spinner centrado
- Sin insumos/outputs: secciones no se renderizan

## Dependencias
- Query `batches.getBatchTraceability` usa indexes:
  - `activities.by_batch_id`
  - `inventory_transactions.by_batch_id`
  - `phase_transition_log.by_order`
  - `activity_resources.by_activity`
