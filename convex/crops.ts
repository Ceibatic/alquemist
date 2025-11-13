/**
 * Crop Type Queries
 * Read-only queries for crop types (Cannabis, Coffee, Cocoa, Flowers)
 */

import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * Get all crop types
 * Returns active crop types only by default
 */
export const getCropTypes = query({
  args: {
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let cropTypesQuery = ctx.db.query("crop_types");

    const allCropTypes = await cropTypesQuery.collect();

    // Filter by active status unless includeInactive is true
    if (!args.includeInactive) {
      return allCropTypes.filter((ct) => ct.is_active);
    }

    return allCropTypes;
  },
});

/**
 * Get crop type by ID
 */
export const getCropTypeById = query({
  args: {
    id: v.id("crop_types"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Get crop type by name
 */
export const getCropTypeByName = query({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("crop_types")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
  },
});
