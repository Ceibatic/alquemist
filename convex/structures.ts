/**
 * Structure Queries and Mutations
 * Hierarchical capacity model — structures within areas (zones)
 *
 * Formula: total_capacity = num_levels × containers_per_level × positions_per_container
 * Area capacity = SUM(structure.total_capacity) for all active structures
 */

import { v } from "convex/values";
import { mutation, query, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// ============================================================================
// INTERNAL HELPER
// ============================================================================

/**
 * Recalculates area's capacity_configurations.max_capacity from active structures.
 * Called after every structure create/update/remove.
 */
export async function recalculateAreaCapacity(ctx: MutationCtx, areaId: Id<"areas">) {
  const structures = await ctx.db
    .query("structures")
    .withIndex("by_area", (q) => q.eq("area_id", areaId))
    .collect();

  const activeStructures = structures.filter((s) => s.status === "active");

  const totalCapacity = activeStructures.reduce(
    (sum, s) => sum + s.total_capacity,
    0
  );
  const totalGrowingArea = activeStructures.reduce(
    (sum, s) => sum + (s.growing_area_m2 || 0),
    0
  );

  if (activeStructures.length > 0) {
    await ctx.db.patch(areaId, {
      capacity_mode: "structures",
      capacity_configurations: {
        max_capacity: totalCapacity,
        source: "structures",
        structure_count: activeStructures.length,
        total_growing_area_m2: totalGrowingArea,
      },
      updated_at: Date.now(),
    });
  } else {
    // No active structures — reset to manual mode
    await ctx.db.patch(areaId, {
      capacity_mode: undefined,
      capacity_configurations: {
        max_capacity: 0,
      },
      updated_at: Date.now(),
    });
  }
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get all structures for an area, ordered by sort_order
 */
export const getByArea = query({
  args: {
    areaId: v.id("areas"),
  },
  handler: async (ctx, args) => {
    const structures = await ctx.db
      .query("structures")
      .withIndex("by_area", (q) => q.eq("area_id", args.areaId))
      .collect();

    return structures.sort((a, b) => a.sort_order - b.sort_order);
  },
});

/**
 * Get a single structure by ID
 */
export const get = query({
  args: {
    id: v.id("structures"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Get capacity summary for an area (aggregated from structures)
 */
export const getCapacitySummary = query({
  args: {
    areaId: v.id("areas"),
  },
  handler: async (ctx, args) => {
    const structures = await ctx.db
      .query("structures")
      .withIndex("by_area", (q) => q.eq("area_id", args.areaId))
      .collect();

    const activeStructures = structures.filter((s) => s.status === "active");

    return {
      structureCount: activeStructures.length,
      totalCapacity: activeStructures.reduce(
        (sum, s) => sum + s.total_capacity,
        0
      ),
      totalGrowingAreaM2: activeStructures.reduce(
        (sum, s) => sum + (s.growing_area_m2 || 0),
        0
      ),
      totalFootprintM2: activeStructures.reduce(
        (sum, s) => sum + (s.footprint_m2 || 0),
        0
      ),
      structures: activeStructures.sort((a, b) => a.sort_order - b.sort_order),
    };
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new structure within an area
 */
export const create = mutation({
  args: {
    areaId: v.id("areas"),
    name: v.string(),
    structureType: v.string(),
    environmentType: v.string(),

    // Hierarchy config
    numLevels: v.number(),
    containersPerLevel: v.number(),
    containerType: v.string(),
    positionsPerContainer: v.number(),

    // Optional
    footprintM2: v.optional(v.number()),
    sortOrder: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Verify area exists
    const area = await ctx.db.get(args.areaId);
    if (!area) {
      throw new Error("Area no encontrada");
    }

    // Verify name uniqueness within area
    const existingStructures = await ctx.db
      .query("structures")
      .withIndex("by_area", (q) => q.eq("area_id", args.areaId))
      .collect();

    const nameExists = existingStructures.some(
      (s) => s.name.toLowerCase() === args.name.trim().toLowerCase()
    );
    if (nameExists) {
      throw new Error(
        "Ya existe una estructura con ese nombre en esta area"
      );
    }

    // Compute capacity
    const totalCapacity =
      args.numLevels * args.containersPerLevel * args.positionsPerContainer;

    // Compute growing area
    const growingAreaM2 = args.footprintM2
      ? args.footprintM2 * args.numLevels
      : undefined;

    // Determine sort order
    const sortOrder =
      args.sortOrder ?? existingStructures.length;

    const structureId = await ctx.db.insert("structures", {
      area_id: args.areaId,
      name: args.name.trim(),
      structure_type: args.structureType,
      environment_type: args.environmentType,

      num_levels: args.numLevels,
      containers_per_level: args.containersPerLevel,
      container_type: args.containerType,
      positions_per_container: args.positionsPerContainer,

      total_capacity: totalCapacity,
      footprint_m2: args.footprintM2,
      growing_area_m2: growingAreaM2,

      sort_order: sortOrder,
      status: "active",
      notes: args.notes,
      created_at: now,
      updated_at: now,
    });

    // Recalculate area capacity
    await recalculateAreaCapacity(ctx, args.areaId);

    return structureId;
  },
});

/**
 * Update a structure
 */
export const update = mutation({
  args: {
    id: v.id("structures"),

    name: v.optional(v.string()),
    structureType: v.optional(v.string()),
    environmentType: v.optional(v.string()),

    numLevels: v.optional(v.number()),
    containersPerLevel: v.optional(v.number()),
    containerType: v.optional(v.string()),
    positionsPerContainer: v.optional(v.number()),

    footprintM2: v.optional(v.number()),
    notes: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // Verify structure exists
    const structure = await ctx.db.get(id);
    if (!structure) {
      throw new Error("Estructura no encontrada");
    }

    // Verify name uniqueness if name changed
    if (updates.name !== undefined && updates.name !== structure.name) {
      const siblings = await ctx.db
        .query("structures")
        .withIndex("by_area", (q) => q.eq("area_id", structure.area_id))
        .collect();
      const nameExists = siblings.some(
        (s) =>
          s._id !== id &&
          s.name.toLowerCase() === updates.name!.trim().toLowerCase()
      );
      if (nameExists) {
        throw new Error(
          "Ya existe una estructura con ese nombre en esta area"
        );
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {
      updated_at: Date.now(),
    };

    if (updates.name !== undefined) updateData.name = updates.name.trim();
    if (updates.structureType !== undefined)
      updateData.structure_type = updates.structureType;
    if (updates.environmentType !== undefined)
      updateData.environment_type = updates.environmentType;
    if (updates.numLevels !== undefined)
      updateData.num_levels = updates.numLevels;
    if (updates.containersPerLevel !== undefined)
      updateData.containers_per_level = updates.containersPerLevel;
    if (updates.containerType !== undefined)
      updateData.container_type = updates.containerType;
    if (updates.positionsPerContainer !== undefined)
      updateData.positions_per_container = updates.positionsPerContainer;
    if (updates.footprintM2 !== undefined)
      updateData.footprint_m2 = updates.footprintM2;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.status !== undefined) updateData.status = updates.status;

    // Recompute capacity if any hierarchy field changed
    const numLevels = updates.numLevels ?? structure.num_levels;
    const containersPerLevel =
      updates.containersPerLevel ?? structure.containers_per_level;
    const positionsPerContainer =
      updates.positionsPerContainer ?? structure.positions_per_container;
    const footprintM2 = updates.footprintM2 ?? structure.footprint_m2;

    updateData.total_capacity =
      numLevels * containersPerLevel * positionsPerContainer;
    updateData.growing_area_m2 = footprintM2
      ? footprintM2 * numLevels
      : structure.growing_area_m2;

    await ctx.db.patch(id, updateData);

    // Recalculate area capacity
    await recalculateAreaCapacity(ctx, structure.area_id);

    return id;
  },
});

/**
 * Remove a structure (hard delete — structures have no external dependencies)
 */
export const remove = mutation({
  args: {
    id: v.id("structures"),
  },
  handler: async (ctx, args) => {
    const structure = await ctx.db.get(args.id);
    if (!structure) {
      throw new Error("Estructura no encontrada");
    }

    const areaId = structure.area_id;

    await ctx.db.delete(args.id);

    // Recalculate area capacity
    await recalculateAreaCapacity(ctx, areaId);

    return args.id;
  },
});

/**
 * Create multiple structures with consecutive naming within an area.
 * Used from the structures tab to continue an existing prefix sequence.
 */
export const createBatch = mutation({
  args: {
    areaId: v.id("areas"),
    prefix: v.string(),
    startNumber: v.number(),
    quantity: v.number(),
    structureType: v.string(),
    environmentType: v.string(),
    numLevels: v.number(),
    containersPerLevel: v.number(),
    containerType: v.string(),
    positionsPerContainer: v.number(),
    footprintM2: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const area = await ctx.db.get(args.areaId);
    if (!area) throw new Error("Area no encontrada");

    const existingStructures = await ctx.db
      .query("structures")
      .withIndex("by_area", (q) => q.eq("area_id", args.areaId))
      .collect();

    const currentMaxOrder = existingStructures.length > 0
      ? Math.max(...existingStructures.map((s) => s.sort_order))
      : -1;

    const totalCapacity =
      args.numLevels * args.containersPerLevel * args.positionsPerContainer;
    const growingAreaM2 = args.footprintM2
      ? args.footprintM2 * args.numLevels
      : undefined;

    const ids: Id<"structures">[] = [];

    for (let i = 0; i < args.quantity; i++) {
      const num = args.startNumber + i;
      const name = `${args.prefix} ${num}`;

      const nameExists = existingStructures.some(
        (s) => s.name.toLowerCase() === name.toLowerCase()
      );
      if (nameExists) {
        throw new Error(`Ya existe una estructura con nombre "${name}"`);
      }

      const id = await ctx.db.insert("structures", {
        area_id: args.areaId,
        name,
        structure_type: args.structureType,
        environment_type: args.environmentType,
        num_levels: args.numLevels,
        containers_per_level: args.containersPerLevel,
        container_type: args.containerType,
        positions_per_container: args.positionsPerContainer,
        total_capacity: totalCapacity,
        footprint_m2: args.footprintM2,
        growing_area_m2: growingAreaM2,
        sort_order: currentMaxOrder + 1 + i,
        status: "active",
        notes: args.notes,
        created_at: now,
        updated_at: now,
      });
      ids.push(id);
    }

    await recalculateAreaCapacity(ctx, args.areaId);
    return ids;
  },
});

/**
 * Reorder structures within an area
 */
export const reorder = mutation({
  args: {
    areaId: v.id("areas"),
    structureIds: v.array(v.id("structures")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    for (let i = 0; i < args.structureIds.length; i++) {
      await ctx.db.patch(args.structureIds[i], {
        sort_order: i,
        updated_at: now,
      });
    }

    return args.areaId;
  },
});
