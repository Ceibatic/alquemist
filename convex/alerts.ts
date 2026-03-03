/**
 * Alerts — Queries and Mutations
 * In-app notification system for overdue activities, observations, and deviations
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthenticatedUserId } from "./authHelpers";

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Count pending alerts for a company
 * Used for badge indicators in the UI
 */
export const countPending = query({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUserId(ctx);
    if (!userId) throw new Error("No autenticado");

    const pending = await ctx.db
      .query("alerts")
      .withIndex("by_company_status", (q) =>
        q.eq("company_id", args.companyId).eq("status", "pending")
      )
      .take(100);

    return pending.length;
  },
});

/**
 * List alerts for a company, optionally filtered by status
 * Returns alerts ordered by created_at DESC (newest first)
 */
export const listForUser = query({
  args: {
    companyId: v.id("companies"),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUserId(ctx);
    if (!userId) throw new Error("No autenticado");

    const limit = args.limit ?? 50;

    // When filtering by status, use the by_company_status index for efficiency
    if (args.status !== undefined) {
      const alerts = await ctx.db
        .query("alerts")
        .withIndex("by_company_status", (q) =>
          q.eq("company_id", args.companyId).eq("status", args.status!)
        )
        .order("desc")
        .take(limit);

      return alerts;
    }

    // No status filter — use by_created index to get newest first
    const alerts = await ctx.db
      .query("alerts")
      .withIndex("by_created", (q) => q.eq("company_id", args.companyId))
      .order("desc")
      .take(limit);

    return alerts;
  },
});

/**
 * Get a single alert by ID
 * Returns null if not found
 */
export const getById = query({
  args: {
    alertId: v.id("alerts"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUserId(ctx);
    if (!userId) throw new Error("No autenticado");

    const alert = await ctx.db.get(args.alertId);
    return alert ?? null;
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new alert
 * If dedup_key is provided and a pending alert with the same company_id + dedup_key
 * already exists, skips insertion and returns the existing alert's ID.
 */
export const create = mutation({
  args: {
    company_id: v.id("companies"),
    type: v.string(),
    severity: v.string(),
    title: v.string(),
    message: v.string(),
    source_type: v.optional(v.string()),
    source_id: v.optional(v.string()),
    assignee_id: v.optional(v.id("users")),
    facility_id: v.optional(v.id("facilities")),
    status: v.optional(v.string()),
    dedup_key: v.optional(v.string()),
    expires_at: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Deduplication: if a dedup_key is provided, check for an existing pending alert
    if (args.dedup_key !== undefined) {
      const existing = await ctx.db
        .query("alerts")
        .withIndex("by_dedup", (q) =>
          q.eq("company_id", args.company_id).eq("dedup_key", args.dedup_key)
        )
        .filter((q) => q.eq(q.field("status"), "pending"))
        .first();

      if (existing) {
        return existing._id;
      }
    }

    const now = Date.now();

    const alertId = await ctx.db.insert("alerts", {
      company_id: args.company_id,
      type: args.type,
      severity: args.severity,
      title: args.title,
      message: args.message,
      source_type: args.source_type,
      source_id: args.source_id,
      assignee_id: args.assignee_id,
      facility_id: args.facility_id,
      status: args.status ?? "pending",
      dedup_key: args.dedup_key,
      expires_at: args.expires_at,
      created_at: now,
    });

    return alertId;
  },
});

/**
 * Acknowledge an alert
 * Sets status to "acknowledged" and records who acknowledged it and when
 */
export const acknowledge = mutation({
  args: {
    alertId: v.id("alerts"),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthenticatedUserId(ctx);
    if (!currentUserId) throw new Error("No autenticado");

    const alert = await ctx.db.get(args.alertId);
    if (!alert) throw new Error("Alerta no encontrada");

    await ctx.db.patch(args.alertId, {
      status: "acknowledged",
      acknowledged_at: Date.now(),
      acknowledged_by: args.userId ?? currentUserId,
    });

    return args.alertId;
  },
});

/**
 * Resolve an alert
 * Sets status to "resolved" and records who resolved it and when
 */
export const resolve = mutation({
  args: {
    alertId: v.id("alerts"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthenticatedUserId(ctx);
    if (!currentUserId) throw new Error("No autenticado");

    const alert = await ctx.db.get(args.alertId);
    if (!alert) throw new Error("Alerta no encontrada");

    await ctx.db.patch(args.alertId, {
      status: "resolved",
      resolved_at: Date.now(),
      resolved_by: args.userId,
    });

    return args.alertId;
  },
});

/**
 * Dismiss a single alert
 * Sets status to "dismissed" without recording a user (silent dismissal)
 */
export const dismiss = mutation({
  args: {
    alertId: v.id("alerts"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUserId(ctx);
    if (!userId) throw new Error("No autenticado");

    const alert = await ctx.db.get(args.alertId);
    if (!alert) throw new Error("Alerta no encontrada");

    await ctx.db.patch(args.alertId, {
      status: "dismissed",
    });

    return args.alertId;
  },
});

/**
 * Dismiss all pending alerts for a company
 * Bulk operation — sets every "pending" alert to "dismissed"
 */
export const dismissAll = mutation({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUserId(ctx);
    if (!userId) throw new Error("No autenticado");

    const pendingAlerts = await ctx.db
      .query("alerts")
      .withIndex("by_company_status", (q) =>
        q.eq("company_id", args.companyId).eq("status", "pending")
      )
      .collect();

    await Promise.all(
      pendingAlerts.map((alert) =>
        ctx.db.patch(alert._id, { status: "dismissed" })
      )
    );

    return { dismissed: pendingAlerts.length };
  },
});
