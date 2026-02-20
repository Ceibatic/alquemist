/**
 * Calculate actual quantity from a template resource's quantity_basis and context.
 *
 * Used at schedule generation time to materialize template resource quantities
 * into scheduled_activity_resources with concrete totals.
 */

export interface MaterializationContext {
  plantCount?: number;
  areaM2?: number;
}

export interface MaterializationResult {
  /** Calculated total quantity, or null if basis requires runtime input (e.g. per_L_solution) */
  quantity: number | null;
  /** Audit context: the multiplier inputs used for this calculation */
  context: Record<string, number>;
}

export function materializeQuantity(
  templateQuantity: number,
  basis: string,
  ctx: MaterializationContext
): MaterializationResult {
  switch (basis) {
    case "fixed":
      return { quantity: templateQuantity, context: {} };

    case "per_plant": {
      const count = ctx.plantCount ?? 0;
      return {
        quantity: templateQuantity * count,
        context: { plant_count: count },
      };
    }

    case "per_m2": {
      const area = ctx.areaM2 ?? 0;
      return {
        quantity: templateQuantity * area,
        context: { area_m2: area },
      };
    }

    case "per_zone":
      // 1 zone = 1× the template quantity
      return { quantity: templateQuantity, context: { zones: 1 } };

    case "per_L_solution":
      // Cannot materialize — operator specifies solution volume at execution time
      return { quantity: null, context: {} };

    default:
      // Unknown basis — treat as fixed
      return { quantity: templateQuantity, context: {} };
  }
}
