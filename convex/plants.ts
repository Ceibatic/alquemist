/**
 * Plants Queries and Mutations
 * Module 26: Individual plant tracking for batches with enable_individual_tracking
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * List plants for a batch
 */
export const listByBatch = query({
  args: {
    batchId: v.id("batches"),
    status: v.optional(v.string()),
    healthStatus: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("No autorizado");
    }

    // Get batch to verify company
    const batch = await ctx.db.get(args.batchId);
    if (!batch) {
      throw new Error("Batch not found");
    }

    // Get user to verify company
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    // Verify company matches
    if (batch.company_id !== user.company_id) {
      throw new Error("No tienes permisos para acceder a estas plantas");
    }

    let plants = await ctx.db
      .query("plants")
      .withIndex("by_batch", (q) => q.eq("batch_id", args.batchId))
      .collect();

    // Apply filters
    if (args.status) {
      plants = plants.filter((p) => p.status === args.status);
    }

    if (args.healthStatus) {
      plants = plants.filter((p) => p.health_status === args.healthStatus);
    }

    // Sort by plant code
    return plants.sort((a, b) => a.plant_code.localeCompare(b.plant_code));
  },
});

/**
 * Get plant by ID with full details
 */
export const getById = query({
  args: {
    plantId: v.id("plants"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("No autorizado");
    }

    const plant = await ctx.db.get(args.plantId);
    if (!plant) {
      return null;
    }

    // Get user to verify company
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    // Verify company matches
    if (plant.company_id !== user.company_id) {
      throw new Error("No tienes permisos para acceder a estas plantas");
    }

    // Get related entities
    const batch = await ctx.db.get(plant.batch_id);
    const area = plant.area_id ? await ctx.db.get(plant.area_id) : null;
    const cultivar = plant.cultivar_id
      ? await ctx.db.get(plant.cultivar_id)
      : null;
    const motherPlant = plant.mother_plant_id
      ? await ctx.db.get(plant.mother_plant_id)
      : null;

    // Get measurements
    const measurements = await ctx.db
      .query("plant_measurements")
      .withIndex("by_plant", (q) => q.eq("plant_id", args.plantId))
      .collect();

    // Get activities
    const activities = await ctx.db
      .query("plant_activities")
      .withIndex("by_plant", (q) => q.eq("plant_id", args.plantId))
      .collect();

    // Get offspring (clones)
    const offspring = await ctx.db
      .query("plants")
      .filter((q) => q.eq(q.field("mother_plant_id"), args.plantId))
      .collect();

    // Calculate days in production
    const daysInProduction = Math.floor(
      (Date.now() - plant.planted_date) / (1000 * 60 * 60 * 24)
    );

    return {
      ...plant,
      batchCode: batch?.batch_code || null,
      areaName: area?.name || null,
      cultivarName: cultivar?.name || null,
      motherPlantCode: motherPlant?.plant_code || null,
      daysInProduction,
      measurements: measurements.sort(
        (a, b) => b.measurement_date - a.measurement_date
      ),
      activities: activities.sort(
        (a, b) => b.activity_date - a.activity_date
      ),
      offspring: offspring.map((p) => ({
        _id: p._id,
        plant_code: p.plant_code,
        status: p.status,
        health_status: p.health_status,
      })),
    };
  },
});

/**
 * Get plant stats for a batch
 */
export const getStatsByBatch = query({
  args: {
    batchId: v.id("batches"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("No autorizado");
    }

    // Get batch to verify company
    const batch = await ctx.db.get(args.batchId);
    if (!batch) {
      throw new Error("Batch not found");
    }

    // Get user to verify company
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    // Verify company matches
    if (batch.company_id !== user.company_id) {
      throw new Error("No tienes permisos para acceder a estas plantas");
    }

    const plants = await ctx.db
      .query("plants")
      .withIndex("by_batch", (q) => q.eq("batch_id", args.batchId))
      .collect();

    const activePlants = plants.filter((p) => p.status === "active");
    const harvestedPlants = plants.filter((p) => p.status === "harvested");
    const lostPlants = plants.filter((p) => p.status === "lost");

    // Count by health status
    const healthyCounts = activePlants.filter(
      (p) => p.health_status === "healthy"
    ).length;
    const stressedCounts = activePlants.filter(
      (p) => p.health_status === "stressed"
    ).length;
    const sickCounts = activePlants.filter(
      (p) => p.health_status === "sick"
    ).length;

    return {
      total: plants.length,
      active: activePlants.length,
      harvested: harvestedPlants.length,
      lost: lostPlants.length,
      healthy: healthyCounts,
      stressed: stressedCounts,
      sick: sickCounts,
    };
  },
});

/**
 * Create plants in bulk (when enabling individual tracking)
 */
export const createBulk = mutation({
  args: {
    batchId: v.id("batches"),
    quantity: v.number(),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("No autorizado");
    }

    // Get user to verify company
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    const now = Date.now();

    const batch = await ctx.db.get(args.batchId);
    if (!batch) {
      throw new Error("Batch not found");
    }

    // Verify company matches
    if (batch.company_id !== user.company_id) {
      throw new Error("No tienes permisos para operar esta planta");
    }

    // Verify tracking is enabled
    if (!batch.enable_individual_tracking) {
      throw new Error("Individual tracking not enabled for this batch");
    }

    // Check if plants already exist
    const existingPlants = await ctx.db
      .query("plants")
      .withIndex("by_batch", (q) => q.eq("batch_id", args.batchId))
      .collect();

    if (existingPlants.length > 0) {
      throw new Error("Plants already exist for this batch");
    }

    const plantIds: Id<"plants">[] = [];

    for (let i = 1; i <= args.quantity; i++) {
      const plantCode = `${batch.batch_code}-P${i.toString().padStart(3, "0")}`;

      const plantId = await ctx.db.insert("plants", {
        plant_code: plantCode,
        qr_code: `QR-${plantCode}`,
        batch_id: args.batchId,
        mother_plant_id: undefined,
        company_id: batch.company_id,
        facility_id: batch.facility_id,
        area_id: batch.area_id,
        crop_type_id: batch.crop_type_id,
        cultivar_id: batch.cultivar_id,
        phenotype: undefined,
        plant_stage: batch.current_phase || "seedling",
        sex: undefined,
        germination_date: batch.germination_date,
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

      plantIds.push(plantId);
    }

    return { success: true, plantIds, count: plantIds.length };
  },
});

/**
 * Record a measurement for a plant
 */
export const recordMeasurement = mutation({
  args: {
    plantId: v.id("plants"),
    measurementDate: v.optional(v.number()),
    heightCm: v.optional(v.number()),
    nodes: v.optional(v.number()),
    stemDiameterMm: v.optional(v.number()),
    healthStatus: v.string(),
    notes: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    recordedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("No autorizado");
    }

    // Get user to verify company
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    const now = Date.now();

    const plant = await ctx.db.get(args.plantId);
    if (!plant) {
      throw new Error("Plant not found");
    }

    // Verify company matches
    if (plant.company_id !== user.company_id) {
      throw new Error("No tienes permisos para operar esta planta");
    }

    if (plant.status !== "active") {
      throw new Error("Can only record measurements for active plants");
    }

    // Create measurement record
    await ctx.db.insert("plant_measurements", {
      plant_id: args.plantId,
      measurement_date: args.measurementDate || now,
      height_cm: args.heightCm,
      nodes: args.nodes,
      stem_diameter_mm: args.stemDiameterMm,
      health_status: args.healthStatus,
      notes: args.notes,
      photo_url: args.photoUrl,
      recorded_by: args.recordedBy,
      created_at: now,
    });

    // Update plant with latest measurements
    const updates: Record<string, unknown> = {
      health_status: args.healthStatus,
      updated_at: now,
    };

    if (args.heightCm !== undefined) updates.current_height_cm = args.heightCm;
    if (args.nodes !== undefined) updates.current_nodes = args.nodes;
    if (args.stemDiameterMm !== undefined)
      updates.stem_diameter_mm = args.stemDiameterMm;

    await ctx.db.patch(args.plantId, updates);

    return { success: true, message: "Measurement recorded successfully" };
  },
});

/**
 * Record an activity for a plant
 */
export const recordActivity = mutation({
  args: {
    plantId: v.id("plants"),
    batchActivityId: v.optional(v.id("scheduled_activities")),
    activityType: v.string(),
    activityDate: v.optional(v.number()),
    description: v.optional(v.string()),
    materialsUsed: v.optional(v.array(v.any())),
    notes: v.optional(v.string()),
    photos: v.optional(v.array(v.string())),
    performedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("No autorizado");
    }

    // Get user to verify company
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    const now = Date.now();

    const plant = await ctx.db.get(args.plantId);
    if (!plant) {
      throw new Error("Plant not found");
    }

    // Verify company matches
    if (plant.company_id !== user.company_id) {
      throw new Error("No tienes permisos para operar esta planta");
    }

    if (plant.status !== "active") {
      throw new Error("Can only record activities for active plants");
    }

    // Create activity record
    await ctx.db.insert("plant_activities", {
      plant_id: args.plantId,
      batch_activity_id: args.batchActivityId,
      activity_type: args.activityType,
      activity_date: args.activityDate || now,
      description: args.description,
      materials_used: args.materialsUsed || [],
      notes: args.notes,
      photos: args.photos || [],
      performed_by: args.performedBy,
      created_at: now,
    });

    await ctx.db.patch(args.plantId, {
      updated_at: now,
    });

    return { success: true, message: "Activity recorded successfully" };
  },
});

/**
 * Mark a plant as lost
 */
export const markAsLost = mutation({
  args: {
    plantId: v.id("plants"),
    reason: v.string(),
    description: v.optional(v.string()),
    detectionDate: v.optional(v.number()),
    photoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("No autorizado");
    }

    // Get user to verify company
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    const now = Date.now();

    const plant = await ctx.db.get(args.plantId);
    if (!plant) {
      throw new Error("Plant not found");
    }

    // Verify company matches
    if (plant.company_id !== user.company_id) {
      throw new Error("No tienes permisos para operar esta planta");
    }

    if (plant.status !== "active") {
      throw new Error("Plant is not active");
    }

    // Update plant status
    await ctx.db.patch(args.plantId, {
      status: "lost",
      destroyed_date: args.detectionDate || now,
      destruction_reason: args.reason,
      notes: args.description
        ? `${plant.notes || ""}\nLost: ${args.description}`
        : plant.notes,
      updated_at: now,
    });

    // Update batch quantities
    const batch = await ctx.db.get(plant.batch_id);
    if (batch) {
      const newCurrentQuantity = Math.max(0, batch.current_quantity - 1);
      const newLostQuantity = batch.lost_quantity + 1;
      const newMortalityRate =
        batch.initial_quantity > 0
          ? Math.round((newLostQuantity / batch.initial_quantity) * 100)
          : 0;

      await ctx.db.patch(plant.batch_id, {
        current_quantity: newCurrentQuantity,
        lost_quantity: newLostQuantity,
        mortality_rate: newMortalityRate,
        updated_at: now,
      });

      // Also update area occupancy
      if (batch.area_id) {
        const area = await ctx.db.get(batch.area_id);
        if (area) {
          await ctx.db.patch(batch.area_id, {
            current_occupancy: Math.max(0, area.current_occupancy - 1),
            updated_at: now,
          });
        }
      }
    }

    return { success: true, message: "Plant marked as lost" };
  },
});

/**
 * Move a plant to a different area or batch
 */
export const move = mutation({
  args: {
    plantId: v.id("plants"),
    targetAreaId: v.optional(v.id("areas")),
    targetBatchId: v.optional(v.id("batches")),
    position: v.optional(v.object({ row: v.number(), column: v.number() })),
    reason: v.optional(v.string()),
    performedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("No autorizado");
    }

    // Get user to verify company
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    const now = Date.now();

    const plant = await ctx.db.get(args.plantId);
    if (!plant) {
      throw new Error("Plant not found");
    }

    // Verify company matches
    if (plant.company_id !== user.company_id) {
      throw new Error("No tienes permisos para operar esta planta");
    }

    if (plant.status !== "active") {
      throw new Error("Only active plants can be moved");
    }

    const updates: Record<string, unknown> = {
      updated_at: now,
    };

    // Handle position update within same area
    if (args.position) {
      updates.position = args.position;
      updates.position_x = args.position.column;
      updates.position_y = args.position.row;
    }

    // Handle area change
    if (args.targetAreaId && args.targetAreaId !== plant.area_id) {
      const targetArea = await ctx.db.get(args.targetAreaId);
      if (!targetArea) {
        throw new Error("Target area not found");
      }

      // Update old area occupancy
      if (plant.area_id) {
        const oldArea = await ctx.db.get(plant.area_id);
        if (oldArea) {
          await ctx.db.patch(plant.area_id, {
            current_occupancy: Math.max(0, oldArea.current_occupancy - 1),
            updated_at: now,
          });
        }
      }

      // Update new area occupancy
      await ctx.db.patch(args.targetAreaId, {
        current_occupancy: targetArea.current_occupancy + 1,
        updated_at: now,
      });

      updates.area_id = args.targetAreaId;
    }

    // Handle batch change (transfer to another batch)
    if (args.targetBatchId && args.targetBatchId !== plant.batch_id) {
      const targetBatch = await ctx.db.get(args.targetBatchId);
      if (!targetBatch) {
        throw new Error("Target batch not found");
      }

      // Validate same cultivar
      if (targetBatch.cultivar_id !== plant.cultivar_id) {
        throw new Error("Can only transfer to batch with same cultivar");
      }

      // Update old batch quantities
      const oldBatch = await ctx.db.get(plant.batch_id);
      if (oldBatch) {
        await ctx.db.patch(plant.batch_id, {
          current_quantity: Math.max(0, oldBatch.current_quantity - 1),
          updated_at: now,
        });
      }

      // Update new batch quantities
      await ctx.db.patch(args.targetBatchId, {
        current_quantity: targetBatch.current_quantity + 1,
        updated_at: now,
      });

      updates.batch_id = args.targetBatchId;
      updates.status = "transferred";
    }

    await ctx.db.patch(args.plantId, updates);

    // Record activity
    await ctx.db.insert("plant_activities", {
      plant_id: args.plantId,
      batch_activity_id: undefined,
      activity_type: "movement",
      activity_date: now,
      description: args.reason || "Plant moved",
      materials_used: [],
      notes: undefined,
      photos: [],
      performed_by: args.performedBy,
      created_at: now,
    });

    return { success: true, message: "Plant moved successfully" };
  },
});

/**
 * Take clones from a mother plant
 */
export const takeClones = mutation({
  args: {
    motherPlantId: v.id("plants"),
    quantity: v.number(),
    targetBatchId: v.optional(v.id("batches")),
    newBatchData: v.optional(
      v.object({
        areaId: v.id("areas"),
        notes: v.optional(v.string()),
      })
    ),
    cloneDate: v.optional(v.number()),
    method: v.optional(v.string()),
    notes: v.optional(v.string()),
    performedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("No autorizado");
    }

    // Get user to verify company
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    const now = Date.now();

    const motherPlant = await ctx.db.get(args.motherPlantId);
    if (!motherPlant) {
      throw new Error("Mother plant not found");
    }

    // Verify company matches
    if (motherPlant.company_id !== user.company_id) {
      throw new Error("No tienes permisos para operar esta planta");
    }

    if (motherPlant.status !== "active") {
      throw new Error("Mother plant must be active");
    }

    let targetBatchId = args.targetBatchId;

    // Create new batch if needed
    if (!targetBatchId && args.newBatchData) {
      const motherBatch = await ctx.db.get(motherPlant.batch_id);
      if (!motherBatch) {
        throw new Error("Mother batch not found");
      }

      // Generate batch code for clones
      const dateStr =
        new Date().getFullYear().toString().slice(-2) +
        (new Date().getMonth() + 1).toString().padStart(2, "0") +
        new Date().getDate().toString().padStart(2, "0");
      const batchCode = `CLN-${dateStr}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

      targetBatchId = await ctx.db.insert("batches", {
        batch_code: batchCode,
        qr_code: `QR-${batchCode}`,
        company_id: motherBatch.company_id,
        facility_id: motherBatch.facility_id,
        area_id: args.newBatchData.areaId,
        crop_type_id: motherBatch.crop_type_id,
        cultivar_id: motherBatch.cultivar_id,
        production_order_id: motherBatch.production_order_id,
        template_id: motherBatch.template_id,
        parent_batch_id: undefined,
        merged_into_batch_id: undefined,
        source_batch_id: motherBatch._id,
        batch_type: "production",
        source_type: "clone",
        tracking_level: "individual",
        enable_individual_tracking: true,
        planned_quantity: args.quantity,
        initial_quantity: args.quantity,
        current_quantity: args.quantity,
        lost_quantity: 0,
        unit_of_measure: "plants",
        mortality_rate: 0,
        current_phase: "propagation",
        sample_size: undefined,
        sample_frequency: undefined,
        germination_date: undefined,
        created_date: now,
        planned_completion_date: undefined,
        actual_completion_date: undefined,
        harvest_date: undefined,
        days_in_production: 0,
        quality_grade: undefined,
        quality_distribution: undefined,
        batch_metrics: undefined,
        environmental_history: [],
        supplier_id: undefined,
        external_lot_number: undefined,
        received_date: undefined,
        phytosanitary_certificate: undefined,
        created_by: args.performedBy,
        status: "active",
        priority: "normal",
        notes: `Clones from ${motherPlant.plant_code}. ${args.newBatchData.notes || ""}`,
        updated_at: now,
      });

      // Update area occupancy
      const area = await ctx.db.get(args.newBatchData.areaId);
      if (area) {
        await ctx.db.patch(args.newBatchData.areaId, {
          current_occupancy: area.current_occupancy + args.quantity,
          updated_at: now,
        });
      }
    }

    if (!targetBatchId) {
      throw new Error("Target batch required");
    }

    const targetBatch = await ctx.db.get(targetBatchId);
    if (!targetBatch) {
      throw new Error("Target batch not found");
    }

    // Create clone plants
    const cloneIds: Id<"plants">[] = [];
    for (let i = 1; i <= args.quantity; i++) {
      const plantCode = `${targetBatch.batch_code}-P${(targetBatch.current_quantity + i).toString().padStart(3, "0")}`;

      const plantId = await ctx.db.insert("plants", {
        plant_code: plantCode,
        qr_code: `QR-${plantCode}`,
        batch_id: targetBatchId,
        mother_plant_id: args.motherPlantId,
        company_id: targetBatch.company_id,
        facility_id: targetBatch.facility_id,
        area_id: targetBatch.area_id,
        crop_type_id: targetBatch.crop_type_id,
        cultivar_id: targetBatch.cultivar_id,
        phenotype: motherPlant.phenotype,
        plant_stage: "seedling",
        sex: motherPlant.sex,
        germination_date: undefined,
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
        notes: `Clone from ${motherPlant.plant_code}`,
        created_at: now,
        updated_at: now,
      });

      cloneIds.push(plantId);
    }

    // Update mother plant clone count
    await ctx.db.patch(args.motherPlantId, {
      clones_taken_count: motherPlant.clones_taken_count + args.quantity,
      updated_at: now,
    });

    // Record activity on mother plant
    await ctx.db.insert("plant_activities", {
      plant_id: args.motherPlantId,
      batch_activity_id: undefined,
      activity_type: "cloning",
      activity_date: args.cloneDate || now,
      description: `Took ${args.quantity} clones`,
      materials_used: [],
      notes: args.notes,
      photos: [],
      performed_by: args.performedBy,
      created_at: now,
    });

    // Update target batch if we didn't just create it
    if (args.targetBatchId) {
      await ctx.db.patch(args.targetBatchId, {
        current_quantity: targetBatch.current_quantity + args.quantity,
        initial_quantity: targetBatch.initial_quantity + args.quantity,
        updated_at: now,
      });
    }

    return {
      success: true,
      cloneIds,
      targetBatchId,
      message: `${args.quantity} clones created successfully`,
    };
  },
});

/**
 * Harvest a plant
 */
export const harvest = mutation({
  args: {
    plantId: v.id("plants"),
    weight: v.number(),
    quality: v.string(),
    notes: v.optional(v.string()),
    photos: v.optional(v.array(v.string())),
    harvestedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("No autorizado");
    }

    // Get user to verify company
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    const now = Date.now();

    const plant = await ctx.db.get(args.plantId);
    if (!plant) {
      throw new Error("Plant not found");
    }

    // Verify company matches
    if (plant.company_id !== user.company_id) {
      throw new Error("No tienes permisos para operar esta planta");
    }

    if (plant.status !== "active") {
      throw new Error("Plant must be active to harvest");
    }

    // Update plant
    await ctx.db.patch(args.plantId, {
      status: "harvested",
      harvested_date: now,
      harvest_weight: args.weight,
      harvest_quality: args.quality,
      notes: args.notes
        ? `${plant.notes || ""}\nHarvest notes: ${args.notes}`
        : plant.notes,
      updated_at: now,
    });

    // Record activity
    await ctx.db.insert("plant_activities", {
      plant_id: args.plantId,
      batch_activity_id: undefined,
      activity_type: "harvest",
      activity_date: now,
      description: `Harvested: ${args.weight}g, Quality: ${args.quality}`,
      materials_used: [],
      notes: args.notes,
      photos: args.photos || [],
      performed_by: args.harvestedBy,
      created_at: now,
    });

    return { success: true, message: "Plant harvested successfully" };
  },
});

/**
 * Bulk harvest multiple plants
 */
export const bulkHarvest = mutation({
  args: {
    plantIds: v.array(v.id("plants")),
    weightPerPlant: v.number(),
    quality: v.string(),
    notes: v.optional(v.string()),
    harvestedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("No autorizado");
    }

    // Get user to verify company
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    const now = Date.now();
    let harvestedCount = 0;
    let totalWeight = 0;

    for (const plantId of args.plantIds) {
      const plant = await ctx.db.get(plantId);
      if (!plant || plant.status !== "active") {
        continue;
      }

      // Verify company matches
      if (plant.company_id !== user.company_id) {
        continue;
      }

      await ctx.db.patch(plantId, {
        status: "harvested",
        harvested_date: now,
        harvest_weight: args.weightPerPlant,
        harvest_quality: args.quality,
        updated_at: now,
      });

      await ctx.db.insert("plant_activities", {
        plant_id: plantId,
        batch_activity_id: undefined,
        activity_type: "harvest",
        activity_date: now,
        description: `Bulk harvest: ${args.weightPerPlant}g, Quality: ${args.quality}`,
        materials_used: [],
        notes: args.notes,
        photos: [],
        performed_by: args.harvestedBy,
        created_at: now,
      });

      harvestedCount++;
      totalWeight += args.weightPerPlant;
    }

    return {
      success: true,
      harvestedCount,
      totalWeight,
      message: `${harvestedCount} plants harvested successfully`,
    };
  },
});

/**
 * Update plant stage
 */
export const updateStage = mutation({
  args: {
    plantId: v.id("plants"),
    newStage: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("No autorizado");
    }

    // Get user to verify company
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    const now = Date.now();

    const plant = await ctx.db.get(args.plantId);
    if (!plant) {
      throw new Error("Plant not found");
    }

    // Verify company matches
    if (plant.company_id !== user.company_id) {
      throw new Error("No tienes permisos para operar esta planta");
    }

    if (plant.status !== "active") {
      throw new Error("Plant must be active");
    }

    // Update stage progression dates
    const stageProgressionDates =
      (plant.stage_progression_dates as Record<string, number>) || {};
    stageProgressionDates[args.newStage] = now;

    await ctx.db.patch(args.plantId, {
      plant_stage: args.newStage,
      stage_progression_dates: stageProgressionDates,
      updated_at: now,
    });

    return { success: true, message: "Plant stage updated" };
  },
});
