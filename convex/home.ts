/**
 * Home Dashboard Module
 * Consolidated and optimized queries for role-based dashboard views
 *
 * Optimization Strategy:
 * - Single query per role type to minimize network requests
 * - Lazy evaluation - only fetch data relevant to the user's role
 * - Efficient DB queries using indexes
 * - No real-time subscriptions for static data (e.g., onboarding status)
 */

import { v } from "convex/values";
import { query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// ============================================================================
// TYPES
// ============================================================================

type RoleType = "administrative" | "operative";

interface AdminDashboardData {
  roleType: "administrative";
  overview: {
    activeOrders: number;
    totalPlants: number;
    activeBatches: number;
    areasInUse: number;
    totalAreas: number;
  };
  production: {
    ordersInProgress: number;
    ordersCompleted: number;
    ordersPending: number;
    averageCompletion: number;
  };
  quality: {
    mortalityRate: number;
    healthyBatches: number;
    warningBatches: number;
  };
  alerts: Array<{
    id: string;
    type: string;
    severity: "critical" | "warning" | "info";
    message: string;
    actionUrl: string | null;
  }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    cultivarName: string | null;
    progress: number;
    createdAt: number;
  }>;
}

interface OperativeDashboardData {
  roleType: "operative";
  todaysTasks: {
    pending: number;
    completed: number;
    overdue: number;
  };
  myBatches: Array<{
    id: string;
    batchCode: string;
    cultivarName: string | null;
    areaName: string | null;
    plantsActive: number;
    daysInProduction: number;
    status: string;
  }>;
  upcomingActivities: Array<{
    id: string;
    activityType: string;
    batchCode: string | null;
    scheduledDate: number;
    status: string;
    priority: string;
  }>;
  recentCompletedActivities: Array<{
    id: string;
    activityType: string;
    completedAt: number;
    batchCode: string | null;
  }>;
  quickStats: {
    activeBatchesAssigned: number;
    tasksCompletedToday: number;
    pendingQualityChecks: number;
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Determine if role is administrative or operative based on role name and level
 */
function getRoleType(roleName: string, roleLevel: number): RoleType {
  // Administrative roles: high-level management
  const adminRoles = ["COMPANY_OWNER", "FACILITY_MANAGER", "MANAGER", "ADMIN"];

  if (adminRoles.includes(roleName) || roleLevel >= 500) {
    return "administrative";
  }

  return "operative";
}

// ============================================================================
// MAIN DASHBOARD QUERY
// ============================================================================

/**
 * Get consolidated home dashboard data based on user role
 * This is the primary query - fetches all necessary data in a single request
 *
 * @param userId - The current user's ID
 * @param facilityId - The selected facility (optional, uses primary if not provided)
 * @returns Dashboard data tailored to the user's role type
 */
export const getDashboard = query({
  args: {
    userId: v.id("users"),
    facilityId: v.optional(v.id("facilities")),
  },
  handler: async (ctx, args) => {
    // Get user with role information
    const user = await ctx.db.get(args.userId);
    if (!user || !user.company_id) {
      throw new Error("Usuario no encontrado o sin empresa asignada");
    }

    const role = user.role_id ? await ctx.db.get(user.role_id) : null;
    if (!role) {
      throw new Error("Rol de usuario no encontrado");
    }

    const roleType = getRoleType(role.name, role.level);

    // Determine facility to query
    const facilityId = args.facilityId || user.primary_facility_id;
    if (!facilityId) {
      throw new Error("No hay instalación seleccionada");
    }

    // Verify facility access
    const facility = await ctx.db.get(facilityId);
    if (!facility || facility.company_id !== user.company_id) {
      throw new Error("Instalación no encontrada o sin acceso");
    }

    // Route to appropriate dashboard based on role type
    if (roleType === "administrative") {
      return await getAdminDashboard(ctx, user.company_id, facilityId);
    } else {
      return await getOperativeDashboard(ctx, args.userId, user.company_id, facilityId);
    }
  },
});

// ============================================================================
// ADMINISTRATIVE DASHBOARD
// ============================================================================

async function getAdminDashboard(
  ctx: any,
  companyId: Id<"companies">,
  facilityId: Id<"facilities">
): Promise<AdminDashboardData> {
  // Fetch all data in parallel for efficiency
  const [areas, batches, orders, facility] = await Promise.all([
    ctx.db
      .query("areas")
      .withIndex("by_facility", (q: any) => q.eq("facility_id", facilityId))
      .collect(),
    ctx.db
      .query("batches")
      .withIndex("by_facility", (q: any) => q.eq("facility_id", facilityId))
      .collect(),
    ctx.db
      .query("production_orders")
      .withIndex("by_company", (q: any) => q.eq("company_id", companyId))
      .filter((q: any) => q.eq(q.field("target_facility_id"), facilityId))
      .collect(),
    ctx.db.get(facilityId),
  ]);

  // Calculate overview metrics
  const activeBatches = batches.filter((b: any) => b.status === "active");
  const activeAreas = areas.filter((a: any) => a.status === "active");
  const areasWithBatches = new Set(activeBatches.map((b: any) => b.area_id).filter(Boolean));

  const totalPlants = activeBatches.reduce(
    (sum: number, b: any) => sum + (b.plants_active || 0),
    0
  );

  // Production metrics
  const activeOrders = orders.filter((o: any) => o.status === "active");
  const completedOrders = orders.filter((o: any) => o.status === "completed");
  const pendingOrders = orders.filter((o: any) => o.status === "planning" || o.status === "pending_approval");

  // Calculate average completion
  const totalCompletion = activeOrders.reduce(
    (sum: number, o: any) => sum + (o.completion_percentage || 0),
    0
  );
  const averageCompletion = activeOrders.length > 0
    ? Math.round(totalCompletion / activeOrders.length)
    : 0;

  // Quality metrics
  const totalPlantsInitial = activeBatches.reduce(
    (sum: number, b: any) => sum + (b.plants_initial || 0),
    0
  );
  const mortalityRate = totalPlantsInitial > 0
    ? Math.round(((totalPlantsInitial - totalPlants) / totalPlantsInitial) * 100)
    : 0;

  // Health classification (based on mortality)
  const healthyBatches = activeBatches.filter((b: any) => {
    const mortality = b.plants_initial > 0
      ? ((b.plants_initial - (b.plants_active || 0)) / b.plants_initial) * 100
      : 0;
    return mortality < 5;
  }).length;

  const warningBatches = activeBatches.filter((b: any) => {
    const mortality = b.plants_initial > 0
      ? ((b.plants_initial - (b.plants_active || 0)) / b.plants_initial) * 100
      : 0;
    return mortality >= 5 && mortality < 15;
  }).length;

  // Generate alerts
  const alerts = await generateAdminAlerts(ctx, facility, areas, batches, orders);

  // Recent orders (last 5)
  const recentOrders = await Promise.all(
    orders
      .sort((a: any, b: any) => b.created_at - a.created_at)
      .slice(0, 5)
      .map(async (order: any) => {
        const cultivar = order.cultivar_id
          ? await ctx.db.get(order.cultivar_id)
          : null;
        return {
          id: order._id,
          orderNumber: order.order_number,
          status: order.status,
          cultivarName: cultivar?.name || null,
          progress: order.completion_percentage || 0,
          createdAt: order.created_at,
        };
      })
  );

  return {
    roleType: "administrative",
    overview: {
      activeOrders: activeOrders.length,
      totalPlants,
      activeBatches: activeBatches.length,
      areasInUse: areasWithBatches.size,
      totalAreas: activeAreas.length,
    },
    production: {
      ordersInProgress: activeOrders.length,
      ordersCompleted: completedOrders.length,
      ordersPending: pendingOrders.length,
      averageCompletion,
    },
    quality: {
      mortalityRate,
      healthyBatches,
      warningBatches,
    },
    alerts,
    recentOrders,
  };
}

async function generateAdminAlerts(
  ctx: any,
  facility: any,
  areas: any[],
  batches: any[],
  orders: any[]
): Promise<AdminDashboardData["alerts"]> {
  const alerts: AdminDashboardData["alerts"] = [];
  const now = Date.now();

  // License expiry
  if (facility?.license_expiry_date) {
    const daysUntilExpiry = Math.floor(
      (facility.license_expiry_date - now) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiry <= 0) {
      alerts.push({
        id: `license-expired-${facility._id}`,
        type: "license_expired",
        severity: "critical",
        message: "La licencia ha vencido",
        actionUrl: "/settings/facility",
      });
    } else if (daysUntilExpiry <= 30) {
      alerts.push({
        id: `license-expiry-${facility._id}`,
        type: "license_expiry",
        severity: daysUntilExpiry <= 7 ? "critical" : "warning",
        message: `La licencia vence en ${daysUntilExpiry} días`,
        actionUrl: "/settings/facility",
      });
    }
  }

  // No areas configured
  if (areas.length === 0) {
    alerts.push({
      id: `no-areas-${facility?._id}`,
      type: "configuration_incomplete",
      severity: "warning",
      message: "No hay áreas configuradas",
      actionUrl: "/areas",
    });
  }

  // High mortality batches
  const criticalBatches = batches.filter((b: any) => {
    if (b.status !== "active" || !b.plants_initial) return false;
    const mortality = ((b.plants_initial - (b.plants_active || 0)) / b.plants_initial) * 100;
    return mortality >= 15;
  });

  if (criticalBatches.length > 0) {
    alerts.push({
      id: "high-mortality",
      type: "quality_alert",
      severity: "warning",
      message: `${criticalBatches.length} lote(s) con mortalidad alta (>15%)`,
      actionUrl: "/batches",
    });
  }

  // Stalled orders (no progress in 7 days)
  const stalledOrders = orders.filter((o: any) => {
    if (o.status !== "active") return false;
    const daysSinceUpdate = Math.floor((now - o.updated_at) / (1000 * 60 * 60 * 24));
    return daysSinceUpdate >= 7;
  });

  if (stalledOrders.length > 0) {
    alerts.push({
      id: "stalled-orders",
      type: "production_alert",
      severity: "warning",
      message: `${stalledOrders.length} orden(es) sin actividad en 7+ días`,
      actionUrl: "/production-orders",
    });
  }

  // Check low stock (simplified - check inventory in areas)
  const areaIds = areas.map((a: any) => a._id);
  const inventoryItems = await ctx.db.query("inventory_items").collect();
  const facilityInventory = inventoryItems.filter(
    (item: any) => item.area_id && areaIds.includes(item.area_id)
  );
  const lowStockItems = facilityInventory.filter((item: any) => {
    const reorderPoint = item.reorder_point || 0;
    return item.quantity_available <= reorderPoint;
  });

  if (lowStockItems.length > 0) {
    alerts.push({
      id: "low-stock",
      type: "inventory_alert",
      severity: "warning",
      message: `${lowStockItems.length} producto(s) con stock bajo`,
      actionUrl: "/inventory",
    });
  }

  // Sort by severity
  const severityOrder = { critical: 0, warning: 1, info: 2 };
  return alerts.sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
  );
}

// ============================================================================
// OPERATIVE DASHBOARD
// ============================================================================

async function getOperativeDashboard(
  ctx: any,
  userId: Id<"users">,
  companyId: Id<"companies">,
  facilityId: Id<"facilities">
): Promise<OperativeDashboardData> {
  const now = Date.now();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // Get user's accessible areas
  const user = await ctx.db.get(userId);
  const accessibleAreaIds = user?.accessible_area_ids || [];

  // Fetch data in parallel
  const [scheduledActivities, completedActivities, batches] = await Promise.all([
    // Scheduled activities for this facility
    ctx.db
      .query("scheduled_activities")
      .filter((q: any) => q.eq(q.field("facility_id"), facilityId))
      .collect(),
    // Recent completed activities by this user
    ctx.db
      .query("activities")
      .filter((q: any) => q.eq(q.field("performed_by"), userId))
      .order("desc")
      .take(10),
    // Batches in facility
    ctx.db
      .query("batches")
      .withIndex("by_facility", (q: any) => q.eq("facility_id", facilityId))
      .filter((q: any) => q.eq(q.field("status"), "active"))
      .collect(),
  ]);

  // Filter activities relevant to user (assigned or in accessible areas)
  const relevantActivities = scheduledActivities.filter((a: any) => {
    if (a.assigned_to === userId) return true;
    if (accessibleAreaIds.length === 0) return true; // If no restrictions, show all
    return accessibleAreaIds.includes(a.area_id);
  });

  // Today's task counts
  const todayPending = relevantActivities.filter((a: any) =>
    a.status === "pending" &&
    a.scheduled_date >= startOfDay.getTime() &&
    a.scheduled_date <= endOfDay.getTime()
  ).length;

  const todayOverdue = relevantActivities.filter((a: any) =>
    a.status === "pending" &&
    a.scheduled_date < startOfDay.getTime()
  ).length;

  const todayCompleted = completedActivities.filter((a: any) =>
    a.activity_date >= startOfDay.getTime() &&
    a.activity_date <= endOfDay.getTime()
  ).length;

  // Filter batches for operative user
  const myBatches = batches.filter((b: any) => {
    if (accessibleAreaIds.length === 0) return true;
    return accessibleAreaIds.includes(b.area_id);
  });

  // Enrich batches with related data
  const enrichedBatches = await Promise.all(
    myBatches.slice(0, 10).map(async (batch: any) => {
      const [area, cultivar] = await Promise.all([
        batch.area_id ? ctx.db.get(batch.area_id) : null,
        batch.cultivar_id ? ctx.db.get(batch.cultivar_id) : null,
      ]);

      const daysInProduction = Math.floor(
        (now - batch.created_date) / (1000 * 60 * 60 * 24)
      );

      return {
        id: batch._id,
        batchCode: batch.batch_code,
        cultivarName: cultivar?.name || null,
        areaName: area?.name || null,
        plantsActive: batch.plants_active || 0,
        daysInProduction,
        status: batch.status,
      };
    })
  );

  // Upcoming activities (next 7 days)
  const sevenDaysFromNow = now + 7 * 24 * 60 * 60 * 1000;
  const upcomingActivities = await Promise.all(
    relevantActivities
      .filter((a: any) =>
        a.status === "pending" &&
        a.scheduled_date >= now &&
        a.scheduled_date <= sevenDaysFromNow
      )
      .sort((a: any, b: any) => a.scheduled_date - b.scheduled_date)
      .slice(0, 10)
      .map(async (activity: any) => {
        let batchCode = null;
        if (activity.batch_id) {
          const batch = await ctx.db.get(activity.batch_id);
          batchCode = batch?.batch_code || null;
        }
        return {
          id: activity._id,
          activityType: activity.activity_type,
          batchCode,
          scheduledDate: activity.scheduled_date,
          status: activity.status,
          priority: activity.priority || "normal",
        };
      })
  );

  // Recent completed activities
  const recentCompleted = await Promise.all(
    completedActivities.slice(0, 5).map(async (activity: any) => {
      let batchCode = null;
      if (activity.entity_type === "batch" && activity.entity_id) {
        const batch = await ctx.db.get(activity.entity_id as Id<"batches">);
        batchCode = batch?.batch_code || null;
      }
      return {
        id: activity._id,
        activityType: activity.activity_type,
        completedAt: activity.activity_date,
        batchCode,
      };
    })
  );

  // Pending quality checks
  const pendingQualityChecks = scheduledActivities.filter((a: any) =>
    a.status === "pending" &&
    a.activity_type === "quality_check"
  ).length;

  return {
    roleType: "operative",
    todaysTasks: {
      pending: todayPending,
      completed: todayCompleted,
      overdue: todayOverdue,
    },
    myBatches: enrichedBatches,
    upcomingActivities,
    recentCompletedActivities: recentCompleted,
    quickStats: {
      activeBatchesAssigned: myBatches.length,
      tasksCompletedToday: todayCompleted,
      pendingQualityChecks,
    },
  };
}

// ============================================================================
// LIGHTWEIGHT QUERIES FOR SPECIFIC SECTIONS
// These can be used for lazy loading specific sections
// ============================================================================

/**
 * Get only alerts (lightweight query for header notification badge)
 */
export const getAlertCount = query({
  args: {
    facilityId: v.id("facilities"),
  },
  handler: async (ctx, args) => {
    const facility = await ctx.db.get(args.facilityId);
    if (!facility) return { total: 0, critical: 0 };

    let alertCount = 0;
    let criticalCount = 0;
    const now = Date.now();

    // License expiry
    if (facility.license_expiry_date) {
      const daysUntilExpiry = Math.floor(
        (facility.license_expiry_date - now) / (1000 * 60 * 60 * 24)
      );
      if (daysUntilExpiry <= 30) {
        alertCount++;
        if (daysUntilExpiry <= 7) criticalCount++;
      }
    }

    // Low stock check
    const areas = await ctx.db
      .query("areas")
      .withIndex("by_facility", (q) => q.eq("facility_id", args.facilityId))
      .collect();

    const areaIds = areas.map((a) => a._id);
    const inventoryItems = await ctx.db.query("inventory_items").collect();
    const lowStockCount = inventoryItems.filter((item) => {
      if (!item.area_id || !areaIds.includes(item.area_id)) return false;
      return item.quantity_available <= (item.reorder_point || 0);
    }).length;

    if (lowStockCount > 0) alertCount++;

    return { total: alertCount, critical: criticalCount };
  },
});

/**
 * Get user's role type for conditional rendering
 */
export const getUserRoleType = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    const role = user.role_id ? await ctx.db.get(user.role_id) : null;
    if (!role) return null;

    return {
      roleType: getRoleType(role.name, role.level),
      roleName: role.name,
      roleDisplayName: role.display_name_es,
    };
  },
});

// ============================================================================
// TREND DATA FOR CHARTS
// ============================================================================

interface TrendDataPoint {
  date: string; // YYYY-MM-DD format
  value: number;
}

interface DashboardTrends {
  productionTrend: TrendDataPoint[]; // Orders created per day
  batchTrend: TrendDataPoint[]; // Batches created per day
  activityTrend: TrendDataPoint[]; // Activities completed per day
  plantHealthTrend: Array<{
    date: string;
    healthy: number;
    warning: number;
    critical: number;
  }>;
}

/**
 * Get trend data for dashboard charts (last 30 days)
 */
export const getDashboardTrends = query({
  args: {
    facilityId: v.id("facilities"),
    days: v.optional(v.number()), // Default 30 days
  },
  handler: async (ctx, args): Promise<DashboardTrends> => {
    const daysToFetch = args.days || 30;
    const now = Date.now();
    const startDate = now - daysToFetch * 24 * 60 * 60 * 1000;

    // Initialize date buckets
    const dateBuckets: Record<string, {
      orders: number;
      batches: number;
      activities: number;
      healthy: number;
      warning: number;
      critical: number;
    }> = {};

    for (let i = 0; i < daysToFetch; i++) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split("T")[0];
      dateBuckets[dateStr] = {
        orders: 0,
        batches: 0,
        activities: 0,
        healthy: 0,
        warning: 0,
        critical: 0,
      };
    }

    // Get facility to find company_id
    const facility = await ctx.db.get(args.facilityId);
    if (!facility) {
      return {
        productionTrend: [],
        batchTrend: [],
        activityTrend: [],
        plantHealthTrend: [],
      };
    }

    // Fetch data in parallel
    const [orders, batches, activities] = await Promise.all([
      ctx.db
        .query("production_orders")
        .withIndex("by_company", (q) => q.eq("company_id", facility.company_id))
        .filter((q) =>
          q.and(
            q.eq(q.field("target_facility_id"), args.facilityId),
            q.gte(q.field("created_at"), startDate)
          )
        )
        .collect(),
      ctx.db
        .query("batches")
        .withIndex("by_facility", (q) => q.eq("facility_id", args.facilityId))
        .filter((q) => q.gte(q.field("created_date"), startDate))
        .collect(),
      ctx.db
        .query("activities")
        .filter((q) => q.gte(q.field("timestamp"), startDate))
        .collect(),
    ]);

    // Aggregate orders by date
    for (const order of orders) {
      const dateStr = new Date(order.created_at).toISOString().split("T")[0];
      if (dateBuckets[dateStr]) {
        dateBuckets[dateStr].orders++;
      }
    }

    // Aggregate batches by date
    for (const batch of batches) {
      const dateStr = new Date(batch.created_date).toISOString().split("T")[0];
      if (dateBuckets[dateStr]) {
        dateBuckets[dateStr].batches++;
      }
    }

    // Aggregate activities by date
    for (const activity of activities) {
      const dateStr = new Date(activity.timestamp).toISOString().split("T")[0];
      if (dateBuckets[dateStr]) {
        dateBuckets[dateStr].activities++;
      }
    }

    // Calculate plant health distribution for each day
    // This is simplified - we use current batch data and project backwards
    const currentBatches = await ctx.db
      .query("batches")
      .withIndex("by_facility", (q) => q.eq("facility_id", args.facilityId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    // Count health status for current state
    let healthy = 0;
    let warning = 0;
    let critical = 0;

    for (const batch of currentBatches) {
      if (!batch.initial_quantity || batch.initial_quantity === 0) {
        healthy++;
        continue;
      }
      const mortality = ((batch.initial_quantity - (batch.current_quantity || 0)) / batch.initial_quantity) * 100;
      if (mortality < 5) healthy++;
      else if (mortality < 15) warning++;
      else critical++;
    }

    // For simplicity, set all dates to current health (in production, you'd track historical snapshots)
    for (const dateStr in dateBuckets) {
      dateBuckets[dateStr].healthy = healthy;
      dateBuckets[dateStr].warning = warning;
      dateBuckets[dateStr].critical = critical;
    }

    // Convert to arrays, sorted by date
    const sortedDates = Object.keys(dateBuckets).sort();

    return {
      productionTrend: sortedDates.map((date) => ({
        date,
        value: dateBuckets[date].orders,
      })),
      batchTrend: sortedDates.map((date) => ({
        date,
        value: dateBuckets[date].batches,
      })),
      activityTrend: sortedDates.map((date) => ({
        date,
        value: dateBuckets[date].activities,
      })),
      plantHealthTrend: sortedDates.map((date) => ({
        date,
        healthy: dateBuckets[date].healthy,
        warning: dateBuckets[date].warning,
        critical: dateBuckets[date].critical,
      })),
    };
  },
});
