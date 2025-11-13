/**
 * Area Queries and Mutations
 * Cultivation areas within facilities
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Get areas by facility
 */
export const getByFacility = query({
  args: {
    facilityId: v.id("facilities"),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let areasQuery = ctx.db
      .query("areas")
      .withIndex("by_facility", (q) => q.eq("facility_id", args.facilityId));

    const allAreas = await areasQuery.collect();

    // Filter by status if provided
    if (args.status) {
      return allAreas.filter((area) => area.status === args.status);
    }

    return allAreas;
  },
});

/**
 * Get area by ID
 */
export const get = query({
  args: {
    id: v.id("areas"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Create a new area
 */
export const create = mutation({
  args: {
    facilityId: v.id("facilities"),
    name: v.string(),
    areaType: v.string(), // propagation/vegetative/flowering/drying
    compatibleCropTypeIds: v.array(v.id("crop_types")),

    // Optional dimensions
    lengthMeters: v.optional(v.number()),
    widthMeters: v.optional(v.number()),
    heightMeters: v.optional(v.number()),
    totalAreaM2: v.optional(v.number()),
    usableAreaM2: v.optional(v.number()),

    // Optional capacity
    capacityConfigurations: v.optional(v.any()),

    // Optional technical features
    climateControlled: v.optional(v.boolean()),
    lightingControlled: v.optional(v.boolean()),
    irrigationSystem: v.optional(v.boolean()),
    environmentalSpecs: v.optional(v.any()),
    equipmentList: v.optional(v.array(v.any())),

    // Optional metadata
    notes: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Verify facility exists
    const facility = await ctx.db.get(args.facilityId);
    if (!facility) {
      throw new Error("Instalación no encontrada");
    }

    // Verify all crop types exist
    const cropTypes = await Promise.all(
      args.compatibleCropTypeIds.map((id) => ctx.db.get(id))
    );

    const invalidCropTypes = cropTypes.filter((ct) => !ct);
    if (invalidCropTypes.length > 0) {
      throw new Error("Uno o más tipos de cultivo son inválidos");
    }

    const areaId = await ctx.db.insert("areas", {
      facility_id: args.facilityId,
      name: args.name,
      area_type: args.areaType,
      compatible_crop_type_ids: args.compatibleCropTypeIds,
      current_crop_type_id: undefined,

      // Dimensions
      length_meters: args.lengthMeters,
      width_meters: args.widthMeters,
      height_meters: args.heightMeters,
      total_area_m2: args.totalAreaM2,
      usable_area_m2: args.usableAreaM2,

      // Capacity
      capacity_configurations: args.capacityConfigurations,
      current_occupancy: 0,
      reserved_capacity: 0,

      // Technical features
      climate_controlled: args.climateControlled ?? false,
      lighting_controlled: args.lightingControlled ?? false,
      irrigation_system: args.irrigationSystem ?? false,
      environmental_specs: args.environmentalSpecs,
      equipment_list: args.equipmentList ?? [],

      // Metadata
      status: args.status || "active",
      notes: args.notes,
      created_at: now,
      updated_at: now,
    });

    return areaId;
  },
});

/**
 * Update area
 */
export const update = mutation({
  args: {
    id: v.id("areas"),

    name: v.optional(v.string()),
    areaType: v.optional(v.string()),
    compatibleCropTypeIds: v.optional(v.array(v.id("crop_types"))),

    // Optional dimensions
    lengthMeters: v.optional(v.number()),
    widthMeters: v.optional(v.number()),
    heightMeters: v.optional(v.number()),
    totalAreaM2: v.optional(v.number()),
    usableAreaM2: v.optional(v.number()),

    // Optional capacity
    capacityConfigurations: v.optional(v.any()),

    // Optional technical features
    climateControlled: v.optional(v.boolean()),
    lightingControlled: v.optional(v.boolean()),
    irrigationSystem: v.optional(v.boolean()),
    environmentalSpecs: v.optional(v.any()),
    equipmentList: v.optional(v.array(v.any())),

    // Optional metadata
    notes: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // Verify area exists
    const area = await ctx.db.get(id);
    if (!area) {
      throw new Error("Área no encontrada");
    }

    // Build update object with proper field names
    const updateData: any = {
      updated_at: Date.now(),
    };

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.areaType !== undefined) updateData.area_type = updates.areaType;
    if (updates.compatibleCropTypeIds !== undefined) {
      updateData.compatible_crop_type_ids = updates.compatibleCropTypeIds;
    }

    // Dimensions
    if (updates.lengthMeters !== undefined) updateData.length_meters = updates.lengthMeters;
    if (updates.widthMeters !== undefined) updateData.width_meters = updates.widthMeters;
    if (updates.heightMeters !== undefined) updateData.height_meters = updates.heightMeters;
    if (updates.totalAreaM2 !== undefined) updateData.total_area_m2 = updates.totalAreaM2;
    if (updates.usableAreaM2 !== undefined) updateData.usable_area_m2 = updates.usableAreaM2;

    // Capacity
    if (updates.capacityConfigurations !== undefined) {
      updateData.capacity_configurations = updates.capacityConfigurations;
    }

    // Technical features
    if (updates.climateControlled !== undefined) {
      updateData.climate_controlled = updates.climateControlled;
    }
    if (updates.lightingControlled !== undefined) {
      updateData.lighting_controlled = updates.lightingControlled;
    }
    if (updates.irrigationSystem !== undefined) {
      updateData.irrigation_system = updates.irrigationSystem;
    }
    if (updates.environmentalSpecs !== undefined) {
      updateData.environmental_specs = updates.environmentalSpecs;
    }
    if (updates.equipmentList !== undefined) {
      updateData.equipment_list = updates.equipmentList;
    }

    // Metadata
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.status !== undefined) updateData.status = updates.status;

    await ctx.db.patch(id, updateData);

    return id;
  },
});

/**
 * Delete area (soft delete)
 */
export const remove = mutation({
  args: {
    id: v.id("areas"),
  },
  handler: async (ctx, args) => {
    // Verify area exists
    const area = await ctx.db.get(args.id);
    if (!area) {
      throw new Error("Área no encontrada");
    }

    // Check if area has active batches
    const activeBatches = await ctx.db
      .query("batches")
      .withIndex("by_area", (q) => q.eq("area_id", args.id))
      .filter((q) => q.neq(q.field("status"), "completed"))
      .collect();

    if (activeBatches.length > 0) {
      throw new Error(
        "No se puede eliminar el área porque tiene lotes activos"
      );
    }

    // Soft delete by setting status to inactive
    await ctx.db.patch(args.id, {
      status: "inactive",
      updated_at: Date.now(),
    });

    return args.id;
  },
});
