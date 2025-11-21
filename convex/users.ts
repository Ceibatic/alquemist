/**
 * Module 4: User Role Assignment and Management
 * User management functions for Phase 1
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ============================================================================
// MODULE 4: USER ROLE ASSIGNMENT
// ============================================================================

/**
 * Assign role to user (during onboarding or later)
 * Auto-assigns Owner role during onboarding
 */
export const assignUserRole = mutation({
  args: {
    userId: v.id("users"),
    companyId: v.id("companies"),
    roleId: v.id("roles"),
    facilityAccess: v.optional(v.array(v.id("facilities"))),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Verify user exists
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    // Verify company exists
    const company = await ctx.db.get(args.companyId);
    if (!company) {
      throw new Error("Empresa no encontrada");
    }

    // Verify role exists
    const role = await ctx.db.get(args.roleId);
    if (!role) {
      throw new Error("Rol no encontrado");
    }

    // Check if user already has a role in this company
    if (user.company_id && user.company_id !== args.companyId) {
      throw new Error("El usuario ya pertenece a otra empresa");
    }

    // Update user with role and company
    await ctx.db.patch(args.userId, {
      company_id: args.companyId,
      role_id: args.roleId,
      accessible_facility_ids: args.facilityAccess || [],
      updated_at: now,
    });

    return {
      success: true,
      message: "Rol asignado exitosamente",
    };
  },
});

/**
 * Get all users in a company
 * Used in user management page
 */
export const getUsersByCompany = query({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    // Get all users for this company
    const users = await ctx.db
      .query("users")
      .withIndex("by_company", (q) => q.eq("company_id", args.companyId))
      .collect();

    // Get role names for each user
    const usersWithRoles = await Promise.all(
      users.map(async (user) => {
        const role = user.role_id ? await ctx.db.get(user.role_id) : null;

        return {
          id: user._id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          roleId: user.role_id,
          roleName: role?.display_name_es || "Sin rol",
          status: user.status,
          lastLogin: user.last_login,
        };
      })
    );

    return usersWithRoles;
  },
});

/**
 * Update user's role or facility access
 */
export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    roleId: v.optional(v.id("roles")),
    facilityAccess: v.optional(v.array(v.id("facilities"))),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Verify user exists
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    // Verify role if provided
    if (args.roleId) {
      const role = await ctx.db.get(args.roleId);
      if (!role) {
        throw new Error("Rol no encontrado");
      }

      // Check if trying to remove last owner
      if (user.role_id) {
        const currentRole = await ctx.db.get(user.role_id);
        if (currentRole?.name === "COMPANY_OWNER" && role.name !== "COMPANY_OWNER") {
          // Count owners in company
          const owners = await ctx.db
            .query("users")
            .withIndex("by_company", (q) => q.eq("company_id", user.company_id))
            .collect();

          const ownerCount = owners.filter(async (u) => {
            const r = u.role_id ? await ctx.db.get(u.role_id) : null;
            return r?.name === "COMPANY_OWNER";
          }).length;

          if (ownerCount <= 1) {
            throw new Error("No puedes remover el último propietario de la empresa");
          }
        }
      }
    }

    // Update user
    const updates: any = {
      updated_at: now,
    };

    if (args.roleId) {
      updates.role_id = args.roleId;
    }

    if (args.facilityAccess) {
      updates.accessible_facility_ids = args.facilityAccess;
    }

    await ctx.db.patch(args.userId, updates);

    return {
      success: true,
      message: "Rol actualizado exitosamente",
    };
  },
});

/**
 * Deactivate user (soft delete)
 * Sets user status to inactive and revokes access
 */
export const deactivateUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Verify user exists
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    // Check if user is last owner
    if (user.role_id) {
      const role = await ctx.db.get(user.role_id);
      if (role?.name === "COMPANY_OWNER") {
        // Count active owners in company
        const users = await ctx.db
          .query("users")
          .withIndex("by_company", (q) => q.eq("company_id", user.company_id))
          .filter((q) => q.eq(q.field("status"), "active"))
          .collect();

        const activeOwners = await Promise.all(
          users.map(async (u) => {
            const r = u.role_id ? await ctx.db.get(u.role_id) : null;
            return r?.name === "COMPANY_OWNER" ? u : null;
          })
        );

        const ownerCount = activeOwners.filter((o) => o !== null).length;

        if (ownerCount <= 1) {
          throw new Error("No puedes desactivar el último propietario activo");
        }
      }
    }

    // Deactivate user
    await ctx.db.patch(args.userId, {
      status: "inactive",
      updated_at: now,
    });

    // Invalidate all active sessions
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("user_id", args.userId))
      .filter((q) => q.eq(q.field("is_active"), true))
      .collect();

    for (const session of sessions) {
      await ctx.db.patch(session._id, {
        is_active: false,
        revoked_at: now,
      });
    }

    return {
      success: true,
      message: "Usuario desactivado exitosamente",
    };
  },
});

/**
 * Get user by ID with full details
 * Helper function for user management
 */
export const getUserById = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return null;
    }

    const role = user.role_id ? await ctx.db.get(user.role_id) : null;
    const company = user.company_id ? await ctx.db.get(user.company_id) : null;

    return {
      id: user._id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      emailVerified: user.email_verified,
      roleId: user.role_id,
      roleName: role?.display_name_es || "Sin rol",
      companyId: user.company_id,
      companyName: company?.name || null,
      accessibleFacilityIds: user.accessible_facility_ids,
      locale: user.locale,
      timezone: user.timezone,
      status: user.status,
      lastLogin: user.last_login,
      createdAt: user.created_at,
    };
  },
});

// ============================================================================
// PHASE 2: ACCOUNT SETTINGS (MODULE 21)
// ============================================================================

/**
 * Get account settings for a user
 * Phase 2 Module 21
 */
export const getSettings = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Return user preference settings
    return {
      userId: user._id,
      preferredLanguage: user.locale || "es",
      dateFormat: user.date_format || "DD/MM/YYYY",
      timeFormat: user.time_format || "24h",
      emailNotifications: user.email_notifications ?? true,
      smsNotifications: user.sms_notifications ?? false,
      theme: user.theme || "light",
    };
  },
});

/**
 * Update account settings for a user
 * Phase 2 Module 21
 */
export const updateSettings = mutation({
  args: {
    userId: v.id("users"),
    preferredLanguage: v.optional(v.string()),
    dateFormat: v.optional(v.string()),
    timeFormat: v.optional(v.string()),
    emailNotifications: v.optional(v.boolean()),
    smsNotifications: v.optional(v.boolean()),
    theme: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Verify user exists
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const updates: any = {
      updated_at: now,
    };

    // Only update provided fields with validation
    if (args.preferredLanguage !== undefined) {
      const validLanguages = ["es", "en"];
      if (!validLanguages.includes(args.preferredLanguage)) {
        throw new Error("Invalid language code. Use 'es' or 'en'");
      }
      updates.locale = args.preferredLanguage;
    }

    if (args.dateFormat !== undefined) {
      const validFormats = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];
      if (!validFormats.includes(args.dateFormat)) {
        throw new Error("Invalid date format. Use DD/MM/YYYY, MM/DD/YYYY, or YYYY-MM-DD");
      }
      updates.date_format = args.dateFormat;
    }

    if (args.timeFormat !== undefined) {
      const validFormats = ["12h", "24h"];
      if (!validFormats.includes(args.timeFormat)) {
        throw new Error("Invalid time format. Use '12h' or '24h'");
      }
      updates.time_format = args.timeFormat;
    }

    if (args.emailNotifications !== undefined) {
      updates.email_notifications = args.emailNotifications;
    }

    if (args.smsNotifications !== undefined) {
      updates.sms_notifications = args.smsNotifications;
    }

    if (args.theme !== undefined) {
      const validThemes = ["light", "dark"];
      if (!validThemes.includes(args.theme)) {
        throw new Error("Invalid theme. Use 'light' or 'dark'");
      }
      updates.theme = args.theme;
    }

    await ctx.db.patch(args.userId, updates);

    return {
      success: true,
      message: "Account settings updated successfully",
    };
  },
});
