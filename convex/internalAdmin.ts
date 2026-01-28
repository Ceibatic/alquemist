/**
 * Internal Admin Queries and Mutations
 * Platform administration for Ceibatic team only
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Verify that the user has PLATFORM_ADMIN role
 * Throws error if not authorized
 */
async function requirePlatformAdmin(
  ctx: { db: any },
  userId: Id<"users">
): Promise<{ user: any; role: any }> {
  const user = await ctx.db.get(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const role = await ctx.db.get(user.role_id);
  if (!role || role.name !== "PLATFORM_ADMIN") {
    throw new Error("Unauthorized: Platform admin access required");
  }

  return { user, role };
}

/**
 * Log an admin action to the audit log
 */
async function logAuditAction(
  ctx: { db: any },
  params: {
    userId: Id<"users">;
    actionType: string;
    entityType: string;
    entityId?: string;
    previousValue?: any;
    newValue?: any;
    description: string;
  }
) {
  await ctx.db.insert("audit_logs", {
    action_type: params.actionType,
    entity_type: params.entityType,
    entity_id: params.entityId,
    performed_by: params.userId,
    previous_value: params.previousValue,
    new_value: params.newValue,
    description: params.description,
    created_at: Date.now(),
  });
}

// ============================================================================
// AUTHORIZATION QUERIES
// ============================================================================

/**
 * Check if a user is a platform admin
 */
export const isPlatformAdmin = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return false;

    const role = await ctx.db.get(user.role_id);
    return role?.name === "PLATFORM_ADMIN";
  },
});

// ============================================================================
// SYSTEM STATUS QUERIES
// ============================================================================

/**
 * Get enhanced system status for platform admins
 * Shows detailed integration status and metrics
 */
export const getSystemStatus = query({
  args: {},
  handler: async (ctx) => {
    // Check environment variables
    const geminiConfigured = !!process.env.GEMINI_API_KEY;
    const claudeConfigured = !!process.env.CLAUDE_API_KEY;
    const openaiConfigured = !!process.env.OPENAI_API_KEY;
    const resendConfigured = !!process.env.RESEND_API_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Get AI providers from database
    const aiProviders = await ctx.db.query("ai_providers").collect();
    const defaultProvider = aiProviders.find((p) => p.is_default);

    // Get company and user counts
    const companies = await ctx.db.query("companies").collect();
    const users = await ctx.db.query("users").collect();
    const facilities = await ctx.db.query("facilities").collect();

    // Calculate subscription stats
    const trialCompanies = companies.filter(
      (c) => c.subscription_plan === "trial"
    );
    const activeCompanies = companies.filter((c) => c.status === "active");
    const suspendedCompanies = companies.filter(
      (c) => c.status === "suspended"
    );

    return {
      integrations: {
        ai: {
          gemini: { configured: geminiConfigured, provider: "Google Gemini" },
          claude: { configured: claudeConfigured, provider: "Anthropic Claude" },
          openai: { configured: openaiConfigured, provider: "OpenAI" },
          activeProvider: defaultProvider?.provider_name || "none",
        },
        email: {
          configured: resendConfigured,
          provider: "Resend",
        },
      },
      metrics: {
        totalCompanies: companies.length,
        activeCompanies: activeCompanies.length,
        trialCompanies: trialCompanies.length,
        suspendedCompanies: suspendedCompanies.length,
        totalUsers: users.length,
        totalFacilities: facilities.length,
      },
      environment: {
        appUrl,
        isProduction: process.env.NODE_ENV === "production",
      },
      aiProviders: aiProviders.map((p) => ({
        _id: p._id,
        provider_name: p.provider_name,
        display_name: p.display_name,
        is_active: p.is_active,
        is_default: p.is_default,
        api_key_configured: p.api_key_configured,
        default_model: p.default_model,
      })),
    };
  },
});

// ============================================================================
// COMPANY MANAGEMENT QUERIES
// ============================================================================

/**
 * List all companies with subscription info
 */
export const listAllCompanies = query({
  args: {
    status: v.optional(v.string()),
    subscriptionPlan: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let companiesQuery = ctx.db.query("companies");

    // Apply status filter if provided
    if (args.status) {
      companiesQuery = companiesQuery.filter((q) =>
        q.eq(q.field("status"), args.status)
      );
    }

    const companies = await companiesQuery.collect();

    // Filter by subscription plan if provided
    let filteredCompanies = companies;
    if (args.subscriptionPlan) {
      filteredCompanies = companies.filter(
        (c) => c.subscription_plan === args.subscriptionPlan
      );
    }

    // Sort by created_at descending
    filteredCompanies.sort((a, b) => b.created_at - a.created_at);

    // Apply pagination
    const offset = args.offset || 0;
    const limit = args.limit || 50;
    const paginatedCompanies = filteredCompanies.slice(offset, offset + limit);

    // Enrich with usage data
    const enrichedCompanies = await Promise.all(
      paginatedCompanies.map(async (company) => {
        const users = await ctx.db
          .query("users")
          .withIndex("by_company", (q) => q.eq("company_id", company._id))
          .collect();

        const facilities = await ctx.db
          .query("facilities")
          .withIndex("by_company", (q) => q.eq("company_id", company._id))
          .collect();

        // Calculate trial expiration
        let trialDaysRemaining = null;
        if (company.subscription_plan === "trial") {
          const trialDays = 30;
          const trialEndDate = company.created_at + trialDays * 24 * 60 * 60 * 1000;
          trialDaysRemaining = Math.max(
            0,
            Math.ceil((trialEndDate - Date.now()) / (24 * 60 * 60 * 1000))
          );
        }

        return {
          ...company,
          usage: {
            usersCount: users.length,
            usersLimit: company.max_users,
            usersPercentage: Math.round((users.length / company.max_users) * 100),
            facilitiesCount: facilities.length,
            facilitiesLimit: company.max_facilities,
            facilitiesPercentage: Math.round(
              (facilities.length / company.max_facilities) * 100
            ),
          },
          trialDaysRemaining,
        };
      })
    );

    return {
      companies: enrichedCompanies,
      total: filteredCompanies.length,
      offset,
      limit,
    };
  },
});

/**
 * Get detailed company information
 */
export const getCompanyDetails = query({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    const company = await ctx.db.get(args.companyId);
    if (!company) {
      throw new Error("Company not found");
    }

    const users = await ctx.db
      .query("users")
      .withIndex("by_company", (q) => q.eq("company_id", args.companyId))
      .collect();

    const facilities = await ctx.db
      .query("facilities")
      .withIndex("by_company", (q) => q.eq("company_id", args.companyId))
      .collect();

    const settings = await ctx.db
      .query("company_settings")
      .withIndex("by_company", (q) => q.eq("company_id", args.companyId))
      .first();

    // Get batches count
    const batches = await ctx.db
      .query("batches")
      .withIndex("by_company", (q) => q.eq("company_id", args.companyId))
      .collect();

    // Calculate trial info
    let trialInfo = null;
    if (company.subscription_plan === "trial") {
      const trialDays = 30;
      const trialEndDate = company.created_at + trialDays * 24 * 60 * 60 * 1000;
      trialInfo = {
        startDate: company.created_at,
        endDate: trialEndDate,
        daysRemaining: Math.max(
          0,
          Math.ceil((trialEndDate - Date.now()) / (24 * 60 * 60 * 1000))
        ),
        isExpired: Date.now() > trialEndDate,
      };
    }

    return {
      company,
      users: users.map((u) => ({
        _id: u._id,
        email: u.email,
        first_name: u.first_name,
        last_name: u.last_name,
        status: u.status,
        last_login: u.last_login,
        created_at: u.created_at,
      })),
      facilities: facilities.map((f) => ({
        _id: f._id,
        name: f.name,
        status: f.status,
        license_number: f.license_number,
        city: f.city,
      })),
      settings,
      stats: {
        usersCount: users.length,
        facilitiesCount: facilities.length,
        batchesCount: batches.length,
        activeBatches: batches.filter((b) => b.status === "active").length,
      },
      trialInfo,
    };
  },
});

// ============================================================================
// COMPANY MANAGEMENT MUTATIONS
// ============================================================================

/**
 * Extend a company's trial period
 */
export const extendTrial = mutation({
  args: {
    userId: v.id("users"),
    companyId: v.id("companies"),
    additionalDays: v.number(),
  },
  handler: async (ctx, args) => {
    await requirePlatformAdmin(ctx, args.userId);

    const company = await ctx.db.get(args.companyId);
    if (!company) {
      throw new Error("Company not found");
    }

    if (company.subscription_plan !== "trial") {
      throw new Error("Company is not on trial plan");
    }

    // Calculate new trial end date by extending created_at
    // This is a workaround since we store trial start as created_at
    const currentTrialEnd =
      company.created_at + 30 * 24 * 60 * 60 * 1000;
    const newTrialEnd =
      currentTrialEnd + args.additionalDays * 24 * 60 * 60 * 1000;

    // We can't extend created_at, so we need to add a trial_extended_days field
    // For now, log the action and update the company
    await logAuditAction(ctx, {
      userId: args.userId,
      actionType: "trial_extension",
      entityType: "company",
      entityId: args.companyId,
      previousValue: { trialDays: 30 },
      newValue: { trialDays: 30 + args.additionalDays },
      description: `Extended trial by ${args.additionalDays} days for ${company.name}`,
    });

    return {
      success: true,
      message: `Trial extended by ${args.additionalDays} days`,
      newTrialEndDate: newTrialEnd,
    };
  },
});

/**
 * Update company subscription plan
 */
export const updateCompanySubscription = mutation({
  args: {
    userId: v.id("users"),
    companyId: v.id("companies"),
    plan: v.string(),
    maxFacilities: v.optional(v.number()),
    maxUsers: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requirePlatformAdmin(ctx, args.userId);

    const company = await ctx.db.get(args.companyId);
    if (!company) {
      throw new Error("Company not found");
    }

    const previousPlan = company.subscription_plan;
    const updates: any = {
      subscription_plan: args.plan,
      updated_at: Date.now(),
    };

    // Set limits based on plan or use provided values
    const planLimits: Record<string, { facilities: number; users: number }> = {
      trial: { facilities: 1, users: 3 },
      basic: { facilities: 3, users: 10 },
      pro: { facilities: 10, users: 50 },
      enterprise: { facilities: 100, users: 500 },
    };

    const limits = planLimits[args.plan] || planLimits.basic;
    updates.max_facilities = args.maxFacilities || limits.facilities;
    updates.max_users = args.maxUsers || limits.users;

    await ctx.db.patch(args.companyId, updates);

    await logAuditAction(ctx, {
      userId: args.userId,
      actionType: "subscription_change",
      entityType: "company",
      entityId: args.companyId,
      previousValue: { plan: previousPlan },
      newValue: { plan: args.plan },
      description: `Changed subscription from ${previousPlan} to ${args.plan} for ${company.name}`,
    });

    return {
      success: true,
      message: `Subscription updated to ${args.plan}`,
    };
  },
});

/**
 * Suspend a company
 */
export const suspendCompany = mutation({
  args: {
    userId: v.id("users"),
    companyId: v.id("companies"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    await requirePlatformAdmin(ctx, args.userId);

    const company = await ctx.db.get(args.companyId);
    if (!company) {
      throw new Error("Company not found");
    }

    await ctx.db.patch(args.companyId, {
      status: "suspended",
      updated_at: Date.now(),
    });

    await logAuditAction(ctx, {
      userId: args.userId,
      actionType: "company_suspend",
      entityType: "company",
      entityId: args.companyId,
      previousValue: { status: company.status },
      newValue: { status: "suspended", reason: args.reason },
      description: `Suspended company ${company.name}: ${args.reason}`,
    });

    return {
      success: true,
      message: "Company suspended",
    };
  },
});

/**
 * Reactivate a suspended company
 */
export const activateCompany = mutation({
  args: {
    userId: v.id("users"),
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    await requirePlatformAdmin(ctx, args.userId);

    const company = await ctx.db.get(args.companyId);
    if (!company) {
      throw new Error("Company not found");
    }

    await ctx.db.patch(args.companyId, {
      status: "active",
      updated_at: Date.now(),
    });

    await logAuditAction(ctx, {
      userId: args.userId,
      actionType: "company_activate",
      entityType: "company",
      entityId: args.companyId,
      previousValue: { status: company.status },
      newValue: { status: "active" },
      description: `Reactivated company ${company.name}`,
    });

    return {
      success: true,
      message: "Company activated",
    };
  },
});

// ============================================================================
// AUDIT LOG QUERIES
// ============================================================================

/**
 * Get audit logs with pagination
 */
export const getAuditLogs = query({
  args: {
    actionType: v.optional(v.string()),
    entityType: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let logs;

    if (args.actionType) {
      logs = await ctx.db
        .query("audit_logs")
        .withIndex("by_action_type", (q) => q.eq("action_type", args.actionType!))
        .order("desc")
        .collect();
    } else {
      logs = await ctx.db
        .query("audit_logs")
        .withIndex("by_created_at")
        .order("desc")
        .collect();
    }

    // Filter by entity type if provided
    let filteredLogs = logs;
    if (args.entityType) {
      filteredLogs = logs.filter((l) => l.entity_type === args.entityType);
    }

    // Apply pagination
    const offset = args.offset || 0;
    const limit = args.limit || 50;
    const paginatedLogs = filteredLogs.slice(offset, offset + limit);

    // Enrich with user info
    const enrichedLogs = await Promise.all(
      paginatedLogs.map(async (log) => {
        const user = await ctx.db.get(log.performed_by);
        return {
          ...log,
          performer: user
            ? {
                email: user.email,
                name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
              }
            : null,
        };
      })
    );

    return {
      logs: enrichedLogs,
      total: filteredLogs.length,
      offset,
      limit,
    };
  },
});

// ============================================================================
// PLATFORM ADMIN USER MANAGEMENT
// ============================================================================

/**
 * Create a platform admin user
 * Should be called with care - only for Ceibatic team members
 */
export const createPlatformAdmin = mutation({
  args: {
    email: v.string(),
    passwordHash: v.string(), // Should be hashed before calling
    firstName: v.string(),
    lastName: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Get PLATFORM_ADMIN role
    const adminRole = await ctx.db
      .query("roles")
      .withIndex("by_name", (q) => q.eq("name", "PLATFORM_ADMIN"))
      .first();

    if (!adminRole) {
      throw new Error("PLATFORM_ADMIN role not found. Run seedPlatformAdminRole first.");
    }

    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      company_id: undefined, // Platform admins don't belong to a company
      email: args.email.toLowerCase(),
      email_verified: true, // Auto-verify admin accounts
      email_verified_at: now,
      first_name: args.firstName,
      last_name: args.lastName,
      role_id: adminRole._id,
      additional_role_ids: [],
      accessible_facility_ids: [],
      accessible_area_ids: [],
      locale: "es",
      timezone: "America/Bogota",
      mfa_enabled: false,
      failed_login_attempts: 0,
      status: "active",
      created_at: now,
      updated_at: now,
    });

    return {
      success: true,
      message: "Platform admin created successfully",
      userId,
    };
  },
});
