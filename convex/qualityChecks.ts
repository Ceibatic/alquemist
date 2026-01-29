/**
 * Quality Checks Queries and Mutations
 * Execute and manage quality inspections
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * List quality checks for a company
 */
export const list = query({
  args: {
    companyId: v.id("companies"),
    templateId: v.optional(v.id("quality_check_templates")),
    entityType: v.optional(v.string()),
    facilityId: v.optional(v.id("facilities")),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let checks = await ctx.db
      .query("quality_checks")
      .withIndex("by_company", (q) => q.eq("company_id", args.companyId))
      .order("desc")
      .collect();

    // Apply filters
    if (args.templateId) {
      checks = checks.filter((c) => c.template_id === args.templateId);
    }

    if (args.entityType) {
      checks = checks.filter((c) => c.entity_type === args.entityType);
    }

    if (args.facilityId) {
      checks = checks.filter((c) => c.facility_id === args.facilityId);
    }

    if (args.status) {
      checks = checks.filter((c) => c.status === args.status);
    }

    // Enrich with template and user info
    const enrichedChecks = await Promise.all(
      checks.map(async (check) => {
        const template = await ctx.db.get(check.template_id);
        const performer = await ctx.db.get(check.performed_by);

        return {
          ...check,
          templateName: template?.name || null,
          performerName: performer
            ? `${performer.first_name || ""} ${performer.last_name || ""}`.trim()
            : null,
        };
      })
    );

    // Apply pagination
    const offset = args.offset || 0;
    const limit = args.limit || 50;

    return {
      checks: enrichedChecks.slice(offset, offset + limit),
      total: enrichedChecks.length,
    };
  },
});

/**
 * Get quality check by ID
 */
export const getById = query({
  args: {
    checkId: v.id("quality_checks"),
  },
  handler: async (ctx, args) => {
    const check = await ctx.db.get(args.checkId);
    if (!check) {
      return null;
    }

    const template = await ctx.db.get(check.template_id);
    const performer = await ctx.db.get(check.performed_by);
    const facility = await ctx.db.get(check.facility_id);

    return {
      ...check,
      templateName: template?.name || null,
      templateStructure: template?.template_structure || null,
      performerName: performer
        ? `${performer.first_name || ""} ${performer.last_name || ""}`.trim()
        : null,
      facilityName: facility?.name || null,
    };
  },
});

/**
 * Get quality checks for a specific entity
 */
export const getByEntity = query({
  args: {
    entityType: v.string(),
    entityId: v.string(),
  },
  handler: async (ctx, args) => {
    const checks = await ctx.db
      .query("quality_checks")
      .withIndex("by_entity", (q) =>
        q.eq("entity_type", args.entityType).eq("entity_id", args.entityId)
      )
      .order("desc")
      .collect();

    // Enrich with template name
    const enrichedChecks = await Promise.all(
      checks.map(async (check) => {
        const template = await ctx.db.get(check.template_id);
        const performer = await ctx.db.get(check.performed_by);

        return {
          ...check,
          templateName: template?.name || null,
          performerName: performer
            ? `${performer.first_name || ""} ${performer.last_name || ""}`.trim()
            : null,
        };
      })
    );

    return enrichedChecks;
  },
});

/**
 * Create a new quality check (start inspection)
 */
export const create = mutation({
  args: {
    templateId: v.id("quality_check_templates"),
    entityType: v.string(),
    entityId: v.string(),
    performedBy: v.id("users"),
    companyId: v.id("companies"),
    facilityId: v.id("facilities"),
    formData: v.optional(v.any()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Verify template exists
    const template = await ctx.db.get(args.templateId);
    if (!template) {
      throw new Error("Quality check template not found");
    }

    const checkId = await ctx.db.insert("quality_checks", {
      template_id: args.templateId,
      entity_type: args.entityType,
      entity_id: args.entityId,
      performed_by: args.performedBy,
      company_id: args.companyId,
      facility_id: args.facilityId,
      form_data: args.formData || {},
      ai_analysis_results: undefined,
      overall_result: "pending",
      duration_minutes: undefined,
      photos: [],
      notes: args.notes,
      follow_up_required: false,
      follow_up_date: undefined,
      status: "draft",
      created_at: now,
    });

    return checkId;
  },
});

/**
 * Save draft (partial save during inspection)
 */
export const saveDraft = mutation({
  args: {
    checkId: v.id("quality_checks"),
    formData: v.any(),
    photos: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const check = await ctx.db.get(args.checkId);
    if (!check) {
      throw new Error("Quality check not found");
    }

    if (check.status !== "draft") {
      throw new Error("Can only save drafts for incomplete inspections");
    }

    const updates: Record<string, unknown> = {
      form_data: args.formData,
    };

    if (args.photos !== undefined) updates.photos = args.photos;
    if (args.notes !== undefined) updates.notes = args.notes;

    await ctx.db.patch(args.checkId, updates);

    return {
      success: true,
      message: "Draft saved",
    };
  },
});

/**
 * Complete a quality check
 */
export const complete = mutation({
  args: {
    checkId: v.id("quality_checks"),
    formData: v.any(),
    overallResult: v.string(),
    photos: v.optional(v.array(v.string())),
    aiAnalysisResults: v.optional(v.any()),
    durationMinutes: v.optional(v.number()),
    notes: v.optional(v.string()),
    followUpRequired: v.optional(v.boolean()),
    followUpDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const check = await ctx.db.get(args.checkId);
    if (!check) {
      throw new Error("Quality check not found");
    }

    // Get template to validate required fields
    const template = await ctx.db.get(check.template_id);
    if (!template) {
      throw new Error("Template not found");
    }

    // Validate required fields in form_data against template_structure
    const missingFields: string[] = [];
    const templateStructure = template.template_structure as {
      sections: Array<{
        title: string;
        fields: Array<{
          id: string;
          label: string;
          type: string;
          required?: boolean;
        }>;
      }>;
    };

    if (templateStructure?.sections) {
      for (const section of templateStructure.sections) {
        for (const field of section.fields) {
          // Skip validation for display-only fields
          if (field.type === 'heading' || field.type === 'paragraph') {
            continue;
          }

          // Check if field is required
          if (field.required === true) {
            const value = args.formData[field.id];

            // Check if value is empty (undefined, null, empty string, empty array)
            const isEmpty =
              value === undefined ||
              value === null ||
              value === '' ||
              (Array.isArray(value) && value.length === 0);

            if (isEmpty) {
              missingFields.push(field.label);
            }
          }
        }
      }
    }

    // If there are missing required fields, throw error
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    await ctx.db.patch(args.checkId, {
      form_data: args.formData,
      overall_result: args.overallResult,
      photos: args.photos || check.photos,
      ai_analysis_results: args.aiAnalysisResults,
      duration_minutes: args.durationMinutes,
      notes: args.notes,
      follow_up_required: args.followUpRequired || false,
      follow_up_date: args.followUpDate,
      status: "completed",
    });

    // Update template usage count
    await ctx.db.patch(check.template_id, {
      usage_count: template.usage_count + 1,
      updated_at: Date.now(),
    });

    return {
      success: true,
      message: "Quality check completed",
    };
  },
});

/**
 * Add AI analysis results to a check
 */
export const addAiResults = mutation({
  args: {
    checkId: v.id("quality_checks"),
    aiAnalysisResults: v.any(),
  },
  handler: async (ctx, args) => {
    const check = await ctx.db.get(args.checkId);
    if (!check) {
      throw new Error("Quality check not found");
    }

    // Merge with existing results if any
    const existingResults = check.ai_analysis_results || {};
    const mergedResults = {
      ...existingResults,
      ...args.aiAnalysisResults,
      updated_at: Date.now(),
    };

    await ctx.db.patch(args.checkId, {
      ai_analysis_results: mergedResults,
    });

    return {
      success: true,
      message: "AI results added",
    };
  },
});

/**
 * Update follow-up status
 */
export const updateFollowUp = mutation({
  args: {
    checkId: v.id("quality_checks"),
    followUpRequired: v.boolean(),
    followUpDate: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const check = await ctx.db.get(args.checkId);
    if (!check) {
      throw new Error("Quality check not found");
    }

    const updates: Record<string, unknown> = {
      follow_up_required: args.followUpRequired,
    };

    if (args.followUpDate !== undefined)
      updates.follow_up_date = args.followUpDate;
    if (args.notes !== undefined) updates.notes = args.notes;

    await ctx.db.patch(args.checkId, updates);

    return {
      success: true,
      message: "Follow-up updated",
    };
  },
});

/**
 * Get checks requiring follow-up
 */
export const getFollowUpsRequired = query({
  args: {
    companyId: v.id("companies"),
    facilityId: v.optional(v.id("facilities")),
  },
  handler: async (ctx, args) => {
    let checks = await ctx.db
      .query("quality_checks")
      .withIndex("by_company", (q) => q.eq("company_id", args.companyId))
      .collect();

    // Filter for follow-up required
    checks = checks.filter((c) => c.follow_up_required && c.status === "completed");

    if (args.facilityId) {
      checks = checks.filter((c) => c.facility_id === args.facilityId);
    }

    // Sort by follow-up date (soonest first)
    checks.sort((a, b) => (a.follow_up_date || 0) - (b.follow_up_date || 0));

    // Enrich with template and entity info
    const enrichedChecks = await Promise.all(
      checks.map(async (check) => {
        const template = await ctx.db.get(check.template_id);

        return {
          ...check,
          templateName: template?.name || null,
        };
      })
    );

    return enrichedChecks;
  },
});

/**
 * Delete a draft quality check
 */
export const deleteDraft = mutation({
  args: {
    checkId: v.id("quality_checks"),
  },
  handler: async (ctx, args) => {
    const check = await ctx.db.get(args.checkId);
    if (!check) {
      throw new Error("Quality check not found");
    }

    if (check.status !== "draft") {
      throw new Error("Can only delete draft inspections");
    }

    await ctx.db.delete(args.checkId);

    return {
      success: true,
      message: "Draft deleted",
    };
  },
});
