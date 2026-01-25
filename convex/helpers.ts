/**
 * Helper functions for Convex queries
 */

import { QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// ============================================================================
// INTERNAL LOT NUMBER GENERATOR
// ============================================================================

/**
 * Category prefixes for internal lot numbers
 * Format: PREFIX-YYMMDD-XXXX
 */
export const LOT_PREFIXES: Record<string, string> = {
  // Supply categories
  seed: "SEM",
  nutrient: "NUT",
  pesticide: "PES",
  equipment: "EQP",
  substrate: "SUS",
  container: "CON",
  tool: "HER",
  other: "OTR",
  // Plant lifecycle categories
  clone: "CLO",
  seedling: "PLT",
  mother_plant: "MAD",
  plant_material: "MAT",
};

/**
 * Generate an internal lot number based on product category
 * Format: PREFIX-YYMMDD-XXXX
 *
 * @param ctx - Convex context for database queries
 * @param category - Product category (seed, nutrient, clone, etc.)
 * @param date - Optional date to use (defaults to now)
 * @returns Generated lot number string
 *
 * @example
 * // For a clone on December 16, 2025:
 * generateInternalLotNumber(ctx, "clone") // Returns "CLO-251216-0001"
 *
 * // For nutrient received:
 * generateInternalLotNumber(ctx, "nutrient") // Returns "NUT-251216-0001"
 */
export async function generateInternalLotNumber(
  ctx: QueryCtx | MutationCtx,
  category: string,
  date?: Date
): Promise<string> {
  const prefix = LOT_PREFIXES[category] || "OTR";
  const now = date || new Date();

  // Format date as YYMMDD
  const year = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const dateStr = `${year}${month}${day}`;

  // Base pattern for today's lots with this prefix
  const basePattern = `${prefix}-${dateStr}-`;

  // Find existing lots with this pattern to get next sequence number
  const existingLots = await ctx.db
    .query("inventory_items")
    .filter((q) => q.neq(q.field("batch_number"), undefined))
    .collect();

  // Filter to lots matching our pattern
  const matchingLots = existingLots.filter(
    (item) => item.batch_number?.startsWith(basePattern)
  );

  // Find the highest sequence number
  let maxSequence = 0;
  for (const lot of matchingLots) {
    const sequenceStr = lot.batch_number?.split("-")[2];
    if (sequenceStr) {
      const sequence = parseInt(sequenceStr, 10);
      if (!isNaN(sequence) && sequence > maxSequence) {
        maxSequence = sequence;
      }
    }
  }

  // Generate next sequence number
  const nextSequence = String(maxSequence + 1).padStart(4, "0");

  return `${basePattern}${nextSequence}`;
}

/**
 * Get the prefix for a product category
 */
export function getLotPrefix(category: string): string {
  return LOT_PREFIXES[category] || "OTR";
}

// ============================================================================
// DEPRECATED FUNCTIONS
// ============================================================================

/**
 * DEPRECATED: Get company ID (Convex ID) from organization ID (Clerk ID)
 * This function is no longer needed after switching to custom auth
 */
// export async function getCompanyIdFromOrgId(
//   ctx: QueryCtx,
//   organizationId: string
// ): Promise<Id<"companies"> | null> {
//   const company = await ctx.db
//     .query("companies")
//     .withIndex("by_organization_id", (q) =>
//       q.eq("organization_id", organizationId)
//     )
//     .first();
//
//   return company?._id ?? null;
// }
