# Vista Operativo — Dashboard Operativo

## Vista General

Dashboard para usuarios con rol operativo. Enfocado en el trabajo diario: tareas pendientes, lotes asignados, proximas actividades, y acciones rapidas.

## Resumen del Dia

4 cards en grid responsive (sm:2 cols, lg:4 cols):

| Card | Icono | Variante | Clickeable | Data Source |
|------|-------|----------|------------|-------------|
| Tareas Pendientes | Clock | warning si >0 | No | `todaysTasks.pending` |
| Completadas Hoy | CheckCircle2 | success | No | `todaysTasks.completed` |
| Atrasadas | AlertTriangle | danger si >0 | No | `todaysTasks.overdue` |
| Lotes Asignados | Layers | default | `/production` | `quickStats.activeBatchesAssigned` |

## Progreso del Dia

- Card con gradiente green-50 → emerald-50
- **Solo visible si** `totalTasks > 0`
- Muestra: "{completed} de {totalTasks} tareas completadas"
- Porcentaje grande + circulo SVG animado de progreso
- Calculo en tiempo real desde todaysTasks

## Seccion Dos Columnas

Grid lg:2 cols:

### 1. Proximas Actividades

- Icono: Calendar (blue)
- Lista de 5 proximas actividades
- Cada actividad muestra:
  - Nombre del tipo (capitalizado)
  - Badge "Urgente" si prioridad alta
  - Icono reloj + fecha formateada ("Hoy, HH:MM" / "Manana, HH:MM" / "Lun, 15 feb HH:MM")
  - Tag con codigo de lote
- Estado vacio: icono Calendar + "No hay actividades programadas"
- Si >5 actividades: boton "Ver todas ({total})"

### 2. Actividades Completadas

- Icono: CheckSquare (green)
- Lista de actividades completadas recientemente
- Cada item:
  - CheckCircle2 (green)
  - Tipo de actividad (capitalizado)
  - Codigo de lote + hora de completado
  - Background green-50
- Estado vacio: "No hay actividades completadas hoy"

## Mis Lotes

- Card ancho completo con icono Layers (green)
- Header: "Mis Lotes" + boton "Ver todos" → `/production`
- Grid sm:2 cols, lg:3 cols
- Cada batch card muestra:
  - Codigo de lote (monospace, semibold)
  - Status badge (active/completed/cancelled/planning con colores)
  - Nombre del cultivar o "Sin cultivar"
  - Grid de metricas:
    - Leaf + "{plantsActive} plantas"
    - Clock + "{daysInProduction}d"
    - MapPin + nombre de area (si disponible)
  - Click → `/batches/{id}`
- Estado vacio: icono Layers + "No tienes lotes asignados"

## Acciones Rapidas

4 botones en grid (sm:2 cols, lg:4 cols):

| Accion | Icono | Destino | Extra |
|--------|-------|---------|-------|
| Iniciar Actividad | Play | `/activities/new` | — |
| Control de Calidad | ClipboardCheck | `/templates?tab=quality` | Badge rojo con conteo de checks pendientes |
| Ver Lotes | Layers | `/production` | — |
| Calendario | Calendar | `/activities` | — |

## Widget Actividades (Variante Full)

Secciones colapsables con actividades agrupadas por dia. Incluye botones de reportar y saltar actividades.

Ver [widget-actividades.md](./widget-actividades.md) para detalle completo.

## Data Source

| Query | Datos |
|-------|-------|
| `home.getDashboard({ facilityId })` | todaysTasks, myBatches, upcomingActivities, recentCompletedActivities, quickStats |

## Componentes

| Componente | Archivo |
|-----------|---------|
| OperativeDashboard | `components/home/operative-dashboard.tsx` |
| TodayActivitiesWidget (full) | `components/dashboard/today-activities-widget.tsx` |
