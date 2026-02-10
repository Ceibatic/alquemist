/**
 * Activity Resources — Normalized resource tracking per activity
 *
 * Each row represents a resource consumed, produced, applied, or wasted
 * by an activity. Replaces the embedded materials_consumed/materials_produced
 * arrays and enables direct queries by product, lot, and direction.
 */

import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * List all resources for a given activity.
 */
export const listByActivity = query({
  args: {
    activityId: v.id("activities"),
  },
  handler: async (ctx, { activityId }) => {
    return await ctx.db
      .query("activity_resources")
      .withIndex("by_activity", (q) => q.eq("activity_id", activityId))
      .collect();
  },
});

/**
 * List resources for a given product, optionally limited.
 * Returns most recent first (by created_at descending).
 */
export const listByProduct = query({
  args: {
    productId: v.id("products"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { productId, limit }) => {
    const resources = await ctx.db
      .query("activity_resources")
      .withIndex("by_product", (q) => q.eq("product_id", productId))
      .collect();

    // Sort by created_at descending
    resources.sort((a, b) => b.created_at - a.created_at);

    if (limit && limit > 0) {
      return resources.slice(0, limit);
    }
    return resources;
  },
});
