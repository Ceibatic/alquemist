/**
 * Template Phases Queries and Mutations
 * Manage phases within production templates
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Get phases for a template
 */
export const getByTemplate = query({
  args: {
    templateId: v.id("production_templates"),
  },
  handler: async (ctx, args) => {
    const phases = await ctx.db
      .query("template_phases")
      .withIndex("by_template", (q) => q.eq("template_id", args.templateId))
      .collect();

    // Sort by phase_order
    const sortedPhases = phases.sort((a, b) => a.phase_order - b.phase_order);

    // Get activity count for each phase
    const phasesWithCounts = await Promise.all(
      sortedPhases.map(async (phase) => {
        const activities = await ctx.db
          .query("template_activities")
          .withIndex("by_phase", (q) => q.eq("phase_id", phase._id))
          .collect();

        return {
          ...phase,
          activitiesCount: activities.length,
        };
      })
    );

    return phasesWithCounts;
  },
});

/**
 * Get single phase by ID
 */
export const getById = query({
  args: {
    phaseId: v.id("template_phases"),
  },
  handler: async (ctx, args) => {
    const phase = await ctx.db.get(args.phaseId);
    if (!phase) {
      return null;
    }

    // Get activities
    const activities = await ctx.db
      .query("template_activities")
      .withIndex("by_phase", (q) => q.eq("phase_id", args.phaseId))
      .collect();

    const sortedActivities = activities.sort(
      (a, b) => a.activity_order - b.activity_order
    );

    return {
      ...phase,
      activities: sortedActivities,
    };
  },
});

/**
 * Create a new phase
 */
export const create = mutation({
  args: {
    templateId: v.id("production_templates"),
    phaseName: v.string(),
    estimatedDurationDays: v.number(),
    areaType: v.string(),
    previousPhaseId: v.optional(v.id("template_phases")),
    requiredConditions: v.optional(v.any()),
    completionCriteria: v.optional(v.any()),
    requiredEquipment: v.optional(v.array(v.any())),
    requiredMaterials: v.optional(v.array(v.any())),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Verify template exists
    const template = await ctx.db.get(args.templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    // Get existing phases to determine order
    const existingPhases = await ctx.db
      .query("template_phases")
      .withIndex("by_template", (q) => q.eq("template_id", args.templateId))
      .collect();

    const maxOrder = existingPhases.reduce(
      (max, p) => Math.max(max, p.phase_order),
      0
    );

    // Validate previous phase if provided
    if (args.previousPhaseId) {
      const previousPhase = await ctx.db.get(args.previousPhaseId);
      if (!previousPhase) {
        throw new Error("Previous phase not found");
      }
      if (previousPhase.template_id !== args.templateId) {
        throw new Error("Previous phase belongs to a different template");
      }
    }

    const phaseId = await ctx.db.insert("template_phases", {
      template_id: args.templateId,
      phase_name: args.phaseName,
      phase_order: maxOrder + 1,
      estimated_duration_days: args.estimatedDurationDays,
      area_type: args.areaType,
      previous_phase_id: args.previousPhaseId,
      required_conditions: args.requiredConditions || {},
      completion_criteria: args.completionCriteria || {},
      required_equipment: args.requiredEquipment || [],
      required_materials: args.requiredMaterials || [],
      description: args.description,
      created_at: now,
    });

    // Update template's estimated duration
    await updateTemplateDuration(ctx, args.templateId);

    return phaseId;
  },
});

/**
 * Update a phase
 */
export const update = mutation({
  args: {
    phaseId: v.id("template_phases"),
    phaseName: v.optional(v.string()),
    estimatedDurationDays: v.optional(v.number()),
    areaType: v.optional(v.string()),
    previousPhaseId: v.optional(v.id("template_phases")),
    requiredConditions: v.optional(v.any()),
    completionCriteria: v.optional(v.any()),
    requiredEquipment: v.optional(v.array(v.any())),
    requiredMaterials: v.optional(v.array(v.any())),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const phase = await ctx.db.get(args.phaseId);
    if (!phase) {
      throw new Error("Phase not found");
    }

    const updates: Record<string, unknown> = {};

    if (args.phaseName !== undefined) updates.phase_name = args.phaseName;
    if (args.estimatedDurationDays !== undefined)
      updates.estimated_duration_days = args.estimatedDurationDays;
    if (args.areaType !== undefined) updates.area_type = args.areaType;
    if (args.previousPhaseId !== undefined)
      updates.previous_phase_id = args.previousPhaseId;
    if (args.requiredConditions !== undefined)
      updates.required_conditions = args.requiredConditions;
    if (args.completionCriteria !== undefined)
      updates.completion_criteria = args.completionCriteria;
    if (args.requiredEquipment !== undefined)
      updates.required_equipment = args.requiredEquipment;
    if (args.requiredMaterials !== undefined)
      updates.required_materials = args.requiredMaterials;
    if (args.description !== undefined) updates.description = args.description;

    await ctx.db.patch(args.phaseId, updates);

    // Update template duration if days changed
    if (args.estimatedDurationDays !== undefined) {
      await updateTemplateDuration(ctx, phase.template_id);
    }

    return {
      success: true,
      message: "Phase updated successfully",
    };
  },
});

/**
 * Remove a phase and its activities
 */
export const remove = mutation({
  args: {
    phaseId: v.id("template_phases"),
  },
  handler: async (ctx, args) => {
    const phase = await ctx.db.get(args.phaseId);
    if (!phase) {
      throw new Error("Phase not found");
    }

    // Delete all activities in this phase
    const activities = await ctx.db
      .query("template_activities")
      .withIndex("by_phase", (q) => q.eq("phase_id", args.phaseId))
      .collect();

    for (const activity of activities) {
      await ctx.db.delete(activity._id);
    }

    // Update phases that reference this one as previous
    const referencingPhases = await ctx.db
      .query("template_phases")
      .withIndex("by_template", (q) => q.eq("template_id", phase.template_id))
      .collect();

    for (const p of referencingPhases) {
      if (p.previous_phase_id === args.phaseId) {
        await ctx.db.patch(p._id, {
          previous_phase_id: phase.previous_phase_id, // Point to this phase's previous
        });
      }
    }

    // Delete the phase
    await ctx.db.delete(args.phaseId);

    // Reorder remaining phases
    await reorderPhases(ctx, phase.template_id);

    // Update template duration
    await updateTemplateDuration(ctx, phase.template_id);

    return {
      success: true,
      message: "Phase deleted successfully",
    };
  },
});

/**
 * Reorder phases
 */
export const reorder = mutation({
  args: {
    templateId: v.id("production_templates"),
    phaseIds: v.array(v.id("template_phases")),
  },
  handler: async (ctx, args) => {
    // Verify all phases belong to the template
    for (let i = 0; i < args.phaseIds.length; i++) {
      const phase = await ctx.db.get(args.phaseIds[i]);
      if (!phase) {
        throw new Error(`Phase ${args.phaseIds[i]} not found`);
      }
      if (phase.template_id !== args.templateId) {
        throw new Error(`Phase ${args.phaseIds[i]} does not belong to this template`);
      }

      // Update order
      await ctx.db.patch(args.phaseIds[i], {
        phase_order: i + 1,
        previous_phase_id: i > 0 ? args.phaseIds[i - 1] : undefined,
      });
    }

    return {
      success: true,
      message: "Phases reordered successfully",
    };
  },
});

// Helper function to update template's total duration
async function updateTemplateDuration(
  ctx: any,
  templateId: Id<"production_templates">
) {
  const phases = await ctx.db
    .query("template_phases")
    .withIndex("by_template", (q: any) => q.eq("template_id", templateId))
    .collect();

  const totalDays = phases.reduce(
    (sum: number, p: any) => sum + p.estimated_duration_days,
    0
  );

  await ctx.db.patch(templateId, {
    estimated_duration_days: totalDays,
    updated_at: Date.now(),
  });
}

// Helper function to reorder phases after deletion
async function reorderPhases(ctx: any, templateId: Id<"production_templates">) {
  const phases = await ctx.db
    .query("template_phases")
    .withIndex("by_template", (q: any) => q.eq("template_id", templateId))
    .collect();

  const sortedPhases = phases.sort(
    (a: any, b: any) => a.phase_order - b.phase_order
  );

  for (let i = 0; i < sortedPhases.length; i++) {
    if (sortedPhases[i].phase_order !== i + 1) {
      await ctx.db.patch(sortedPhases[i]._id, {
        phase_order: i + 1,
      });
    }
  }
}
