/**
 * Roles Query Functions
 * Module 17: Users & Invitations
 */

import { query } from "./_generated/server";

/**
 * Get all system roles
 * Used in invitation flow and user management
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const roles = await ctx.db
      .query("roles")
      .filter((q) => q.eq(q.field("is_system_role"), true))
      .filter((q) => q.eq(q.field("is_active"), true))
      .collect();

    return roles.map((role) => ({
      _id: role._id,
      name: role.name,
      display_name_es: role.display_name_es,
      display_name_en: role.display_name_en,
      description: role.description,
      level: role.level,
      scope_level: role.scope_level,
    }));
  },
});

/**
 * Get role by ID
 */
export const getById = query({
  args: {},
  handler: async (ctx) => {
    // This will be implemented when needed
    return null;
  },
});
