/**
 * Quality Check Templates Queries and Mutations
 * Templates for quality inspection forms with optional AI assistance
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * List quality check templates for a company
 */
export const list = query({
  args: {
    companyId: v.id("companies"),
    cropTypeId: v.optional(v.id("crop_types")),
    procedureType: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let templates = await ctx.db
      .query("quality_check_templates")
      .withIndex("by_company", (q) => q.eq("company_id", args.companyId))
      .collect();

    // Apply filters
    if (args.cropTypeId) {
      templates = templates.filter((t) => t.crop_type_id === args.cropTypeId);
    }

    if (args.procedureType) {
      templates = templates.filter(
        (t) => t.procedure_type === args.procedureType
      );
    }

    if (args.status) {
      templates = templates.filter((t) => t.status === args.status);
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
 * Get template by ID
 */
export const getById = query({
  args: {
    templateId: v.id("quality_check_templates"),
  },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.templateId);
    if (!template) {
      return null;
    }

    const cropType = await ctx.db.get(template.crop_type_id);
    const creator = template.created_by
      ? await ctx.db.get(template.created_by)
      : null;

    return {
      ...template,
      cropTypeName: cropType?.name || null,
      creatorName: creator
        ? `${creator.first_name || ""} ${creator.last_name || ""}`.trim()
        : null,
    };
  },
});

/**
 * Create a new quality check template
 */
export const create = mutation({
  args: {
    companyId: v.id("companies"),
    name: v.string(),
    cropTypeId: v.id("crop_types"),
    procedureType: v.optional(v.string()),
    inspectionLevel: v.optional(v.string()),
    regulatoryRequirement: v.optional(v.boolean()),
    complianceStandard: v.optional(v.string()),
    templateStructure: v.any(),
    aiAssisted: v.optional(v.boolean()),
    aiAnalysisTypes: v.optional(v.array(v.string())),
    applicableStages: v.array(v.string()),
    frequencyRecommendation: v.optional(v.string()),
    createdBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Validate crop type exists
    const cropType = await ctx.db.get(args.cropTypeId);
    if (!cropType) {
      throw new Error("Crop type not found");
    }

    // Validate template structure has at least one field
    const structure = args.templateStructure as {
      sections?: Array<{ fields?: unknown[] }>;
    };
    const hasFields =
      structure.sections?.some((s) => s.fields && s.fields.length > 0) || false;

    if (!hasFields) {
      throw new Error("Template must have at least one field");
    }

    const templateId = await ctx.db.insert("quality_check_templates", {
      company_id: args.companyId,
      name: args.name,
      crop_type_id: args.cropTypeId,
      procedure_type: args.procedureType,
      inspection_level: args.inspectionLevel,
      regulatory_requirement: args.regulatoryRequirement || false,
      compliance_standard: args.complianceStandard,
      template_structure: args.templateStructure,
      ai_assisted: args.aiAssisted || false,
      ai_analysis_types: args.aiAnalysisTypes || [],
      applicable_stages: args.applicableStages,
      frequency_recommendation: args.frequencyRecommendation,
      usage_count: 0,
      average_completion_time_minutes: undefined,
      created_by: args.createdBy,
      status: "active",
      created_at: now,
      updated_at: now,
    });

    return templateId;
  },
});

/**
 * Update a quality check template
 */
export const update = mutation({
  args: {
    templateId: v.id("quality_check_templates"),
    name: v.optional(v.string()),
    procedureType: v.optional(v.string()),
    inspectionLevel: v.optional(v.string()),
    regulatoryRequirement: v.optional(v.boolean()),
    complianceStandard: v.optional(v.string()),
    templateStructure: v.optional(v.any()),
    aiAssisted: v.optional(v.boolean()),
    aiAnalysisTypes: v.optional(v.array(v.string())),
    applicableStages: v.optional(v.array(v.string())),
    frequencyRecommendation: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const template = await ctx.db.get(args.templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    const updates: Record<string, unknown> = {
      updated_at: now,
    };

    if (args.name !== undefined) updates.name = args.name;
    if (args.procedureType !== undefined)
      updates.procedure_type = args.procedureType;
    if (args.inspectionLevel !== undefined)
      updates.inspection_level = args.inspectionLevel;
    if (args.regulatoryRequirement !== undefined)
      updates.regulatory_requirement = args.regulatoryRequirement;
    if (args.complianceStandard !== undefined)
      updates.compliance_standard = args.complianceStandard;
    if (args.templateStructure !== undefined)
      updates.template_structure = args.templateStructure;
    if (args.aiAssisted !== undefined) updates.ai_assisted = args.aiAssisted;
    if (args.aiAnalysisTypes !== undefined)
      updates.ai_analysis_types = args.aiAnalysisTypes;
    if (args.applicableStages !== undefined)
      updates.applicable_stages = args.applicableStages;
    if (args.frequencyRecommendation !== undefined)
      updates.frequency_recommendation = args.frequencyRecommendation;
    if (args.status !== undefined) updates.status = args.status;

    await ctx.db.patch(args.templateId, updates);

    return {
      success: true,
      message: "Template updated successfully",
    };
  },
});

/**
 * Duplicate a quality check template
 */
export const duplicate = mutation({
  args: {
    templateId: v.id("quality_check_templates"),
    newName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const template = await ctx.db.get(args.templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    const newTemplateId = await ctx.db.insert("quality_check_templates", {
      company_id: template.company_id,
      name: args.newName || `${template.name} - Copia`,
      crop_type_id: template.crop_type_id,
      procedure_type: template.procedure_type,
      inspection_level: template.inspection_level,
      regulatory_requirement: template.regulatory_requirement,
      compliance_standard: template.compliance_standard,
      template_structure: template.template_structure,
      ai_assisted: template.ai_assisted,
      ai_analysis_types: template.ai_analysis_types,
      applicable_stages: template.applicable_stages,
      frequency_recommendation: template.frequency_recommendation,
      usage_count: 0,
      average_completion_time_minutes: undefined,
      created_by: template.created_by,
      status: "active",
      created_at: now,
      updated_at: now,
    });

    return newTemplateId;
  },
});

/**
 * Archive a template
 */
export const archive = mutation({
  args: {
    templateId: v.id("quality_check_templates"),
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
    templateId: v.id("quality_check_templates"),
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
 * Increment usage count and update average completion time
 */
export const recordUsage = mutation({
  args: {
    templateId: v.id("quality_check_templates"),
    completionTimeMinutes: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const template = await ctx.db.get(args.templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    const newUsageCount = template.usage_count + 1;

    // Calculate new average completion time
    let newAverageTime = template.average_completion_time_minutes;
    if (args.completionTimeMinutes !== undefined) {
      if (template.average_completion_time_minutes !== undefined) {
        // Weighted average
        newAverageTime =
          (template.average_completion_time_minutes * template.usage_count +
            args.completionTimeMinutes) /
          newUsageCount;
      } else {
        newAverageTime = args.completionTimeMinutes;
      }
    }

    await ctx.db.patch(args.templateId, {
      usage_count: newUsageCount,
      average_completion_time_minutes: newAverageTime,
      updated_at: now,
    });

    return {
      success: true,
    };
  },
});
