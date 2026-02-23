# Utilities — Lecturas de Medidores

## Vista General

Tab dentro del detalle de instalacion para registrar y gestionar lecturas de medidores (electricidad, agua, gas) y prorratear costos a batches activos.

## Tabla de Lecturas

| Columna | Contenido | Alineacion |
|---------|-----------|------------|
| Periodo | YYYY-MM | Izquierda |
| Tipo | Electricidad / Agua / Gas | Izquierda |
| Consumo | valor + unidad (ej: "850 kWh") | Derecha |
| Costo | $valor en formato es-CO (bold) | Derecha |
| Estado | Badge: Pendiente / Prorrateado / Sin batches | Izquierda |
| Fecha Registro | Fecha en formato es-CO | Izquierda |
| Acciones | Boton Prorratear/Re-prorratear | Derecha |

Limite: ultimas 24 lecturas.

### Prorrateo

- Click "Prorratear" o "Re-prorratear" (icono ArrowRightLeft)
- Loading: "Prorrateando..."
- Backend busca batches activos durante el periodo de la lectura
- Asigna costo proporcional a: `area_m2 x (dias_activos / dias_del_periodo)`
- Crea registros `cost_entries`
- Si no hay batches: status → "no_batches", costo como overhead
- Toast exito: "Costo prorrateado a X batches"
- Toast sin batches: "No hay batches activos. Costo registrado como overhead."

## Modal Registrar Lectura

| Campo | Tipo | Requerido | Detalle |
|-------|------|-----------|---------|
| Tipo | select | Si | Electricidad, Agua, Gas. Default: "electricity" |
| Periodo | month picker (YYYY-MM) | Si | Default: mes actual |
| Lectura Anterior | number | Si | Min: 0 |
| Lectura Actual | number | Si | Min: 0, >= lectura anterior |
| Consumo calculado | display (solo lectura) | — | actual - anterior. Muestra con unidad (kWh/m3) |
| Costo Total (COP) | number | Si | Min: 0. Moneda: COP |
| Notas | textarea (2 rows) | No | "Observaciones sobre la lectura..." |

### Unidades por Tipo

| Tipo | Unidad |
|------|--------|
| Electricidad | kWh |
| Agua | m3 |
| Gas | m3 |

### Acciones

| Boton | Estilo | Estado loading |
|-------|--------|----------------|
| Cancelar | outline | Cierra modal |
| Registrar Lectura | amber | "Registrando..." |

### Resultado

- **Exito:** Toast "Lectura registrada correctamente". Reset form, cierra modal
- **Error:** Toast con mensaje

## Data Source

| Query/Mutation | Datos |
|----------------|-------|
| `utilities.getByFacility({ facilityId })` | Lecturas (limite: 24) |
| `utilities.createReading(...)` | Crea lectura |
| `utilities.allocateToActiveBatches({ readingId })` | Proratea costo a batches |

## Componentes

| Componente | Archivo |
|-----------|---------|
| UtilityReadingsTable | `components/facilities/utility-readings-table.tsx` |
| UtilityReadingModal | `components/facilities/utility-reading-modal.tsx` |
