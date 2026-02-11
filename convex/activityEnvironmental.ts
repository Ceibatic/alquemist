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
