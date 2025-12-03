/**
 * User Invitations Module
 * Handles invitation flow for adding team members to companies
 * Invitations expire after 72 hours
 */

import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";
import {
  hashPassword,
  validateEmail,
  validatePassword,
  formatColombianPhone,
  generateSessionToken,
  getSessionExpiration,
} from "./auth";

// ============================================================================
// INVITATION VALIDATION & ACCEPTANCE
// ============================================================================

/**
 * Validate invitation token
 * Returns invitation details if valid
 */
export const validate = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Find invitation by token
    const invitation = await ctx.db
      .query("invitations")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!invitation) {
      return {
        valid: false,
        error: "Invitación no encontrada",
      };
    }

    // Check if already accepted or rejected
    if (invitation.status === "accepted") {
      return {
        valid: false,
        error: "Esta invitación ya ha sido aceptada",
      };
    }

    if (invitation.status === "rejected") {
      return {
        valid: false,
        error: "Esta invitación ha sido rechazada",
      };
    }

    // Check if expired
    if (invitation.expires_at < now) {
      // Note: Status update to 'expired' should be done via a separate mutation
      // For now, just return the error - the accept action will also check expiration
      return {
        valid: false,
        error: "Esta invitación ha expirado (válida por 72 horas)",
      };
    }

    // Get company details
    const company = await ctx.db.get(invitation.company_id);
    if (!company) {
      return {
        valid: false,
        error: "Empresa no encontrada",
      };
    }

    // Get role details
    const role = await ctx.db.get(invitation.role_id);
    if (!role) {
      return {
        valid: false,
        error: "Rol no encontrado",
      };
    }

    // Get inviter details
    const inviter = await ctx.db.get(invitation.invited_by);
    const inviterName = inviter
      ? `${inviter.first_name || ""} ${inviter.last_name || ""}`.trim()
      : "Un miembro del equipo";

    // Get facility names
    const facilities = await Promise.all(
      invitation.facility_ids.map((id) => ctx.db.get(id))
    );
    const facilityNames = facilities
      .filter((f) => f !== null)
      .map((f) => f!.name);

    // Calculate expiration details
    const expiresInHours = Math.floor((invitation.expires_at - now) / (1000 * 60 * 60));

    return {
      valid: true,
      invitation: {
        email: invitation.email,
        companyName: company.name,
        roleName: role.display_name_es,
        inviterName,
        facilities: facilityNames,
        expiresAt: invitation.expires_at,
        expiresInHours,
        createdAt: invitation.created_at,
      },
    };
  },
});

/**
 * Accept invitation and create user account
 * This is an action because it creates user and sends email
 */
export const accept = action({
  args: {
    token: v.string(),
    password: v.string(),
    phone: v.optional(v.string()),
    language: v.optional(v.string()), // "es" | "en"
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    sessionToken: string;
    userId: string;
    companyId: string;
    user: { email: string; roleId: string; locale: string };
    invitation: any;
  }> => {
    // 1. Validate invitation using the query
    const validationResult: any = await ctx.runQuery(api.invitations.validate, {
      token: args.token,
    });

    if (!validationResult.valid) {
      throw new Error(validationResult.error || "Invitación inválida");
    }

    // 2. Get invitation record (need to do this in mutation)
    const invitationData: any = await ctx.runMutation(
      api.invitations.getInvitationByToken,
      {
        token: args.token,
      }
    );

    if (!invitationData) {
      throw new Error("Invitación no encontrada");
    }

    // 3. Validate password
    const passwordError = validatePassword(args.password);
    if (passwordError) {
      throw new Error(passwordError);
    }

    // 4. Check if user already exists
    const existingUser = await ctx.runQuery(
      api.registration.getUserByEmail,
      {
        email: invitationData.email,
      }
    );

    if (existingUser) {
      throw new Error(
        "Ya existe una cuenta con este correo electrónico. Por favor inicia sesión."
      );
    }

    // 5. Hash password
    const passwordHash = await hashPassword(args.password);

    // 6. Create user account
    const userResult: any = await ctx.runMutation(
      api.invitations.createUserFromInvitation,
      {
        email: invitationData.email,
        passwordHash,
        phone: args.phone ? formatColombianPhone(args.phone) : undefined,
        language: args.language || "es",
        companyId: invitationData.company_id,
        roleId: invitationData.role_id,
        facilityIds: invitationData.facility_ids,
      }
    );

    // 7. Update invitation status
    await ctx.runMutation(api.invitations.markInvitationAccepted, {
      token: args.token,
    });

    return {
      success: true,
      sessionToken: userResult.sessionToken,
      userId: userResult.userId,
      companyId: invitationData.company_id,
      user: {
        email: invitationData.email,
        roleId: invitationData.role_id,
        locale: args.language || "es",
      },
      invitation: validationResult.invitation,
    };
  },
});

/**
 * Reject invitation
 */
export const reject = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Find invitation
    const invitation = await ctx.db
      .query("invitations")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!invitation) {
      throw new Error("Invitación no encontrada");
    }

    // Check if already accepted
    if (invitation.status === "accepted") {
      throw new Error("Esta invitación ya ha sido aceptada");
    }

    // Check if already rejected
    if (invitation.status === "rejected") {
      return {
        success: true,
        message: "Invitación ya rechazada anteriormente",
      };
    }

    // Update status to rejected
    await ctx.db.patch(invitation._id, {
      status: "rejected",
      rejected_at: now,
    });

    return {
      success: true,
      message: "Invitación rechazada exitosamente",
    };
  },
});

// ============================================================================
// HELPER MUTATIONS (Called from action)
// ============================================================================

/**
 * Get invitation by token
 * Helper for the accept action
 */
export const getInvitationByToken = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const invitation = await ctx.db
      .query("invitations")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!invitation) {
      return null;
    }

    return {
      email: invitation.email,
      company_id: invitation.company_id,
      role_id: invitation.role_id,
      facility_ids: invitation.facility_ids,
      invited_by: invitation.invited_by,
    };
  },
});

/**
 * Create user account from invitation
 * Helper mutation for accept action
 */
export const createUserFromInvitation = mutation({
  args: {
    email: v.string(),
    passwordHash: v.string(),
    phone: v.optional(v.string()),
    language: v.string(),
    companyId: v.id("companies"),
    roleId: v.id("roles"),
    facilityIds: v.array(v.id("facilities")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Get company to inherit timezone
    const company = await ctx.db.get(args.companyId);
    if (!company) {
      throw new Error("Empresa no encontrada");
    }

    // Create user with email already verified (they clicked the invitation link)
    const userId = await ctx.db.insert("users", {
      company_id: args.companyId,
      email: args.email.toLowerCase(),
      password_hash: args.passwordHash,
      email_verified: true, // Auto-verified via invitation link
      email_verified_at: now,

      // No verification token needed
      email_verification_token: undefined,
      token_expires_at: undefined,

      // Personal info will be completed later
      first_name: undefined,
      last_name: undefined,
      phone: args.phone,

      // Role and access
      role_id: args.roleId,
      additional_role_ids: [],
      primary_facility_id: args.facilityIds[0], // First facility as primary
      accessible_facility_ids: args.facilityIds,
      accessible_area_ids: [],

      // Preferences
      locale: args.language as "es" | "en",
      timezone: company.default_timezone || "America/Bogota",
      preferred_language: args.language,

      // Security
      mfa_enabled: false,
      failed_login_attempts: 0,

      status: "active",
      created_at: now,
      updated_at: now,
    });

    // Generate session token (30-day validity)
    const sessionToken = generateSessionToken();
    const sessionExpiration = getSessionExpiration(30);

    await ctx.db.insert("sessions", {
      user_id: userId,
      token: sessionToken,
      expires_at: sessionExpiration,
      is_active: true,
      created_at: now,
    });

    return {
      userId,
      sessionToken,
    };
  },
});

/**
 * Mark invitation as accepted
 * Helper mutation for accept action
 */
export const markInvitationAccepted = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const invitation = await ctx.db
      .query("invitations")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!invitation) {
      throw new Error("Invitación no encontrada");
    }

    await ctx.db.patch(invitation._id, {
      status: "accepted",
      accepted_at: now,
    });
  },
});

// ============================================================================
// INVITATION CREATION (Phase 2)
// ============================================================================

/**
 * Create invitation for a new team member
 * Phase 2: Will be called by company owners to invite users
 */
export const create = mutation({
  args: {
    email: v.string(),
    roleId: v.id("roles"),
    facilityIds: v.array(v.id("facilities")),
    invitedBy: v.id("users"), // Current user creating the invitation
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // 1. Validate email
    if (!validateEmail(args.email)) {
      throw new Error("Formato de correo electrónico inválido");
    }

    // 2. Get inviter to get company
    const inviter = await ctx.db.get(args.invitedBy);
    if (!inviter || !inviter.company_id) {
      throw new Error("Usuario invitador no encontrado o sin empresa");
    }

    // 3. Check if email already exists in the company
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (existingUser && existingUser.company_id === inviter.company_id) {
      throw new Error("Este usuario ya está en tu empresa");
    }

    // 4. Check for pending invitations
    const pendingInvitation = await ctx.db
      .query("invitations")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .filter((q) =>
        q.and(
          q.eq(q.field("company_id"), inviter.company_id),
          q.eq(q.field("status"), "pending")
        )
      )
      .first();

    if (pendingInvitation) {
      throw new Error("Ya existe una invitación pendiente para este correo");
    }

    // 5. Verify role exists
    const role = await ctx.db.get(args.roleId);
    if (!role) {
      throw new Error("Rol no encontrado");
    }

    // 6. Verify all facilities exist and belong to company
    for (const facilityId of args.facilityIds) {
      const facility = await ctx.db.get(facilityId);
      if (!facility) {
        throw new Error(`Instalación ${facilityId} no encontrada`);
      }
      if (facility.company_id !== inviter.company_id) {
        throw new Error("Todas las instalaciones deben pertenecer a tu empresa");
      }
    }

    // 7. Generate unique invitation token
    const token = crypto.randomUUID();

    // 8. Set expiration to 72 hours
    const expiresAt = now + 72 * 60 * 60 * 1000; // 72 hours

    // 9. Create invitation record
    const invitationId = await ctx.db.insert("invitations", {
      company_id: inviter.company_id,
      email: args.email.toLowerCase(),
      role_id: args.roleId,
      facility_ids: args.facilityIds,
      token,
      expires_at: expiresAt,
      invited_by: args.invitedBy,
      status: "pending",
      created_at: now,
    });

    return {
      success: true,
      invitationId,
      token,
      email: args.email.toLowerCase(),
      expiresAt,
      message: "Invitación creada exitosamente",
    };
  },
});

// ============================================================================
// INVITATION MANAGEMENT QUERIES
// ============================================================================

/**
 * Get all invitations for a company
 * Phase 2: For team management page
 */
export const getByCompany = query({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    const invitations = await ctx.db
      .query("invitations")
      .withIndex("by_company", (q) => q.eq("company_id", args.companyId))
      .collect();

    // Get additional details for each invitation
    const invitationsWithDetails = await Promise.all(
      invitations.map(async (inv) => {
        const role = await ctx.db.get(inv.role_id);
        const inviter = await ctx.db.get(inv.invited_by);
        const facilities = await Promise.all(
          inv.facility_ids.map((id) => ctx.db.get(id))
        );

        return {
          id: inv._id,
          email: inv.email,
          roleName: role?.display_name_es || "Desconocido",
          facilityNames: facilities.filter((f) => f !== null).map((f) => f!.name),
          inviterName: inviter
            ? `${inviter.first_name || ""} ${inviter.last_name || ""}`.trim()
            : "Desconocido",
          status: inv.status,
          createdAt: inv.created_at,
          expiresAt: inv.expires_at,
          acceptedAt: inv.accepted_at,
          rejectedAt: inv.rejected_at,
        };
      })
    );

    return invitationsWithDetails;
  },
});

/**
 * Get pending invitations for a company
 * Phase 2: For showing active invitations
 */
export const getPendingByCompany = query({
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
        const facilities = await Promise.all(
          inv.facility_ids.map((id) => ctx.db.get(id))
        );

        return {
          id: inv._id,
          email: inv.email,
          roleName: role?.display_name_es || "Desconocido",
          facilityNames: facilities.filter((f) => f !== null).map((f) => f!.name),
          expiresAt: inv.expires_at,
          createdAt: inv.created_at,
        };
      })
    );

    return invitationsWithDetails;
  },
});

/**
 * Resend invitation email
 * Phase 2 Module 18
 */
export const resend = mutation({
  args: {
    invitationId: v.id("invitations"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const invitation = await ctx.db.get(args.invitationId);

    if (!invitation) {
      throw new Error("Invitación no encontrada");
    }

    if (invitation.status !== "pending") {
      throw new Error("Solo se pueden reenviar invitaciones pendientes");
    }

    // Check if already expired
    if (invitation.expires_at < now) {
      throw new Error("Esta invitación ha expirado. Por favor crea una nueva.");
    }

    // Get company, role, and facilities for email
    const company = await ctx.db.get(invitation.company_id);
    const role = await ctx.db.get(invitation.role_id);
    const facilities = await Promise.all(
      invitation.facility_ids.map((id) => ctx.db.get(id))
    );
    const inviter = await ctx.db.get(invitation.invited_by);

    if (!company || !role) {
      throw new Error("Datos de invitación incompletos");
    }

    const facilityNames = facilities.filter((f) => f !== null).map((f) => f!.name);
    const inviterName = inviter
      ? `${inviter.first_name || ""} ${inviter.last_name || ""}`.trim()
      : "Un miembro del equipo";

    return {
      success: true,
      invitationId: args.invitationId,
      token: invitation.token,
      email: invitation.email,
      companyName: company.name,
      roleName: role.display_name_es,
      inviterName,
      facilities: facilityNames,
      expiresAt: invitation.expires_at,
      message: "Invitación reenviada exitosamente",
    };
  },
});

/**
 * Cancel/revoke an invitation
 * Phase 2: Allow company owners to cancel pending invitations
 */
export const cancel = mutation({
  args: {
    invitationId: v.id("invitations"),
  },
  handler: async (ctx, args) => {
    const invitation = await ctx.db.get(args.invitationId);

    if (!invitation) {
      throw new Error("Invitación no encontrada");
    }

    if (invitation.status !== "pending") {
      throw new Error("Solo se pueden cancelar invitaciones pendientes");
    }

    await ctx.db.patch(args.invitationId, {
      status: "rejected",
      rejected_at: Date.now(),
    });

    return {
      success: true,
      message: "Invitación cancelada exitosamente",
    };
  },
});
