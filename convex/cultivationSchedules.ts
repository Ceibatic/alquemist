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
import {
  materializeQuantity,
  MaterializationContext,
} from "./lib/materializeQuantity";

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

// ============================================================================
// GENERATION — US-TMPL.5
// ============================================================================

/**
 * Generate scheduled_activities from applicable templates for a schedule.
 *
 * If re-executed, deletes pending scheduled_activities and regenerates.
 * Completed/skipped activities are preserved.
 */
export const generateFromSchedule = mutation({
  args: {
    scheduleId: v.id("cultivation_schedules"),
  },
  handler: async (ctx, { scheduleId }) => {
    const schedule = await ctx.db.get(scheduleId);
    if (!schedule) {
      throw new Error(`Plan no encontrado: ${scheduleId}`);
    }

    // Delete existing pending activities for this schedule (regeneration)
    const existingActivities = await ctx.db
      .query("scheduled_activities")
      .withIndex("by_schedule", (q) => q.eq("schedule_id", scheduleId))
      .collect();

    const pendingToDelete = existingActivities.filter(
      (a) => a.status === "pending" || a.status === "cancelled"
    );
    for (const act of pendingToDelete) {
      // Delete associated materialized resources first
      const resources = await ctx.db
        .query("scheduled_activity_resources")
        .withIndex("by_scheduled_activity", (q) =>
          q.eq("scheduled_activity_id", act._id)
        )
        .collect();
      for (const r of resources) {
        await ctx.db.delete(r._id);
      }
      await ctx.db.delete(act._id);
    }

    // Fetch applicable templates
    const allTemplates = await ctx.db
      .query("activity_templates")
      .withIndex("by_company", (q) =>
        q.eq("company_id", schedule.company_id)
      )
      .collect();

    const scheduledPhaseNames = (
      schedule.planned_phases as Array<{
        phase: string;
        duration_days: number;
        start_day: number;
        end_day: number;
      }>
    ).map((p) => p.phase);

    // Filter templates: active, matching crop_type, and overlapping phases
    const applicableTemplates = allTemplates.filter((t) => {
      if (!t.is_active) return false;
      // Check crop type match (if template specifies crop types)
      if (
        t.crop_type_ids &&
        t.crop_type_ids.length > 0 &&
        !t.crop_type_ids.includes(schedule.crop_type_id)
      ) {
        return false;
      }
      // Check phase overlap
      const hasPhaseOverlap = t.applicable_phases.some((p) =>
        scheduledPhaseNames.includes(p)
      );
      return hasPhaseOverlap;
    });

    // ── Pre-fetch activity type codes for applicable templates ──
    const activityTypeCodeMap = new Map<string, string>();
    for (const t of applicableTemplates) {
      if (t.type_id && !activityTypeCodeMap.has(t.type_id)) {
        const actType = await ctx.db.get(t.type_id);
        if (actType) {
          activityTypeCodeMap.set(t.type_id, actType.code);
        }
      }
    }

    // ── Resolve materialization context (batch + area) ──
    const batch = await ctx.db.get(schedule.batch_id);
    const area = batch?.area_id ? await ctx.db.get(batch.area_id) : null;
    const matContext: MaterializationContext = {
      plantCount: batch?.current_quantity ?? 0,
      areaM2: (area as any)?.usable_area_m2 ?? (area as any)?.total_area_m2 ?? 0,
    };

    // ── Cache template resources (one query per template, not per activity) ──
    const templateResourcesCache = new Map<
      string,
      Array<{
        _id: Id<"activity_template_resources">;
        product_id: Id<"products">;
        quantity: number;
        quantity_basis: string;
        direction: string;
        unit_id?: Id<"units_of_measure">;
        application_rate?: string;
        application_method?: string;
        is_required: boolean;
        alternative_product_ids?: Id<"products">[];
        sequence: number;
        notes?: string;
      }>
    >();
    for (const t of applicableTemplates) {
      const resources = await ctx.db
        .query("activity_template_resources")
        .withIndex("by_template", (q) => q.eq("template_id", t._id))
        .collect();
      if (resources.length > 0) {
        templateResourcesCache.set(t._id, resources);
      }
    }

    // Build dependency map (template_id → last scheduled date)
    const dependencyMap = new Map<string, number>();

    const now = Date.now();
    let totalGenerated = 0;
    const byPhase: Record<string, number> = {};

    const phases = schedule.planned_phases as Array<{
      phase: string;
      duration_days: number;
      start_day: number;
      end_day: number;
    }>;

    // Sort templates: those without dependencies first
    const sortedTemplates = [...applicableTemplates].sort((a, b) => {
      if (a.depends_on_template_id && !b.depends_on_template_id) return 1;
      if (!a.depends_on_template_id && b.depends_on_template_id) return -1;
      return a.sort_order - b.sort_order;
    });

    for (const template of sortedTemplates) {
      for (const phase of phases) {
        // Check if this template applies to this phase
        if (!template.applicable_phases.includes(phase.phase)) continue;

        // Determine the day range within this phase
        let dayStart = template.phase_day_start ?? 0;
        let dayEnd = template.phase_day_end ?? phase.duration_days;

        // Clamp to phase bounds
        dayStart = Math.max(0, Math.min(dayStart, phase.duration_days));
        dayEnd = Math.max(dayStart, Math.min(dayEnd, phase.duration_days));

        const rangeDays = dayEnd - dayStart;
        if (rangeDays <= 0) continue;

        // Check dependency
        let dependencyOffset = 0;
        if (template.depends_on_template_id) {
          const lastDepDate = dependencyMap.get(template.depends_on_template_id);
          if (lastDepDate) {
            const minDays = template.min_days_after_dependency ?? 0;
            const minDate = lastDepDate + minDays * 24 * 60 * 60 * 1000;
            const phaseStartDate =
              schedule.planned_start_date +
              phase.start_day * 24 * 60 * 60 * 1000;
            if (minDate > phaseStartDate) {
              dependencyOffset = Math.ceil(
                (minDate - phaseStartDate) / (24 * 60 * 60 * 1000)
              );
            }
          }
        }

        // Generate activities based on frequency
        const generatedDays = calculateScheduledDays(
          template.frequency_type,
          dayStart + dependencyOffset,
          dayEnd,
          template.frequency_interval_days ?? undefined,
          template.repeat_count ?? undefined
        );

        const recurrenceTotal = generatedDays.length;

        for (let idx = 0; idx < generatedDays.length; idx++) {
          const phaseDay = generatedDays[idx];
          const absoluteDay = phase.start_day + phaseDay;
          const scheduledDate =
            schedule.planned_start_date + absoluteDay * 24 * 60 * 60 * 1000;

          const scheduledActivityId = await ctx.db.insert("scheduled_activities", {
            // Legacy fields (required)
            entity_type: "batch",
            entity_id: schedule.batch_id,
            activity_type: (template.type_id ? activityTypeCodeMap.get(template.type_id) : undefined) ?? template.name,
            scheduled_date: scheduledDate,
            is_recurring: recurrenceTotal > 1,
            assigned_team: [],
            required_materials: [],
            required_equipment: [],
            status: "pending",
            created_at: now,
            updated_at: now,

            // P2 fields
            schedule_id: scheduleId,
            template_id: template._id,
            type_id: template.type_id,
            company_id: schedule.company_id,
            crop_phase: phase.phase,
            phase_day: phaseDay,
            estimated_duration_minutes: template.estimated_duration_minutes,
            recurrence_index: recurrenceTotal > 1 ? idx + 1 : undefined,
            recurrence_total: recurrenceTotal > 1 ? recurrenceTotal : undefined,
          });

          // ── Materialize template resources ──
          const templateResources = templateResourcesCache.get(template._id);
          if (templateResources) {
            for (const res of templateResources) {
              const { quantity, context } = materializeQuantity(
                res.quantity,
                res.quantity_basis,
                matContext
              );

              await ctx.db.insert("scheduled_activity_resources", {
                scheduled_activity_id: scheduledActivityId,
                template_resource_id: res._id,
                product_id: res.product_id,
                direction: res.direction,
                quantity_basis: res.quantity_basis,
                template_quantity: res.quantity,
                materialized_quantity: quantity ?? undefined,
                materialization_context:
                  Object.keys(context).length > 0 ? context : undefined,
                unit_id: res.unit_id,
                application_rate: res.application_rate,
                application_method: res.application_method,
                is_required: res.is_required,
                alternative_product_ids: res.alternative_product_ids,
                sequence: res.sequence,
                notes: res.notes,
                created_at: now,
              });
            }
          }

          // Track last date for dependency resolution
          dependencyMap.set(template._id, scheduledDate);
          totalGenerated++;
          byPhase[phase.phase] = (byPhase[phase.phase] ?? 0) + 1;
        }
      }
    }

    // Update schedule total
    const keptActivities = existingActivities.filter(
      (a) => a.status === "completed" || a.status === "skipped"
    ).length;

    await ctx.db.patch(scheduleId, {
      total_activities: totalGenerated + keptActivities,
      updated_at: now,
    });

    return { generated: totalGenerated, byPhase };
  },
});

/**
 * Calculate which days within a range an activity should be scheduled.
 */
function calculateScheduledDays(
  frequencyType: string,
  dayStart: number,
  dayEnd: number,
  intervalDays?: number,
  repeatCount?: number
): number[] {
  const days: number[] = [];
  const range = dayEnd - dayStart;

  if (range <= 0) return days;

  switch (frequencyType) {
    case "once":
      days.push(dayStart);
      break;

    case "daily": {
      const maxDays = repeatCount ?? range;
      for (let i = 0; i < maxDays && dayStart + i < dayEnd; i++) {
        days.push(dayStart + i);
      }
      break;
    }

    case "weekly": {
      const weeklyMax = repeatCount ?? Math.ceil(range / 7);
      for (let i = 0; i < weeklyMax && dayStart + i * 7 < dayEnd; i++) {
        days.push(dayStart + i * 7);
      }
      break;
    }

    case "biweekly": {
      const biMax = repeatCount ?? Math.ceil(range / 14);
      for (let i = 0; i < biMax && dayStart + i * 14 < dayEnd; i++) {
        days.push(dayStart + i * 14);
      }
      break;
    }

    case "monthly": {
      const monthlyMax = repeatCount ?? Math.ceil(range / 30);
      for (let i = 0; i < monthlyMax && dayStart + i * 30 < dayEnd; i++) {
        days.push(dayStart + i * 30);
      }
      break;
    }

    case "custom_days": {
      const interval = intervalDays ?? 1;
      const customMax = repeatCount ?? Math.ceil(range / interval);
      for (let i = 0; i < customMax && dayStart + i * interval < dayEnd; i++) {
        days.push(dayStart + i * interval);
      }
      break;
    }

    case "on_demand":
      // On-demand templates don't generate automatic activities
      break;

    default:
      days.push(dayStart);
  }

  return days;
}

// ============================================================================
// SCHEDULED ACTIVITY MANAGEMENT — US-TMPL.5
// ============================================================================

/**
 * Skip a scheduled activity with a reason.
 */
export const skipScheduledActivity = mutation({
  args: {
    scheduledActivityId: v.id("scheduled_activities"),
    reason: v.string(),
  },
  handler: async (ctx, { scheduledActivityId, reason }) => {
    const activity = await ctx.db.get(scheduledActivityId);
    if (!activity) {
      throw new Error(`Actividad programada no encontrada: ${scheduledActivityId}`);
    }

    if (activity.status === "completed") {
      throw new Error("No se puede saltar una actividad ya completada");
    }

    await ctx.db.patch(scheduledActivityId, {
      status: "skipped",
      skipped_reason: reason,
      updated_at: Date.now(),
    });

    // Update schedule progress if linked
    if (activity.schedule_id) {
      const schedule = await ctx.db.get(activity.schedule_id);
      if (schedule) {
        await ctx.db.patch(activity.schedule_id, {
          skipped_activities: schedule.skipped_activities + 1,
          updated_at: Date.now(),
        });
      }
    }

    return scheduledActivityId;
  },
});

/**
 * Reschedule an activity to a new date.
 */
export const rescheduleActivity = mutation({
  args: {
    scheduledActivityId: v.id("scheduled_activities"),
    newDate: v.number(),
  },
  handler: async (ctx, { scheduledActivityId, newDate }) => {
    const activity = await ctx.db.get(scheduledActivityId);
    if (!activity) {
      throw new Error(`Actividad programada no encontrada: ${scheduledActivityId}`);
    }

    if (activity.status === "completed" || activity.status === "skipped") {
      throw new Error("No se puede reprogramar una actividad completada o saltada");
    }

    await ctx.db.patch(scheduledActivityId, {
      scheduled_date: newDate,
      updated_at: Date.now(),
    });

    return scheduledActivityId;
  },
});

/**
 * Get scheduled activities for a specific date and company.
 * Returns enriched data with template, batch, and type info.
 */
export const getScheduledForDate = query({
  args: {
    companyId: v.id("companies"),
    dateStart: v.number(), // start of day timestamp
    dateEnd: v.number(), // end of day timestamp
    status: v.optional(v.string()),
  },
  handler: async (ctx, { companyId, dateStart, dateEnd, status }) => {
    // Query by scheduled_date range
    const allActivities = await ctx.db
      .query("scheduled_activities")
      .withIndex("by_scheduled_date")
      .collect();

    // Filter by date range and company
    let activities = allActivities.filter(
      (a) =>
        a.company_id === companyId &&
        a.scheduled_date >= dateStart &&
        a.scheduled_date < dateEnd
    );

    if (status) {
      activities = activities.filter((a) => a.status === status);
    }

    // Enrich with batch and type info
    const enriched = await Promise.all(
      activities.map(async (a) => {
        const batch = a.entity_type === "batch" && a.entity_id
          ? await ctx.db.get(a.entity_id as Id<"batches">)
          : null;
        const template = a.template_id
          ? await ctx.db.get(a.template_id)
          : null;
        const activityType = a.type_id
          ? await ctx.db.get(a.type_id)
          : null;

        return {
          ...a,
          batchName: batch?.batch_code ?? null,
          templateName: template?.name ?? null,
          activityTypeName: activityType?.name ?? null,
          activityTypeIcon: activityType?.icon ?? null,
          activityTypeColor: activityType?.color ?? null,
        };
      })
    );

    // Sort by scheduled_date ASC, then by priority (if template has it)
    return enriched.sort((a, b) => a.scheduled_date - b.scheduled_date);
  },
});

/**
 * Get overdue activities for a company (scheduled_date < today, status = pending).
 */
export const getOverdue = query({
  args: {
    companyId: v.id("companies"),
    beforeDate: v.number(),
  },
  handler: async (ctx, { companyId, beforeDate }) => {
    const allActivities = await ctx.db
      .query("scheduled_activities")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    const overdue = allActivities.filter(
      (a) =>
        a.company_id === companyId &&
        a.scheduled_date < beforeDate
    );

    // Enrich
    const enriched = await Promise.all(
      overdue.map(async (a) => {
        const batch = a.entity_type === "batch" && a.entity_id
          ? await ctx.db.get(a.entity_id as Id<"batches">)
          : null;
        const template = a.template_id
          ? await ctx.db.get(a.template_id)
          : null;

        return {
          ...a,
          batchName: batch?.batch_code ?? null,
          templateName: template?.name ?? null,
        };
      })
    );

    return enriched.sort((a, b) => a.scheduled_date - b.scheduled_date);
  },
});
