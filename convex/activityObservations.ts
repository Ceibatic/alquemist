/**
 * Activity Observations — CRUD backend
 *
 * Structured monitoring findings (pests, diseases, deficiencies) linked to activities.
 * Supports resolution tracking and stats dashboard.
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
    return await ctx.db
      .query("activity_observations")
      .withIndex("by_activity", (q) => q.eq("activity_id", args.activityId))
      .collect();
  },
});

export const listUnresolved = query({
  args: {
    companyId: v.id("companies"),
    observationType: v.optional(v.string()),
    severity: v.optional(v.string()),
    zoneId: v.optional(v.id("areas")),
  },
  handler: async (ctx, args) => {
    const observations = await ctx.db
      .query("activity_observations")
      .withIndex("by_resolved", (q) =>
        q.eq("company_id", args.companyId).eq("resolved", false)
      )
      .collect();

    let filtered = observations;

    if (args.observationType) {
      filtered = filtered.filter(
        (o) => o.observation_type === args.observationType
      );
    }
    if (args.severity) {
      filtered = filtered.filter((o) => o.severity === args.severity);
    }

    if (args.zoneId) {
      // Look up the activity to check zone
      const activityIds = new Set(filtered.map((o) => o.activity_id));
      const activityZones = new Map<string, string | undefined>();
      for (const actId of activityIds) {
        const act = await ctx.db.get(actId);
        activityZones.set(
          actId as string,
          act?.zone_id as string | undefined
        );
      }
      filtered = filtered.filter(
        (o) => activityZones.get(o.activity_id as string) === (args.zoneId as string)
      );
    }

    return filtered;
  },
});

export const listByOrganism = query({
  args: {
    companyId: v.id("companies"),
    organismId: v.id("pest_diseases"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("activity_observations")
      .withIndex("by_organism", (q) =>
        q.eq("company_id", args.companyId).eq("organism_id", args.organismId)
      )
      .collect();
  },
});

export const getStats = query({
  args: {
    companyId: v.id("companies"),
    dateFrom: v.optional(v.number()),
    dateTo: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const unresolved = await ctx.db
      .query("activity_observations")
      .withIndex("by_resolved", (q) =>
        q.eq("company_id", args.companyId).eq("resolved", false)
      )
      .collect();

    // Filter by date range if provided
    let active = unresolved;
    if (args.dateFrom || args.dateTo) {
      active = active.filter((o) => {
        if (args.dateFrom && o.created_at < args.dateFrom) return false;
        if (args.dateTo && o.created_at > args.dateTo) return false;
        return true;
      });
    }

    const now = Date.now();

    // By type
    const byType: Record<string, number> = {};
    for (const o of active) {
      byType[o.observation_type] = (byType[o.observation_type] || 0) + 1;
    }

    // By severity
    const bySeverity: Record<string, number> = {};
    for (const o of active) {
      const sev = o.severity || "unspecified";
      bySeverity[sev] = (bySeverity[sev] || 0) + 1;
    }

    // Overdue: follow_up_date < now and still unresolved
    const overdue = active.filter(
      (o) => o.follow_up_date != null && o.follow_up_date < now
    ).length;

    return {
      total_active: active.length,
      by_type: byType,
      by_severity: bySeverity,
      overdue,
    };
  },
});

export const countUnresolvedByBatch = query({
  args: { batchId: v.id("batches") },
  handler: async (ctx, args) => {
    // Get activities for this batch
    const activities = await ctx.db
      .query("activities")
      .withIndex("by_batch_id", (q) => q.eq("batch_id", args.batchId))
      .collect();

    let count = 0;
    for (const act of activities) {
      const obs = await ctx.db
        .query("activity_observations")
        .withIndex("by_activity", (q) => q.eq("activity_id", act._id))
        .collect();
      count += obs.filter((o) => !o.resolved).length;
    }

    return count;
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

export const create = mutation({
  args: {
    activityId: v.id("activities"),
    observationType: v.string(),
    severity: v.optional(v.string()),
    organismId: v.optional(v.id("pest_diseases")),
    organismName: v.optional(v.string()),
    affectedAreaPct: v.optional(v.number()),
    affectedPlantCount: v.optional(v.number()),
    plantPart: v.optional(v.string()),
    description: v.string(),
    recommendedAction: v.optional(v.string()),
    followUpDate: v.optional(v.number()),
    attachmentIds: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Get company_id from the activity
    const activity = await ctx.db.get(args.activityId);
    if (!activity) throw new Error("Activity not found");
    const companyId = activity.company_id;
    if (!companyId) throw new Error("Activity has no company_id");

    return await ctx.db.insert("activity_observations", {
      activity_id: args.activityId,
      company_id: companyId,
      observation_type: args.observationType,
      severity: args.severity,
      organism_id: args.organismId,
      organism_name: args.organismName,
      affected_area_pct: args.affectedAreaPct,
      affected_plant_count: args.affectedPlantCount,
      plant_part: args.plantPart,
      description: args.description,
      recommended_action: args.recommendedAction,
      follow_up_date: args.followUpDate,
      resolved: false,
      attachment_ids: args.attachmentIds,
      created_at: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    observationId: v.id("activity_observations"),
    observationType: v.optional(v.string()),
    severity: v.optional(v.string()),
    organismId: v.optional(v.id("pest_diseases")),
    organismName: v.optional(v.string()),
    affectedAreaPct: v.optional(v.number()),
    affectedPlantCount: v.optional(v.number()),
    plantPart: v.optional(v.string()),
    description: v.optional(v.string()),
    recommendedAction: v.optional(v.string()),
    followUpDate: v.optional(v.number()),
    attachmentIds: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const { observationId, ...fields } = args;
    const existing = await ctx.db.get(observationId);
    if (!existing) throw new Error("Observation not found");

    const patch: Record<string, unknown> = {};
    if (fields.observationType !== undefined)
      patch.observation_type = fields.observationType;
    if (fields.severity !== undefined) patch.severity = fields.severity;
    if (fields.organismId !== undefined) patch.organism_id = fields.organismId;
    if (fields.organismName !== undefined)
      patch.organism_name = fields.organismName;
    if (fields.affectedAreaPct !== undefined)
      patch.affected_area_pct = fields.affectedAreaPct;
    if (fields.affectedPlantCount !== undefined)
      patch.affected_plant_count = fields.affectedPlantCount;
    if (fields.plantPart !== undefined) patch.plant_part = fields.plantPart;
    if (fields.description !== undefined)
      patch.description = fields.description;
    if (fields.recommendedAction !== undefined)
      patch.recommended_action = fields.recommendedAction;
    if (fields.followUpDate !== undefined)
      patch.follow_up_date = fields.followUpDate;
    if (fields.attachmentIds !== undefined)
      patch.attachment_ids = fields.attachmentIds;

    await ctx.db.patch(observationId, patch);
  },
});

export const resolve = mutation({
  args: {
    observationId: v.id("activity_observations"),
    resolvedByActivityId: v.optional(v.id("activities")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db.get(args.observationId);
    if (!existing) throw new Error("Observation not found");

    await ctx.db.patch(args.observationId, {
      resolved: true,
      resolved_at: Date.now(),
      resolved_by: userId,
      resolved_by_activity_id: args.resolvedByActivityId,
    });
  },
});

export const reopen = mutation({
  args: {
    observationId: v.id("activity_observations"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db.get(args.observationId);
    if (!existing) throw new Error("Observation not found");

    await ctx.db.patch(args.observationId, {
      resolved: false,
      resolved_at: undefined,
      resolved_by: undefined,
      resolved_by_activity_id: undefined,
    });
  },
});
