import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// ============================================================================
// MUTATIONS — Manual scheduling
// ============================================================================

/**
 * Create manually scheduled activities for one or more batches.
 *
 * Single batch: creates 1 scheduled_activity with source "manual".
 * Multi-batch: generates a shared group_id (UUID), creates N rows (1 per batch).
 */
export const createManual = mutation({
  args: {
    companyId: v.id("companies"),
    typeId: v.id("activity_types"),
    templateId: v.optional(v.id("activity_templates")),
    batchIds: v.array(v.id("batches")),
    scheduledDate: v.number(),
    estimatedDurationMinutes: v.optional(v.number()),
    assignedTo: v.optional(v.id("users")),
    instructions: v.optional(v.string()),
    priority: v.optional(v.string()), // routine/urgent/critical
  },
  handler: async (ctx, args) => {
    if (args.batchIds.length === 0) {
      throw new Error("Se requiere al menos un lote");
    }

    const now = Date.now();

    // Validate activity type exists
    const activityType = await ctx.db.get(args.typeId);
    if (!activityType) {
      throw new Error("Tipo de actividad no encontrado");
    }

    // Validate all batches exist and belong to same company
    for (const batchId of args.batchIds) {
      const batch = await ctx.db.get(batchId);
      if (!batch) {
        throw new Error(`Lote no encontrado: ${batchId}`);
      }
      if (batch.company_id !== args.companyId) {
        throw new Error(`Lote ${batchId} no pertenece a la empresa`);
      }
    }

    // Load template data if provided
    let templateName: string | undefined;
    let templateDuration: number | undefined;
    let templateDescription: string | undefined;
    if (args.templateId) {
      const template = await ctx.db.get(args.templateId);
      if (template) {
        templateName = template.name;
        templateDuration = template.estimated_duration_minutes;
        templateDescription = template.description;
      }
    }

    const isMultiBatch = args.batchIds.length > 1;
    const groupId = isMultiBatch ? crypto.randomUUID() : undefined;

    const createdIds: Id<"scheduled_activities">[] = [];

    for (const batchId of args.batchIds) {
      const batch = await ctx.db.get(batchId);

      const id = await ctx.db.insert("scheduled_activities", {
        entity_type: "batch",
        entity_id: batchId,
        activity_type: templateName ?? activityType.name,
        scheduled_date: args.scheduledDate,
        estimated_duration_minutes:
          args.estimatedDurationMinutes ?? templateDuration,
        is_recurring: false,
        assigned_to: args.assignedTo,
        assigned_team: [],
        required_materials: [],
        required_equipment: [],
        instructions: args.instructions ?? templateDescription,
        status: "pending",
        created_at: now,
        updated_at: now,

        // P2 fields
        type_id: args.typeId,
        template_id: args.templateId,
        company_id: args.companyId,
        crop_phase: batch?.current_phase,

        // Multi-batch + source
        group_id: groupId,
        source: "manual",
      });

      createdIds.push(id);
    }

    return { createdIds, groupId };
  },
});

// ============================================================================
// QUERIES
// ============================================================================

/**
 * List scheduled activities for a specific entity, optionally filtered by status.
 */
export const listByEntity = query({
  args: {
    entityType: v.string(),
    entityId: v.string(),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let items = await ctx.db
      .query("scheduled_activities")
      .withIndex("by_entity", (q) =>
        q.eq("entity_type", args.entityType).eq("entity_id", args.entityId)
      )
      .collect();

    if (args.status) {
      items = items.filter((item) => item.status === args.status);
    }

    return items.sort((a, b) => a.scheduled_date - b.scheduled_date);
  },
});

/**
 * Get all scheduled activities sharing a group_id (multi-batch group).
 */
export const getGroup = query({
  args: {
    groupId: v.string(),
  },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("scheduled_activities")
      .withIndex("by_group", (q) => q.eq("group_id", args.groupId))
      .collect();

    return items.sort((a, b) => a.scheduled_date - b.scheduled_date);
  },
});
