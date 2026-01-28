/**
 * Seed All Reference Data
 * Runs all reference data seeds in order
 */

import { action } from "./_generated/server";
import { internal, api } from "./_generated/api";

export const seedAllReferenceData = action({
  args: {},
  handler: async (ctx) => {
    const results: Record<string, unknown> = {};

    // 1. Geography
    results.geography = await ctx.runMutation(
      api.seedGeographic.seedColombianGeography
    );

    // 2. Crop Types
    results.cropTypes = await ctx.runMutation(
      api.seedCropTypes.seedCropTypes
    );

    // 3. Roles
    results.roles = await ctx.runMutation(
      api.seedRoles.seedSystemRoles
    );

    // 4. Units
    results.units = await ctx.runMutation(
      api.seedUnits.seedUnits
    );

    return {
      message: "All reference data seeded",
      results,
    };
  },
});
