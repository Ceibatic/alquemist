/**
 * Batches Queries and Mutations
 * Module 25: Batch management for plant group tracking
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Generate batch code in format {CULTIVAR}-{YYMMDD}-{XXX}
 */
async function generateBatchCode(
  ctx: any,
  cultivarId: Id<"cultivars"> | undefined,
  companyId: Id<"companies">
): Promise<string> {
  const now = new Date();
  const dateStr =
    now.getFullYear().toString().slice(-2) +
    (now.getMonth() + 1).toString().padStart(2, "0") +
    now.getDate().toString().padStart(2, "0");

  // Get cultivar code or use generic
  let cultivarCode = "GEN";
  if (cultivarId) {
    const cultivar = await ctx.db.get(cultivarId);
    if (cultivar) {
      // Take first 3 letters of cultivar name uppercase
      cultivarCode = cultivar.name.substring(0, 3).toUpperCase();
    }
  }

  // Count existing batches today for sequence
  const batches = await ctx.db
    .query("batches")
    .withIndex("by_company", (q: any) => q.eq("company_id", companyId))
    .collect();

  const todayBatches = batches.filter((b: any) => {
    const batchDate = new Date(b.created_date);
    return (
      batchDate.toDateString() === now.toDateString() &&
      b.batch_code.includes(dateStr)
    );
  });

  const sequence = (todayBatches.length + 1).toString().padStart(3, "0");
  return `${cultivarCode}-${dateStr}-${sequence}`;
}

/**
 * List batches for a company
 */
export const list = query({
  args: {
    companyId: v.id("companies"),
    facilityId: v.optional(v.id("facilities")),
    areaId: v.optional(v.id("areas")),
    cultivarId: v.optional(v.id("cultivars")),
    status: v.optional(v.string()),
    batchType: v.optional(v.string()),
    orderId: v.optional(v.id("production_orders")),
  },
  handler: async (ctx, args) => {
    let batches = await ctx.db
      .query("batches")
      .withIndex("by_company", (q) => q.eq("company_id", args.companyId))
      .collect();

    // Apply filters
    if (args.facilityId) {
      batches = batches.filter((b) => b.facility_id === args.facilityId);
    }

    if (args.areaId) {
      batches = batches.filter((b) => b.area_id === args.areaId);
    }

    if (args.cultivarId) {
      batches = batches.filter((b) => b.cultivar_id === args.cultivarId);
    }

    if (args.status) {
      batches = batches.filter((b) => b.status === args.status);
    }

    if (args.batchType) {
      batches = batches.filter((b) => b.batch_type === args.batchType);
    }

    if (args.orderId) {
      batches = batches.filter((b) => b.production_order_id === args.orderId);
    }

    // Enrich with related data
    const enrichedBatches = await Promise.all(
      batches.map(async (batch) => {
        const area = batch.area_id ? await ctx.db.get(batch.area_id) : null;
        const cultivar = batch.cultivar_id
          ? await ctx.db.get(batch.cultivar_id)
          : null;
        const facility = await ctx.db.get(batch.facility_id);
        const cropType = await ctx.db.get(batch.crop_type_id);
        const order = batch.production_order_id
          ? await ctx.db.get(batch.production_order_id)
          : null;

        // Calculate days in production
        const daysInProduction = Math.floor(
          (Date.now() - batch.created_date) / (1000 * 60 * 60 * 24)
        );

        return {
          ...batch,
          areaName: area?.name || null,
          cultivarName: cultivar?.name || null,
          facilityName: facility?.name || null,
          cropTypeName: cropType?.name || null,
          orderNumber: order?.order_number || null,
          daysInProduction,
        };
      })
    );

    // Sort by creation date descending
    return enrichedBatches.sort((a, b) => b.created_date - a.created_date);
  },
});

/**
 * Get batch by ID with full details
 */
export const getById = query({
  args: {
    batchId: v.id("batches"),
  },
  handler: async (ctx, args) => {
    const batch = await ctx.db.get(args.batchId);
    if (!batch) {
      return null;
    }

    // Get related entities
    const area = batch.area_id ? await ctx.db.get(batch.area_id) : null;
    const cultivar = batch.cultivar_id
      ? await ctx.db.get(batch.cultivar_id)
      : null;
    const facility = await ctx.db.get(batch.facility_id);
    const cropType = await ctx.db.get(batch.crop_type_id);
    const order = batch.production_order_id
      ? await ctx.db.get(batch.production_order_id)
      : null;
    const supplier = batch.supplier_id
      ? await ctx.db.get(batch.supplier_id)
      : null;
    const template = batch.template_id
      ? await ctx.db.get(batch.template_id)
      : null;
    const parentBatch = batch.parent_batch_id
      ? await ctx.db.get(batch.parent_batch_id)
      : null;

    // Get plants if individual tracking enabled
    let plants: any[] = [];
    if (batch.enable_individual_tracking) {
      plants = await ctx.db
        .query("plants")
        .withIndex("by_batch", (q) => q.eq("batch_id", args.batchId))
        .collect();
    }

    // Get movements
    const movements = await ctx.db
      .query("batch_movements")
      .withIndex("by_batch", (q) => q.eq("batch_id", args.batchId))
      .collect();

    // Get losses
    const losses = await ctx.db
      .query("batch_losses")
      .withIndex("by_batch", (q) => q.eq("batch_id", args.batchId))
      .collect();

    // Get harvests
    const harvests = await ctx.db
      .query("batch_harvests")
      .withIndex("by_batch", (q) => q.eq("batch_id", args.batchId))
      .collect();

    // Get child batches (from splits)
    const childBatches = await ctx.db
      .query("batches")
      .filter((q) => q.eq(q.field("parent_batch_id"), args.batchId))
      .collect();

    // Calculate days in production
    const daysInProduction = Math.floor(
      (Date.now() - batch.created_date) / (1000 * 60 * 60 * 24)
    );

    return {
      ...batch,
      areaName: area?.name || null,
      cultivarName: cultivar?.name || null,
      facilityName: facility?.name || null,
      cropTypeName: cropType?.name || null,
      orderNumber: order?.order_number || null,
      supplierName: supplier?.name || null,
      templateName: template?.name || null,
      parentBatchCode: parentBatch?.batch_code || null,
      daysInProduction,
      plants,
      plantsCount: plants.length,
      movements: movements.sort((a, b) => b.movement_date - a.movement_date),
      losses: losses.sort((a, b) => b.detection_date - a.detection_date),
      harvests: harvests.sort((a, b) => b.harvest_date - a.harvest_date),
      childBatches: childBatches.map((cb) => ({
        _id: cb._id,
        batch_code: cb.batch_code,
        current_quantity: cb.current_quantity,
        status: cb.status,
      })),
    };
  },
});

/**
 * Get stats for batches dashboard
 */
export const getStats = query({
  args: {
    companyId: v.id("companies"),
    facilityId: v.optional(v.id("facilities")),
  },
  handler: async (ctx, args) => {
    let batches = await ctx.db
      .query("batches")
      .withIndex("by_company", (q) => q.eq("company_id", args.companyId))
      .collect();

    if (args.facilityId) {
      batches = batches.filter((b) => b.facility_id === args.facilityId);
    }

    const activeBatches = batches.filter((b) => b.status === "active");
    const harvestedBatches = batches.filter((b) => b.status === "harvested");

    // Calculate totals
    let totalPlantsActive = 0;
    let totalPlantsLost = 0;
    let totalInitialPlants = 0;

    activeBatches.forEach((b) => {
      totalPlantsActive += b.current_quantity;
      totalPlantsLost += b.lost_quantity;
      totalInitialPlants += b.initial_quantity;
    });

    // Calculate average mortality rate
    const avgMortality =
      totalInitialPlants > 0
        ? Math.round((totalPlantsLost / totalInitialPlants) * 100)
        : 0;

    // Count by phase
    const byPhase: Record<string, number> = {};
    activeBatches.forEach((b) => {
      const phase = b.current_phase || "unknown";
      byPhase[phase] = (byPhase[phase] || 0) + 1;
    });

    return {
      totalBatches: batches.length,
      activeBatches: activeBatches.length,
      harvestedBatches: harvestedBatches.length,
      totalPlantsActive,
      totalPlantsLost,
      averageMortalityRate: avgMortality,
      batchesByPhase: byPhase,
    };
  },
});

/**
 * Create a new batch
 */
export const create = mutation({
  args: {
    companyId: v.id("companies"),
    facilityId: v.id("facilities"),
    areaId: v.id("areas"),
    cropTypeId: v.id("crop_types"),
    cultivarId: v.optional(v.id("cultivars")),
    orderId: v.optional(v.id("production_orders")),
    templateId: v.optional(v.id("production_templates")),
    batchType: v.string(),
    sourceType: v.string(),
    plannedQuantity: v.number(),
    initialQuantity: v.number(),
    enableIndividualTracking: v.optional(v.boolean()),
    supplierId: v.optional(v.id("suppliers")),
    externalLotNumber: v.optional(v.string()),
    germinationDate: v.optional(v.number()),
    currentPhase: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("No autorizado");
    }

    const now = Date.now();

    // Generate batch code
    const batchCode = await generateBatchCode(
      ctx,
      args.cultivarId,
      args.companyId
    );

    // Validate facility
    const facility = await ctx.db.get(args.facilityId);
    if (!facility || facility.company_id !== args.companyId) {
      throw new Error("Facility not found or does not belong to company");
    }

    // Validate area
    const area = await ctx.db.get(args.areaId);
    if (!area || area.facility_id !== args.facilityId) {
      throw new Error("Area not found or does not belong to facility");
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

    // Create batch
    const batchId = await ctx.db.insert("batches", {
      batch_code: batchCode,
      qr_code: `QR-${batchCode}`,
      company_id: args.companyId,
      facility_id: args.facilityId,
      area_id: args.areaId,
      crop_type_id: args.cropTypeId,
      cultivar_id: args.cultivarId,
      production_order_id: args.orderId,
      template_id: args.templateId,
      parent_batch_id: undefined,
      merged_into_batch_id: undefined,
      source_batch_id: undefined,
      batch_type: args.batchType,
      source_type: args.sourceType,
      tracking_level: args.enableIndividualTracking ? "individual" : "batch",
      enable_individual_tracking: args.enableIndividualTracking || false,
      planned_quantity: args.plannedQuantity,
      initial_quantity: args.initialQuantity,
      current_quantity: args.initialQuantity,
      lost_quantity: 0,
      unit_of_measure: "plants",
      mortality_rate: 0,
      current_phase: args.currentPhase || "germination",
      sample_size: undefined,
      sample_frequency: undefined,
      germination_date: args.germinationDate,
      created_date: now,
      planned_completion_date: undefined,
      actual_completion_date: undefined,
      harvest_date: undefined,
      days_in_production: 0,
      quality_grade: undefined,
      quality_distribution: undefined,
      batch_metrics: undefined,
      environmental_history: [],
      supplier_id: args.supplierId,
      external_lot_number: args.externalLotNumber,
      received_date: args.supplierId ? now : undefined,
      phytosanitary_certificate: undefined,
      created_by: args.createdBy,
      status: "active",
      priority: "normal",
      notes: args.notes,
      updated_at: now,
    });

    // Update area occupancy
    await ctx.db.patch(args.areaId, {
      current_occupancy: area.current_occupancy + args.initialQuantity,
      updated_at: now,
    });

    // Create plants if individual tracking enabled
    if (args.enableIndividualTracking) {
      for (let i = 1; i <= args.initialQuantity; i++) {
        const plantCode = `${batchCode}-P${i.toString().padStart(3, "0")}`;
        await ctx.db.insert("plants", {
          plant_code: plantCode,
          qr_code: `QR-${plantCode}`,
          batch_id: batchId,
          mother_plant_id: undefined,
          company_id: args.companyId,
          facility_id: args.facilityId,
          area_id: args.areaId,
          crop_type_id: args.cropTypeId,
          cultivar_id: args.cultivarId,
          phenotype: undefined,
          plant_stage: "seedling",
          sex: undefined,
          germination_date: args.germinationDate,
          planted_date: now,
          stage_progression_dates: undefined,
          harvested_date: undefined,
          destroyed_date: undefined,
          destruction_reason: undefined,
          current_height_cm: undefined,
          current_nodes: undefined,
          stem_diameter_mm: undefined,
          plant_metrics: undefined,
          health_status: "healthy",
          last_quality_score: undefined,
          last_inspection_date: undefined,
          inspection_notes: undefined,
          clones_taken_count: 0,
          harvest_weight: undefined,
          harvest_quality: undefined,
          position: undefined,
          position_x: undefined,
          position_y: undefined,
          container_id: undefined,
          status: "active",
          notes: undefined,
          created_at: now,
          updated_at: now,
        });
      }
    }

    // Update production order if linked
    if (args.orderId) {
      const order = await ctx.db.get(args.orderId);
      if (order) {
        await ctx.db.patch(args.orderId, {
          total_plants_actual: (order.total_plants_actual || 0) + args.initialQuantity,
          updated_at: now,
        });
      }
    }

    return batchId;
  },
});

/**
 * Move batch to another area
 */
export const move = mutation({
  args: {
    batchId: v.id("batches"),
    targetAreaId: v.id("areas"),
    reason: v.string(),
    notes: v.optional(v.string()),
    performedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("No autorizado");
    }

    const now = Date.now();

    const batch = await ctx.db.get(args.batchId);
    if (!batch) {
      throw new Error("Batch not found");
    }

    // Verify ownership: batch belongs to user's company
    const user = await ctx.db.get(userId);

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    if (batch.company_id !== user.company_id) {
      throw new Error("No tienes permisos para operar este lote");
    }

    if (batch.status !== "active") {
      throw new Error("Only active batches can be moved");
    }

    // Validate target area
    const targetArea = await ctx.db.get(args.targetAreaId);
    if (!targetArea || targetArea.facility_id !== batch.facility_id) {
      throw new Error("Target area not found or in different facility");
    }

    const fromAreaId = batch.area_id;

    // Create movement record
    await ctx.db.insert("batch_movements", {
      batch_id: args.batchId,
      from_area_id: fromAreaId,
      to_area_id: args.targetAreaId,
      movement_date: now,
      reason: args.reason,
      notes: args.notes,
      performed_by: args.performedBy,
      created_at: now,
    });

    // Update batch area
    await ctx.db.patch(args.batchId, {
      area_id: args.targetAreaId,
      updated_at: now,
    });

    // Update area occupancies
    if (fromAreaId) {
      const fromArea = await ctx.db.get(fromAreaId);
      if (fromArea) {
        await ctx.db.patch(fromAreaId, {
          current_occupancy: Math.max(
            0,
            fromArea.current_occupancy - batch.current_quantity
          ),
          updated_at: now,
        });
      }
    }

    await ctx.db.patch(args.targetAreaId, {
      current_occupancy: targetArea.current_occupancy + batch.current_quantity,
      updated_at: now,
    });

    // Update plants if individual tracking
    if (batch.enable_individual_tracking) {
      const plants = await ctx.db
        .query("plants")
        .withIndex("by_batch", (q) => q.eq("batch_id", args.batchId))
        .collect();

      for (const plant of plants) {
        await ctx.db.patch(plant._id, {
          area_id: args.targetAreaId,
          updated_at: now,
        });
      }
    }

    // Log activity
    await ctx.db.insert("activities", {
      entity_type: "batch",
      entity_id: args.batchId,
      activity_type: "movement",
      performed_by: args.performedBy,
      timestamp: now,
      area_from: fromAreaId,
      area_to: args.targetAreaId,
      quantity_before: batch.current_quantity,
      quantity_after: batch.current_quantity,
      materials_consumed: [],
      equipment_used: [],
      photos: [],
      files: [],
      activity_metadata: {},
      notes: `${args.reason}${args.notes ? `. ${args.notes}` : ""}`,
      created_at: now,
    });

    return { success: true, message: "Batch moved successfully" };
  },
});

/**
 * Record plant loss in batch
 */
export const recordLoss = mutation({
  args: {
    batchId: v.id("batches"),
    quantity: v.number(),
    reason: v.string(),
    description: v.optional(v.string()),
    detectionDate: v.optional(v.number()),
    photos: v.optional(v.array(v.string())),
    createIncident: v.optional(v.boolean()),
    recordedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("No autorizado");
    }

    const now = Date.now();

    const batch = await ctx.db.get(args.batchId);
    if (!batch) {
      throw new Error("Batch not found");
    }

    // Verify ownership: batch belongs to user's company
    const user = await ctx.db.get(userId);

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    if (batch.company_id !== user.company_id) {
      throw new Error("No tienes permisos para operar este lote");
    }

    if (args.quantity > batch.current_quantity) {
      throw new Error("Loss quantity exceeds current batch quantity");
    }

    // Create loss record
    await ctx.db.insert("batch_losses", {
      batch_id: args.batchId,
      quantity: args.quantity,
      reason: args.reason,
      description: args.description,
      detection_date: args.detectionDate || now,
      photos: args.photos || [],
      incident_id: undefined,
      recorded_by: args.recordedBy,
      created_at: now,
    });

    // Update batch quantities
    const newCurrentQuantity = batch.current_quantity - args.quantity;
    const newLostQuantity = batch.lost_quantity + args.quantity;
    const newMortalityRate =
      batch.initial_quantity > 0
        ? Math.round((newLostQuantity / batch.initial_quantity) * 100)
        : 0;

    await ctx.db.patch(args.batchId, {
      current_quantity: newCurrentQuantity,
      lost_quantity: newLostQuantity,
      mortality_rate: newMortalityRate,
      updated_at: now,
    });

    // Update area occupancy
    if (batch.area_id) {
      const area = await ctx.db.get(batch.area_id);
      if (area) {
        await ctx.db.patch(batch.area_id, {
          current_occupancy: Math.max(0, area.current_occupancy - args.quantity),
          updated_at: now,
        });
      }
    }

    // Check if all plants lost
    if (newCurrentQuantity === 0) {
      await ctx.db.patch(args.batchId, {
        status: "lost",
        updated_at: now,
      });
    }

    // Log activity
    await ctx.db.insert("activities", {
      entity_type: "batch",
      entity_id: args.batchId,
      activity_type: "loss_record",
      performed_by: args.recordedBy,
      timestamp: now,
      quantity_before: batch.current_quantity,
      quantity_after: newCurrentQuantity,
      materials_consumed: [],
      equipment_used: [],
      photos: args.photos || [],
      files: [],
      activity_metadata: {
        reason: args.reason,
        lostQuantity: args.quantity,
      },
      notes: `${args.reason}${args.description ? `. ${args.description}` : ""}`,
      created_at: now,
    });

    return { success: true, message: "Loss recorded successfully" };
  },
});

/**
 * Split a batch into multiple batches
 */
export const split = mutation({
  args: {
    batchId: v.id("batches"),
    splits: v.array(
      v.object({
        quantity: v.number(),
        areaId: v.id("areas"),
        code: v.optional(v.string()),
      })
    ),
    reason: v.string(),
    performedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("No autorizado");
    }

    const now = Date.now();

    const batch = await ctx.db.get(args.batchId);
    if (!batch) {
      throw new Error("Batch not found");
    }

    // Verify ownership: batch belongs to user's company
    const user = await ctx.db.get(userId);

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    if (batch.company_id !== user.company_id) {
      throw new Error("No tienes permisos para operar este lote");
    }

    if (batch.status !== "active") {
      throw new Error("Only active batches can be split");
    }

    // Validate total quantities
    const totalSplitQuantity = args.splits.reduce(
      (sum, s) => sum + s.quantity,
      0
    );
    if (totalSplitQuantity !== batch.current_quantity) {
      throw new Error(
        "Split quantities must sum to current batch quantity"
      );
    }

    const newBatchIds: Id<"batches">[] = [];

    // Create new batches from splits
    for (let i = 0; i < args.splits.length; i++) {
      const split = args.splits[i];

      // Generate or use provided code
      const newCode =
        split.code ||
        (await generateBatchCode(ctx, batch.cultivar_id, batch.company_id));

      const newBatchId = await ctx.db.insert("batches", {
        batch_code: `${newCode}-S${i + 1}`,
        qr_code: `QR-${newCode}-S${i + 1}`,
        company_id: batch.company_id,
        facility_id: batch.facility_id,
        area_id: split.areaId,
        crop_type_id: batch.crop_type_id,
        cultivar_id: batch.cultivar_id,
        production_order_id: batch.production_order_id,
        template_id: batch.template_id,
        parent_batch_id: args.batchId,
        merged_into_batch_id: undefined,
        source_batch_id: batch.source_batch_id || args.batchId,
        batch_type: batch.batch_type,
        source_type: "rescue",
        tracking_level: batch.tracking_level,
        enable_individual_tracking: batch.enable_individual_tracking,
        planned_quantity: split.quantity,
        initial_quantity: split.quantity,
        current_quantity: split.quantity,
        lost_quantity: 0,
        unit_of_measure: batch.unit_of_measure,
        mortality_rate: 0,
        current_phase: batch.current_phase,
        sample_size: batch.sample_size,
        sample_frequency: batch.sample_frequency,
        germination_date: batch.germination_date,
        created_date: now,
        planned_completion_date: batch.planned_completion_date,
        actual_completion_date: undefined,
        harvest_date: undefined,
        days_in_production: batch.days_in_production,
        quality_grade: batch.quality_grade,
        quality_distribution: batch.quality_distribution,
        batch_metrics: batch.batch_metrics,
        environmental_history: [],
        supplier_id: batch.supplier_id,
        external_lot_number: batch.external_lot_number,
        received_date: batch.received_date,
        phytosanitary_certificate: batch.phytosanitary_certificate,
        created_by: args.performedBy,
        status: "active",
        priority: batch.priority,
        notes: `Split from ${batch.batch_code}. Reason: ${args.reason}`,
        updated_at: now,
      });

      newBatchIds.push(newBatchId);

      // Update area occupancy for new batch
      const area = await ctx.db.get(split.areaId);
      if (area) {
        await ctx.db.patch(split.areaId, {
          current_occupancy: area.current_occupancy + split.quantity,
          updated_at: now,
        });
      }
    }

    // Mark original batch as split
    await ctx.db.patch(args.batchId, {
      status: "split",
      current_quantity: 0,
      notes: `${batch.notes || ""}\nSplit into ${args.splits.length} batches on ${new Date(now).toISOString()}. Reason: ${args.reason}`,
      updated_at: now,
    });

    // Update original area occupancy
    if (batch.area_id) {
      const originalArea = await ctx.db.get(batch.area_id);
      if (originalArea) {
        await ctx.db.patch(batch.area_id, {
          current_occupancy: Math.max(
            0,
            originalArea.current_occupancy - batch.current_quantity
          ),
          updated_at: now,
        });
      }
    }

    // Log activity
    await ctx.db.insert("activities", {
      entity_type: "batch",
      entity_id: args.batchId,
      activity_type: "batch_split",
      performed_by: args.performedBy,
      timestamp: now,
      quantity_before: batch.current_quantity,
      quantity_after: 0,
      materials_consumed: [],
      equipment_used: [],
      photos: [],
      files: [],
      activity_metadata: {
        reason: args.reason,
        newBatchIds: newBatchIds,
        splitCount: args.splits.length,
      },
      notes: `Split into ${args.splits.length} batches. Reason: ${args.reason}`,
      created_at: now,
    });

    return { success: true, newBatchIds, message: "Batch split successfully" };
  },
});

/**
 * Merge two batches
 */
export const merge = mutation({
  args: {
    primaryBatchId: v.id("batches"),
    secondaryBatchId: v.id("batches"),
    reason: v.string(),
    performedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("No autorizado");
    }

    const now = Date.now();

    const primaryBatch = await ctx.db.get(args.primaryBatchId);
    const secondaryBatch = await ctx.db.get(args.secondaryBatchId);

    if (!primaryBatch || !secondaryBatch) {
      throw new Error("One or both batches not found");
    }

    // Verify ownership: both batches belong to user's company
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    if (primaryBatch.company_id !== user.company_id) {
      throw new Error("No tienes permisos para operar el lote principal");
    }

    if (secondaryBatch.company_id !== user.company_id) {
      throw new Error("No tienes permisos para operar el lote secundario");
    }

    if (
      primaryBatch.status !== "active" ||
      secondaryBatch.status !== "active"
    ) {
      throw new Error("Both batches must be active to merge");
    }

    if (primaryBatch.cultivar_id !== secondaryBatch.cultivar_id) {
      throw new Error("Batches must have the same cultivar to merge");
    }

    if (primaryBatch.current_phase !== secondaryBatch.current_phase) {
      throw new Error("Batches must be in the same phase to merge");
    }

    // Update primary batch with combined quantities
    const newCurrentQuantity =
      primaryBatch.current_quantity + secondaryBatch.current_quantity;
    const newInitialQuantity =
      primaryBatch.initial_quantity + secondaryBatch.initial_quantity;
    const newLostQuantity =
      primaryBatch.lost_quantity + secondaryBatch.lost_quantity;
    const newMortalityRate =
      newInitialQuantity > 0
        ? Math.round((newLostQuantity / newInitialQuantity) * 100)
        : 0;

    await ctx.db.patch(args.primaryBatchId, {
      current_quantity: newCurrentQuantity,
      initial_quantity: newInitialQuantity,
      lost_quantity: newLostQuantity,
      mortality_rate: newMortalityRate,
      notes: `${primaryBatch.notes || ""}\nMerged with ${secondaryBatch.batch_code} on ${new Date(now).toISOString()}. Reason: ${args.reason}`,
      updated_at: now,
    });

    // Mark secondary batch as merged
    await ctx.db.patch(args.secondaryBatchId, {
      status: "merged",
      merged_into_batch_id: args.primaryBatchId,
      current_quantity: 0,
      notes: `${secondaryBatch.notes || ""}\nMerged into ${primaryBatch.batch_code} on ${new Date(now).toISOString()}. Reason: ${args.reason}`,
      updated_at: now,
    });

    // Update secondary batch area occupancy
    if (secondaryBatch.area_id) {
      const secondaryArea = await ctx.db.get(secondaryBatch.area_id);
      if (secondaryArea) {
        await ctx.db.patch(secondaryBatch.area_id, {
          current_occupancy: Math.max(
            0,
            secondaryArea.current_occupancy - secondaryBatch.current_quantity
          ),
          updated_at: now,
        });
      }
    }

    // Update primary batch area if different
    if (
      primaryBatch.area_id &&
      primaryBatch.area_id !== secondaryBatch.area_id
    ) {
      const primaryArea = await ctx.db.get(primaryBatch.area_id);
      if (primaryArea) {
        await ctx.db.patch(primaryBatch.area_id, {
          current_occupancy:
            primaryArea.current_occupancy + secondaryBatch.current_quantity,
          updated_at: now,
        });
      }
    }

    // Move plants from secondary to primary if individual tracking
    if (
      primaryBatch.enable_individual_tracking &&
      secondaryBatch.enable_individual_tracking
    ) {
      const secondaryPlants = await ctx.db
        .query("plants")
        .withIndex("by_batch", (q) => q.eq("batch_id", args.secondaryBatchId))
        .collect();

      for (const plant of secondaryPlants) {
        await ctx.db.patch(plant._id, {
          batch_id: args.primaryBatchId,
          area_id: primaryBatch.area_id,
          updated_at: now,
        });
      }
    }

    // Log activity for primary batch
    await ctx.db.insert("activities", {
      entity_type: "batch",
      entity_id: args.primaryBatchId,
      activity_type: "batch_merge",
      performed_by: args.performedBy,
      timestamp: now,
      quantity_before: primaryBatch.current_quantity,
      quantity_after: newCurrentQuantity,
      materials_consumed: [],
      equipment_used: [],
      photos: [],
      files: [],
      activity_metadata: {
        reason: args.reason,
        mergedBatchId: args.secondaryBatchId,
        mergedBatchCode: secondaryBatch.batch_code,
        addedQuantity: secondaryBatch.current_quantity,
      },
      notes: `Merged with ${secondaryBatch.batch_code}. Reason: ${args.reason}`,
      created_at: now,
    });

    // Log activity for secondary batch
    await ctx.db.insert("activities", {
      entity_type: "batch",
      entity_id: args.secondaryBatchId,
      activity_type: "batch_merge",
      performed_by: args.performedBy,
      timestamp: now,
      quantity_before: secondaryBatch.current_quantity,
      quantity_after: 0,
      materials_consumed: [],
      equipment_used: [],
      photos: [],
      files: [],
      activity_metadata: {
        reason: args.reason,
        mergedIntoBatchId: args.primaryBatchId,
        mergedIntoBatchCode: primaryBatch.batch_code,
      },
      notes: `Merged into ${primaryBatch.batch_code}. Reason: ${args.reason}`,
      created_at: now,
    });

    return { success: true, message: "Batches merged successfully" };
  },
});

/**
 * Record harvest for a batch
 */
export const harvest = mutation({
  args: {
    batchId: v.id("batches"),
    harvestDate: v.number(),
    totalWeight: v.number(),
    weightUnit: v.string(),
    qualityGrade: v.string(),
    humidityPercentage: v.optional(v.number()),
    destinationAreaId: v.optional(v.id("areas")),
    notes: v.optional(v.string()),
    photos: v.optional(v.array(v.string())),
    harvestedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("No autorizado");
    }

    const now = Date.now();

    const batch = await ctx.db.get(args.batchId);
    if (!batch) {
      throw new Error("Batch not found");
    }

    // Verify ownership: batch belongs to user's company
    const user = await ctx.db.get(userId);

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    if (batch.company_id !== user.company_id) {
      throw new Error("No tienes permisos para operar este lote");
    }

    if (batch.status !== "active") {
      throw new Error("Only active batches can be harvested");
    }

    // Create harvest record
    await ctx.db.insert("batch_harvests", {
      batch_id: args.batchId,
      harvest_date: args.harvestDate,
      total_weight: args.totalWeight,
      weight_unit: args.weightUnit,
      quality_grade: args.qualityGrade,
      humidity_percentage: args.humidityPercentage,
      destination_area_id: args.destinationAreaId,
      product_lot_id: undefined,
      notes: args.notes,
      photos: args.photos || [],
      harvested_by: args.harvestedBy,
      created_at: now,
    });

    // Update batch status
    await ctx.db.patch(args.batchId, {
      status: "harvested",
      harvest_date: args.harvestDate,
      quality_grade: args.qualityGrade,
      actual_completion_date: now,
      updated_at: now,
    });

    // Update area occupancy
    if (batch.area_id) {
      const area = await ctx.db.get(batch.area_id);
      if (area) {
        await ctx.db.patch(batch.area_id, {
          current_occupancy: Math.max(
            0,
            area.current_occupancy - batch.current_quantity
          ),
          updated_at: now,
        });
      }
    }

    // Update production order if linked
    if (batch.production_order_id) {
      const order = await ctx.db.get(batch.production_order_id);
      if (order) {
        await ctx.db.patch(batch.production_order_id, {
          actual_yield: (order.actual_yield || 0) + args.totalWeight,
          updated_at: now,
        });
      }
    }

    // Log activity
    await ctx.db.insert("activities", {
      entity_type: "batch",
      entity_id: args.batchId,
      activity_type: "harvest",
      performed_by: args.harvestedBy,
      timestamp: now,
      quantity_before: batch.current_quantity,
      quantity_after: batch.current_quantity, // Plants still exist, just harvested
      materials_consumed: [],
      equipment_used: [],
      photos: args.photos || [],
      files: [],
      activity_metadata: {
        totalWeight: args.totalWeight,
        weightUnit: args.weightUnit,
        qualityGrade: args.qualityGrade,
        humidityPercentage: args.humidityPercentage,
        destinationAreaId: args.destinationAreaId,
      },
      notes: args.notes || `Harvest: ${args.totalWeight}${args.weightUnit}, Grade: ${args.qualityGrade}`,
      created_at: now,
    });

    return { success: true, message: "Harvest recorded successfully" };
  },
});

/**
 * Archive a batch
 */
export const archive = mutation({
  args: {
    batchId: v.id("batches"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("No autorizado");
    }

    const now = Date.now();

    const batch = await ctx.db.get(args.batchId);
    if (!batch) {
      throw new Error("Batch not found");
    }

    // Verify ownership: batch belongs to user's company
    const user = await ctx.db.get(userId);

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    if (batch.company_id !== user.company_id) {
      throw new Error("No tienes permisos para operar este lote");
    }

    const allowedStatuses = ["harvested", "lost", "split", "merged"];
    if (!allowedStatuses.includes(batch.status)) {
      throw new Error("Only completed batches can be archived");
    }

    await ctx.db.patch(args.batchId, {
      status: "archived",
      notes: args.notes
        ? `${batch.notes || ""}\n${args.notes}`
        : batch.notes,
      updated_at: now,
    });

    return { success: true, message: "Batch archived successfully" };
  },
});

/**
 * Update batch phase
 */
export const updatePhase = mutation({
  args: {
    batchId: v.id("batches"),
    newPhase: v.string(),
    notes: v.optional(v.string()),
    performedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("No autorizado");
    }

    const now = Date.now();

    const batch = await ctx.db.get(args.batchId);
    if (!batch) {
      throw new Error("Batch not found");
    }

    // Verify ownership: batch belongs to user's company
    const user = await ctx.db.get(userId);

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    if (batch.company_id !== user.company_id) {
      throw new Error("No tienes permisos para operar este lote");
    }

    if (batch.status !== "active") {
      throw new Error("Only active batches can change phase");
    }

    const previousPhase = batch.current_phase;

    await ctx.db.patch(args.batchId, {
      current_phase: args.newPhase,
      notes: args.notes
        ? `${batch.notes || ""}\nPhase changed to ${args.newPhase}: ${args.notes}`
        : batch.notes,
      updated_at: now,
    });

    // Update plants if individual tracking
    if (batch.enable_individual_tracking) {
      const plants = await ctx.db
        .query("plants")
        .withIndex("by_batch", (q) => q.eq("batch_id", args.batchId))
        .collect();

      for (const plant of plants) {
        await ctx.db.patch(plant._id, {
          plant_stage: args.newPhase,
          updated_at: now,
        });
      }
    }

    // Log activity
    await ctx.db.insert("activities", {
      entity_type: "batch",
      entity_id: args.batchId,
      activity_type: "phase_transition",
      performed_by: args.performedBy,
      timestamp: now,
      quantity_before: batch.current_quantity,
      quantity_after: batch.current_quantity,
      materials_consumed: [],
      equipment_used: [],
      photos: [],
      files: [],
      activity_metadata: {
        previousPhase,
        newPhase: args.newPhase,
      },
      notes: args.notes || `Phase changed from ${previousPhase} to ${args.newPhase}`,
      created_at: now,
    });

    return { success: true, message: "Phase updated successfully" };
  },
});
