import { useState } from "react";

const TABS = [
  { id: "concept", label: "💡 Concepto" },
  { id: "schema", label: "🏗️ Schema" },
  { id: "templates", label: "📋 Templates Ejemplo" },
  { id: "scheduling", label: "📅 Programación" },
  { id: "ux", label: "📱 Flujo UX" },
];

const SCHEMA_TABLES = [
  {
    name: "activity_templates",
    label: "NUEVA",
    color: "#7c3aed",
    desc: "Plantilla reutilizable de actividad. Define QUÉ hacer, CON QUÉ, CUÁNTO tarda, y EN QUÉ FASE aplica. Es la receta de la actividad, no la ejecución.",
    fields: [
      { n: "id", t: "UUID (PK)", note: "" },
      { n: "company_id", t: "FK → companies", note: "" },
      { n: "— Clasificación —", t: "", s: true },
      { n: "type_id", t: "FK → activity_types", note: "Tipo de actividad (foliar_spray, pruning, etc.)" },
      { n: "name", t: "VARCHAR", note: "'Fertirrigación Vegetativa Semana 2' o 'Poda apical día 21'" },
      { n: "code", t: "VARCHAR UNIQUE per company", note: "'FERT-VEG-S2', 'PODA-APICAL-D21'" },
      { n: "description", t: "TEXT (nullable)", note: "Instrucciones detalladas para el operador" },
      { n: "— Aplicabilidad —", t: "", s: true },
      { n: "crop_type_ids", t: "FK[] → crop_types", note: "¿Para qué cultivos? Cannabis, lechuga, fresa..." },
      { n: "applicable_phases", t: "crop_phase[] NOT NULL", note: "['vegetative'] o ['vegetative','flowering'] — en qué fases se puede usar" },
      { n: "phase_day_start", t: "INT (nullable)", note: "Desde qué día de la fase. Ej: día 14 de vegetativo" },
      { n: "phase_day_end", t: "INT (nullable)", note: "Hasta qué día. Permite rango: día 14-21 de vegetativo" },
      { n: "— Tiempo —", t: "", s: true },
      { n: "estimated_duration_min", t: "INT (nullable)", note: "Duración estimada en minutos" },
      { n: "labor_hours_per_1000_plants", t: "DECIMAL (nullable)", note: "Benchmark: horas de mano de obra por cada 1000 plantas" },
      { n: "— Recurrencia —", t: "", s: true },
      { n: "frequency_type", t: "ENUM ['once','daily','weekly','biweekly','monthly','on_demand','custom_days'] DEFAULT 'once'", note: "" },
      { n: "frequency_interval_days", t: "INT (nullable)", note: "Para custom: cada N días. Ej: cada 3 días" },
      { n: "repeat_count", t: "INT (nullable)", note: "Cuántas veces se repite en la fase. null = hasta fin de fase" },
      { n: "— Metadata por defecto —", t: "", s: true },
      { n: "default_metadata", t: "JSONB DEFAULT '{}'", note: "Datos pre-llenados en activities.metadata. Ej: {dose_per_L: 2, method: 'foliar'}" },
      { n: "default_priority", t: "ENUM ['routine','urgent','critical'] DEFAULT 'routine'", note: "" },
      { n: "— Condiciones —", t: "", s: true },
      { n: "requires_conditions", t: "JSONB (nullable)", note: "Condiciones ambientales requeridas: {max_temp_C: 30, no_rain: true, min_light_hours: 4}" },
      { n: "depends_on_template_id", t: "FK → self (nullable)", note: "Esta actividad solo se puede hacer después de otra. Ej: Secado depende de Cosecha" },
      { n: "min_days_after_dependency", t: "INT (nullable)", note: "Mínimo N días después de la dependencia" },
      { n: "— Normativo —", t: "", s: true },
      { n: "regulatory_reference", t: "VARCHAR (nullable)", note: "SOP, protocolo, norma. Ej: 'SOP-CUL-014 Poda vegetativa'" },
      { n: "requires_verification", t: "BOOLEAN DEFAULT false", note: "¿Requiere que un supervisor verifique?" },
      { n: "— Estado —", t: "", s: true },
      { n: "sort_order", t: "INT DEFAULT 0", note: "" },
      { n: "is_active", t: "BOOLEAN DEFAULT true", note: "" },
      { n: "version", t: "INT DEFAULT 1", note: "Versionamiento — al editar una template activa, se crea nueva versión" },
      { n: "created_at", t: "TIMESTAMPTZ", note: "" },
      { n: "updated_at", t: "TIMESTAMPTZ", note: "" },
    ],
  },
  {
    name: "activity_template_resources",
    label: "NUEVA",
    color: "#dc2626",
    desc: "Recursos pre-definidos que consume esta template. Al usar la template, se pre-cargan en activity_resources. Cantidades pueden ser fijas, por planta, o por m².",
    fields: [
      { n: "id", t: "UUID (PK)", note: "" },
      { n: "template_id", t: "FK → activity_templates", note: "" },
      { n: "product_id", t: "FK → products", note: "Qué recurso" },
      { n: "— Cantidad —", t: "", s: true },
      { n: "quantity", t: "DECIMAL NOT NULL", note: "Cantidad base" },
      { n: "unit_id", t: "FK → units_of_measure", note: "" },
      { n: "quantity_basis", t: "ENUM ['fixed','per_plant','per_m2','per_zone','per_L_solution'] DEFAULT 'fixed'", note: "Cómo escala la cantidad" },
      { n: "— Aplicación —", t: "", s: true },
      { n: "direction", t: "ENUM ['consumed','applied','produced'] DEFAULT 'consumed'", note: "" },
      { n: "application_rate", t: "VARCHAR (nullable)", note: "'2 mL/L', '5 g/m²'" },
      { n: "application_method", t: "VARCHAR (nullable)", note: "'foliar', 'drench', 'broadcast'" },
      { n: "— Sustitutos —", t: "", s: true },
      { n: "is_required", t: "BOOLEAN DEFAULT true", note: "false = opcional, el operador decide si lo usa" },
      { n: "alternative_product_ids", t: "FK[] → products (nullable)", note: "Productos sustitutos si el principal no tiene stock" },
      { n: "— Orden —", t: "", s: true },
      { n: "sequence", t: "INT DEFAULT 0", note: "Orden de aplicación (importa en mezclas)" },
      { n: "notes", t: "TEXT (nullable)", note: "'Disolver primero en agua tibia', 'Aplicar al atardecer'" },
      { n: "created_at", t: "TIMESTAMPTZ", note: "" },
    ],
  },
  {
    name: "activity_template_checklist",
    label: "NUEVA — OPCIONAL",
    color: "#f59e0b",
    desc: "Checklist de pasos o verificaciones asociadas a una template. El operador marca cada item al ejecutar. Útil para SOPs y cumplimiento regulatorio.",
    fields: [
      { n: "id", t: "UUID (PK)", note: "" },
      { n: "template_id", t: "FK → activity_templates", note: "" },
      { n: "step_number", t: "INT", note: "Orden del paso" },
      { n: "title", t: "VARCHAR", note: "'Verificar pH de la mezcla'" },
      { n: "description", t: "TEXT (nullable)", note: "Instrucción detallada" },
      { n: "is_required", t: "BOOLEAN DEFAULT true", note: "Si es obligatorio para completar la actividad" },
      { n: "requires_photo", t: "BOOLEAN DEFAULT false", note: "¿Debe adjuntar foto de este paso?" },
      { n: "requires_value", t: "BOOLEAN DEFAULT false", note: "¿Debe ingresar un valor?" },
      { n: "value_type", t: "ENUM ['text','number','boolean','select'] (nullable)", note: "" },
      { n: "value_options", t: "TEXT[] (nullable)", note: "Para select: ['Aprobado','Rechazado','Pendiente']" },
      { n: "value_min", t: "DECIMAL (nullable)", note: "Rango válido para number" },
      { n: "value_max", t: "DECIMAL (nullable)", note: "" },
      { n: "created_at", t: "TIMESTAMPTZ", note: "" },
    ],
  },
  {
    name: "scheduled_activities",
    label: "NUEVA",
    color: "#2563eb",
    desc: "Actividades programadas a futuro, generadas desde templates. Cuando se ejecutan, crean una activity real. El plan de cultivo vive aquí.",
    fields: [
      { n: "id", t: "UUID (PK)", note: "" },
      { n: "company_id", t: "FK → companies", note: "" },
      { n: "— Origen —", t: "", s: true },
      { n: "template_id", t: "FK → activity_templates", note: "De qué template viene" },
      { n: "schedule_id", t: "FK → cultivation_schedules (nullable)", note: "Si fue generada por un plan de cultivo completo" },
      { n: "— Contexto —", t: "", s: true },
      { n: "zone_id", t: "FK → zones (nullable)", note: "" },
      { n: "batch_id", t: "FK → batches (nullable)", note: "" },
      { n: "crop_phase", t: "ENUM crop_phase (nullable)", note: "" },
      { n: "phase_day", t: "INT (nullable)", note: "Día de la fase en que debe ejecutarse" },
      { n: "— Programación —", t: "", s: true },
      { n: "scheduled_date", t: "DATE NOT NULL", note: "Fecha programada" },
      { n: "scheduled_time", t: "TIME (nullable)", note: "Hora sugerida" },
      { n: "due_date", t: "DATE (nullable)", note: "Fecha límite (si es flexible). Ej: puede hacerse entre el 10 y el 12" },
      { n: "assigned_to", t: "FK → users (nullable)", note: "Responsable asignado" },
      { n: "— Ejecución —", t: "", s: true },
      { n: "status", t: "ENUM ['pending','in_progress','completed','skipped','overdue','cancelled']", note: "" },
      { n: "activity_id", t: "FK → activities (nullable)", note: "La actividad real generada al ejecutar. null = aún no ejecutada" },
      { n: "completed_at", t: "TIMESTAMPTZ (nullable)", note: "" },
      { n: "skipped_reason", t: "TEXT (nullable)", note: "Si status=skipped: por qué se saltó" },
      { n: "— Recurrencia —", t: "", s: true },
      { n: "recurrence_index", t: "INT (nullable)", note: "Si es parte de serie: posición (1 de 8, 2 de 8...)" },
      { n: "recurrence_total", t: "INT (nullable)", note: "Total de repeticiones en la serie" },
      { n: "— Auditoría —", t: "", s: true },
      { n: "created_at", t: "TIMESTAMPTZ", note: "" },
      { n: "updated_at", t: "TIMESTAMPTZ", note: "" },
    ],
  },
  {
    name: "cultivation_schedules",
    label: "NUEVA — PLAN MAESTRO",
    color: "#16a34a",
    desc: "Plan de cultivo completo: agrupa todas las scheduled_activities de un batch/ciclo. Se genera automáticamente desde las templates aplicables al crop_type + cada fase.",
    fields: [
      { n: "id", t: "UUID (PK)", note: "" },
      { n: "company_id", t: "FK → companies", note: "" },
      { n: "name", t: "VARCHAR", note: "'Plan Gelato Indoor Ciclo Feb-2026'" },
      { n: "— Contexto —", t: "", s: true },
      { n: "batch_id", t: "FK → batches", note: "Lote de cultivo" },
      { n: "crop_type_id", t: "FK → crop_types", note: "" },
      { n: "zone_id", t: "FK → zones (nullable)", note: "" },
      { n: "— Fechas del ciclo —", t: "", s: true },
      { n: "planned_start_date", t: "DATE", note: "Fecha de inicio (siembra)" },
      { n: "planned_phases", t: "JSONB NOT NULL", note: "Duración planeada por fase: [{phase: 'propagation', days: 14}, {phase: 'vegetative', days: 28}, ...]" },
      { n: "planned_end_date", t: "DATE", note: "Calculado: start + sum(phase_days)" },
      { n: "actual_end_date", t: "DATE (nullable)", note: "" },
      { n: "— Progreso —", t: "", s: true },
      { n: "total_activities", t: "INT", note: "Total de scheduled_activities generadas" },
      { n: "completed_activities", t: "INT DEFAULT 0", note: "" },
      { n: "completion_pct", t: "DECIMAL GENERATED", note: "completed / total × 100" },
      { n: "current_phase", t: "ENUM crop_phase (nullable)", note: "" },
      { n: "current_phase_day", t: "INT (nullable)", note: "" },
      { n: "— Estado —", t: "", s: true },
      { n: "status", t: "ENUM ['draft','active','completed','cancelled']", note: "" },
      { n: "created_at", t: "TIMESTAMPTZ", note: "" },
      { n: "updated_at", t: "TIMESTAMPTZ", note: "" },
    ],
  },
];

const TEMPLATE_EXAMPLES = [
  {
    cat: "Fertirrigación", color: "#2563eb", icon: "💧",
    templates: [
      {
        name: "Fertirrigación Vegetativa Semana 1-2",
        code: "FERT-VEG-S1",
        phases: ["vegetative"], dayRange: "1-14",
        freq: "daily", duration: "30 min",
        resources: [
          { product: "Nitrato de Calcio", qty: "0.8", unit: "g/L", basis: "per_L_solution", required: true },
          { product: "MKP", qty: "0.3", unit: "g/L", basis: "per_L_solution", required: true },
          { product: "Sulfato de Magnesio", qty: "0.5", unit: "g/L", basis: "per_L_solution", required: true },
          { product: "Micro Mix Quelatos", qty: "0.1", unit: "g/L", basis: "per_L_solution", required: true },
          { product: "Ácido Fosfórico", qty: "~", unit: "mL/L", basis: "per_L_solution", required: true },
          { product: "Agua RO", qty: "5", unit: "L", basis: "per_plant", required: true },
        ],
        metadata: "ec_target: 1.2-1.4, ph_target: 5.8-6.2, runoff_target: 15-20%",
        checklist: ["Verificar EC de entrada", "Verificar pH de entrada", "Verificar % drenaje", "Registrar EC de drenaje", "Registrar pH de drenaje"],
      },
      {
        name: "Fertirrigación Floración Semana 4-6",
        code: "FERT-FLO-S4",
        phases: ["flowering"], dayRange: "22-42",
        freq: "daily", duration: "30 min",
        resources: [
          { product: "Nitrato de Calcio", qty: "0.6", unit: "g/L", basis: "per_L_solution", required: true },
          { product: "MKP", qty: "0.8", unit: "g/L", basis: "per_L_solution", required: true },
          { product: "Sulfato de Magnesio", qty: "0.6", unit: "g/L", basis: "per_L_solution", required: true },
          { product: "Sulfato de Potasio", qty: "0.4", unit: "g/L", basis: "per_L_solution", required: true },
          { product: "Micro Mix Quelatos", qty: "0.1", unit: "g/L", basis: "per_L_solution", required: true },
        ],
        metadata: "ec_target: 2.0-2.4, ph_target: 5.8-6.0, runoff_target: 20-25%",
        checklist: ["Verificar EC de entrada", "Verificar pH de entrada", "Verificar % drenaje"],
      },
    ],
  },
  {
    cat: "Protección de Cultivos", color: "#dc2626", icon: "🛡️",
    templates: [
      {
        name: "Aplicación preventiva Trichoderma",
        code: "BIO-TRICHO-PREV",
        phases: ["vegetative", "flowering"], dayRange: null,
        freq: "biweekly", duration: "45 min",
        resources: [
          { product: "Trichoderma harzianum", qty: "2", unit: "g/L", basis: "per_L_solution", required: true },
          { product: "Agua", qty: "100", unit: "mL", basis: "per_plant", required: true },
        ],
        metadata: "method: drench, target: prevención Pythium/Fusarium",
        checklist: ["Verificar viabilidad del producto (fecha vencimiento)", "Preparar solución máx 2h antes de aplicar", "Aplicar en las primeras horas de luz", "No aplicar si sustrato está saturado"],
      },
      {
        name: "Liberación de Phytoseiulus persimilis",
        code: "BIO-PHYTO-RELEASE",
        phases: ["vegetative", "flowering"], dayRange: null,
        freq: "on_demand", duration: "20 min",
        resources: [
          { product: "Phytoseiulus persimilis", qty: "5", unit: "individuos", basis: "per_m2", required: true },
        ],
        metadata: "target: ácaros (Tetranychus urticae), min_temp: 18°C, max_temp: 30°C, min_humidity: 60%",
        checklist: ["Verificar cadena de frío del producto", "Contar organismos para verificar viabilidad", "Distribuir uniformemente", "No aplicar pesticidas incompatibles por 7 días"],
      },
    ],
  },
  {
    cat: "Cultivo", color: "#16a34a", icon: "🌱",
    templates: [
      {
        name: "Poda apical (Topping)",
        code: "CULT-TOPPING",
        phases: ["vegetative"], dayRange: "18-25",
        freq: "once", duration: "60 min",
        resources: [
          { product: "Alcohol isopropílico 70%", qty: "50", unit: "mL", basis: "fixed", required: true },
          { product: "Guantes nitrilo", qty: "2", unit: "pares", basis: "fixed", required: true },
        ],
        metadata: "node_target: 5-6, technique: clean_cut_above_node",
        checklist: ["Desinfectar tijeras entre cada planta", "Cortar por encima del 5° o 6° nodo", "Verificar que no haya signos de estrés previo", "Registrar plantas que no se podaron (y razón)"],
      },
      {
        name: "Trasplante a maceta definitiva",
        code: "CULT-TRANSPLANT-DEF",
        phases: ["vegetative"], dayRange: "14-21",
        freq: "once", duration: "120 min",
        resources: [
          { product: "Maceta 11L", qty: "1", unit: "unidad", basis: "per_plant", required: true },
          { product: "Sustrato Coco:Perlita 70:30", qty: "11", unit: "L", basis: "per_plant", required: true },
          { product: "Micorriza granular", qty: "5", unit: "g", basis: "per_plant", required: false },
          { product: "Agua con pH ajustado", qty: "2", unit: "L", basis: "per_plant", required: true },
        ],
        metadata: "container_size: 11L, substrate_recipe: 70:30 coco:perlita",
        checklist: ["Pre-hidratar sustrato (EC < 0.5, pH 5.8-6.2)", "Hacer hoyo del tamaño del root ball", "No enterrar tallo por encima de la línea de sustrato", "Regar suavemente post-trasplante", "Etiquetar maceta con ID de planta"],
      },
    ],
  },
  {
    cat: "Cosecha y Poscosecha", color: "#7c3aed", icon: "✂️",
    templates: [
      {
        name: "Cosecha manual (corte)",
        code: "HARV-MANUAL-CUT",
        phases: ["flowering"], dayRange: "56-70",
        freq: "once", duration: "180 min",
        resources: [
          { product: "Guantes nitrilo", qty: "4", unit: "pares", basis: "fixed", required: true },
          { product: "Tijeras de cosecha", qty: "2", unit: "unidad", basis: "fixed", required: true },
          { product: "Alcohol isopropílico", qty: "200", unit: "mL", basis: "fixed", required: true },
          { product: "Bolsas de cosecha", qty: "1", unit: "unidad", basis: "per_plant", required: true },
        ],
        metadata: "triggers_transformation, triggers_phase_change → harvest",
        checklist: ["Inspección de tricomas (>70% milky)", "Cortar oscuro o justo al encender luces", "Pesar cada planta individual (peso húmedo)", "Etiquetar con ID de planta", "Registrar peso húmedo total", "Separar larf/trim de flores principales", "Pesar trim por separado", "Registrar hora de corte"],
      },
    ],
  },
  {
    cat: "Calidad / Higiene", color: "#e11d48", icon: "✅",
    templates: [
      {
        name: "Limpieza y sanitización de sala",
        code: "QA-CLEAN-ROOM",
        phases: ["propagation", "vegetative", "flowering", "post_harvest"], dayRange: null,
        freq: "weekly", duration: "90 min",
        resources: [
          { product: "Peróxido de hidrógeno 3%", qty: "500", unit: "mL", basis: "per_zone", required: true },
          { product: "Detergente neutro", qty: "100", unit: "mL", basis: "per_zone", required: true },
          { product: "Toallas desechables", qty: "1", unit: "rollo", basis: "per_zone", required: true },
        ],
        metadata: "surfaces: floors, walls, tables, equipment, drains",
        checklist: ["Retirar material orgánico suelto", "Barrer/aspirar pisos", "Aplicar detergente en superficies", "Enjuagar", "Aplicar sanitizante (contacto mínimo 10 min)", "Limpiar sistema de drenaje", "Verificar trampas de insectos", "Registrar lectura ATP si disponible", "Tomar foto antes/después"],
      },
    ],
  },
];

const SCHEDULE_GENERATION = [
  {
    step: "1. Crear batch con crop_type + zona + fecha de inicio",
    detail: "Usuario crea un nuevo lote de cultivo: Gelato Indoor, Zona A, inicio 2026-03-01",
    icon: "🌱",
  },
  {
    step: "2. Definir duración de cada fase",
    detail: "Propagación: 14 días → Vegetativo: 28 días → Floración: 63 días → Cosecha: 1 día → Post-cosecha: 21 días. Total: 127 días",
    icon: "📅",
  },
  {
    step: "3. Sistema busca templates aplicables",
    detail: "Filtra activity_templates WHERE crop_type_ids @> 'cannabis' AND applicable_phases && batch_phases AND is_active = true. Resultado: 15 templates aplican.",
    icon: "🔍",
  },
  {
    step: "4. Generar scheduled_activities",
    detail: "Para cada template, calcular fechas según fase + day_range + frecuencia. Ej: FERT-VEG-S1 (diaria, días 1-14 de veg) genera 14 scheduled_activities desde 2026-03-15 hasta 2026-03-28.",
    icon: "⚙️",
  },
  {
    step: "5. cultivation_schedule creado",
    detail: "Plan completo con ~180 actividades programadas distribuidas en 127 días. Cada una con template, fecha, zona, batch, fase, y recursos pre-calculados.",
    icon: "✅",
  },
  {
    step: "6. Vista tipo calendario/Gantt",
    detail: "El usuario ve su plan como calendario o timeline. Cada día muestra las actividades pendientes. Puede moverlas, saltarlas, o agregar nuevas manualmente.",
    icon: "📊",
  },
  {
    step: "7. Ejecución diaria",
    detail: "Operador abre app → ve lista del día → selecciona actividad → formulario pre-llenado desde template (tipo, recursos, checklist, metadata). Solo completa datos reales y fotos → submit → activity + transactions generadas.",
    icon: "📱",
  },
];

const UX_FLOW = {
  scenario_a: {
    title: "Escenario A: Reporte rápido sin programación previa",
    steps: [
      { action: "Operador está en zona VEG-A, necesita reportar un riego", ui: "Abre app → botón '+ Actividad'", color: "#16a34a" },
      { action: "Selecciona fase actual (vegetativo) y tipo (riego)", ui: "Dos selectores. Al elegir fase+tipo, aparecen templates compatibles", color: "#2563eb" },
      { action: "Ve 3 templates sugeridas para riego en vegetativo", ui: "Cards: 'Riego estándar veg S1', 'Riego flush', 'Riego manual'. O 'Sin template (libre)'", color: "#7c3aed" },
      { action: "Elige 'Riego estándar veg S1'", ui: "Formulario se pre-llena: recursos (Agua 200L, Sol. A, Sol. B), metadata (EC: 1.2, pH: 5.8), checklist (3 pasos)", color: "#f59e0b" },
      { action: "Ajusta valores reales: EC real = 1.3, pH real = 5.9, volumen = 180L", ui: "Solo modifica lo que difiere del template. Los demás campos ya están.", color: "#dc2626" },
      { action: "Toma foto, completa checklist, submit", ui: "Actividad creada con template_id vinculado para trazabilidad", color: "#475569" },
    ],
  },
  scenario_b: {
    title: "Escenario B: Ejecutar actividad programada del día",
    steps: [
      { action: "Operador abre app → ve '5 actividades pendientes hoy'", ui: "Lista con prioridad, color por categoría, hora sugerida", color: "#16a34a" },
      { action: "Toca 'Fertirrigación Floración S4' (programada 8:00 AM)", ui: "Detalle: template pre-cargada, recursos calculados para 42 plantas, checklist de 5 pasos", color: "#2563eb" },
      { action: "Toca 'Iniciar actividad'", ui: "started_at = NOW(). Status → in_progress. Timer visible.", color: "#7c3aed" },
      { action: "Prepara mezcla, aplica, registra valores reales", ui: "Inputs pre-llenados desde template. Solo cambia lo que difiere. Checkboxes para checklist.", color: "#f59e0b" },
      { action: "Completa checklist + fotos + submit", ui: "scheduled_activity.status → completed, activity_id vinculada. inventory_transactions generadas.", color: "#dc2626" },
      { action: "Dashboard se actualiza: 4/5 pendientes, progreso del batch 68%", ui: "Barra de progreso del cultivation_schedule. Alertas si hay overdue.", color: "#475569" },
    ],
  },
};

function Pill({ children, color }) {
  return <span style={{ background: `${color}15`, color, padding: "2px 7px", borderRadius: 10, fontSize: 10, fontWeight: 600, whiteSpace: "nowrap" }}>{children}</span>;
}

function FieldRow({ f }) {
  if (f.s) return <div style={{ padding: "4px 12px", background: "#f8fafc", fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{f.n.replace(/—/g, "").trim() || f.t}</div>;
  return (
    <div style={{ display: "flex", gap: 4, padding: "3px 12px", fontSize: 11, fontFamily: "monospace", borderBottom: "1px solid #f8fafc", background: "#fff", flexWrap: "wrap", alignItems: "baseline" }}>
      <span style={{ fontWeight: 600, color: "#1e293b", minWidth: 170 }}>{f.n}</span>
      <span style={{ color: "#6366f1", flex: 1, minWidth: 150 }}>{f.t}</span>
      {f.note && <span style={{ color: "#94a3b8", fontSize: 10, fontStyle: "italic", width: "100%", paddingLeft: 170 }}>{f.note}</span>}
    </div>
  );
}

export default function TemplateModel() {
  const [tab, setTab] = useState("concept");
  const [expandedCats, setExpandedCats] = useState(new Set(["Fertirrigación"]));

  const toggleCat = (c) => setExpandedCats(p => { const n = new Set(p); n.has(c) ? n.delete(c) : n.add(c); return n; });

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", maxWidth: 780, margin: "0 auto", padding: 16, background: "#fff", minHeight: "100vh" }}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <h1 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "#1e293b" }}>📋 Templates de Actividades + Programación</h1>
        <p style={{ fontSize: 11, color: "#64748b", margin: "4px 0" }}>Plantillas reutilizables → programación automática → ejecución pre-llenada</p>
      </div>

      <div style={{ display: "flex", gap: 0, marginBottom: 16, borderBottom: "2px solid #e2e8f0", overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "8px 11px", border: "none", borderBottom: tab === t.id ? "2px solid #2563eb" : "2px solid transparent", background: "none", cursor: "pointer", fontSize: 12, fontWeight: tab === t.id ? 700 : 400, color: tab === t.id ? "#1e293b" : "#999", marginBottom: -2, whiteSpace: "nowrap" }}>{t.label}</button>
        ))}
      </div>

      {/* CONCEPT TAB */}
      {tab === "concept" && (
        <div>
          <div style={{ background: "#1e293b", borderRadius: 10, padding: 16, color: "#e2e8f0", marginBottom: 16, fontSize: 11, lineHeight: 2.2, fontFamily: "monospace", textAlign: "center" }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, opacity: 0.5, marginBottom: 8 }}>Flujo de 3 capas</div>
            <span style={{ color: "#a78bfa", fontWeight: 700 }}>activity_templates</span>
            <span style={{ opacity: 0.5 }}> — define QUÉ hacer (la receta)</span><br />
            {"  "}↓ genera N instancias<br />
            <span style={{ color: "#60a5fa", fontWeight: 700 }}>scheduled_activities</span>
            <span style={{ opacity: 0.5 }}> — define CUÁNDO hacerlo (el plan)</span><br />
            {"  "}↓ al ejecutar produce<br />
            <span style={{ color: "#34d399", fontWeight: 700 }}>activities</span>
            <span style={{ opacity: 0.5 }}> — registra QUÉ SE HIZO realmente (el reporte)</span><br />
            {"  "}↓ que genera<br />
            <span style={{ color: "#f87171", fontWeight: 700 }}>inventory_transactions</span>
            <span style={{ opacity: 0.5 }}> — mueve el inventario</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[
              { title: "Template", icon: "📝", color: "#7c3aed", desc: "La receta de la actividad. Define tipo, recursos, cantidades, duración, checklist, fases aplicables, frecuencia. Se crea una vez, se usa infinitas veces.", examples: "Fertirrigación Veg S2, Poda apical día 21, Limpieza semanal" },
              { title: "Scheduled Activity", icon: "📅", color: "#2563eb", desc: "Instancia futura de una template, vinculada a un batch + zona + fecha. Puede generarse automáticamente al crear un plan de cultivo o manualmente.", examples: "Fertirrigación Veg S2 → 2026-03-15, Zona A, Batch #42" },
              { title: "Activity (reporte)", icon: "✅", color: "#16a34a", desc: "Lo que realmente se hizo. Se crea al ejecutar una scheduled o reportar directamente. Contiene datos reales, fotos, mediciones, vs lo planeado.", examples: "Se fertirrigó con EC real 1.35 (target 1.2), pH 5.9, 180L" },
              { title: "Uso sin template", icon: "⚡", color: "#f59e0b", desc: "El template es OPCIONAL. El operador siempre puede reportar una actividad libre sin seleccionar template. El template solo pre-llena, no restringe.", examples: "Nota rápida, incidente inesperado, observación espontánea" },
            ].map((c, i) => (
              <div key={i} style={{ border: `1px solid ${c.color}30`, borderLeft: `4px solid ${c.color}`, borderRadius: 8, padding: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 16 }}>{c.icon}</span>
                  <span style={{ fontWeight: 800, fontSize: 13, color: c.color }}>{c.title}</span>
                </div>
                <div style={{ fontSize: 11, color: "#475569", lineHeight: 1.5, marginBottom: 4 }}>{c.desc}</div>
                <div style={{ fontSize: 10, color: "#94a3b8", fontStyle: "italic" }}>Ej: {c.examples}</div>
              </div>
            ))}
          </div>

          {/* Key design decisions */}
          <div style={{ background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: 8, padding: 14, fontSize: 11, lineHeight: 1.8 }}>
            <div style={{ fontWeight: 800, fontSize: 13, color: "#5b21b6", marginBottom: 6 }}>Decisiones de diseño clave</div>
            <div style={{ color: "#1e1b4b" }}>
              <strong>1. quantity_basis escala automáticamente.</strong> Si un template dice "5 g/planta de micorriza" y el batch tiene 42 plantas, el sistema calcula 210g. Si dice "2 mL/L de solución" y se preparan 100L, calcula 200 mL. El operador solo confirma o ajusta.<br /><br />
              <strong>2. Templates versionadas.</strong> Si se edita un template que ya tiene scheduled_activities, las existentes mantienen la versión original. Las nuevas usan la versión actualizada. Esto evita que un cambio de dosis altere retroactivamente el plan.<br /><br />
              <strong>3. Dependencias entre templates.</strong> "Secado" depende de "Cosecha" con min_days = 0. "Curado" depende de "Secado" con min_days = 7. Esto genera el Gantt automáticamente y previene que se programe secado antes de cosecha.<br /><br />
              <strong>4. Template ≠ Receta.</strong> Una template puede referenciar una recipe_id (BOM de fertirrigación), pero la template agrega: duración estimada, checklist, condiciones ambientales, frecuencia, benchmarks de labor. La recipe maneja solo los ingredientes y cantidades.
            </div>
          </div>
        </div>
      )}

      {/* SCHEMA TAB */}
      {tab === "schema" && (
        <div>
          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 11, lineHeight: 1.7 }}>
            <strong>5 tablas nuevas</strong> que se integran con el modelo existente de activities + activity_resources. Las templates definen la plantilla, las scheduled concretan cuándo, y al ejecutar se crea la actividad real con sus transacciones.
          </div>
          {SCHEMA_TABLES.map(table => (
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

      {/* TEMPLATES EXAMPLE TAB */}
      {tab === "templates" && (
        <div>
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 11, lineHeight: 1.7 }}>
            <strong>Templates ejemplo</strong> para un cultivo de cannabis indoor. Cada template muestra: fases aplicables, rango de días, frecuencia, recursos con cantidades escalables, y checklist de verificación.
          </div>

          {TEMPLATE_EXAMPLES.map((cat, ci) => (
            <div key={ci} style={{ marginBottom: 8 }}>
              <button onClick={() => toggleCat(cat.cat)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", border: `1px solid ${cat.color}30`, borderLeft: `4px solid ${cat.color}`, borderRadius: 8, background: "#fff", cursor: "pointer", textAlign: "left" }}>
                <span style={{ fontSize: 16 }}>{cat.icon}</span>
                <span style={{ fontWeight: 700, fontSize: 13, color: cat.color, flex: 1 }}>{cat.cat}</span>
                <Pill color={cat.color}>{cat.templates.length} templates</Pill>
                <span style={{ color: "#94a3b8", fontSize: 12, transform: expandedCats.has(cat.cat) ? "rotate(180deg)" : "none", transition: "0.2s" }}>▼</span>
              </button>
              {expandedCats.has(cat.cat) && (
                <div style={{ paddingTop: 6 }}>
                  {cat.templates.map((tpl, ti) => (
                    <div key={ti} style={{ border: "1px solid #e2e8f0", borderRadius: 8, marginBottom: 8, overflow: "hidden" }}>
                      <div style={{ background: `${cat.color}08`, padding: "8px 12px", borderBottom: "1px solid #e2e8f0" }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>{tpl.name}</div>
                        <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                          <Pill color="#6366f1">{tpl.code}</Pill>
                          {tpl.phases.map(p => <Pill key={p} color="#16a34a">{p}</Pill>)}
                          {tpl.dayRange && <Pill color="#f59e0b">días {tpl.dayRange}</Pill>}
                          <Pill color="#0891b2">freq: {tpl.freq}</Pill>
                          <Pill color="#475569">~{tpl.duration}</Pill>
                        </div>
                      </div>
                      {/* Resources */}
                      <div style={{ padding: "6px 12px", borderBottom: "1px solid #f1f5f9" }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 4 }}>Recursos</div>
                        {tpl.resources.map((r, ri) => (
                          <div key={ri} style={{ display: "flex", alignItems: "baseline", gap: 6, fontSize: 11, padding: "2px 0" }}>
                            <span style={{ color: r.required ? "#1e293b" : "#94a3b8", fontWeight: 500, flex: 1 }}>
                              {!r.required && "⟡ "}{r.product}
                            </span>
                            <span style={{ fontFamily: "monospace", color: "#dc2626", fontWeight: 600 }}>{r.qty} {r.unit}</span>
                            <Pill color="#7c3aed">{r.basis}</Pill>
                          </div>
                        ))}
                      </div>
                      {/* Metadata */}
                      <div style={{ padding: "6px 12px", borderBottom: "1px solid #f1f5f9", fontSize: 10, color: "#64748b" }}>
                        <strong>Metadata:</strong> {tpl.metadata}
                      </div>
                      {/* Checklist */}
                      <div style={{ padding: "6px 12px" }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 4 }}>Checklist ({tpl.checklist.length} pasos)</div>
                        {tpl.checklist.map((c, ci2) => (
                          <div key={ci2} style={{ fontSize: 11, color: "#475569", padding: "1px 0" }}>☐ {c}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* SCHEDULING TAB */}
      {tab === "scheduling" && (
        <div>
          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 11, lineHeight: 1.7 }}>
            <strong>Generación automática de plan de cultivo.</strong> Al crear un batch, el sistema genera un <code>cultivation_schedule</code> con todas las <code>scheduled_activities</code> calculadas a partir de las templates aplicables, las fases del cultivo, y sus duraciones planeadas.
          </div>

          {SCHEDULE_GENERATION.map((step, i) => (
            <div key={i} style={{ display: "flex", gap: 12, marginBottom: 14, alignItems: "flex-start" }}>
              <div style={{ minWidth: 36, height: 36, borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, border: "2px solid #bfdbfe", flexShrink: 0 }}>{step.icon}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 12, color: "#1e293b" }}>{step.step}</div>
                <div style={{ fontSize: 11, color: "#475569", marginTop: 2, lineHeight: 1.5 }}>{step.detail}</div>
              </div>
            </div>
          ))}

          {/* Example timeline */}
          <div style={{ background: "#1e293b", borderRadius: 10, padding: 16, color: "#fff", marginTop: 8 }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, opacity: 0.5, marginBottom: 10 }}>Ejemplo: Plan generado para Gelato Indoor (127 días)</div>
            {[
              { phase: "Propagación", days: "14 días", color: "#854d0e", count: 18, detail: "Siembra ×1, Riego ×14, Monitoreo ×2, Limpieza ×1" },
              { phase: "Vegetativo", days: "28 días", color: "#16a34a", count: 52, detail: "Fertirrigación ×28, Trasplante ×1, Topping ×1, Biocontrol ×2, Monitoreo ×4, Defoliación ×1, Limpieza ×4, Ajuste tutorado ×3, Muestreo sustrato ×2" },
              { phase: "Floración", days: "63 días", color: "#7c3aed", count: 86, detail: "Fertirrigación ×63, Defoliación ×3, Biocontrol ×4, Monitoreo tricomas ×6, Monitoreo plagas ×9, Flush final ×3, Limpieza ×9" },
              { phase: "Cosecha", days: "1 día", color: "#dc2626", count: 4, detail: "Inspección pre-cosecha ×1, Corte ×1, Pesaje húmedo ×1, Registro fotográfico ×1" },
              { phase: "Post-cosecha", days: "21 días", color: "#f59e0b", count: 18, detail: "Colgado/secado ×1, Monitoreo secado ×14, Trimming ×1, Pesaje seco ×1, Empaque ×1" },
            ].map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
                <div style={{ minWidth: 90, fontWeight: 600, color: p.color }}>{p.phase}</div>
                <div style={{ minWidth: 60, fontSize: 10, opacity: 0.6 }}>{p.days}</div>
                <Pill color={p.color}>{p.count} actividades</Pill>
                <div style={{ fontSize: 10, opacity: 0.4, flex: 1 }}>{p.detail}</div>
              </div>
            ))}
            <div style={{ marginTop: 10, padding: "8px 0", borderTop: "1px solid rgba(255,255,255,0.15)", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700, color: "#fbbf24" }}>Total: ~178 actividades programadas</span>
              <span style={{ opacity: 0.6, fontSize: 10 }}>Generadas en &lt;1 segundo desde 15 templates</span>
            </div>
          </div>
        </div>
      )}

      {/* UX FLOW TAB */}
      {tab === "ux" && (
        <div>
          {Object.values(UX_FLOW).map((scenario, si) => (
            <div key={si} style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: "#1e293b", marginBottom: 10, borderBottom: "2px solid #e2e8f0", paddingBottom: 6 }}>{scenario.title}</div>
              {scenario.steps.map((step, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                  <div style={{ minWidth: 24, height: 24, borderRadius: "50%", background: `${step.color}15`, color: step.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0, marginTop: 2 }}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#1e293b" }}>{step.action}</div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 2, padding: "4px 8px", background: "#f8fafc", borderRadius: 6, borderLeft: `3px solid ${step.color}` }}>{step.ui}</div>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* Key interaction */}
          <div style={{ background: "#faf5ff", border: "2px solid #e9d5ff", borderRadius: 10, padding: 14, fontSize: 11, lineHeight: 1.8 }}>
            <div style={{ fontWeight: 800, fontSize: 13, color: "#5b21b6", marginBottom: 6 }}>🎯 Principio UX: template sugiere, no restringe</div>
            <div style={{ color: "#1e1b4b" }}>
              <strong>El template pre-llena el formulario, pero el operador SIEMPRE puede:</strong><br />
              • Cambiar cualquier valor (dosis real ≠ dosis planeada)<br />
              • Agregar o quitar recursos (usó producto alternativo)<br />
              • Saltar pasos del checklist (marcando razón)<br />
              • Agregar observaciones, fotos, lecturas extra<br />
              • Reportar sin template (formulario en blanco)<br /><br />
              <strong>Lo que queda registrado:</strong><br />
              • <code>activities.template_id</code> → cuál template se usó (nullable)<br />
              • <code>scheduled_activities.activity_id</code> → si vino de una programación<br />
              • En reportes: comparación planeado (template) vs real (activity) para mejora continua
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
