/**
 * Production Orders Queries and Mutations
 * Module 24: Production Orders for managing production workflows
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Generate order number in format ORD-YYYY-XXXX
 */
async function generateOrderNumber(
  ctx: any,
  companyId: Id<"companies">
): Promise<string> {
  const year = new Date().getFullYear();

  // Count existing orders for this company this year
  const orders = await ctx.db
    .query("production_orders")
    .withIndex("by_company", (q: any) => q.eq("company_id", companyId))
    .collect();

  const ordersThisYear = orders.filter((o: any) => {
    const orderYear = new Date(o.created_at).getFullYear();
    return orderYear === year;
  });

  const sequence = (ordersThisYear.length + 1).toString().padStart(4, "0");
  return `ORD-${year}-${sequence}`;
}

/**
 * List production orders for a company
 */
export const list = query({
  args: {
    companyId: v.id("companies"),
    facilityId: v.optional(v.id("facilities")),
    status: v.optional(v.string()),
    templateId: v.optional(v.id("production_templates")),
  },
  handler: async (ctx, args) => {
    let orders = await ctx.db
      .query("production_orders")
      .withIndex("by_company", (q) => q.eq("company_id", args.companyId))
      .collect();

    // Apply filters
    if (args.facilityId) {
      orders = orders.filter((o) => o.target_facility_id === args.facilityId);
    }

    if (args.status) {
      orders = orders.filter((o) => o.status === args.status);
    }

    if (args.templateId) {
      orders = orders.filter((o) => o.template_id === args.templateId);
    }

    // Enrich with related data
    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const facility = await ctx.db.get(order.target_facility_id);
        const template = order.template_id
          ? await ctx.db.get(order.template_id)
          : null;
        const cultivar = order.cultivar_id
          ? await ctx.db.get(order.cultivar_id)
          : null;
        const cropType = await ctx.db.get(order.crop_type_id);

        // Count batches for this order
        const batches = await ctx.db
          .query("batches")
          .withIndex("by_production_order", (q) =>
            q.eq("production_order_id", order._id)
          )
          .collect();

        // Get current phase name if exists
        let currentPhaseName = null;
        if (order.current_phase_id) {
          const currentPhase = await ctx.db.get(order.current_phase_id);
          currentPhaseName = currentPhase?.phase_name || null;
        }

        return {
          ...order,
          facilityName: facility?.name || null,
          templateName: template?.name || null,
          cultivarName: cultivar?.name || null,
          cropTypeName: cropType?.name || null,
          batchesCount: batches.length,
          activeBatchesCount: batches.filter((b) => b.status === "active")
            .length,
          currentPhaseName,
        };
      })
    );

    // Sort by creation date descending
    return enrichedOrders.sort((a, b) => b.created_at - a.created_at);
  },
});

/**
 * Get production order by ID with full details
 */
export const getById = query({
  args: {
    orderId: v.id("production_orders"),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      return null;
    }

    // Get related entities
    const facility = await ctx.db.get(order.target_facility_id);
    const template = order.template_id
      ? await ctx.db.get(order.template_id)
      : null;
    const cultivar = order.cultivar_id
      ? await ctx.db.get(order.cultivar_id)
      : null;
    const cropType = await ctx.db.get(order.crop_type_id);
    const area = order.target_area_id
      ? await ctx.db.get(order.target_area_id)
      : null;
    const requestedBy = await ctx.db.get(order.requested_by);
    const approvedBy = order.approved_by
      ? await ctx.db.get(order.approved_by)
      : null;

    // Get order phases sorted by order
    const phases = await ctx.db
      .query("order_phases")
      .withIndex("by_order", (q) => q.eq("order_id", args.orderId))
      .collect();
    const sortedPhases = phases.sort((a, b) => a.phase_order - b.phase_order);

    // Get batches for this order
    const batches = await ctx.db
      .query("batches")
      .withIndex("by_production_order", (q) =>
        q.eq("production_order_id", args.orderId)
      )
      .collect();

    // Enrich batches
    const enrichedBatches = await Promise.all(
      batches.map(async (batch) => {
        const batchArea = batch.area_id ? await ctx.db.get(batch.area_id) : null;
        const batchCultivar = batch.cultivar_id
          ? await ctx.db.get(batch.cultivar_id)
          : null;
        return {
          ...batch,
          areaName: batchArea?.name || null,
          cultivarName: batchCultivar?.name || null,
        };
      })
    );

    // Get scheduled activities for this order
    const activities = await ctx.db
      .query("scheduled_activities")
      .filter((q) =>
        q.eq(q.field("production_order_id"), args.orderId)
      )
      .collect();

    // Enrich phases with areas
    const enrichedPhases = await Promise.all(
      sortedPhases.map(async (phase) => {
        const phaseArea = phase.area_id
          ? await ctx.db.get(phase.area_id)
          : null;
        return {
          ...phase,
          areaName: phaseArea?.name || null,
        };
      })
    );

    return {
      ...order,
      facilityName: facility?.name || null,
      templateName: template?.name || null,
      cultivarName: cultivar?.name || null,
      cropTypeName: cropType?.name || null,
      areaName: area?.name || null,
      requestedByName: requestedBy
        ? `${requestedBy.first_name || ""} ${requestedBy.last_name || ""}`.trim()
        : null,
      approvedByName: approvedBy
        ? `${approvedBy.first_name || ""} ${approvedBy.last_name || ""}`.trim()
        : null,
      phases: enrichedPhases,
      batches: enrichedBatches,
      activitiesCount: activities.length,
      pendingActivitiesCount: activities.filter(
        (a) => a.status === "pending"
      ).length,
      completedActivitiesCount: activities.filter(
        (a) => a.status === "completed"
      ).length,
    };
  },
});

/**
 * Get stats for production orders dashboard
 */
export const getStats = query({
  args: {
    companyId: v.id("companies"),
    facilityId: v.optional(v.id("facilities")),
  },
  handler: async (ctx, args) => {
    let orders = await ctx.db
      .query("production_orders")
      .withIndex("by_company", (q) => q.eq("company_id", args.companyId))
      .collect();

    if (args.facilityId) {
      orders = orders.filter((o) => o.target_facility_id === args.facilityId);
    }

    const activeOrders = orders.filter((o) => o.status === "active");
    const planningOrders = orders.filter((o) => o.status === "planning");
    const completedOrders = orders.filter((o) => o.status === "completed");

    // Calculate total plants
    let totalPlantsPlanned = 0;
    let totalPlantsActual = 0;
    activeOrders.forEach((o) => {
      totalPlantsPlanned += o.total_plants_planned || 0;
      totalPlantsActual += o.total_plants_actual || 0;
    });

    // Calculate average completion percentage
    const avgCompletion =
      activeOrders.length > 0
        ? activeOrders.reduce((sum, o) => sum + (o.completion_percentage || 0), 0) /
          activeOrders.length
        : 0;

    return {
      totalOrders: orders.length,
      activeOrders: activeOrders.length,
      planningOrders: planningOrders.length,
      completedOrders: completedOrders.length,
      totalPlantsPlanned,
      totalPlantsActual,
      averageCompletion: Math.round(avgCompletion),
    };
  },
});

/**
 * Create a new production order
 */
export const create = mutation({
  args: {
    companyId: v.id("companies"),
    facilityId: v.id("facilities"),
    templateId: v.optional(v.id("production_templates")),
    cropTypeId: v.id("crop_types"),
    cultivarId: v.optional(v.id("cultivars")),
    orderType: v.string(),
    sourceType: v.string(),
    requestedQuantity: v.number(),
    batchSize: v.optional(v.number()),
    enableIndividualTracking: v.optional(v.boolean()),
    targetAreaId: v.optional(v.id("areas")),
    plannedStartDate: v.optional(v.number()),
    requestedDeliveryDate: v.optional(v.number()),
    estimatedYield: v.optional(v.number()),
    yieldUnit: v.optional(v.string()),
    estimatedCost: v.optional(v.number()),
    priority: v.optional(v.string()),
    notes: v.optional(v.string()),
    requestedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Generate order number
    const orderNumber = await generateOrderNumber(ctx, args.companyId);

    // Validate facility
    const facility = await ctx.db.get(args.facilityId);
    if (!facility || facility.company_id !== args.companyId) {
      throw new Error("Facility not found or does not belong to company");
    }

    // Validate crop type
    const cropType = await ctx.db.get(args.cropTypeId);
    if (!cropType) {
      throw new Error("Crop type not found");
    }

    // Validate cultivar if provided
    if (args.cultivarId) {
      const cultivar = await ctx.db.get(args.cultivarId);
      if (!cultivar || cultivar.crop_type_id !== args.cropTypeId) {
        throw new Error("Cultivar not found or incompatible with crop type");
      }
    }

    // Get template info if provided
    let estimatedDurationDays = 0;
    if (args.templateId) {
      const template = await ctx.db.get(args.templateId);
      if (!template) {
        throw new Error("Template not found");
      }
      estimatedDurationDays = template.estimated_duration_days || 0;
    }

    // Calculate estimated completion date
    const plannedStart = args.plannedStartDate || now;
    const estimatedCompletion = estimatedDurationDays
      ? plannedStart + estimatedDurationDays * 24 * 60 * 60 * 1000
      : undefined;

    // Create production order
    const orderId = await ctx.db.insert("production_orders", {
      order_number: orderNumber,
      company_id: args.companyId,
      target_facility_id: args.facilityId,
      template_id: args.templateId,
      crop_type_id: args.cropTypeId,
      cultivar_id: args.cultivarId,
      order_type: args.orderType,
      source_type: args.sourceType,
      requested_quantity: args.requestedQuantity,
      unit_of_measure: "plants",
      batch_size: args.batchSize,
      enable_individual_tracking: args.enableIndividualTracking || false,
      target_area_id: args.targetAreaId,
      current_phase_id: undefined,
      total_plants_planned: args.requestedQuantity,
      total_plants_actual: 0,
      estimated_yield: args.estimatedYield,
      actual_yield: undefined,
      yield_unit: args.yieldUnit,
      planned_start_date: plannedStart,
      estimated_completion_date: estimatedCompletion,
      requested_delivery_date: args.requestedDeliveryDate,
      actual_start_date: undefined,
      actual_completion_date: undefined,
      estimated_cost: args.estimatedCost,
      actual_cost: undefined,
      transport_manifest_required: false,
      phytosanitary_cert_required: false,
      regulatory_documentation: {},
      requested_by: args.requestedBy,
      approved_by: undefined,
      approval_date: undefined,
      status: "planning",
      priority: args.priority || "normal",
      completion_percentage: 0,
      cancellation_reason: undefined,
      notes: args.notes,
      created_at: now,
      updated_at: now,
    });

    // If template provided, create order phases and scheduled activities from template
    if (args.templateId) {
      const templatePhases = await ctx.db
        .query("template_phases")
        .withIndex("by_template", (q) => q.eq("template_id", args.templateId!))
        .collect();

      const sortedPhases = templatePhases.sort(
        (a, b) => a.phase_order - b.phase_order
      );

      let phaseStartDate = plannedStart;
      const phaseStartDates: Map<string, number> = new Map();
      const phaseEndDates: Map<string, number> = new Map();

      // First pass: create phases and calculate dates
      for (const templatePhase of sortedPhases) {
        const phaseEndDate =
          phaseStartDate +
          templatePhase.estimated_duration_days * 24 * 60 * 60 * 1000;

        await ctx.db.insert("order_phases", {
          order_id: orderId,
          template_phase_id: templatePhase._id,
          phase_name: templatePhase.phase_name,
          phase_order: templatePhase.phase_order,
          planned_start_date: phaseStartDate,
          actual_start_date: undefined,
          planned_end_date: phaseEndDate,
          actual_end_date: undefined,
          area_id: undefined,
          status: "pending",
          completion_notes: undefined,
          created_at: now,
        });

        phaseStartDates.set(templatePhase._id, phaseStartDate);
        phaseEndDates.set(templatePhase._id, phaseEndDate);
        phaseStartDate = phaseEndDate;
      }

      // Second pass: create scheduled activities from template activities
      const scheduledActivityMap: Map<string, Id<"scheduled_activities">[]> = new Map();
      const DAY_MS = 24 * 60 * 60 * 1000;

      for (const templatePhase of sortedPhases) {
        const phaseStart = phaseStartDates.get(templatePhase._id) || plannedStart;
        const phaseEnd = phaseEndDates.get(templatePhase._id) || plannedStart;

        // Get template activities for this phase
        const templateActivities = await ctx.db
          .query("template_activities")
          .withIndex("by_phase", (q) => q.eq("phase_id", templatePhase._id))
          .collect();

        const sortedActivities = templateActivities.sort(
          (a, b) => a.activity_order - b.activity_order
        );

        for (const templateActivity of sortedActivities) {
          const timing = templateActivity.timing_configuration as any;
          const scheduleDates: number[] = [];

          if (!timing) {
            // Default: one-time on day 1
            scheduleDates.push(phaseStart);
          } else if (timing.type === "one_time") {
            // One-time: specific day of the phase
            const dayOffset = (timing.phaseDay || 1) - 1;
            scheduleDates.push(phaseStart + dayOffset * DAY_MS);
          } else if (timing.type === "recurring") {
            const startDay = timing.startDay || 1;
            const endDay = timing.endDay || Math.floor((phaseEnd - phaseStart) / DAY_MS) + 1;

            if (timing.frequencyType === "daily_range") {
              // Daily from startDay to endDay
              for (let day = startDay; day <= endDay; day++) {
                scheduleDates.push(phaseStart + (day - 1) * DAY_MS);
              }
            } else if (timing.frequencyType === "specific_days") {
              // Specific days of week
              const daysOfWeek = timing.daysOfWeek || [];
              const dayMap: Record<string, number> = {
                sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
                thursday: 4, friday: 5, saturday: 6,
              };

              for (let day = startDay; day <= endDay; day++) {
                const date = new Date(phaseStart + (day - 1) * DAY_MS);
                const weekDay = date.getDay();
                if (daysOfWeek.some((d: string) => dayMap[d.toLowerCase()] === weekDay)) {
                  scheduleDates.push(phaseStart + (day - 1) * DAY_MS);
                }
              }
            } else if (timing.frequencyType === "every_n_days") {
              // Every N days
              const interval = timing.intervalDays || 1;
              for (let day = startDay; day <= endDay; day += interval) {
                scheduleDates.push(phaseStart + (day - 1) * DAY_MS);
              }
            }
          } else if (timing.type === "dependent") {
            // Dependent activities - handled after all others
            // For now, default to phase start + daysAfter
            const daysAfter = timing.daysAfter || 0;
            scheduleDates.push(phaseStart + daysAfter * DAY_MS);
          }

          // Create scheduled activities
          const createdActivityIds: Id<"scheduled_activities">[] = [];
          for (const scheduleDate of scheduleDates) {
            const activityId = await ctx.db.insert("scheduled_activities", {
              entity_type: "production_order",
              entity_id: orderId,
              activity_type: templateActivity.activity_type,
              activity_template_id: templateActivity._id,
              production_order_id: orderId,
              scheduled_date: scheduleDate,
              estimated_duration_minutes: templateActivity.estimated_duration_minutes,
              is_recurring: scheduleDates.length > 1,
              recurring_pattern: timing?.frequencyType || undefined,
              recurring_end_date: scheduleDates.length > 1 ? scheduleDates[scheduleDates.length - 1] : undefined,
              parent_recurring_id: undefined,
              assigned_to: undefined,
              assigned_team: [],
              required_materials: templateActivity.required_materials || [],
              required_equipment: [],
              quality_check_template_id: templateActivity.quality_check_template_id,
              instructions: templateActivity.instructions,
              activity_metadata: {},
              status: "pending",
              actual_start_time: undefined,
              actual_end_time: undefined,
              completed_by: undefined,
              completion_notes: undefined,
              execution_results: undefined,
              execution_variance: undefined,
              created_at: now,
              updated_at: now,
            });
            createdActivityIds.push(activityId);
          }

          scheduledActivityMap.set(templateActivity._id, createdActivityIds);
        }
      }

      // Update template usage count
      const template = await ctx.db.get(args.templateId);
      if (template) {
        await ctx.db.patch(args.templateId, {
          usage_count: template.usage_count + 1,
          last_used_date: now,
          updated_at: now,
        });
      }
    }

    return orderId;
  },
});

/**
 * Update a production order
 */
export const update = mutation({
  args: {
    orderId: v.id("production_orders"),
    cultivarId: v.optional(v.id("cultivars")),
    targetAreaId: v.optional(v.id("areas")),
    plannedStartDate: v.optional(v.number()),
    requestedDeliveryDate: v.optional(v.number()),
    estimatedYield: v.optional(v.number()),
    yieldUnit: v.optional(v.string()),
    estimatedCost: v.optional(v.number()),
    priority: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    // Can only update if in planning status
    if (order.status !== "planning") {
      throw new Error("Cannot update order that is not in planning status");
    }

    const updates: Record<string, unknown> = {
      updated_at: now,
    };

    if (args.cultivarId !== undefined) updates.cultivar_id = args.cultivarId;
    if (args.targetAreaId !== undefined) updates.target_area_id = args.targetAreaId;
    if (args.plannedStartDate !== undefined)
      updates.planned_start_date = args.plannedStartDate;
    if (args.requestedDeliveryDate !== undefined)
      updates.requested_delivery_date = args.requestedDeliveryDate;
    if (args.estimatedYield !== undefined)
      updates.estimated_yield = args.estimatedYield;
    if (args.yieldUnit !== undefined) updates.yield_unit = args.yieldUnit;
    if (args.estimatedCost !== undefined)
      updates.estimated_cost = args.estimatedCost;
    if (args.priority !== undefined) updates.priority = args.priority;
    if (args.notes !== undefined) updates.notes = args.notes;

    await ctx.db.patch(args.orderId, updates);

    return { success: true, message: "Order updated successfully" };
  },
});

/**
 * Generate batch code in format CULTIVAR-YYMMDD-XXX
 */
async function generateBatchCode(
  ctx: any,
  cultivar: any,
  companyId: Id<"companies">
): Promise<string> {
  const now = new Date();
  const dateStr = now.toISOString().slice(2, 10).replace(/-/g, "");

  // Get cultivar prefix
  const prefix = cultivar?.name
    ? cultivar.name.substring(0, 3).toUpperCase()
    : "BAT";

  // Count existing batches today
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const batches = await ctx.db.query("batches").collect();
  const todayBatches = batches.filter(
    (b: any) => b.created_date >= todayStart
  );

  const sequence = (todayBatches.length + 1).toString().padStart(3, "0");
  return `${prefix}-${dateStr}-${sequence}`;
}

/**
 * Approve and activate a production order (move from planning to active)
 * Creates batches and updates scheduled activities
 */
export const activate = mutation({
  args: {
    orderId: v.id("production_orders"),
    approvedBy: v.id("users"),
    targetAreaId: v.optional(v.id("areas")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status !== "planning") {
      throw new Error("Only orders in planning status can be activated");
    }

    // Get cultivar for batch naming
    const cultivar = order.cultivar_id
      ? await ctx.db.get(order.cultivar_id)
      : null;

    // Get order phases
    const phases = await ctx.db
      .query("order_phases")
      .withIndex("by_order", (q) => q.eq("order_id", args.orderId))
      .collect();

    const sortedPhases = phases.sort((a, b) => a.phase_order - b.phase_order);
    const firstPhase = sortedPhases[0];

    // Determine target area
    const targetAreaId = args.targetAreaId || order.target_area_id;
    if (!targetAreaId) {
      throw new Error("Target area is required for activation");
    }

    // Calculate number of batches to create
    const batchSize = order.batch_size || order.requested_quantity;
    const numBatches = Math.ceil(order.requested_quantity / batchSize);
    let remainingQuantity = order.requested_quantity;

    // Create batches
    const createdBatchIds: Id<"batches">[] = [];
    for (let i = 0; i < numBatches; i++) {
      const batchQuantity = Math.min(batchSize, remainingQuantity);
      remainingQuantity -= batchQuantity;

      const batchCode = await generateBatchCode(ctx, cultivar, order.company_id);

      const batchId = await ctx.db.insert("batches", {
        batch_code: batchCode,
        qr_code: batchCode,
        company_id: order.company_id,
        facility_id: order.target_facility_id,
        area_id: targetAreaId,
        crop_type_id: order.crop_type_id,
        cultivar_id: order.cultivar_id,
        production_order_id: args.orderId,
        template_id: order.template_id,
        parent_batch_id: undefined,
        merged_into_batch_id: undefined,
        source_batch_id: undefined,
        batch_type: "production",
        source_type: order.source_type,
        tracking_level: "batch",
        enable_individual_tracking: order.enable_individual_tracking,
        planned_quantity: batchQuantity,
        initial_quantity: batchQuantity,
        current_quantity: batchQuantity,
        lost_quantity: 0,
        unit_of_measure: order.unit_of_measure,
        mortality_rate: 0,
        current_phase: firstPhase?.phase_name || "germination",
        sample_size: undefined,
        sample_frequency: undefined,
        germination_date: undefined,
        created_date: now,
        planned_completion_date: order.estimated_completion_date,
        actual_completion_date: undefined,
        harvest_date: undefined,
        days_in_production: 0,
        quality_grade: undefined,
        quality_distribution: undefined,
        batch_metrics: {},
        environmental_history: [],
        supplier_id: undefined,
        external_lot_number: undefined,
        received_date: undefined,
        phytosanitary_certificate: undefined,
        status: "active",
        priority: order.priority,
        notes: `Created from order ${order.order_number}`,
        updated_at: now,
      });

      createdBatchIds.push(batchId);
    }

    // Update scheduled activities to link to first batch
    // (In a more complex system, activities could be distributed across batches)
    const scheduledActivities = await ctx.db
      .query("scheduled_activities")
      .filter((q) => q.eq(q.field("production_order_id"), args.orderId))
      .collect();

    for (const activity of scheduledActivities) {
      if (activity.status === "pending") {
        await ctx.db.patch(activity._id, {
          entity_type: "batch",
          entity_id: createdBatchIds[0], // Link to first batch
          updated_at: now,
        });
      }
    }

    // Update order
    await ctx.db.patch(args.orderId, {
      status: "active",
      actual_start_date: now,
      approved_by: args.approvedBy,
      approval_date: now,
      current_phase_id: firstPhase?._id,
      target_area_id: targetAreaId,
      total_plants_actual: order.requested_quantity,
      updated_at: now,
    });

    // Activate first phase
    if (firstPhase) {
      await ctx.db.patch(firstPhase._id, {
        status: "in_progress",
        actual_start_date: now,
        area_id: targetAreaId,
      });
    }

    return {
      success: true,
      message: `Order activated with ${createdBatchIds.length} batch(es) created`,
      batchIds: createdBatchIds,
    };
  },
});

/**
 * Complete a phase and move to the next
 */
export const completePhase = mutation({
  args: {
    orderId: v.id("production_orders"),
    phaseId: v.id("order_phases"),
    completionNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status !== "active") {
      throw new Error("Order must be active to complete phases");
    }

    const phase = await ctx.db.get(args.phaseId);
    if (!phase || phase.order_id !== args.orderId) {
      throw new Error("Phase not found or does not belong to order");
    }

    if (phase.status !== "in_progress") {
      throw new Error("Only in-progress phases can be completed");
    }

    // Complete current phase
    await ctx.db.patch(args.phaseId, {
      status: "completed",
      actual_end_date: now,
      completion_notes: args.completionNotes,
    });

    // Get all phases to find next one
    const phases = await ctx.db
      .query("order_phases")
      .withIndex("by_order", (q) => q.eq("order_id", args.orderId))
      .collect();

    const sortedPhases = phases.sort((a, b) => a.phase_order - b.phase_order);
    const currentIndex = sortedPhases.findIndex((p) => p._id === args.phaseId);
    const nextPhase = sortedPhases[currentIndex + 1];

    // Calculate completion percentage
    const completedPhases = sortedPhases.filter(
      (p) => p.status === "completed" || p._id === args.phaseId
    ).length;
    const completionPercentage = Math.round(
      (completedPhases / sortedPhases.length) * 100
    );

    if (nextPhase) {
      // Start next phase
      await ctx.db.patch(nextPhase._id, {
        status: "in_progress",
        actual_start_date: now,
      });

      await ctx.db.patch(args.orderId, {
        current_phase_id: nextPhase._id,
        completion_percentage: completionPercentage,
        updated_at: now,
      });
    } else {
      // All phases completed - mark order as completed
      await ctx.db.patch(args.orderId, {
        status: "completed",
        current_phase_id: undefined,
        completion_percentage: 100,
        actual_completion_date: now,
        updated_at: now,
      });
    }

    return {
      success: true,
      message: nextPhase
        ? "Phase completed, next phase started"
        : "All phases completed, order finished",
      isOrderComplete: !nextPhase,
    };
  },
});

/**
 * Cancel a production order
 */
export const cancel = mutation({
  args: {
    orderId: v.id("production_orders"),
    reason: v.string(),
    archiveBatches: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status === "completed" || order.status === "cancelled") {
      throw new Error("Cannot cancel completed or already cancelled order");
    }

    // Cancel the order
    await ctx.db.patch(args.orderId, {
      status: "cancelled",
      cancellation_reason: args.reason,
      updated_at: now,
    });

    // Optionally archive associated batches
    if (args.archiveBatches) {
      const batches = await ctx.db
        .query("batches")
        .withIndex("by_production_order", (q) =>
          q.eq("production_order_id", args.orderId)
        )
        .collect();

      for (const batch of batches) {
        if (batch.status === "active") {
          await ctx.db.patch(batch._id, {
            status: "archived",
            notes: `Archived due to order cancellation: ${args.reason}`,
            updated_at: now,
          });
        }
      }
    }

    // Cancel pending activities
    const activities = await ctx.db
      .query("scheduled_activities")
      .filter((q) =>
        q.eq(q.field("production_order_id"), args.orderId)
      )
      .collect();

    for (const activity of activities) {
      if (activity.status === "pending") {
        await ctx.db.patch(activity._id, {
          status: "cancelled",
          updated_at: now,
        });
      }
    }

    return { success: true, message: "Order cancelled successfully" };
  },
});

/**
 * Get orders by facility for calendar/scheduling views
 */
export const getByFacility = query({
  args: {
    facilityId: v.id("facilities"),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let orders = await ctx.db
      .query("production_orders")
      .withIndex("by_facility", (q) =>
        q.eq("target_facility_id", args.facilityId)
      )
      .collect();

    // Filter by date range if provided
    if (args.startDate) {
      orders = orders.filter(
        (o) =>
          (o.planned_start_date && o.planned_start_date >= args.startDate!) ||
          (o.actual_start_date && o.actual_start_date >= args.startDate!)
      );
    }

    if (args.endDate) {
      orders = orders.filter(
        (o) =>
          (o.planned_start_date && o.planned_start_date <= args.endDate!) ||
          (o.estimated_completion_date &&
            o.estimated_completion_date <= args.endDate!)
      );
    }

    return orders;
  },
});

/**
 * Get activities for an order
 */
export const getActivities = query({
  args: {
    orderId: v.id("production_orders"),
    status: v.optional(v.string()),
    phaseId: v.optional(v.id("order_phases")),
  },
  handler: async (ctx, args) => {
    let activities = await ctx.db
      .query("scheduled_activities")
      .filter((q) =>
        q.eq(q.field("production_order_id"), args.orderId)
      )
      .collect();

    if (args.status) {
      activities = activities.filter((a) => a.status === args.status);
    }

    // Sort by scheduled date
    return activities.sort((a, b) => a.scheduled_date - b.scheduled_date);
  },
});
