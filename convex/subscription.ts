/**
 * Subscription Queries
 * Module 06: Subscription Management
 * Handles trial status, subscription info, and limits
 */

import { v } from "convex/values";
import { query } from "./_generated/server";

// Trial duration in days
const TRIAL_DURATION_DAYS = 30;
// Trial duration in milliseconds
const TRIAL_DURATION_MS = TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000;

/**
 * Get subscription status for a company
 * Returns trial info, plan details, and usage limits
 */
export const getStatus = query({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    const company = await ctx.db.get(args.companyId);
    if (!company) {
      throw new Error("Empresa no encontrada");
    }

    const now = Date.now();

    // Calculate trial dates
    const trialStartDate = company.created_at;
    const trialEndDate = trialStartDate + TRIAL_DURATION_MS;
    const isTrialPlan = company.subscription_plan === "trial";

    // Calculate days remaining
    let daysRemaining = 0;
    let isExpired = false;
    let expiresInDays = 0;

    if (isTrialPlan) {
      const remainingMs = trialEndDate - now;
      daysRemaining = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
      isExpired = daysRemaining <= 0;
      expiresInDays = Math.max(0, daysRemaining);
    }

    // Count current usage
    const facilities = await ctx.db
      .query("facilities")
      .withIndex("by_company", (q) => q.eq("company_id", args.companyId))
      .filter((q) => q.neq(q.field("status"), "inactive"))
      .collect();

    const users = await ctx.db
      .query("users")
      .withIndex("by_company", (q) => q.eq("company_id", args.companyId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    // Warning levels
    const showWarning = isTrialPlan && expiresInDays <= 7 && expiresInDays > 3;
    const showUrgentWarning = isTrialPlan && expiresInDays <= 3 && expiresInDays > 0;

    return {
      // Plan info
      plan: company.subscription_plan,
      planDisplayName: getPlanDisplayName(company.subscription_plan),
      isTrialPlan,
      isExpired,

      // Trial dates
      trialStartDate: isTrialPlan ? trialStartDate : null,
      trialEndDate: isTrialPlan ? trialEndDate : null,
      daysRemaining: isTrialPlan ? expiresInDays : null,

      // Warnings
      showWarning,
      showUrgentWarning,

      // Limits
      maxFacilities: company.max_facilities,
      maxUsers: company.max_users,

      // Current usage
      currentFacilities: facilities.length,
      currentUsers: users.length,

      // Usage percentages
      facilitiesUsagePercent: Math.round((facilities.length / company.max_facilities) * 100),
      usersUsagePercent: Math.round((users.length / company.max_users) * 100),
    };
  },
});

/**
 * Check if company can add more facilities
 */
export const canAddFacility = query({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    const company = await ctx.db.get(args.companyId);
    if (!company) {
      return { canAdd: false, reason: "Empresa no encontrada" };
    }

    const facilities = await ctx.db
      .query("facilities")
      .withIndex("by_company", (q) => q.eq("company_id", args.companyId))
      .filter((q) => q.neq(q.field("status"), "inactive"))
      .collect();

    const canAdd = facilities.length < company.max_facilities;

    return {
      canAdd,
      currentCount: facilities.length,
      maxCount: company.max_facilities,
      reason: canAdd
        ? null
        : `Límite de ${company.max_facilities} instalación(es) alcanzado`,
    };
  },
});

/**
 * Check if company can add more users
 */
export const canAddUser = query({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    const company = await ctx.db.get(args.companyId);
    if (!company) {
      return { canAdd: false, reason: "Empresa no encontrada" };
    }

    const users = await ctx.db
      .query("users")
      .withIndex("by_company", (q) => q.eq("company_id", args.companyId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    const canAdd = users.length < company.max_users;

    return {
      canAdd,
      currentCount: users.length,
      maxCount: company.max_users,
      reason: canAdd
        ? null
        : `Límite de ${company.max_users} usuario(s) alcanzado`,
    };
  },
});

/**
 * Helper function to get plan display name
 */
function getPlanDisplayName(plan: string): string {
  const names: Record<string, string> = {
    trial: "Prueba Gratuita",
    starter: "Inicial",
    pro: "Profesional",
    enterprise: "Empresarial",
  };
  return names[plan] || plan;
}
