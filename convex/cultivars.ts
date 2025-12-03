/**
 * Cultivar Queries and Mutations
 * Cultivar/variety management for each crop type
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Get cultivars by crop type
 */
export const getByCrop = query({
  args: {
    cropTypeId: v.id("crop_types"),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let cultivarsQuery = ctx.db
      .query("cultivars")
      .withIndex("by_crop_type", (q) => q.eq("crop_type_id", args.cropTypeId));

    const allCultivars = await cultivarsQuery.collect();

    // Filter by status if provided (default: active only)
    const statusFilter = args.status || "active";
    return allCultivars.filter((cultivar) => cultivar.status === statusFilter);
  },
});

/**
 * List all cultivars with optional filters
 */
export const list = query({
  args: {
    cropTypeId: v.optional(v.id("crop_types")),
    supplierId: v.optional(v.id("suppliers")),
    status: v.optional(v.string()),
    varietyType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let cultivars;

    // Start with most specific index if available
    if (args.cropTypeId !== undefined) {
      cultivars = await ctx.db
        .query("cultivars")
        .withIndex("by_crop_type", (q) => q.eq("crop_type_id", args.cropTypeId!))
        .collect();
    } else if (args.supplierId !== undefined) {
      cultivars = await ctx.db
        .query("cultivars")
        .withIndex("by_supplier", (q) => q.eq("supplier_id", args.supplierId!))
        .collect();
    } else if (args.status !== undefined) {
      cultivars = await ctx.db
        .query("cultivars")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .collect();
    } else {
      cultivars = await ctx.db.query("cultivars").collect();
    }

    // Apply additional filters
    if (args.supplierId && !args.supplierId) {
      cultivars = cultivars.filter((c) => c.supplier_id === args.supplierId);
    }

    if (args.status) {
      cultivars = cultivars.filter((c) => c.status === args.status);
    }

    if (args.varietyType) {
      cultivars = cultivars.filter((c) => c.variety_type === args.varietyType);
    }

    return cultivars;
  },
});

/**
 * Get cultivar by ID
 */
export const get = query({
  args: {
    id: v.id("cultivars"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Get cultivars by facility
 * Returns cultivars that are linked to a facility via batches
 * Phase 2 Module 15
 */
export const getByFacility = query({
  args: {
    facilityId: v.id("facilities"),
  },
  handler: async (ctx, args) => {
    // Get all batches for this facility to find linked cultivars
    const batches = await ctx.db
      .query("batches")
      .withIndex("by_facility", (q) => q.eq("facility_id", args.facilityId))
      .collect();

    // Extract unique cultivar IDs from batches
    const cultivarIds = [...new Set(batches.map((b) => b.cultivar_id).filter((id) => id !== undefined))];

    // Get cultivar details
    const cultivars = await Promise.all(
      cultivarIds.map(async (cultivarId) => {
        if (!cultivarId) return null;
        const cultivar = await ctx.db.get(cultivarId);
        return cultivar;
      })
    );

    // Filter out any null values and return
    return cultivars.filter((c) => c !== null);
  },
});

/**
 * Get system cultivars available to link
 * Phase 2 Module 15
 */
export const getSystemCultivars = query({
  args: {
    cropTypeId: v.id("crop_types"),
  },
  handler: async (ctx, args) => {
    // Get all active cultivars for the crop type
    const cultivars = await ctx.db
      .query("cultivars")
      .withIndex("by_crop_type", (q) => q.eq("crop_type_id", args.cropTypeId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    return cultivars;
  },
});

/**
 * Link system cultivars to facility
 * Phase 2 Module 15 - This creates batches or facility-cultivar associations
 */
export const linkSystemCultivars = mutation({
  args: {
    facilityId: v.id("facilities"),
    cultivarIds: v.array(v.id("cultivars")),
  },
  handler: async (ctx, args) => {
    // Verify facility exists
    const facility = await ctx.db.get(args.facilityId);
    if (!facility) {
      throw new Error("Instalación no encontrada");
    }

    // Verify all cultivars exist
    const cultivars = await Promise.all(
      args.cultivarIds.map((id) => ctx.db.get(id))
    );

    const invalidCultivars = cultivars.filter((c) => !c);
    if (invalidCultivars.length > 0) {
      throw new Error("Uno o más cultivares son inválidos");
    }

    // Note: In the schema, cultivar-facility relationships are tracked via batches
    // For now, we just return success. When batches are created with these cultivars,
    // the relationship will be established automatically
    return {
      success: true,
      facilityId: args.facilityId,
      cultivarIds: args.cultivarIds,
      message: "Cultivares vinculados exitosamente",
    };
  },
});

/**
 * Create custom cultivar for facility
 * Phase 2 Module 15 - Allows facilities to create their own cultivar varieties
 */
export const createCustom = mutation({
  args: {
    name: v.string(),
    cropTypeId: v.id("crop_types"),
    varietyType: v.optional(v.string()),
    geneticLineage: v.optional(v.string()),
    characteristics: v.optional(v.any()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Verify crop type exists
    const cropType = await ctx.db.get(args.cropTypeId);
    if (!cropType) {
      throw new Error("Tipo de cultivo no encontrado");
    }

    // Validate name length
    if (args.name.length < 2) {
      throw new Error("El nombre debe tener al menos 2 caracteres");
    }

    const cultivarId = await ctx.db.insert("cultivars", {
      name: args.name,
      crop_type_id: args.cropTypeId,
      variety_type: args.varietyType,
      genetic_lineage: args.geneticLineage,
      supplier_id: undefined,
      origin_metadata: undefined,
      characteristics: args.characteristics,
      optimal_conditions: undefined,
      performance_metrics: {},
      status: "active",
      notes: args.notes,
      created_at: now,
    });

    return cultivarId;
  },
});

/**
 * Create a custom cultivar
 * Allows companies to add their own cultivar varieties
 */
export const create = mutation({
  args: {
    name: v.string(),
    cropTypeId: v.id("crop_types"),
    varietyType: v.optional(v.string()),
    geneticLineage: v.optional(v.string()),
    supplierId: v.optional(v.id("suppliers")),
    originMetadata: v.optional(v.any()),
    characteristics: v.optional(v.any()),
    optimalConditions: v.optional(v.any()),
    performanceMetrics: v.optional(v.any()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Verify crop type exists
    const cropType = await ctx.db.get(args.cropTypeId);
    if (!cropType) {
      throw new Error("Tipo de cultivo no encontrado");
    }

    // Verify supplier exists if provided
    if (args.supplierId) {
      const supplier = await ctx.db.get(args.supplierId);
      if (!supplier) {
        throw new Error("Proveedor no encontrado");
      }
    }

    const cultivarId = await ctx.db.insert("cultivars", {
      name: args.name,
      crop_type_id: args.cropTypeId,
      variety_type: args.varietyType,
      genetic_lineage: args.geneticLineage,
      supplier_id: args.supplierId,
      origin_metadata: args.originMetadata,
      characteristics: args.characteristics,
      optimal_conditions: args.optimalConditions,
      performance_metrics: args.performanceMetrics || {},
      status: "active",
      notes: args.notes,
      created_at: now,
    });

    return cultivarId;
  },
});

/**
 * Update cultivar
 */
export const update = mutation({
  args: {
    id: v.id("cultivars"),
    name: v.optional(v.string()),
    varietyType: v.optional(v.string()),
    geneticLineage: v.optional(v.string()),
    supplierId: v.optional(v.id("suppliers")),
    originMetadata: v.optional(v.any()),
    characteristics: v.optional(v.any()),
    optimalConditions: v.optional(v.any()),
    performanceMetrics: v.optional(v.any()),
    status: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // Verify cultivar exists
    const cultivar = await ctx.db.get(id);
    if (!cultivar) {
      throw new Error("Cultivar no encontrado");
    }

    // Verify supplier exists if being updated
    if (updates.supplierId) {
      const supplier = await ctx.db.get(updates.supplierId);
      if (!supplier) {
        throw new Error("Proveedor no encontrado");
      }
    }

    // Build update object with proper field names
    const updateData: any = {};

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.varietyType !== undefined) updateData.variety_type = updates.varietyType;
    if (updates.geneticLineage !== undefined) updateData.genetic_lineage = updates.geneticLineage;
    if (updates.supplierId !== undefined) updateData.supplier_id = updates.supplierId;
    if (updates.originMetadata !== undefined) updateData.origin_metadata = updates.originMetadata;
    if (updates.characteristics !== undefined) updateData.characteristics = updates.characteristics;
    if (updates.optimalConditions !== undefined) {
      updateData.optimal_conditions = updates.optimalConditions;
    }
    if (updates.performanceMetrics !== undefined) {
      updateData.performance_metrics = updates.performanceMetrics;
    }
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.notes !== undefined) updateData.notes = updates.notes;

    await ctx.db.patch(id, updateData);

    return id;
  },
});

/**
 * Delete cultivar (change status to discontinued)
 */
export const remove = mutation({
  args: {
    id: v.id("cultivars"),
  },
  handler: async (ctx, args) => {
    // Verify cultivar exists
    const cultivar = await ctx.db.get(args.id);
    if (!cultivar) {
      throw new Error("Cultivar no encontrado");
    }

    // Soft delete by changing status to discontinued
    await ctx.db.patch(args.id, {
      status: "discontinued",
    });

    return args.id;
  },
});
