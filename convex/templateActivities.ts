/**
 * Template Activities Queries and Mutations
 * Manage activities within template phases
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Get activities for a phase
 */
export const getByPhase = query({
  args: {
    phaseId: v.id("template_phases"),
  },
  handler: async (ctx, args) => {
    const activities = await ctx.db
      .query("template_activities")
      .withIndex("by_phase", (q) => q.eq("phase_id", args.phaseId))
      .collect();

    // Sort by activity_order
    return activities.sort((a, b) => a.activity_order - b.activity_order);
  },
});

/**
 * Get single activity by ID
 */
export const getById = query({
  args: {
    activityId: v.id("template_activities"),
  },
  handler: async (ctx, args) => {
    const activity = await ctx.db.get(args.activityId);
    if (!activity) {
      return null;
    }

    // Get quality check template if linked
    const qcTemplate = activity.quality_check_template_id
      ? await ctx.db.get(activity.quality_check_template_id)
      : null;

    return {
      ...activity,
      qualityCheckTemplateName: qcTemplate?.name || null,
    };
  },
});

/**
 * Create a new activity
 */
export const create = mutation({
  args: {
    phaseId: v.id("template_phases"),
    activityName: v.string(),
    activityType: v.string(),
    isRecurring: v.optional(v.boolean()),
    isQualityCheck: v.optional(v.boolean()),
    timingConfiguration: v.optional(v.any()),
    requiredMaterials: v.optional(v.array(v.any())),
    estimatedDurationMinutes: v.optional(v.number()),
    skillLevelRequired: v.optional(v.string()),
    qualityCheckTemplateId: v.optional(v.id("quality_check_templates")),
    instructions: v.optional(v.string()),
    safetyNotes: v.optional(v.string()),
    phaseRole: v.optional(v.union(v.literal("entry"), v.literal("exit"))),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Verify phase exists
    const phase = await ctx.db.get(args.phaseId);
    if (!phase) {
      throw new Error("Phase not found");
    }

    // Get existing activities to determine order
    const existingActivities = await ctx.db
      .query("template_activities")
      .withIndex("by_phase", (q) => q.eq("phase_id", args.phaseId))
      .collect();

    const maxOrder = existingActivities.reduce(
      (max, a) => Math.max(max, a.activity_order),
      0
    );

    // Validate max 1 entry and 1 exit per phase
    if (args.phaseRole) {
      const existing = existingActivities.find((a) => a.phase_role === args.phaseRole);
      if (existing) {
        throw new Error(
          `Ya existe una actividad de ${args.phaseRole === "entry" ? "entrada" : "salida"} para esta fase: "${existing.activity_name}"`
        );
      }
    }

    // Validate quality check template if provided
    if (args.qualityCheckTemplateId) {
      const qcTemplate = await ctx.db.get(args.qualityCheckTemplateId);
      if (!qcTemplate) {
        throw new Error("Quality check template not found");
      }
    }

    const activityId = await ctx.db.insert("template_activities", {
      phase_id: args.phaseId,
      activity_name: args.activityName,
      activity_order: maxOrder + 1,
      activity_type: args.activityType,
      is_recurring: args.isRecurring || false,
      is_quality_check: args.isQualityCheck || false,
      timing_configuration: args.timingConfiguration || {
        days_from_phase_start: 0,
        time_of_day: "08:00",
      },
      required_materials: args.requiredMaterials || [],
      estimated_duration_minutes: args.estimatedDurationMinutes,
      skill_level_required: args.skillLevelRequired,
      quality_check_template_id: args.qualityCheckTemplateId,
      instructions: args.instructions,
      safety_notes: args.safetyNotes,
      phase_role: args.phaseRole,
      created_at: now,
    });

    return activityId;
  },
});

/**
 * Create a template activity pre-filled from an activity template.
 * Copies data from the activity template and stores the reference for traceability.
 */
export const createFromActivityTemplate = mutation({
  args: {
    phaseId: v.id("template_phases"),
    activityTemplateId: v.id("activity_templates"),
    // Day within the phase where the activity starts (1-based)
    startDay: v.optional(v.number()),
    // Optional overrides (user may edit pre-filled values before saving)
    activityName: v.optional(v.string()),
    activityType: v.optional(v.string()),
    estimatedDurationMinutes: v.optional(v.number()),
    isRecurring: v.optional(v.boolean()),
    isQualityCheck: v.optional(v.boolean()),
    instructions: v.optional(v.string()),
    safetyNotes: v.optional(v.string()),
    phaseRole: v.optional(v.union(v.literal("entry"), v.literal("exit"))),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const phase = await ctx.db.get(args.phaseId);
    if (!phase) {
      throw new Error("Phase not found");
    }

    const activityTemplate = await ctx.db.get(args.activityTemplateId);
    if (!activityTemplate) {
      throw new Error("Activity template not found");
    }

    // Resolve activity type code from activity_types table
    const activityTypeRecord = await ctx.db.get(activityTemplate.type_id);
    const resolvedActivityType = activityTypeRecord?.code ?? "inspection";

    // Derive is_recurring from frequency_type
    const isRecurringFromTemplate =
      activityTemplate.frequency_type !== "once" &&
      activityTemplate.frequency_type !== "on_demand";

    // Derive is_quality_check from quality_check_template_id
    const isQCFromTemplate = !!activityTemplate.quality_check_template_id;

    // Determine next activity_order
    const existingActivities = await ctx.db
      .query("template_activities")
      .withIndex("by_phase", (q) => q.eq("phase_id", args.phaseId))
      .collect();

    const maxOrder = existingActivities.reduce(
      (max, a) => Math.max(max, a.activity_order),
      0
    );

    // Validate max 1 entry and 1 exit per phase
    if (args.phaseRole) {
      const existing = existingActivities.find((a) => a.phase_role === args.phaseRole);
      if (existing) {
        throw new Error(
          `Ya existe una actividad de ${args.phaseRole === "entry" ? "entrada" : "salida"} para esta fase: "${existing.activity_name}"`
        );
      }
    }

    // Use startDay if provided, otherwise fall back to template's phase_day_start
    const daysFromStart = args.startDay != null
      ? args.startDay - 1  // Convert 1-based day to 0-based offset
      : (activityTemplate.phase_day_start ?? 0);

    const activityId = await ctx.db.insert("template_activities", {
      phase_id: args.phaseId,
      activity_name: args.activityName ?? activityTemplate.name,
      activity_order: maxOrder + 1,
      activity_type: args.activityType ?? resolvedActivityType,
      type_id: activityTemplate.type_id,
      is_recurring: args.isRecurring ?? isRecurringFromTemplate,
      is_quality_check: args.isQualityCheck ?? isQCFromTemplate,
      timing_configuration: {
        days_from_phase_start: daysFromStart,
        time_of_day: "08:00",
      },
      required_materials: [],
      estimated_duration_minutes:
        args.estimatedDurationMinutes ??
        activityTemplate.estimated_duration_minutes,
      quality_check_template_id: activityTemplate.quality_check_template_id,
      instructions: args.instructions ?? activityTemplate.description,
      safety_notes: args.safetyNotes,
      activity_template_id: args.activityTemplateId,
      phase_role: args.phaseRole,
      created_at: now,
    });

    return activityId;
  },
});

/**
 * Update an activity
 */
export const update = mutation({
  args: {
    activityId: v.id("template_activities"),
    activityName: v.optional(v.string()),
    activityType: v.optional(v.string()),
    isRecurring: v.optional(v.boolean()),
    isQualityCheck: v.optional(v.boolean()),
    timingConfiguration: v.optional(v.any()),
    requiredMaterials: v.optional(v.array(v.any())),
    estimatedDurationMinutes: v.optional(v.number()),
    skillLevelRequired: v.optional(v.string()),
    qualityCheckTemplateId: v.optional(v.id("quality_check_templates")),
    instructions: v.optional(v.string()),
    safetyNotes: v.optional(v.string()),
    phaseRole: v.optional(v.union(v.literal("entry"), v.literal("exit"), v.literal("none"))),
  },
  handler: async (ctx, args) => {
    const activity = await ctx.db.get(args.activityId);
    if (!activity) {
      throw new Error("Activity not found");
    }

    // Validate max 1 entry and 1 exit per phase when setting phase_role
    if (args.phaseRole && args.phaseRole !== "none") {
      const phaseActivities = await ctx.db
        .query("template_activities")
        .withIndex("by_phase", (q) => q.eq("phase_id", activity.phase_id))
        .collect();
      const existing = phaseActivities.find(
        (a) => a._id !== args.activityId && a.phase_role === args.phaseRole
      );
      if (existing) {
        throw new Error(
          `Ya existe una actividad de ${args.phaseRole === "entry" ? "entrada" : "salida"} para esta fase: "${existing.activity_name}"`
        );
      }
    }

    // Validate quality check template if provided
    if (args.qualityCheckTemplateId) {
      const qcTemplate = await ctx.db.get(args.qualityCheckTemplateId);
      if (!qcTemplate) {
        throw new Error("Quality check template not found");
      }
    }

    const updates: Record<string, unknown> = {};

    if (args.activityName !== undefined)
      updates.activity_name = args.activityName;
    if (args.activityType !== undefined)
      updates.activity_type = args.activityType;
    if (args.isRecurring !== undefined) updates.is_recurring = args.isRecurring;
    if (args.isQualityCheck !== undefined)
      updates.is_quality_check = args.isQualityCheck;
    if (args.timingConfiguration !== undefined)
      updates.timing_configuration = args.timingConfiguration;
    if (args.requiredMaterials !== undefined)
      updates.required_materials = args.requiredMaterials;
    if (args.estimatedDurationMinutes !== undefined)
      updates.estimated_duration_minutes = args.estimatedDurationMinutes;
    if (args.skillLevelRequired !== undefined)
      updates.skill_level_required = args.skillLevelRequired;
    if (args.qualityCheckTemplateId !== undefined)
      updates.quality_check_template_id = args.qualityCheckTemplateId;
    if (args.instructions !== undefined)
      updates.instructions = args.instructions;
    if (args.safetyNotes !== undefined) updates.safety_notes = args.safetyNotes;
    if (args.phaseRole !== undefined)
      updates.phase_role = args.phaseRole === "none" ? undefined : args.phaseRole;

    await ctx.db.patch(args.activityId, updates);

    return {
      success: true,
      message: "Activity updated successfully",
    };
  },
});

/**
 * Remove an activity
 */
export const remove = mutation({
  args: {
    activityId: v.id("template_activities"),
  },
  handler: async (ctx, args) => {
    const activity = await ctx.db.get(args.activityId);
    if (!activity) {
      throw new Error("Activity not found");
    }

    const phaseId = activity.phase_id;

    // Delete the activity
    await ctx.db.delete(args.activityId);

    // Reorder remaining activities
    await reorderActivities(ctx, phaseId);

    return {
      success: true,
      message: "Activity deleted successfully",
    };
  },
});

/**
 * Reorder activities within a phase
 */
export const reorder = mutation({
  args: {
    phaseId: v.id("template_phases"),
    activityIds: v.array(v.id("template_activities")),
  },
  handler: async (ctx, args) => {
    // Verify all activities belong to the phase
    for (let i = 0; i < args.activityIds.length; i++) {
      const activity = await ctx.db.get(args.activityIds[i]);
      if (!activity) {
        throw new Error(`Activity ${args.activityIds[i]} not found`);
      }
      if (activity.phase_id !== args.phaseId) {
        throw new Error(
          `Activity ${args.activityIds[i]} does not belong to this phase`
        );
      }

      // Update order
      await ctx.db.patch(args.activityIds[i], {
        activity_order: i + 1,
      });
    }

    return {
      success: true,
      message: "Activities reordered successfully",
    };
  },
});

/**
 * Move activity to a different phase
 */
export const moveToPhase = mutation({
  args: {
    activityId: v.id("template_activities"),
    newPhaseId: v.id("template_phases"),
    newOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const activity = await ctx.db.get(args.activityId);
    if (!activity) {
      throw new Error("Activity not found");
    }

    const newPhase = await ctx.db.get(args.newPhaseId);
    if (!newPhase) {
      throw new Error("Target phase not found");
    }

    const oldPhaseId = activity.phase_id;

    // Determine new order
    let newOrder = args.newOrder;
    if (newOrder === undefined) {
      const existingActivities = await ctx.db
        .query("template_activities")
        .withIndex("by_phase", (q) => q.eq("phase_id", args.newPhaseId))
        .collect();

      newOrder =
        existingActivities.reduce(
          (max, a) => Math.max(max, a.activity_order),
          0
        ) + 1;
    }

    // Update activity
    await ctx.db.patch(args.activityId, {
      phase_id: args.newPhaseId,
      activity_order: newOrder,
    });

    // Reorder activities in old phase
    await reorderActivities(ctx, oldPhaseId);

    return {
      success: true,
      message: "Activity moved successfully",
    };
  },
});

/**
 * Duplicate an activity
 */
export const duplicate = mutation({
  args: {
    activityId: v.id("template_activities"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const activity = await ctx.db.get(args.activityId);
    if (!activity) {
      throw new Error("Activity not found");
    }

    // Get max order for the phase
    const existingActivities = await ctx.db
      .query("template_activities")
      .withIndex("by_phase", (q) => q.eq("phase_id", activity.phase_id))
      .collect();

    const maxOrder = existingActivities.reduce(
      (max, a) => Math.max(max, a.activity_order),
      0
    );

    const newActivityId = await ctx.db.insert("template_activities", {
      phase_id: activity.phase_id,
      activity_name: `${activity.activity_name} (copia)`,
      activity_order: maxOrder + 1,
      activity_type: activity.activity_type,
      type_id: activity.type_id,
      is_recurring: activity.is_recurring,
      is_quality_check: activity.is_quality_check,
      timing_configuration: activity.timing_configuration,
      required_materials: activity.required_materials,
      estimated_duration_minutes: activity.estimated_duration_minutes,
      skill_level_required: activity.skill_level_required,
      quality_check_template_id: activity.quality_check_template_id,
      instructions: activity.instructions,
      safety_notes: activity.safety_notes,
      created_at: now,
    });

    return newActivityId;
  },
});

// Helper function to reorder activities after deletion
async function reorderActivities(ctx: any, phaseId: any) {
  const activities = await ctx.db
    .query("template_activities")
    .withIndex("by_phase", (q: any) => q.eq("phase_id", phaseId))
    .collect();

  const sortedActivities = activities.sort(
    (a: any, b: any) => a.activity_order - b.activity_order
  );

  for (let i = 0; i < sortedActivities.length; i++) {
    if (sortedActivities[i].activity_order !== i + 1) {
      await ctx.db.patch(sortedActivities[i]._id, {
        activity_order: i + 1,
      });
    }
  }
}
