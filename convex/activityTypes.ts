/**
 * Activity Types — Configurable catalog of activity types per company
 *
 * Each company has its own set of activity types. System types (is_system: true)
 * are seeded from DEFAULT_ACTIVITY_TYPES and cannot be archived.
 * Custom types (is_system: false) can be created, edited, and archived.
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Inline seed data to avoid importing from lib/ (Convex server-side restriction)
const DEFAULT_SEED_TYPES = [
  // Cultivation (6)
  { code: "seeding", name: "Siembra", category: "cultivation", icon: "Sprout", color: "green", requires_zone: true, requires_batch: true, requires_resources: true, requires_photos: false, requires_verification: false, triggers_transformation: true, triggers_phase_change: false },
  { code: "transplant", name: "Trasplante", category: "cultivation", icon: "ArrowRightLeft", color: "green", requires_zone: true, requires_batch: true, requires_resources: true, requires_photos: false, requires_verification: false, triggers_transformation: true, triggers_phase_change: true },
  { code: "irrigation", name: "Riego", category: "cultivation", icon: "Droplets", color: "blue", requires_zone: true, requires_batch: true, requires_resources: true, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false },
  { code: "fertigation", name: "Fertirrigacion", category: "cultivation", icon: "Droplets", color: "teal", requires_zone: true, requires_batch: true, requires_resources: true, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false },
  { code: "pruning", name: "Poda", category: "cultivation", icon: "Scissors", color: "green", requires_zone: true, requires_batch: true, requires_resources: false, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false },
  { code: "training", name: "Tutorado / Entrenamiento", category: "cultivation", icon: "GitBranch", color: "green", requires_zone: true, requires_batch: true, requires_resources: false, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false },
  // Monitoring (4)
  { code: "scouting", name: "Monitoreo de plagas/enfermedades", category: "monitoring", icon: "Search", color: "amber", requires_zone: true, requires_batch: false, requires_resources: false, requires_photos: true, requires_verification: false, triggers_transformation: false, triggers_phase_change: false },
  { code: "growth_check", name: "Medicion de crecimiento", category: "monitoring", icon: "Ruler", color: "amber", requires_zone: true, requires_batch: true, requires_resources: false, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false },
  { code: "root_check", name: "Inspeccion radicular", category: "monitoring", icon: "Eye", color: "amber", requires_zone: true, requires_batch: true, requires_resources: false, requires_photos: true, requires_verification: false, triggers_transformation: false, triggers_phase_change: false },
  { code: "environmental_check", name: "Lectura ambiental manual", category: "monitoring", icon: "Thermometer", color: "amber", requires_zone: true, requires_batch: false, requires_resources: false, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false },
  // Transformation (3)
  { code: "phase_transition", name: "Cambio de fase", category: "transformation", icon: "RefreshCw", color: "violet", requires_zone: true, requires_batch: true, requires_resources: false, requires_photos: false, requires_verification: false, triggers_transformation: true, triggers_phase_change: true },
  { code: "drying", name: "Secado", category: "transformation", icon: "Wind", color: "violet", requires_zone: true, requires_batch: true, requires_resources: false, requires_photos: false, requires_verification: false, triggers_transformation: true, triggers_phase_change: true },
  { code: "curing", name: "Curado", category: "transformation", icon: "Timer", color: "violet", requires_zone: true, requires_batch: true, requires_resources: false, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false },
  // Application (3)
  { code: "foliar_spray", name: "Aspersion foliar", category: "application", icon: "Spray", color: "red", requires_zone: true, requires_batch: true, requires_resources: true, requires_photos: true, requires_verification: false, triggers_transformation: false, triggers_phase_change: false },
  { code: "soil_drench", name: "Aplicacion al suelo (drench)", category: "application", icon: "FlaskConical", color: "red", requires_zone: true, requires_batch: true, requires_resources: true, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false },
  { code: "biocontrol_release", name: "Liberacion de biocontrol", category: "application", icon: "Bug", color: "red", requires_zone: true, requires_batch: true, requires_resources: true, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false },
  // Movement (3)
  { code: "relocation", name: "Reubicacion de plantas", category: "movement", icon: "Move", color: "cyan", requires_zone: true, requires_batch: true, requires_resources: false, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false },
  { code: "inventory_transfer", name: "Transferencia de inventario", category: "movement", icon: "ArrowLeftRight", color: "cyan", requires_zone: false, requires_batch: false, requires_resources: true, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false },
  { code: "dispatch", name: "Despacho / Envio", category: "movement", icon: "Truck", color: "cyan", requires_zone: false, requires_batch: true, requires_resources: true, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false },
  // Maintenance (3)
  { code: "equipment_maintenance", name: "Mantenimiento de equipo", category: "maintenance", icon: "Wrench", color: "slate", requires_zone: false, requires_batch: false, requires_resources: false, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false },
  { code: "calibration", name: "Calibracion", category: "maintenance", icon: "Gauge", color: "slate", requires_zone: false, requires_batch: false, requires_resources: false, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false },
  { code: "facility_repair", name: "Reparacion de instalacion", category: "maintenance", icon: "HardHat", color: "slate", requires_zone: true, requires_batch: false, requires_resources: false, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false },
  // Quality (3)
  { code: "cleaning", name: "Limpieza", category: "quality", icon: "Sparkles", color: "rose", requires_zone: true, requires_batch: false, requires_resources: false, requires_photos: true, requires_verification: false, triggers_transformation: false, triggers_phase_change: false },
  { code: "sanitization", name: "Sanitizacion", category: "quality", icon: "ShieldCheck", color: "rose", requires_zone: true, requires_batch: false, requires_resources: true, requires_photos: true, requires_verification: false, triggers_transformation: false, triggers_phase_change: false },
  { code: "lab_sampling", name: "Toma de muestra para laboratorio", category: "quality", icon: "TestTube", color: "rose", requires_zone: false, requires_batch: true, requires_resources: false, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false },
  // Harvest (2)
  { code: "harvest_cut", name: "Cosecha (corte)", category: "harvest", icon: "Scissors", color: "pink", requires_zone: true, requires_batch: true, requires_resources: true, requires_photos: true, requires_verification: false, triggers_transformation: true, triggers_phase_change: true },
  { code: "weighing", name: "Pesaje", category: "harvest", icon: "Scale", color: "pink", requires_zone: false, requires_batch: true, requires_resources: false, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false },
  // Post Harvest (3)
  { code: "trimming", name: "Manicurado / Trimming", category: "post_harvest", icon: "Scissors", color: "orange", requires_zone: true, requires_batch: true, requires_resources: true, requires_photos: false, requires_verification: false, triggers_transformation: true, triggers_phase_change: false },
  { code: "extraction", name: "Extraccion", category: "post_harvest", icon: "FlaskConical", color: "orange", requires_zone: false, requires_batch: true, requires_resources: true, requires_photos: false, requires_verification: false, triggers_transformation: true, triggers_phase_change: false },
  { code: "packaging", name: "Empaque", category: "post_harvest", icon: "Package", color: "orange", requires_zone: false, requires_batch: true, requires_resources: true, requires_photos: false, requires_verification: false, triggers_transformation: true, triggers_phase_change: true },
  // Administrative (3)
  { code: "note", name: "Nota general", category: "administrative", icon: "StickyNote", color: "gray", requires_zone: false, requires_batch: false, requires_resources: false, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false },
  { code: "incident_report", name: "Reporte de incidente", category: "administrative", icon: "AlertTriangle", color: "gray", requires_zone: true, requires_batch: false, requires_resources: false, requires_photos: true, requires_verification: false, triggers_transformation: false, triggers_phase_change: false },
  { code: "regulatory_report", name: "Reporte regulatorio", category: "administrative", icon: "FileText", color: "gray", requires_zone: false, requires_batch: false, requires_resources: false, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false },
];

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Seed default activity types for a company.
 * Creates ~33 system types with is_system: true.
 * Idempotent: skips types whose code already exists for the company.
 */
export const seedDefaults = mutation({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, { companyId }) => {
    const now = Date.now();
    let created = 0;

    for (let i = 0; i < DEFAULT_SEED_TYPES.length; i++) {
      const t = DEFAULT_SEED_TYPES[i];

      // Check if type already exists for this company
      const existing = await ctx.db
        .query("activity_types")
        .withIndex("by_company_code", (q) =>
          q.eq("company_id", companyId).eq("code", t.code)
        )
        .first();

      if (existing) continue;

      await ctx.db.insert("activity_types", {
        company_id: companyId,
        category: t.category,
        code: t.code,
        name: t.name,
        icon: t.icon,
        color: t.color,
        requires_zone: t.requires_zone,
        requires_batch: t.requires_batch,
        requires_resources: t.requires_resources,
        requires_photos: t.requires_photos,
        requires_verification: t.requires_verification,
        triggers_transformation: t.triggers_transformation,
        triggers_phase_change: t.triggers_phase_change,
        is_system: true,
        status: "active",
        sort_order: i * 10,
        created_at: now,
        updated_at: now,
      });
      created++;
    }

    return { created, total: DEFAULT_SEED_TYPES.length };
  },
});
