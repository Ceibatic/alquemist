# PHASE 4: PRODUCTION EXECUTION

## Overview

Phase 4 focuses on creating and executing production orders based on templates. This includes:
1. **Production Orders** - Creating orders from templates with auto-scheduled activities
2. **Activity Execution** - Recording work, collecting data, AI-powered pest detection

Production orders transform templates into actionable work plans with specific dates, assigned personnel, and tracked progress.

## Module Overview

| Module | Page Name | Description |
|--------|-----------|-------------|
| 24 | Production Orders | Create and manage production orders with auto-scheduled activities |
| 25 | Activity Execution | Execute activities with data collection, photos, quality checks, and AI pest detection |

## Internationalization

All UI text should support both English and Spanish. See translation tables in each module.

---

## MODULE 24: Production Orders with Auto-Scheduling

### Purpose
Enable users to create production orders from templates, automatically scheduling all activities based on the template's timing rules. Managers verify resource availability and initiate phases, while workers execute assigned activities.

### Navigation
- **Path**: Dashboard → Production Orders
- **Access**:
  - Create: Administrators, Production Managers
  - View: All facility users
  - Execute: Assigned workers
- **Related Modules**:
  - MODULE 22 (Production Templates - source for orders)
  - MODULE 25 (Activity Execution - where work happens)
  - MODULE 8 (Areas - for availability verification)

---

### Page 1: Production Orders List

**Visual Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ 🏠 Inicio > Órdenes de Producción        [+ Nueva Orden]   │
├─────────────────────────────────────────────────────────────┤
│ 📊 Activas: 8  |  ⏳ Pendientes: 3  |  ✅ Completadas: 45   │
├─────────────────────────────────────────────────────────────┤
│ [Todas] [Activas] [Pendientes] [Completadas] [Canceladas]  │
├─────────────────────────────────────────────────────────────┤
│ 🔍 Buscar órdenes...                      [Filtros ▾]      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 🌿 ORD-2025-047: Propagación Cherry AK       [⋮]      │ │
│ │ Estado: 🟢 Activa - Fase 2/5 (Vegetativo)              │ │
│ │ Template: Propagación Cannabis Medicinal               │ │
│ │ Inicio: 10/03/2025  |  Fin estimado: 08/07/2025        │ │
│ │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━░░░░░░░░░ 45% (54/120 días)│ │
│ │ 📅 Actividades: 12/47 completadas  |  2 atrasadas      │ │
│ │ 👤 Responsables: Juan, María (3 más)                   │ │
│ │ [Ver Orden]  [Actividades]  [Timeline]                 │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 🥬 ORD-2025-048: Cultivo Lechuga Lote 3      [⋮]      │ │
│ │ Estado: ⏳ Pendiente - Esperando aprobación manager    │ │
│ │ Template: Cultivo Lechuga Hidropónica                  │ │
│ │ Creado: 15/03/2025  |  Duración: 35 días               │ │
│ │ 📋 Requiere: Área Hidropónico (10m²)                   │ │
│ │ 👤 Creado por: Admin Usuario                           │ │
│ │ [Verificar Disponibilidad]  [Aprobar]  [Rechazar]      │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 🌿 ORD-2025-046: Propagación Mix Variedades  [⋮]      │ │
│ │ Estado: ✅ Completada                                  │ │
│ │ Template: Propagación Cannabis Medicinal               │ │
│ │ Inicio: 01/01/2025  |  Fin: 02/05/2025 (4 días antes) │ │
│ │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100% (116/120 días)│ │
│ │ 📅 Actividades: 47/47 completadas                      │ │
│ │ [Ver Reporte]  [Exportar]  [Duplicar]                  │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Bubble Elements:**

| Element Name | Type | Data Source / Value |
|--------------|------|---------------------|
| `rg_production_orders` | Repeating Group | API: `call_getProductionOrdersByFacility` |
| `text_order_code` | Text | `Current cell's Production Order > orderCode` |
| `text_order_name` | Text | `Current cell's Production Order > name` |
| `text_status` | Text | `Current cell's Production Order > status` |
| `icon_status` | Icon | 🟢 active, ⏳ pending, ✅ completed, ❌ cancelled |
| `text_current_phase` | Text | `Current cell's Production Order > currentPhase > name` |
| `text_template_name` | Text | `Current cell's Production Order > template > name` |
| `text_start_date` | Text | `Current cell's Production Order > startDate` |
| `text_estimated_end` | Text | `Current cell's Production Order > estimatedEndDate` |
| `progress_bar` | Progress Bar | Calculated: `(daysPassed / totalDays) * 100` |
| `text_progress_percentage` | Text | Progress percentage |
| `text_activities_completed` | Text | `completedActivities / totalActivities` |
| `text_overdue_activities` | Text | Count of overdue activities |
| `text_assigned_users` | Text | List of assigned users (truncated) |
| `btn_add_order` | Button | Show create order popup |
| `btn_view_order` | Button | Navigate to order detail page |
| `btn_view_activities` | Button | Navigate to activities page |
| `btn_view_timeline` | Button | Show timeline visualization |
| `btn_verify_availability` | Button | Check area availability (conditional) |
| `btn_approve_order` | Button | Manager approves order (conditional) |
| `btn_reject_order` | Button | Manager rejects order (conditional) |
| `btn_view_report` | Button | Show completion report (conditional) |
| `btn_export_order` | Button | Export order data |
| `btn_duplicate_order` | Button | Create new order from this one |
| `dropdown_status_filter` | Dropdown | All, Active, Pending, Completed, Cancelled |
| `input_search_orders` | Input | Search by code or name |

**Workflows:**

**Workflow: Load Production Orders**
- **Trigger**: Page load
- **Step 1**: API Call `call_getProductionOrdersByFacility`
  - Parameters:
    - `facilityId`: `Current User > currentFacilityId`
    - `statusFilter`: `dropdown_status_filter's value`
    - `searchQuery`: `input_search_orders's value`
- **Step 2**: Display in repeating group
- **Step 3**: Update status counters in header

**Workflow: Create New Order**
- **Trigger**: `btn_add_order` is clicked
- **Action**: Show popup `popup_create_production_order`

**Workflow: Approve Production Order**
- **Trigger**: `btn_approve_order` is clicked (manager only)
- **Step 1**: Verify area availability for first phase
- **Step 2**: Show confirmation with area assignments
- **Step 3**: API Call `call_approveProductionOrder`
  - Parameters:
    - `orderId`: `Current cell's Production Order > _id`
    - `approvedBy`: `Current User > _id`
    - `startDate`: Manager can adjust start date
- **Step 4**: Auto-schedule all activities based on start date
- **Step 5**: Refresh list, show success message

**Workflow: Reject Production Order**
- **Trigger**: `btn_reject_order` is clicked (manager only)
- **Step 1**: Show rejection reason input
- **Step 2**: API Call `call_rejectProductionOrder`
  - Parameters:
    - `orderId`: `Current cell's Production Order > _id`
    - `rejectedBy`: `Current User > _id`
    - `reason`: Input from manager
- **Step 3**: Update status, notify creator

---

### Popup: Create Production Order

**Visual Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│           Crear Nueva Orden de Producción            [✕]   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Template de Producción *                                    │
│ [Seleccionar template ▾]                                    │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 📋 Template Seleccionado: Propagación Cannabis         │ │
│ │ • 5 fases  |  47 actividades  |  120 días estimados    │ │
│ │ • Requiere: Área Propagación → Vegetativo → Floración │ │
│ │ [Ver Detalle del Template]                             │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ Nombre de la Orden *                                        │
│ [Propagación Cherry AK - Lote 15__________________]        │
│                                                              │
│ Cultivar *                     Cantidad (plantas) *         │
│ [Cherry AK ▾]                  [100___]                     │
│                                                              │
│ Fecha de Inicio Deseada *                                   │
│ [__/__/____]                                                │
│ ℹ️ Las actividades se programarán automáticamente desde    │
│    esta fecha según el template.                            │
│                                                              │
│ Responsable Principal *         Equipo de Trabajo           │
│ [Juan Manager ▾]                [María] [Pedro] [+ Agregar] │
│                                                              │
│ Prioridad                       Lote/Batch                  │
│ [Media ▾]                       [BATCH-2025-015]            │
│                                                              │
│ Notas / Instrucciones Especiales                           │
│ [_____________________________________________________]     │
│ [_____________________________________________________]     │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 📊 INVENTARIO PROYECTADO (desde template)              │ │
│ │                                                         │ │
│ │ Materiales:                                             │ │
│ │ • Sustrato: 50 kg  (Disponible: 120 kg) ✅             │ │
│ │ • Nutriente A: 2 L  (Disponible: 5 L) ✅               │ │
│ │ • Bandejas: 10 uds  (Disponible: 8 uds) ⚠️             │ │
│ │                                                         │ │
│ │ Equipamiento:                                           │ │
│ │ • Lámparas LED: 4 uds  (Disponibles) ✅                │ │
│ │ • Sistema riego: 1 ud  (Disponible) ✅                 │ │
│ │                                                         │ │
│ │ ⚠️ Algunos items están por debajo del stock disponible │ │
│ │ [Ajustar Cantidades]  [Ver Inventario Completo]        │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ☐ Enviar orden directamente (sin aprobación de manager)    │
│   Solo administradores pueden activar esta opción           │
│                                                              │
│                    [Cancelar]  [Crear Orden de Producción] │
└─────────────────────────────────────────────────────────────┘
```

**Bubble Elements:**

| Element Name | Type | Value |
|--------------|------|-------|
| `popup_create_production_order` | Popup | - |
| `dropdown_template` | Dropdown | API: `call_getProductionTemplatesByFacility` |
| `group_template_info` | Group | Conditional: visible when template selected |
| `text_template_phases` | Text | `dropdown_template's value > phases:count` |
| `text_template_activities` | Text | `dropdown_template's value > totalActivities` |
| `text_template_duration` | Text | `dropdown_template's value > estimatedDurationDays` |
| `text_required_areas` | Text | Calculated from template phases |
| `btn_view_template_detail` | Button | Open template in new tab/lightbox |
| `input_order_name` | Input | Text |
| `dropdown_cultivar` | Dropdown | API: `call_getCultivarsByFacility` |
| `input_quantity` | Input | Number (plants, units, etc.) |
| `input_start_date` | Date Picker | Date |
| `dropdown_responsible` | Dropdown | API: `call_getUsersByFacility` (role: manager/supervisor) |
| `rg_team_members` | Repeating Group | Custom list of selected users |
| `btn_add_team_member` | Button | Add user to team |
| `dropdown_priority` | Dropdown | Static: Low, Medium, High, Critical |
| `input_batch_code` | Input | Text (auto-generated or manual) |
| `input_notes` | Multi-line Input | Text |
| `group_projected_inventory` | Group | Display inventory from template |
| `rg_materials` | Repeating Group | Calculated from template |
| `text_material_name` | Text | Material name |
| `text_projected_qty` | Text | Required quantity |
| `text_available_qty` | Text | From inventory |
| `icon_availability_status` | Icon | ✅ sufficient, ⚠️ low, ❌ insufficient |
| `btn_adjust_quantities` | Button | Open inventory adjustment |
| `btn_view_full_inventory` | Button | Show detailed inventory modal |
| `checkbox_skip_approval` | Checkbox | Boolean (conditional: admin only) |
| `btn_cancel_create` | Button | Hide popup |
| `btn_submit_create_order` | Button | Create production order |

**Workflow: Submit Create Production Order**
- **Trigger**: `btn_submit_create_order` is clicked
- **Step 1**: Validate required fields
- **Step 2**: Check inventory availability
- **Step 3**: API Call `call_createProductionOrder`
  - Parameters:
    - `facilityId`: `Current User > currentFacilityId`
    - `templateId`: `dropdown_template's value`
    - `name`: `input_order_name's value`
    - `cultivarId`: `dropdown_cultivar's value`
    - `quantity`: `input_quantity's value`
    - `requestedStartDate`: `input_start_date's value`
    - `responsibleUserId`: `dropdown_responsible's value`
    - `teamMembers`: Array of user IDs from `rg_team_members`
    - `priority`: `dropdown_priority's value`
    - `batchCode`: `input_batch_code's value`
    - `notes`: `input_notes's value`
    - `skipApproval`: `checkbox_skip_approval's value`
- **Step 4** (If skipApproval = true): Auto-schedule activities immediately
- **Step 4** (If skipApproval = false): Set status to "pending", notify manager
- **Step 5**: Hide popup, navigate to order detail page
- **Step 6**: Show success message

---

### Page 2: Production Order Detail

**Visual Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ 🏠 > Órdenes > ORD-2025-047                          [←]   │
├─────────────────────────────────────────────────────────────┤
│ 🌿 Propagación Cherry AK - Lote 15                   [⋮]   │
│ Estado: 🟢 ACTIVA - Fase 2/5 (Vegetativo)                  │
├─────────────────────────────────────────────────────────────┤
│ [📊 Resumen] [📅 Actividades] [📈 Timeline] [📦 Inventario]│
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌─── INFORMACIÓN GENERAL ──────────────────────────────────┐│
│ │ Template: Propagación Cannabis Medicinal                 ││
│ │ Cultivar: Cherry AK  |  Cantidad: 100 plantas            ││
│ │ Prioridad: Media  |  Batch: BATCH-2025-015               ││
│ │                                                           ││
│ │ Inicio: 10/03/2025  |  Fin estimado: 08/07/2025          ││
│ │ Duración total: 120 días                                 ││
│ │                                                           ││
│ │ Responsable: Juan Manager                                ││
│ │ Equipo: María García, Pedro López, Ana Ruiz (3)          ││
│ │                                                           ││
│ │ [Editar Información]  [Reasignar Personal]               ││
│ └──────────────────────────────────────────────────────────┘│
│                                                              │
│ ┌─── PROGRESO GENERAL ─────────────────────────────────────┐│
│ │ Días transcurridos: 54 / 120 (45%)                       ││
│ │ ━━━━━━━━━━━━━━━━━━━━━━━━━━░░░░░░░░░░░░░░░░░░░░          ││
│ │                                                           ││
│ │ Actividades: 12 / 47 completadas (25.5%)                 ││
│ │ ━━━━━━━━━━━░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░              ││
│ │                                                           ││
│ │ 📊 Estado de Actividades:                                ││
│ │ • ✅ Completadas: 12  |  🔄 En progreso: 2               ││
│ │ • ⏰ Programadas: 31   |  ⚠️ Atrasadas: 2                ││
│ │                                                           ││
│ │ [Ver Actividades Atrasadas]  [Exportar Reporte]          ││
│ └──────────────────────────────────────────────────────────┘│
│                                                              │
│ ┌─── FASES DE PRODUCCIÓN ──────────────────────────────────┐│
│ │                                                           ││
│ │ ✅ 1. Propagación                                        ││
│ │    10/03 - 31/03 (21 días)  |  12/12 actividades ✅      ││
│ │    Área: Propagación A1                                  ││
│ │    [Ver Detalle]                                         ││
│ │                                                           ││
│ │ 🔄 2. Vegetativo                                         ││
│ │    01/04 - 01/05 (30 días)  |  2/18 actividades          ││
│ │    Área: Vegetativo B3                                   ││
│ │    ━━━━░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 11%              ││
│ │    [Ver Actividades] [Completar Fase]                    ││
│ │                                                           ││
│ │ ⏳ 3. Floración                                          ││
│ │    02/05 - 01/07 (60 días)  |  0/15 actividades          ││
│ │    Área: Floración C1 (Reservada)                        ││
│ │    Inicia: En 7 días                                     ││
│ │                                                           ││
│ │ ⏳ 4. Pre-Cosecha                                        ││
│ │    02/07 - 05/07 (3 días)  |  0/1 actividad              ││
│ │    Inicia: Después de Fase 3                             ││
│ │                                                           ││
│ │ ⏳ 5. Cosecha                                            ││
│ │    06/07 - 08/07 (2 días)  |  0/1 actividad              ││
│ │    Inicia: Después de Fase 4                             ││
│ │                                                           ││
│ └──────────────────────────────────────────────────────────┘│
│                                                              │
│ ┌─── ACTIVIDADES PRÓXIMAS (7 días) ────────────────────────┐│
│ │                                                           ││
│ │ Hoy, 17:00 - Riego y Monitoreo           👤 María        ││
│ │ Mañana, 09:00 - Control de pH            👤 Pedro        ││
│ │ 20/04 - Aplicación Nutrientes            👤 Juan         ││
│ │ 22/04 - Inspección de Plagas 🤖          👤 María        ││
│ │                                                           ││
│ │ [Ver Todas las Actividades]                              ││
│ └──────────────────────────────────────────────────────────┘│
│                                                              │
│ ┌─── ALERTAS Y NOTIFICACIONES ─────────────────────────────┐│
│ │                                                           ││
│ │ ⚠️ 2 actividades atrasadas (requieren atención)          ││
│ │ 📦 Inventario: Bandejas por debajo del mínimo            ││
│ │ ✅ Fase 1 completada exitosamente (31/03)                ││
│ │                                                           ││
│ └──────────────────────────────────────────────────────────┘│
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Bubble Elements:**

| Element Name | Type | Data Source / Value |
|--------------|------|---------------------|
| `text_order_code_detail` | Text | `Current Production Order > orderCode` |
| `text_order_name_detail` | Text | `Current Production Order > name` |
| `text_status_detail` | Text | `Current Production Order > status` |
| `text_current_phase_detail` | Text | `Current Production Order > currentPhase > name` |
| `tab_group` | Tab Group | Summary, Activities, Timeline, Inventory |
| `text_template_name_detail` | Text | `Current Production Order > template > name` |
| `text_cultivar_detail` | Text | `Current Production Order > cultivar > name` |
| `text_quantity_detail` | Text | `Current Production Order > quantity` |
| `text_priority_detail` | Text | `Current Production Order > priority` |
| `text_batch_code_detail` | Text | `Current Production Order > batchCode` |
| `text_start_date_detail` | Text | `Current Production Order > startDate` |
| `text_estimated_end_detail` | Text | `Current Production Order > estimatedEndDate` |
| `text_duration_detail` | Text | `Current Production Order > totalDurationDays` |
| `text_responsible_detail` | Text | `Current Production Order > responsibleUser > name` |
| `text_team_members_detail` | Text | List of team members |
| `btn_edit_info` | Button | Edit order information |
| `btn_reassign_personnel` | Button | Reassign team members |
| `progress_bar_days` | Progress Bar | `(daysPassed / totalDays) * 100` |
| `text_days_progress` | Text | Days passed / total days |
| `progress_bar_activities` | Progress Bar | `(completedActivities / totalActivities) * 100` |
| `text_activities_progress` | Text | Completed / total activities |
| `text_completed_count` | Text | Count of completed activities |
| `text_in_progress_count` | Text | Count of in-progress activities |
| `text_scheduled_count` | Text | Count of scheduled activities |
| `text_overdue_count` | Text | Count of overdue activities |
| `btn_view_overdue` | Button | Filter to show overdue activities |
| `btn_export_report` | Button | Export production report |
| `rg_phases_detail` | Repeating Group | `Current Production Order > phases` |
| `icon_phase_status` | Icon | ✅ completed, 🔄 active, ⏳ pending |
| `text_phase_name_detail` | Text | `Current cell's Phase > name` |
| `text_phase_dates` | Text | Start - End dates |
| `text_phase_duration` | Text | Duration in days |
| `text_phase_activities` | Text | Completed / total activities |
| `text_phase_area` | Text | Assigned area |
| `progress_bar_phase` | Progress Bar | Phase completion percentage |
| `btn_view_phase_detail` | Button | Expand phase details |
| `btn_complete_phase` | Button | Mark phase as complete (manager) |
| `rg_upcoming_activities` | Repeating Group | Next 7 days activities |
| `text_activity_datetime` | Text | Scheduled date/time |
| `text_activity_name_upcoming` | Text | Activity name |
| `icon_ai_activity` | Icon | 🤖 if AI detection enabled |
| `text_assigned_user` | Text | Assigned user name |
| `btn_view_all_activities` | Button | Navigate to activities page |
| `rg_alerts` | Repeating Group | Recent alerts and notifications |
| `icon_alert_type` | Icon | Alert type icon |
| `text_alert_message` | Text | Alert message |

**Workflows:**

**Workflow: Load Production Order Detail**
- **Trigger**: Page load
- **Step 1**: API Call `call_getProductionOrderById`
  - Parameters:
    - `orderId`: Get from URL parameter
- **Step 2**: Display order information
- **Step 3**: Calculate progress metrics
- **Step 4**: Load phases and upcoming activities
- **Step 5**: Load recent alerts

**Workflow: Complete Phase**
- **Trigger**: `btn_complete_phase` is clicked (manager only)
- **Step 1**: Verify all activities in phase are completed
- **Step 2**: Show confirmation popup
- **Step 3**: API Call `call_completePhase`
  - Parameters:
    - `phaseId`: `Current cell's Phase > _id`
    - `orderId`: `Current Production Order > _id`
    - `completedBy`: `Current User > _id`
- **Step 4**: Update order status to next phase
- **Step 5**: Refresh display, show success

---

### Page 3: Production Order Activities

**Visual Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ 🏠 > Órdenes > ORD-2025-047 > Actividades            [←]   │
├─────────────────────────────────────────────────────────────┤
│ 📅 ACTIVIDADES DE PRODUCCIÓN                                │
│ Orden: Propagación Cherry AK - Lote 15                      │
├─────────────────────────────────────────────────────────────┤
│ Vista: [● Lista] [○ Calendario] [○ Kanban]                  │
│                                                              │
│ Filtros: [Todas ▾] [Fase: Todas ▾] [Usuario: Todos ▾]      │
│          ☐ Solo mis actividades  ☐ Solo atrasadas           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ HOY - Martes, 18 de Marzo 2025                              │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 🔄 EN PROGRESO                                         │ │
│ │ Riego y Monitoreo - Fase Vegetativo      👤 María     │ │
│ │ Iniciada: Hoy 14:30  |  Duración est: 30 min           │ │
│ │ ⏰ Tiempo transcurrido: 45 minutos                     │ │
│ │ [Continuar Actividad →]                                │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ ⏰ PROGRAMADA PARA HOY                                 │ │
│ │ Control de pH - Fase Vegetativo          👤 Pedro     │ │
│ │ Hora programada: 17:00  |  Duración est: 20 min        │ │
│ │ 📦 Requiere: Medidor pH, Solución tampón               │ │
│ │ [Iniciar Actividad →]                                  │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ PRÓXIMOS 7 DÍAS                                             │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ ⏰ Mañana, 19/03 - 09:00                               │ │
│ │ Aplicación de Nutrientes - Vegetativo    👤 Juan      │ │
│ │ Duración: 45 min  |  📋 QC: Control Nutricional        │ │
│ │ 📦 Requiere: Nutriente A (500ml), B (300ml)            │ │
│ │ [Ver Detalles]  [Reprogramar]                          │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ ⏰ Jueves, 20/03 - 10:00                               │ │
│ │ Inspección de Plagas y Enfermedades 🤖   👤 María     │ │
│ │ Duración: 1 hora  |  📋 QC: Inspección P&E             │ │
│ │ 🤖 AI Detection habilitada para análisis de fotos      │ │
│ │ [Ver Detalles]  [Reprogramar]                          │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 🔁 Sábado, 22/03 - 14:00                               │ │
│ │ Riego y Monitoreo - Vegetativo           👤 Ana       │ │
│ │ Duración: 30 min  |  Recurrente (Lun/Mié/Sáb)          │ │
│ │ [Ver Detalles]  [Reprogramar]                          │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ATRASADAS (2)                                               │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ ⚠️ ATRASADA - Programada: Ayer, 17/03 - 16:00         │ │
│ │ Limpieza de Bandejas - Vegetativo        👤 Pedro     │ │
│ │ Duración: 30 min  |  ⚠️ Atrasada 1 día                 │ │
│ │ [Iniciar Ahora]  [Reprogramar]  [Cancelar]             │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ COMPLETADAS RECIENTEMENTE (últimas 5)                       │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ ✅ Completada: 17/03 - 10:30                           │ │
│ │ Trasplante a Macetas - Propagación       👤 Juan      │ │
│ │ Completada por: Juan Manager  |  Duración real: 2h     │ │
│ │ [Ver Reporte]  [Fotos (5)]                             │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│                        [Ver Todas las Actividades (47)]     │
└─────────────────────────────────────────────────────────────┘
```

**Bubble Elements:**

| Element Name | Type | Data Source / Value |
|--------------|------|---------------------|
| `radio_view_mode` | Radio Buttons | list, calendar, kanban |
| `dropdown_status_filter` | Dropdown | All, Scheduled, In Progress, Completed, Overdue |
| `dropdown_phase_filter` | Dropdown | All phases + individual phases |
| `dropdown_user_filter` | Dropdown | All users + individual users |
| `checkbox_my_activities` | Checkbox | Filter to current user's activities |
| `checkbox_overdue_only` | Checkbox | Show only overdue activities |
| `rg_in_progress_activities` | Repeating Group | Activities with status = in_progress |
| `rg_today_activities` | Repeating Group | Activities scheduled for today |
| `rg_upcoming_activities` | Repeating Group | Activities next 7 days |
| `rg_overdue_activities` | Repeating Group | Activities with status = overdue |
| `rg_completed_activities` | Repeating Group | Recent completed activities |
| `text_activity_name_list` | Text | `Current cell's Activity > name` |
| `text_activity_phase` | Text | `Current cell's Activity > phase > name` |
| `text_assigned_user_list` | Text | `Current cell's Activity > assignedUser > name` |
| `text_scheduled_datetime` | Text | Scheduled date and time |
| `text_duration_est` | Text | `Current cell's Activity > estimatedDurationHours` |
| `text_duration_actual` | Text | `Current cell's Activity > actualDurationHours` (if completed) |
| `icon_ai_enabled_list` | Icon | 🤖 if AI detection enabled |
| `icon_has_qc` | Icon | 📋 if quality check required |
| `text_qc_template_name` | Text | `Current cell's Activity > qualityCheckTemplate > name` |
| `text_projected_inventory_list` | Text | Summary of required inventory |
| `text_overdue_days` | Text | Days overdue (if applicable) |
| `btn_start_activity` | Button | Navigate to activity execution |
| `btn_continue_activity` | Button | Resume in-progress activity |
| `btn_view_activity_details` | Button | Show activity detail popup |
| `btn_reschedule_activity` | Button | Change scheduled date/time |
| `btn_cancel_activity` | Button | Cancel activity (with reason) |
| `btn_view_report` | Button | View completion report |
| `btn_view_photos` | Button | View uploaded photos |
| `btn_view_all_activities` | Button | Remove filters, show all |

**Workflows:**

**Workflow: Load Production Order Activities**
- **Trigger**: Page load
- **Step 1**: API Call `call_getActivitiesByProductionOrder`
  - Parameters:
    - `orderId`: Get from URL parameter
    - `statusFilter`: `dropdown_status_filter's value`
    - `phaseFilter`: `dropdown_phase_filter's value`
    - `userFilter`: `dropdown_user_filter's value`
    - `myActivitiesOnly`: `checkbox_my_activities's value`
    - `overdueOnly`: `checkbox_overdue_only's value`
- **Step 2**: Group activities by status and date
- **Step 3**: Display in respective repeating groups

**Workflow: Start Activity**
- **Trigger**: `btn_start_activity` is clicked
- **Action**: Navigate to activity execution page (MODULE 25)
  - Pass activity ID in URL

**Workflow: Reschedule Activity**
- **Trigger**: `btn_reschedule_activity` is clicked
- **Step 1**: Show date/time picker popup
- **Step 2**: Validate new schedule (no conflicts)
- **Step 3**: API Call `call_rescheduleActivity`
  - Parameters:
    - `activityId`: `Current cell's Activity > _id`
    - `newScheduledDate`: From date picker
    - `rescheduledBy`: `Current User > _id`
    - `reason`: Optional reason input
- **Step 4**: Update activity in list, show success

**Workflow: Cancel Activity**
- **Trigger**: `btn_cancel_activity` is clicked
- **Step 1**: Show cancellation reason input
- **Step 2**: API Call `call_cancelActivity`
  - Parameters:
    - `activityId`: `Current cell's Activity > _id`
    - `cancelledBy`: `Current User > _id`
    - `reason`: Required reason input
- **Step 3**: Remove from active lists, show in cancelled section

---

## MODULE 25: Activity Execution with AI Detection

### Purpose
Enable workers to execute production activities by recording start/end times, collecting field data, uploading photos, completing quality check forms, and using AI for pest/disease detection with automatic remediation activity creation.

### Navigation
- **Path**: Multiple entry points:
  - From Production Order Activities list
  - From Dashboard "My Activities" widget
  - From mobile notifications
- **Access**: Assigned workers, supervisors, managers
- **Related Modules**:
  - MODULE 24 (Production Orders - source of activities)
  - MODULE 23 (Quality Check Templates - forms to fill)
  - MODULE 19 (Inventory - consumption recording)

---

### Page 1: Activity Preview & Start

**Visual Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ 🏠 > Orden ORD-2025-047 > Actividad                  [←]   │
├─────────────────────────────────────────────────────────────┤
│              📋 VISTA PREVIA DE ACTIVIDAD                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Inspección de Plagas y Enfermedades 🤖                      │
│                                                              │
│ Orden: Propagación Cherry AK - Lote 15                      │
│ Fase: Vegetativo (Fase 2/5)                                 │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ ⏰ INFORMACIÓN DE PROGRAMACIÓN                         │ │
│ │                                                         │ │
│ │ Programada: Jueves, 20 de Marzo 2025 - 10:00          │ │
│ │ Duración estimada: 1 hora                              │ │
│ │ Asignada a: María García (tú)                          │ │
│ │                                                         │ │
│ │ ✅ No hay dependencias pendientes                      │ │
│ │ ✅ Área disponible: Vegetativo B3                      │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 📋 DESCRIPCIÓN DE LA ACTIVIDAD                         │ │
│ │                                                         │ │
│ │ Realizar inspección visual detallada de todas las     │ │
│ │ plantas en busca de signos de plagas, enfermedades,   │ │
│ │ o deficiencias nutricionales. Tomar fotografías de    │ │
│ │ cualquier anomalía detectada para análisis con AI.     │ │
│ │                                                         │ │
│ │ Instrucciones especiales:                              │ │
│ │ • Revisar envés de hojas cuidadosamente               │ │
│ │ • Observar color, textura y forma de hojas            │ │
│ │ • Fotografiar cualquier mancha o decoloración          │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 📦 INVENTARIO PROYECTADO                               │ │
│ │                                                         │ │
│ │ Esta actividad no requiere consumo de inventario       │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 📋 QUALITY CHECK REQUERIDO                             │ │
│ │                                                         │ │
│ │ Template: Inspección de Plagas y Enfermedades         │ │
│ │ Campos: 18  |  Incluye fotografías y firma            │ │
│ │ [Vista Previa del Formato]                             │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 🤖 DETECCIÓN CON INTELIGENCIA ARTIFICIAL               │ │
│ │                                                         │ │
│ │ ✅ AI Detection habilitada para esta actividad         │ │
│ │                                                         │ │
│ │ El sistema analizará las fotografías que subas para   │ │
│ │ detectar plagas y enfermedades automáticamente.        │ │
│ │ Podrás confirmar los resultados y crear actividades   │ │
│ │ de remediación (MIPE/MIRFE) si es necesario.           │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ ✅ LISTO PARA INICIAR                                  │ │
│ │                                                         │ │
│ │ Al iniciar esta actividad se registrará la hora de    │ │
│ │ inicio y podrás acceder al formulario completo para   │ │
│ │ registrar tus observaciones y subir fotografías.       │ │
│ │                                                         │ │
│ │ ¿Estás listo para comenzar esta actividad?            │ │
│ │                                                         │ │
│ │          [Cancelar]  [🚀 Iniciar Actividad]            │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Bubble Elements:**

| Element Name | Type | Data Source / Value |
|--------------|------|---------------------|
| `text_activity_name_preview` | Text | `Current Activity > name` |
| `icon_ai_enabled_preview` | Icon | 🤖 if AI detection enabled |
| `text_order_name_preview` | Text | `Current Activity > productionOrder > name` |
| `text_phase_name_preview` | Text | `Current Activity > phase > name` |
| `text_scheduled_datetime_preview` | Text | `Current Activity > scheduledDateTime` |
| `text_duration_preview` | Text | `Current Activity > estimatedDurationHours` |
| `text_assigned_user_preview` | Text | `Current Activity > assignedUser > name` |
| `icon_dependencies_status` | Icon | ✅ if met, ⚠️ if pending |
| `text_dependencies_message` | Text | Status of dependencies |
| `icon_area_status` | Icon | ✅ if available |
| `text_area_name_preview` | Text | `Current Activity > requiredArea > name` |
| `text_description_preview` | Text | `Current Activity > description` |
| `text_special_instructions` | Text | `Current Activity > specialInstructions` |
| `group_projected_inventory` | Group | Display required inventory |
| `rg_inventory_items_preview` | Repeating Group | `Current Activity > projectedInventory` |
| `text_inventory_item_name` | Text | Item name |
| `text_inventory_quantity` | Text | Required quantity |
| `group_qc_required` | Group | Conditional: if quality check required |
| `text_qc_template_name_preview` | Text | `Current Activity > qualityCheckTemplate > name` |
| `text_qc_field_count` | Text | Field count |
| `btn_preview_qc_format` | Button | Show QC template preview |
| `group_ai_detection` | Group | Conditional: if AI detection enabled |
| `text_ai_description` | Text | Description of AI functionality |
| `btn_cancel_start` | Button | Go back to activities list |
| `btn_start_activity_execution` | Button | Start activity execution |

**Workflows:**

**Workflow: Load Activity Preview**
- **Trigger**: Page load
- **Step 1**: API Call `call_getActivityById`
  - Parameters:
    - `activityId`: Get from URL parameter
- **Step 2**: Verify activity can be started
  - Check dependencies
  - Check area availability
  - Check user assignment
- **Step 3**: Display activity information
- **Step 4**: Load projected inventory
- **Step 5**: Load QC template info if applicable

**Workflow: Start Activity Execution**
- **Trigger**: `btn_start_activity_execution` is clicked
- **Step 1**: API Call `call_startActivity`
  - Parameters:
    - `activityId`: `Current Activity > _id`
    - `startedBy`: `Current User > _id`
    - `startTime`: Current timestamp
- **Step 2**: Navigate to activity execution page
- **Step 3**: Start timer for duration tracking

---

### Page 2: Activity Execution (In Progress)

**Visual Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ 🔄 ACTIVIDAD EN PROGRESO                             [←]   │
│ ⏱️ Tiempo: 00:23:45  |  Est: 1:00:00  |  [⏸️ Pausar]        │
├─────────────────────────────────────────────────────────────┤
│ Inspección de Plagas y Enfermedades 🤖                      │
│ Orden: Propagación Cherry AK - Lote 15  |  Fase: Vegetativo │
├─────────────────────────────────────────────────────────────┤
│ [📝 Datos Generales] [📋 Quality Check] [📷 Fotos] [✅ Fin]│
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ TAB: DATOS GENERALES                                        │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 📊 INFORMACIÓN BÁSICA                                  │ │
│ │                                                         │ │
│ │ Plantas Inspeccionadas *                               │ │
│ │ [100]                                                  │ │
│ │                                                         │ │
│ │ Estado General *                                       │ │
│ │ ● Excelente  ○ Bueno  ○ Regular  ○ Pobre              │ │
│ │                                                         │ │
│ │ ☐ Se detectaron plagas o enfermedades                  │ │
│ │   (Marcar si encontraste algún problema)               │ │
│ │                                                         │ │
│ │ Observaciones Generales                                │ │
│ │ [Las plantas se ven saludables en general. Algunas___]│ │
│ │ [hojas inferiores muestran ligera decoloración._____]│ │
│ │ [___________________________________________________]  │ │
│ │                                                         │ │
│ │ 💾 Auto-guardado hace 30 segundos                      │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 📦 CONSUMO DE INVENTARIO (Opcional)                    │ │
│ │                                                         │ │
│ │ Esta actividad no tiene inventario proyectado, pero   │ │
│ │ puedes registrar consumos adicionales si fueron       │ │
│ │ necesarios.                                            │ │
│ │                                                         │ │
│ │ [+ Agregar Item Consumido]                             │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ ⚠️ INCIDENTES O PROBLEMAS                              │ │
│ │                                                         │ │
│ │ ☐ Se presentaron incidentes durante la actividad       │ │
│ │                                                         │ │
│ │ [Campo condicional para describir incidentes]          │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│         [Guardar Borrador]  [Siguiente: Quality Check →]   │
└─────────────────────────────────────────────────────────────┘
```

**Tab 2: Quality Check Form**

**Visual Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ 🔄 ACTIVIDAD EN PROGRESO                             [←]   │
│ ⏱️ Tiempo: 00:35:12  |  Est: 1:00:00  |  [⏸️ Pausar]        │
├─────────────────────────────────────────────────────────────┤
│ [📝 Datos Generales] [●📋 Quality Check] [📷 Fotos] [✅ Fin]│
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ TAB: QUALITY CHECK                                          │
│ Template: Inspección de Plagas y Enfermedades              │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ CONTROL DE CALIDAD - INSPECCIÓN P&E                    │ │
│ │                                                         │ │
│ │ Fecha de Inspección *     Inspector *                  │ │
│ │ [20/03/2025]              [María García]               │ │
│ │                                                         │ │
│ │ Lote/Batch *                                           │ │
│ │ [BATCH-2025-015]                                       │ │
│ │                                                         │ │
│ │ Área Inspeccionada *                                   │ │
│ │ [Vegetativo B3]                                        │ │
│ │                                                         │ │
│ │ ─────────────────────────────────────────────────────  │ │
│ │ EVALUACIÓN VISUAL                                      │ │
│ │                                                         │ │
│ │ Color de Hojas *                                       │ │
│ │ ☑ Verde oscuro  ☐ Verde claro  ☑ Amarillento          │ │
│ │ ☐ Manchas       ☐ Necrosis     ☐ Otros                │ │
│ │                                                         │ │
│ │ Textura de Hojas *                                     │ │
│ │ ● Normal  ○ Arrugadas  ○ Quebradizas  ○ Otros         │ │
│ │                                                         │ │
│ │ Presencia de Plagas *                                  │ │
│ │ ● Sí  ○ No                                             │ │
│ │                                                         │ │
│ │ [Si "Sí" - campos condicionales aparecen]             │ │
│ │                                                         │ │
│ │ Tipo de Plaga Observada (visual)                      │ │
│ │ ☑ Áfidos        ☐ Araña roja     ☐ Mosca blanca       │ │
│ │ ☐ Trips         ☐ Minador        ☐ Otros              │ │
│ │                                                         │ │
│ │ Nivel de Infestación *                                 │ │
│ │ ○ Bajo (< 5%)  ● Medio (5-20%)  ○ Alto (> 20%)        │ │
│ │                                                         │ │
│ │ Plantas Afectadas (aproximado)                         │ │
│ │ [15] de [100] total                                    │ │
│ │                                                         │ │
│ │ Ubicación de Afectación                                │ │
│ │ ☑ Hojas superiores  ☑ Hojas inferiores                │ │
│ │ ☐ Tallos            ☐ Raíces                           │ │
│ │                                                         │ │
│ │ ─────────────────────────────────────────────────────  │ │
│ │ OBSERVACIONES DETALLADAS                               │ │
│ │                                                         │ │
│ │ Descripción de Hallazgos *                             │ │
│ │ [Se observan pequeños insectos verdes (áfidos) en el_]│ │
│ │ [envés de hojas jóvenes. Concentración mayor en____]│ │
│ │ [plantas del sector norte del área. No se observa___]│ │
│ │ [daño severo aún._________________________________]  │ │
│ │                                                         │ │
│ │ Recomendaciones de Acción                              │ │
│ │ [Aplicar MIPE con jabón potásico. Monitoreo diario__]│ │
│ │ [durante próximos 5 días.________________________]  │ │
│ │                                                         │ │
│ │ 💾 Auto-guardado hace 15 segundos                      │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│    [← Anterior: Datos]  [Guardar Borrador]  [Siguiente: Fotos →] │
└─────────────────────────────────────────────────────────────┘
```

**Tab 3: Photos & AI Detection (Simplified)**

**Visual Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ 🔄 ACTIVIDAD EN PROGRESO                             [←]   │
│ ⏱️ Tiempo: 00:48:30  |  Est: 1:00:00  |  [⏸️ Pausar]        │
├─────────────────────────────────────────────────────────────┤
│ [📝 Datos] [📋 Quality Check] [●📷 Fotos] [✅ Finalizar]   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ TAB: REGISTRO FOTOGRÁFICO & DETECCIÓN AI                   │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 📷 SUBIR FOTOGRAFÍAS                                   │ │
│ │                                                         │ │
│ │ Arrastra imágenes aquí o haz click para seleccionar   │ │
│ │ [📁 Seleccionar Archivos]  [📱 Tomar Foto]             │ │
│ │                                                         │ │
│ │ Formatos: JPG, PNG  |  Máx: 10 MB por archivo          │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 🖼️ FOTOGRAFÍAS SUBIDAS (5)                             │ │
│ │                                                         │ │
│ │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐          │ │
│ │ │ 📷   │ │ 📷   │ │ 📷   │ │ 📷   │ │ 📷   │          │ │
│ │ │IMG001│ │IMG002│ │IMG003│ │IMG004│ │IMG005│          │ │
│ │ │10:32 │ │10:35 │ │10:38 │ │10:42 │ │10:45 │          │ │
│ │ │[Ver] │ │[Ver] │ │[Ver] │ │[Ver] │ │[Ver] │          │ │
│ │ │[🗑️]  │ │[🗑️]  │ │[🗑️]  │ │[🗑️]  │ │[🗑️]  │          │ │
│ │ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘          │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 🤖 ANÁLISIS CON INTELIGENCIA ARTIFICIAL                │ │
│ │                                                         │ │
│ │ ℹ️ Sube fotografías de las plantas y usa Gemini AI    │ │
│ │ para detectar plagas, enfermedades o deficiencias.     │ │
│ │                                                         │ │
│ │                 [🤖 Analizar con Gemini AI]            │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│    [← Anterior: QC]  [Guardar Borrador]  [Siguiente: Finalizar →] │
└─────────────────────────────────────────────────────────────┘
```

**State: Loading (during Gemini Analysis)**
```
┌─────────────────────────────────────────────────────────────┐
│ 🤖 ANALIZANDO FOTOGRAFÍAS CON GEMINI AI...                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ ⏳ Analizando 5 fotografías...                         │ │
│ │                                                         │ │
│ │ [████████████████████░░░░░░░░░] 3/5                    │ │
│ │                                                         │ │
│ │ ✅ IMG001.jpg - Analizada                              │ │
│ │ ✅ IMG002.jpg - Analizada                              │ │
│ │ ⏳ IMG003.jpg - En proceso...                          │ │
│ │ ⏱️ IMG004.jpg - En cola                                 │ │
│ │ ⏱️ IMG005.jpg - En cola                                 │ │
│ │                                                         │ │
│ │ Tiempo estimado: ~30 segundos                          │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**State: Results (after Gemini Analysis)**
```
┌─────────────────────────────────────────────────────────────┐
│ 🔄 ACTIVIDAD EN PROGRESO                             [←]   │
│ ⏱️ Tiempo: 00:50:15  |  Est: 1:00:00  |  [⏸️ Pausar]        │
├─────────────────────────────────────────────────────────────┤
│ [📝 Datos] [📋 Quality Check] [●📷 Fotos] [✅ Finalizar]   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ TAB: REGISTRO FOTOGRÁFICO & DETECCIÓN AI                   │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 🖼️ FOTOGRAFÍAS SUBIDAS (5)        [+ Agregar más]     │ │
│ │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐          │ │
│ │ │ 📷   │ │ 📷   │ │ 📷   │ │ 📷   │ │ 📷   │          │ │
│ │ │IMG001│ │IMG002│ │IMG003│ │IMG004│ │IMG005│          │ │
│ │ │ ✅   │ │ ⚠️   │ │ ⚠️   │ │ ✅   │ │ ✅   │          │ │
│ │ │[Ver] │ │[Ver] │ │[Ver] │ │[Ver] │ │[Ver] │          │ │
│ │ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘          │ │
│ │ ✅ Sin problemas  |  ⚠️ Problema detectado             │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 🤖 RESULTADOS DE DETECCIÓN GEMINI AI                   │ │
│ │                                                         │ │
│ │ ✅ Análisis completado                                 │ │
│ │ ⚠️ Se detectaron 2 problemas en las plantas            │ │
│ │                                                         │ │
│ │ [🔄 Analizar nuevamente]                               │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 📷 DETECCIONES POR FOTOGRAFÍA                          │ │
│ │                                                         │ │
│ │ ┌──────────────────────────────────────────────────┐   │ │
│ │ │ 📷 IMG002.jpg                             [Ver]  │   │ │
│ │ │ ┌────────┐                                       │   │ │
│ │ │ │        │  🐛 Áfido / Aphid                     │   │ │
│ │ │ │[Thumb] │  Nombre científico: Aphis gossypii    │   │ │
│ │ │ │        │  Severidad: Media  |  Confianza: 87% │   │ │
│ │ │ └────────┘                                       │   │ │
│ │ │                                                   │   │ │
│ │ │ Base de datos:                                   │   │ │
│ │ │ ✅ Aphis gossypii - Match encontrado             │   │ │
│ │ │    Método recomendado: Jabón potásico (MIPE)    │   │ │
│ │ │                                                   │   │ │
│ │ │ ☑ Confirmar detección y crear actividad MIPE     │   │ │
│ │ │ [Marcar como falso positivo]                     │   │ │
│ │ └──────────────────────────────────────────────────┘   │ │
│ │                                                         │ │
│ │ ┌──────────────────────────────────────────────────┐   │ │
│ │ │ 📷 IMG003.jpg                             [Ver]  │   │ │
│ │ │ ┌────────┐                                       │   │ │
│ │ │ │        │  🍄 Oídio / Powdery Mildew            │   │ │
│ │ │ │[Thumb] │  Nombre científico: Erysiphe sp.      │   │ │
│ │ │ │        │  Severidad: Baja  |  Confianza: 72%  │   │ │
│ │ │ └────────┘                                       │   │ │
│ │ │                                                   │   │ │
│ │ │ Base de datos:                                   │   │ │
│ │ │ ✅ Oídio (Powdery mildew) - Match encontrado     │   │ │
│ │ │    Método recomendado: Fungicida bio (MIRFE)    │   │ │
│ │ │                                                   │   │ │
│ │ │ ☑ Confirmar detección y crear actividad MIRFE    │   │ │
│ │ │ [Marcar como falso positivo]                     │   │ │
│ │ └──────────────────────────────────────────────────┘   │ │
│ │                                                         │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 🔧 ACTIVIDADES DE REMEDIACIÓN                          │ │
│ │                                                         │ │
│ │ ℹ️ Se crearán automáticamente al finalizar esta       │ │
│ │ actividad (solo si confirmas las detecciones)          │ │
│ │                                                         │ │
│ │ ☑ MIPE - Control de Áfidos                            │ │
│ │   Programación: Mañana a las 10:00                    │ │
│ │   Urgencia: Media                                      │ │
│ │                                                         │ │
│ │ ☑ MIRFE - Control de Oídio                            │ │
│ │   Programación: En 2 días a las 10:00                 │ │
│ │   Urgencia: Baja                                       │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│    [← Anterior: QC]  [Guardar Borrador]  [Siguiente: Finalizar →] │
└─────────────────────────────────────────────────────────────┘
```

**Tab 4: Finalize Activity**

**Visual Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ 🔄 ACTIVIDAD EN PROGRESO                             [←]   │
│ ⏱️ Tiempo: 00:58:22  |  Est: 1:00:00  |  [⏸️ Pausar]        │
├─────────────────────────────────────────────────────────────┤
│ [📝 Datos] [📋 QC] [📷 Fotos] [●✅ Finalizar]              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ TAB: FINALIZAR ACTIVIDAD                                    │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 📊 RESUMEN DE LA ACTIVIDAD                             │ │
│ │                                                         │ │
│ │ ✅ Datos generales completados                         │ │
│ │ ✅ Quality check completado (18/18 campos)             │ │
│ │ ✅ Fotografías subidas (5)                             │ │
│ │ ✅ Detección AI completada                             │ │
│ │ ⚠️ 2 problemas detectados (áfidos, oídio)              │ │
│ │                                                         │ │
│ │ Tiempo total: 00:58:22                                 │ │
│ │ Tiempo estimado: 01:00:00                              │ │
│ │ Diferencia: -00:01:38 (dentro del rango esperado) ✅   │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 🔧 ACTIVIDADES DE REMEDIACIÓN A CREAR                  │ │
│ │                                                         │ │
│ │ ☑ MIPE - Control de Áfidos                            │ │
│ │   Programada: Mañana 21/03 a las 10:00                │ │
│ │   Asignada a: Juan Manager                             │ │
│ │                                                         │ │
│ │ ☑ MIRFE - Control de Oídio                            │ │
│ │   Programada: 22/03 a las 10:00                        │ │
│ │   Asignada a: María García                             │ │
│ │                                                         │ │
│ │ [Editar Actividades]  [No crear actividades]           │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ ✍️ FIRMA Y CONFIRMACIÓN                                │ │
│ │                                                         │ │
│ │ Firma del Inspector *                                  │ │
│ │ ┌────────────────────────────────────────────────┐     │ │
│ │ │                                                 │     │ │
│ │ │         [Área de firma digital/touch]           │     │ │
│ │ │                                                 │     │ │
│ │ └────────────────────────────────────────────────┘     │ │
│ │ [Limpiar Firma]                                        │ │
│ │                                                         │ │
│ │ Notas Finales (opcional)                               │ │
│ │ [Todo completado según protocolo. Se recomienda______]│ │
│ │ [seguimiento en 3 días.___________________________]  │ │
│ │                                                         │ │
│ │ ☑ Confirmo que la información registrada es correcta   │ │
│ │   y completa                                            │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ ⚠️ IMPORTANTE                                           │ │
│ │                                                         │ │
│ │ Al completar esta actividad:                           │ │
│ │ • Se registrará la hora de finalización                │ │
│ │ • Los datos quedarán bloqueados (no editables)         │ │
│ │ • Se crearán 2 actividades de remediación              │ │
│ │ • Se generará un reporte PDF                           │ │
│ │ • Se notificará al responsable de la orden             │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│              [← Anterior]  [Guardar Borrador]  [✅ COMPLETAR ACTIVIDAD] │
└─────────────────────────────────────────────────────────────┘
```

**Bubble Elements (Page 2 - All Tabs):**

| Element Name | Type | Data Source / Value |
|--------------|------|---------------------|
| **Header Elements** |
| `text_timer` | Text | Running timer (00:23:45 format) |
| `text_estimated_time` | Text | `Current Activity > estimatedDurationHours` |
| `btn_pause_activity` | Button | Pause timer |
| `btn_back_to_preview` | Button | Navigate back (confirm first) |
| `tab_group_execution` | Tab Group | General Data, Quality Check, Photos, Finalize |
| **Tab 1: General Data** |
| `input_plants_inspected` | Input | Number |
| `radio_general_condition` | Radio Buttons | excellent, good, fair, poor |
| `checkbox_pests_detected` | Checkbox | Boolean |
| `input_observations` | Multi-line Input | Text |
| `group_inventory_consumption` | Group | Optional inventory consumption |
| `btn_add_inventory_item` | Button | Add consumed item |
| `rg_consumed_items` | Repeating Group | Custom list |
| `checkbox_incidents` | Checkbox | Boolean |
| `input_incident_description` | Multi-line Input | Text (conditional) |
| `btn_save_draft` | Button | Auto-save data |
| `btn_next_qc` | Button | Navigate to QC tab |
| **Tab 2: Quality Check Form** |
| `group_qc_form` | Group | Dynamic form rendered from template |
| `input_qc_date` | Date Picker | Auto-filled |
| `input_qc_inspector` | Input | Auto-filled (current user) |
| `input_qc_batch` | Input | Auto-filled from order |
| `input_qc_area` | Input | Auto-filled |
| `checkbox_leaf_colors` | Checkbox Group | Multiple options |
| `radio_leaf_texture` | Radio Buttons | Options from template |
| `radio_pests_present` | Radio Buttons | yes, no |
| `group_pest_details` | Group | Conditional: visible if pests = yes |
| `checkbox_pest_types` | Checkbox Group | Multiple pest types |
| `radio_infestation_level` | Radio Buttons | low, medium, high |
| `input_affected_plants` | Input | Number |
| `input_total_plants` | Input | Number |
| `checkbox_affected_areas` | Checkbox Group | Leaves, stems, roots, etc. |
| `input_findings_description` | Multi-line Input | Text |
| `input_action_recommendations` | Multi-line Input | Text |
| `btn_previous_general` | Button | Navigate to general data tab |
| `btn_next_photos` | Button | Navigate to photos tab |
| **Tab 3: Photos & AI Detection (Simplified)** |
| `group_upload_section` | Group | Photo upload section |
| `uploader_photos` | File Uploader | Multiple files, accept: .jpg, .png, max: 10MB |
| `btn_select_files` | Button | "📁 Seleccionar Archivos" |
| `btn_take_photo` | Button | "📱 Tomar Foto" - Access device camera (mobile) |
| `rg_uploaded_photos` | Repeating Group | Uploaded photos list |
| `image_thumbnail` | Image | Photo thumbnail |
| `text_upload_time` | Text | Time uploaded (HH:MM format) |
| `icon_detection_status` | Icon | ✅ (ok) / ⚠️ (problem detected) after analysis |
| `btn_view_photo` | Button | Show full-size photo |
| `btn_delete_photo` | Button | Remove photo |
| `group_ai_section` | Group | AI analysis section |
| `text_ai_info` | Text | Instructions for using AI |
| `btn_analyze_with_ai` | Button | "🤖 Analizar con Gemini AI" - Primary action |
| **Loading State** |
| `group_loading_analysis` | Group | Shows during Gemini processing |
| `text_loading_title` | Text | "🤖 ANALIZANDO FOTOGRAFÍAS CON GEMINI AI..." |
| `text_analyzing_message` | Text | "⏳ Analizando X fotografías..." |
| `progress_bar_analysis` | Progress Bar | Shows progress |
| `rg_photo_status` | Repeating Group | Per-photo analysis status |
| `text_photo_name_status` | Text | Photo filename |
| `icon_photo_status` | Icon | ✅/⏳/⏱️ (analyzed/processing/queued) |
| `text_estimated_time_ai` | Text | "Tiempo estimado: ~30 segundos" |
| **Results State** |
| `group_ai_results` | Group | Conditional: visible after analysis |
| `text_analysis_complete` | Text | "✅ Análisis completado" |
| `text_problems_count` | Text | "⚠️ Se detectaron X problemas" |
| `btn_reanalyze` | Button | "🔄 Analizar nuevamente" - Retry with Gemini |
| `group_detections_section` | Group | Detection results section |
| `rg_ai_detections` | Repeating Group | AI detection results (one per photo with issues) |
| `text_photo_name_detection` | Text | Photo filename |
| `image_detection_thumbnail` | Image | Photo thumbnail |
| `btn_view_detection_photo` | Button | "[Ver]" - Full size view |
| `text_common_name` | Text | Common name from Gemini (e.g., "Áfido / Aphid") |
| `text_scientific_name` | Text | Scientific name from Gemini |
| `text_severity` | Text | Severity: low/medium/high |
| `text_confidence` | Text | Confidence percentage (0-100%) |
| `group_db_match` | Group | Internal database match info |
| `icon_db_match_status` | Icon | ✅ if match found in DB |
| `text_db_match_name` | Text | Matched pest/disease from internal DB |
| `text_recommended_method` | Text | Recommended control method (MIPE/MIRFE) |
| `checkbox_confirm_detection` | Checkbox | "☑ Confirmar detección y crear actividad..." |
| `btn_mark_false_positive` | Button | "[Marcar como falso positivo]" |
| `group_remediation_section` | Group | Auto-remediation activities summary |
| `text_remediation_info` | Text | Info about auto-creation |
| `rg_remediation_activities` | Repeating Group | Remediation activities to create |
| `checkbox_create_activity` | Checkbox | Enabled by default, linked to detection confirmation |
| `text_activity_type` | Text | MIPE / MIRFE |
| `text_activity_schedule` | Text | Suggested scheduling |
| `text_activity_urgency` | Text | low, medium, high |
| **Navigation** |
| `btn_previous_qc` | Button | Navigate to QC tab |
| `btn_save_draft` | Button | Auto-save data |
| `btn_next_finalize` | Button | Navigate to finalize tab |
| **Custom States** |
| `ai_analysis_state` | State (text) | "idle" / "analyzing" / "complete" / "error" |
| `detections_data` | State (list) | Stores Gemini API results |
| **Tab 4: Finalize** |
| `group_activity_summary` | Group | Summary of completion status |
| `icon_general_complete` | Icon | ✅ if complete |
| `icon_qc_complete` | Icon | ✅ if complete |
| `icon_photos_complete` | Icon | ✅ if complete |
| `icon_ai_complete` | Icon | ✅ if complete |
| `text_problems_detected` | Text | Count of AI detections |
| `text_total_time` | Text | Actual duration |
| `text_estimated_time_final` | Text | Original estimate |
| `text_time_difference` | Text | Difference (+/-) |
| `icon_time_variance` | Icon | ✅ within range, ⚠️ over/under |
| `group_remediation_to_create` | Group | List of activities to create |
| `rg_activities_to_create` | Repeating Group | Confirmed remediation activities |
| `checkbox_create_remediation` | Checkbox | Enable/disable creation |
| `text_remediation_type` | Text | MIPE / MIRFE |
| `text_scheduled_datetime` | Text | When to schedule |
| `text_assigned_to` | Text | Assigned user |
| `btn_edit_activities_create` | Button | Modify activities before creation |
| `btn_skip_remediation` | Button | Don't create any activities |
| `signature_pad` | Signature Pad | Digital signature |
| `btn_clear_signature` | Button | Clear and re-sign |
| `input_final_notes` | Multi-line Input | Text |
| `checkbox_confirm_completion` | Checkbox | Required to complete |
| `btn_previous_photos` | Button | Navigate to photos tab |
| `btn_complete_activity` | Button | Finalize and submit |

**Workflows:**

**Workflow: Auto-save Progress**
- **Trigger**: Every 30 seconds while activity is open
- **Action**: API Call `call_saveActivityProgress`
  - Parameters:
    - `activityId`: `Current Activity > _id`
    - `generalData`: Object with all general data fields
    - `qcData`: Object with all QC form fields
    - `photoUrls`: Array of uploaded photo URLs
    - `lastSaved`: Current timestamp

**Workflow: Upload Photos**
- **Trigger**: Photo(s) uploaded via `uploader_photos`
- **Step 1**: Upload file(s) to storage, get URLs
- **Step 2**: Add to `rg_uploaded_photos` list with upload time
- **Step 3**: Display photo thumbnails
- **Note**: Photos are NOT automatically analyzed - user must click "Analizar con Gemini AI" button

**Workflow: Analyze Photos with Gemini AI (Simplified)**
- **Trigger**: `btn_analyze_with_ai` is clicked
- **Step 1**: Validate at least 1 photo uploaded
- **Step 2**: Set `ai_analysis_state` = "analyzing"
- **Step 3**: Show loading state (`group_loading_analysis` visible)
- **Step 4**: API Call `call_analyzePestDisease` (Single Gemini call)
  - Parameters:
    - `photoUrls`: Array of all uploaded photo URLs
    - `activityId`: `Current Activity > _id`
    - `facilityId`: `Current User > currentFacilityId`
    - `cropType`: From production order
  - Backend Process (single call to Gemini):
    1. Gemini analyzes all photos
    2. Returns: `{ detections: [ { photoUrl, commonName, scientificName, category, severity, confidence }, ... ] }`
    3. Backend searches internal `pestsAndDiseases` DB by scientific name
    4. Enriches detections with control methods from DB
    5. Returns enriched detections to frontend
- **Step 5**: Store results in custom state `detections_data`
- **Step 6**: Set `ai_analysis_state` = "complete"
- **Step 7**: Hide loading state
- **Step 8**: Display results in `rg_ai_detections`
- **Step 9**: For each detection with DB match:
  - Auto-check `checkbox_confirm_detection` (user can uncheck)
  - Generate remediation activity suggestion
  - Add to `rg_remediation_activities`

**Workflow: Reanalyze Photos**
- **Trigger**: `btn_reanalyze` is clicked
- **Action**: Run "Analyze Photos with Gemini AI" workflow again
- **Note**: Gemini may produce different results

**Workflow: Confirm AI Detection**
- **Trigger**: `checkbox_confirm_detection` is checked/unchecked
- **Action**: Update `checkbox_create_activity` in remediation section
- **If checked**: Include remediation activity in auto-creation
- **If unchecked**: Remove from auto-creation list

**Workflow: Mark as False Positive**
- **Trigger**: `btn_mark_false_positive` is clicked
- **Step 1**: Uncheck `checkbox_confirm_detection`
- **Step 2**: Remove from confirmed detections list
- **Step 3**: Remove from remediation activities
- **Step 4**: Update visual indicators

**Workflow: Complete Activity**
- **Trigger**: `btn_complete_activity` is clicked
- **Step 1**: Validate all required fields completed
  - General data fields
  - Quality check form (all required fields)
  - Signature
  - Confirmation checkbox
- **Step 2**: API Call `call_completeActivity`
  - Parameters:
    - `activityId`: `Current Activity > _id`
    - `completedBy`: `Current User > _id`
    - `endTime`: Current timestamp
    - `actualDurationHours`: Calculated from start/end time
    - `generalData`: All general data
    - `qcData`: All QC form data
    - `photoUrls`: Array of photo URLs
    - `aiDetections`: Array of confirmed detections with DB matches
    - `signature`: Signature image URL
    - `finalNotes`: Final notes text
- **Step 3** (If remediation activities checked): Create remediation activities
  - For each checked activity:
    - API Call `call_createRemediationActivity`
      - Parameters:
        - `productionOrderId`: Current order ID
        - `activityType`: MIPE or MIRFE
        - `triggeredBy`: Current activity ID
        - `pestDiseaseId`: From confirmed AI detection
        - `controlMethod`: Suggested method
        - `urgency`: Calculated urgency
        - `scheduledDate`: Suggested date
        - `assignedUserId`: Selected user
- **Step 4**: Generate activity completion report (PDF)
- **Step 5**: Send notifications to relevant users
- **Step 6**: Navigate to activity completion success page
- **Step 7**: Show summary with links to:
  - View completion report
  - View created remediation activities
  - Return to production order

---

### UI Translations

| Element | English | Spanish |
|---------|---------|---------|
| Page title | Production Orders | Órdenes de Producción |
| New order | + New Order | + Nueva Orden |
| Active | Active | Activas |
| Pending | Pending | Pendientes |
| Completed | Completed | Completadas |
| Cancelled | Cancelled | Canceladas |
| All | All | Todas |
| Search placeholder | Search orders... | Buscar órdenes... |
| Status | Status | Estado |
| Template | Template | Template |
| Start date | Start | Inicio |
| Estimated end | Estimated end | Fin estimado |
| Progress | Progress | Progreso |
| days | days | días |
| Activities | Activities | Actividades |
| completed | completed | completadas |
| overdue | overdue | atrasadas |
| Responsible | Responsible | Responsables |
| more | more | más |
| View order | View Order | Ver Orden |
| View activities | Activities | Actividades |
| Timeline | Timeline | Timeline |
| Verify availability | Verify Availability | Verificar Disponibilidad |
| Approve | Approve | Aprobar |
| Reject | Reject | Rechazar |
| View report | View Report | Ver Reporte |
| Export | Export | Exportar |
| Duplicate | Duplicate | Duplicar |
| Create order | Create New Production Order | Crear Nueva Orden de Producción |
| Production template | Production Template | Template de Producción |
| Select template | Select template | Seleccionar template |
| Template selected | Selected Template | Template Seleccionado |
| phases | phases | fases |
| activities | activities | actividades |
| estimated days | estimated days | días estimados |
| Requires | Requires | Requiere |
| View template detail | View Template Detail | Ver Detalle del Template |
| Order name | Order Name | Nombre de la Orden |
| Cultivar | Cultivar | Cultivar |
| Quantity | Quantity | Cantidad |
| plants | plants | plantas |
| Desired start date | Desired Start Date | Fecha de Inicio Deseada |
| Auto schedule note | Activities will be auto-scheduled from this date | Las actividades se programarán automáticamente desde esta fecha |
| Main responsible | Main Responsible | Responsable Principal |
| Work team | Work Team | Equipo de Trabajo |
| Add | + Add | + Agregar |
| Priority | Priority | Prioridad |
| Low | Low | Baja |
| Medium | Medium | Media |
| High | High | Alta |
| Critical | Critical | Crítica |
| Batch | Batch | Lote |
| Notes | Notes / Special Instructions | Notas / Instrucciones Especiales |
| Projected inventory | PROJECTED INVENTORY | INVENTARIO PROYECTADO |
| from template | (from template) | (desde template) |
| Materials | Materials | Materiales |
| Equipment | Equipment | Equipamiento |
| Available | Available | Disponible |
| Some items low | Some items are below available stock | Algunos items están por debajo del stock disponible |
| Adjust quantities | Adjust Quantities | Ajustar Cantidades |
| View full inventory | View Full Inventory | Ver Inventario Completo |
| Send direct | Send order directly (skip manager approval) | Enviar orden directamente (sin aprobación) |
| Admin only | Only administrators can enable this option | Solo administradores pueden activar esta opción |
| Cancel | Cancel | Cancelar |
| Create order button | Create Production Order | Crear Orden de Producción |
| Activity preview | ACTIVITY PREVIEW | VISTA PREVIA DE ACTIVIDAD |
| Order | Order | Orden |
| Phase | Phase | Fase |
| Scheduling info | SCHEDULING INFORMATION | INFORMACIÓN DE PROGRAMACIÓN |
| Scheduled | Scheduled | Programada |
| Duration | Duration | Duración |
| hour | hour | hora |
| Assigned to | Assigned to | Asignada a |
| you | (you) | (tú) |
| No pending dependencies | No pending dependencies | No hay dependencias pendientes |
| Area available | Area available | Área disponible |
| Activity description | ACTIVITY DESCRIPTION | DESCRIPCIÓN DE LA ACTIVIDAD |
| Special instructions | Special instructions | Instrucciones especiales |
| No inventory required | This activity does not require inventory consumption | Esta actividad no requiere consumo de inventario |
| QC required | QUALITY CHECK REQUIRED | QUALITY CHECK REQUERIDO |
| Fields | Fields | Campos |
| Includes | Includes | Incluye |
| photos and signature | photos and signature | fotografías y firma |
| Preview format | Preview Format | Vista Previa del Formato |
| AI detection | AI DETECTION | DETECCIÓN CON INTELIGENCIA ARTIFICIAL |
| AI enabled | AI Detection enabled for this activity | AI Detection habilitada para esta actividad |
| AI description text | The system will analyze photos you upload to automatically detect pests and diseases | El sistema analizará las fotografías que subas para detectar plagas y enfermedades automáticamente |
| AI confirmation text | You can confirm results and create remediation activities if needed | Podrás confirmar los resultados y crear actividades de remediación si es necesario |
| Ready to start | READY TO START | LISTO PARA INICIAR |
| Start registration text | Starting this activity will record the start time and you can access the full form | Al iniciar esta actividad se registrará la hora de inicio y podrás acceder al formulario completo |
| Ready question | Are you ready to begin this activity? | ¿Estás listo para comenzar esta actividad? |
| Start activity | Start Activity | Iniciar Actividad |
| Activity in progress | ACTIVITY IN PROGRESS | ACTIVIDAD EN PROGRESO |
| Time | Time | Tiempo |
| Est | Est | Est |
| Pause | Pause | Pausar |
| General data | General Data | Datos Generales |
| Quality check | Quality Check | Quality Check |
| Photos | Photos | Fotos |
| Finalize | Finalize | Finalizar |
| Basic information | BASIC INFORMATION | INFORMACIÓN BÁSICA |
| Plants inspected | Plants Inspected | Plantas Inspeccionadas |
| General condition | General Condition | Estado General |
| Excellent | Excellent | Excelente |
| Good | Good | Bueno |
| Fair | Fair | Regular |
| Poor | Poor | Pobre |
| Pests detected | Pests or diseases detected | Se detectaron plagas o enfermedades |
| Check if found | (Check if you found any problems) | (Marcar si encontraste algún problema) |
| General observations | General Observations | Observaciones Generales |
| Auto-saved | Auto-saved X ago | Auto-guardado hace X |
| Inventory consumption | INVENTORY CONSUMPTION | CONSUMO DE INVENTARIO |
| Optional consumption note | This activity has no projected inventory, but you can record additional consumption | Esta actividad no tiene inventario proyectado, pero puedes registrar consumos adicionales |
| Add consumed item | + Add Consumed Item | + Agregar Item Consumido |
| Incidents | INCIDENTS OR PROBLEMS | INCIDENTES O PROBLEMAS |
| Incidents occurred | Incidents occurred during activity | Se presentaron incidentes durante la actividad |
| Save draft | Save Draft | Guardar Borrador |
| Next QC | Next: Quality Check | Siguiente: Quality Check |
| Previous | Previous | Anterior |
| Upload photos | UPLOAD PHOTOGRAPHS | SUBIR FOTOGRAFÍAS |
| Drag images | Drag images here or click to select | Arrastra imágenes aquí o haz click para seleccionar |
| Select files | Select Files | Seleccionar Archivos |
| Take photo | Take Photo | Tomar Foto |
| Formats | Formats: JPG, PNG | Formatos: JPG, PNG |
| Max size | Max: 10 MB per file | Máx: 10 MB por archivo |
| Photos uploaded | PHOTOS UPLOADED | FOTOGRAFÍAS SUBIDAS |
| View | View | Ver |
| Delete | Delete | Eliminar |
| Analyzed no problems | Analyzed, no problems | Analizada, sin problemas |
| AI analysis in progress | AI analysis in progress | Detección AI en proceso |
| Analysis error | Analysis error | Error en análisis |
| AI results | AI DETECTION RESULTS | RESULTADOS DE DETECCIÓN AI |
| Problems detected in photos | Problems detected in X photos | Se detectaron problemas en X fotografías |
| detected | detected | detectados |
| Confidence | Confidence | Confianza |
| Severity | Severity | Severidad |
| Database match | Database match | Coincidencia en base de datos |
| match | match | match |
| Confirm detection | Confirm this detection | Confirmar esta detección |
| View details | View Details | Ver Detalles |
| Mark false positive | Mark as False Positive | Marcar como Falso Positivo |
| Recommended actions | RECOMMENDED ACTIONS | ACCIONES RECOMENDADAS |
| Based on detections | Based on confirmed detections, the system recommends creating the following activities | Basado en las detecciones confirmadas, el sistema recomienda crear las siguientes actividades |
| MIPE | MIPE - Integrated Pest Management | MIPE - Control de Plagas |
| MIRFE | MIRFE - Integrated Disease Management | MIRFE - Control de Enfermedades |
| Control method | Method | Método |
| Urgency | Urgency | Urgencia |
| Schedule | Schedule | Programar |
| Tomorrow | Tomorrow | Mañana |
| In X days | In X days | En X días |
| Auto-create note | These activities will be created automatically when finishing | Estas actividades se crearán automáticamente al finalizar |
| Edit suggested | Edit Suggested Activities | Editar Actividades Sugeridas |
| Activity summary | ACTIVITY SUMMARY | RESUMEN DE LA ACTIVIDAD |
| completed | completed | completados |
| Total time | Total time | Tiempo total |
| Estimated time | Estimated time | Tiempo estimado |
| Difference | Difference | Diferencia |
| within expected range | within expected range | dentro del rango esperado |
| Remediation to create | REMEDIATION ACTIVITIES TO CREATE | ACTIVIDADES DE REMEDIACIÓN A CREAR |
| Scheduled | Scheduled | Programada |
| Assigned to | Assigned to | Asignada a |
| Edit activities | Edit Activities | Editar Actividades |
| Don't create | Don't create activities | No crear actividades |
| Signature and confirmation | SIGNATURE AND CONFIRMATION | FIRMA Y CONFIRMACIÓN |
| Inspector signature | Inspector Signature | Firma del Inspector |
| Signature area | Signature area | Área de firma digital |
| Clear signature | Clear Signature | Limpiar Firma |
| Final notes | Final Notes (optional) | Notas Finales (opcional) |
| Confirm correct | I confirm the recorded information is correct and complete | Confirmo que la información registrada es correcta y completa |
| Important | IMPORTANT | IMPORTANTE |
| When completing | When completing this activity | Al completar esta actividad |
| End time recorded | End time will be recorded | Se registrará la hora de finalización |
| Data locked | Data will be locked (not editable) | Los datos quedarán bloqueados (no editables) |
| Activities created | X remediation activities will be created | Se crearán X actividades de remediación |
| PDF generated | A PDF report will be generated | Se generará un reporte PDF |
| Notify responsible | The order responsible will be notified | Se notificará al responsable de la orden |
| Complete activity | COMPLETE ACTIVITY | COMPLETAR ACTIVIDAD |

### Enum Translations

**Order Status:**
| Value | English | Spanish |
|-------|---------|---------|
| pending | Pending | Pendiente |
| active | Active | Activa |
| completed | Completed | Completada |
| cancelled | Cancelled | Cancelada |

**Activity Status:**
| Value | English | Spanish |
|-------|---------|---------|
| scheduled | Scheduled | Programada |
| in_progress | In Progress | En Progreso |
| completed | Completed | Completada |
| overdue | Overdue | Atrasada |
| cancelled | Cancelled | Cancelada |

**Severity Levels:**
| Value | English | Spanish |
|-------|---------|---------|
| low | Low | Baja |
| medium | Medium | Media |
| high | High | Alta |
| critical | Critical | Crítica |

---

## Notes on Implementation

### Auto-Scheduling Algorithm
When a production order is approved:
1. Set order start date
2. For each phase in order:
   - Calculate phase start date (immediate or after previous phase + wait days)
   - For each activity in phase:
     - If one-time: Schedule on specific day of phase
     - If recurring: Generate instances based on pattern (daily, weekly, etc.)
     - If dependent: Schedule N days after dependency
3. Create activity instances in database with calculated dates
4. Assign to users based on template assignments or order team

### AI Pest/Disease Detection Service
Integration points:
1. **Image Upload**: Photos uploaded to cloud storage
2. **AI Analysis**: Call to ML model (e.g., custom TensorFlow model or third-party API like Google Cloud Vision + custom training)
3. **Detection Results**: Return pest/disease classifications with confidence scores
4. **Database Matching**: Compare AI results with internal pest/disease database
5. **Remediation Suggestions**: Map detected pests/diseases to control methods (MIPE/MIRFE)
6. **Activity Auto-Creation**: Generate remediation activities with suggested methods, schedules, and assignments

### Database Schema Considerations
- **Production Orders**: Status, current phase, progress metrics
- **Activity Instances**: Scheduled datetime, actual start/end, assigned user
- **Activity Execution Data**: General data, QC form data, photos, AI results
- **AI Detections**: Photo reference, detected pest/disease, confidence, user confirmation
- **Remediation Activities**: Triggered by activity, pest/disease reference, control method

### Quality Check Form Rendering
- Store QC template structure as JSON with field definitions
- Dynamically render form fields in Bubble based on template
- Validate required fields on completion
- Store completed form data as JSON for export
- Generate PDF from HTML rendering of completed form

---

This completes MODULE 24 (Production Orders with Auto-Scheduling) and MODULE 25 (Activity Execution with AI Detection) for PHASE 4.
