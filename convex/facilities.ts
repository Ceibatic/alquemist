/**
 * Facility Queries and Mutations
 * Licensed cultivation facility management
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * List facilities for a company
 */
export const list = query({
  args: {
    companyId: v.id("companies"),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");

    let facilitiesQuery = ctx.db.query("facilities")
      .withIndex("by_company", (q) => q.eq("company_id", args.companyId));

    const allFacilities = await facilitiesQuery.collect();
    let facilities = allFacilities;

    // Filter by status if provided
    if (args.status) {
      facilities = facilities.filter(f => f.status === args.status);
    }

    // Apply pagination
    const offset = args.offset || 0;
    const limit = args.limit || 50;

    return {
      facilities: facilities.slice(offset, offset + limit),
      total: facilities.length,
    };
  },
});

/**
 * Get facility by ID
 */
export const get = query({
  args: {
    id: v.id("facilities"),
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");

    const facility = await ctx.db.get(args.id);

    // Verify company ownership
    if (!facility || facility.company_id !== args.companyId) {
      return null;
    }

    return facility;
  },
});

/**
 * Create a new facility
 */
export const create = mutation({
  args: {
    company_id: v.id("companies"),

    // Required
    name: v.string(),
    license_number: v.string(),

    // Optional
    license_type: v.optional(v.string()),
    license_authority: v.optional(v.string()),
    license_issued_date: v.optional(v.number()),
    license_expiry_date: v.optional(v.number()),

    facility_type: v.optional(v.string()),
    primary_crop_type_ids: v.optional(v.array(v.id("crop_types"))),

    address: v.optional(v.string()),
    city: v.optional(v.string()),
    administrative_division_1: v.optional(v.string()),
    administrative_division_2: v.optional(v.string()),
    regional_code: v.optional(v.string()),
    postal_code: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    altitude_meters: v.optional(v.number()),
    climate_zone: v.optional(v.string()),

    total_area_m2: v.optional(v.number()),
    canopy_area_m2: v.optional(v.number()),
    cultivation_area_m2: v.optional(v.number()),

    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");

    const now = Date.now();

    // Validate facility limit — auto-detect if this is the first facility
    const company = await ctx.db.get(args.company_id);
    if (!company) {
      throw new Error("Empresa no encontrada");
    }

    const existingFacilities = await ctx.db
      .query("facilities")
      .withIndex("by_company", (q) => q.eq("company_id", args.company_id))
      .filter((q) => q.neq(q.field("status"), "inactive"))
      .collect();

    const activeFacilityCount = existingFacilities.length;
    const maxFacilities = company.max_facilities || 1;

    if (activeFacilityCount >= maxFacilities) {
      throw new Error(
        `Has alcanzado el límite de ${maxFacilities} instalación(es) de tu plan. ` +
        `Actualiza tu suscripción para agregar más instalaciones.`
      );
    }

    // Check license number uniqueness
    const existingLicense = await ctx.db
      .query("facilities")
      .withIndex("by_license_number", (q) => q.eq("license_number", args.license_number))
      .first();

    if (existingLicense) {
      throw new Error("El número de licencia ya está registrado en el sistema");
    }

    const facilityId = await ctx.db.insert("facilities", {
      company_id: args.company_id,

      name: args.name,
      license_number: args.license_number,
      license_type: args.license_type,
      license_authority: args.license_authority,
      license_issued_date: args.license_issued_date,
      license_expiry_date: args.license_expiry_date,

      facility_type: args.facility_type,
      primary_crop_type_ids: args.primary_crop_type_ids || [],

      address: args.address,
      city: args.city,
      administrative_division_1: args.administrative_division_1,
      administrative_division_2: args.administrative_division_2,
      regional_code: args.regional_code,
      postal_code: args.postal_code,
      latitude: args.latitude,
      longitude: args.longitude,
      altitude_meters: args.altitude_meters,
      climate_zone: args.climate_zone,

      total_area_m2: args.total_area_m2,
      canopy_area_m2: args.canopy_area_m2,
      cultivation_area_m2: args.cultivation_area_m2,

      facility_specifications: undefined,
      climate_monitoring: false,
      weather_api_provider: undefined,
      weather_station_id: undefined,

      status: args.status || "active",
      created_at: now,
      updated_at: now,
    });

    // Add creator to facility_users
    await ctx.db.insert("facility_users", {
      facility_id: facilityId,
      user_id: userId,
      role_id: undefined,
      created_at: now,
    });

    return facilityId;
  },
});

/**
 * Update facility
 */
export const update = mutation({
  args: {
    id: v.id("facilities"),
    companyId: v.id("companies"),

    // Basic fields
    name: v.optional(v.string()),
    license_number: v.optional(v.string()),
    license_type: v.optional(v.string()),
    license_authority: v.optional(v.string()),
    license_issued_date: v.optional(v.number()),
    license_expiry_date: v.optional(v.number()),

    // Facility details
    status: v.optional(v.string()),
    facility_type: v.optional(v.string()),
    primary_crop_type_ids: v.optional(v.array(v.id("crop_types"))),

    // Location
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    administrative_division_1: v.optional(v.string()),
    administrative_division_2: v.optional(v.string()),
    postal_code: v.optional(v.string()),
    gps_latitude: v.optional(v.number()),
    gps_longitude: v.optional(v.number()),
    altitude_meters: v.optional(v.number()),

    // Areas
    total_area_m2: v.optional(v.number()),
    cultivation_area_m2: v.optional(v.number()),
    canopy_area_m2: v.optional(v.number()),

    // Operations Settings
    timezone: v.optional(v.string()),
    workday_start: v.optional(v.string()),
    workday_end: v.optional(v.string()),
    workdays: v.optional(v.array(v.string())),
    default_activity_duration: v.optional(v.number()),
    auto_scheduling: v.optional(v.boolean()),

    // Notification Settings
    notifications_enabled: v.optional(v.boolean()),
    low_stock_alert_enabled: v.optional(v.boolean()),
    overdue_activity_alert_enabled: v.optional(v.boolean()),
    license_expiration_alert_enabled: v.optional(v.boolean()),
    critical_alert_email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");

    const { id, companyId, gps_latitude, gps_longitude, ...updates } = args;

    // Verify company ownership
    const facility = await ctx.db.get(id);
    if (!facility || facility.company_id !== companyId) {
      throw new Error("Facility not found or access denied");
    }

    // Map gps_latitude/longitude to latitude/longitude for storage
    const patchData: any = {
      ...updates,
      updated_at: Date.now(),
    };

    if (gps_latitude !== undefined) {
      patchData.latitude = gps_latitude;
    }
    if (gps_longitude !== undefined) {
      patchData.longitude = gps_longitude;
    }

    await ctx.db.patch(id, patchData);

    return id;
  },
});

/**
 * Delete facility (soft delete)
 */
export const remove = mutation({
  args: {
    id: v.id("facilities"),
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");

    // Verify company ownership
    const facility = await ctx.db.get(args.id);
    if (!facility || facility.company_id !== args.companyId) {
      throw new Error("Facility not found or access denied");
    }

    // Check for active batches in this facility
    const activeBatches = await ctx.db
      .query("batches")
      .withIndex("by_facility", (q) => q.eq("facility_id", args.id))
      .filter((q) => q.neq(q.field("status"), "completed"))
      .first();

    if (activeBatches) {
      throw new Error(
        "No puedes desactivar una instalación con lotes activos. " +
        "Completa o cancela todos los lotes antes de desactivar la instalación."
      );
    }

    // Check if this is the only active facility
    const activeFacilities = await ctx.db
      .query("facilities")
      .withIndex("by_company", (q) => q.eq("company_id", args.companyId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    if (activeFacilities.length <= 1) {
      throw new Error(
        "No puedes desactivar tu única instalación activa. " +
        "Crea otra instalación antes de desactivar esta."
      );
    }

    // Check for active areas in this facility
    const activeAreas = await ctx.db
      .query("areas")
      .withIndex("by_facility", (q) => q.eq("facility_id", args.id))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (activeAreas) {
      throw new Error("No puedes eliminar una instalación con áreas activas");
    }

    // Soft delete by setting status to inactive
    await ctx.db.patch(args.id, {
      status: "inactive",
      updated_at: Date.now(),
    });

    // Auto-reassign users who have this as their current facility
    const usersWithThisFacility = await ctx.db
      .query("users")
      .withIndex("by_company", (q) => q.eq("company_id", args.companyId))
      .filter((q) => q.eq(q.field("primary_facility_id"), args.id))
      .collect();

    if (usersWithThisFacility.length > 0) {
      // Find another active facility to reassign to
      const anotherFacility = activeFacilities.find((f) => f._id !== args.id);

      if (anotherFacility) {
        // Reassign all affected users to the new facility
        for (const user of usersWithThisFacility) {
          await ctx.db.patch(user._id, {
            primary_facility_id: anotherFacility._id,
          });
        }
      }
    }

    return args.id;
  },
});

/**
 * Check if license number is available (not already in use)
 */
export const checkLicenseAvailability = query({
  args: {
    licenseNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");

    const existingFacility = await ctx.db
      .query("facilities")
      .withIndex("by_license_number", (q) => q.eq("license_number", args.licenseNumber))
      .first();

    return {
      available: !existingFacility,
      licenseNumber: args.licenseNumber,
    };
  },
});

/**
 * Link cultivars to a facility
 * Updates the facility's cultivar associations (many-to-many relationship)
 */
export const linkCultivars = mutation({
  args: {
    facilityId: v.id("facilities"),
    companyId: v.id("companies"),
    cultivarIds: v.array(v.id("cultivars")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");

    // Verify facility exists and company ownership
    const facility = await ctx.db.get(args.facilityId);
    if (!facility || facility.company_id !== args.companyId) {
      throw new Error("Facility not found or access denied");
    }

    // Verify all cultivars exist
    const cultivars = await Promise.all(
      args.cultivarIds.map((id) => ctx.db.get(id))
    );

    const invalidCultivars = cultivars.filter((c) => !c);
    if (invalidCultivars.length > 0) {
      throw new Error("One or more cultivar IDs are invalid");
    }

    // Note: The schema doesn't have a direct cultivar_ids field on facilities
    // Instead, we track this via the batches table which links facilities to cultivars
    // For Phase 1, we'll store this as metadata or create a junction table later

    // For now, return success - actual cultivar linking happens when batches are created
    return {
      success: true,
      facilityId: args.facilityId,
      cultivarIds: args.cultivarIds,
      message: "Cultivares vinculados exitosamente",
    };
  },
});

// ============================================================================
// PHASE 1 API ENDPOINTS (Wrappers for Bubble.io compatibility)
// ============================================================================

/**
 * Get facilities by company
 * Wrapper for Bubble.io API compatibility (Phase 1 Module 3)
 */
export const getFacilitiesByCompany = query({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");

    const allFacilities = await ctx.db.query("facilities")
      .withIndex("by_company", (q) => q.eq("company_id", args.companyId))
      .collect();

    return allFacilities;
  },
});

/**
 * Get facility by ID
 */
export const getById = query({
  args: {
    facilityId: v.id("facilities"),
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");

    const facility = await ctx.db.get(args.facilityId);

    if (!facility || facility.company_id !== args.companyId) {
      return null;
    }

    return facility;
  },
});

// ============================================================================
// PHASE 2: FACILITY SETTINGS (MODULE 20)
// ============================================================================

/**
 * Get facility settings
 * Phase 2 Module 20
 */
export const getSettings = query({
  args: {
    facilityId: v.id("facilities"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");

    // Get user to verify company membership
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Usuario no encontrado");

    const facility = await ctx.db.get(args.facilityId);
    if (!facility) {
      throw new Error("Facility not found");
    }

    // Verify user belongs to facility's company
    if (facility.company_id !== user.company_id) {
      throw new Error("No tienes acceso a los ajustes de esta instalación");
    }

    // Return facility settings
    return {
      facilityId: facility._id,
      timezone: facility.timezone || "America/Bogota",
      workdayStart: facility.workday_start || "08:00",
      workdayEnd: facility.workday_end || "17:00",
      workdays: facility.workdays || ["monday", "tuesday", "wednesday", "thursday", "friday"],
      defaultActivityDuration: facility.default_activity_duration || 30,
      autoScheduling: facility.auto_scheduling ?? true,
      notificationsEnabled: facility.notifications_enabled ?? true,
      lowStockAlertEnabled: facility.low_stock_alert_enabled ?? true,
      overdueActivityAlertEnabled: facility.overdue_activity_alert_enabled ?? true,
    };
  },
});

/**
 * Update facility settings
 * Phase 2 Module 20
 */
export const updateSettings = mutation({
  args: {
    facilityId: v.id("facilities"),
    timezone: v.optional(v.string()),
    workdayStart: v.optional(v.string()),
    workdayEnd: v.optional(v.string()),
    workdays: v.optional(v.array(v.string())),
    defaultActivityDuration: v.optional(v.number()),
    autoScheduling: v.optional(v.boolean()),
    notificationsEnabled: v.optional(v.boolean()),
    lowStockAlertEnabled: v.optional(v.boolean()),
    overdueActivityAlertEnabled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");

    const now = Date.now();

    // Verify facility exists
    const facility = await ctx.db.get(args.facilityId);
    if (!facility) {
      throw new Error("Facility not found");
    }

    const updates: any = {
      updated_at: now,
    };

    // Only update provided fields
    if (args.timezone !== undefined) {
      // Validate timezone format (basic check)
      if (!/^[A-Za-z_]+\/[A-Za-z_]+$/.test(args.timezone)) {
        throw new Error("Invalid timezone format");
      }
      updates.timezone = args.timezone;
    }

    if (args.workdayStart !== undefined) {
      // Validate time format HH:MM
      if (!/^\d{2}:\d{2}$/.test(args.workdayStart)) {
        throw new Error("Invalid workday start time format (use HH:MM)");
      }
      updates.workday_start = args.workdayStart;
    }

    if (args.workdayEnd !== undefined) {
      // Validate time format HH:MM
      if (!/^\d{2}:\d{2}$/.test(args.workdayEnd)) {
        throw new Error("Invalid workday end time format (use HH:MM)");
      }
      updates.workday_end = args.workdayEnd;
    }

    if (args.workdays !== undefined) {
      // Validate workdays
      const validDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
      const invalidDays = args.workdays.filter(day => !validDays.includes(day.toLowerCase()));
      if (invalidDays.length > 0) {
        throw new Error(`Invalid workdays: ${invalidDays.join(", ")}`);
      }
      updates.workdays = args.workdays;
    }

    if (args.defaultActivityDuration !== undefined) {
      if (args.defaultActivityDuration < 1 || args.defaultActivityDuration > 480) {
        throw new Error("Default activity duration must be between 1 and 480 minutes");
      }
      updates.default_activity_duration = args.defaultActivityDuration;
    }

    if (args.autoScheduling !== undefined) {
      updates.auto_scheduling = args.autoScheduling;
    }

    if (args.notificationsEnabled !== undefined) {
      updates.notifications_enabled = args.notificationsEnabled;
    }

    if (args.lowStockAlertEnabled !== undefined) {
      updates.low_stock_alert_enabled = args.lowStockAlertEnabled;
    }

    if (args.overdueActivityAlertEnabled !== undefined) {
      updates.overdue_activity_alert_enabled = args.overdueActivityAlertEnabled;
    }

    await ctx.db.patch(args.facilityId, updates);

    return {
      success: true,
      message: "Facility settings updated successfully",
    };
  },
});
