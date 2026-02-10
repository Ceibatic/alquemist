/**
 * Activity Type Constants
 * Categories and default types for the configurable activity catalog
 */

// ============================================================================
// ACTIVITY CATEGORIES
// ============================================================================

export interface ActivityCategory {
  value: string;
  label: string;
  icon: string;
  color: string;
  description: string;
}

export const ACTIVITY_CATEGORIES: ActivityCategory[] = [
  { value: "cultivation", label: "Cultivo", icon: "Sprout", color: "green", description: "Siembra, riego, poda, tutorado" },
  { value: "monitoring", label: "Monitoreo", icon: "Search", color: "amber", description: "Plagas, crecimiento, ambiente" },
  { value: "transformation", label: "Transformacion", icon: "RefreshCw", color: "violet", description: "Cambios de fase, secado, curado" },
  { value: "application", label: "Aplicacion", icon: "Shield", color: "red", description: "Foliar, drench, biocontrol" },
  { value: "movement", label: "Movimientos", icon: "Package", color: "cyan", description: "Reubicacion, transferencia, despacho" },
  { value: "maintenance", label: "Mantenimiento", icon: "Wrench", color: "slate", description: "Equipos, calibracion, reparacion" },
  { value: "quality", label: "Calidad", icon: "CheckCircle", color: "rose", description: "Limpieza, sanitizacion, auditorias" },
  { value: "harvest", label: "Cosecha", icon: "Wheat", color: "pink", description: "Corte, pesaje, inspeccion" },
  { value: "post_harvest", label: "Poscosecha", icon: "Scissors", color: "orange", description: "Secado, trimming, empaque" },
  { value: "administrative", label: "Administrativo", icon: "FileText", color: "gray", description: "Notas, incidentes, reportes" },
];

export const ACTIVITY_CATEGORY_VALUES = ACTIVITY_CATEGORIES.map((c) => c.value);

// ============================================================================
// DEFAULT ACTIVITY TYPES (seed data)
// ============================================================================

export interface DefaultActivityType {
  code: string;
  name: string;
  category: string;
  icon: string;
  color: string;
  requires_zone: boolean;
  requires_batch: boolean;
  requires_resources: boolean;
  requires_photos: boolean;
  requires_verification: boolean;
  triggers_transformation: boolean;
  triggers_phase_change: boolean;
  description?: string;
}

/**
 * ~33 default activity types organized by category.
 * These are seeded per company with is_system: true.
 */
export const DEFAULT_ACTIVITY_TYPES: DefaultActivityType[] = [
  // ── Cultivation (6) ────────────────────────────────────────────────────────
  { code: "seeding", name: "Siembra", category: "cultivation", icon: "Sprout", color: "green", requires_zone: true, requires_batch: true, requires_resources: true, requires_photos: false, requires_verification: false, triggers_transformation: true, triggers_phase_change: false, description: "Siembra de semillas o esquejes" },
  { code: "transplant", name: "Trasplante", category: "cultivation", icon: "ArrowRightLeft", color: "green", requires_zone: true, requires_batch: true, requires_resources: true, requires_photos: false, requires_verification: false, triggers_transformation: true, triggers_phase_change: true, description: "Trasplante a contenedor definitivo" },
  { code: "irrigation", name: "Riego", category: "cultivation", icon: "Droplets", color: "blue", requires_zone: true, requires_batch: true, requires_resources: true, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false, description: "Riego manual o automatizado" },
  { code: "fertigation", name: "Fertirrigacion", category: "cultivation", icon: "Droplets", color: "teal", requires_zone: true, requires_batch: true, requires_resources: true, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false, description: "Riego con solucion nutritiva" },
  { code: "pruning", name: "Poda", category: "cultivation", icon: "Scissors", color: "green", requires_zone: true, requires_batch: true, requires_resources: false, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false, description: "Poda apical, lateral o defoliacion" },
  { code: "training", name: "Tutorado / Entrenamiento", category: "cultivation", icon: "GitBranch", color: "green", requires_zone: true, requires_batch: true, requires_resources: false, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false, description: "LST, SCROG, SOG, enrejado" },

  // ── Monitoring (4) ─────────────────────────────────────────────────────────
  { code: "scouting", name: "Monitoreo de plagas/enfermedades", category: "monitoring", icon: "Search", color: "amber", requires_zone: true, requires_batch: false, requires_resources: false, requires_photos: true, requires_verification: false, triggers_transformation: false, triggers_phase_change: false, description: "Inspeccion visual de plagas y enfermedades" },
  { code: "growth_check", name: "Medicion de crecimiento", category: "monitoring", icon: "Ruler", color: "amber", requires_zone: true, requires_batch: true, requires_resources: false, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false, description: "Altura, ancho, distancia internodal" },
  { code: "root_check", name: "Inspeccion radicular", category: "monitoring", icon: "Eye", color: "amber", requires_zone: true, requires_batch: true, requires_resources: false, requires_photos: true, requires_verification: false, triggers_transformation: false, triggers_phase_change: false, description: "Color, densidad y salud radicular" },
  { code: "environmental_check", name: "Lectura ambiental manual", category: "monitoring", icon: "Thermometer", color: "amber", requires_zone: true, requires_batch: false, requires_resources: false, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false, description: "Temperatura, humedad, VPD, CO2" },

  // ── Transformation (3) ─────────────────────────────────────────────────────
  { code: "phase_transition", name: "Cambio de fase", category: "transformation", icon: "RefreshCw", color: "violet", requires_zone: true, requires_batch: true, requires_resources: false, requires_photos: false, requires_verification: false, triggers_transformation: true, triggers_phase_change: true, description: "Transicion entre fases del cultivo" },
  { code: "drying", name: "Secado", category: "transformation", icon: "Wind", color: "violet", requires_zone: true, requires_batch: true, requires_resources: false, requires_photos: false, requires_verification: false, triggers_transformation: true, triggers_phase_change: true, description: "Secado de material cosechado" },
  { code: "curing", name: "Curado", category: "transformation", icon: "Timer", color: "violet", requires_zone: true, requires_batch: true, requires_resources: false, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false, description: "Curado en contenedores controlados" },

  // ── Application (3) ────────────────────────────────────────────────────────
  { code: "foliar_spray", name: "Aspersion foliar", category: "application", icon: "Spray", color: "red", requires_zone: true, requires_batch: true, requires_resources: true, requires_photos: true, requires_verification: false, triggers_transformation: false, triggers_phase_change: false, description: "Aplicacion foliar de productos" },
  { code: "soil_drench", name: "Aplicacion al suelo (drench)", category: "application", icon: "FlaskConical", color: "red", requires_zone: true, requires_batch: true, requires_resources: true, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false, description: "Aplicacion de productos via sustrato" },
  { code: "biocontrol_release", name: "Liberacion de biocontrol", category: "application", icon: "Bug", color: "red", requires_zone: true, requires_batch: true, requires_resources: true, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false, description: "Liberacion de agentes de biocontrol" },

  // ── Movement (3) ───────────────────────────────────────────────────────────
  { code: "relocation", name: "Reubicacion de plantas", category: "movement", icon: "Move", color: "cyan", requires_zone: true, requires_batch: true, requires_resources: false, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false, description: "Mover plantas entre zonas" },
  { code: "inventory_transfer", name: "Transferencia de inventario", category: "movement", icon: "ArrowLeftRight", color: "cyan", requires_zone: false, requires_batch: false, requires_resources: true, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false, description: "Mover inventario entre areas" },
  { code: "dispatch", name: "Despacho / Envio", category: "movement", icon: "Truck", color: "cyan", requires_zone: false, requires_batch: true, requires_resources: true, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false, description: "Envio de producto a destino" },

  // ── Maintenance (3) ────────────────────────────────────────────────────────
  { code: "equipment_maintenance", name: "Mantenimiento de equipo", category: "maintenance", icon: "Wrench", color: "slate", requires_zone: false, requires_batch: false, requires_resources: false, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false, description: "Mantenimiento preventivo o correctivo" },
  { code: "calibration", name: "Calibracion", category: "maintenance", icon: "Gauge", color: "slate", requires_zone: false, requires_batch: false, requires_resources: false, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false, description: "Calibracion de sensores y equipos" },
  { code: "facility_repair", name: "Reparacion de instalacion", category: "maintenance", icon: "HardHat", color: "slate", requires_zone: true, requires_batch: false, requires_resources: false, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false, description: "Reparacion de infraestructura" },

  // ── Quality (3) ────────────────────────────────────────────────────────────
  { code: "cleaning", name: "Limpieza", category: "quality", icon: "Sparkles", color: "rose", requires_zone: true, requires_batch: false, requires_resources: false, requires_photos: true, requires_verification: false, triggers_transformation: false, triggers_phase_change: false, description: "Limpieza de areas y superficies" },
  { code: "sanitization", name: "Sanitizacion", category: "quality", icon: "ShieldCheck", color: "rose", requires_zone: true, requires_batch: false, requires_resources: true, requires_photos: true, requires_verification: false, triggers_transformation: false, triggers_phase_change: false, description: "Sanitizacion con productos especificos" },
  { code: "lab_sampling", name: "Toma de muestra para laboratorio", category: "quality", icon: "TestTube", color: "rose", requires_zone: false, requires_batch: true, requires_resources: false, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false, description: "Muestreo para analisis de laboratorio" },

  // ── Harvest (2) ────────────────────────────────────────────────────────────
  { code: "harvest_cut", name: "Cosecha (corte)", category: "harvest", icon: "Scissors", color: "pink", requires_zone: true, requires_batch: true, requires_resources: true, requires_photos: true, requires_verification: false, triggers_transformation: true, triggers_phase_change: true, description: "Corte de plantas para cosecha" },
  { code: "weighing", name: "Pesaje", category: "harvest", icon: "Scale", color: "pink", requires_zone: false, requires_batch: true, requires_resources: false, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false, description: "Pesaje de material cosechado" },

  // ── Post Harvest (3) ───────────────────────────────────────────────────────
  { code: "trimming", name: "Manicurado / Trimming", category: "post_harvest", icon: "Scissors", color: "orange", requires_zone: true, requires_batch: true, requires_resources: true, requires_photos: false, requires_verification: false, triggers_transformation: true, triggers_phase_change: false, description: "Manicurado manual o mecanico" },
  { code: "extraction", name: "Extraccion", category: "post_harvest", icon: "FlaskConical", color: "orange", requires_zone: false, requires_batch: true, requires_resources: true, requires_photos: false, requires_verification: false, triggers_transformation: true, triggers_phase_change: false, description: "Extraccion con solvente o mecanica" },
  { code: "packaging", name: "Empaque", category: "post_harvest", icon: "Package", color: "orange", requires_zone: false, requires_batch: true, requires_resources: true, requires_photos: false, requires_verification: false, triggers_transformation: true, triggers_phase_change: true, description: "Empaque y etiquetado de producto" },

  // ── Administrative (3) ─────────────────────────────────────────────────────
  { code: "note", name: "Nota general", category: "administrative", icon: "StickyNote", color: "gray", requires_zone: false, requires_batch: false, requires_resources: false, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false, description: "Nota general de texto libre" },
  { code: "incident_report", name: "Reporte de incidente", category: "administrative", icon: "AlertTriangle", color: "gray", requires_zone: true, requires_batch: false, requires_resources: false, requires_photos: true, requires_verification: false, triggers_transformation: false, triggers_phase_change: false, description: "Reporte de incidente o situacion" },
  { code: "regulatory_report", name: "Reporte regulatorio", category: "administrative", icon: "FileText", color: "gray", requires_zone: false, requires_batch: false, requires_resources: false, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false, description: "Reporte para entidad regulatoria" },
];
