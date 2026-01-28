/**
 * Units of Measure Queries
 * Module 07: Reference Data
 */

import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * Get all units of measure, optionally filtered by category
 */
export const getUnits = query({
  args: {
    category: v.optional(v.string()),
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let results = await ctx.db.query("units_of_measure").collect();

    if (!args.includeInactive) {
      results = results.filter((u) => u.is_active);
    }

    if (args.category) {
      results = results.filter((u) => u.category === args.category);
    }

    return results.sort((a, b) => a.name.localeCompare(b.name));
  },
});

/**
 * Get a single unit by ID
 */
export const getById = query({
  args: {
    id: v.id("units_of_measure"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Get a unit by its symbol
 */
export const getBySymbol = query({
  args: {
    symbol: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("units_of_measure")
      .withIndex("by_symbol", (q) => q.eq("symbol", args.symbol))
      .first();
  },
});

/**
 * Get all available unit categories
 */
export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    const units = await ctx.db
      .query("units_of_measure")
      .filter((q) => q.eq(q.field("is_active"), true))
      .collect();

    const categories = [...new Set(units.map((u) => u.category))];
    return categories.sort();
  },
});
