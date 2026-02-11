/**
 * Activity Environmental Readings — CRUD backend
 *
 * Normalized environmental readings (temperature, humidity, VPD, CO2, pH, EC, etc.)
 * linked to activities. Supports batch creation and history queries.
 */

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUserId } from "./authHelpers";

// ============================================================================
// QUERIES
// ============================================================================

export const listByActivity = query({
  args: { activityId: v.id("activities") },
  handler: async (ctx, args) => {
    const readings = await ctx.db
      .query("activity_environmental_readings")
      .withIndex("by_activity", (q) => q.eq("activity_id", args.activityId))
      .collect();

    // Sort by reading_type for consistent display
    readings.sort((a, b) => a.reading_type.localeCompare(b.reading_type));
    return readings;
  },
});

export const getHistory = query({
  args: {
    companyId: v.id("companies"),
    readingType: v.string(),
    zoneId: v.optional(v.id("areas")),
    dateFrom: v.optional(v.number()),
    dateTo: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Default to last 30 days
    const now = Date.now();
    const from = args.dateFrom ?? now - 30 * 24 * 60 * 60 * 1000;
    const to = args.dateTo ?? now;

    const readings = await ctx.db
      .query("activity_environmental_readings")
      .withIndex("by_reading_type", (q) =>
        q.eq("company_id", args.companyId).eq("reading_type", args.readingType)
      )
      .collect();

    // Filter by date range
    let filtered = readings.filter(
      (r) => r.measured_at >= from && r.measured_at <= to
    );

    // Filter by zone if provided
    if (args.zoneId) {
      const activityIds = new Set(filtered.map((r) => r.activity_id));
      const activityZones = new Map<string, string | undefined>();
      for (const actId of activityIds) {
        const act = await ctx.db.get(actId);
        activityZones.set(
          actId as string,
          act?.zone_id as string | undefined
        );
      }
      filtered = filtered.filter(
        (r) =>
          activityZones.get(r.activity_id as string) ===
          (args.zoneId as string)
      );
    }

    // Sort by measured_at ascending for chart display
    filtered.sort((a, b) => a.measured_at - b.measured_at);

    return filtered;
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

export const create = mutation({
  args: {
    activityId: v.id("activities"),
    readings: v.array(
      v.object({
        readingType: v.string(),
        value: v.number(),
        unit: v.string(),
        measuredAt: v.optional(v.number()),
        sensorId: v.optional(v.string()),
        locationNote: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const activity = await ctx.db.get(args.activityId);
    if (!activity) throw new Error("Activity not found");
    const companyId = activity.company_id;
    if (!companyId) throw new Error("Activity has no company_id");

    const now = Date.now();
    const ids = [];

    for (const r of args.readings) {
      const id = await ctx.db.insert("activity_environmental_readings", {
        activity_id: args.activityId,
        company_id: companyId,
        reading_type: r.readingType,
        value: r.value,
        unit: r.unit,
        measured_at: r.measuredAt ?? now,
        sensor_id: r.sensorId,
        location_note: r.locationNote,
        created_at: now,
      });
      ids.push(id);
    }

    return ids;
  },
});

export const update = mutation({
  args: {
    readingId: v.id("activity_environmental_readings"),
    value: v.number(),
    unit: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db.get(args.readingId);
    if (!existing) throw new Error("Reading not found");

    const patch: Record<string, unknown> = { value: args.value };
    if (args.unit !== undefined) patch.unit = args.unit;

    await ctx.db.patch(args.readingId, patch);
  },
});

export const remove = mutation({
  args: {
    readingId: v.id("activity_environmental_readings"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db.get(args.readingId);
    if (!existing) throw new Error("Reading not found");

    await ctx.db.delete(args.readingId);
  },
});

// ============================================================================
// MIGRATION
// ============================================================================

// Known field-to-reading-type mappings from legacy environmental_data
const FIELD_MAP: Record<string, { type: string; unit: string }> = {
  temperature: { type: "temperature", unit: "C" },
  temp: { type: "temperature", unit: "C" },
  humidity: { type: "humidity", unit: "%" },
  vpd: { type: "vpd", unit: "kPa" },
  co2: { type: "co2", unit: "ppm" },
  light: { type: "light_ppfd", unit: "umol/m2/s" },
  light_ppfd: { type: "light_ppfd", unit: "umol/m2/s" },
  ph: { type: "ph", unit: "" },
  ec: { type: "ec", unit: "mS/cm" },
};

export const migrateEnvironmentalData = mutation({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const activities = await ctx.db
      .query("activities")
      .withIndex("by_company", (q) => q.eq("company_id", args.companyId))
      .collect();

    let migrated = 0;
    const errors: string[] = [];

    for (const activity of activities) {
      const envData = activity.environmental_data as Record<string, unknown> | undefined;
      if (!envData || Object.keys(envData).length === 0) continue;

      // Check if already migrated
      const existing = await ctx.db
        .query("activity_environmental_readings")
        .withIndex("by_activity", (q) => q.eq("activity_id", activity._id))
        .first();
      if (existing) continue;

      for (const [field, value] of Object.entries(envData)) {
        const mapping = FIELD_MAP[field.toLowerCase()];
        if (!mapping) continue;

        const numValue = typeof value === "number" ? value : parseFloat(String(value));
        if (isNaN(numValue)) continue;

        try {
          await ctx.db.insert("activity_environmental_readings", {
            activity_id: activity._id,
            company_id: args.companyId,
            reading_type: mapping.type,
            value: numValue,
            unit: mapping.unit,
            measured_at: activity.timestamp,
            created_at: activity.created_at,
          });
          migrated++;
        } catch (e) {
          errors.push(`activity ${activity._id} field ${field}: ${e}`);
        }
      }
    }

    return { readings_migrated: migrated, errors };
  },
});
