/**
 * Utility Readings — Queries & Mutations
 * Track periodic meter readings for electricity, water, and gas costs
 */

import { v } from "convex/values";
import { mutation, query, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

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

// ============================================================================
// UTILITY COST ALLOCATION (PRORRATEO)
// ============================================================================

/**
 * Helper: Get active batches in a facility during a given period
 * Returns batches with their area (m2) and active days in the period
 */
async function getActiveBatchesForPeriod(
  ctx: MutationCtx,
  facilityId: Id<"facilities">,
  period: string // YYYY-MM
) {
  // Parse period to get start/end dates
  const [yearStr, monthStr] = period.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const periodStart = new Date(year, month - 1, 1).getTime();
  const periodEnd = new Date(year, month, 0, 23, 59, 59, 999).getTime();
  const daysInPeriod = new Date(year, month, 0).getDate();

  // Get active batches in the facility
  const batches = await ctx.db
    .query("batches")
    .withIndex("by_facility", (q) => q.eq("facility_id", facilityId))
    .collect();

  // Filter to batches that were active during the period
  const activeBatches = batches.filter((b) => {
    if (b.status !== "active" && b.status !== "harvested") return false;
    // Batch must have started before or during the period
    if (b.created_date > periodEnd) return false;
    // If harvested, must have been harvested during or after the period start
    if (b.status === "harvested" && b.harvest_date && b.harvest_date < periodStart) return false;
    return true;
  });

  // Enrich with area info and calculate active days
  const enriched = await Promise.all(
    activeBatches.map(async (batch) => {
      const area = await ctx.db.get(batch.area_id);
      const areaM2 = area?.total_area_m2 || 0;

      // Calculate days active in the period
      const batchStart = Math.max(batch.created_date, periodStart);
      const batchEnd = batch.harvest_date && batch.harvest_date < periodEnd
        ? batch.harvest_date
        : periodEnd;
      const daysActive = Math.max(
        1,
        Math.ceil((batchEnd - batchStart) / (1000 * 60 * 60 * 24))
      );

      return {
        batchId: batch._id,
        areaM2,
        daysActive,
        daysInPeriod,
        cropPhase: batch.current_phase,
      };
    })
  );

  return enriched.filter((b) => b.areaM2 > 0);
}

/**
 * Allocate utility cost to active batches proportional to area occupied × days active
 * Creates cost_entries for each batch
 */
export const allocateToActiveBatches = mutation({
  args: {
    readingId: v.id("utility_readings"),
  },
  handler: async (ctx, args) => {
    const reading = await ctx.db.get(args.readingId);
    if (!reading) {
      throw new Error("Lectura no encontrada");
    }

    // Delete any existing cost_entries for this reading (re-allocation)
    const existingEntries = await ctx.db
      .query("cost_entries")
      .withIndex("by_facility", (q) => q.eq("facility_id", reading.facility_id))
      .collect();

    const relatedEntries = existingEntries.filter(
      (e) => e.source_id === args.readingId && e.cost_type.startsWith("utility_")
    );

    for (const entry of relatedEntries) {
      await ctx.db.delete(entry._id);
    }

    // Get active batches for the period
    const activeBatches = await getActiveBatchesForPeriod(
      ctx,
      reading.facility_id,
      reading.period
    );

    if (activeBatches.length === 0) {
      // No batches to allocate — mark as no_batches, create single overhead entry
      await ctx.db.patch(args.readingId, { allocation_status: "no_batches" });

      await ctx.db.insert("cost_entries", {
        facility_id: reading.facility_id,
        cost_type: `utility_${reading.utility_type}`,
        source_id: args.readingId,
        cost_total: reading.cost_total,
        cost_currency: reading.cost_currency,
        period: reading.period,
        details: {
          utility_type: reading.utility_type,
          consumption: reading.consumption,
          consumption_unit: reading.consumption_unit,
          allocation: "overhead",
        },
        created_at: Date.now(),
      });

      return { allocated: 0, overhead: reading.cost_total };
    }

    // Calculate weighted allocation: (area × days_active / days_in_period) for each batch
    const totalWeight = activeBatches.reduce(
      (sum, b) => sum + b.areaM2 * (b.daysActive / b.daysInPeriod),
      0
    );

    let allocatedTotal = 0;
    const costType = `utility_${reading.utility_type}`;

    for (const batch of activeBatches) {
      const weight = batch.areaM2 * (batch.daysActive / batch.daysInPeriod);
      const proportion = weight / totalWeight;
      const batchCost = Math.round(reading.cost_total * proportion * 100) / 100;

      await ctx.db.insert("cost_entries", {
        facility_id: reading.facility_id,
        batch_id: batch.batchId,
        cost_type: costType,
        crop_phase: batch.cropPhase,
        source_id: args.readingId,
        cost_total: batchCost,
        cost_currency: reading.cost_currency,
        period: reading.period,
        details: {
          utility_type: reading.utility_type,
          consumption: reading.consumption,
          consumption_unit: reading.consumption_unit,
          area_m2: batch.areaM2,
          days_active: batch.daysActive,
          days_in_period: batch.daysInPeriod,
          proportion: Math.round(proportion * 10000) / 100, // percentage with 2 decimals
        },
        created_at: Date.now(),
      });

      allocatedTotal += batchCost;
    }

    // Mark reading as allocated
    await ctx.db.patch(args.readingId, { allocation_status: "allocated" });

    return { allocated: activeBatches.length, totalCost: allocatedTotal };
  },
});

// ============================================================================
// EQUIPMENT DEPRECIATION
// ============================================================================

/**
 * Calculate monthly depreciation for all active equipment in a facility
 * and allocate to active batches (same prorrateo as utilities)
 */
export const calculateDepreciation = mutation({
  args: {
    facilityId: v.id("facilities"),
    period: v.string(), // YYYY-MM
  },
  handler: async (ctx, args) => {
    // Validate period format
    if (!/^\d{4}-\d{2}$/.test(args.period)) {
      throw new Error("Periodo debe tener formato YYYY-MM");
    }

    // Delete existing depreciation cost_entries for this facility+period
    const existingEntries = await ctx.db
      .query("cost_entries")
      .withIndex("by_facility", (q) => q.eq("facility_id", args.facilityId))
      .collect();

    const oldDepreciation = existingEntries.filter(
      (e) => e.cost_type === "depreciation" && e.period === args.period
    );

    for (const entry of oldDepreciation) {
      await ctx.db.delete(entry._id);
    }

    // Get facility to find its company
    const facility = await ctx.db.get(args.facilityId);
    if (!facility) throw new Error("Instalación no encontrada");

    // Get all equipment products for this company with depreciation configured
    const products = await ctx.db
      .query("products")
      .withIndex("by_company_status", (q) =>
        q.eq("company_id", facility.company_id).eq("status", "active")
      )
      .collect();

    const equipment = products.filter(
      (p) =>
        p.category === "equipment" &&
        p.acquisition_value &&
        p.acquisition_value > 0 &&
        p.useful_life_months &&
        p.useful_life_months > 0
    );

    if (equipment.length === 0) {
      return { equipmentCount: 0, allocated: 0, totalDepreciation: 0 };
    }

    // Get active batches for prorrateo
    const activeBatches = await getActiveBatchesForPeriod(
      ctx,
      args.facilityId,
      args.period
    );

    let totalDepreciation = 0;

    for (const equip of equipment) {
      const monthly =
        ((equip.acquisition_value || 0) - (equip.salvage_value || 0)) /
        (equip.useful_life_months || 1);
      const monthlyRounded = Math.round(monthly * 100) / 100;

      if (monthlyRounded <= 0) continue;
      totalDepreciation += monthlyRounded;

      if (activeBatches.length === 0) {
        // No batches — register as overhead
        await ctx.db.insert("cost_entries", {
          facility_id: args.facilityId,
          cost_type: "depreciation",
          source_id: equip._id,
          cost_total: monthlyRounded,
          cost_currency: equip.price_currency || "COP",
          period: args.period,
          details: {
            equipment_name: equip.name,
            equipment_sku: equip.sku,
            acquisition_value: equip.acquisition_value,
            useful_life_months: equip.useful_life_months,
            salvage_value: equip.salvage_value,
            monthly_depreciation: monthlyRounded,
            allocation: "overhead",
          },
          created_at: Date.now(),
        });
      } else {
        // Allocate proportionally to batches
        const totalWeight = activeBatches.reduce(
          (sum, b) => sum + b.areaM2 * (b.daysActive / b.daysInPeriod),
          0
        );

        for (const batch of activeBatches) {
          const weight = batch.areaM2 * (batch.daysActive / batch.daysInPeriod);
          const proportion = weight / totalWeight;
          const batchCost = Math.round(monthlyRounded * proportion * 100) / 100;

          await ctx.db.insert("cost_entries", {
            facility_id: args.facilityId,
            batch_id: batch.batchId,
            cost_type: "depreciation",
            crop_phase: batch.cropPhase,
            source_id: equip._id,
            cost_total: batchCost,
            cost_currency: equip.price_currency || "COP",
            period: args.period,
            details: {
              equipment_name: equip.name,
              equipment_sku: equip.sku,
              monthly_depreciation: monthlyRounded,
              proportion: Math.round(proportion * 10000) / 100,
            },
            created_at: Date.now(),
          });
        }
      }
    }

    return {
      equipmentCount: equipment.length,
      allocated: activeBatches.length,
      totalDepreciation,
    };
  },
});
