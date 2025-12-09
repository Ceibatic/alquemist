/**
 * Production Templates Queries and Mutations
 * Templates for production workflows with phases and activities
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * List production templates for a company
 */
export const list = query({
  args: {
    companyId: v.id("companies"),
    cropTypeId: v.optional(v.id("crop_types")),
    status: v.optional(v.string()),
    includePublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Get company templates
    let templates = await ctx.db
      .query("production_templates")
      .withIndex("by_company", (q) => q.eq("company_id", args.companyId))
      .collect();

    // Optionally include public templates from other companies
    if (args.includePublic) {
      const publicTemplates = await ctx.db
        .query("production_templates")
        .withIndex("by_is_public", (q) => q.eq("is_public", true))
        .collect();

      // Filter out own templates (already included)
      const otherPublicTemplates = publicTemplates.filter(
        (t) => t.company_id !== args.companyId
      );
      templates = [...templates, ...otherPublicTemplates];
    }

    // Apply filters
    if (args.cropTypeId) {
      templates = templates.filter((t) => t.crop_type_id === args.cropTypeId);
    }

    if (args.status) {
      templates = templates.filter((t) => t.status === args.status);
    }

    // Enrich with crop type and cultivar names
    const enrichedTemplates = await Promise.all(
      templates.map(async (template) => {
        const cropType = await ctx.db.get(template.crop_type_id);
        const cultivar = template.cultivar_id
          ? await ctx.db.get(template.cultivar_id)
          : null;

        // Count phases
        const phases = await ctx.db
          .query("template_phases")
          .withIndex("by_template", (q) => q.eq("template_id", template._id))
          .collect();

        return {
          ...template,
          cropTypeName: cropType?.name || null,
          cultivarName: cultivar?.name || null,
          phasesCount: phases.length,
        };
      })
    );

    return enrichedTemplates;
  },
});

/**
 * Get template by ID with phases and activities
 */
export const getById = query({
  args: {
    templateId: v.id("production_templates"),
  },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.templateId);
    if (!template) {
      return null;
    }

    // Get crop type and cultivar
    const cropType = await ctx.db.get(template.crop_type_id);
    const cultivar = template.cultivar_id
      ? await ctx.db.get(template.cultivar_id)
      : null;

    // Get phases ordered by phase_order
    const phases = await ctx.db
      .query("template_phases")
      .withIndex("by_template", (q) => q.eq("template_id", args.templateId))
      .collect();

    const sortedPhases = phases.sort((a, b) => a.phase_order - b.phase_order);

    // Get activities for each phase
    const phasesWithActivities = await Promise.all(
      sortedPhases.map(async (phase) => {
        const activities = await ctx.db
          .query("template_activities")
          .withIndex("by_phase", (q) => q.eq("phase_id", phase._id))
          .collect();

        const sortedActivities = activities.sort(
          (a, b) => a.activity_order - b.activity_order
        );

        return {
          ...phase,
          activities: sortedActivities,
        };
      })
    );

    return {
      ...template,
      cropTypeName: cropType?.name || null,
      cultivarName: cultivar?.name || null,
      phases: phasesWithActivities,
    };
  },
});

/**
 * Get public templates (from all companies)
 */
export const getPublicTemplates = query({
  args: {
    cropTypeId: v.optional(v.id("crop_types")),
  },
  handler: async (ctx, args) => {
    let templates = await ctx.db
      .query("production_templates")
      .withIndex("by_is_public", (q) => q.eq("is_public", true))
      .collect();

    if (args.cropTypeId) {
      templates = templates.filter((t) => t.crop_type_id === args.cropTypeId);
    }

    // Enrich with crop type name
    const enrichedTemplates = await Promise.all(
      templates.map(async (template) => {
        const cropType = await ctx.db.get(template.crop_type_id);
        return {
          ...template,
          cropTypeName: cropType?.name || null,
        };
      })
    );

    return enrichedTemplates;
  },
});

/**
 * Create a new production template
 */
export const create = mutation({
  args: {
    companyId: v.id("companies"),
    name: v.string(),
    cropTypeId: v.id("crop_types"),
    cultivarId: v.optional(v.id("cultivars")),
    templateCategory: v.optional(v.string()),
    productionMethod: v.optional(v.string()),
    sourceType: v.optional(v.string()),
    defaultBatchSize: v.optional(v.number()),
    enableIndividualTracking: v.optional(v.boolean()),
    description: v.optional(v.string()),
    estimatedDurationDays: v.optional(v.number()),
    estimatedYield: v.optional(v.number()),
    yieldUnit: v.optional(v.string()),
    difficultyLevel: v.optional(v.string()),
    environmentalRequirements: v.optional(v.any()),
    spaceRequirements: v.optional(v.any()),
    estimatedCost: v.optional(v.number()),
    createdBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Validate crop type exists
    const cropType = await ctx.db.get(args.cropTypeId);
    if (!cropType) {
      throw new Error("Crop type not found");
    }

    // Validate cultivar if provided
    if (args.cultivarId) {
      const cultivar = await ctx.db.get(args.cultivarId);
      if (!cultivar) {
        throw new Error("Cultivar not found");
      }
      // Validate cultivar is compatible with crop type
      if (cultivar.crop_type_id !== args.cropTypeId) {
        throw new Error("Cultivar is not compatible with selected crop type");
      }
    }

    const templateId = await ctx.db.insert("production_templates", {
      company_id: args.companyId,
      name: args.name,
      crop_type_id: args.cropTypeId,
      cultivar_id: args.cultivarId,
      template_category: args.templateCategory,
      production_method: args.productionMethod,
      source_type: args.sourceType,
      default_batch_size: args.defaultBatchSize || 50,
      enable_individual_tracking: args.enableIndividualTracking || false,
      description: args.description,
      estimated_duration_days: args.estimatedDurationDays,
      estimated_yield: args.estimatedYield,
      yield_unit: args.yieldUnit,
      difficulty_level: args.difficultyLevel,
      environmental_requirements: args.environmentalRequirements || {},
      space_requirements: args.spaceRequirements || {},
      estimated_cost: args.estimatedCost,
      cost_breakdown: {},
      usage_count: 0,
      average_success_rate: undefined,
      average_actual_yield: undefined,
      last_used_date: undefined,
      is_public: false,
      created_by: args.createdBy,
      status: "active",
      created_at: now,
      updated_at: now,
    });

    return templateId;
  },
});

/**
 * Update a production template
 */
export const update = mutation({
  args: {
    templateId: v.id("production_templates"),
    name: v.optional(v.string()),
    cultivarId: v.optional(v.id("cultivars")),
    templateCategory: v.optional(v.string()),
    productionMethod: v.optional(v.string()),
    sourceType: v.optional(v.string()),
    defaultBatchSize: v.optional(v.number()),
    enableIndividualTracking: v.optional(v.boolean()),
    description: v.optional(v.string()),
    estimatedDurationDays: v.optional(v.number()),
    estimatedYield: v.optional(v.number()),
    yieldUnit: v.optional(v.string()),
    difficultyLevel: v.optional(v.string()),
    environmentalRequirements: v.optional(v.any()),
    spaceRequirements: v.optional(v.any()),
    estimatedCost: v.optional(v.number()),
    isPublic: v.optional(v.boolean()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const template = await ctx.db.get(args.templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    // Validate cultivar if provided
    if (args.cultivarId) {
      const cultivar = await ctx.db.get(args.cultivarId);
      if (!cultivar) {
        throw new Error("Cultivar not found");
      }
      if (cultivar.crop_type_id !== template.crop_type_id) {
        throw new Error("Cultivar is not compatible with template crop type");
      }
    }

    const updates: Record<string, unknown> = {
      updated_at: now,
    };

    if (args.name !== undefined) updates.name = args.name;
    if (args.cultivarId !== undefined) updates.cultivar_id = args.cultivarId;
    if (args.templateCategory !== undefined)
      updates.template_category = args.templateCategory;
    if (args.productionMethod !== undefined)
      updates.production_method = args.productionMethod;
    if (args.sourceType !== undefined) updates.source_type = args.sourceType;
    if (args.defaultBatchSize !== undefined)
      updates.default_batch_size = args.defaultBatchSize;
    if (args.enableIndividualTracking !== undefined)
      updates.enable_individual_tracking = args.enableIndividualTracking;
    if (args.description !== undefined) updates.description = args.description;
    if (args.estimatedDurationDays !== undefined)
      updates.estimated_duration_days = args.estimatedDurationDays;
    if (args.estimatedYield !== undefined)
      updates.estimated_yield = args.estimatedYield;
    if (args.yieldUnit !== undefined) updates.yield_unit = args.yieldUnit;
    if (args.difficultyLevel !== undefined)
      updates.difficulty_level = args.difficultyLevel;
    if (args.environmentalRequirements !== undefined)
      updates.environmental_requirements = args.environmentalRequirements;
    if (args.spaceRequirements !== undefined)
      updates.space_requirements = args.spaceRequirements;
    if (args.estimatedCost !== undefined)
      updates.estimated_cost = args.estimatedCost;
    if (args.isPublic !== undefined) updates.is_public = args.isPublic;
    if (args.status !== undefined) updates.status = args.status;

    await ctx.db.patch(args.templateId, updates);

    return {
      success: true,
      message: "Template updated successfully",
    };
  },
});

/**
 * Duplicate a production template with all phases and activities
 */
export const duplicate = mutation({
  args: {
    templateId: v.id("production_templates"),
    newName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const template = await ctx.db.get(args.templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    // Create new template
    const newTemplateId = await ctx.db.insert("production_templates", {
      company_id: template.company_id,
      name: args.newName || `${template.name} - Copia`,
      crop_type_id: template.crop_type_id,
      cultivar_id: template.cultivar_id,
      template_category: template.template_category,
      production_method: template.production_method,
      source_type: template.source_type,
      default_batch_size: template.default_batch_size,
      enable_individual_tracking: template.enable_individual_tracking,
      description: template.description,
      estimated_duration_days: template.estimated_duration_days,
      estimated_yield: template.estimated_yield,
      yield_unit: template.yield_unit,
      difficulty_level: template.difficulty_level,
      environmental_requirements: template.environmental_requirements,
      space_requirements: template.space_requirements,
      estimated_cost: template.estimated_cost,
      cost_breakdown: template.cost_breakdown,
      usage_count: 0, // Reset
      average_success_rate: undefined,
      average_actual_yield: undefined,
      last_used_date: undefined,
      is_public: false,
      created_by: template.created_by,
      status: "active",
      created_at: now,
      updated_at: now,
    });

    // Get and duplicate phases
    const phases = await ctx.db
      .query("template_phases")
      .withIndex("by_template", (q) => q.eq("template_id", args.templateId))
      .collect();

    const phaseIdMap = new Map<Id<"template_phases">, Id<"template_phases">>();

    for (const phase of phases) {
      const newPhaseId = await ctx.db.insert("template_phases", {
        template_id: newTemplateId,
        phase_name: phase.phase_name,
        phase_order: phase.phase_order,
        estimated_duration_days: phase.estimated_duration_days,
        area_type: phase.area_type,
        previous_phase_id: undefined, // Will be updated after all phases created
        required_conditions: phase.required_conditions,
        completion_criteria: phase.completion_criteria,
        required_equipment: phase.required_equipment,
        required_materials: phase.required_materials,
        description: phase.description,
        created_at: now,
      });

      phaseIdMap.set(phase._id, newPhaseId);

      // Duplicate activities for this phase
      const activities = await ctx.db
        .query("template_activities")
        .withIndex("by_phase", (q) => q.eq("phase_id", phase._id))
        .collect();

      for (const activity of activities) {
        await ctx.db.insert("template_activities", {
          phase_id: newPhaseId,
          activity_name: activity.activity_name,
          activity_order: activity.activity_order,
          activity_type: activity.activity_type,
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
      }
    }

    // Update previous_phase_id references
    for (const phase of phases) {
      if (phase.previous_phase_id) {
        const newPhaseId = phaseIdMap.get(phase._id);
        const newPreviousPhaseId = phaseIdMap.get(phase.previous_phase_id);
        if (newPhaseId && newPreviousPhaseId) {
          await ctx.db.patch(newPhaseId, {
            previous_phase_id: newPreviousPhaseId,
          });
        }
      }
    }

    return newTemplateId;
  },
});

/**
 * Archive a template
 */
export const archive = mutation({
  args: {
    templateId: v.id("production_templates"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const template = await ctx.db.get(args.templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    await ctx.db.patch(args.templateId, {
      status: "archived",
      updated_at: now,
    });

    return {
      success: true,
      message: "Template archived successfully",
    };
  },
});

/**
 * Restore an archived template
 */
export const restore = mutation({
  args: {
    templateId: v.id("production_templates"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const template = await ctx.db.get(args.templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    await ctx.db.patch(args.templateId, {
      status: "active",
      updated_at: now,
    });

    return {
      success: true,
      message: "Template restored successfully",
    };
  },
});

/**
 * Increment usage count (called when template is used for a new order)
 */
export const incrementUsage = mutation({
  args: {
    templateId: v.id("production_templates"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const template = await ctx.db.get(args.templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    await ctx.db.patch(args.templateId, {
      usage_count: template.usage_count + 1,
      last_used_date: now,
      updated_at: now,
    });

    return {
      success: true,
    };
  },
});
