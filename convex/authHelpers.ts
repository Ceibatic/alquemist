import { QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export async function getAuthenticatedUserId(
  ctx: QueryCtx | MutationCtx
): Promise<Id<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();
  return user?._id ?? null;
}
