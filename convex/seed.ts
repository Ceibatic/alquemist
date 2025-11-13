/**
 * Database Seeding Script
 * Seeds initial data required for the application
 */

import { mutation } from "./_generated/server";

/**
 * Seed system roles
 * Creates the default role hierarchy
 */
export const seedRoles = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Check if roles already exist
    const existingRoles = await ctx.db.query("roles").collect();
    if (existingRoles.length > 0) {
      return {
        success: true,
        message: "Roles already seeded",
        count: existingRoles.length,
      };
    }

    const roles = [
      {
        name: "COMPANY_OWNER",
        display_name_es: "Propietario de Empresa",
        display_name_en: "Company Owner",
        description: "Full access to all company resources",
        level: 1000,
        scope_level: "company",
        permissions: {
          company: { read: true, write: true, delete: true },
          facilities: { read: true, write: true, delete: true },
          users: { read: true, write: true, delete: true },
          all: true,
        },
        inherits_from_role_ids: [],
        is_system_role: true,
        is_active: true,
        created_at: now,
      },
      {
        name: "FACILITY_MANAGER",
        display_name_es: "Gerente de Instalación",
        display_name_en: "Facility Manager",
        description: "Manage facility operations and staff",
        level: 500,
        scope_level: "facility",
        permissions: {
          facility: { read: true, write: true, delete: false },
          areas: { read: true, write: true, delete: true },
          batches: { read: true, write: true, delete: false },
          users: { read: true, write: false, delete: false },
        },
        inherits_from_role_ids: [],
        is_system_role: true,
        is_active: true,
        created_at: now,
      },
      {
        name: "CULTIVATION_SUPERVISOR",
        display_name_es: "Supervisor de Cultivo",
        display_name_en: "Cultivation Supervisor",
        description: "Supervise cultivation activities and quality",
        level: 300,
        scope_level: "area",
        permissions: {
          areas: { read: true, write: true, delete: false },
          batches: { read: true, write: true, delete: false },
          plants: { read: true, write: true, delete: false },
          activities: { read: true, write: true, delete: false },
        },
        inherits_from_role_ids: [],
        is_system_role: true,
        is_active: true,
        created_at: now,
      },
      {
        name: "CULTIVATION_TECHNICIAN",
        display_name_es: "Técnico de Cultivo",
        display_name_en: "Cultivation Technician",
        description: "Execute daily cultivation tasks",
        level: 200,
        scope_level: "area",
        permissions: {
          batches: { read: true, write: true, delete: false },
          plants: { read: true, write: true, delete: false },
          activities: { read: true, write: true, delete: false },
        },
        inherits_from_role_ids: [],
        is_system_role: true,
        is_active: true,
        created_at: now,
      },
      {
        name: "QUALITY_INSPECTOR",
        display_name_es: "Inspector de Calidad",
        display_name_en: "Quality Inspector",
        description: "Perform quality checks and compliance",
        level: 250,
        scope_level: "facility",
        permissions: {
          batches: { read: true, write: false, delete: false },
          quality_checks: { read: true, write: true, delete: false },
          compliance: { read: true, write: true, delete: false },
        },
        inherits_from_role_ids: [],
        is_system_role: true,
        is_active: true,
        created_at: now,
      },
      {
        name: "VIEWER",
        display_name_es: "Observador",
        display_name_en: "Viewer",
        description: "Read-only access to assigned resources",
        level: 10,
        scope_level: "facility",
        permissions: {
          all: { read: true, write: false, delete: false },
        },
        inherits_from_role_ids: [],
        is_system_role: true,
        is_active: true,
        created_at: now,
      },
    ];

    const roleIds = [];
    for (const role of roles) {
      const roleId = await ctx.db.insert("roles", role);
      roleIds.push(roleId);
    }

    return {
      success: true,
      message: "Roles seeded successfully",
      count: roleIds.length,
      roles: roles.map((r) => r.name),
    };
  },
});

/**
 * Seed crop types
 * Creates the initial crop type catalog
 */
export const seedCropTypes = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Check if crop types already exist
    const existingCropTypes = await ctx.db.query("crop_types").collect();
    if (existingCropTypes.length > 0) {
      return {
        success: true,
        message: "Crop types already seeded",
        count: existingCropTypes.length,
      };
    }

    const cropTypes = [
      {
        name: "Cannabis",
        display_name_es: "Cannabis",
        display_name_en: "Cannabis",
        scientific_name: "Cannabis sativa L.",
        default_tracking_level: "individual",
        individual_tracking_optional: false,
        compliance_profile: {
          regulatory_category: "controlled_substance",
          requires_special_license: true,
        },
        default_phases: [
          { name: "Propagation", duration_days: 14 },
          { name: "Vegetative", duration_days: 30 },
          { name: "Flowering", duration_days: 60 },
          { name: "Drying & Curing", duration_days: 16 },
        ],
        environmental_requirements: {
          temperature_range: { min: 20, max: 28, unit: "celsius" },
          humidity_range: { min: 40, max: 70, unit: "percent" },
          light_cycle: { vegetative: "18/6", flowering: "12/12" },
          ph_range: { min: 6.0, max: 7.0 },
        },
        average_cycle_days: 120,
        is_active: true,
        created_at: now,
      },
      {
        name: "Coffee",
        display_name_es: "Café",
        display_name_en: "Coffee",
        scientific_name: "Coffea arabica / Coffea canephora",
        default_tracking_level: "batch",
        individual_tracking_optional: true,
        compliance_profile: {
          regulatory_category: "agricultural_commodity",
          requires_special_license: false,
        },
        default_phases: [
          { name: "Nursery", duration_days: 180 },
          { name: "Growth", duration_days: 730 },
          { name: "Flowering", duration_days: 30 },
          { name: "Cherry Development", duration_days: 120 },
          { name: "Harvest", duration_days: 35 },
        ],
        environmental_requirements: {
          temperature_range: { min: 15, max: 24, unit: "celsius" },
          altitude_range: { min: 1200, max: 2100, unit: "meters" },
          rainfall: { min: 1500, max: 2500, unit: "mm_per_year" },
          shade: { required: true, percentage: "40-60%" },
        },
        average_cycle_days: 1095,
        yield_unit: "kg",
        is_active: true,
        created_at: now,
      },
      {
        name: "Cocoa",
        display_name_es: "Cacao",
        display_name_en: "Cocoa",
        scientific_name: "Theobroma cacao",
        default_tracking_level: "batch",
        individual_tracking_optional: true,
        compliance_profile: {
          regulatory_category: "agricultural_commodity",
          requires_special_license: false,
        },
        default_phases: [
          { name: "Nursery", duration_days: 180 },
          { name: "Establishment", duration_days: 730 },
          { name: "Flowering & Fruiting", duration_days: 180 },
          { name: "Pod Development", duration_days: 150 },
          { name: "Harvest & Fermentation", duration_days: 7 },
        ],
        environmental_requirements: {
          temperature_range: { min: 21, max: 32, unit: "celsius" },
          humidity_range: { min: 70, max: 100, unit: "percent" },
          rainfall: { min: 1500, max: 2500, unit: "mm_per_year" },
          shade: { required: true, percentage: "30-50%" },
        },
        average_cycle_days: 1460,
        yield_unit: "kg",
        is_active: true,
        created_at: now,
      },
      {
        name: "Flowers",
        display_name_es: "Flores",
        display_name_en: "Flowers",
        scientific_name: "Various ornamental species",
        default_tracking_level: "batch",
        individual_tracking_optional: true,
        compliance_profile: {
          regulatory_category: "ornamental",
          requires_special_license: false,
        },
        default_phases: [
          { name: "Propagation", duration_days: 14 },
          { name: "Growth", duration_days: 45 },
          { name: "Flowering", duration_days: 21 },
          { name: "Harvest & Post-harvest", duration_days: 10 },
        ],
        environmental_requirements: {
          temperature_range: { min: 15, max: 24, unit: "celsius" },
          humidity_range: { min: 60, max: 85, unit: "percent" },
          light_hours: { min: 12, max: 16, unit: "hours_per_day" },
        },
        average_cycle_days: 90,
        yield_unit: "stems",
        is_active: true,
        created_at: now,
      },
    ];

    const cropTypeIds = [];
    for (const cropType of cropTypes) {
      const cropTypeId = await ctx.db.insert("crop_types", cropType);
      cropTypeIds.push(cropTypeId);
    }

    return {
      success: true,
      message: "Crop types seeded successfully",
      count: cropTypeIds.length,
      cropTypes: cropTypes.map((ct) => ct.name),
    };
  },
});

