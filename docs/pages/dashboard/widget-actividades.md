# Widget Actividades — Actividades del Dia

## Vista General

Widget reutilizable que muestra actividades programadas para hoy y proximos dias. Tiene dos variantes segun el rol del usuario.

## Variantes

### Compact (Dashboard Admin)

3 contadores en fila horizontal:

| Contador | Color | Data |
|----------|-------|------|
| Pendientes | blue | Actividades programadas para hoy sin completar |
| Atrasadas | red si >0, gray si 0 | Actividades vencidas antes de hoy |
| Completadas | green | Actividades completadas hoy |

### Full (Dashboard Operativo)

Tres secciones con actividades detalladas:

#### 1. Atrasadas (condicional, solo si >0)

- Titulo: "Atrasadas ({count})"
- Card con borde rojo
- Lista de actividades vencidas

#### 2. Hoy

- Titulo: "Hoy — {fecha formateada}"
- Actividades agrupadas por nombre de lote
- Header de grupo: nombre del batch

#### 3. Proximos 3 Dias (colapsable)

- Titulo: "Proximos 3 dias ({count})"
- Icono ChevronDown que rota al expandir
- Contenido colapsable (CollapsibleContent)

## ActivityRow

Cada actividad en la variante full se muestra como un ActivityRow:

| Elemento | Detalle |
|----------|---------|
| Icono estado | completed: CheckCircle (green), skipped: SkipForward (yellow), overdue: AlertTriangle (red), pending: Clock (gray) |
| Nombre | Nombre del template o tipo de actividad (capitalizado) |
| Badge batch | Codigo de lote si disponible |
| Fecha/hora | Formato relativo (ej: "Hoy, 14:30") |
| Fase | Fase de cultivo si disponible |
| Duracion | Duracion estimada si disponible |

### Botones de Accion (solo si status = pending)

| Boton | Icono | Color | Accion |
|-------|-------|-------|--------|
| Reportar | ClipboardList | amber | Abre ActivityExecutionSheet |
| Saltar | SkipForward | yellow | Abre dialog de saltar |

## Modales

### Dialog Saltar Actividad

- Textarea para razon de salto (obligatoria)
- Botones: Cancelar / Saltar
- Al confirmar: ejecuta `skipMutation`

### Activity Execution Sheet

- Sheet modal completo para reportar/completar actividad
- Contexto pasado: templateId, scheduledActivityId, groupId, entityType, entityId, phase, batchIds
- Componente: `ActivityExecutionSheet` de `components/activities/activity-execution-sheet.tsx`

## Data Sources

| Query | Datos |
|-------|-------|
| `cultivationSchedules.getScheduledForDate({ companyId, dateStart, dateEnd })` | Actividades programadas para rango de fechas (hoy + proximos 3 dias) |
| `cultivationSchedules.getOverdue({ companyId, beforeDate })` | Actividades vencidas antes de la fecha |

## Componentes

| Componente | Archivo |
|-----------|---------|
| TodayActivitiesWidget | `components/dashboard/today-activities-widget.tsx` |
| ActivityExecutionSheet | `components/activities/activity-execution-sheet.tsx` |
