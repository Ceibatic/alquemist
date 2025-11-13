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
