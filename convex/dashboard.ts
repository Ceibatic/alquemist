/**
 * Module 5: Dashboard Home
 * Dashboard metrics and overview for Phase 1
 */

import { v } from "convex/values";
import { query } from "./_generated/server";

// ============================================================================
// MODULE 5: DASHBOARD HOME
// ============================================================================

/**
 * Get dashboard summary metrics
 * Key metrics for facility dashboard home page
 */
export const getDashboardSummary = query({
  args: {
    facilityId: v.id("facilities"),
  },
  handler: async (ctx, args) => {
    // Verify facility exists
    const facility = await ctx.db.get(args.facilityId);
    if (!facility) {
      throw new Error("Instalación no encontrada");
    }

    // For Phase 1, return placeholder data since production orders don't exist yet
    // These will be populated in Phase 4 when production orders are implemented

    // Count areas in this facility
    const areas = await ctx.db
      .query("areas")
      .withIndex("by_facility", (q) => q.eq("facility_id", args.facilityId))
      .collect();

    const activeAreas = areas.filter((a) => a.status === "active");
    const totalAreas = areas.length;

    // Check inventory for low stock items (Phase 2 feature)
    // For Phase 1, return 0
    const lowStockItems = 0;

    return {
      facilityName: facility.name,
      activeProductionOrders: 0, // Will be populated in Phase 4
      pendingActivities: 0, // Will be populated in Phase 4
      overdueActivities: 0, // Will be populated in Phase 4
      completionRate: 0, // Will be populated in Phase 4
      areasInUse: 0, // Will be calculated from production orders in Phase 4
      totalAreas,
      lowStockItems, // Will be populated in Phase 2
    };
  },
});

/**
 * Get recent/upcoming activities for dashboard
 * Shows activities that need attention
 */
export const getRecentActivities = query({
  args: {
    facilityId: v.id("facilities"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    // Verify facility exists
    const facility = await ctx.db.get(args.facilityId);
    if (!facility) {
      throw new Error("Instalación no encontrada");
    }

    // For Phase 1, return empty array
    // Activities will be implemented in Phase 4 (Production Execution)
    // This endpoint will query the activities table filtered by:
    // - facility_id
    // - status in (pending, in_progress, overdue)
    // - scheduled_date within next 7 days
    // - sorted by scheduled_date ASC
    // - limited to 'limit' rows

    return [];
  },
});

/**
 * Get active alerts and notifications
 * System alerts that require attention
 */
export const getActiveAlerts = query({
  args: {
    facilityId: v.id("facilities"),
  },
  handler: async (ctx, args) => {
    // Verify facility exists
    const facility = await ctx.db.get(args.facilityId);
    if (!facility) {
      throw new Error("Instalación no encontrada");
    }

    const alerts: Array<{
      id: string;
      type: string;
      severity: string;
      message: string;
      createdAt: number;
      actionRequired: boolean;
      actionUrl: string | null;
    }> = [];

    // Check for facility-level alerts

    // 1. License expiry warning (if expiry date is set)
    if (facility.license_expiry_date) {
      const now = Date.now();
      const daysUntilExpiry = Math.floor(
        (facility.license_expiry_date - now) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
        alerts.push({
          id: `license-expiry-${facility._id}`,
          type: "license_expiry",
          severity: daysUntilExpiry <= 7 ? "critical" : "warning",
          message: `La licencia vence en ${daysUntilExpiry} días`,
          createdAt: now,
          actionRequired: true,
          actionUrl: `/facility/${facility._id}/settings`,
        });
      } else if (daysUntilExpiry <= 0) {
        alerts.push({
          id: `license-expired-${facility._id}`,
          type: "license_expired",
          severity: "critical",
          message: "La licencia ha vencido",
          createdAt: now,
          actionRequired: true,
          actionUrl: `/facility/${facility._id}/settings`,
        });
      }
    }

    // 2. No areas configured
    const areas = await ctx.db
      .query("areas")
      .withIndex("by_facility", (q) => q.eq("facility_id", args.facilityId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    if (areas.length === 0) {
      alerts.push({
        id: `no-areas-${facility._id}`,
        type: "configuration_incomplete",
        severity: "warning",
        message: "No hay áreas configuradas. Configura al menos un área para comenzar.",
        createdAt: Date.now(),
        actionRequired: true,
        actionUrl: `/facility/${facility._id}/areas`,
      });
    }

    // 3. Low stock alerts (Phase 2 feature)
    // This will be implemented when inventory management is added
    // Query inventory table for items where current_stock <= reorder_point

    // 4. Overdue activities (Phase 4 feature)
    // This will be implemented when production orders are added
    // Query activities table for overdue items

    // 5. Pending approvals (Phase 4 feature)
    // This will be implemented when production orders workflow is added
    // Query production_orders for status="pending_approval"

    // Sort alerts by severity (critical > warning > info)
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    alerts.sort((a, b) => {
      const orderA = severityOrder[a.severity as keyof typeof severityOrder] ?? 3;
      const orderB = severityOrder[b.severity as keyof typeof severityOrder] ?? 3;
      return orderA - orderB;
    });

    return alerts;
  },
});

/**
 * Get facility overview data
 * Combined data for dashboard header/overview section
 */
export const getFacilityOverview = query({
  args: {
    facilityId: v.id("facilities"),
  },
  handler: async (ctx, args) => {
    // Get facility
    const facility = await ctx.db.get(args.facilityId);
    if (!facility) {
      throw new Error("Instalación no encontrada");
    }

    // Get company
    const company = facility.company_id
      ? await ctx.db.get(facility.company_id)
      : null;

    // Get areas count
    const areas = await ctx.db
      .query("areas")
      .withIndex("by_facility", (q) => q.eq("facility_id", args.facilityId))
      .collect();

    const activeAreas = areas.filter((a) => a.status === "active");

    return {
      facility: {
        id: facility._id,
        name: facility.name,
        licenseNumber: facility.license_number,
        licenseType: facility.license_type,
        status: facility.status,
        totalAreaM2: facility.total_area_m2,
      },
      company: company
        ? {
            id: company._id,
            name: company.name,
            subscriptionPlan: company.subscription_plan,
          }
        : null,
      stats: {
        totalAreas: areas.length,
        activeAreas: activeAreas.length,
        activeOrders: 0, // Phase 4
        pendingActivities: 0, // Phase 4
      },
    };
  },
});

/**
 * Get user's accessible facilities
 * For facility selector dropdown
 */
export const getUserFacilities = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get user
    const user = await ctx.db.get(args.userId);
    if (!user || !user.company_id) {
      return [];
    }

    // Get user's role
    const role = user.role_id ? await ctx.db.get(user.role_id) : null;

    // If COMPANY_OWNER or MANAGER, show all facilities
    if (role && (role.name === "COMPANY_OWNER" || role.name === "MANAGER")) {
      const facilities = await ctx.db
        .query("facilities")
        .withIndex("by_company", (q) => q.eq("company_id", user.company_id))
        .filter((q) => q.eq(q.field("status"), "active"))
        .collect();

      return facilities.map((f) => ({
        id: f._id,
        name: f.name,
        licenseNumber: f.license_number,
        status: f.status,
      }));
    }

    // Otherwise, show only accessible facilities
    if (user.accessible_facility_ids && user.accessible_facility_ids.length > 0) {
      const facilities = await Promise.all(
        user.accessible_facility_ids.map((id) => ctx.db.get(id))
      );

      return facilities
        .filter((f) => f && f.status === "active")
        .map((f) => ({
          id: f!._id,
          name: f!.name,
          licenseNumber: f!.license_number,
          status: f!.status,
        }));
    }

    return [];
  },
});
