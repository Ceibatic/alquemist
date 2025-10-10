/**
 * Helper functions for Convex queries
 */

import { QueryCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Get company ID (Convex ID) from organization ID (Clerk ID)
 */
export async function getCompanyIdFromOrgId(
  ctx: QueryCtx,
  organizationId: string
): Promise<Id<"companies"> | null> {
  const company = await ctx.db
    .query("companies")
    .withIndex("by_organization_id", (q) =>
      q.eq("organization_id", organizationId)
    )
    .first();

  return company?._id ?? null;
}
