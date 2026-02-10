/**
 * Cultivation Schedules — Master cultivation plans per batch
 *
 * A schedule defines the planned phases and their durations for a batch.
 * When activated, it generates scheduled_activities from applicable templates.
 *
 * Flow: create (draft) → activate (generates activities) → updateProgress → complete
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get the schedule for a specific batch.
 * Returns the active schedule, or draft if no active exists.
 */
export const getByBatch = query({
  args: {
    batchId: v.id("batches"),
  },
  handler: async (ctx, { batchId }) => {
    const schedules = await ctx.db
      .query("cultivation_schedules")
      .withIndex("by_batch_id", (q) => q.eq("batch_id", batchId))
      .collect();

    // Prefer active, then draft
    const active = schedules.find((s) => s.status === "active");
    if (active) return active;

    const draft = schedules.find((s) => s.status === "draft");
    return draft ?? null;
  },
});

/**
 * List schedules for a company with optional status filter.
 */
export const list = query({
  args: {
    companyId: v.id("companies"),
    status: v.optional(v.string()),
  },
  handler: async (ctx, { companyId, status }) => {
    let schedules = await ctx.db
      .query("cultivation_schedules")
      .withIndex("by_company", (q) => q.eq("company_id", companyId))
      .collect();

    if (status) {
      schedules = schedules.filter((s) => s.status === status);
    }

    // Enrich with batch info
    const enriched = await Promise.all(
      schedules.map(async (s) => {
        const batch = await ctx.db.get(s.batch_id);
        return {
          ...s,
          batchName: batch?.batch_code ?? "Batch desconocido",
          progressPct:
            s.total_activities > 0
              ? Math.round((s.completed_activities / s.total_activities) * 100)
              : 0,
        };
      })
    );

    return enriched.sort((a, b) => b.created_at - a.created_at);
  },
});

/**
 * Get a schedule by ID with enriched data.
 */
export const getById = query({
  args: {
    scheduleId: v.id("cultivation_schedules"),
  },
  handler: async (ctx, { scheduleId }) => {
    const schedule = await ctx.db.get(scheduleId);
    if (!schedule) return null;

    const batch = await ctx.db.get(schedule.batch_id);
    const cropType = await ctx.db.get(schedule.crop_type_id);

    return {
      ...schedule,
      batchName: batch?.batch_code ?? "Batch desconocido",
      cropTypeName: cropType?.name ?? "Cultivo desconocido",
      progressPct:
        schedule.total_activities > 0
          ? Math.round(
              (schedule.completed_activities / schedule.total_activities) * 100
            )
          : 0,
    };
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new cultivation schedule in "draft" status.
 * Calculates planned_end_date from planned_start_date + sum(phase durations).
 */
export const create = mutation({
  args: {
    companyId: v.id("companies"),
    batchId: v.id("batches"),
    cropTypeId: v.id("crop_types"),
    name: v.string(),
    plannedPhases: v.array(
      v.object({
        phase: v.string(),
        duration_days: v.number(),
      })
    ),
    plannedStartDate: v.number(),
    zoneId: v.optional(v.id("areas")),
    productionOrderId: v.optional(v.id("production_orders")),
  },
  handler: async (ctx, args) => {
    // Validate batch exists
    const batch = await ctx.db.get(args.batchId);
    if (!batch) {
      throw new Error(`Batch no encontrado: ${args.batchId}`);
    }

    // Validate no active schedule already exists for this batch
    const existing = await ctx.db
      .query("cultivation_schedules")
      .withIndex("by_batch_id", (q) => q.eq("batch_id", args.batchId))
      .collect();
    const activeOrDraft = existing.find(
      (s) => s.status === "active" || s.status === "draft"
    );
    if (activeOrDraft) {
      throw new Error(
        `El batch ya tiene un plan de cultivo ${activeOrDraft.status === "active" ? "activo" : "en borrador"}`
      );
    }

    // Calculate phase start/end days and planned_end_date
    let currentDay = 0;
    const enrichedPhases = args.plannedPhases.map((p) => {
      const startDay = currentDay;
      const endDay = currentDay + p.duration_days;
      currentDay = endDay;
      return {
        phase: p.phase,
        duration_days: p.duration_days,
        start_day: startDay,
        end_day: endDay,
      };
    });

    const totalDays = enrichedPhases.reduce(
      (sum, p) => sum + p.duration_days,
      0
    );
    const plannedEndDate =
      args.plannedStartDate + totalDays * 24 * 60 * 60 * 1000;

    const now = Date.now();
    return await ctx.db.insert("cultivation_schedules", {
      company_id: args.companyId,
      batch_id: args.batchId,
      crop_type_id: args.cropTypeId,
      production_order_id: args.productionOrderId,
      name: args.name,
      zone_id: args.zoneId,
      planned_start_date: args.plannedStartDate,
      planned_end_date: plannedEndDate,
      planned_phases: enrichedPhases,
      total_activities: 0,
      completed_activities: 0,
      skipped_activities: 0,
      current_phase: enrichedPhases[0]?.phase,
      current_phase_day: 0,
      status: "draft",
      created_at: now,
      updated_at: now,
    });
  },
});

/**
 * Activate a schedule. Requires total_activities > 0 (must generate first).
 */
export const activate = mutation({
  args: {
    scheduleId: v.id("cultivation_schedules"),
  },
  handler: async (ctx, { scheduleId }) => {
    const schedule = await ctx.db.get(scheduleId);
    if (!schedule) {
      throw new Error(`Plan no encontrado: ${scheduleId}`);
    }
    if (schedule.status !== "draft") {
      throw new Error(
        `Solo se puede activar un plan en borrador. Estado actual: ${schedule.status}`
      );
    }
    if (schedule.total_activities === 0) {
      throw new Error(
        "Genera las actividades programadas antes de activar el plan"
      );
    }

    await ctx.db.patch(scheduleId, {
      status: "active",
      updated_at: Date.now(),
    });
    return scheduleId;
  },
});

/**
 * Update progress counters by scanning scheduled_activities linked to this schedule.
 */
export const updateProgress = mutation({
  args: {
    scheduleId: v.id("cultivation_schedules"),
  },
  handler: async (ctx, { scheduleId }) => {
    const schedule = await ctx.db.get(scheduleId);
    if (!schedule) {
      throw new Error(`Plan no encontrado: ${scheduleId}`);
    }

    // Count scheduled_activities by status
    const activities = await ctx.db
      .query("scheduled_activities")
      .withIndex("by_schedule", (q) => q.eq("schedule_id", scheduleId))
      .collect();

    const completed = activities.filter(
      (a) => a.status === "completed"
    ).length;
    const skipped = activities.filter((a) => a.status === "skipped").length;
    const total = activities.length;

    // Check if all activities are done
    const allDone = completed + skipped === total && total > 0;

    await ctx.db.patch(scheduleId, {
      total_activities: total,
      completed_activities: completed,
      skipped_activities: skipped,
      status: allDone ? "completed" : schedule.status,
      updated_at: Date.now(),
    });

    return { total, completed, skipped };
  },
});

/**
 * Cancel a schedule.
 */
export const cancel = mutation({
  args: {
    scheduleId: v.id("cultivation_schedules"),
  },
  handler: async (ctx, { scheduleId }) => {
    const schedule = await ctx.db.get(scheduleId);
    if (!schedule) {
      throw new Error(`Plan no encontrado: ${scheduleId}`);
    }

    await ctx.db.patch(scheduleId, {
      status: "cancelled",
      updated_at: Date.now(),
    });
    return scheduleId;
  },
});
