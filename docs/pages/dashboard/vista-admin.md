# Vista Admin — Dashboard Administrativo

## Vista General

Dashboard para usuarios con rol administrativo. Muestra vision global de la instalacion: KPIs de produccion, estado de ordenes, calidad de lotes, alertas, y tendencias de 14 dias.

## KPIs Overview

5 cards en grid responsive (sm:2 cols, lg:5 cols):

| KPI | Icono | Variante | Clickeable | Data Source |
|-----|-------|----------|------------|-------------|
| Ordenes Activas | ClipboardList | primary (green) | `/production?tab=orders` | `overview.activeOrders` |
| Plantas Totales | Leaf | default | No | `overview.totalPlants` |
| Lotes Activos | Layers | default | `/production` | `overview.activeBatches` |
| Areas en Uso | MapPin | default | `/areas` | `overview.areasInUse / overview.totalAreas` |
| Avance Promedio | TrendingUp | success (>50%) / warning (<=50%) | No | `production.averageCompletion` + "%" |

## Seccion Tres Columnas

Grid lg:3 cols con 3 cards:

### 1. Estado de Produccion

- Icono: Activity (green)
- 3 metricas con dot de color:
  - En Progreso (blue) — `production.ordersInProgress`
  - Pendientes (amber) — `production.ordersPending`
  - Completadas (green) — `production.ordersCompleted`
- Accion: "Ver todas las ordenes" → `/production?tab=orders`

### 2. Calidad de Lotes

- Icono: Heart (red)
- Metrica principal: Tasa de Mortalidad con barra de progreso animada
  - Verde: <5%, Amber: 5-15%, Rojo: >15%
- Metricas secundarias (grid 2 cols):
  - Saludables (green bg) — `quality.healthyBatches`
  - En Riesgo (amber bg) — `quality.warningBatches`
- Accion: "Ver lotes" → `/production`

### 3. Alertas Activas

- Icono: AlertTriangle (amber)
- Badge con conteo de alertas
- Muestra primeras 4 alertas con color por severidad:
  - critical: red, warning: amber, info: blue
- Cada alerta con mensaje + link opcional "Ver detalles"
- Estado vacio: checkmark verde + "Sin alertas pendientes"
- Si >4 alertas: boton "Ver todas ({total})"

## Widget Actividades (Variante Compacta)

3 contadores en fila: Pendientes (blue), Atrasadas (red si >0), Completadas (green).

Ver [widget-actividades.md](./widget-actividades.md) para detalle completo.

## Ordenes Recientes

- Card ancho completo con icono Clock
- Header: "Ordenes Recientes" + boton "Ver todas" → `/production?tab=orders`
- Lista de 5 ordenes mas recientes, cada una muestra:
  - Numero de orden (bold)
  - Status badge (planning/pending/active/completed/cancelled)
  - Cultivar o "Sin cultivar"
  - Barra progreso con porcentaje
  - Click → `/production/orders/{id}`
- Estado vacio: icono ClipboardList + opcion crear primera orden

## Trend Charts (Tendencias 14 dias)

Seccion inferior con titulo "Tendencias (Ultimos 14 dias)". Grid md:2 cols, lg:4 cols.

| Chart | Icono | Color | Tipo |
|-------|-------|-------|------|
| Ordenes Creadas | TrendingUp | green | AreaChart |
| Lotes Iniciados | Layers | blue | AreaChart |
| Actividades | Activity | purple | AreaChart |
| Salud de Lotes | Leaf | green | Barras horizontales (saludables/riesgo/criticos) |

- Formato fecha: "DD MMM" (ej: "15 feb")
- Tooltip en hover
- Gradient fill en area charts
- Skeleton loader mientras carga

## Data Sources

| Query | Datos |
|-------|-------|
| `home.getDashboard({ facilityId })` | overview, production, quality, alerts, recentOrders |
| `home.getDashboardTrends({ facilityId, days: 14 })` | productionTrend, batchTrend, activityTrend, plantHealthTrend |

## Componentes

| Componente | Archivo |
|-----------|---------|
| AdminDashboard | `components/home/admin-dashboard.tsx` |
| TrendCharts | `components/home/trend-charts.tsx` |
| TodayActivitiesWidget (compact) | `components/dashboard/today-activities-widget.tsx` |
