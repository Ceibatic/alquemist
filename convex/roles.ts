/**
 * Roles Query Functions & Mutations
 * Module 07: Reference Data / Module 17: Users & Invitations
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthenticatedUserId } from "./authHelpers";

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
      hourly_rate: role.hourly_rate,
      rate_currency: role.rate_currency,
    }));
  },
});

/**
 * Get role by ID
 */
export const getById = query({
  args: {
    id: v.id("roles"),
  },
  handler: async (ctx, args) => {
    const role = await ctx.db.get(args.id);
    if (!role) return null;
    return {
      _id: role._id,
      name: role.name,
      display_name_es: role.display_name_es,
      display_name_en: role.display_name_en,
      description: role.description,
      level: role.level,
      scope_level: role.scope_level,
      permissions: role.permissions,
      hourly_rate: role.hourly_rate,
      rate_currency: role.rate_currency,
    };
  },
});

/**
 * Get roles that the current user can assign
 * Users can only assign roles at or below their own level
 */
export const getAssignableRoles = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthenticatedUserId(ctx);
    if (!userId) return [];

    const user = await ctx.db.get(userId);
    if (!user) return [];

    // Get current user's role level
    let currentUserLevel = 0;
    if (user.role_id) {
      const userRole = await ctx.db.get(user.role_id);
      if (userRole) {
        currentUserLevel = userRole.level;
      }
    }

    const allRoles = await ctx.db
      .query("roles")
      .filter((q) => q.eq(q.field("is_system_role"), true))
      .filter((q) => q.eq(q.field("is_active"), true))
      .collect();

    // Filter: only roles at or below current user's level, exclude PLATFORM_ADMIN
    return allRoles
      .filter((role) => role.level <= currentUserLevel && role.name !== "PLATFORM_ADMIN")
      .map((role) => ({
        _id: role._id,
        name: role.name,
        display_name_es: role.display_name_es,
        display_name_en: role.display_name_en,
        description: role.description,
        level: role.level,
        scope_level: role.scope_level,
        hourly_rate: role.hourly_rate,
        rate_currency: role.rate_currency,
      }));
  },
});

/**
 * Update hourly rate for a role (labor costing)
 */
export const updateRate = mutation({
  args: {
    roleId: v.id("roles"),
    hourly_rate: v.number(),
    rate_currency: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const role = await ctx.db.get(args.roleId);
    if (!role) {
      throw new Error("Rol no encontrado");
    }

    await ctx.db.patch(args.roleId, {
      hourly_rate: args.hourly_rate,
      rate_currency: args.rate_currency || "COP",
    });

    return { success: true };
  },
});
