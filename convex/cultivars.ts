/**
 * Cultivar Queries and Mutations
 * Cultivar/variety management for each crop type
 * All cultivars belong to a company (not global like crop_types)
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * List cultivars by company with optional filters
 */
export const list = query({
  args: {
    companyId: v.id("companies"),
    cropTypeId: v.optional(v.id("crop_types")),
    supplierId: v.optional(v.id("suppliers")),
    status: v.optional(v.string()),
    varietyType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let cultivars;

    // Use company index first
    if (args.cropTypeId !== undefined) {
      cultivars = await ctx.db
        .query("cultivars")
        .withIndex("by_company_crop", (q) =>
          q.eq("company_id", args.companyId).eq("crop_type_id", args.cropTypeId!)
        )
        .collect();
    } else {
      cultivars = await ctx.db
        .query("cultivars")
        .withIndex("by_company", (q) => q.eq("company_id", args.companyId))
        .collect();
    }

    // Apply additional filters
    if (args.supplierId) {
      cultivars = cultivars.filter((c) => c.supplier_id === args.supplierId);
    }

    if (args.status) {
      cultivars = cultivars.filter((c) => c.status === args.status);
    } else {
      // Default: active only
      cultivars = cultivars.filter((c) => c.status === "active");
    }

    if (args.varietyType) {
      cultivars = cultivars.filter((c) => c.variety_type === args.varietyType);
    }

    return cultivars;
  },
});

/**
 * Get cultivars by crop type for a company
 */
export const getByCrop = query({
  args: {
    companyId: v.id("companies"),
    cropTypeId: v.id("crop_types"),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const cultivars = await ctx.db
      .query("cultivars")
      .withIndex("by_company_crop", (q) =>
        q.eq("company_id", args.companyId).eq("crop_type_id", args.cropTypeId)
      )
      .collect();

    // Filter by status if provided (default: active only)
    const statusFilter = args.status || "active";
    return cultivars.filter((cultivar) => cultivar.status === statusFilter);
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
 * Get cultivars by facility (through batches)
 * Returns cultivars that are linked to a facility via batches
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
    const cultivarIds = Array.from(
      new Set(batches.map((b) => b.cultivar_id).filter((id) => id !== undefined))
    );

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
 * Create a custom cultivar for a company
 */
export const create = mutation({
  args: {
    companyId: v.id("companies"),
    name: v.string(),
    cropTypeId: v.id("crop_types"),
    varietyType: v.optional(v.string()),
    geneticLineage: v.optional(v.string()),
    floweringTimeDays: v.optional(v.number()),
    supplierId: v.optional(v.id("suppliers")),
    thcMin: v.optional(v.number()),
    thcMax: v.optional(v.number()),
    cbdMin: v.optional(v.number()),
    cbdMax: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Verify company exists
    const company = await ctx.db.get(args.companyId);
    if (!company) {
      throw new Error("Empresa no encontrada");
    }

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

    // Validate name length
    if (args.name.length < 2) {
      throw new Error("El nombre debe tener al menos 2 caracteres");
    }

    // Validate THC range
    if (args.thcMin !== undefined && args.thcMax !== undefined) {
      if (args.thcMin > args.thcMax) {
        throw new Error("THC mínimo no puede ser mayor que THC máximo");
      }
    }

    // Validate CBD range
    if (args.cbdMin !== undefined && args.cbdMax !== undefined) {
      if (args.cbdMin > args.cbdMax) {
        throw new Error("CBD mínimo no puede ser mayor que CBD máximo");
      }
    }

    const cultivarId = await ctx.db.insert("cultivars", {
      company_id: args.companyId,
      name: args.name,
      crop_type_id: args.cropTypeId,
      variety_type: args.varietyType,
      genetic_lineage: args.geneticLineage,
      flowering_time_days: args.floweringTimeDays,
      supplier_id: args.supplierId,
      thc_min: args.thcMin,
      thc_max: args.thcMax,
      cbd_min: args.cbdMin,
      cbd_max: args.cbdMax,
      performance_metrics: {},
      status: "active",
      notes: args.notes,
      created_at: now,
      updated_at: now,
    });

    return cultivarId;
  },
});

/**
 * Create custom cultivar (simplified alias for create)
 */
export const createCustom = mutation({
  args: {
    companyId: v.id("companies"),
    name: v.string(),
    cropTypeId: v.id("crop_types"),
    varietyType: v.optional(v.string()),
    geneticLineage: v.optional(v.string()),
    floweringTimeDays: v.optional(v.number()),
    thcMin: v.optional(v.number()),
    thcMax: v.optional(v.number()),
    cbdMin: v.optional(v.number()),
    cbdMax: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Verify company exists
    const company = await ctx.db.get(args.companyId);
    if (!company) {
      throw new Error("Empresa no encontrada");
    }

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
      company_id: args.companyId,
      name: args.name,
      crop_type_id: args.cropTypeId,
      variety_type: args.varietyType,
      genetic_lineage: args.geneticLineage,
      flowering_time_days: args.floweringTimeDays,
      supplier_id: undefined,
      thc_min: args.thcMin,
      thc_max: args.thcMax,
      cbd_min: args.cbdMin,
      cbd_max: args.cbdMax,
      performance_metrics: {},
      status: "active",
      notes: args.notes,
      created_at: now,
      updated_at: now,
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
    floweringTimeDays: v.optional(v.number()),
    supplierId: v.optional(v.id("suppliers")),
    thcMin: v.optional(v.number()),
    thcMax: v.optional(v.number()),
    cbdMin: v.optional(v.number()),
    cbdMax: v.optional(v.number()),
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

    // Validate THC range
    const finalThcMin = updates.thcMin ?? cultivar.thc_min;
    const finalThcMax = updates.thcMax ?? cultivar.thc_max;
    if (finalThcMin !== undefined && finalThcMax !== undefined) {
      if (finalThcMin > finalThcMax) {
        throw new Error("THC mínimo no puede ser mayor que THC máximo");
      }
    }

    // Validate CBD range
    const finalCbdMin = updates.cbdMin ?? cultivar.cbd_min;
    const finalCbdMax = updates.cbdMax ?? cultivar.cbd_max;
    if (finalCbdMin !== undefined && finalCbdMax !== undefined) {
      if (finalCbdMin > finalCbdMax) {
        throw new Error("CBD mínimo no puede ser mayor que CBD máximo");
      }
    }

    // Build update object with proper field names
    const updateData: Record<string, unknown> = {
      updated_at: Date.now(),
    };

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.varietyType !== undefined) updateData.variety_type = updates.varietyType;
    if (updates.geneticLineage !== undefined) updateData.genetic_lineage = updates.geneticLineage;
    if (updates.floweringTimeDays !== undefined)
      updateData.flowering_time_days = updates.floweringTimeDays;
    if (updates.supplierId !== undefined) updateData.supplier_id = updates.supplierId;
    if (updates.thcMin !== undefined) updateData.thc_min = updates.thcMin;
    if (updates.thcMax !== undefined) updateData.thc_max = updates.thcMax;
    if (updates.cbdMin !== undefined) updateData.cbd_min = updates.cbdMin;
    if (updates.cbdMax !== undefined) updateData.cbd_max = updates.cbdMax;
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
      updated_at: Date.now(),
    });

    return args.id;
  },
});

/**
 * Hard delete cultivar (for cleanup purposes)
 */
export const hardDelete = mutation({
  args: {
    id: v.id("cultivars"),
  },
  handler: async (ctx, args) => {
    const cultivar = await ctx.db.get(args.id);
    if (!cultivar) {
      throw new Error("Cultivar no encontrado");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

/**
 * Delete demo cultivars for a company
 */
export const deleteDemoCultivars = mutation({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    const cultivars = await ctx.db
      .query("cultivars")
      .withIndex("by_company", (q) => q.eq("company_id", args.companyId))
      .collect();

    // Filter demo cultivars (name contains "(Demo)")
    const demoCultivars = cultivars.filter((c) => c.name.includes("(Demo)"));

    // Delete each demo cultivar
    for (const cultivar of demoCultivars) {
      await ctx.db.delete(cultivar._id);
    }

    return {
      deleted: demoCultivars.length,
    };
  },
});

/**
 * Delete orphaned cultivars (those without company_id - legacy data)
 */
export const deleteOrphanedCultivars = mutation({
  args: {},
  handler: async (ctx) => {
    // Get all cultivars
    const allCultivars = await ctx.db.query("cultivars").collect();

    // Filter cultivars without company_id
    const orphaned = allCultivars.filter((c) => !c.company_id);

    // Delete each orphaned cultivar
    for (const cultivar of orphaned) {
      await ctx.db.delete(cultivar._id);
    }

    return {
      deleted: orphaned.length,
      names: orphaned.map((c) => c.name),
    };
  },
});
