import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

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
    resources: v.optional(
      v.array(
        v.object({
          productId: v.id("products"),
          templateResourceId: v.optional(v.id("activity_template_resources")),
          quantity: v.number(),
          unitId: v.optional(v.id("units_of_measure")),
          quantityBasis: v.string(),
          direction: v.string(),
          applicationRate: v.optional(v.string()),
          applicationMethod: v.optional(v.string()),
          isRequired: v.boolean(),
          notes: v.optional(v.string()),
        })
      )
    ),
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
        activity_type: activityType.code,
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

      // Materialize resources for this scheduled activity
      if (args.resources && args.resources.length > 0) {
        for (let seq = 0; seq < args.resources.length; seq++) {
          const res = args.resources[seq];
          await ctx.db.insert("scheduled_activity_resources", {
            scheduled_activity_id: id,
            template_resource_id: res.templateResourceId,
            product_id: res.productId,
            direction: res.direction,
            quantity_basis: res.quantityBasis,
            template_quantity: res.quantity,
            quantity_override: res.quantity, // User-edited quantity goes to override
            unit_id: res.unitId,
            application_rate: res.applicationRate,
            application_method: res.applicationMethod,
            is_required: res.isRequired,
            sequence: seq,
            notes: res.notes,
            created_at: now,
          });
        }
      }

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

/**
 * Unified query for the ActivitySchedule component.
 * Accepts a discriminated scope and returns enriched activities.
 */
export const listForSchedule = query({
  args: {
    companyId: v.id("companies"),
    scope: v.union(
      v.object({ type: v.literal("global") }),
      v.object({ type: v.literal("batch"), batchId: v.id("batches") }),
      v.object({ type: v.literal("order"), orderId: v.id("production_orders") }),
      v.object({ type: v.literal("area"), areaId: v.id("areas") }),
      v.object({ type: v.literal("phase"), areaId: v.id("areas"), phase: v.string() }),
    ),
    dateStart: v.optional(v.number()),
    dateEnd: v.optional(v.number()),
    status: v.optional(v.string()),
    typeId: v.optional(v.id("activity_types")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { companyId, scope, dateStart, dateEnd, status, typeId } = args;
    const limit = args.limit ?? 50;

    // ── Step 1: Fetch raw activities based on scope ──

    let activities: Doc<"scheduled_activities">[] = [];

    if (scope.type === "global") {
      // Use by_company_date index — date filtering done in-memory
      activities = await ctx.db
        .query("scheduled_activities")
        .withIndex("by_company_date", (idx) => idx.eq("company_id", companyId))
        .collect();
    } else if (scope.type === "batch") {
      // Use by_entity index for specific batch
      const items = await ctx.db
        .query("scheduled_activities")
        .withIndex("by_entity", (q) =>
          q.eq("entity_type", "batch").eq("entity_id", scope.batchId)
        )
        .collect();
      activities = items;
    } else if (scope.type === "order") {
      // Use by_order_date index — date filtering done in-memory
      activities = await ctx.db
        .query("scheduled_activities")
        .withIndex("by_order_date", (idx) => idx.eq("production_order_id", scope.orderId))
        .collect();
    } else if (scope.type === "area" || scope.type === "phase") {
      // 2-step: fetch batches in area, then activities for each batch
      let batches = await ctx.db
        .query("batches")
        .withIndex("by_area", (q) => q.eq("area_id", scope.areaId))
        .collect();

      // Only active batches
      batches = batches.filter((b) => b.status === "active");

      // For phase scope, further filter by current_phase
      if (scope.type === "phase") {
        batches = batches.filter((b) => b.current_phase === scope.phase);
      }

      // Fetch activities for each batch in parallel
      const batchActivities = await Promise.all(
        batches.map((batch) =>
          ctx.db
            .query("scheduled_activities")
            .withIndex("by_entity", (q) =>
              q.eq("entity_type", "batch").eq("entity_id", batch._id)
            )
            .collect()
        )
      );
      activities = batchActivities.flat();
    }

    // ── Step 2: In-memory filters ──

    if (dateStart !== undefined) {
      activities = activities.filter((a) => a.scheduled_date >= dateStart);
    }
    if (dateEnd !== undefined) {
      activities = activities.filter((a) => a.scheduled_date <= dateEnd);
    }
    if (status) {
      activities = activities.filter((a) => a.status === status);
    }
    if (typeId) {
      activities = activities.filter((a) => a.type_id === typeId);
    }

    // Sort by scheduled_date
    activities.sort((a, b) => a.scheduled_date - b.scheduled_date);

    // Apply limit for global and order scopes
    if (scope.type === "global" || scope.type === "order") {
      activities = activities.slice(0, limit);
    }

    // ── Step 3: Enrichment ──

    // Build batch cache for enrichment
    const batchIds = new Set<string>();
    const typeIds = new Set<string>();
    const templateIds = new Set<string>();
    const userIds = new Set<string>();

    for (const a of activities) {
      if (a.entity_type === "batch" && a.entity_id) batchIds.add(a.entity_id as string);
      if (a.type_id) typeIds.add(a.type_id as string);
      if (a.template_id) templateIds.add(a.template_id as string);
      if (a.assigned_to) userIds.add(a.assigned_to as string);
    }

    // Fetch all related entities in parallel
    const [batchMap, typeMap, templateMap, userMap] = await Promise.all([
      Promise.all(
        [...batchIds].map(async (id) => {
          const batch = await ctx.db.get(id as Id<"batches">);
          return [id, batch] as const;
        })
      ).then((entries) => new Map(entries)),
      Promise.all(
        [...typeIds].map(async (id) => {
          const type = await ctx.db.get(id as Id<"activity_types">);
          return [id, type] as const;
        })
      ).then((entries) => new Map(entries)),
      Promise.all(
        [...templateIds].map(async (id) => {
          const tpl = await ctx.db.get(id as Id<"activity_templates">);
          return [id, tpl] as const;
        })
      ).then((entries) => new Map(entries)),
      Promise.all(
        [...userIds].map(async (id) => {
          const user = await ctx.db.get(id as Id<"users">);
          return [id, user] as const;
        })
      ).then((entries) => new Map(entries)),
    ]);

    // For global/order scope, enrich with area name from batch
    const areaIds = new Set<string>();
    if (scope.type === "global" || scope.type === "order") {
      for (const [, batch] of batchMap) {
        if (batch?.area_id) areaIds.add(batch.area_id as string);
      }
    }
    const areaMap = areaIds.size > 0
      ? await Promise.all(
          [...areaIds].map(async (id) => {
            const area = await ctx.db.get(id as Id<"areas">);
            return [id, area] as const;
          })
        ).then((entries) => new Map(entries))
      : new Map<string, null>();

    // ── Step 4: Resource counts (batch query) ──
    const resourceCountMap = new Map<string, number>();
    await Promise.all(
      activities.map(async (a) => {
        const resources = await ctx.db
          .query("scheduled_activity_resources")
          .withIndex("by_scheduled_activity", (q) =>
            q.eq("scheduled_activity_id", a._id)
          )
          .collect();
        resourceCountMap.set(a._id as string, resources.length);
      })
    );

    return activities.map((a) => {
      const batch = a.entity_type === "batch" && a.entity_id
        ? batchMap.get(a.entity_id as string) ?? null
        : null;
      const activityType = a.type_id
        ? typeMap.get(a.type_id as string) ?? null
        : null;
      const template = a.template_id
        ? templateMap.get(a.template_id as string) ?? null
        : null;
      const assignedUser = a.assigned_to
        ? userMap.get(a.assigned_to as string) ?? null
        : null;
      const area = batch?.area_id
        ? areaMap.get(batch.area_id as string) ?? null
        : null;

      return {
        ...a,
        batchCode: batch?.batch_code ?? null,
        batchPhase: batch?.current_phase ?? null,
        activityTypeName: activityType?.name ?? null,
        activityTypeIcon: activityType?.icon ?? null,
        activityTypeColor: activityType?.color ?? null,
        templateName: template?.name ?? null,
        assignedToName: assignedUser?.name ?? null,
        areaName: area?.name ?? null,
        resourceCount: resourceCountMap.get(a._id as string) ?? 0,
      };
    });
  },
});

/**
 * Get a single scheduled activity by ID, with full enrichment.
 */
export const getById = query({
  args: {
    scheduledActivityId: v.id("scheduled_activities"),
  },
  handler: async (ctx, { scheduledActivityId }) => {
    const activity = await ctx.db.get(scheduledActivityId);
    if (!activity) return null;

    const [batch, activityType, template, assignedUser] = await Promise.all([
      activity.entity_type === "batch" && activity.entity_id
        ? ctx.db.get(activity.entity_id as Id<"batches">)
        : null,
      activity.type_id ? ctx.db.get(activity.type_id) : null,
      activity.template_id ? ctx.db.get(activity.template_id) : null,
      activity.assigned_to ? ctx.db.get(activity.assigned_to) : null,
    ]);

    const area = batch?.area_id ? await ctx.db.get(batch.area_id) : null;

    return {
      ...activity,
      batchCode: batch?.batch_code ?? null,
      batchId: batch?._id ?? null,
      batchPhase: batch?.current_phase ?? null,
      areaName: area?.name ?? null,
      areaId: area?._id ?? null,
      activityTypeName: activityType?.name ?? null,
      activityTypeIcon: activityType?.icon ?? null,
      activityTypeColor: activityType?.color ?? null,
      activityTypeCategory: activityType?.category ?? null,
      templateName: template?.name ?? null,
      assignedToName: assignedUser?.name ?? null,
    };
  },
});

/**
 * Update a scheduled activity (only pending or in_progress).
 */
export const update = mutation({
  args: {
    scheduledActivityId: v.id("scheduled_activities"),
    scheduledDate: v.optional(v.number()),
    assignedTo: v.optional(v.id("users")),
    instructions: v.optional(v.string()),
    estimatedDurationMinutes: v.optional(v.number()),
    priority: v.optional(v.string()),
  },
  handler: async (ctx, { scheduledActivityId, ...updates }) => {
    const activity = await ctx.db.get(scheduledActivityId);
    if (!activity) throw new Error("Actividad no encontrada");
    if (activity.status === "completed" || activity.status === "skipped") {
      throw new Error("No se puede editar una actividad completada o saltada");
    }

    const patch: Record<string, unknown> = { updated_at: Date.now() };
    if (updates.scheduledDate !== undefined) patch.scheduled_date = updates.scheduledDate;
    if (updates.assignedTo !== undefined) patch.assigned_to = updates.assignedTo;
    if (updates.instructions !== undefined) patch.instructions = updates.instructions;
    if (updates.estimatedDurationMinutes !== undefined)
      patch.estimated_duration_minutes = updates.estimatedDurationMinutes;
    if (updates.priority !== undefined) patch.activity_metadata = {
      ...(activity.activity_metadata as Record<string, unknown> ?? {}),
      priority: updates.priority,
    };

    await ctx.db.patch(scheduledActivityId, patch);
    return scheduledActivityId;
  },
});

// ============================================================================
// QUERIES — Materialized resources
// ============================================================================

/**
 * Get materialized resources for a specific scheduled activity.
 * Returns enriched resources with product names, unit symbols, and effective quantity.
 */
export const getResourcesForActivity = query({
  args: {
    scheduledActivityId: v.id("scheduled_activities"),
  },
  handler: async (ctx, { scheduledActivityId }) => {
    const resources = await ctx.db
      .query("scheduled_activity_resources")
      .withIndex("by_scheduled_activity", (q) =>
        q.eq("scheduled_activity_id", scheduledActivityId)
      )
      .collect();

    const enriched = await Promise.all(
      resources
        .sort((a, b) => a.sequence - b.sequence)
        .map(async (r) => {
          const product = await ctx.db.get(r.product_id);
          const unit = r.unit_id ? await ctx.db.get(r.unit_id) : null;
          return {
            ...r,
            productName: product?.name ?? "Producto desconocido",
            productCode: (product as any)?.code ?? null,
            unitName: unit?.name ?? null,
            unitSymbol: unit?.symbol ?? null,
            effectiveQuantity:
              r.quantity_override ?? r.materialized_quantity ?? r.template_quantity,
          };
        })
    );

    return enriched;
  },
});

/**
 * Create a scheduled activity for a production order (from phase detail page)
 */
export const createForOrder = mutation({
  args: {
    orderId: v.id("production_orders"),
    typeId: v.id("activity_types"),
    activityTemplateId: v.optional(v.id("activity_templates")),
    scheduledDate: v.number(),
    estimatedDurationMinutes: v.optional(v.number()),
    instructions: v.optional(v.string()),
    activityName: v.optional(v.string()),
    phaseId: v.optional(v.id("order_phases")),
    phaseRole: v.optional(v.union(v.literal("entry"), v.literal("exit"))),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Validate order exists
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    // Resolve activity type code from type_id
    const actType = await ctx.db.get(args.typeId);
    if (!actType) {
      throw new Error("Activity type not found");
    }

    const activityId = await ctx.db.insert("scheduled_activities", {
      entity_type: "production_order",
      entity_id: args.orderId,
      activity_type: actType.code,
      production_order_id: args.orderId,
      type_id: args.typeId,
      template_id: args.activityTemplateId,
      scheduled_date: args.scheduledDate,
      estimated_duration_minutes: args.estimatedDurationMinutes,
      instructions: args.instructions,
      source: "manual",
      status: "pending",
      is_recurring: false,
      assigned_team: [],
      required_materials: [],
      required_equipment: [],
      company_id: order.company_id,
      phase_role: args.phaseRole,
      order_phase_id: args.phaseId,
      created_at: now,
      updated_at: now,
    });

    // If activity template provided, materialize its resources
    if (args.activityTemplateId) {
      const templateResources = await ctx.db
        .query("activity_template_resources")
        .withIndex("by_template", (q) =>
          q.eq("template_id", args.activityTemplateId!)
        )
        .collect();

      for (let seq = 0; seq < templateResources.length; seq++) {
        const res = templateResources[seq];
        await ctx.db.insert("scheduled_activity_resources", {
          scheduled_activity_id: activityId,
          template_resource_id: res._id,
          product_id: res.product_id,
          direction: res.direction,
          quantity_basis: res.quantity_basis,
          template_quantity: res.quantity,
          quantity_override: res.quantity,
          unit_id: res.unit_id,
          application_rate: res.application_rate,
          application_method: res.application_method,
          is_required: res.is_required,
          sequence: seq,
          notes: res.notes,
          created_at: now,
        });
      }
    }

    return activityId;
  },
});
