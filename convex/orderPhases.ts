/**
 * Order Phases Queries and Mutations
 * Manage phases within production orders
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Get single order phase by ID with enriched activities
 */
export const getById = query({
  args: {
    phaseId: v.id("order_phases"),
  },
  handler: async (ctx, args) => {
    const phase = await ctx.db.get(args.phaseId);
    if (!phase) {
      return null;
    }

    // Get parent order for breadcrumb context
    const order = await ctx.db.get(phase.order_id);

    // Get area name
    const area = phase.area_id ? await ctx.db.get(phase.area_id) : null;

    // Get scheduled activities for this order within the phase date range
    const allActivities = await ctx.db
      .query("scheduled_activities")
      .withIndex("by_order_date", (q) =>
        q
          .eq("production_order_id", phase.order_id)
          .gte("scheduled_date", phase.planned_start_date)
      )
      .collect();

    // Filter to only activities within this phase's date range
    const phaseActivities = allActivities.filter(
      (a) => a.scheduled_date < phase.planned_end_date
    );

    // Enrich activities with type info
    const enrichedActivities = await Promise.all(
      phaseActivities.map(async (activity) => {
        // Resolve activity type from type_id FK
        let activityTypeInfo: {
          code: string;
          name: string;
          category: string;
          icon?: string;
          color?: string;
        } | null = null;

        if (activity.type_id) {
          const actType = await ctx.db.get(activity.type_id);
          if (actType) {
            activityTypeInfo = {
              code: actType.code,
              name: actType.name,
              category: actType.category,
              icon: actType.icon,
              color: actType.color,
            };
          }
        }

        // Get resource count
        const resources = await ctx.db
          .query("scheduled_activity_resources")
          .withIndex("by_scheduled_activity", (q) =>
            q.eq("scheduled_activity_id", activity._id)
          )
          .collect();

        return {
          _id: activity._id,
          activity_type: activity.activity_type,
          scheduled_date: activity.scheduled_date,
          estimated_duration_minutes: activity.estimated_duration_minutes,
          status: activity.status,
          instructions: activity.instructions,
          assigned_to: activity.assigned_to,
          template_id: activity.template_id,
          activity_type_info: activityTypeInfo,
          resource_count: resources.length,
          group_id: activity.group_id,
          entity_id: activity.entity_id,
          phase_role: activity.phase_role,
        };
      })
    );

    // Sort by scheduled_date then by activity_type
    enrichedActivities.sort((a, b) => {
      if (a.scheduled_date !== b.scheduled_date) {
        return a.scheduled_date - b.scheduled_date;
      }
      return a.activity_type.localeCompare(b.activity_type);
    });

    return {
      ...phase,
      orderNumber: order?.order_number ?? null,
      orderId: phase.order_id,
      areaName: area?.name ?? null,
      activities: enrichedActivities,
    };
  },
});

/**
 * Create a new order phase (for manual phase creation in wizard)
 */
export const create = mutation({
  args: {
    orderId: v.id("production_orders"),
    phaseName: v.string(),
    phaseOrder: v.number(),
    plannedStartDate: v.number(),
    plannedEndDate: v.number(),
    areaId: v.optional(v.id("areas")),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status !== "planning") {
      throw new Error("Can only add phases to orders in planning status");
    }

    const phaseId = await ctx.db.insert("order_phases", {
      order_id: args.orderId,
      template_phase_id: undefined,
      phase_name: args.phaseName,
      phase_order: args.phaseOrder,
      planned_start_date: args.plannedStartDate,
      planned_end_date: args.plannedEndDate,
      actual_start_date: undefined,
      actual_end_date: undefined,
      area_id: args.areaId,
      status: "pending",
      completion_notes: undefined,
      created_at: Date.now(),
    });

    return phaseId;
  },
});
