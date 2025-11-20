# PHASE 3: PRODUCTION & QUALITY TEMPLATES

## Overview

Phase 3 focuses on configuring the templates that will be used during production operations. This includes:
1. **Production Templates** - Multi-phase workflows with scheduled activities
2. **Quality Check Templates** - AI-powered dynamic forms for activity documentation

These templates enable standardized, repeatable processes while maintaining flexibility for different crop types and operational contexts.

## Module Overview

| Module | Page Name | Description |
|--------|-----------|-------------|
| 22 | Production Templates | Create and manage multi-phase production workflows with auto-scheduled activities |
| 23 | Quality Check Templates | AI-powered form creation from PDFs/images for quality documentation |

## Internationalization

All UI text should support both English and Spanish. See translation tables in each module.

---

## MODULE 22: Production Templates with Activity Scheduling

### Purpose
Enable users to create reusable production templates with multiple phases and activities. Activities can be scheduled using complex timing rules (recurring, dependent, day-based), and will auto-schedule when production orders are created.

### Navigation
- **Path**: Dashboard → Production Templates
- **Access**: Managers, Administrators
- **Related Modules**:
  - MODULE 10 (existing production template structure - to be enhanced)
  - MODULE 19 (Inventory - for material requirements)
  - MODULE 23 (Quality Check Templates - for activity forms)

---

### Page 1: Production Template List

**Visual Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ 🏠 Inicio > Templates de Producción    [+ Nuevo Template]  │
├─────────────────────────────────────────────────────────────┤
│ 📊 Total Templates: 12  |  🌱 Cannabis: 5  |  🥬 Otras: 7   │
├─────────────────────────────────────────────────────────────┤
│ [Todos] [Cannabis] [Hortalizas] [Ornamentales] [Otros]     │
├─────────────────────────────────────────────────────────────┤
│ 🔍 Buscar templates...                    [Filtros ▾]      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 🌿 Propagación Cannabis Medicinal              [⋮]    │ │
│ │ Cultivar: Cherry AK  |  5 Fases  |  47 Actividades    │ │
│ │ Duración estimada: 120 días                           │ │
│ │ [Ver Detalle]  [Duplicar]  [Editar]                   │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 🌱 Cultivo Lechuga Hidropónica             [⋮]        │ │
│ │ Cultivar: Lechuga Crespa  |  3 Fases  |  12 Activs.   │ │
│ │ Duración estimada: 35 días                            │ │
│ │ [Ver Detalle]  [Duplicar]  [Editar]                   │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Bubble Elements:**

| Element Name | Type | Data Source / Value |
|--------------|------|---------------------|
| `rg_template_list` | Repeating Group | API: `call_getProductionTemplatesByFacility` |
| `text_template_name` | Text | `Current cell's Production Template > name` |
| `text_cultivar_name` | Text | `Current cell's Production Template > cultivar > name` |
| `text_phase_count` | Text | `Current cell's Production Template > phases:count` |
| `text_activity_count` | Text | `Current cell's Production Template > totalActivities` |
| `text_estimated_duration` | Text | `Current cell's Production Template > estimatedDurationDays` |
| `btn_add_template` | Button | Opens create template popup |
| `btn_view_template` | Button | Navigate to template detail page |
| `btn_duplicate_template` | Button | Workflow: duplicate template |
| `btn_edit_template` | Button | Navigate to template edit page |
| `dropdown_crop_filter` | Dropdown | Static: All, Cannabis, Vegetables, Ornamentals, Other |
| `input_search_templates` | Input | Search by name or cultivar |

**Workflows:**

**Workflow: Load Production Templates**
- **Trigger**: Page load
- **Step 1**: API Call `call_getProductionTemplatesByFacility`
  - Parameters:
    - `facilityId`: `Current User > currentFacilityId`
    - `cropType`: `dropdown_crop_filter's value` (optional)
    - `searchQuery`: `input_search_templates's value` (optional)
- **Step 2**: Display in `rg_template_list`

**Workflow: Create New Template**
- **Trigger**: `btn_add_template` is clicked
- **Action**: Show popup `popup_create_template`

**Workflow: Duplicate Template**
- **Trigger**: `btn_duplicate_template` is clicked
- **Step 1**: API Call `call_duplicateProductionTemplate`
  - Parameters:
    - `templateId`: `Current cell's Production Template > _id`
    - `facilityId`: `Current User > currentFacilityId`
- **Step 2**: Refresh list, show success message

---

### Popup: Create Production Template

**Visual Layout (Two-Column):**
```
┌─────────────────────────────────────────────────────────────┐
│           Crear Nuevo Template de Producción         [✕]   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌─── Información Básica ──┐  ┌─── Configuración ────────┐ │
│ │                          │  │                           │ │
│ │ Nombre del Template *    │  │ Tipo de Cultivo *         │ │
│ │ [________________]       │  │ [Cannabis ▾]              │ │
│ │                          │  │                           │ │
│ │ Cultivar *               │  │ Duración Estimada (días)  │ │
│ │ [Seleccionar ▾]          │  │ [___] (calculado auto)    │ │
│ │                          │  │                           │ │
│ │ Descripción              │  │ Nivel de Experiencia      │ │
│ │ [________________]       │  │ ○ Básico ○ Inter ○ Avanz │ │
│ │ [________________]       │  │                           │ │
│ │ [________________]       │  │ Notas Adicionales         │ │
│ │                          │  │ [____________________]    │ │
│ └──────────────────────────┘  └───────────────────────────┘ │
│                                                              │
│                         [Cancelar]  [Crear Template]        │
└─────────────────────────────────────────────────────────────┘
```

**Bubble Elements:**

| Element Name | Type | Value |
|--------------|------|-------|
| `popup_create_template` | Popup | - |
| `input_template_name` | Input | Text |
| `dropdown_cultivar` | Dropdown | API: `call_getCultivarsByFacility` |
| `dropdown_crop_type` | Dropdown | Static: Cannabis, Vegetables, Ornamentals, Other |
| `input_description` | Multi-line Input | Text |
| `input_estimated_days` | Input | Number (auto-calculated) |
| `radio_experience_level` | Radio Buttons | basic, intermediate, advanced |
| `input_notes` | Multi-line Input | Text |
| `btn_cancel_create` | Button | Hide popup |
| `btn_submit_create_template` | Button | Create template |

**Workflow: Submit Create Template**
- **Trigger**: `btn_submit_create_template` is clicked
- **Step 1**: Validate required fields (name, cultivar, crop type)
- **Step 2** (Only when valid): API Call `call_createProductionTemplate`
  - Parameters:
    - `facilityId`: `Current User > currentFacilityId`
    - `name`: `input_template_name's value`
    - `cultivarId`: `dropdown_cultivar's value`
    - `cropType`: `dropdown_crop_type's value`
    - `description`: `input_description's value`
    - `experienceLevel`: `radio_experience_level's value`
    - `notes`: `input_notes's value`
- **Step 3** (Success): Navigate to template detail page with new template ID
- **Step 4** (Error): Show error message

---

### Page 2: Production Template Detail & Phase Management

**Visual Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ 🏠 > Templates > Propagación Cannabis Medicinal      [⋮]   │
├─────────────────────────────────────────────────────────────┤
│ 📋 Template Info                                            │
│ Cultivar: Cherry AK  |  Tipo: Cannabis  |  120 días est.   │
│ [Editar Info]  [Duplicar]  [Ver Timeline]  [Exportar PDF]  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ FASES DEL TEMPLATE                        [+ Agregar Fase] │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 1️⃣ FASE: Propagación                    [↕] [✏️] [🗑️] │ │
│ │ Duración: 21 días  |  12 actividades programadas       │ │
│ │ Área requerida: Propagación                            │ │
│ │ ┌──────────────────────────────────────────────────┐   │ │
│ │ │ 📅 Actividades Programadas:            [+ Act]   │   │ │
│ │ │                                                   │   │ │
│ │ │ Día 1  │ Siembra en sustrato         │ 🔄 Una vez│   │ │
│ │ │ Día 3  │ Primera irrigación          │ 🔄 Una vez│   │ │
│ │ │ Día 5-21│ Riego + monitoreo          │ 🔁 Lun/Mié│   │ │
│ │ │ Día 7  │ Control de plagas           │ 🔄 Una vez│   │ │
│ │ │ Día 14 │ Quality Check PROP-001      │ 🔄 Una vez│   │ │
│ │ │ Día 21 │ Evaluación pre-trasplante   │ 🔄 Una vez│   │ │
│ │ └──────────────────────────────────────────────────┘   │ │
│ │ [Ver Todas las Actividades] [Ver Inventario Proyectado]│ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 2️⃣ FASE: Vegetativo                     [↕] [✏️] [🗑️] │ │
│ │ Duración: 30 días  |  18 actividades programadas       │ │
│ │ Dependencia: Inicia 1 día después de Fase 1            │ │
│ │ Área requerida: Vegetativo                             │ │
│ │ [Ver Actividades] [Ver Inventario]                     │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Bubble Elements:**

| Element Name | Type | Data Source / Value |
|--------------|------|---------------------|
| `text_template_header` | Text | `Current Template > name` |
| `text_cultivar_info` | Text | `Current Template > cultivar > name` |
| `text_crop_type` | Text | `Current Template > cropType` |
| `text_total_duration` | Text | `Current Template > estimatedDurationDays` |
| `btn_edit_info` | Button | Navigate to edit template info |
| `btn_view_timeline` | Button | Show timeline visualization |
| `btn_export_pdf` | Button | Export template to PDF |
| `rg_phases` | Repeating Group | `Current Template > phases` |
| `text_phase_name` | Text | `Current cell's Phase > name` |
| `text_phase_duration` | Text | `Current cell's Phase > durationDays` |
| `text_phase_activity_count` | Text | `Current cell's Phase > activities:count` |
| `text_phase_area` | Text | `Current cell's Phase > requiredArea > name` |
| `btn_add_phase` | Button | Show create phase popup |
| `btn_reorder_phase` | Button (icon) | Enable drag-to-reorder |
| `btn_edit_phase` | Button (icon) | Show edit phase popup |
| `btn_delete_phase` | Button (icon) | Delete phase (with confirmation) |
| `rg_phase_activities_preview` | Repeating Group | `Current cell's Phase > activities` (limited to 6) |
| `text_activity_day` | Text | Activity scheduling display |
| `text_activity_name` | Text | `Current cell's Activity > name` |
| `icon_activity_type` | Icon | Based on activity type (one-time/recurring) |
| `btn_view_all_activities` | Button | Expand to show all activities |
| `btn_view_inventory` | Button | Show projected inventory for phase |

**Workflows:**

**Workflow: Load Template Details**
- **Trigger**: Page load
- **Step 1**: API Call `call_getProductionTemplateById`
  - Parameters:
    - `templateId`: Get from URL parameter
- **Step 2**: Display template info and phases in repeating group

**Workflow: Add New Phase**
- **Trigger**: `btn_add_phase` is clicked
- **Action**: Show popup `popup_create_phase`

**Workflow: Reorder Phases**
- **Trigger**: `btn_reorder_phase` is clicked, drag event
- **Step 1**: Update phase order numbers locally
- **Step 2**: API Call `call_updatePhaseOrder`
  - Parameters:
    - `templateId`: `Current Template > _id`
    - `phaseOrder`: Array of phase IDs in new order
- **Step 3**: Refresh display

**Workflow: Delete Phase**
- **Trigger**: `btn_delete_phase` is clicked
- **Step 1**: Show confirmation alert
- **Step 2** (If confirmed): API Call `call_deletePhase`
  - Parameters:
    - `phaseId`: `Current cell's Phase > _id`
- **Step 3**: Remove from repeating group, show success message

---

### Popup: Create/Edit Phase

**Visual Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│               Agregar Fase al Template               [✕]   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Nombre de la Fase *                                         │
│ [Propagación_________________________________]              │
│                                                              │
│ Área Requerida *                  Duración Estimada (días) *│
│ [Seleccionar área ▾]              [21___]                   │
│                                                              │
│ Dependencias                                                │
│ ○ Inicia inmediatamente con la orden de producción          │
│ ○ Inicia después de otra fase                               │
│   └─ Fase anterior: [Seleccionar ▾]  Espera: [1] días      │
│                                                              │
│ Descripción                                                 │
│ [Fase inicial de propagación desde semillas_____________]   │
│ [_______________________________________________________]   │
│                                                              │
│ Condiciones Ambientales Recomendadas (opcional)            │
│ Temperatura: [20] - [25] °C    Humedad: [60] - [70] %      │
│ Luz: [18] hrs/día              pH: [5.5] - [6.5]           │
│                                                              │
│                         [Cancelar]  [Guardar Fase]          │
└─────────────────────────────────────────────────────────────┘
```

**Bubble Elements:**

| Element Name | Type | Value |
|--------------|------|-------|
| `popup_create_phase` | Popup | - |
| `input_phase_name` | Input | Text |
| `dropdown_required_area` | Dropdown | API: `call_getAreasByFacility` |
| `input_duration_days` | Input | Number |
| `radio_dependency_type` | Radio Buttons | immediate, after_phase |
| `dropdown_previous_phase` | Dropdown | Current template phases (conditional) |
| `input_wait_days` | Input | Number (conditional, default: 0) |
| `input_description` | Multi-line Input | Text |
| `input_temp_min` | Input | Number |
| `input_temp_max` | Input | Number |
| `input_humidity_min` | Input | Number |
| `input_humidity_max` | Input | Number |
| `input_light_hours` | Input | Number |
| `input_ph_min` | Input | Number |
| `input_ph_max` | Input | Number |
| `btn_cancel_phase` | Button | Hide popup |
| `btn_submit_phase` | Button | Create/update phase |

**Workflow: Submit Create Phase**
- **Trigger**: `btn_submit_phase` is clicked
- **Step 1**: Validate required fields
- **Step 2**: API Call `call_createPhase`
  - Parameters:
    - `templateId`: `Current Template > _id`
    - `name`: `input_phase_name's value`
    - `requiredAreaId`: `dropdown_required_area's value`
    - `durationDays`: `input_duration_days's value`
    - `dependencyType`: `radio_dependency_type's value`
    - `previousPhaseId`: `dropdown_previous_phase's value` (if applicable)
    - `waitDays`: `input_wait_days's value` (if applicable)
    - `description`: `input_description's value`
    - `environmentalConditions`: Object with temp, humidity, light, pH values
- **Step 3**: Hide popup, refresh phase list, show success

---

### Page 3: Activity Management for Phase

**Visual Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ 🏠 > Template > Propagación > Fase: Propagación       [←]  │
├─────────────────────────────────────────────────────────────┤
│ 📅 ACTIVIDADES PROGRAMADAS                 [+ Nueva Activ] │
│ Fase: Propagación  |  21 días  |  12 actividades            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Vista: [○ Lista] [● Timeline] [○ Calendario]                │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ DÍA 1 - Siembra en Sustrato             [✏️] [📋] [🗑️]│ │
│ │ Tipo: Actividad Cultural  |  ⏱️ 2 horas  |  👤 1 pers  │ │
│ │ 📦 Inventario: Sustrato (5kg), Bandejas (10 uds)       │ │
│ │ 📋 Quality Check: No                                   │ │
│ │ 🔄 Programación: Una sola vez - Día 1 de la fase      │ │
│ │ [Ver Detalles]                                         │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ DÍAS 5-21 - Riego y Monitoreo           [✏️] [📋] [🗑️]│ │
│ │ Tipo: Mantenimiento  |  ⏱️ 30 min  |  👤 1 persona     │ │
│ │ 📦 Inventario: Agua (10L), Nutrientes básicos          │ │
│ │ 📋 Quality Check: No                                   │ │
│ │ 🔁 Programación: Recurrente cada Lunes y Miércoles    │ │
│ │    └─ Total: 5 instancias en esta fase                │ │
│ │ [Ver Detalles]                                         │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ DÍA 7 - Inspección de Plagas            [✏️] [📋] [🗑️]│ │
│ │ Tipo: Detección P&E  |  ⏱️ 1 hora  |  👤 1 persona    │ │
│ │ 📦 Inventario: No requiere                             │ │
│ │ 📋 Quality Check: Sí - QC-PEST-001                     │ │
│ │ 🔄 Programación: Una sola vez - Día 7                 │ │
│ │ 🤖 AI Detection: Habilitada para plagas y enfermedades│ │
│ │ [Ver Detalles]                                         │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ DÍA 14 - Quality Check Propagación      [✏️] [📋] [🗑️]│ │
│ │ Tipo: Quality Check  |  ⏱️ 1.5 hrs  |  👤 1 persona   │ │
│ │ 📦 Inventario: No requiere                             │ │
│ │ 📋 Quality Check: Sí - PROP-001 (Formato completo)    │ │
│ │ 🔄 Programación: Una sola vez - Día 14                │ │
│ │ 📄 Dependencias: Después de "Riego" (mismo día)       │ │
│ │ [Ver Detalles]                                         │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Bubble Elements:**

| Element Name | Type | Data Source / Value |
|--------------|------|---------------------|
| `text_phase_header` | Text | `Current Phase > name` |
| `btn_back_to_template` | Button | Navigate back to template detail |
| `btn_add_activity` | Button | Show create activity popup |
| `radio_view_mode` | Radio Buttons | list, timeline, calendar |
| `rg_activities` | Repeating Group | `Current Phase > activities` sorted by scheduledDay |
| `text_activity_name` | Text | `Current cell's Activity > name` |
| `text_activity_day` | Text | Display scheduling info |
| `text_activity_type` | Text | `Current cell's Activity > activityType` |
| `text_duration` | Text | `Current cell's Activity > estimatedDurationHours` |
| `text_people_needed` | Text | `Current cell's Activity > peopleNeeded` |
| `text_inventory_summary` | Text | Summary of projected inventory |
| `text_quality_check` | Text | `Current cell's Activity > qualityCheckTemplate > name` |
| `icon_schedule_type` | Icon | 🔄 one-time, 🔁 recurring |
| `icon_ai_enabled` | Icon | 🤖 if AI detection enabled |
| `btn_edit_activity` | Button (icon) | Show edit activity popup |
| `btn_duplicate_activity` | Button (icon) | Duplicate activity |
| `btn_delete_activity` | Button (icon) | Delete activity |
| `btn_view_details` | Button | Expand activity details |

**Workflows:**

**Workflow: Load Phase Activities**
- **Trigger**: Page load
- **Step 1**: API Call `call_getPhaseById`
  - Parameters:
    - `phaseId`: Get from URL parameter
- **Step 2**: Display phase info and activities
- **Step 3**: Calculate total activity instances (including recurring)

**Workflow: Add New Activity**
- **Trigger**: `btn_add_activity` is clicked
- **Action**: Show popup `popup_create_activity`

**Workflow: Delete Activity**
- **Trigger**: `btn_delete_activity` is clicked
- **Step 1**: Confirm deletion
- **Step 2**: API Call `call_deleteActivity`
  - Parameters:
    - `activityId`: `Current cell's Activity > _id`
- **Step 3**: Remove from display, show success

---

### Popup: Create/Edit Activity (Complex Form)

**Visual Layout (Multi-Section):**
```
┌──────────────────────────────────────────────────────────────┐
│            Agregar Actividad a la Fase                [✕]    │
├──────────────────────────────────────────────────────────────┤
│ INFORMACIÓN BÁSICA                                           │
│                                                               │
│ Nombre de la Actividad *                                     │
│ [Riego y monitoreo de plántulas______________________]      │
│                                                               │
│ Tipo de Actividad *                    Duración estimada *  │
│ [Mantenimiento ▾]                      [30] minutos          │
│                                                               │
│ Personas Necesarias                    Prioridad             │
│ [1]                                    [Media ▾]             │
│                                                               │
│ Descripción                                                  │
│ [Realizar riego manual y observar desarrollo________]       │
│ [___________________________________________________]        │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│ ⏰ PROGRAMACIÓN                                              │
│                                                               │
│ Tipo de Programación *                                       │
│ ○ Una sola vez en un día específico                         │
│ ● Recurrente durante la fase                                │
│ ○ Después de otra actividad (dependiente)                   │
│                                                               │
│ [Configuración según tipo seleccionado]                     │
│                                                               │
│ ┌─ Para "Una sola vez" ──────────────────────────────────┐  │
│ │ Día de la Fase: [14]                                   │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                               │
│ ┌─ Para "Recurrente" ────────────────────────────────────┐  │
│ │ Frecuencia:                                            │  │
│ │ ○ Todos los días desde día [__] hasta día [__]        │  │
│ │ ● Días específicos de la semana:                       │  │
│ │   ☐ L  ☑ M  ☐ Mi  ☑ J  ☐ V  ☐ S  ☐ D                 │  │
│ │ ○ Cada [3] días, desde día [1]                        │  │
│ │                                                         │  │
│ │ Rango de días: Desde [5] hasta [21] (fin de fase)     │  │
│ │ 📊 Vista previa: Se crearán 5 instancias               │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                               │
│ ┌─ Para "Dependiente" ───────────────────────────────────┐  │
│ │ Actividad previa: [Siembra en sustrato ▾]             │  │
│ │ Días después: [0] (0 = mismo día)                     │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│ 📦 INVENTARIO PROYECTADO                [+ Agregar Item]    │
│                                                               │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ Item          │ Cantidad │ Unidad │ Tipo       │ [🗑️]  │  │
│ │ Agua          │ 10       │ Litros │ Material   │       │  │
│ │ Nutriente A   │ 50       │ ml     │ Material   │       │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│ 📋 QUALITY CHECK & AI                                        │
│                                                               │
│ ☐ Requiere Quality Check                                    │
│ └─ Template: [Seleccionar formato ▾]                        │
│                                                               │
│ ☐ Habilitar detección de plagas/enfermedades con AI         │
│    (Solo para actividades de tipo "Detección P&E")          │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│ CONFIGURACIÓN ADICIONAL                                      │
│                                                               │
│ Instrucciones Especiales                                    │
│ [Observar color de hojas y humedad del sustrato______]     │
│ [___________________________________________________]        │
│                                                               │
│ Alertas                                                      │
│ ☑ Notificar 1 día antes                                     │
│ ☐ Notificar cuando esté disponible                          │
│                                                               │
│                    [Cancelar]  [Guardar Actividad]           │
└──────────────────────────────────────────────────────────────┘
```

**Bubble Elements:**

| Element Name | Type | Value |
|--------------|------|-------|
| `popup_create_activity` | Popup | Multi-section form |
| **Basic Info Section** |
| `input_activity_name` | Input | Text |
| `dropdown_activity_type` | Dropdown | Static: Cultural, Maintenance, Movement, Pest Detection, MIPE, MIRFE, Quality Check, Harvest |
| `input_duration_hours` | Input | Number (decimal) |
| `input_people_needed` | Input | Number |
| `dropdown_priority` | Dropdown | Static: Low, Medium, High, Critical |
| `input_description` | Multi-line Input | Text |
| **Scheduling Section** |
| `radio_schedule_type` | Radio Buttons | one_time, recurring, dependent |
| `group_schedule_one_time` | Group | Conditional: visible when one_time |
| `input_phase_day` | Input | Number (1 to phase duration) |
| `group_schedule_recurring` | Group | Conditional: visible when recurring |
| `radio_frequency_type` | Radio Buttons | daily_range, specific_days, every_n_days |
| `input_start_day` | Input | Number |
| `input_end_day` | Input | Number |
| `checkbox_monday` | Checkbox | Boolean |
| `checkbox_tuesday` | Checkbox | Boolean |
| `checkbox_wednesday` | Checkbox | Boolean |
| `checkbox_thursday` | Checkbox | Boolean |
| `checkbox_friday` | Checkbox | Boolean |
| `checkbox_saturday` | Checkbox | Boolean |
| `checkbox_sunday` | Checkbox | Boolean |
| `input_interval_days` | Input | Number |
| `text_instance_preview` | Text | Calculated: number of instances |
| `group_schedule_dependent` | Group | Conditional: visible when dependent |
| `dropdown_previous_activity` | Dropdown | Current phase activities |
| `input_days_after` | Input | Number (0 = same day) |
| **Inventory Section** |
| `rg_projected_inventory` | Repeating Group | Custom list (not from DB yet) |
| `btn_add_inventory_item` | Button | Add row to inventory list |
| `dropdown_inventory_item` | Dropdown | API: `call_getInventoryByFacility` |
| `input_quantity` | Input | Number |
| `input_unit` | Input | Text |
| `text_item_type` | Text | From selected inventory item |
| `btn_remove_inventory` | Button | Remove row |
| **Quality Check & AI Section** |
| `checkbox_requires_qc` | Checkbox | Boolean |
| `dropdown_qc_template` | Dropdown | API: `call_getQualityCheckTemplates` (conditional) |
| `checkbox_enable_ai_detection` | Checkbox | Boolean (conditional: only for Pest Detection type) |
| **Additional Config** |
| `input_special_instructions` | Multi-line Input | Text |
| `checkbox_notify_day_before` | Checkbox | Boolean |
| `checkbox_notify_available` | Checkbox | Boolean |
| `btn_cancel_activity` | Button | Hide popup |
| `btn_submit_activity` | Button | Create/update activity |

**Workflow: Submit Create Activity**
- **Trigger**: `btn_submit_activity` is clicked
- **Step 1**: Validate required fields
- **Step 2**: Build scheduling object based on selected type
- **Step 3**: Build projected inventory array
- **Step 4**: API Call `call_createActivity`
  - Parameters:
    - `phaseId`: `Current Phase > _id`
    - `name`: `input_activity_name's value`
    - `activityType`: `dropdown_activity_type's value`
    - `estimatedDurationHours`: `input_duration_hours's value`
    - `peopleNeeded`: `input_people_needed's value`
    - `priority`: `dropdown_priority's value`
    - `description`: `input_description's value`
    - `scheduling`: Scheduling object with type and configuration
    - `projectedInventory`: Array of inventory items
    - `requiresQualityCheck`: `checkbox_requires_qc's value`
    - `qualityCheckTemplateId`: `dropdown_qc_template's value` (if applicable)
    - `enableAiDetection`: `checkbox_enable_ai_detection's value`
    - `specialInstructions`: `input_special_instructions's value`
    - `notifications`: Object with notification preferences
- **Step 5**: Hide popup, refresh activity list, show success
- **Step 6**: Recalculate phase duration and total activities

**Workflow: Calculate Recurring Instances**
- **Trigger**: Any scheduling input changes
- **Action**: Calculate and display number of activity instances that will be created
- **Logic**:
  - For daily range: `(end_day - start_day) + 1`
  - For specific days: Count matching weekdays in date range
  - For every N days: `floor((end_day - start_day) / interval) + 1`

---

### UI Translations

| Element | English | Spanish |
|---------|---------|---------|
| Page title | Production Templates | Templates de Producción |
| New template button | + New Template | + Nuevo Template |
| Total templates | Total Templates | Total Templates |
| Search placeholder | Search templates... | Buscar templates... |
| Filters | Filters | Filtros |
| Cultivar | Cultivar | Cultivar |
| Phases | Phases | Fases |
| Activities | Activities | Actividades |
| Estimated duration | Estimated duration | Duración estimada |
| days | days | días |
| View detail | View Detail | Ver Detalle |
| Duplicate | Duplicate | Duplicar |
| Edit | Edit | Editar |
| Create template | Create New Production Template | Crear Nuevo Template de Producción |
| Basic information | Basic Information | Información Básica |
| Template name | Template Name | Nombre del Template |
| Description | Description | Descripción |
| Crop type | Crop Type | Tipo de Cultivo |
| Experience level | Experience Level | Nivel de Experiencia |
| Basic | Basic | Básico |
| Intermediate | Intermediate | Intermedio |
| Advanced | Advanced | Avanzado |
| Additional notes | Additional Notes | Notas Adicionales |
| Cancel | Cancel | Cancelar |
| Save | Save | Guardar |
| Template phases | Template Phases | Fases del Template |
| Add phase | + Add Phase | + Agregar Fase |
| Phase name | Phase Name | Nombre de la Fase |
| Required area | Required Area | Área Requerida |
| Duration (days) | Duration (days) | Duración (días) |
| Dependencies | Dependencies | Dependencias |
| Starts immediately | Starts immediately with production order | Inicia inmediatamente con la orden de producción |
| After another phase | Starts after another phase | Inicia después de otra fase |
| Previous phase | Previous phase | Fase anterior |
| Wait | Wait | Espera |
| Environmental conditions | Recommended Environmental Conditions | Condiciones Ambientales Recomendadas |
| Temperature | Temperature | Temperatura |
| Humidity | Humidity | Humedad |
| Light | Light | Luz |
| hrs/day | hrs/day | hrs/día |
| Scheduled activities | Scheduled Activities | Actividades Programadas |
| New activity | + New Activity | + Nueva Actividad |
| Activity name | Activity Name | Nombre de la Actividad |
| Activity type | Activity Type | Tipo de Actividad |
| People needed | People Needed | Personas Necesarias |
| Priority | Priority | Prioridad |
| Low | Low | Baja |
| Medium | Medium | Media |
| High | High | Alta |
| Critical | Critical | Crítica |
| Scheduling | Scheduling | Programación |
| Schedule type | Schedule Type | Tipo de Programación |
| One time | One time on specific day | Una sola vez en un día específico |
| Recurring | Recurring during phase | Recurrente durante la fase |
| Dependent | After another activity | Después de otra actividad |
| Phase day | Phase Day | Día de la Fase |
| Frequency | Frequency | Frecuencia |
| Every day | Every day from day X to day Y | Todos los días desde día X hasta día Y |
| Specific days | Specific days of the week | Días específicos de la semana |
| Every N days | Every N days, starting day X | Cada N días, desde día X |
| From | From | Desde |
| To | To | Hasta |
| Preview | Preview: X instances will be created | Vista previa: Se crearán X instancias |
| Previous activity | Previous activity | Actividad previa |
| Days after | Days after | Días después |
| same day | (0 = same day) | (0 = mismo día) |
| Projected inventory | Projected Inventory | Inventario Proyectado |
| Add item | + Add Item | + Agregar Item |
| Item | Item | Item |
| Quantity | Quantity | Cantidad |
| Unit | Unit | Unidad |
| Type | Type | Tipo |
| Quality check | Quality Check & AI | Quality Check & AI |
| Requires QC | Requires Quality Check | Requiere Quality Check |
| Template | Template | Template |
| Enable AI detection | Enable pest/disease detection with AI | Habilitar detección de plagas/enfermedades con AI |
| Only for pest detection | (Only for "Pest Detection" activity type) | (Solo para actividades de tipo "Detección P&E") |
| Additional config | Additional Configuration | Configuración Adicional |
| Special instructions | Special Instructions | Instrucciones Especiales |
| Alerts | Alerts | Alertas |
| Notify day before | Notify 1 day before | Notificar 1 día antes |
| Notify available | Notify when available | Notificar cuando esté disponible |

### Enum Translations

**Activity Types:**
| Value | English | Spanish |
|-------|---------|---------|
| cultural | Cultural Work | Actividad Cultural |
| maintenance | Maintenance | Mantenimiento |
| movement | Movement/Transfer | Traslado |
| pest_detection | Pest & Disease Detection | Detección P&E |
| mipe | MIPE (Integrated Pest Management) | MIPE |
| mirfe | MIRFE (Integrated Disease Management) | MIRFE |
| quality_check | Quality Check | Quality Check |
| harvest | Harvest | Cosecha |

**Crop Types:**
| Value | English | Spanish |
|-------|---------|---------|
| cannabis | Cannabis | Cannabis |
| vegetables | Vegetables | Hortalizas |
| ornamentals | Ornamentals | Ornamentales |
| other | Other | Otros |

**Frequency Types:**
| Value | English | Spanish |
|-------|---------|---------|
| daily_range | Daily (range) | Diario (rango) |
| specific_days | Specific days of week | Días específicos |
| every_n_days | Every N days | Cada N días |

---

## MODULE 23: AI Quality Check Templates (Simplified)

### Purpose
Enable users to create digital quality check forms by uploading existing PDFs or images. Google Gemini AI generates ready-to-use HTML forms that can be rendered in Bubble during activity execution.

**Simplified Approach**: One API call to Gemini → Returns HTML → Store and render directly.

### Navigation
- **Path**: Dashboard → Quality Check Templates
- **Access**: Managers, Administrators
- **Related Modules**:
  - MODULE 22 (Production Templates - activities can reference QC templates)
  - MODULE 25 (Activity Execution - where QC templates are filled)

### Key AI Integration Points
1. **Document Upload**: PDF or image of existing form
2. **Gemini AI Processing**: Single API call generates complete HTML form
3. **Template Storage**: HTML code stored in database
4. **Direct Rendering**: Bubble displays HTML in iframe/HTML element
5. **Regenerate**: User can regenerate if result isn't perfect (no manual editing)

---

### Page 1: Quality Check Template List

**Visual Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ 🏠 Inicio > Templates de Quality Check  [+ Nuevo Template] │
├─────────────────────────────────────────────────────────────┤
│ 📊 Total Templates: 18  |  🌱 Predefinidos: 12  |  📝 Custom: 6│
├─────────────────────────────────────────────────────────────┤
│ [Todos] [Predefinidos] [Personalizados] [Por Actividad]    │
├─────────────────────────────────────────────────────────────┤
│ 🔍 Buscar templates...                    [Filtros ▾]      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 📋 Control de Calidad - Propagación        [⭐] [⋮]   │ │
│ │ Tipo: Predefinido  |  Cultivo: Cannabis                │ │
│ │ Última actualización: 15/03/2025                       │ │
│ │ 12 campos  |  Usado en 5 templates de producción       │ │
│ │ [Ver Template]  [Duplicar]  [Vista Previa]             │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 📋 Inspección de Plagas y Enfermedades    [🤖] [⋮]    │ │
│ │ Tipo: Personalizado (Creado con AI)                   │ │
│ │ Creado: 10/03/2025  |  Por: Juan Manager              │ │
│ │ 18 campos  |  Incluye sección de fotos                │ │
│ │ [Ver Template]  [Editar]  [Exportar]  [Vista Previa]  │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 📋 Control Ambiental - Vegetativo          [⋮]        │ │
│ │ Tipo: Predefinido  |  Cultivo: Cannabis                │ │
│ │ Última actualización: 01/03/2025                       │ │
│ │ 8 campos  |  Usado en 3 templates                      │ │
│ │ [Ver Template]  [Duplicar]  [Vista Previa]             │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Bubble Elements:**

| Element Name | Type | Data Source / Value |
|--------------|------|---------------------|
| `rg_qc_template_list` | Repeating Group | API: `call_getQualityCheckTemplatesByFacility` |
| `text_template_name` | Text | `Current cell's QC Template > name` |
| `text_template_type` | Text | `Current cell's QC Template > type` (predefined/custom) |
| `icon_ai_created` | Icon | 🤖 if created with AI |
| `icon_predefined` | Icon | ⭐ if predefined |
| `text_crop_type` | Text | `Current cell's QC Template > cropType` |
| `text_last_updated` | Text | `Current cell's QC Template > updatedAt` |
| `text_field_count` | Text | `Current cell's QC Template > fields:count` |
| `text_usage_count` | Text | Count of production templates using this |
| `btn_add_template` | Button | Show create options popup |
| `btn_view_template` | Button | Navigate to template detail |
| `btn_duplicate_template` | Button | Duplicate template |
| `btn_preview_template` | Button | Show preview of template rendering |
| `btn_edit_template` | Button | Navigate to template editor |
| `btn_export_template` | Button | Export template definition (JSON) |
| `dropdown_filter_type` | Dropdown | All, Predefined, Custom, By Activity |
| `input_search_templates` | Input | Search by name |

**Workflows:**

**Workflow: Load QC Templates**
- **Trigger**: Page load
- **Step 1**: API Call `call_getQualityCheckTemplatesByFacility`
  - Parameters:
    - `facilityId`: `Current User > currentFacilityId`
    - `filterType`: `dropdown_filter_type's value`
    - `searchQuery`: `input_search_templates's value`
- **Step 2**: Display in repeating group

**Workflow: Create New Template (Show Options)**
- **Trigger**: `btn_add_template` is clicked
- **Action**: Show popup `popup_create_method`

---

### Popup: Choose Template Creation Method

**Visual Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│           Crear Nuevo Template de Quality Check      [✕]   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Selecciona cómo deseas crear el template:                  │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │                   🤖 CON INTELIGENCIA ARTIFICIAL       │ │
│ │                                                         │ │
│ │  Sube un PDF o imagen de tu formato existente y la AI │ │
│ │  extraerá automáticamente la estructura y campos.     │ │
│ │                                                         │ │
│ │  Ideal para: Formatos complejos, documentos escaneados│ │
│ │                                                         │ │
│ │              [Crear con AI →]                          │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │                   ✏️ MANUALMENTE                        │ │
│ │                                                         │ │
│ │  Crea un template desde cero agregando campos uno     │ │
│ │  por uno según tus necesidades específicas.            │ │
│ │                                                         │ │
│ │  Ideal para: Formatos simples, casos específicos      │ │
│ │                                                         │ │
│ │              [Crear Manualmente →]                     │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │                   📋 DESDE PREDEFINIDO                  │ │
│ │                                                         │ │
│ │  Duplica y personaliza uno de nuestros templates      │ │
│ │  predefinidos según tu tipo de cultivo.                │ │
│ │                                                         │ │
│ │  Ideal para: Empezar rápido, procesos estándar        │ │
│ │                                                         │ │
│ │              [Ver Predefinidos →]                      │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│                              [Cancelar]                      │
└─────────────────────────────────────────────────────────────┘
```

**Bubble Elements:**

| Element Name | Type | Value |
|--------------|------|-------|
| `popup_create_method` | Popup | - |
| `btn_create_with_ai` | Button | Navigate to AI creation flow |
| `btn_create_manually` | Button | Navigate to manual editor |
| `btn_from_predefined` | Button | Show predefined templates |
| `btn_cancel_method` | Button | Hide popup |

---

### Page 2: AI Template Creation (Simplified - 2 Steps)

**Step 1: Upload Document & Generate**

**Visual Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ 🏠 > QC Templates > Crear con AI                      [←]  │
├─────────────────────────────────────────────────────────────┤
│              🤖 CREAR TEMPLATE CON INTELIGENCIA ARTIFICIAL  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Información del Template                                    │
│                                                              │
│ Nombre del Template *                                       │
│ [Control de Calidad - Propagación____________________]     │
│                                                              │
│ Tipo de Cultivo *              Categoría *                 │
│ [Cannabis ▾]                   [Propagación ▾]              │
│                                                              │
│ Descripción breve                                           │
│ [Formato para control de calidad en fase de propagación]   │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Subir Documento Original                                   │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │                                                         │ │
│ │                  📄 Arrastra tu archivo aquí            │ │
│ │                       o haz click para buscar           │ │
│ │                                                         │ │
│ │           Formatos soportados: PDF, PNG, JPG, JPEG     │ │
│ │                 Tamaño máximo: 10 MB                   │ │
│ │                                                         │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ Archivo seleccionado:                                       │
│ 📄 CONTROL-CALIDAD-PROPAGACION.pdf (2.4 MB)     [Cambiar] │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 💡 TIPS PARA MEJORES RESULTADOS:                       │ │
│ │                                                         │ │
│ │ • Usa archivos de alta resolución (mínimo 150 DPI)    │ │
│ │ • Asegúrate de que el texto sea legible                │ │
│ │ • Si es un PDF escaneado, verifica que no esté rotado │ │
│ │ • Gemini AI se adapta a cualquier estructura          │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│                   [Cancelar]  [🤖 Generar Template con IA] │
└─────────────────────────────────────────────────────────────┘
```

**Loading State (during AI generation):**
```
┌─────────────────────────────────────────────────────────────┐
│              🤖 GENERANDO TEMPLATE CON IA...                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ ⏳ Analizando documento con Gemini AI...               │ │
│ │                                                         │ │
│ │ [████████████████████░░░░░░░░░] 75%                    │ │
│ │                                                         │ │
│ │ Tiempo estimado: ~30 segundos                          │ │
│ │ Por favor espera...                                    │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Step 2: Preview & Confirm (or Regenerate)**

**Visual Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ 🏠 > QC Templates > Crear con AI                      [←]  │
├─────────────────────────────────────────────────────────────┤
│              ✅ TEMPLATE GENERADO POR IA                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Vista Previa: Así se verá el template en las actividades   │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ [HTML IFRAME - Renders generated HTML template]       │ │
│ │                                                         │ │
│ │ CONTROL DE CALIDAD - PROPAGACIÓN                       │ │
│ │                                                         │ │
│ │ Fecha de Inspección [__/__/____]  Inspector [_______] │ │
│ │                                                         │ │
│ │ Lote/Batch Number [_______________________________]   │ │
│ │                                                         │ │
│ │ Estado General de Plantas                              │ │
│ │ ○ Excelente  ○ Bueno  ○ Regular  ○ Pobre              │ │
│ │                                                         │ │
│ │ Altura Promedio (cm) [___]  Plantas Totales [___]     │ │
│ │                                                         │ │
│ │ Color de Hojas                                         │ │
│ │ ☐ Verde oscuro  ☐ Verde claro  ☐ Amarillento          │ │
│ │ ☐ Manchas        ☐ Necrosis                            │ │
│ │                                                         │ │
│ │ Observaciones                                          │ │
│ │ [____________________________________________]         │ │
│ │ [____________________________________________]         │ │
│ │                                                         │ │
│ │ Firma Inspector [_________]  Fecha [__/__/____]       │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ¿El template captura correctamente tu formato original?    │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ ℹ️ Nota: Si el resultado no es perfecto, puedes       │ │
│ │ regenerarlo. Gemini puede producir resultados          │ │
│ │ ligeramente diferentes en cada intento.                │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│  [← Volver]  [🔄 Regenerar]  [Cancelar]  [✅ Confirmar y Guardar] │
└─────────────────────────────────────────────────────────────┘
```

**Bubble Elements for AI Creation Flow (Simplified):**

| Element Name | Type | Value |
|--------------|------|-------|
| **Step 1: Upload & Generate** |
| `page_ai_template_create` | Page | AI template creation page |
| `text_breadcrumb_ai` | Text | "🏠 > QC Templates > Crear con AI" |
| `text_page_title_ai` | Text | "🤖 CREAR TEMPLATE CON INTELIGENCIA ARTIFICIAL" |
| `group_template_info` | Group | Basic template information form |
| `input_template_name_ai` | Input | Text, required |
| `dropdown_crop_type_ai` | Dropdown | Cannabis, Coffee, Other |
| `dropdown_category_ai` | Dropdown | Propagación, Vegetativo, Floración, Cosecha, Control de Plagas, Ambiental, Otro |
| `group_document_upload` | Group | File upload section |
| `uploader_document` | File Uploader | Accept: .pdf, .png, .jpg, .jpeg, Max: 10MB |
| `text_uploaded_file` | Text | Display: "{filename} ({size})" |
| `btn_change_file` | Button | Clear and re-upload |
| `group_tips` | Group | Tips box |
| `btn_cancel_ai` | Button | Cancel and go back |
| `btn_generate_with_ai` | Button | "🤖 Generar Template con IA" - Primary action |
| **Loading State** |
| `group_loading_state` | Group | Shows during Gemini processing |
| `text_loading_title` | Text | "🤖 GENERANDO TEMPLATE CON IA..." |
| `text_loading_message` | Text | "⏳ Analizando documento con Gemini AI..." |
| `progress_bar` | Progress Bar | Animated progress |
| `text_estimated_time` | Text | "Tiempo estimado: ~30 segundos" |
| **Step 2: Preview & Confirm** |
| `text_success_title` | Text | "✅ TEMPLATE GENERADO POR IA" |
| `text_preview_label` | Text | "Vista Previa: Así se verá el template en las actividades" |
| `group_html_preview` | Group | HTML rendering container |
| `html_template_iframe` | HTML Element / iFrame | Renders `htmlTemplate` from API response |
| `text_question` | Text | "¿El template captura correctamente tu formato original?" |
| `group_note` | Group | Info note about regeneration |
| `btn_back` | Button | "← Volver" - Go back to Step 1 |
| `btn_regenerate` | Button | "🔄 Regenerar" - Call API again |
| `btn_cancel_preview` | Button | "Cancelar" - Cancel creation |
| `btn_confirm_save` | Button | "✅ Confirmar y Guardar" - Primary action |
| **Custom States** |
| `current_step` | State (number) | 1 or 2 |
| `generated_html` | State (text) | Stores HTML from Gemini API |
| `template_data` | State (object) | Stores template metadata |

**Workflows:**

**Workflow: Generate Template with AI**
- **Trigger**: `btn_generate_with_ai` is clicked
- **Step 1**: Validate required fields (name, crop type, category, file uploaded)
- **Step 2**: Show loading state (`group_loading_state` visible)
- **Step 3**: Upload file to storage (if not already uploaded)
  - Get secure file URL
- **Step 4**: API Call `call_generateQCTemplateFromDocument` (Gemini API)
  - Parameters:
    - `facilityId`: `Current User > currentFacilityId`
    - `fileUrl`: File URL from uploader
    - `templateName`: `input_template_name_ai's value`
    - `cropType`: `dropdown_crop_type_ai's value`
    - `category`: `dropdown_category_ai's value`
  - Returns: `{ templateId, htmlCode }`
- **Step 5**: Store HTML in custom state `generated_html`
- **Step 6**: Store template metadata in custom state `template_data`
- **Step 7**: Hide loading state
- **Step 8**: Set `current_step` = 2 (show preview)

**Workflow: Regenerate Template**
- **Trigger**: `btn_regenerate` is clicked
- **Step 1**: Confirm with user ("¿Regenerar? El resultado puede variar.")
- **Step 2**: Go back to Step 1 (set `current_step` = 1)
- **Step 3**: Keep form data but allow re-generation
- **Note**: User can modify inputs and click generate again

**Workflow: Confirm and Save Template**
- **Trigger**: `btn_confirm_save` is clicked
- **Step 1**: API Call `call_saveQualityCheckTemplate`
  - Parameters:
    - `facilityId`: `Current User > currentFacilityId`
    - `name`: From `template_data`
    - `cropType`: From `template_data`
    - `category`: From `template_data`
    - `type`: "custom"
    - `createdWithAI`: true
    - `originalDocumentUrl`: File URL
    - `htmlTemplate`: From `generated_html` state
  - Returns: `{ templateId }`
- **Step 2**: Show success message: "Template creado exitosamente"
- **Step 3**: Navigate to template detail page
  - Send parameter: `id` = `templateId`
- **Step 4**: Clear custom states

**Workflow: Cancel Creation**
- **Trigger**: `btn_cancel_ai` or `btn_cancel_preview` is clicked
- **Step 1**: Confirm if user wants to discard
- **Step 2**: Clear custom states
- **Step 3**: Navigate back to template list page

---

### Page 3: Quality Check Template Detail

**Visual Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ 🏠 > QC Templates > Control de Calidad - Propagación [←]  │
├─────────────────────────────────────────────────────────────┤
│ 📋 Template Info                                      [⋮]  │
│ Tipo: Personalizado (Creado con AI 🤖)                     │
│ Cultivo: Cannabis  |  Categoría: Propagación               │
│ Creado: 10/03/2025  |  Por: Juan Manager                   │
│                                                              │
│ [Duplicar]  [Ver Original]  [Regenerar Template]           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ 📊 ESTADÍSTICAS DE USO                                      │
│ Usado en 5 templates de producción                         │
│ Completado 127 veces en los últimos 30 días                │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ 📄 VISTA PREVIA DEL TEMPLATE                                │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ [HTML IFRAME - Renders htmlTemplate from database]    │ │
│ │                                                         │ │
│ │ CONTROL DE CALIDAD - PROPAGACIÓN                       │ │
│ │                                                         │ │
│ │ [Complete HTML form rendered here]                     │ │
│ │ [All fields, styling, structure from Gemini]           │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ℹ️ Este template fue generado con IA. Si necesitas         │
│ modificarlo, puedes regenerarlo con un documento            │
│ actualizado.                                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Page Name**: `qc-template-detail`

**URL Parameter**: `id` (template ID)

**Bubble Elements:**

| Element Name | Type | Data Source / Value |
|--------------|------|---------------------|
| `text_breadcrumb_detail` | Text | Dynamic breadcrumb with template name |
| `text_template_name_detail` | Text | `Current QC Template > name` |
| `text_template_type` | Text | `Current QC Template > type` |
| `icon_created_with_ai` | Icon | Show if `createdWithAI = true` (🤖) |
| `text_crop_type_detail` | Text | `Current QC Template > cropType` |
| `text_category_detail` | Text | `Current QC Template > category` |
| `text_created_date` | Text | `Current QC Template > createdAt` (formatted) |
| `text_created_by` | Text | `Current QC Template > createdBy > name` |
| `btn_menu_template` | Button | "⋮" - Menu dropdown |
| `btn_duplicate_template` | Button | Duplicate this template |
| `btn_view_original` | Button | Show original uploaded document |
| `btn_regenerate_template` | Button | Regenerate with same/different document |
| `text_usage_in_templates` | Text | Count from production templates |
| `text_completion_count` | Text | Count from completed activities |
| `group_html_preview` | Group | HTML rendering container |
| `html_template_display` | HTML Element / iFrame | Renders `Current QC Template > htmlTemplate` |
| `text_ai_note` | Text | Info message about AI-generated templates |

**Workflows:**

**Workflow: Load Template Detail**
- **Trigger**: Page load
- **Step 1**: API Call `call_getQualityCheckTemplateById`
  - Parameters:
    - `templateId`: Get from URL parameter `id`
    - `facilityId`: `Current User > currentFacilityId`
  - Returns: Template object with `htmlTemplate` field
- **Step 2**: Display template metadata (name, type, crop, category, dates)
- **Step 3**: Render HTML preview
  - Insert `htmlTemplate` into `html_template_display` element
- **Step 4**: Load usage statistics
  - Query production templates that reference this QC template
  - Query completed activities that used this template

**Workflow: Duplicate Template**
- **Trigger**: `btn_duplicate_template` is clicked
- **Step 1**: Confirm with user: "¿Duplicar este template?"
- **Step 2**: API Call `call_duplicateQualityCheckTemplate`
  - Parameters:
    - `templateId`: Current template ID
    - `facilityId`: `Current User > currentFacilityId`
  - Creates new template with " (Copia)" appended to name
  - Returns: `{ newTemplateId }`
- **Step 3**: Navigate to new template detail page
- **Step 4**: Show success message: "Template duplicado exitosamente"

**Workflow: View Original Document**
- **Trigger**: `btn_view_original` is clicked
- **Condition**: Only if `createdWithAI = true` and `originalDocumentUrl` exists
- **Action**: Open `originalDocumentUrl` in new tab or lightbox viewer

**Workflow: Regenerate Template**
- **Trigger**: `btn_regenerate_template` is clicked
- **Step 1**: Navigate to AI creation page with pre-filled data
  - Pass current template name, crop type, category
  - Allow user to upload same or different document
- **Step 2**: Follow normal AI generation flow
- **Step 3**: On confirmation, update existing template (don't create new one)
  - API Call `call_updateQualityCheckTemplate`
  - Update `htmlTemplate` field with new HTML
  - Update `updatedAt` timestamp

---

### UI Translations (Simplified 2-Step Flow)

| Element | English | Spanish |
|---------|---------|---------|
| **List Page** |
| Page title | Quality Check Templates | Templates de Control de Calidad |
| New template | + New Template | + Nuevo Template |
| Total templates | Total Templates | Total Templates |
| Predefined | Predefined | Predefinidos |
| Custom | Custom | Personalizados |
| By activity | By Activity | Por Actividad |
| Search placeholder | Search templates... | Buscar templates... |
| Last updated | Last updated | Última actualización |
| Used in | Used in X production templates | Usado en X templates de producción |
| View template | View Template | Ver Template |
| **Creation Method Popup** |
| Create method | Choose Template Creation Method | Selecciona cómo crear el template |
| With AI | With Artificial Intelligence | Con Inteligencia Artificial |
| AI description | Upload a PDF or image and Gemini AI will generate a complete HTML form | Sube un PDF o imagen y Gemini AI generará un formulario HTML completo |
| Ideal for AI | Ideal for: Existing forms, scanned documents, PDFs | Ideal para: Formatos existentes, documentos escaneados, PDFs |
| Create with AI | Create with AI | Crear con AI |
| Manually | Manually | Manualmente |
| Manual description | Create from scratch by adding fields one by one | Crea desde cero agregando campos uno por uno |
| Ideal for manual | Ideal for: Simple forms, specific cases | Ideal para: Formatos simples, casos específicos |
| Create manually | Create Manually | Crear Manualmente |
| From predefined | From Predefined | Desde Predefinido |
| Predefined description | Duplicate and customize predefined templates | Duplica y personaliza templates predefinidos |
| Ideal for predefined | Ideal for: Quick start, standard processes | Ideal para: Empezar rápido, procesos estándar |
| View predefined | View Predefined | Ver Predefinidos |
| **AI Creation - Step 1** |
| Page title AI | Create Template with Artificial Intelligence | Crear Template con Inteligencia Artificial |
| Template info section | Template Information | Información del Template |
| Template name | Template Name | Nombre del Template |
| Crop type | Crop Type | Tipo de Cultivo |
| Category | Category | Categoría |
| Upload section header | Upload Original Document | Subir Documento Original |
| Drag file | Drag your file here | Arrastra tu archivo aquí |
| Supported formats | Supported formats: PDF, PNG, JPG, JPEG | Formatos soportados: PDF, PNG, JPG, JPEG |
| Selected file | Selected file | Archivo seleccionado |
| Change | Change | Cambiar |
| Tips header | TIPS FOR BETTER RESULTS | TIPS PARA MEJORES RESULTADOS |
| Tip 1 | Use high resolution files (minimum 150 DPI) | Usa archivos de alta resolución (mínimo 150 DPI) |
| Tip 2 | Ensure text is legible | Asegúrate de que el texto sea legible |
| Tip 3 | Verify scanned PDF is not rotated | Si es un PDF escaneado, verifica que no esté rotado |
| Tip 4 | Gemini AI adapts to any structure | Gemini AI se adapta a cualquier estructura |
| Cancel | Cancel | Cancelar |
| Generate button | 🤖 Generate Template with AI | 🤖 Generar Template con IA |
| **Loading State** |
| Loading title | GENERATING TEMPLATE WITH AI... | GENERANDO TEMPLATE CON IA... |
| Loading message | Analyzing document with Gemini AI... | Analizando documento con Gemini AI... |
| Estimated time | Estimated time: ~30 seconds | Tiempo estimado: ~30 segundos |
| Please wait | Please wait... | Por favor espera... |
| **AI Creation - Step 2** |
| Success title | TEMPLATE GENERATED BY AI | TEMPLATE GENERADO POR IA |
| Preview label | Preview: This is how the template will look in activities | Vista Previa: Así se verá el template en las actividades |
| Question | Does the template correctly capture your original format? | ¿El template captura correctamente tu formato original? |
| Note intro | Note: | Nota: |
| Note text | If the result is not perfect, you can regenerate it. Gemini may produce slightly different results each time. | Si el resultado no es perfecto, puedes regenerarlo. Gemini puede producir resultados ligeramente diferentes en cada intento. |
| Back button | ← Back | ← Volver |
| Regenerate button | 🔄 Regenerate | 🔄 Regenerar |
| Cancel button | Cancel | Cancelar |
| Confirm button | ✅ Confirm and Save | ✅ Confirmar y Guardar |
| **Template Detail** |
| Template info | Template Info | Información del Template |
| Type label | Type: | Tipo: |
| Custom AI | Custom (Created with AI 🤖) | Personalizado (Creado con AI 🤖) |
| Crop label | Crop: | Cultivo: |
| Category label | Category: | Categoría: |
| Created | Created: | Creado: |
| By | By: | Por: |
| Duplicate | Duplicate | Duplicar |
| View original | View Original | Ver Original |
| Regenerate template | Regenerate Template | Regenerar Template |
| Usage stats header | USAGE STATISTICS | ESTADÍSTICAS DE USO |
| Used in templates | Used in X production templates | Usado en X templates de producción |
| Completed times | Completed X times in last 30 days | Completado X veces en los últimos 30 días |
| Template preview header | TEMPLATE PREVIEW | VISTA PREVIA DEL TEMPLATE |
| AI note | This template was generated with AI. If you need to modify it, you can regenerate it with an updated document. | Este template fue generado con IA. Si necesitas modificarlo, puedes regenerarlo con un documento actualizado. |
| Duplicate confirm | Duplicate this template? | ¿Duplicar este template? |
| Duplicate success | Template duplicated successfully | Template duplicado exitosamente |
| Template copy suffix | (Copy) | (Copia) |
| Save success | Template created successfully | Template creado exitosamente |

### Enum Translations

**Template Types:**
| Value | English | Spanish |
|-------|---------|---------|
| predefined | Predefined | Predefinido |
| custom | Custom | Personalizado |

**Categories:**
| Value | English | Spanish |
|-------|---------|---------|
| propagation | Propagation | Propagación |
| vegetative | Vegetative | Vegetativo |
| flowering | Flowering | Floración |
| harvest | Harvest | Cosecha |
| pest_control | Pest Control | Control de Plagas |
| environmental | Environmental | Ambiental |
| other | Other | Otro |

**Field Types:**
| Value | English | Spanish |
|-------|---------|---------|
| text_short | Short Text | Texto corto |
| text_long | Long Text | Texto largo |
| number | Number | Número |
| date | Date | Fecha |
| checkbox | Checkbox | Casilla de verificación |
| radio | Radio Buttons | Selección múltiple |
| dropdown | Dropdown | Lista desplegable |
| file_upload | File Upload | Subir archivo |
| signature | Signature | Firma |

---

## Notes on Implementation

### Activity Scheduling Logic
The auto-scheduling engine (detailed in ACTIVITY-SCHEDULING-LOGIC.md to be created) will:
1. Parse activity scheduling rules from template
2. Calculate actual dates when production order is created
3. Handle recurring patterns (daily, weekly, every N days)
4. Resolve dependencies between activities
5. Create calendar entries for each activity instance

### AI Quality Check Integration
The AI extraction service (detailed in AI-QUALITY-CHECKS.md to be created) will:
1. Accept PDF/image uploads
2. Use OCR (e.g., Google Cloud Vision API) for text extraction
3. Apply NLP to identify form structure (labels, field types, sections)
4. Generate field definitions with suggested types
5. Return structured JSON representation
6. Store template with both JSON structure and HTML rendering capability

### Database Schema Considerations
- **Production Templates**: Store phases and activities in nested structure
- **Activity Scheduling**: Store timing rules as flexible JSON objects
- **QC Templates**: Store field definitions and rendering structure
- **Template Usage**: Track which production templates use which QC templates
- **Completed QC Forms**: Store filled data as HTML/JSON for export

### Export Functionality
QC templates filled during activities should support:
- **PDF Export**: Convert HTML rendering to PDF (using library like Puppeteer)
- **Excel Export**: Map fields to structured spreadsheet
- **JSON Export**: Raw data for integrations

---

This completes MODULE 22 (Production Templates with Scheduling) and MODULE 23 (AI Quality Check Templates) for PHASE 3.
