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
// FIFO INVENTORY CONSUMPTION
// ============================================================================

export interface FifoConsumedItem {
  inventory_item_id: Id<"inventory_items">;
  quantity_consumed: number;
  cost_per_unit: number | undefined;
  batch_number: string | undefined;
}

/**
 * Consume inventory using FIFO (First In, First Out) by received_date.
 * Deducts from the oldest available lots first.
 *
 * @returns Array of consumed items with quantity and cost details
 * @throws Error if insufficient stock
 */
export async function consumeFromInventoryFIFO(
  ctx: MutationCtx,
  args: {
    product_id: Id<"products">;
    quantity: number;
    facility_id?: Id<"facilities">;
    area_id?: Id<"areas">;
  }
): Promise<FifoConsumedItem[]> {
  const now = Date.now();

  // Determine area filter
  let areaIds: Id<"areas">[] = [];
  if (args.area_id) {
    areaIds = [args.area_id];
  } else if (args.facility_id) {
    const areas = await ctx.db
      .query("areas")
      .withIndex("by_facility", (q) => q.eq("facility_id", args.facility_id!))
      .collect();
    areaIds = areas.map((a) => a._id);
  }

  // Get available inventory sorted FIFO
  const allInventory = await ctx.db.query("inventory_items").collect();
  let availableItems = allInventory
    .filter(
      (item) =>
        item.product_id === args.product_id &&
        item.lot_status === "available" &&
        item.quantity_available > 0
    )
    .sort((a, b) => (a.received_date || 0) - (b.received_date || 0));

  // Filter by area if specified
  if (areaIds.length > 0) {
    availableItems = availableItems.filter(
      (item) => item.area_id && areaIds.includes(item.area_id)
    );
  }

  const consumed: FifoConsumedItem[] = [];
  let remaining = args.quantity;

  for (const item of availableItems) {
    if (remaining <= 0) break;

    const consumeFromThis = Math.min(item.quantity_available, remaining);

    await ctx.db.patch(item._id, {
      quantity_available: item.quantity_available - consumeFromThis,
      last_movement_date: now,
      updated_at: now,
    });

    consumed.push({
      inventory_item_id: item._id,
      quantity_consumed: consumeFromThis,
      cost_per_unit: item.cost_per_unit,
      batch_number: item.batch_number,
    });

    remaining -= consumeFromThis;
  }

  if (remaining > 0) {
    const product = await ctx.db.get(args.product_id);
    throw new Error(
      `Stock insuficiente para ${product?.name || "producto"}. Requerido: ${args.quantity}, Disponible: ${args.quantity - remaining}`
    );
  }

  return consumed;
}

// ============================================================================
// ACTIVITY TYPE LOOKUP
// ============================================================================

/**
 * Get activity type by code for a company.
 * Returns null if not found (graceful fallback).
 */
export async function getActivityTypeByCode(
  ctx: QueryCtx | MutationCtx,
  companyId: Id<"companies">,
  code: string
) {
  return await ctx.db
    .query("activity_types")
    .withIndex("by_company_code", (q) =>
      q.eq("company_id", companyId).eq("code", code)
    )
    .first();
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
