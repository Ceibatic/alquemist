/**
 * Module 4: User Role Assignment and Management
 * User management functions for Phase 1
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// ============================================================================
// CONVEX AUTH: CURRENT USER QUERIES
// ============================================================================

/**
 * Get the current authenticated user
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    const role = user.role_id ? await ctx.db.get(user.role_id) : null;
    const company = user.company_id ? await ctx.db.get(user.company_id) : null;

    return {
      userId: user._id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      companyId: user.company_id,
      roleId: user.role_id,
      roleName: role?.display_name_es || role?.name,
      companyName: company?.name,
      primaryFacilityId: user.primary_facility_id,
      onboardingCompleted: user.onboarding_completed ?? false,
      locale: user.locale,
      timezone: user.timezone,
      status: user.status,
    };
  },
});

/**
 * Get onboarding status for the current user
 */
export const getOnboardingStatus = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    return {
      hasCompany: !!user.company_id,
      onboardingCompleted: user.onboarding_completed ?? false,
      userId: user._id,
      email: user.email,
    };
  },
});

/**
 * Mark onboarding as completed for the current user
 */
export const completeOnboarding = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");

    await ctx.db.patch(userId, {
      onboarding_completed: true,
      updated_at: Date.now(),
    });

    return { success: true };
  },
});

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
      _id: user._id,
      id: user._id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      identification_type: user.identification_type,
      identification_number: user.identification_number,
      emailVerified: user.email_verified,
      roleId: user.role_id,
      roleName: role?.display_name_es || "Sin rol",
      companyId: user.company_id,
      company_id: user.company_id,
      companyName: company?.name || null,
      primary_facility_id: user.primary_facility_id,
      accessibleFacilityIds: user.accessible_facility_ids,
      locale: user.locale,
      timezone: user.timezone,
      date_format: user.date_format,
      time_format: user.time_format,
      theme: user.theme,
      email_notifications: user.email_notifications,
      sms_notifications: user.sms_notifications,
      notification_types: user.notification_types,
      notification_delivery: user.notification_delivery,
      quiet_hours_enabled: user.quiet_hours_enabled,
      quiet_hours_start: user.quiet_hours_start,
      quiet_hours_end: user.quiet_hours_end,
      status: user.status,
      lastLogin: user.last_login,
      createdAt: user.created_at,
    };
  },
});

// ============================================================================
// PHASE 2: USER INVITATION MANAGEMENT (MODULE 18)
// ============================================================================

/**
 * List users and pending invitations by company
 * Phase 2 Module 18
 */
export const listByCompany = query({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    // Get all active users
    const users = await ctx.db
      .query("users")
      .withIndex("by_company", (q) => q.eq("company_id", args.companyId))
      .collect();

    // Get user details with roles
    const usersWithRoles = await Promise.all(
      users.map(async (user) => {
        const role = user.role_id ? await ctx.db.get(user.role_id) : null;

        return {
          id: user._id,
          type: "user" as const,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          roleId: user.role_id,
          roleName: role?.display_name_es || "Sin rol",
          status: user.status,
          lastLogin: user.last_login,
          createdAt: user.created_at,
        };
      })
    );

    return usersWithRoles;
  },
});

/**
 * Get pending invitations for a company
 * Phase 2 Module 18
 */
export const getPendingInvitations = query({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const invitations = await ctx.db
      .query("invitations")
      .withIndex("by_company", (q) => q.eq("company_id", args.companyId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    // Filter out expired ones
    const activeInvitations = invitations.filter(
      (inv) => inv.expires_at > now
    );

    // Get details
    const invitationsWithDetails = await Promise.all(
      activeInvitations.map(async (inv) => {
        const role = await ctx.db.get(inv.role_id);
        const inviter = await ctx.db.get(inv.invited_by);
        const facilities = await Promise.all(
          inv.facility_ids.map((id) => ctx.db.get(id))
        );

        return {
          id: inv._id,
          type: "invitation" as const,
          email: inv.email,
          roleName: role?.display_name_es || "Desconocido",
          facilityNames: facilities.filter((f) => f !== null).map((f) => f!.name),
          inviterName: inviter
            ? `${inviter.first_name || ""} ${inviter.last_name || ""}`.trim()
            : "Desconocido",
          status: inv.status,
          expiresAt: inv.expires_at,
          createdAt: inv.created_at,
        };
      })
    );

    return invitationsWithDetails;
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
 * Set user's current/primary facility
 * Used after facility creation during onboarding
 */
export const setCurrentFacility = mutation({
  args: {
    userId: v.id("users"),
    facilityId: v.id("facilities"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Verify user exists
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    // Verify facility exists
    const facility = await ctx.db.get(args.facilityId);
    if (!facility) {
      throw new Error("Instalación no encontrada");
    }

    // Verify facility belongs to user's company
    if (facility.company_id !== user.company_id) {
      throw new Error("La instalación no pertenece a la empresa del usuario");
    }

    // Update user's primary facility and accessible facilities
    const accessibleFacilities = user.accessible_facility_ids || [];
    if (!accessibleFacilities.includes(args.facilityId)) {
      accessibleFacilities.push(args.facilityId);
    }

    await ctx.db.patch(args.userId, {
      primary_facility_id: args.facilityId,
      accessible_facility_ids: accessibleFacilities,
      updated_at: now,
    });

    return {
      success: true,
      userId: args.userId,
      facilityId: args.facilityId,
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

/**
 * Update user profile information
 * Phase 2 Module 21 - Account Settings
 */
export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    first_name: v.optional(v.string()),
    last_name: v.optional(v.string()),
    phone: v.optional(v.string()),
    identification_type: v.optional(v.string()),
    identification_number: v.optional(v.string()),
    locale: v.optional(v.string()),
    timezone: v.optional(v.string()),
    date_format: v.optional(v.string()),
    time_format: v.optional(v.string()),
    theme: v.optional(v.string()),
    email_notifications: v.optional(v.boolean()),
    sms_notifications: v.optional(v.boolean()),
    notification_types: v.optional(v.any()),
    notification_delivery: v.optional(v.any()),
    quiet_hours_enabled: v.optional(v.boolean()),
    quiet_hours_start: v.optional(v.string()),
    quiet_hours_end: v.optional(v.string()),
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

    // Update fields if provided
    if (args.first_name !== undefined) updates.first_name = args.first_name;
    if (args.last_name !== undefined) updates.last_name = args.last_name;
    if (args.phone !== undefined) updates.phone = args.phone;
    if (args.identification_type !== undefined) updates.identification_type = args.identification_type;
    if (args.identification_number !== undefined) updates.identification_number = args.identification_number;
    if (args.locale !== undefined) updates.locale = args.locale;
    if (args.timezone !== undefined) updates.timezone = args.timezone;
    if (args.date_format !== undefined) updates.date_format = args.date_format;
    if (args.time_format !== undefined) updates.time_format = args.time_format;
    if (args.theme !== undefined) updates.theme = args.theme;
    if (args.email_notifications !== undefined) updates.email_notifications = args.email_notifications;
    if (args.sms_notifications !== undefined) updates.sms_notifications = args.sms_notifications;
    if (args.notification_types !== undefined) updates.notification_types = args.notification_types;
    if (args.notification_delivery !== undefined) updates.notification_delivery = args.notification_delivery;
    if (args.quiet_hours_enabled !== undefined) updates.quiet_hours_enabled = args.quiet_hours_enabled;
    if (args.quiet_hours_start !== undefined) updates.quiet_hours_start = args.quiet_hours_start;
    if (args.quiet_hours_end !== undefined) updates.quiet_hours_end = args.quiet_hours_end;

    await ctx.db.patch(args.userId, updates);

    return {
      success: true,
      message: "Profile updated successfully",
    };
  },
});

/**
 * Change user password
 * Phase 2 Module 21 - Security Settings
 */
export const changePassword = mutation({
  args: {
    userId: v.id("users"),
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Verify user exists
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Note: In a real implementation, you would verify the current password
    // against a hashed version stored in the database. For now, we'll just
    // update the password (this is a placeholder for the actual authentication logic)

    // TODO: Implement proper password hashing and verification
    // This should integrate with your authentication provider (Clerk, Auth0, etc.)

    throw new Error("Password change must be handled through the authentication provider");
  },
});
