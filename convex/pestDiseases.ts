/**
 * Pest Diseases — Reference data queries
 *
 * Global reference table (no company scoping) for pests, diseases and deficiencies.
 * Used by the observation form to link observations to known organisms.
 */

import { query } from "./_generated/server";
import { v } from "convex/values";

// ============================================================================
// QUERIES
// ============================================================================

/**
 * List all active pest_diseases, optionally filtered by type.
 * Type values: "pest" | "disease" | "deficiency"
 */
export const listByType = query({
  args: {
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let records;

    if (args.type) {
      records = await ctx.db
        .query("pest_diseases")
        .withIndex("by_type", (q) => q.eq("type", args.type!))
        .collect();
    } else {
      records = await ctx.db.query("pest_diseases").collect();
    }

    // Return only active records, sorted by name
    return records
      .filter((r) => r.status === "active")
      .sort((a, b) => a.name.localeCompare(b.name, "es"));
  },
});
