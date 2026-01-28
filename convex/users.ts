/**
 * Module 4: User Role Assignment and Management
 * User management functions for Phase 1
 */

import { v, ConvexError } from "convex/values";
import { mutation, query, action, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

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
 * Update user preferences (specific validation for preference fields)
 * Phase 2 Module 21 - Account Settings
 */
export const updatePreferences = mutation({
  args: {
    userId: v.id("users"),
    locale: v.optional(v.string()),
    theme: v.optional(v.string()),
    date_format: v.optional(v.string()),
    time_format: v.optional(v.string()),
    timezone: v.optional(v.string()),
    default_facility_id: v.optional(v.id("facilities")),
  },
  handler: async (ctx, args) => {
    // Auth guard: verify authenticated user is updating their own preferences
    const authenticatedUserId = await getAuthUserId(ctx);
    if (!authenticatedUserId) {
      throw new ConvexError("Not authenticated");
    }

    if (authenticatedUserId !== args.userId) {
      throw new ConvexError("You can only update your own preferences");
    }

    const now = Date.now();

    // Verify user exists
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError("User not found");
    }

    const updates: any = {
      updated_at: now,
    };

    // Validate and update locale
    if (args.locale !== undefined) {
      const validLocales = ["es", "en"];
      if (!validLocales.includes(args.locale)) {
        throw new ConvexError("Invalid locale. Must be 'es' or 'en'");
      }
      updates.locale = args.locale;
    }

    // Validate and update theme
    if (args.theme !== undefined) {
      const validThemes = ["light", "dark", "system"];
      if (!validThemes.includes(args.theme)) {
        throw new ConvexError("Invalid theme. Must be 'light', 'dark', or 'system'");
      }
      updates.theme = args.theme;
    }

    // Validate and update date_format
    if (args.date_format !== undefined) {
      const validFormats = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];
      if (!validFormats.includes(args.date_format)) {
        throw new ConvexError("Invalid date format. Must be 'DD/MM/YYYY', 'MM/DD/YYYY', or 'YYYY-MM-DD'");
      }
      updates.date_format = args.date_format;
    }

    // Validate and update time_format
    if (args.time_format !== undefined) {
      const validFormats = ["12h", "24h"];
      if (!validFormats.includes(args.time_format)) {
        throw new ConvexError("Invalid time format. Must be '12h' or '24h'");
      }
      updates.time_format = args.time_format;
    }

    // Update timezone (no strict validation as there are many valid timezones)
    if (args.timezone !== undefined) {
      updates.timezone = args.timezone;
    }

    // Validate and update default_facility_id
    if (args.default_facility_id !== undefined) {
      // Verify facility exists
      const facility = await ctx.db.get(args.default_facility_id);
      if (!facility) {
        throw new ConvexError("Facility not found");
      }

      // Verify facility belongs to user's company
      if (facility.company_id !== user.company_id) {
        throw new ConvexError("Facility does not belong to your company");
      }

      // Verify user has access to this facility
      const hasAccess = user.accessible_facility_ids?.includes(args.default_facility_id);
      if (!hasAccess) {
        throw new ConvexError("You do not have access to this facility");
      }

      updates.primary_facility_id = args.default_facility_id;
    }

    // Apply updates
    await ctx.db.patch(args.userId, updates);

    return {
      success: true,
      message: "Preferences updated successfully",
    };
  },
});

/**
 * Update notification settings for a user
 * Phase 2 Module 21 - Account Settings
 * Specific validations for notification preferences
 */
export const updateNotificationSettings = mutation({
  args: {
    userId: v.id("users"),
    email_notifications: v.optional(v.boolean()),
    sms_notifications: v.optional(v.boolean()),
    notification_types: v.optional(v.any()),
    notification_delivery: v.optional(v.any()),
    quiet_hours_enabled: v.optional(v.boolean()),
    quiet_hours_start: v.optional(v.string()),
    quiet_hours_end: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Auth guard: verify authenticated user is updating their own settings
    const authenticatedUserId = await getAuthUserId(ctx);
    if (!authenticatedUserId) {
      throw new ConvexError("Not authenticated");
    }

    if (authenticatedUserId !== args.userId) {
      throw new ConvexError("You can only update your own notification settings");
    }

    const now = Date.now();

    // Verify user exists
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError("User not found");
    }

    const updates: any = {
      updated_at: now,
    };

    // Update notification toggles
    if (args.email_notifications !== undefined) {
      updates.email_notifications = args.email_notifications;
    }

    if (args.sms_notifications !== undefined) {
      updates.sms_notifications = args.sms_notifications;
    }

    if (args.notification_types !== undefined) {
      updates.notification_types = args.notification_types;
    }

    if (args.notification_delivery !== undefined) {
      updates.notification_delivery = args.notification_delivery;
    }

    if (args.quiet_hours_enabled !== undefined) {
      updates.quiet_hours_enabled = args.quiet_hours_enabled;
    }

    // Validate and update quiet hours
    if (args.quiet_hours_start !== undefined) {
      // Validate HH:MM format
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (!timeRegex.test(args.quiet_hours_start)) {
        throw new ConvexError("Invalid quiet_hours_start format. Must be HH:MM (e.g., 22:00)");
      }
      updates.quiet_hours_start = args.quiet_hours_start;
    }

    if (args.quiet_hours_end !== undefined) {
      // Validate HH:MM format
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (!timeRegex.test(args.quiet_hours_end)) {
        throw new ConvexError("Invalid quiet_hours_end format. Must be HH:MM (e.g., 08:00)");
      }
      updates.quiet_hours_end = args.quiet_hours_end;
    }

    // Validate that quiet_hours_end is after quiet_hours_start (if both provided)
    const startTime = args.quiet_hours_start ?? user.quiet_hours_start;
    const endTime = args.quiet_hours_end ?? user.quiet_hours_end;

    if (startTime && endTime) {
      // Convert to minutes for comparison
      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      // Allow wrap-around (e.g., 22:00 to 08:00 next day)
      // Only error if they're the same time
      if (startMinutes === endMinutes) {
        throw new ConvexError("Quiet hours start and end times cannot be the same");
      }
    }

    // Apply updates
    await ctx.db.patch(args.userId, updates);

    return {
      success: true,
      message: "Notification settings updated successfully",
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
    // Auth guard: verify authenticated user is updating their own profile
    const authenticatedUserId = await getAuthUserId(ctx);
    if (!authenticatedUserId) {
      throw new ConvexError("No autenticado");
    }

    if (authenticatedUserId !== args.userId) {
      throw new ConvexError("Solo puedes actualizar tu propio perfil");
    }

    const now = Date.now();

    // Verify user exists
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError("Usuario no encontrado");
    }

    // ============================================================================
    // VALIDATIONS - Execute before any updates
    // ============================================================================

    // Validate first_name
    if (args.first_name !== undefined) {
      if (args.first_name.trim().length < 2) {
        throw new ConvexError("El nombre debe tener al menos 2 caracteres");
      }
    }

    // Validate last_name
    if (args.last_name !== undefined) {
      if (args.last_name.trim().length < 2) {
        throw new ConvexError("El apellido debe tener al menos 2 caracteres");
      }
    }

    // Validate theme
    if (args.theme !== undefined) {
      const validThemes = ["light", "dark", "system"];
      if (!validThemes.includes(args.theme)) {
        throw new ConvexError("El tema debe ser 'light', 'dark' o 'system'");
      }
    }

    // Validate date_format
    if (args.date_format !== undefined) {
      const validFormats = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];
      if (!validFormats.includes(args.date_format)) {
        throw new ConvexError("El formato de fecha debe ser 'DD/MM/YYYY', 'MM/DD/YYYY' o 'YYYY-MM-DD'");
      }
    }

    // Validate time_format
    if (args.time_format !== undefined) {
      const validFormats = ["12h", "24h"];
      if (!validFormats.includes(args.time_format)) {
        throw new ConvexError("El formato de hora debe ser '12h' o '24h'");
      }
    }

    // Validate locale
    if (args.locale !== undefined) {
      const validLocales = ["es", "en"];
      if (!validLocales.includes(args.locale)) {
        throw new ConvexError("El idioma debe ser 'es' o 'en'");
      }
    }

    // Validate quiet_hours_start
    if (args.quiet_hours_start !== undefined) {
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (!timeRegex.test(args.quiet_hours_start)) {
        throw new ConvexError("El formato de hora de inicio debe ser HH:MM (ej: 22:00)");
      }
    }

    // Validate quiet_hours_end
    if (args.quiet_hours_end !== undefined) {
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (!timeRegex.test(args.quiet_hours_end)) {
        throw new ConvexError("El formato de hora de fin debe ser HH:MM (ej: 08:00)");
      }
    }

    // Validate that quiet_hours_end is not the same as quiet_hours_start
    const startTime = args.quiet_hours_start ?? user.quiet_hours_start;
    const endTime = args.quiet_hours_end ?? user.quiet_hours_end;

    if (startTime && endTime) {
      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (startMinutes === endMinutes) {
        throw new ConvexError("La hora de inicio y fin del modo silencioso no pueden ser iguales");
      }
    }

    // ============================================================================
    // BUILD UPDATES OBJECT
    // ============================================================================

    const updates: any = {
      updated_at: now,
    };

    // Update fields if provided (after validation)
    if (args.first_name !== undefined) updates.first_name = args.first_name.trim();
    if (args.last_name !== undefined) updates.last_name = args.last_name.trim();
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
      message: "Perfil actualizado exitosamente",
    };
  },
});

/**
 * Change user password
 * Phase 2 Module 21 - Security Settings
 *
 * IMPLEMENTATION NOTE:
 * Convex Auth's Password provider uses Scrypt (from the Lucia auth library) for password
 * hashing and stores credentials in the authAccounts table. Since Convex Auth doesn't
 * expose a public API for password verification or updates, this implementation uses an
 * internal mutation to access the authAccounts table directly.
 *
 * Security considerations:
 * - Current password is verified using Scrypt.verify from Lucia (same as Convex Auth)
 * - New password is validated against requirements (min 8 chars, uppercase, lowercase, number, special char)
 * - New password is hashed using Scrypt before storage
 * - Uses internal mutations to prevent unauthorized access
 */
export const changePassword = action({
  args: {
    userId: v.id("users"),
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Validate that new password is different from current
    if (args.currentPassword === args.newPassword) {
      throw new ConvexError("La nueva contraseña debe ser diferente a la actual");
    }

    // 2. Validate new password requirements
    validatePasswordRequirements(args.newPassword);

    // 3. Verify current password and update to new password
    // This is done in a single internal mutation for security
    const result = await ctx.runMutation(
      internal.users.verifyAndUpdatePassword,
      {
        userId: args.userId,
        currentPassword: args.currentPassword,
        newPassword: args.newPassword,
      }
    );

    if (!result.success) {
      throw new ConvexError(result.error || "Error al cambiar la contraseña");
    }

    return {
      success: true,
      message: "Contraseña actualizada exitosamente",
    };
  },
});

/**
 * Validate password requirements (matches validation in auth.ts)
 */
function validatePasswordRequirements(password: string): void {
  if (password.length < 8) {
    throw new ConvexError("La contraseña debe tener al menos 8 caracteres");
  }
  if (!/[A-Z]/.test(password)) {
    throw new ConvexError("La contraseña debe incluir al menos una mayúscula");
  }
  if (!/[a-z]/.test(password)) {
    throw new ConvexError("La contraseña debe incluir al menos una minúscula");
  }
  if (!/[0-9]/.test(password)) {
    throw new ConvexError("La contraseña debe incluir al menos un número");
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    throw new ConvexError("La contraseña debe incluir al menos un carácter especial");
  }
}

/**
 * Internal mutation to verify current password and update to new password
 *
 * This implementation uses Scrypt from Lucia, which is the same library
 * that Convex Auth's Password provider uses internally.
 *
 * @returns { success: boolean, error?: string }
 */
export const verifyAndUpdatePassword = internalMutation({
  args: {
    userId: v.id("users"),
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: boolean; error?: string }> => {
    // 1. Verify user exists
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return {
        success: false,
        error: "Usuario no encontrado",
      };
    }

    // 2. Get the user's auth account
    const authAccounts = await ctx.db
      .query("authAccounts")
      .withIndex("userIdAndProvider", (q) =>
        q.eq("userId", args.userId).eq("provider", "password")
      )
      .collect();

    if (authAccounts.length === 0) {
      return {
        success: false,
        error: "Cuenta de autenticación no encontrada",
      };
    }

    const authAccount = authAccounts[0];
    const storedHash = authAccount.secret as string | undefined;

    if (!storedHash) {
      return {
        success: false,
        error: "Contraseña no configurada para esta cuenta",
      };
    }

    // Verify current password using the same method as Convex Auth
    // Convex Auth uses Scrypt from Lucia for password hashing
    try {
      const isValid = await verifyPassword(args.currentPassword, storedHash);

      if (!isValid) {
        return {
          success: false,
          error: "La contraseña actual es incorrecta",
        };
      }

      // Hash the new password
      const newPasswordHash = await hashPassword(args.newPassword);

      // Update the auth account with new password hash
      await ctx.db.patch(authAccount._id, {
        secret: newPasswordHash,
      });

      return { success: true };
    } catch (error) {
      console.error("Error changing password:", error);
      return {
        success: false,
        error: "Error al procesar la contraseña",
      };
    }
  },
});

/**
 * Hash password using Scrypt from Lucia (same as Convex Auth Password provider)
 * Convex Auth uses the Scrypt implementation from the Lucia auth library
 */
async function hashPassword(password: string): Promise<string> {
  const { Scrypt } = await import("lucia");

  const scrypt = new Scrypt();
  const hash = await scrypt.hash(password);

  return hash;
}

/**
 * Verify password against Scrypt hash using Lucia
 */
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    const { Scrypt } = await import("lucia");

    const scrypt = new Scrypt();
    return await scrypt.verify(hash, password);
  } catch (error) {
    console.error("Error verifying password:", error);
    return false;
  }
}
