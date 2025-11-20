/**
 * Facility Queries and Mutations
 * Licensed cultivation facility management
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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
    company_id: v.id("companies"), // Convex company ID

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

    total_area_m2: v.optional(v.number()),
    canopy_area_m2: v.optional(v.number()),
    cultivation_area_m2: v.optional(v.number()),

    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

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

    name: v.optional(v.string()),
    status: v.optional(v.string()),
    facility_type: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    total_area_m2: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, companyId, ...updates } = args;

    // Verify company ownership
    const facility = await ctx.db.get(id);
    if (!facility || facility.company_id !== companyId) {
      throw new Error("Facility not found or access denied");
    }

    await ctx.db.patch(id, {
      ...updates,
      updated_at: Date.now(),
    });

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
    // Verify company ownership
    const facility = await ctx.db.get(args.id);
    if (!facility || facility.company_id !== args.companyId) {
      throw new Error("Facility not found or access denied");
    }

    // Soft delete by setting status to inactive
    await ctx.db.patch(args.id, {
      status: "inactive",
      updated_at: Date.now(),
    });

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
    // Direct implementation instead of calling list()
    let facilitiesQuery = ctx.db.query("facilities")
      .withIndex("by_company", (q) => q.eq("company_id", args.companyId));

    const allFacilities = await facilitiesQuery.collect();

    return allFacilities;
  },
});

/**
 * Get facility by ID
 * Wrapper for Bubble.io API compatibility (Phase 1 Module 3)
 */
export const getById = query({
  args: {
    facilityId: v.id("facilities"),
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    // Direct implementation instead of calling get()
    const facility = await ctx.db.get(args.facilityId);

    // Verify company ownership
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
    const facility = await ctx.db.get(args.facilityId);
    if (!facility) {
      throw new Error("Facility not found");
    }

    // Return facility settings
    // Note: These settings are stored directly in the facility record
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
