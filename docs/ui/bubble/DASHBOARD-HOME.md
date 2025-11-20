# DASHBOARD HOME - UI REQUIREMENTS

**Focus**: Main landing page after onboarding completion
**Database**: See [../../database/SCHEMA.md](../../database/SCHEMA.md)
**API Endpoints**: See [../../api/PHASE-2-ENDPOINTS.md](../../api/PHASE-2-ENDPOINTS.md)

---

## Overview

The Dashboard Home is the primary landing page after users complete onboarding. It serves as the operational hub, providing facility-specific context, role-based information, and quick access to key operations.

**Page Name**: `dashboard-home` or `index`
**Facility Context**: Global - All data scoped to `Current User > currentFacilityId`
**Access**: All authenticated users (role-specific content)

---

## Page Structure

```
┌─────────────────────────────────────────────────────────┐
│ Header: [Facility Switcher] 🌱 Cannabis  👤 User Menu  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ┌────────────────────────────────────────────────────┐ │
│ │ 👋 Bienvenido, Juan                                │ │
│ │ North Farm • Cannabis                              │ │
│ │ 📅 Lunes, 27 de Octubre, 2025                      │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌──────────── MÉTRICAS RÁPIDAS ─────────────────────┐ │
│ │ ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐           │ │
│ │ │ 5    │  │ 1,234│  │ 8    │  │ 3    │           │ │
│ │ │Lotes │  │Plants│  │Areas │  │⚠Alert│           │ │
│ │ │Activ.│  │Active│  │Active│  │      │           │ │
│ │ └──────┘  └──────┘  └──────┘  └──────┘           │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌──────────── ACCESOS RÁPIDOS ──────────────────────┐ │
│ │ [📋 Nueva Orden] [🌿 Areas] [📦 Inventario]       │ │
│ │ [✓ QC Check]    [🌱 Lotes] [📊 Reportes]          │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌──────────── ACTIVIDADES HOY ──────────────────────┐ │
│ │ 🔴 Vence Ahora (2)                                │ │
│ │ • Riego - Lote-2025-001 (Veg A)                   │ │
│ │   [Registrar] [Posponer]                          │ │
│ │ • Inspección - Lote-2025-003 (Flor B)             │ │
│ │   [Registrar] [Posponer]                          │ │
│ │                                                    │ │
│ │ 🟡 Próximas (5)                                    │ │
│ │ • 14:00 - Alimentación - Lote-2025-002            │ │
│ │ • 16:30 - Monitoreo Ambiental                     │ │
│ │ [Ver Todas]                                        │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌──────────── LOTES ACTIVOS ────────────────────────┐ │
│ │ ┌──────────────┐  ┌──────────────┐               │ │
│ │ │Lote-2025-001 │  │Lote-2025-002 │               │ │
│ │ │Cherry AK     │  │White Widow   │               │ │
│ │ │200 plantas   │  │150 plantas   │               │ │
│ │ │Vegetativo W3 │  │Propagación W1│               │ │
│ │ │[Ver Detalles]│  │[Ver Detalles]│               │ │
│ │ └──────────────┘  └──────────────┘               │ │
│ │ [Ver Todos los Lotes]                              │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌──────────── ALERTAS E INSIGHTS ───────────────────┐ │
│ │ 🤖 IA Recomienda:                                  │ │
│ │ • Lote-2025-001 listo para Floración en 3-4 días │ │
│ │ • Nutriente A se agotará en 5 días                │ │
│ │ [Ver Más Insights]                                 │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Header Components

### Facility Switcher

**Element**: `dropdown_facility_switcher`
- **Location**: Top left of header (global component)
- **Type**: Dropdown
- **Data Source**: API Call `call_getUserFacilities`
  - Parameter: `userId` = `Current User > _id`
- **Display**: "North Farm" with crop icon
- **On Change Workflow**:
  1. Update `Current User > currentFacilityId` = selected facility `_id`
  2. Refresh entire page with new facility context
  3. Navigate to dashboard

### User Menu

**Element**: `btn_user_menu`
- **Location**: Top right of header
- **Display**: User name + avatar
- **Dropdown Options**:
  - Mi Perfil
  - Configuraciones
  - Usuarios (Admin only)
  - Instalaciones (Admin only)
  - Cerrar Sesión

---

## Welcome Section

**Group**: `group_welcome`

**Elements**:
- `text_welcome`: "👋 Bienvenido, {User First Name}"
- `text_facility_context`: "{Facility Name} • {Primary Crop Type}"
- `text_current_date`: "Lunes, 27 de Octubre, 2025"

**Data Binding**:
- User name from `Current User > firstName`
- Facility name from `Current User > currentFacility > name`
- Crop type from `Current User > currentFacility > primary_crop_types`

---

## Quick Metrics Section

**Group**: `group_quick_metrics`

**Repeating Group** (or individual metric cards): `rg_metrics` or individual `group_metric_{name}`

**Metrics Cards**:

1. **Active Batches**: `group_metric_batches`
   - `text_metric_value`: "5"
   - `text_metric_label`: "Lotes Activos"
   - **Data**: Count of batches with status = "active"
   - **Click**: Navigate to `production-orders`

2. **Active Plants**: `group_metric_plants`
   - `text_metric_value`: "1,234"
   - `text_metric_label`: "Plantas Activas"
   - **Data**: Sum of `current_quantity` across all active batches
   - **Click**: Navigate to `production-orders`

3. **Active Areas**: `group_metric_areas`
   - `text_metric_value`: "8"
   - `text_metric_label`: "Areas Activas"
   - **Data**: Count of areas with status = "active"
   - **Click**: Navigate to `areas-list`

4. **Alerts**: `group_metric_alerts`
   - `text_metric_value`: "3"
   - `text_metric_label`: "⚠ Alertas"
   - **Data**: Count of:
     - Overdue activities
     - Low stock items (< reorder point)
     - Failed QC checks (last 7 days)
   - **Click**: Navigate to alerts page
   - **Style**: Red if > 0

**Workflow: Load Metrics**
- **Trigger**: Page is loaded
- **Steps**:
  1. API Call `call_getDashboardMetrics`
     - Parameter: `facilityId` = `Current User > currentFacilityId`
  2. Display metrics in cards

---

## Quick Access Section

**Group**: `group_quick_access`

**Buttons** (2 rows, 3 columns):

**Row 1**:
1. `btn_quick_new_order`: "📋 Nueva Orden"
   - Navigate to `production-order-create`
2. `btn_quick_areas`: "🌿 Areas"
   - Navigate to `areas-list`
3. `btn_quick_inventory`: "📦 Inventario"
   - Navigate to `inventory-dashboard`

**Row 2**:
1. `btn_quick_qc`: "✓ QC Check"
   - Navigate to `quality-checks`
2. `btn_quick_batches`: "🌱 Lotes"
   - Navigate to `production-orders`
3. `btn_quick_reports`: "📊 Reportes"
   - Navigate to `reports-dashboard`

**Note**: Button visibility controlled by user role permissions

---

## Activities Today Section

**Group**: `group_activities_today`

**Section 1: Overdue Activities**

**Repeating Group**: `rg_activities_overdue`
- **Header**: `text_overdue_header` - "🔴 Vence Ahora (2)"
- **Data Source**: API Call `call_getTodayActivities`
  - Parameter: `facilityId` = `Current User > currentFacilityId`
  - Filter: `status` = "overdue"
- **Item Layout**: `group_activity_card`
  - `text_activity_type`: "Riego"
  - `text_batch_info`: "Lote-2025-001 (Veg A)"
  - `btn_log_activity`: "Registrar"
    - Action: Open `popup_log_activity` with pre-filled data
  - `btn_snooze_activity`: "Posponer"
    - Action: Snooze activity for X hours

**Section 2: Upcoming Activities**

**Repeating Group**: `rg_activities_upcoming`
- **Header**: `text_upcoming_header` - "🟡 Próximas (5)"
- **Data Source**: Same API call, filter: `status` = "pending" AND `scheduled_date` = today
- **Item Layout**:
  - `text_scheduled_time`: "14:00"
  - `text_activity_description`: "Alimentación - Lote-2025-002"

**Button**: `btn_view_all_activities` - "Ver Todas"
- Navigate to activities calendar/list page

---

## Active Batches Section

**Group**: `group_active_batches`

**Repeating Group**: `rg_active_batches`
- **Data Source**: API Call `call_getActiveBatches`
  - Parameter: `facilityId` = `Current User > currentFacilityId`
  - Limit: 4 most recent
- **Layout**: Grid (2 columns)
- **Item Layout**: `group_batch_card`
  - `text_batch_number`: "Lote-2025-001"
  - `text_cultivar_name`: "Cherry AK"
  - `text_quantity`: "200 plantas"
  - `text_current_phase`: "Vegetativo W3"
  - `btn_view_batch`: "Ver Detalles"
    - Navigate to `production-order-detail?id={batch_id}`

**Button**: `btn_view_all_batches` - "Ver Todos los Lotes"
- Navigate to `production-orders`

---

## Alerts & Insights Section

**Group**: `group_ai_insights`

**Header**: `text_insights_header` - "🤖 IA Recomienda:"

**Repeating Group**: `rg_ai_insights`
- **Data Source**: API Call `call_getDashboardInsights`
  - Parameter: `facilityId` = `Current User > currentFacilityId`
  - Limit: 3 top priority insights
- **Item Layout**: `group_insight_item`
  - `text_insight_message`: "Lote-2025-001 listo para Floración en 3-4 días"
  - `icon_insight_type`: Icon based on insight type (🎯, ⚠️, 📈, etc.)

**Button**: `btn_view_all_insights` - "Ver Más Insights"
- Navigate to AI insights dashboard

---

## Role-Specific Content

### For ADMIN & FACILITY_MANAGER

**Additional Sections**:
- **Facility Overview**:
  - Total area utilization %
  - Total active batches value estimate
  - Compliance status
- **Quick Actions**:
  - Invite user
  - Add facility (if plan allows)
  - Generate compliance report

### For PRODUCTION_SUPERVISOR

**Focus**:
- Production orders status
- Team task assignments
- Quality check results summary

### For WORKER

**Focus**:
- My assigned activities today
- Recent activities logged by me
- Quick log button (prominent)

### For QUALITY_CONTROLLER

**Focus**:
- Pending QC checks
- Recent failed checks
- Compliance metrics

---

## Empty State (New User / No Data)

**Condition**: When facility has no active batches or scheduled activities

**Display**: `group_empty_state`

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│              🌱 ¡Comienza tu Primera Operación!         │
│                                                          │
│  Tu instalación está configurada y lista para usar.     │
│                                                          │
│  Para comenzar:                                          │
│  1. ✓ Crea tus Areas de Cultivo                         │
│  2. ✓ Agrega tus Cultivares                             │
│  3. □ Crea una Plantilla de Producción                  │
│  4. □ Inicia tu Primera Orden de Producción             │
│                                                          │
│  [📋 Crear Plantilla] [🌱 Nueva Orden de Producción]   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Elements**:
- `text_empty_header`: "¡Comienza tu Primera Operación!"
- `text_empty_description`: Instructions
- **Checklist**: Shows what's completed
  - ✓ Areas created (if any exist)
  - ✓ Cultivars added (if any exist)
  - □ Template created (if none exist)
  - □ Order created (if none exist)
- `btn_empty_create_template`: "Crear Plantilla"
- `btn_empty_create_order`: "Nueva Orden de Producción"

---

## Workflows

### Workflow: Load Dashboard
- **Trigger**: Page is loaded
- **Steps**:
  1. Verify `Current User > currentFacilityId` is set
     - If not set: Navigate to facility selection page
  2. Load all dashboard sections in parallel:
     - `call_getDashboardMetrics`
     - `call_getTodayActivities`
     - `call_getActiveBatches`
     - `call_getDashboardInsights`
  3. Display role-specific content based on `Current User > role`

### Workflow: Switch Facility
- **Trigger**: `dropdown_facility_switcher` value changes
- **Steps**:
  1. Update `Current User > currentFacilityId` = selected value
  2. Reload all dashboard data with new facility context
  3. Show loading indicator during refresh

### Workflow: Quick Log Activity
- **Trigger**: `btn_log_activity` is clicked on overdue activity
- **Steps**:
  1. Show `popup_log_activity`
  2. Pre-fill activity data (batch, type, scheduled date)
  3. User completes form and submits
  4. On success:
     - Close popup
     - Refresh activities section
     - Show success message
     - Update metrics

---

## Database Context

### Reads From:
- **facilities** table
  - Gets: current facility details
- **batches** table
  - Gets: active batches for metrics and cards
- **scheduled_activities** table
  - Gets: today's activities (overdue + upcoming)
- **areas** table
  - Gets: active areas count
- **inventory_items** table
  - Gets: low stock alerts
- **quality_check_records** table
  - Gets: recent failed checks for alerts

### API Calls:
- `call_getDashboardMetrics` (GET)
  - Returns: activeBatches, totalPlants, activeAreas, alertsCount
- `call_getTodayActivities` (GET)
  - Returns: Array of activities with status, scheduled time, batch info
- `call_getActiveBatches` (GET)
  - Returns: Array of active batches with current phase, quantity
- `call_getDashboardInsights` (GET)
  - Returns: Array of AI-generated insights and recommendations
- `call_getUserFacilities` (GET)
  - Returns: Array of facilities user has access to

---

## UI Translations

| Elemento | Español | English | Key |
|----------|---------|---------|-----|
| Welcome Text | Bienvenido | Welcome | dashboard_welcome |
| Active Batches | Lotes Activos | Active Batches | dashboard_active_batches |
| Active Plants | Plantas Activas | Active Plants | dashboard_active_plants |
| Active Areas | Areas Activas | Active Areas | dashboard_active_areas |
| Alerts | Alertas | Alerts | dashboard_alerts |
| Quick Access | ACCESOS RÁPIDOS | QUICK ACCESS | dashboard_quick_access |
| New Order | Nueva Orden | New Order | dashboard_new_order |
| Areas | Areas | Areas | dashboard_areas |
| Inventory | Inventario | Inventory | dashboard_inventory |
| QC Check | Control de Calidad | QC Check | dashboard_qc_check |
| Batches | Lotes | Batches | dashboard_batches |
| Reports | Reportes | Reports | dashboard_reports |
| Activities Today | ACTIVIDADES HOY | ACTIVITIES TODAY | dashboard_activities_today |
| Overdue Now | Vence Ahora | Overdue Now | dashboard_overdue_now |
| Upcoming | Próximas | Upcoming | dashboard_upcoming |
| Log Activity | Registrar | Log | dashboard_log_activity |
| Snooze | Posponer | Snooze | dashboard_snooze |
| View All | Ver Todas | View All | dashboard_view_all |
| Active Batches Section | LOTES ACTIVOS | ACTIVE BATCHES | dashboard_batches_section |
| View Details | Ver Detalles | View Details | dashboard_view_details |
| View All Batches | Ver Todos los Lotes | View All Batches | dashboard_view_all_batches |
| AI Recommends | IA Recomienda: | AI Recommends: | dashboard_ai_recommends |
| View More Insights | Ver Más Insights | View More Insights | dashboard_view_more_insights |
| Empty State Header | ¡Comienza tu Primera Operación! | Start Your First Operation! | dashboard_empty_header |
| Empty State Description | Tu instalación está configurada y lista para usar. | Your facility is configured and ready to use. | dashboard_empty_description |
| To Begin | Para comenzar: | To begin: | dashboard_to_begin |
| Create Template | Crear Plantilla | Create Template | dashboard_create_template |

---

## Responsive Design

### Desktop (1200px+)
- 3-column layout for quick access
- 2-column layout for batch cards
- Full metrics bar (4 metrics visible)

### Tablet (768px - 1199px)
- 2-column layout for quick access
- Single column for batch cards
- Scrollable metrics bar

### Mobile (<768px)
- Single column for all sections
- Stacked metrics (2x2 grid)
- Simplified quick access (most important 4 buttons)
- Collapsible sections

---

## Navigation Structure

```
Dashboard (Home)
├─→ Areas Management → areas-list
├─→ Cultivares → cultivars-list
├─→ Proveedores → suppliers-list
├─→ Inventario → inventory-dashboard
├─→ Órdenes de Producción → production-orders
├─→ Plantillas → production-templates
├─→ Controles de Calidad → quality-checks
├─→ Insights IA → ai-insights
└─→ Configuraciones
    ├─→ Usuarios → users-management
    ├─→ Instalaciones → facilities-management
    └─→ Mi Perfil → user-profile
```

---

## Notes

- **Facility Context**: All data on this page is filtered by `Current User > currentFacilityId`
- **Real-time Updates**: Consider implementing periodic refresh (every 2-5 minutes) for activities and alerts
- **Performance**: Use caching for metrics that don't change frequently
- **Progressive Enhancement**: Start with basic sections, add insights/AI features progressively
- **Accessibility**: Ensure all alerts are screen-reader friendly with proper ARIA labels

---

**Status**: Dashboard home page requirements complete
**Next Steps**:
1. Build page in Bubble following this structure
2. Connect API calls for all dashboard sections
3. Implement role-based content visibility
4. Test facility switching functionality
5. Optimize loading performance

---

**Última actualización**: 2025-11-17
