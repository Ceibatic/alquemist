# PHASE 3: ADVANCED - UI REQUIREMENTS

**Focus**: Compliance, analytics, mobile, and integrations
**Database**: See [../../database/SCHEMA.md](../../database/SCHEMA.md)
**API Endpoints**: See [../../api/PHASE-3-ENDPOINTS.md](../../api/PHASE-3-ENDPOINTS.md)

---

## Overview

Phase 3 adds reporting, compliance, analytics, and ecosystem integration. Transforms operational data into compliance reports, business intelligence dashboards, and enables third-party integrations.

**Total Pages**: ~18 screens
**User Flow**: Non-linear, analytics-heavy
**Primary Users**: COMPANY_OWNER, FACILITY_MANAGER, VIEWER

---

## Internationalization (i18n)

**Languages Supported**: Spanish (default), English

All UI texts in this document must be implemented using the i18n system. See [../../i18n/STRATEGY.md](../../i18n/STRATEGY.md) for complete implementation strategy.

**Implementation Approach**:
- All UI texts stored in Bubble Option Set `UI_Texts` with both Spanish and English translations
- Enum values stored in dedicated Option Sets
- Backend sends technical codes only, frontend handles translation
- Language switcher available in all pages

**Translation Tables**: Consolidated translation tables are provided at the end of this document.

For implementation details, see [../../i18n/BUBBLE-IMPLEMENTATION.md](../../i18n/BUBBLE-IMPLEMENTATION.md).

---

## MODULE 14: Compliance & Reporting

### Page 1: Compliance Dashboard
```
┌────────────────────────────────┐
│   📋 COMPLIANCE                │
│   North Farm                   │
├────────────────────────────────┤
│ REQUIRED ITEMS:                │
│                                │
│ • Inventory Report             │
│   Due: 2025-11-15 ⚠ 18 days   │
│   [Generate] [View Template]   │
│                                │
│ • Facility Audit               │
│   Due: 2025-12-01  28 days     │
│   [Schedule]                   │
│                                │
│ CERTIFICATES:                  │
│ • Organic (exp: 2026-03)       │
│   Status: ✓ Valid              │
│   [View] [Renew]               │
│                                │
│ • Cannabis License             │
│   Status: ⚠ Expiring (65d)     │
│   [View] [Renew]               │
│                                │
│ PAST REPORTS:                  │
│ [Q3 Inventory Report] [DL]     │
│ [Q2 Facility Audit] [DL]       │
│                                │
│ [Generate Report] [Export]     │
│                                │
└────────────────────────────────┘
```

**Bubble Elements**:
- Repeating Group: Compliance events (due items)
- Repeating Group: Certificates
- Repeating Group: Past reports
- Button: "Generate Report" → open generator popup
- Button: "Export" → download audit trail

**Database Context**:
- **Reads from**: `compliance_events` table
  - Gets: due items, status, deadlines
- **Reads from**: `certificates` table
  - Gets: certificates, expiry dates
- **Reads from**: `media_files` table (category = compliance_report)
  - Gets: past generated reports

---

### Popup: Generate Report
```
┌────────────────────────────────┐
│   COMPLIANCE REPORT            │
├────────────────────────────────┤
│ Report Type:                   │
│ [v Inventory Report ▼]         │
│                                │
│ Period:                        │
│ From: [2025-09-01]             │
│ To:   [2025-09-30]             │
│                                │
│ Include:                       │
│ ☑ Stock levels at start        │
│ ☑ Purchases (by supplier)      │
│ ☑ Consumption logs             │
│ ☑ Batch tracking               │
│ ☑ Waste/disposal records       │
│                                │
│ Format:                        │
│ ○ PDF (official)               │
│ ○ Excel (editable)             │
│ ○ JSON (system import)         │
│                                │
│ [Cancel] [Generate]            │
│                                │
└────────────────────────────────┘
```

**Bubble Elements**:
- Dropdown: Report type
- Date pickers: Start/end date
- Checkboxes: Include options
- Radio buttons: Format selection
- Button: "Generate" → create report

**Workflow**:
1. User selects report type and period
2. Call API: Generate report
3. Download/display generated PDF/Excel

**Database Context**:
- **Reads from**: Multiple tables depending on report type
  - Inventory reports: `inventory_items`, `activities` (consumption)
  - Audit trail: `activities` table
- **Writes to**: `media_files` table
  - Stores: generated report file

---

## MODULE 15: Analytics & Business Intelligence

### Page 2: Analytics Dashboard
```
┌────────────────────────────────┐
│   📊 ANALYTICS                 │
│   North Farm - October 2025    │
├────────────────────────────────┤
│ KEY METRICS:                   │
│ ┌──────────┬────────────────┐  │
│ │ Batches  │ 6 active       │  │
│ │ Harvest  │ 3 completed    │  │
│ │ Yield    │ 108 kg         │  │
│ └──────────┴────────────────┘  │
│                                │
│ YIELD TRENDS:                  │
│ [Graph: Sep 98kg → Oct 108kg]  │
│ Avg: 100kg  ↑ 8% vs Sept      │
│                                │
│ CONSUMPTION:                   │
│ Nutrient A: 245 units          │
│ Water: 4200 L                  │
│ Cost per kg: $125  ▼ 5%       │
│                                │
│ TIME-TO-HARVEST:               │
│ Avg: 18 weeks (target 20)      │
│ ✓ Better than target           │
│                                │
│ [View Details] [Export]        │
│                                │
└────────────────────────────────┘
```

**Bubble Elements**:
- Text/charts: Key metrics display
- Chart: Yield trends (line graph)
- Repeating Group: Consumption breakdown
- Text: Performance indicators
- Button: "View Details" → detailed analytics page
- Button: "Export" → download report

**Database Context**:
- **Reads from**: Multiple tables for aggregation
  - `production_orders`, `batches` → yields
  - `activities` → consumption patterns
  - `inventory_items` → costs
- **Calculates**: Trends, averages, comparisons

---

### Page 3: Detailed Analytics
```
┌────────────────────────────────┐
│   YIELD ANALYSIS               │
│   Last 6 months                │
├────────────────────────────────┤
│ Time Period: [Last 6 months ▼] │
│                                │
│ HARVEST DATA:                  │
│ Batch-001: 35 kg (target 30)   │
│ Batch-002: 38 kg (target 30)   │
│ Batch-003: 32 kg (target 30)   │
│ Average: 33.5 kg  ↑ 12%        │
│                                │
│ FACTORS:                       │
│ • Nutrient timing (positive)   │
│ • Light cycle optimization     │
│ • Humidity control (weak)      │
│                                │
│ CULTIVAR COMPARISON:           │
│ Cherry AK:   34 kg avg         │
│ White Widow: 35 kg avg         │
│ Green Crack: 32 kg avg         │
│                                │
│ [Download Report] [Compare]    │
│                                │
└────────────────────────────────┘
```

**Bubble Elements**:
- Dropdown: Time period selector
- Repeating Group: Batch results
- Text: Averages and trends
- Repeating Group: Factors analysis
- Repeating Group: Cultivar comparison
- Button: "Download Report" → export

**Database Context**:
- **Reads from**: `batches` table
  - Gets: harvest data, yields
- **Reads from**: `cultivars` table
  - Gets: cultivar names
- **Calculates**: Averages, comparisons, trends

---

## MODULE 16: Mobile Experience

### Mobile Page 1: Dashboard (PWA)
```
Phone Screen (360px):

┌────────────────────────┐
│   🌱 ALQUEMIST         │
│   (Mobile)             │
├────────────────────────┤
│ 📍 North Farm          │
│ Status: 3 active       │
│        2 alerts        │
│                        │
│ TODAY'S TASKS:         │
│ ☐ Batch-001: Water    │
│   [Log Now]            │
│                        │
│ ☐ Batch-002: Inspect  │
│   [QC Check]           │
│                        │
│ ⚠ ALERT:               │
│ Nutrient A low (5)     │
│ [Acknowledge]          │
│                        │
│ [≡] Menu  [⊕] More     │
└────────────────────────┘
```

**Bubble Elements** (Mobile-optimized):
- Text: Facility name, status
- Repeating Group: Today's tasks (collapsed view)
- Buttons: Quick actions (Log Now, QC Check)
- Text: Alerts display
- Bottom navigation: Menu, More options

**Database Context**:
- **Reads from**: `scheduled_activities` → today's tasks
- **Reads from**: `inventory_items` → low stock alerts
- **Reads from**: `batches` → active batch count

---

### Mobile Page 2: Quick Activity Log
```
Phone Screen:

┌────────────────────────┐
│   LOG ACTIVITY         │
│   (Mobile)             │
├────────────────────────┤
│ Batch: B-2025-001      │
│ Activity: Watering     │
│                        │
│ Time: [⏱ Now]          │
│                        │
│ Materials:             │
│ Nutrient A: [3] units  │
│ Water: [80] L          │
│                        │
│ Photo: [📷 Camera]     │
│ (optional)             │
│                        │
│ [Log] [Cancel]         │
│                        │
│ (Offline mode:         │
│ Will sync when online) │
└────────────────────────┘
```

**Bubble Elements**:
- Text: Batch, activity (pre-filled)
- Button: "Now" → auto-fill current time
- Input: Material quantities
- Button: "Camera" → take photo
- Button: "Log" → submit (queue if offline)

**Workflow** (PWA-specific):
1. User fills activity log
2. If online → Submit immediately
3. If offline → Queue in local storage
4. Auto-sync when connection restored

**Database Context**:
- **Writes to**: `activities` table (when online)
- **Updates**: `inventory_items` → consume materials
- **Offline**: Uses browser IndexedDB for queue

---

## MODULE 17: Integrations & APIs

### Page 4: Integrations Dashboard
```
┌────────────────────────────────┐
│   🔌 INTEGRATIONS              │
│   North Farm                   │
├────────────────────────────────┤
│ [+ Add Integration]            │
│                                │
│ CONNECTED:                     │
│ ┌──────────────────────────┐  │
│ │ FarmChem Supplier API    │  │
│ │ Status: ✓ Active (6h ago)│  │
│ │ Syncing: Products, Orders│  │
│ │ [Configure] [Disconnect] │  │
│ └──────────────────────────┘  │
│                                │
│ ┌──────────────────────────┐  │
│ │ Analytics Platform Y     │  │
│ │ Status: ✓ Active (live)  │  │
│ │ Syncing: Yield data      │  │
│ │ [Configure] [Disconnect] │  │
│ └──────────────────────────┘  │
│                                │
│ ┌──────────────────────────┐  │
│ │ Lab Service Z            │  │
│ │ Status: ⚠ Paused (2d)    │  │
│ │ [Retry] [Settings]       │  │
│ └──────────────────────────┘  │
│                                │
│ [API Keys] [Logs] [Docs]       │
│                                │
└────────────────────────────────┘
```

**Bubble Elements**:
- Button: "+ Add Integration" → open setup popup
- Repeating Group: Active integrations
  - Shows: name, status, last sync, what's syncing
  - Buttons: "Configure", "Disconnect", "Retry"
- Buttons: "API Keys", "Logs", "Docs" → manage integrations

**Database Context**:
- **Reads from**: `integrations` table
  - Gets: all integrations for company
- **Reads from**: `integration_logs` table
  - Gets: sync history, errors

---

### Popup: Configure Integration
```
┌────────────────────────────────┐
│   CONNECT: Supplier API        │
├────────────────────────────────┤
│ Supplier:                      │
│ [v FarmChem Inc ▼]             │
│                                │
│ API Key:                       │
│ [••••••••••••••]               │
│ [Regenerate]                   │
│                                │
│ Data to Sync:                  │
│ ☑ Product Catalog              │
│ ☑ Purchase Orders              │
│ ☐ Invoice Status               │
│                                │
│ Sync Frequency:                │
│ [v Daily ▼] at [03:00 UTC]     │
│                                │
│ Webhooks:                      │
│ ☑ New Orders                   │
│ ☑ Shipment Updates             │
│                                │
│ [Test Connection]              │
│ [Cancel] [Save]                │
│                                │
└────────────────────────────────┘
```

**Bubble Elements**:
- Dropdown: Supplier selection
- Input: API key (password field)
- Checkboxes: Data sync options
- Dropdown: Sync frequency
- Checkboxes: Webhook events
- Button: "Test Connection" → validate
- Button: "Save" → create integration

**Workflow**:
1. User enters integration details
2. On "Test Connection" → Validate credentials
3. On "Save" → Create integration record
4. Schedule sync jobs

**Database Context**:
- **Writes to**: `integrations` table
  - Stores: config, sync settings
- **Writes to**: `webhook_subscriptions` table (if webhooks enabled)

---

## RESPONSIVE BREAKPOINTS

### Desktop (1200px+)
- Multi-column layouts
- Full charts and graphs
- Side-by-side comparisons

### Tablet (768px - 1199px)
- Single column with cards
- Simplified charts
- Touch-optimized buttons

### Mobile (< 768px)
- PWA mode
- Bottom navigation
- Simplified dashboards
- Offline-first design

---

## PWA CONFIGURATION

### manifest.json
```json
{
  "name": "Alquemist Farm",
  "short_name": "Alquemist",
  "start_url": "/mobile",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4CAF50",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "offline_enabled": true
}
```

### Service Worker Features
- Cache essential pages for offline
- Queue activities when offline
- Auto-sync when connection restored
- Background sync for photos

---

## KEY WORKFLOWS SUMMARY

### Compliance Workflow
```
Dashboard → View due items
         → Generate report (select period + format)
         → Download PDF/Excel
         → Upload to regulatory portal
```

### Analytics Workflow
```
Dashboard → View key metrics
         → Drill down to details
         → Compare periods/facilities
         → Export report
```

### Mobile Workflow
```
Open PWA → Check today's tasks
        → Log activity (offline capable)
        → Take photo
        → Auto-sync when online
```

### Integration Workflow
```
Integrations → Add integration
            → Configure API settings
            → Test connection
            → Enable auto-sync
            → Monitor sync logs
```

---

## Consolidated Translation Tables

### Module 14: Compliance & Reporting

| Elemento | Español | English | Key |
|----------|---------|---------|-----|
| Compliance Header | CUMPLIMIENTO | COMPLIANCE | compliance_header |
| Required Items Section | ARTÍCULOS REQUERIDOS: | REQUIRED ITEMS: | compliance_required_items |
| Due Label | Vencimiento: | Due: | compliance_due_label |
| Days | días | days | compliance_days |
| Generate Button | Generar | Generate | compliance_generate_btn |
| View Template Button | Ver Plantilla | View Template | compliance_view_template_btn |
| Schedule Button | Programar | Schedule | compliance_schedule_btn |
| Certificates Section | CERTIFICADOS: | CERTIFICATES: | compliance_certificates |
| Status Label | Estado: | Status: | compliance_status_label |
| Valid Status | ✓ Válido | ✓ Valid | compliance_valid |
| Expiring Status | ⚠ Por Vencer ([X]d) | ⚠ Expiring ([X]d) | compliance_expiring |
| View Button | Ver | View | compliance_view_btn |
| Renew Button | Renovar | Renew | compliance_renew_btn |
| Past Reports Section | REPORTES PASADOS: | PAST REPORTS: | compliance_past_reports |
| Download Button | [DL] | [DL] | compliance_download_btn |
| Generate Report Button | Generar Reporte | Generate Report | compliance_generate_report_btn |
| Export Button | Exportar | Export | compliance_export_btn |
| Report Popup Header | REPORTE DE CUMPLIMIENTO | COMPLIANCE REPORT | compliance_report_popup_header |
| Report Type Label | Tipo de Reporte: | Report Type: | compliance_report_type_label |
| Period Label | Período: | Period: | compliance_period_label |
| From Label | Desde: | From: | compliance_from_label |
| To Label | Hasta: | To: | compliance_to_label |
| Include Label | Incluir: | Include: | compliance_include_label |
| Stock Levels Checkbox | Niveles de stock al inicio | Stock levels at start | compliance_stock_levels |
| Purchases Checkbox | Compras (por proveedor) | Purchases (by supplier) | compliance_purchases |
| Consumption Logs Checkbox | Registros de consumo | Consumption logs | compliance_consumption_logs |
| Batch Tracking Checkbox | Seguimiento de lotes | Batch tracking | compliance_batch_tracking |
| Waste Records Checkbox | Registros de desecho/disposición | Waste/disposal records | compliance_waste_records |
| Format Label | Formato: | Format: | compliance_format_label |
| PDF Option | PDF (oficial) | PDF (official) | compliance_pdf |
| Excel Option | Excel (editable) | Excel (editable) | compliance_excel |
| JSON Option | JSON (importación de sistema) | JSON (system import) | compliance_json |
| Success Message | Reporte generado exitosamente | Report generated successfully | compliance_report_success |

### Module 15: Analytics & Business Intelligence

| Elemento | Español | English | Key |
|----------|---------|---------|-----|
| Analytics Header | ANALÍTICA | ANALYTICS | analytics_header |
| Key Metrics Section | MÉTRICAS CLAVE: | KEY METRICS: | analytics_key_metrics |
| Batches Label | Lotes | Batches | analytics_batches |
| Active | activos | active | analytics_active |
| Harvest Label | Cosecha | Harvest | analytics_harvest |
| Completed | completados | completed | analytics_completed |
| Yield Label | Rendimiento | Yield | analytics_yield |
| Avg Label | Prom: | Avg: | analytics_avg_label |
| Vs Label | vs [month] | vs [month] | analytics_vs_label |
| Cost Per Kg | Costo por kg: | Cost per kg: | analytics_cost_per_kg |
| Target | objetivo | target | analytics_target |
| Better Than Target | Mejor que objetivo | Better than target | analytics_better_than_target |
| Yield Trends Section | TENDENCIAS DE RENDIMIENTO: | YIELD TRENDS: | analytics_yield_trends |
| Consumption Section | CONSUMO: | CONSUMPTION: | analytics_consumption |
| Time to Harvest Section | TIEMPO A COSECHA: | TIME-TO-HARVEST: | analytics_time_to_harvest |
| View Details Button | Ver Detalles | View Details | analytics_view_details_btn |
| Yield Analysis Header | ANÁLISIS DE RENDIMIENTO | YIELD ANALYSIS | analytics_yield_analysis_header |
| Last 6 Months | Últimos 6 meses | Last 6 months | analytics_last_6_months |
| Time Period Label | Período de Tiempo: | Time Period: | analytics_time_period_label |
| Harvest Data Section | DATOS DE COSECHA: | HARVEST DATA: | analytics_harvest_data |
| Average Label | Promedio: | Average: | analytics_average_label |
| Factors Label | FACTORES: | FACTORS: | analytics_factors_label |
| Nutrient Timing | Momento de nutrientes (positivo) | Nutrient timing (positive) | analytics_nutrient_timing |
| Light Cycle Opt | Optimización del ciclo de luz | Light cycle optimization | analytics_light_cycle |
| Humidity Control | Control de humedad (débil) | Humidity control (weak) | analytics_humidity_control |
| Cultivar Comparison | COMPARACIÓN DE CULTIVARES: | CULTIVAR COMPARISON: | analytics_cultivar_comparison |
| Download Report Button | Descargar Reporte | Download Report | analytics_download_report_btn |
| Compare Button | Comparar | Compare | analytics_compare_btn |

### Module 16: Mobile Experience

| Elemento | Español | English | Key |
|----------|---------|---------|-----|
| Mobile Dashboard Header | ALQUEMIST (Móvil) | ALQUEMIST (Mobile) | mobile_dashboard_header |
| Status Label | Estado: | Status: | mobile_status_label |
| Active | activos | active | mobile_active |
| Alerts | alertas | alerts | mobile_alerts |
| Today's Tasks | TAREAS DE HOY: | TODAY'S TASKS: | mobile_todays_tasks |
| Log Now Button | Registrar Ahora | Log Now | mobile_log_now_btn |
| QC Check Button | Control QC | QC Check | mobile_qc_check_btn |
| Acknowledge Button | Confirmar | Acknowledge | mobile_acknowledge_btn |
| Menu Button | [≡] Menú | [≡] Menu | mobile_menu_btn |
| More Button | [⊕] Más | [⊕] More | mobile_more_btn |
| Log Activity Header (Mobile) | REGISTRAR ACTIVIDAD (Móvil) | LOG ACTIVITY (Mobile) | mobile_log_activity_header |
| Batch Label | Lote: | Batch: | mobile_batch_label |
| Activity Label | Actividad: | Activity: | mobile_activity_label |
| Time Label | Hora: | Time: | mobile_time_label |
| Now Button | ⏱ Ahora | ⏱ Now | mobile_now_btn |
| Materials Label | Materiales: | Materials: | mobile_materials_label |
| Photo Label | Foto: | Photo: | mobile_photo_label |
| Optional Text | (opcional) | (optional) | mobile_optional |
| Camera Button | 📷 Cámara | 📷 Camera | mobile_camera_btn |
| Offline Mode Text | (Modo offline: Se sincronizará cuando esté en línea) | (Offline mode: Will sync when online) | mobile_offline_mode |
| Log Button | Registrar | Log | mobile_log_btn |

### Module 17: Integrations & APIs

| Elemento | Español | English | Key |
|----------|---------|---------|-----|
| Integrations Header | INTEGRACIONES | INTEGRATIONS | integrations_header |
| Connected Section | CONECTADO: | CONNECTED: | integrations_connected |
| Status Label | Estado: | Status: | integrations_status_label |
| Active Status | Activo | Active | integrations_active |
| Syncing Label | Sincronizando: | Syncing: | integrations_syncing_label |
| Paused Status | Pausado | Paused | integrations_paused |
| Time Ago | (hace [X]) | ([X] ago) | integrations_time_ago |
| Live Status | (en vivo) | (live) | integrations_live |
| Add Integration Button | + Agregar Integración | + Add Integration | integrations_add_btn |
| Configure Button | Configurar | Configure | integrations_configure_btn |
| Disconnect Button | Desconectar | Disconnect | integrations_disconnect_btn |
| Retry Button | Reintentar | Retry | integrations_retry_btn |
| Settings Button | Configuración | Settings | integrations_settings_btn |
| API Keys Button | Claves API | API Keys | integrations_api_keys_btn |
| Logs Button | Registros | Logs | integrations_logs_btn |
| Docs Button | Docs | Docs | integrations_docs_btn |
| Configure Popup Header | CONECTAR: [integration name] | CONNECT: [integration name] | integrations_configure_header |
| Supplier Label | Proveedor: | Supplier: | integrations_supplier_label |
| API Key Label | Clave API: | API Key: | integrations_api_key_label |
| Data to Sync Label | Datos a Sincronizar: | Data to Sync: | integrations_data_to_sync_label |
| Product Catalog Checkbox | Catálogo de Productos | Product Catalog | integrations_product_catalog |
| Purchase Orders Checkbox | Órdenes de Compra | Purchase Orders | integrations_purchase_orders |
| Invoice Status Checkbox | Estado de Facturas | Invoice Status | integrations_invoice_status |
| Sync Frequency Label | Frecuencia de Sincronización: | Sync Frequency: | integrations_sync_frequency_label |
| At Label | a las | at | integrations_at_label |
| Webhooks Label | Webhooks: | Webhooks: | integrations_webhooks_label |
| New Orders Checkbox | Nuevas Órdenes | New Orders | integrations_new_orders |
| Shipment Updates Checkbox | Actualizaciones de Envío | Shipment Updates | integrations_shipment_updates |
| Regenerate Button | Regenerar | Regenerate | integrations_regenerate_btn |
| Test Connection Button | Probar Conexión | Test Connection | integrations_test_connection_btn |
| Save Button | Guardar | Save | integrations_save_btn |

### Additional Enum Translations

**Compliance Event Types:**

| value | display_es | display_en |
|-------|------------|------------|
| inspection | Inspección | Inspection |
| permit | Permiso | Permit |
| report | Reporte | Report |
| audit | Auditoría | Audit |
| violation | Violación | Violation |

**Compliance Event Category:**

| value | display_es | display_en |
|-------|------------|------------|
| ica | ICA | ICA |
| invima | INVIMA | INVIMA |
| environmental | Ambiental | Environmental |
| tax | Impuestos | Tax |
| other | Otro | Other |

**Compliance Status:**

| value | display_es | display_en |
|-------|------------|------------|
| pending | Pendiente | Pending |
| in_progress | En Progreso | In Progress |
| completed | Completado | Completed |
| overdue | Vencido | Overdue |

**Compliance Severity:**

| value | display_es | display_en |
|-------|------------|------------|
| low | Bajo | Low |
| medium | Medio | Medium |
| high | Alto | High |
| critical | Crítico | Critical |

**Certificate Status:**

| value | display_es | display_en |
|-------|------------|------------|
| valid | Válido | Valid |
| expiring_soon | Por Vencer | Expiring Soon |
| expired | Expirado | Expired |
| revoked | Revocado | Revoked |

**Integration Status:**

| value | display_es | display_en |
|-------|------------|------------|
| active | Activo | Active |
| paused | Pausado | Paused |
| error | Error | Error |
| disconnected | Desconectado | Disconnected |

**Sync Frequency:**

| value | display_es | display_en |
|-------|------------|------------|
| realtime | Tiempo Real | Realtime |
| hourly | Cada Hora | Hourly |
| daily | Diario | Daily |
| weekly | Semanal | Weekly |

---

**Status**: UI requirements complete for Phase 3
**Next Steps**:
1. Implement API endpoints (see [PHASE-3-ENDPOINTS.md](../../api/PHASE-3-ENDPOINTS.md))
2. Set up PWA configuration
3. Build Bubble pages following wireframes
4. Test offline capabilities
