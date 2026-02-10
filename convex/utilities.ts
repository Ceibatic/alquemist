/**
 * Utility Readings — Queries & Mutations
 * Track periodic meter readings for electricity, water, and gas costs
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Create a new utility reading for a facility
 * Validates uniqueness of type+period+facility
 */
export const createReading = mutation({
  args: {
    facility_id: v.id("facilities"),
    utility_type: v.union(
      v.literal("electricity"),
      v.literal("water"),
      v.literal("gas")
    ),
    period: v.string(), // YYYY-MM
    reading_previous: v.number(),
    reading_current: v.number(),
    consumption_unit: v.string(),
    cost_total: v.number(),
    cost_currency: v.optional(v.string()),
    notes: v.optional(v.string()),
    recorded_by: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Validate period format
    if (!/^\d{4}-\d{2}$/.test(args.period)) {
      throw new Error("Periodo debe tener formato YYYY-MM");
    }

    // Validate readings
    if (args.reading_current < args.reading_previous) {
      throw new Error("La lectura actual debe ser mayor o igual a la anterior");
    }

    if (args.cost_total < 0) {
      throw new Error("El costo debe ser mayor o igual a 0");
    }

    // Check for duplicate: same type + period + facility
    const existing = await ctx.db
      .query("utility_readings")
      .withIndex("by_facility", (q) => q.eq("facility_id", args.facility_id))
      .collect();

    const duplicate = existing.find(
      (r) => r.utility_type === args.utility_type && r.period === args.period
    );

    if (duplicate) {
      throw new Error(
        `Ya existe una lectura de ${args.utility_type} para el periodo ${args.period}`
      );
    }

    const consumption = args.reading_current - args.reading_previous;

    const readingId = await ctx.db.insert("utility_readings", {
      facility_id: args.facility_id,
      utility_type: args.utility_type,
      period: args.period,
      reading_previous: args.reading_previous,
      reading_current: args.reading_current,
      consumption,
      consumption_unit: args.consumption_unit,
      cost_total: args.cost_total,
      cost_currency: args.cost_currency || "COP",
      allocation_status: "pending",
      notes: args.notes,
      recorded_by: args.recorded_by,
      created_at: Date.now(),
    });

    return readingId;
  },
});

/**
 * Get utility readings for a facility, ordered by period desc
 */
export const getByFacility = query({
  args: {
    facility_id: v.id("facilities"),
    utility_type: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let readings = await ctx.db
      .query("utility_readings")
      .withIndex("by_facility", (q) => q.eq("facility_id", args.facility_id))
      .collect();

    // Filter by type if specified
    if (args.utility_type) {
      readings = readings.filter((r) => r.utility_type === args.utility_type);
    }

    // Sort by period descending
    readings.sort((a, b) => b.period.localeCompare(a.period));

    // Apply limit
    if (args.limit) {
      readings = readings.slice(0, args.limit);
    }

    return readings;
  },
});

/**
 * Update an existing utility reading
 */
export const updateReading = mutation({
  args: {
    readingId: v.id("utility_readings"),
    reading_previous: v.optional(v.number()),
    reading_current: v.optional(v.number()),
    cost_total: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const reading = await ctx.db.get(args.readingId);
    if (!reading) {
      throw new Error("Lectura no encontrada");
    }

    const prev = args.reading_previous ?? reading.reading_previous;
    const curr = args.reading_current ?? reading.reading_current;

    if (curr < prev) {
      throw new Error("La lectura actual debe ser mayor o igual a la anterior");
    }

    if (args.cost_total !== undefined && args.cost_total < 0) {
      throw new Error("El costo debe ser mayor o igual a 0");
    }

    const consumption = curr - prev;

    await ctx.db.patch(args.readingId, {
      ...(args.reading_previous !== undefined && { reading_previous: args.reading_previous }),
      ...(args.reading_current !== undefined && { reading_current: args.reading_current }),
      ...(args.cost_total !== undefined && { cost_total: args.cost_total }),
      ...(args.notes !== undefined && { notes: args.notes }),
      consumption,
      // Reset allocation if readings changed
      ...(args.reading_current !== undefined || args.reading_previous !== undefined || args.cost_total !== undefined
        ? { allocation_status: "pending" }
        : {}),
    });

    return { success: true };
  },
});

/**
 * Delete a utility reading
 */
export const deleteReading = mutation({
  args: {
    readingId: v.id("utility_readings"),
  },
  handler: async (ctx, args) => {
    const reading = await ctx.db.get(args.readingId);
    if (!reading) {
      throw new Error("Lectura no encontrada");
    }

    // Delete associated cost_entries
    const costEntries = await ctx.db
      .query("cost_entries")
      .withIndex("by_facility", (q) => q.eq("facility_id", reading.facility_id))
      .collect();

    const relatedEntries = costEntries.filter(
      (e) => e.source_id === args.readingId && e.cost_type.startsWith("utility_")
    );

    for (const entry of relatedEntries) {
      await ctx.db.delete(entry._id);
    }

    await ctx.db.delete(args.readingId);
    return { success: true };
  },
});
