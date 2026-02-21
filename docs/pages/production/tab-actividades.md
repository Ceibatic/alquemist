# Tab Actividades — Calendario

## Vista General

Vista tipo calendario de actividades programadas (`scheduled_activities`). Tres modos de visualizacion:

| Vista | Descripcion |
|-------|-------------|
| Semana (default) | 7 columnas Lun-Dom con pills de actividad por dia |
| Dia | Listado tipo agenda agrupado por status |
| Mes | Grid 7x6 con max 3 pills por celda + overflow |

## Toolbar

| Zona | Contenido |
|------|-----------|
| Izquierda | Botones prev/next + "Hoy" + label fecha |
| Centro | ToggleGroup: Dia / Semana / Mes |
| Derecha | Boton amber "Nueva actividad" → `/production/activities/new` |

### Labels de fecha segun vista

- **Dia**: "Jue 20 Feb 2026"
- **Semana**: "17 - 23 Feb 2026"
- **Mes**: "Febrero 2026"

## Vista Semana

- Header: 7 columnas con nombre dia + fecha, columna de hoy con borde amber
- Cada columna: lista vertical scrollable de `CalendarActivityPill`
- Seccion "Vencidas" arriba del header si hay actividades overdue (fondo red-50)

## Vista Dia (Agenda)

- Listado vertical de todas las actividades del dia
- Agrupadas por status:
  1. Vencidas (fondo red-50) — pending con fecha < hoy
  2. Pendientes
  3. En Progreso
  4. Completadas (opacity reducida)
  5. Saltadas (opacity reducida)
- Cada item muestra: nombre, tipo (badge), lote, area, asignado, prioridad

## Vista Mes

- Grid 7x6 celdas
- Max 3 pills por celda, luego badge "+N mas"
- Click en "+N mas" → cambia a vista dia de esa fecha
- Celda de hoy con fondo amber-50
- Celdas fuera del mes actual con opacity reducida

## CalendarActivityPill

Chip reutilizable por todas las vistas:

| Propiedad | Contenido |
|-----------|-----------|
| Color dot | Status: amber=pending, blue=in_progress, green=completed, gray=skipped, red=overdue |
| Texto | Nombre actividad (truncado) |
| Badge | Codigo lote (si cabe en el espacio) |
| Modo compacto | Solo dot + nombre (usado en vista mes) |

## Data Source

- Query: `scheduledActivities.listForSchedule` con scope `{ type: 'global' }`
- Filtros: rango de fechas (calculado segun vista), status, tipo de actividad
- Limite: 200 actividades por consulta

## Interacciones

- Click en actividad → navega a `/production/activities/[id]`
- Click "Nueva actividad" → navega a `/production/activities/new`
- Prev/Next → navega al periodo anterior/siguiente
- "Hoy" → vuelve a la fecha actual
- Toggle vista → cambia entre dia/semana/mes manteniendo la fecha

## Componentes

| Componente | Archivo |
|-----------|---------|
| ActivitiesTab | `components/production/activities-tab.tsx` |
| CalendarToolbar | `components/production/calendar-toolbar.tsx` |
| ActivityCalendar | `components/production/activity-calendar.tsx` |
| CalendarWeekView | `components/production/calendar-week-view.tsx` |
| CalendarDayView | `components/production/calendar-day-view.tsx` |
| CalendarMonthView | `components/production/calendar-month-view.tsx` |
| CalendarActivityPill | `components/production/calendar-activity-pill.tsx` |
