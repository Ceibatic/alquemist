/**
 * Activity Templates — Reusable templates for standardizing cultivation operations
 *
 * Templates define WHAT to do (type, resources, checklist, duration, frequency).
 * They pre-fill the activity form when executing, but operators can always adjust.
 *
 * 3-layer flow: template → scheduled_activity → activity
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const VALID_FREQUENCY_TYPES = [
  "once", "daily", "weekly", "biweekly", "monthly", "on_demand", "custom_days",
];

const VALID_QUANTITY_BASIS = [
  "fixed", "per_plant", "per_m2", "per_zone", "per_L_solution",
];

const VALID_DIRECTIONS = ["consumed", "applied", "produced"];

const VALID_VALUE_TYPES = ["text", "number", "boolean", "select"];

// ============================================================================
// QUERIES
// ============================================================================

/**
 * List activity templates for a company with optional filters.
 */
export const list = query({
  args: {
    companyId: v.id("companies"),
    typeId: v.optional(v.id("activity_types")),
    cropTypeId: v.optional(v.id("crop_types")),
    phase: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { companyId, typeId, cropTypeId, phase, isActive }) => {
    let templates = await ctx.db
      .query("activity_templates")
      .withIndex("by_company", (q) => q.eq("company_id", companyId))
      .collect();

    if (typeId) {
      templates = templates.filter((t) => t.type_id === typeId);
    }
    if (cropTypeId) {
      templates = templates.filter(
        (t) => t.crop_type_ids && t.crop_type_ids.includes(cropTypeId)
      );
    }
    if (phase) {
      templates = templates.filter((t) => t.applicable_phases.includes(phase));
    }
    if (isActive !== undefined) {
      templates = templates.filter((t) => t.is_active === isActive);
    }

    return templates.sort((a, b) => a.sort_order - b.sort_order);
  },
});

/**
 * Get a single activity template by ID, with its resources and checklist counts.
 */
export const getById = query({
  args: {
    templateId: v.id("activity_templates"),
  },
  handler: async (ctx, { templateId }) => {
    const template = await ctx.db.get(templateId);
    if (!template) return null;

    const resources = await ctx.db
      .query("activity_template_resources")
      .withIndex("by_template", (q) => q.eq("template_id", templateId))
      .collect();

    const checklist = await ctx.db
      .query("activity_template_checklist")
      .withIndex("by_template", (q) => q.eq("template_id", templateId))
      .collect();

    return {
      ...template,
      resources: resources.sort((a, b) => a.sequence - b.sequence),
      checklist: checklist.sort((a, b) => a.step_number - b.step_number),
      resourceCount: resources.length,
      checklistCount: checklist.length,
    };
  },
});

/**
 * Get a template by company + code.
 */
export const getByCode = query({
  args: {
    companyId: v.id("companies"),
    code: v.string(),
  },
  handler: async (ctx, { companyId, code }) => {
    const templates = await ctx.db
      .query("activity_templates")
      .withIndex("by_company", (q) => q.eq("company_id", companyId))
      .collect();

    return templates.find((t) => t.code === code) ?? null;
  },
});

// ============================================================================
// MUTATIONS — Template CRUD
// ============================================================================

/**
 * Create a new activity template.
 */
export const create = mutation({
  args: {
    companyId: v.id("companies"),
    typeId: v.id("activity_types"),
    name: v.string(),
    code: v.optional(v.string()),
    description: v.optional(v.string()),
    cropTypeIds: v.optional(v.array(v.id("crop_types"))),
    applicablePhases: v.array(v.string()),
    phaseDayStart: v.optional(v.number()),
    phaseDayEnd: v.optional(v.number()),
    estimatedDurationMinutes: v.optional(v.number()),
    laborHoursPer1000Plants: v.optional(v.number()),
    frequencyType: v.string(),
    frequencyIntervalDays: v.optional(v.number()),
    repeatCount: v.optional(v.number()),
    defaultMetadata: v.optional(v.any()),
    defaultPriority: v.optional(v.string()),
    requiresConditions: v.optional(v.any()),
    dependsOnTemplateId: v.optional(v.id("activity_templates")),
    minDaysAfterDependency: v.optional(v.number()),
    regulatoryReference: v.optional(v.string()),
    requiresVerification: v.boolean(),
    sortOrder: v.optional(v.number()),
    // Report form configuration
    formFields: v.optional(v.array(v.string())),
    qualityCheckTemplateId: v.optional(v.id("quality_check_templates")),
    requiresPhotos: v.optional(v.boolean()),
    requiresAttachments: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Validate type_id exists
    const activityType = await ctx.db.get(args.typeId);
    if (!activityType) {
      throw new Error(`Tipo de actividad no encontrado: ${args.typeId}`);
    }

    // Validate frequency_type
    if (!VALID_FREQUENCY_TYPES.includes(args.frequencyType)) {
      throw new Error(
        `Frecuencia invalida: "${args.frequencyType}". Valores validos: ${VALID_FREQUENCY_TYPES.join(", ")}`
      );
    }

    // Validate code uniqueness within company (if provided)
    if (args.code) {
      const templates = await ctx.db
        .query("activity_templates")
        .withIndex("by_company", (q) => q.eq("company_id", args.companyId))
        .collect();

      const existing = templates.find((t) => t.code === args.code);
      if (existing) {
        throw new Error(
          `Ya existe un template con el codigo "${args.code}" en esta empresa`
        );
      }
    }

    // Validate dependency exists
    if (args.dependsOnTemplateId) {
      const dep = await ctx.db.get(args.dependsOnTemplateId);
      if (!dep) {
        throw new Error(
          `Template de dependencia no encontrado: ${args.dependsOnTemplateId}`
        );
      }
    }

    const now = Date.now();
    return await ctx.db.insert("activity_templates", {
      company_id: args.companyId,
      type_id: args.typeId,
      name: args.name,
      code: args.code,
      description: args.description,
      crop_type_ids: args.cropTypeIds,
      applicable_phases: args.applicablePhases,
      phase_day_start: args.phaseDayStart,
      phase_day_end: args.phaseDayEnd,
      estimated_duration_minutes: args.estimatedDurationMinutes,
      labor_hours_per_1000_plants: args.laborHoursPer1000Plants,
      frequency_type: args.frequencyType,
      frequency_interval_days: args.frequencyIntervalDays,
      repeat_count: args.repeatCount,
      default_metadata: args.defaultMetadata,
      default_priority: args.defaultPriority ?? "routine",
      requires_conditions: args.requiresConditions,
      depends_on_template_id: args.dependsOnTemplateId,
      min_days_after_dependency: args.minDaysAfterDependency,
      form_fields: args.formFields,
      quality_check_template_id: args.qualityCheckTemplateId,
      requires_photos: args.requiresPhotos,
      requires_attachments: args.requiresAttachments,
      regulatory_reference: args.regulatoryReference,
      requires_verification: args.requiresVerification,
      sort_order: args.sortOrder ?? 0,
      is_active: true,
      version: 1,
      created_at: now,
      updated_at: now,
    });
  },
});

/**
 * Update an existing activity template.
 */
export const update = mutation({
  args: {
    templateId: v.id("activity_templates"),
    name: v.optional(v.string()),
    code: v.optional(v.string()),
    description: v.optional(v.string()),
    typeId: v.optional(v.id("activity_types")),
    cropTypeIds: v.optional(v.array(v.id("crop_types"))),
    applicablePhases: v.optional(v.array(v.string())),
    phaseDayStart: v.optional(v.number()),
    phaseDayEnd: v.optional(v.number()),
    estimatedDurationMinutes: v.optional(v.number()),
    laborHoursPer1000Plants: v.optional(v.number()),
    frequencyType: v.optional(v.string()),
    frequencyIntervalDays: v.optional(v.number()),
    repeatCount: v.optional(v.number()),
    defaultMetadata: v.optional(v.any()),
    defaultPriority: v.optional(v.string()),
    requiresConditions: v.optional(v.any()),
    dependsOnTemplateId: v.optional(v.id("activity_templates")),
    minDaysAfterDependency: v.optional(v.number()),
    regulatoryReference: v.optional(v.string()),
    requiresVerification: v.optional(v.boolean()),
    sortOrder: v.optional(v.number()),
    // Report form configuration
    formFields: v.optional(v.array(v.string())),
    qualityCheckTemplateId: v.optional(v.id("quality_check_templates")),
    requiresPhotos: v.optional(v.boolean()),
    requiresAttachments: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.templateId);
    if (!template) {
      throw new Error(`Template no encontrado: ${args.templateId}`);
    }

    // Validate frequency_type if changing
    if (args.frequencyType && !VALID_FREQUENCY_TYPES.includes(args.frequencyType)) {
      throw new Error(
        `Frecuencia invalida: "${args.frequencyType}". Valores validos: ${VALID_FREQUENCY_TYPES.join(", ")}`
      );
    }

    // Validate code uniqueness if changing
    if (args.code && args.code !== template.code) {
      const templates = await ctx.db
        .query("activity_templates")
        .withIndex("by_company", (q) =>
          q.eq("company_id", template.company_id)
        )
        .collect();

      const existing = templates.find(
        (t) => t.code === args.code && t._id !== args.templateId
      );
      if (existing) {
        throw new Error(
          `Ya existe un template con el codigo "${args.code}" en esta empresa`
        );
      }
    }

    // Validate type_id if changing
    if (args.typeId) {
      const activityType = await ctx.db.get(args.typeId);
      if (!activityType) {
        throw new Error(`Tipo de actividad no encontrado: ${args.typeId}`);
      }
    }

    // Build patch object — only include fields that were provided
    const patch: Record<string, unknown> = { updated_at: Date.now() };
    if (args.name !== undefined) patch.name = args.name;
    if (args.code !== undefined) patch.code = args.code;
    if (args.description !== undefined) patch.description = args.description;
    if (args.typeId !== undefined) patch.type_id = args.typeId;
    if (args.cropTypeIds !== undefined) patch.crop_type_ids = args.cropTypeIds;
    if (args.applicablePhases !== undefined) patch.applicable_phases = args.applicablePhases;
    if (args.phaseDayStart !== undefined) patch.phase_day_start = args.phaseDayStart;
    if (args.phaseDayEnd !== undefined) patch.phase_day_end = args.phaseDayEnd;
    if (args.estimatedDurationMinutes !== undefined) patch.estimated_duration_minutes = args.estimatedDurationMinutes;
    if (args.laborHoursPer1000Plants !== undefined) patch.labor_hours_per_1000_plants = args.laborHoursPer1000Plants;
    if (args.frequencyType !== undefined) patch.frequency_type = args.frequencyType;
    if (args.frequencyIntervalDays !== undefined) patch.frequency_interval_days = args.frequencyIntervalDays;
    if (args.repeatCount !== undefined) patch.repeat_count = args.repeatCount;
    if (args.defaultMetadata !== undefined) patch.default_metadata = args.defaultMetadata;
    if (args.defaultPriority !== undefined) patch.default_priority = args.defaultPriority;
    if (args.requiresConditions !== undefined) patch.requires_conditions = args.requiresConditions;
    if (args.dependsOnTemplateId !== undefined) patch.depends_on_template_id = args.dependsOnTemplateId;
    if (args.minDaysAfterDependency !== undefined) patch.min_days_after_dependency = args.minDaysAfterDependency;
    if (args.regulatoryReference !== undefined) patch.regulatory_reference = args.regulatoryReference;
    if (args.requiresVerification !== undefined) patch.requires_verification = args.requiresVerification;
    if (args.sortOrder !== undefined) patch.sort_order = args.sortOrder;
    if (args.formFields !== undefined) patch.form_fields = args.formFields;
    if (args.qualityCheckTemplateId !== undefined) patch.quality_check_template_id = args.qualityCheckTemplateId;
    if (args.requiresPhotos !== undefined) patch.requires_photos = args.requiresPhotos;
    if (args.requiresAttachments !== undefined) patch.requires_attachments = args.requiresAttachments;

    await ctx.db.patch(args.templateId, patch);
    return args.templateId;
  },
});

/**
 * Archive a template (set is_active = false).
 */
export const archive = mutation({
  args: {
    templateId: v.id("activity_templates"),
  },
  handler: async (ctx, { templateId }) => {
    const template = await ctx.db.get(templateId);
    if (!template) {
      throw new Error(`Template no encontrado: ${templateId}`);
    }
    await ctx.db.patch(templateId, {
      is_active: false,
      updated_at: Date.now(),
    });
    return templateId;
  },
});

/**
 * Restore an archived template.
 */
export const restore = mutation({
  args: {
    templateId: v.id("activity_templates"),
  },
  handler: async (ctx, { templateId }) => {
    const template = await ctx.db.get(templateId);
    if (!template) {
      throw new Error(`Template no encontrado: ${templateId}`);
    }
    await ctx.db.patch(templateId, {
      is_active: true,
      updated_at: Date.now(),
    });
    return templateId;
  },
});

/**
 * Duplicate a template with "(Copia)" suffix and version + 1.
 * Also duplicates resources and checklist items.
 */
export const duplicate = mutation({
  args: {
    templateId: v.id("activity_templates"),
  },
  handler: async (ctx, { templateId }) => {
    const template = await ctx.db.get(templateId);
    if (!template) {
      throw new Error(`Template no encontrado: ${templateId}`);
    }

    const now = Date.now();

    // Create the duplicate template
    const newTemplateId = await ctx.db.insert("activity_templates", {
      company_id: template.company_id,
      type_id: template.type_id,
      name: `${template.name} (Copia)`,
      code: template.code ? `${template.code}-COPY` : undefined,
      description: template.description,
      crop_type_ids: template.crop_type_ids,
      applicable_phases: template.applicable_phases,
      phase_day_start: template.phase_day_start,
      phase_day_end: template.phase_day_end,
      estimated_duration_minutes: template.estimated_duration_minutes,
      labor_hours_per_1000_plants: template.labor_hours_per_1000_plants,
      frequency_type: template.frequency_type,
      frequency_interval_days: template.frequency_interval_days,
      repeat_count: template.repeat_count,
      default_metadata: template.default_metadata,
      default_priority: template.default_priority,
      requires_conditions: template.requires_conditions,
      depends_on_template_id: template.depends_on_template_id,
      min_days_after_dependency: template.min_days_after_dependency,
      regulatory_reference: template.regulatory_reference,
      requires_verification: template.requires_verification,
      sort_order: template.sort_order,
      is_active: true,
      version: template.version + 1,
      created_at: now,
      updated_at: now,
    });

    // Duplicate resources
    const resources = await ctx.db
      .query("activity_template_resources")
      .withIndex("by_template", (q) => q.eq("template_id", templateId))
      .collect();

    for (const res of resources) {
      await ctx.db.insert("activity_template_resources", {
        template_id: newTemplateId,
        product_id: res.product_id,
        quantity: res.quantity,
        unit_id: res.unit_id,
        quantity_basis: res.quantity_basis,
        direction: res.direction,
        application_rate: res.application_rate,
        application_method: res.application_method,
        is_required: res.is_required,
        alternative_product_ids: res.alternative_product_ids,
        sequence: res.sequence,
        notes: res.notes,
        created_at: now,
      });
    }

    // Duplicate checklist items
    const checklist = await ctx.db
      .query("activity_template_checklist")
      .withIndex("by_template", (q) => q.eq("template_id", templateId))
      .collect();

    for (const item of checklist) {
      await ctx.db.insert("activity_template_checklist", {
        template_id: newTemplateId,
        step_number: item.step_number,
        title: item.title,
        description: item.description,
        is_required: item.is_required,
        requires_photo: item.requires_photo,
        requires_value: item.requires_value,
        value_type: item.value_type,
        value_options: item.value_options,
        value_min: item.value_min,
        value_max: item.value_max,
        created_at: now,
      });
    }

    return newTemplateId;
  },
});

// ============================================================================
// MUTATIONS — Resources
// ============================================================================

/**
 * Add a resource to a template.
 */
export const addResource = mutation({
  args: {
    templateId: v.id("activity_templates"),
    productId: v.id("products"),
    quantity: v.number(),
    unitId: v.optional(v.id("units_of_measure")),
    quantityBasis: v.string(),
    direction: v.string(),
    applicationRate: v.optional(v.string()),
    applicationMethod: v.optional(v.string()),
    isRequired: v.boolean(),
    alternativeProductIds: v.optional(v.array(v.id("products"))),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.templateId);
    if (!template) {
      throw new Error(`Template no encontrado: ${args.templateId}`);
    }

    if (!VALID_QUANTITY_BASIS.includes(args.quantityBasis)) {
      throw new Error(
        `Base de cantidad invalida: "${args.quantityBasis}". Valores validos: ${VALID_QUANTITY_BASIS.join(", ")}`
      );
    }

    if (!VALID_DIRECTIONS.includes(args.direction)) {
      throw new Error(
        `Direccion invalida: "${args.direction}". Valores validos: ${VALID_DIRECTIONS.join(", ")}`
      );
    }

    // Calculate next sequence number
    const existing = await ctx.db
      .query("activity_template_resources")
      .withIndex("by_template", (q) => q.eq("template_id", args.templateId))
      .collect();
    const maxSequence = existing.reduce((max, r) => Math.max(max, r.sequence), 0);

    return await ctx.db.insert("activity_template_resources", {
      template_id: args.templateId,
      product_id: args.productId,
      quantity: args.quantity,
      unit_id: args.unitId,
      quantity_basis: args.quantityBasis,
      direction: args.direction,
      application_rate: args.applicationRate,
      application_method: args.applicationMethod,
      is_required: args.isRequired,
      alternative_product_ids: args.alternativeProductIds,
      sequence: maxSequence + 1,
      notes: args.notes,
      created_at: Date.now(),
    });
  },
});

/**
 * Update a template resource.
 */
export const updateResource = mutation({
  args: {
    resourceId: v.id("activity_template_resources"),
    productId: v.optional(v.id("products")),
    quantity: v.optional(v.number()),
    unitId: v.optional(v.id("units_of_measure")),
    quantityBasis: v.optional(v.string()),
    direction: v.optional(v.string()),
    applicationRate: v.optional(v.string()),
    applicationMethod: v.optional(v.string()),
    isRequired: v.optional(v.boolean()),
    alternativeProductIds: v.optional(v.array(v.id("products"))),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const resource = await ctx.db.get(args.resourceId);
    if (!resource) {
      throw new Error(`Recurso no encontrado: ${args.resourceId}`);
    }

    if (args.quantityBasis && !VALID_QUANTITY_BASIS.includes(args.quantityBasis)) {
      throw new Error(
        `Base de cantidad invalida: "${args.quantityBasis}". Valores validos: ${VALID_QUANTITY_BASIS.join(", ")}`
      );
    }

    if (args.direction && !VALID_DIRECTIONS.includes(args.direction)) {
      throw new Error(
        `Direccion invalida: "${args.direction}". Valores validos: ${VALID_DIRECTIONS.join(", ")}`
      );
    }

    const patch: Record<string, unknown> = {};
    if (args.productId !== undefined) patch.product_id = args.productId;
    if (args.quantity !== undefined) patch.quantity = args.quantity;
    if (args.unitId !== undefined) patch.unit_id = args.unitId;
    if (args.quantityBasis !== undefined) patch.quantity_basis = args.quantityBasis;
    if (args.direction !== undefined) patch.direction = args.direction;
    if (args.applicationRate !== undefined) patch.application_rate = args.applicationRate;
    if (args.applicationMethod !== undefined) patch.application_method = args.applicationMethod;
    if (args.isRequired !== undefined) patch.is_required = args.isRequired;
    if (args.alternativeProductIds !== undefined) patch.alternative_product_ids = args.alternativeProductIds;
    if (args.notes !== undefined) patch.notes = args.notes;

    await ctx.db.patch(args.resourceId, patch);
    return args.resourceId;
  },
});

/**
 * Remove a resource from a template.
 */
export const removeResource = mutation({
  args: {
    resourceId: v.id("activity_template_resources"),
  },
  handler: async (ctx, { resourceId }) => {
    const resource = await ctx.db.get(resourceId);
    if (!resource) {
      throw new Error(`Recurso no encontrado: ${resourceId}`);
    }
    await ctx.db.delete(resourceId);
    return resourceId;
  },
});

/**
 * Reorder resources within a template.
 */
export const reorderResources = mutation({
  args: {
    templateId: v.id("activity_templates"),
    resourceIds: v.array(v.id("activity_template_resources")),
  },
  handler: async (ctx, { templateId, resourceIds }) => {
    const template = await ctx.db.get(templateId);
    if (!template) {
      throw new Error(`Template no encontrado: ${templateId}`);
    }

    for (let i = 0; i < resourceIds.length; i++) {
      await ctx.db.patch(resourceIds[i], { sequence: i + 1 });
    }

    return { reordered: resourceIds.length };
  },
});

// ============================================================================
// MUTATIONS — Checklist
// ============================================================================

/**
 * Get checklist items for a template, ordered by step_number.
 */
export const getChecklist = query({
  args: {
    templateId: v.id("activity_templates"),
  },
  handler: async (ctx, { templateId }) => {
    const items = await ctx.db
      .query("activity_template_checklist")
      .withIndex("by_template", (q) => q.eq("template_id", templateId))
      .collect();

    return items.sort((a, b) => a.step_number - b.step_number);
  },
});

/**
 * Add a checklist item to a template.
 * Auto-assigns step_number at the end.
 */
export const addChecklistItem = mutation({
  args: {
    templateId: v.id("activity_templates"),
    title: v.string(),
    description: v.optional(v.string()),
    isRequired: v.boolean(),
    requiresPhoto: v.boolean(),
    requiresValue: v.boolean(),
    valueType: v.optional(v.string()),
    valueOptions: v.optional(v.array(v.string())),
    valueMin: v.optional(v.number()),
    valueMax: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.templateId);
    if (!template) {
      throw new Error(`Template no encontrado: ${args.templateId}`);
    }

    if (args.valueType && !VALID_VALUE_TYPES.includes(args.valueType)) {
      throw new Error(
        `Tipo de valor invalido: "${args.valueType}". Valores validos: ${VALID_VALUE_TYPES.join(", ")}`
      );
    }

    // Auto-assign step_number at the end
    const existing = await ctx.db
      .query("activity_template_checklist")
      .withIndex("by_template", (q) => q.eq("template_id", args.templateId))
      .collect();
    const maxStep = existing.reduce((max, item) => Math.max(max, item.step_number), 0);

    return await ctx.db.insert("activity_template_checklist", {
      template_id: args.templateId,
      step_number: maxStep + 1,
      title: args.title,
      description: args.description,
      is_required: args.isRequired,
      requires_photo: args.requiresPhoto,
      requires_value: args.requiresValue,
      value_type: args.valueType,
      value_options: args.valueOptions,
      value_min: args.valueMin,
      value_max: args.valueMax,
      created_at: Date.now(),
    });
  },
});

/**
 * Update a checklist item.
 */
export const updateChecklistItem = mutation({
  args: {
    itemId: v.id("activity_template_checklist"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    isRequired: v.optional(v.boolean()),
    requiresPhoto: v.optional(v.boolean()),
    requiresValue: v.optional(v.boolean()),
    valueType: v.optional(v.string()),
    valueOptions: v.optional(v.array(v.string())),
    valueMin: v.optional(v.number()),
    valueMax: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error(`Item de checklist no encontrado: ${args.itemId}`);
    }

    if (args.valueType && !VALID_VALUE_TYPES.includes(args.valueType)) {
      throw new Error(
        `Tipo de valor invalido: "${args.valueType}". Valores validos: ${VALID_VALUE_TYPES.join(", ")}`
      );
    }

    const patch: Record<string, unknown> = {};
    if (args.title !== undefined) patch.title = args.title;
    if (args.description !== undefined) patch.description = args.description;
    if (args.isRequired !== undefined) patch.is_required = args.isRequired;
    if (args.requiresPhoto !== undefined) patch.requires_photo = args.requiresPhoto;
    if (args.requiresValue !== undefined) patch.requires_value = args.requiresValue;
    if (args.valueType !== undefined) patch.value_type = args.valueType;
    if (args.valueOptions !== undefined) patch.value_options = args.valueOptions;
    if (args.valueMin !== undefined) patch.value_min = args.valueMin;
    if (args.valueMax !== undefined) patch.value_max = args.valueMax;

    await ctx.db.patch(args.itemId, patch);
    return args.itemId;
  },
});

/**
 * Remove a checklist item.
 */
export const removeChecklistItem = mutation({
  args: {
    itemId: v.id("activity_template_checklist"),
  },
  handler: async (ctx, { itemId }) => {
    const item = await ctx.db.get(itemId);
    if (!item) {
      throw new Error(`Item de checklist no encontrado: ${itemId}`);
    }
    await ctx.db.delete(itemId);
    return itemId;
  },
});

/**
 * Reorder checklist items within a template.
 */
export const reorderChecklist = mutation({
  args: {
    templateId: v.id("activity_templates"),
    itemIds: v.array(v.id("activity_template_checklist")),
  },
  handler: async (ctx, { templateId, itemIds }) => {
    const template = await ctx.db.get(templateId);
    if (!template) {
      throw new Error(`Template no encontrado: ${templateId}`);
    }

    for (let i = 0; i < itemIds.length; i++) {
      await ctx.db.patch(itemIds[i], { step_number: i + 1 });
    }

    return { reordered: itemIds.length };
  },
});
