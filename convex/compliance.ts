/**
 * Compliance Event Queries and Mutations
 * Regulatory compliance tracking
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * List compliance events
 */
export const list = query({
  args: {
    companyId: v.id("companies"),
    event_category: v.optional(v.string()),
    status: v.optional(v.string()),
    facility_id: v.optional(v.id("facilities")),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let eventsQuery = ctx.db.query("compliance_events");

    // Filter by event category
    if (args.event_category) {
      eventsQuery = eventsQuery.filter((q) =>
        q.eq(q.field("event_category"), args.event_category)
      );
    }

    // Filter by status
    if (args.status) {
      eventsQuery = eventsQuery.filter((q) =>
        q.eq(q.field("status"), args.status)
      );
    }

    // Filter by facility
    if (args.facility_id) {
      eventsQuery = eventsQuery.filter((q) =>
        q.eq(q.field("facility_id"), args.facility_id)
      );
    }

    const allEvents = await eventsQuery.collect();

    // Filter by company
    const events = allEvents.filter(e => e.company_id === args.companyId);

    // Apply pagination
    const offset = args.offset || 0;
    const limit = args.limit || 50;

    return {
      events: events.slice(offset, offset + limit),
      total: events.length,
    };
  },
});

/**
 * Create a compliance event
 */
export const create = mutation({
  args: {
    company_id: v.id("companies"), // Convex company ID
    event_type: v.string(), // inspection/violation/permit/audit
    event_category: v.string(), // ica/invima/municipal/fnc
    entity_type: v.string(), // company/facility/batch
    entity_id: v.string(),

    facility_id: v.optional(v.id("facilities")),

    title: v.string(),
    description: v.string(),
    severity: v.optional(v.string()),
    status: v.optional(v.string()),

    regulatory_authority: v.optional(v.string()),
    regulation_reference: v.optional(v.string()),
    compliance_requirement: v.optional(v.string()),

    detected_by: v.optional(v.string()),
    detected_by_user_id: v.optional(v.id("users")),

    assigned_to: v.optional(v.id("users")),
    due_date: v.optional(v.number()),

    supporting_documents: v.optional(v.array(v.string())),
    photos: v.optional(v.array(v.string())),

    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const eventId = await ctx.db.insert("compliance_events", {
      event_type: args.event_type,
      event_category: args.event_category,
      regulatory_authority: args.regulatory_authority,
      regulation_reference: args.regulation_reference,
      compliance_requirement: args.compliance_requirement,

      entity_type: args.entity_type,
      entity_id: args.entity_id,
      company_id: args.company_id,
      facility_id: args.facility_id,

      title: args.title,
      description: args.description,
      severity: args.severity,

      detected_by: args.detected_by,
      detected_by_user_id: args.detected_by_user_id,
      detection_date: now,

      status: args.status || "open",
      assigned_to: args.assigned_to,
      due_date: args.due_date,
      resolution_date: undefined,
      resolution_notes: undefined,

      immediate_actions: undefined,
      preventive_actions: undefined,
      corrective_actions: undefined,

      supporting_documents: args.supporting_documents || [],
      photos: args.photos || [],

      requires_authority_notification: false,
      notification_sent: undefined,
      authority_response: undefined,

      estimated_cost: undefined,
      actual_cost: undefined,

      followup_required: false,
      followup_date: undefined,
      recurring_check_frequency: undefined,

      created_by: args.detected_by_user_id,
      updated_by: undefined,
      created_at: now,
      updated_at: now,
      is_audit_locked: false,
      audit_lock_reason: undefined,
    });

    return eventId;
  },
});
