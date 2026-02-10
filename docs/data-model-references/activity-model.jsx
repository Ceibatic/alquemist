import { useState } from "react";

const TABS = [
  { id: "model", label: "🏗️ Modelo de Datos" },
  { id: "types", label: "📋 Tipos de Actividad" },
  { id: "flow", label: "🔄 Flujo Completo" },
  { id: "queries", label: "📊 Consultas" },
];

const CORE_TABLES = [
  {
    name: "activities",
    label: "CORE — EVOLUCIONADA",
    color: "#2563eb",
    desc: "Registro central de toda acción ejecutada en el cultivo. Cada actividad es un evento con contexto espacial, temporal, de cultivo y de recursos.",
    fields: [
      { n: "id", t: "UUID (PK)", g: "" },
      { n: "company_id", t: "FK → companies", g: "" },
      { n: "— Clasificación —", t: "", g: "section" },
      { n: "type_id", t: "FK → activity_types", g: "new", note: "Tipo configurable (reemplaza ENUM)" },
      { n: "category", t: "ENUM ['cultivation','monitoring','transformation','application','movement','maintenance','quality','harvest','post_harvest','administrative']", g: "new", note: "Categoría fija para lógica de negocio — el type_id da granularidad dentro de cada categoría" },
      { n: "priority", t: "ENUM ['routine','urgent','critical'] DEFAULT 'routine'", g: "new", note: "" },
      { n: "— Contexto espacial —", t: "", g: "section" },
      { n: "facility_id", t: "FK → facilities (nullable)", g: "new", note: "Instalación" },
      { n: "zone_id", t: "FK → zones (nullable)", g: "new", note: "Zona de cultivo (modelo de capacidad)" },
      { n: "area_id", t: "FK → areas (nullable)", g: "", note: "Área/almacén" },
      { n: "structure_id", t: "FK → structures (nullable)", g: "new", note: "Estructura específica (mesa, rack)" },
      { n: "positions", t: "JSONB (nullable)", g: "new", note: "Array de position_ids si aplica a plantas específicas" },
      { n: "— Contexto de cultivo —", t: "", g: "section" },
      { n: "batch_id", t: "FK → batches (nullable)", g: "new", note: "Lote de producción/cultivo" },
      { n: "crop_phase", t: "ENUM ['propagation','vegetative','flowering','harvest','post_harvest','processing','packaging'] (nullable)", g: "new", note: "" },
      { n: "plant_count_affected", t: "INT (nullable)", g: "new", note: "Cuántas plantas se vieron afectadas" },
      { n: "— Temporalidad —", t: "", g: "section" },
      { n: "scheduled_date", t: "TIMESTAMPTZ (nullable)", g: "new", note: "Cuándo estaba planificada" },
      { n: "started_at", t: "TIMESTAMPTZ (nullable)", g: "new", note: "Cuándo inició realmente" },
      { n: "completed_at", t: "TIMESTAMPTZ (nullable)", g: "new", note: "Cuándo terminó" },
      { n: "duration_minutes", t: "INT (nullable)", g: "new", note: "Duración (auto-calculable o manual)" },
      { n: "— Ejecución —", t: "", g: "section" },
      { n: "assigned_to", t: "FK → users (nullable)", g: "new", note: "Responsable asignado" },
      { n: "performed_by", t: "FK → users", g: "new", note: "Quién ejecutó realmente" },
      { n: "verified_by", t: "FK → users (nullable)", g: "new", note: "Quién verificó/aprobó (para QC)" },
      { n: "— Contenido —", t: "", g: "section" },
      { n: "title", t: "VARCHAR", g: "new", note: "Título descriptivo auto-generado o manual" },
      { n: "description", t: "TEXT (nullable)", g: "", note: "Descripción libre" },
      { n: "observations", t: "TEXT (nullable)", g: "new", note: "Observaciones post-ejecución" },
      { n: "— Datos dinámicos —", t: "", g: "section" },
      { n: "metadata", t: "JSONB DEFAULT '{}'", g: "new", note: "Datos adicionales según tipo. Schema validado por activity_types.metadata_schema" },
      { n: "— Vínculos —", t: "", g: "section" },
      { n: "parent_activity_id", t: "FK → self (nullable)", g: "new", note: "Para sub-actividades. Ej: Cosecha padre → Corte, Pesaje, Colgado como hijos" },
      { n: "recipe_execution_id", t: "FK → recipe_executions (nullable)", g: "new", note: "Si esta actividad ejecutó una receta" },
      { n: "work_order_id", t: "FK → work_orders (nullable)", g: "new", note: "Orden de trabajo que la originó" },
      { n: "— Estado —", t: "", g: "section" },
      { n: "status", t: "ENUM ['planned','in_progress','completed','cancelled','requires_review']", g: "new", note: "" },
      { n: "— Auditoría —", t: "", g: "section" },
      { n: "created_at", t: "TIMESTAMPTZ", g: "" },
      { n: "updated_at", t: "TIMESTAMPTZ", g: "" },
    ],
  },
  {
    name: "activity_types",
    label: "NUEVA",
    color: "#16a34a",
    desc: "Catálogo configurable de tipos de actividad. Cada tipo define qué campos de metadata espera y qué recursos típicamente consume. Jerárquica con parent_id.",
    fields: [
      { n: "id", t: "UUID (PK)", g: "" },
      { n: "company_id", t: "FK → companies", g: "" },
      { n: "parent_id", t: "FK → self (nullable)", g: "new", note: "Jerarquía: Aplicación → Foliar / Radicular / Drench" },
      { n: "category", t: "ENUM (misma que activities.category)", g: "new", note: "Categoría fija a la que pertenece este tipo" },
      { n: "code", t: "VARCHAR UNIQUE per company", g: "new", note: "'irrigation', 'foliar_spray', 'transplant', 'scouting'" },
      { n: "name", t: "VARCHAR", g: "", note: "'Riego', 'Aspersión foliar', 'Trasplante'" },
      { n: "name_en", t: "VARCHAR (nullable)", g: "" },
      { n: "icon", t: "VARCHAR (nullable)", g: "" },
      { n: "description", t: "TEXT (nullable)", g: "" },
      { n: "— Comportamiento —", t: "", g: "section" },
      { n: "requires_zone", t: "BOOLEAN DEFAULT false", g: "new", note: "¿Obliga a seleccionar zona?" },
      { n: "requires_batch", t: "BOOLEAN DEFAULT false", g: "new", note: "¿Obliga a seleccionar lote de cultivo?" },
      { n: "requires_resources", t: "BOOLEAN DEFAULT false", g: "new", note: "¿Obliga a registrar consumo de recursos?" },
      { n: "requires_photos", t: "BOOLEAN DEFAULT false", g: "new", note: "¿Obliga adjuntar fotos?" },
      { n: "requires_verification", t: "BOOLEAN DEFAULT false", g: "new", note: "¿Requiere verificación de otro usuario?" },
      { n: "triggers_transformation", t: "BOOLEAN DEFAULT false", g: "new", note: "¿Genera transformación de inventario? (trasplante, cosecha, secado)" },
      { n: "triggers_phase_change", t: "BOOLEAN DEFAULT false", g: "new", note: "¿Cambia la fase del lote?" },
      { n: "target_phase", t: "ENUM crop_phase (nullable)", g: "new", note: "Si triggers_phase_change, ¿a qué fase cambia?" },
      { n: "— Schema de metadata —", t: "", g: "section" },
      { n: "metadata_schema", t: "JSONB (nullable)", g: "new", note: "JSON Schema que valida activities.metadata para este tipo. Define campos dinámicos." },
      { n: "default_resources", t: "JSONB (nullable)", g: "new", note: "Recursos típicos pre-cargados. [{product_id, suggested_qty, unit_id}]" },
      { n: "— Estado —", t: "", g: "section" },
      { n: "sort_order", t: "INT DEFAULT 0", g: "" },
      { n: "is_active", t: "BOOLEAN DEFAULT true", g: "" },
      { n: "created_at", t: "TIMESTAMPTZ", g: "" },
      { n: "updated_at", t: "TIMESTAMPTZ", g: "" },
    ],
  },
  {
    name: "activity_resources",
    label: "NUEVA",
    color: "#dc2626",
    desc: "Cada recurso consumido o producido por una actividad. Es el puente entre activities e inventory_transactions. Una actividad puede consumir N recursos.",
    fields: [
      { n: "id", t: "UUID (PK)", g: "" },
      { n: "activity_id", t: "FK → activities", g: "new", note: "" },
      { n: "direction", t: "ENUM ['consumed','produced','applied','wasted']", g: "new", note: "consumed=genérico, applied=a cultivo, produced=transformación, wasted=descarte" },
      { n: "product_id", t: "FK → products", g: "new", note: "Qué recurso" },
      { n: "inventory_item_id", t: "FK → inventory_items (nullable)", g: "new", note: "De qué lote específico (null si auto-FIFO)" },
      { n: "quantity", t: "DECIMAL NOT NULL", g: "new", note: "Cantidad" },
      { n: "unit_id", t: "FK → units_of_measure", g: "new", note: "" },
      { n: "cost_per_unit", t: "DECIMAL (nullable)", g: "new", note: "Costo al momento del consumo" },
      { n: "cost_total", t: "DECIMAL (nullable)", g: "new", note: "qty × cost_per_unit" },
      { n: "— Vínculo a transaction generada —", t: "", g: "section" },
      { n: "transaction_id", t: "FK → inventory_transactions (nullable)", g: "new", note: "La transaction que se generó en el sistema de inventario. Se crea al completar la actividad." },
      { n: "— Detalle —", t: "", g: "section" },
      { n: "application_rate", t: "VARCHAR (nullable)", g: "new", note: "'2 mL/L', '5 g/m²', '100 mL/planta'" },
      { n: "application_method", t: "VARCHAR (nullable)", g: "new", note: "'foliar', 'drench', 'radicular', 'broadcast'" },
      { n: "notes", t: "TEXT (nullable)", g: "" },
      { n: "created_at", t: "TIMESTAMPTZ", g: "" },
    ],
  },
  {
    name: "activity_attachments",
    label: "NUEVA",
    color: "#7c3aed",
    desc: "Archivos adjuntos a una actividad: fotos, documentos, COAs, videos. Polimórfica — cualquier tipo de archivo.",
    fields: [
      { n: "id", t: "UUID (PK)", g: "" },
      { n: "activity_id", t: "FK → activities", g: "new", note: "" },
      { n: "type", t: "ENUM ['photo','document','video','certificate','lab_result','other']", g: "new", note: "" },
      { n: "file_url", t: "VARCHAR NOT NULL", g: "new", note: "URL en storage (S3/Supabase Storage)" },
      { n: "thumbnail_url", t: "VARCHAR (nullable)", g: "new", note: "Para fotos/videos" },
      { n: "file_name", t: "VARCHAR", g: "new", note: "Nombre original del archivo" },
      { n: "file_size_bytes", t: "INT", g: "new", note: "" },
      { n: "mime_type", t: "VARCHAR", g: "new", note: "'image/jpeg', 'application/pdf'" },
      { n: "caption", t: "TEXT (nullable)", g: "new", note: "Descripción de la foto/documento" },
      { n: "taken_at", t: "TIMESTAMPTZ (nullable)", g: "new", note: "Cuándo se tomó la foto (EXIF o manual)" },
      { n: "geo_lat", t: "DECIMAL (nullable)", g: "new", note: "Coordenadas GPS de la foto" },
      { n: "geo_lng", t: "DECIMAL (nullable)", g: "new", note: "" },
      { n: "sort_order", t: "INT DEFAULT 0", g: "new", note: "" },
      { n: "uploaded_by", t: "FK → users", g: "new", note: "" },
      { n: "created_at", t: "TIMESTAMPTZ", g: "" },
    ],
  },
  {
    name: "activity_observations",
    label: "NUEVA",
    color: "#f59e0b",
    desc: "Observaciones estructuradas de monitoreo/scouting. Cada hallazgo individual (plaga detectada, deficiencia, síntoma) es un registro separado vinculado a la actividad de monitoreo.",
    fields: [
      { n: "id", t: "UUID (PK)", g: "" },
      { n: "activity_id", t: "FK → activities", g: "new", note: "Actividad de tipo 'monitoring/scouting'" },
      { n: "observation_type", t: "ENUM ['pest','disease','deficiency','excess','mechanical_damage','environmental','growth','positive','other']", g: "new", note: "" },
      { n: "severity", t: "ENUM ['none','low','medium','high','critical']", g: "new", note: "" },
      { n: "organism_id", t: "FK → organisms (nullable)", g: "new", note: "Catálogo de plagas/enfermedades" },
      { n: "affected_area_pct", t: "DECIMAL (nullable)", g: "new", note: "% de la zona afectada (0-100)" },
      { n: "affected_plant_count", t: "INT (nullable)", g: "new", note: "Plantas afectadas" },
      { n: "plant_part", t: "ENUM ['root','stem','leaf','flower','fruit','whole'] (nullable)", g: "new", note: "" },
      { n: "description", t: "TEXT", g: "", note: "Descripción del hallazgo" },
      { n: "recommended_action", t: "TEXT (nullable)", g: "new", note: "Acción recomendada" },
      { n: "follow_up_date", t: "DATE (nullable)", g: "new", note: "Fecha para re-inspección" },
      { n: "attachment_ids", t: "UUID[] (nullable)", g: "new", note: "Fotos específicas de esta observación" },
      { n: "resolved", t: "BOOLEAN DEFAULT false", g: "new", note: "" },
      { n: "resolved_by_activity_id", t: "FK → activities (nullable)", g: "new", note: "La actividad que resolvió el problema" },
      { n: "created_at", t: "TIMESTAMPTZ", g: "" },
    ],
  },
  {
    name: "activity_environmental_readings",
    label: "NUEVA — OPCIONAL",
    color: "#0891b2",
    desc: "Lecturas ambientales capturadas durante o asociadas a una actividad. Para registrar condiciones al momento de una aplicación de pesticida, o mediciones de monitoreo.",
    fields: [
      { n: "id", t: "UUID (PK)", g: "" },
      { n: "activity_id", t: "FK → activities", g: "new", note: "" },
      { n: "reading_type", t: "ENUM ['temperature','humidity','vpd','co2','light_ppfd','light_dli','ph','ec','dissolved_oxygen','wind_speed','soil_moisture']", g: "new", note: "" },
      { n: "value", t: "DECIMAL NOT NULL", g: "new", note: "" },
      { n: "unit", t: "VARCHAR", g: "new", note: "'°C', '%', 'kPa', 'ppm', 'µmol/m²/s', 'mS/cm'" },
      { n: "measured_at", t: "TIMESTAMPTZ", g: "new", note: "" },
      { n: "sensor_id", t: "VARCHAR (nullable)", g: "new", note: "ID del sensor si es automático" },
      { n: "location_detail", t: "VARCHAR (nullable)", g: "new", note: "'Canopy level', 'Root zone', 'Ambient'" },
      { n: "created_at", t: "TIMESTAMPTZ", g: "" },
    ],
  },
];

const ACTIVITY_TYPES_TREE = [
  {
    cat: "cultivation", icon: "🌱", label: "Cultivo", color: "#16a34a",
    types: [
      { code: "seeding", name: "Siembra", requires: "zone,batch,resources", triggers: "transformation", phase: "propagation", metadata: "seed_depth, spacing, germination_method, tray_count, cells_per_tray" },
      { code: "transplant", name: "Trasplante", requires: "zone,batch,resources", triggers: "transformation,phase_change", phase: "vegetative", metadata: "source_zone, target_zone, container_size_L, substrate_recipe, plant_count" },
      { code: "irrigation", name: "Riego", requires: "zone,batch,resources", triggers: "", metadata: "volume_L, duration_min, method (drip/overhead/ebb_flow), runoff_pct, ec_in, ec_out, ph_in, ph_out" },
      { code: "fertigation", name: "Fertirrigación", requires: "zone,batch,resources", triggers: "", metadata: "recipe_name, ec_target, ec_actual, ph_target, ph_actual, volume_L, runoff_pct" },
      { code: "pruning", name: "Poda", requires: "zone,batch", triggers: "", metadata: "pruning_type (apical/lateral/defoliation/lollipop), intensity (light/medium/heavy), plant_count, biomass_removed_g" },
      { code: "training", name: "Tutorado / Entrenamiento", requires: "zone,batch", triggers: "", metadata: "technique (LST/HST/SCROG/SOG/trellis), materials_used" },
      { code: "topping", name: "Despunte / Topping", requires: "zone,batch", triggers: "", metadata: "node_number, plant_count" },
      { code: "defoliation", name: "Defoliación", requires: "zone,batch", triggers: "", metadata: "intensity_pct, target_zone (lower/upper/all)" },
      { code: "thinning", name: "Raleo", requires: "zone,batch", triggers: "", metadata: "fruit_removed_count, target_load_per_branch" },
      { code: "pollination", name: "Polinización", requires: "zone,batch", triggers: "", metadata: "method (manual/bee/vibration), pollinator_species" },
    ],
  },
  {
    cat: "monitoring", icon: "🔍", label: "Monitoreo", color: "#f59e0b",
    types: [
      { code: "scouting", name: "Monitoreo de plagas/enfermedades", requires: "zone,photos", triggers: "", metadata: "Usa activity_observations para cada hallazgo" },
      { code: "growth_check", name: "Medición de crecimiento", requires: "zone,batch", triggers: "", metadata: "avg_height_cm, avg_width_cm, internode_distance_cm, leaf_count, bud_count" },
      { code: "root_check", name: "Inspección radicular", requires: "zone,batch,photos", triggers: "", metadata: "root_color, root_density (sparse/moderate/dense), root_health (healthy/browning/rot)" },
      { code: "environmental_check", name: "Lectura ambiental manual", requires: "zone", triggers: "", metadata: "Usa activity_environmental_readings" },
      { code: "trichome_check", name: "Inspección de tricomas", requires: "zone,batch,photos", triggers: "", metadata: "clear_pct, milky_pct, amber_pct, recommended_harvest (yes/no/wait_X_days)" },
      { code: "brix_reading", name: "Medición de Brix", requires: "zone,batch", triggers: "", metadata: "brix_value, sample_count, sample_location" },
      { code: "soil_test", name: "Análisis de suelo/sustrato", requires: "zone", triggers: "", metadata: "ph, ec, moisture_pct, sample_depth_cm, lab_id" },
    ],
  },
  {
    cat: "application", icon: "🛡️", label: "Aplicación de Productos", color: "#dc2626",
    types: [
      { code: "foliar_spray", name: "Aspersión foliar", requires: "zone,batch,resources,photos", triggers: "", metadata: "product_name, dose_per_L, total_volume_L, equipment_used, nozzle_type, pressure_psi, weather_conditions, phi_days, rei_hours, target_pest" },
      { code: "soil_drench", name: "Aplicación al suelo (drench)", requires: "zone,batch,resources", triggers: "", metadata: "product_name, dose_per_L, volume_per_plant_mL, total_volume_L" },
      { code: "granular_application", name: "Aplicación granular", requires: "zone,batch,resources", triggers: "", metadata: "product_name, rate_g_per_m2, total_applied_g, method (broadcast/band/side_dress)" },
      { code: "biocontrol_release", name: "Liberación de biocontrol", requires: "zone,batch,resources", triggers: "", metadata: "organism_species, release_rate_per_m2, total_released, viability_pct, storage_temp_C" },
      { code: "co2_enrichment", name: "Enriquecimiento CO₂", requires: "zone,resources", triggers: "", metadata: "target_ppm, duration_hours, source (tank/burner)" },
    ],
  },
  {
    cat: "transformation", icon: "🔄", label: "Transformación / Cambio de Fase", color: "#7c3aed",
    types: [
      { code: "phase_veg_to_flower", name: "Cambio a floración", requires: "zone,batch,resources", triggers: "transformation,phase_change", phase: "flowering", metadata: "light_schedule_from, light_schedule_to (12/12), plant_count, males_removed" },
      { code: "harvest_cut", name: "Cosecha (corte)", requires: "zone,batch,resources,photos", triggers: "transformation,phase_change", phase: "harvest", metadata: "wet_weight_total_g, plant_count, avg_wet_per_plant_g, trim_weight_g, waste_weight_g" },
      { code: "drying", name: "Secado", requires: "zone,batch,resources", triggers: "transformation,phase_change", phase: "post_harvest", metadata: "method (hang/rack/machine), temp_C, humidity_pct, duration_days, wet_weight_in_g, dry_weight_out_g, moisture_target_pct" },
      { code: "curing", name: "Curado", requires: "zone,batch", triggers: "", metadata: "method (jar/bag/vault), temp_C, humidity_pct, duration_days, burp_schedule" },
      { code: "trimming", name: "Manicurado / Trimming", requires: "zone,batch,resources", triggers: "transformation", metadata: "method (hand/machine), input_weight_g, flower_output_g, trim_output_g, waste_g, trimmer_count" },
      { code: "extraction", name: "Extracción", requires: "batch,resources", triggers: "transformation", metadata: "method (BHO/CO2/ethanol/rosin), input_weight_g, output_weight_g, yield_pct, solvent_used_L" },
      { code: "packaging", name: "Empaque", requires: "batch,resources", triggers: "transformation,phase_change", phase: "packaging", metadata: "sku, units_produced, package_size, label_version" },
      { code: "grading_sorting", name: "Clasificación / Sorting", requires: "batch,resources", triggers: "transformation", metadata: "input_weight_kg, grades_output [{grade, weight_kg, pct}], equipment_used" },
    ],
  },
  {
    cat: "movement", icon: "📦", label: "Movimientos", color: "#0891b2",
    types: [
      { code: "relocation", name: "Reubicación de plantas", requires: "zone,batch", triggers: "", metadata: "from_zone, to_zone, from_positions, to_positions, plant_count, reason" },
      { code: "inventory_transfer", name: "Transferencia de inventario", requires: "resources", triggers: "", metadata: "from_area, to_area, item_count" },
      { code: "dispatch", name: "Despacho / Envío", requires: "batch,resources", triggers: "", metadata: "destination, transport_method, temp_C, manifest_number, carrier" },
      { code: "receiving", name: "Recepción de insumos", requires: "resources", triggers: "", metadata: "supplier, purchase_order, item_count, inspection_passed" },
    ],
  },
  {
    cat: "maintenance", icon: "🔧", label: "Mantenimiento", color: "#475569",
    types: [
      { code: "equipment_maintenance", name: "Mantenimiento de equipo", requires: "", triggers: "", metadata: "equipment_id, maintenance_type (preventive/corrective), description, parts_replaced, downtime_hours, cost" },
      { code: "calibration", name: "Calibración", requires: "", triggers: "", metadata: "equipment_id, sensor_type, before_reading, after_reading, buffer_solutions_used, next_calibration_date" },
      { code: "facility_repair", name: "Reparación de instalación", requires: "zone", triggers: "", metadata: "system (HVAC/irrigation/electrical/structural), description, contractor, cost" },
    ],
  },
  {
    cat: "quality", icon: "✅", label: "Calidad / Higiene / Inocuidad", color: "#e11d48",
    types: [
      { code: "cleaning", name: "Limpieza", requires: "zone,photos", triggers: "", metadata: "area_cleaned, products_used, method, duration_min, verified_by" },
      { code: "sanitization", name: "Sanitización", requires: "zone,resources,photos", triggers: "", metadata: "product, concentration, contact_time_min, surfaces_treated, atp_reading_before, atp_reading_after" },
      { code: "hygiene_check", name: "Inspección de higiene", requires: "zone,photos", triggers: "", metadata: "checklist_items [{item, pass_fail, notes}], overall_score, corrective_actions" },
      { code: "food_safety_audit", name: "Auditoría de inocuidad", requires: "photos", triggers: "", metadata: "auditor, standard (HACCP/SQF/BRCGS/GACP), findings [{item, severity, action}], score, next_audit_date" },
      { code: "lab_sampling", name: "Toma de muestra para laboratorio", requires: "batch", triggers: "", metadata: "sample_type (potency/microbial/pesticide/heavy_metal/mycotoxin), lab_name, sample_id, expected_results_date" },
      { code: "lab_result_review", name: "Revisión de resultado de laboratorio", requires: "batch,photos", triggers: "", metadata: "lab_name, sample_id, test_type, results_summary, pass_fail, coa_url, action_required" },
    ],
  },
  {
    cat: "harvest", icon: "🌾", label: "Cosecha (sub-actividades)", color: "#be185d",
    types: [
      { code: "pre_harvest_inspection", name: "Inspección pre-cosecha", requires: "zone,batch,photos", triggers: "", metadata: "maturity_index, brix, firmness, color_chart, phi_clearance, estimated_yield_kg" },
      { code: "harvest_manual", name: "Cosecha manual", requires: "zone,batch,resources,photos", triggers: "transformation", metadata: "workers_count, hours_worked, bins_filled, avg_weight_per_bin_kg, total_kg" },
      { code: "harvest_mechanical", name: "Cosecha mecánica", requires: "zone,batch,resources", triggers: "transformation", metadata: "equipment_id, area_harvested_ha, total_kg, fuel_consumed_L" },
      { code: "weighing", name: "Pesaje", requires: "batch", triggers: "", metadata: "scale_id, gross_weight, tare_weight, net_weight, unit, calibration_date" },
    ],
  },
  {
    cat: "administrative", icon: "📝", label: "Administrativo", color: "#64748b",
    types: [
      { code: "note", name: "Nota general", requires: "", triggers: "", metadata: "Texto libre — sin estructura" },
      { code: "incident_report", name: "Reporte de incidente", requires: "zone,photos", triggers: "", metadata: "incident_type (spill/equipment_failure/contamination/weather/pest_outbreak), severity, immediate_action, root_cause, corrective_action" },
      { code: "regulatory_report", name: "Reporte regulatorio", requires: "", triggers: "", metadata: "authority (ICA/INVIMA/MinSalud), report_type, period, submission_date, status" },
      { code: "visitor_log", name: "Registro de visitantes", requires: "photos", triggers: "", metadata: "visitor_name, organization, purpose, areas_visited, ppe_provided, accompanied_by" },
    ],
  },
];

const FLOW_EXAMPLE = [
  {
    step: "1. Operador abre la app en zona VEG-A",
    icon: "📱",
    detail: "Selecciona zona, el sistema pre-carga: batch activo, fase actual, plantas activas",
    tables: [],
  },
  {
    step: "2. Selecciona tipo: 'Aspersión foliar'",
    icon: "🛡️",
    detail: "activity_types.metadata_schema define los campos dinámicos que aparecen en el formulario. requires_resources=true muestra selector de productos. requires_photos=true habilita cámara.",
    tables: ["activity_types"],
  },
  {
    step: "3. Registra datos de la aplicación",
    icon: "📝",
    detail: "Completa: producto (Trichoderma), dosis (2g/L), volumen (50L), equipo (aspersora manual), condiciones (22°C, 65% HR, sin viento).",
    tables: ["activities.metadata"],
  },
  {
    step: "4. Agrega recursos consumidos",
    icon: "📦",
    detail: "Agrega: Trichoderma 100g (de INV-TRICHO-002, lote BIO-2026-05) + Agua 50L (INV-H2O-BULK). El sistema calcula cost_total automáticamente.",
    tables: ["activity_resources"],
  },
  {
    step: "5. Toma fotos del cultivo y la mezcla",
    icon: "📸",
    detail: "3 fotos: (1) mezcla preparada, (2) aplicación en proceso, (3) cultivo post-aplicación. GPS y timestamp se capturan del EXIF.",
    tables: ["activity_attachments"],
  },
  {
    step: "6. Registra lectura ambiental",
    icon: "🌡️",
    detail: "Temp: 22°C, HR: 65%, VPD: 1.1 kPa. Puede ser manual o auto-pull de sensor IoT.",
    tables: ["activity_environmental_readings"],
  },
  {
    step: "7. Completa la actividad → status = 'completed'",
    icon: "✅",
    detail: "Al completar, el sistema genera automáticamente las inventory_transactions (application) por cada recurso en activity_resources. También genera alertas de PHI (0 días) y REI (4 hrs) basadas en el producto.",
    tables: ["inventory_transactions", "alerts"],
  },
];

const QUERY_EXAMPLES = [
  {
    title: "Historial completo de un lote de cultivo",
    query: `SELECT a.completed_at, at.name as tipo, a.crop_phase,
  a.title, a.performed_by, a.duration_minutes,
  COUNT(ar.id) as recursos_usados,
  COUNT(aa.id) as fotos,
  SUM(ar.cost_total) as costo_total
FROM activities a
JOIN activity_types at ON a.type_id = at.id
LEFT JOIN activity_resources ar ON ar.activity_id = a.id
LEFT JOIN activity_attachments aa ON aa.activity_id = a.id
WHERE a.batch_id = :batch_id
GROUP BY a.id, at.name
ORDER BY a.completed_at DESC;`,
    description: "Timeline completo de todas las actividades de un lote, con costos y fotos adjuntas",
  },
  {
    title: "Spray diary (registro de aplicaciones)",
    query: `SELECT a.completed_at as fecha,
  z.name as zona, b.batch_number as lote,
  a.crop_phase as fase,
  p.name as producto, ar.quantity, um.code as unidad,
  ar.application_rate as dosis,
  a.metadata->>'weather_conditions' as clima,
  a.metadata->>'target_pest' as plaga_objetivo,
  p.phi_days, p.rei_hours,
  a.performed_by
FROM activities a
JOIN activity_types at ON a.type_id = at.id
JOIN activity_resources ar ON ar.activity_id = a.id
JOIN products p ON ar.product_id = p.id
JOIN units_of_measure um ON ar.unit_id = um.id
LEFT JOIN zones z ON a.zone_id = z.id
LEFT JOIN batches b ON a.batch_id = b.id
WHERE at.category = 'application'
  AND a.company_id = :company_id
ORDER BY a.completed_at DESC;`,
    description: "Reporte regulatorio: todas las aplicaciones de productos con dosis, clima, PHI/REI, operador",
  },
  {
    title: "COGS por fase de cultivo",
    query: `SELECT a.crop_phase,
  at.category as tipo_actividad,
  SUM(ar.cost_total) as costo_recursos,
  SUM(a.duration_minutes) / 60.0 as horas_labor,
  COUNT(DISTINCT a.id) as num_actividades
FROM activities a
JOIN activity_types at ON a.type_id = at.id
LEFT JOIN activity_resources ar ON ar.activity_id = a.id
WHERE a.batch_id = :batch_id
  AND a.status = 'completed'
GROUP BY a.crop_phase, at.category
ORDER BY
  CASE a.crop_phase
    WHEN 'propagation' THEN 1
    WHEN 'vegetative' THEN 2
    WHEN 'flowering' THEN 3
    WHEN 'harvest' THEN 4
    WHEN 'post_harvest' THEN 5
  END, at.category;`,
    description: "Desglose de costos por fase y tipo de actividad para un lote específico",
  },
  {
    title: "Monitoreo: problemas activos sin resolver",
    query: `SELECT a.completed_at as detectado,
  z.name as zona, ao.observation_type,
  ao.severity, ao.description,
  ao.affected_plant_count, ao.affected_area_pct,
  ao.recommended_action, ao.follow_up_date,
  o.common_name as organismo
FROM activity_observations ao
JOIN activities a ON ao.activity_id = a.id
LEFT JOIN zones z ON a.zone_id = z.id
LEFT JOIN organisms o ON ao.organism_id = o.id
WHERE ao.resolved = false
  AND a.company_id = :company_id
ORDER BY ao.severity DESC, ao.follow_up_date ASC;`,
    description: "Dashboard de problemas detectados pendientes de resolver, priorizados por severidad",
  },
  {
    title: "Rendimiento (yield) por transformación",
    query: `SELECT at.name as tipo_transformacion,
  a.metadata->>'wet_weight_in_g' as peso_entrada,
  a.metadata->>'dry_weight_out_g' as peso_salida,
  re.yield_pct as rendimiento_real,
  p.default_yield_pct as rendimiento_esperado,
  re.yield_pct - p.default_yield_pct as desviacion
FROM activities a
JOIN activity_types at ON a.type_id = at.id
LEFT JOIN recipe_executions re ON a.recipe_execution_id = re.id
LEFT JOIN products p ON re.recipe_id IS NOT NULL
WHERE at.triggers_transformation = true
  AND a.batch_id = :batch_id
ORDER BY a.completed_at;`,
    description: "Comparación de rendimiento real vs esperado en cada transformación de un lote",
  },
];

function FieldRow({ f }) {
  if (f.g === "section") {
    return (
      <div style={{ padding: "4px 12px", background: "#f8fafc", fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{f.n.replace(/—/g, "").trim()}</div>
    );
  }
  const isNew = f.g === "new";
  return (
    <div style={{ display: "flex", gap: 4, padding: "3px 12px", fontSize: 11, fontFamily: "monospace", borderBottom: "1px solid #f8fafc", background: isNew ? "#fffbeb" : "#fff", flexWrap: "wrap", alignItems: "baseline" }}>
      <span style={{ fontWeight: 600, color: isNew ? "#d97706" : "#1e293b", minWidth: 160 }}>{isNew ? "★ " : ""}{f.n}</span>
      <span style={{ color: "#6366f1", flex: 1, minWidth: 160 }}>{f.t}</span>
      {f.note && <span style={{ color: "#94a3b8", fontSize: 10, fontStyle: "italic", width: "100%", paddingLeft: 160 }}>{f.note}</span>}
    </div>
  );
}

function Pill({ children, color }) {
  return <span style={{ background: `${color}15`, color, padding: "2px 7px", borderRadius: 10, fontSize: 10, fontWeight: 600, whiteSpace: "nowrap" }}>{children}</span>;
}

export default function ActivityModel() {
  const [tab, setTab] = useState("model");
  const [expandedCats, setExpandedCats] = useState(new Set(["cultivation", "monitoring", "application"]));
  const [expandedQ, setExpandedQ] = useState(new Set([0]));

  const toggleCat = (c) => setExpandedCats(p => { const n = new Set(p); n.has(c) ? n.delete(c) : n.add(c); return n; });
  const toggleQ = (i) => setExpandedQ(p => { const n = new Set(p); n.has(i) ? n.delete(i) : n.add(i); return n; });

  const totalTypes = ACTIVITY_TYPES_TREE.reduce((a, c) => a + c.types.length, 0);

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", maxWidth: 780, margin: "0 auto", padding: 16, background: "#fff", minHeight: "100vh" }}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <h1 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "#1e293b" }}>📋 Modelo de Actividades de Cultivo</h1>
        <p style={{ fontSize: 11, color: "#64748b", margin: "4px 0" }}>
          {CORE_TABLES.length} tablas · {ACTIVITY_TYPES_TREE.length} categorías · {totalTypes} tipos de actividad
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 16 }}>
        {[
          { n: CORE_TABLES.length, l: "Tablas", c: "#2563eb", bg: "#eff6ff" },
          { n: ACTIVITY_TYPES_TREE.length, l: "Categorías", c: "#16a34a", bg: "#f0fdf4" },
          { n: totalTypes, l: "Tipos", c: "#7c3aed", bg: "#faf5ff" },
          { n: "∞", l: "Metadata dinámica", c: "#f59e0b", bg: "#fffbeb" },
        ].map((s, i) => (
          <div key={i} style={{ background: s.bg, borderRadius: 8, padding: 8, textAlign: "center", border: `1px solid ${s.c}20` }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: s.c }}>{s.n}</div>
            <div style={{ fontSize: 9, color: s.c }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 0, marginBottom: 16, borderBottom: "2px solid #e2e8f0", overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "8px 12px", border: "none", borderBottom: tab === t.id ? "2px solid #2563eb" : "2px solid transparent", background: "none", cursor: "pointer", fontSize: 12, fontWeight: tab === t.id ? 700 : 400, color: tab === t.id ? "#1e293b" : "#999", marginBottom: -2, whiteSpace: "nowrap" }}>{t.label}</button>
        ))}
      </div>

      {tab === "model" && (
        <div>
          <div style={{ background: "#f0f4ff", border: "1px solid #c7d2fe", borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 11, lineHeight: 1.7 }}>
            <strong>Arquitectura:</strong> <code>activities</code> es la tabla central con contexto fijo (quién, dónde, cuándo, qué lote, qué fase). Los datos variables van en <code>metadata</code> (JSONB validado por el schema del tipo). Los recursos consumidos van en <code>activity_resources</code> (que genera <code>inventory_transactions</code> al completar). Las fotos/documentos en <code>activity_attachments</code>. Los hallazgos de monitoreo en <code>activity_observations</code>. Lecturas ambientales en tabla dedicada opcional.
          </div>

          {/* Relationship diagram */}
          <div style={{ background: "#1e293b", borderRadius: 10, padding: 16, color: "#fff", marginBottom: 16, fontFamily: "monospace", fontSize: 11, lineHeight: 2.2 }}>
            <div style={{ textAlign: "center", fontSize: 10, opacity: 0.5, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1.5 }}>Relaciones</div>
            <div style={{ textAlign: "center" }}>
              <span style={{ color: "#fbbf24" }}>activity_types</span> ←── <span style={{ color: "#60a5fa" }}>activities</span> ──→ <span style={{ color: "#f87171" }}>activity_resources</span> ──→ <span style={{ color: "#94a3b8" }}>inventory_transactions</span><br />
              {"                          "}│<br />
              {"                          "}├──→ <span style={{ color: "#a78bfa" }}>activity_attachments</span> (fotos, docs)<br />
              {"                          "}├──→ <span style={{ color: "#fbbf24" }}>activity_observations</span> (monitoreo)<br />
              {"                          "}├──→ <span style={{ color: "#22d3ee" }}>activity_environmental_readings</span><br />
              {"                          "}├──→ <span style={{ color: "#94a3b8" }}>recipe_executions</span> (si aplica)<br />
              {"                          "}└──→ <span style={{ color: "#60a5fa" }}>activities</span> (self: sub-actividades)<br />
            </div>
          </div>

          {CORE_TABLES.map(table => (
            <div key={table.name} style={{ border: "1px solid #e2e8f0", borderRadius: 8, marginBottom: 14, overflow: "hidden" }}>
              <div style={{ background: table.color, padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ color: "#fff", fontWeight: 800, fontSize: 13, fontFamily: "monospace" }}>{table.name}</span>
                <Pill color="#fff">{table.label}</Pill>
              </div>
              <div style={{ background: `${table.color}08`, padding: "6px 12px", fontSize: 11, color: "#475569", borderBottom: "1px solid #e2e8f0" }}>{table.desc}</div>
              <div>{table.fields.map((f, i) => <FieldRow key={i} f={f} />)}</div>
            </div>
          ))}
        </div>
      )}

      {tab === "types" && (
        <div>
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 11, lineHeight: 1.7 }}>
            <strong>Dos niveles de clasificación:</strong> <code>category</code> es un ENUM fijo (10 valores) que determina la lógica de negocio (qué módulos se activan, qué reglas aplican). <code>activity_types</code> es una tabla configurable por empresa que da granularidad dentro de cada categoría. El campo <code>metadata_schema</code> en cada tipo define un JSON Schema que valida los datos dinámicos del formulario.
          </div>

          <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
            <button onClick={() => setExpandedCats(new Set(ACTIVITY_TYPES_TREE.map(c => c.cat)))} style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontSize: 11 }}>Expandir todo</button>
            <button onClick={() => setExpandedCats(new Set())} style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontSize: 11 }}>Colapsar</button>
          </div>

          {ACTIVITY_TYPES_TREE.map(cat => (
            <div key={cat.cat} style={{ marginBottom: 8 }}>
              <button onClick={() => toggleCat(cat.cat)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", border: `1px solid ${cat.color}30`, borderLeft: `4px solid ${cat.color}`, borderRadius: 8, background: "#fff", cursor: "pointer", textAlign: "left" }}>
                <span style={{ fontSize: 18 }}>{cat.icon}</span>
                <span style={{ fontWeight: 700, fontSize: 13, color: cat.color, flex: 1 }}>{cat.label}</span>
                <Pill color={cat.color}>{cat.types.length} tipos</Pill>
                <span style={{ color: "#94a3b8", fontSize: 12, transform: expandedCats.has(cat.cat) ? "rotate(180deg)" : "none", transition: "0.2s" }}>▼</span>
              </button>
              {expandedCats.has(cat.cat) && (
                <div style={{ marginLeft: 16, borderLeft: `2px solid ${cat.color}20`, paddingLeft: 12, paddingTop: 6 }}>
                  {cat.types.map((t, i) => (
                    <div key={i} style={{ padding: "6px 0", borderBottom: i < cat.types.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
                        <span style={{ fontFamily: "monospace", fontSize: 11, color: cat.color, fontWeight: 700 }}>{t.code}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#1e293b" }}>{t.name}</span>
                      </div>
                      <div style={{ display: "flex", gap: 4, marginTop: 3, flexWrap: "wrap" }}>
                        {t.requires.split(",").filter(Boolean).map(r => (
                          <Pill key={r} color={r === "photos" ? "#7c3aed" : r === "resources" ? "#dc2626" : r === "zone" ? "#0891b2" : r === "batch" ? "#16a34a" : "#64748b"}>{r}</Pill>
                        ))}
                        {t.triggers.split(",").filter(Boolean).map(tr => (
                          <Pill key={tr} color="#f59e0b">→ {tr}</Pill>
                        ))}
                        {t.phase && <Pill color="#7c3aed">fase → {t.phase}</Pill>}
                      </div>
                      <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 3, fontFamily: "monospace" }}>
                        metadata: {t.metadata}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "flow" && (
        <div>
          <div style={{ background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 11, lineHeight: 1.7 }}>
            <strong>Ejemplo: aplicación foliar de Trichoderma en zona vegetativa.</strong> Muestra el flujo completo desde que el operador abre la app hasta que se generan las transacciones de inventario automáticamente.
          </div>

          {FLOW_EXAMPLE.map((step, i) => (
            <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "flex-start" }}>
              <div style={{ minWidth: 36, height: 36, borderRadius: "50%", background: "#f0f4ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, border: "2px solid #c7d2fe" }}>{step.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: "#1e293b" }}>{step.step}</div>
                <div style={{ fontSize: 11, color: "#475569", marginTop: 2, lineHeight: 1.5 }}>{step.detail}</div>
                {step.tables.length > 0 && (
                  <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                    {step.tables.map(t => <Pill key={t} color="#6366f1">{t}</Pill>)}
                  </div>
                )}
              </div>
              {i < FLOW_EXAMPLE.length - 1 && (
                <div style={{ position: "absolute", left: 34, top: 40, width: 2, height: 20, background: "#e2e8f0" }} />
              )}
            </div>
          ))}

          <div style={{ background: "#1e293b", borderRadius: 10, padding: 16, color: "#fff", marginTop: 16 }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, opacity: 0.5, marginBottom: 8 }}>Registros generados por esta actividad</div>
            <div style={{ fontSize: 11, lineHeight: 2 }}>
              <span style={{ color: "#60a5fa" }}>1 × activities</span> — tipo: foliar_spray, zona: VEG-A, batch: PLN-260215, fase: vegetative<br />
              <span style={{ color: "#f87171" }}>2 × activity_resources</span> — Trichoderma 100g ($12.00) + Agua 50L ($0.25)<br />
              <span style={{ color: "#a78bfa" }}>3 × activity_attachments</span> — 3 fotos con GPS y timestamp<br />
              <span style={{ color: "#22d3ee" }}>3 × activity_environmental_readings</span> — temp, humedad, VPD<br />
              <span style={{ color: "#94a3b8" }}>2 × inventory_transactions</span> — application (Trichoderma) + application (Agua)<br />
              <span style={{ color: "#fbbf24" }}>1 × alerta PHI</span> — 0 días (Trichoderma es biológico)<br />
              <span style={{ color: "#fbbf24" }}>1 × alerta REI</span> — 4 horas reingreso<br />
              <br />
              <span style={{ fontWeight: 700, color: "#fbbf24" }}>Total: 1 actividad genera 12 registros</span> vinculados y consultables
            </div>
          </div>
        </div>
      )}

      {tab === "queries" && (
        <div>
          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 11, lineHeight: 1.7 }}>
            <strong>El modelo permite consultar por cualquier dimensión:</strong> tipo de actividad, categoría, zona, lote, fase, producto aplicado, operador, fecha, severidad de problema, y combinaciones de todos. Estos queries son directos porque el contexto está normalizado en la tabla principal.
          </div>

          {QUERY_EXAMPLES.map((q, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <button onClick={() => toggleQ(i)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", cursor: "pointer", textAlign: "left" }}>
                <span style={{ fontWeight: 700, fontSize: 12, color: "#1e293b", flex: 1 }}>{q.title}</span>
                <span style={{ color: "#94a3b8", fontSize: 12, transform: expandedQ.has(i) ? "rotate(180deg)" : "none", transition: "0.2s" }}>▼</span>
              </button>
              {expandedQ.has(i) && (
                <div style={{ marginLeft: 8, borderLeft: "2px solid #e2e8f0", paddingLeft: 12, paddingTop: 6 }}>
                  <div style={{ fontSize: 11, color: "#475569", marginBottom: 6 }}>{q.description}</div>
                  <pre style={{ background: "#1e293b", color: "#e2e8f0", padding: 12, borderRadius: 6, fontSize: 10, overflow: "auto", lineHeight: 1.5 }}>{q.query}</pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
