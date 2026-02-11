/**
 * Activity Attachments — CRUD backend + file upload
 *
 * Photos, documents, certificates and other files linked to activities.
 * Uses Convex built-in file storage for upload/serve/delete.
 */

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { getAuthenticatedUserId } from "./authHelpers";

// ============================================================================
// QUERIES
// ============================================================================

export const listByActivity = query({
  args: { activityId: v.id("activities") },
  handler: async (ctx, args) => {
    const attachments = await ctx.db
      .query("activity_attachments")
      .withIndex("by_activity", (q) => q.eq("activity_id", args.activityId))
      .collect();

    // Sort by sort_order ascending
    attachments.sort((a, b) => a.sort_order - b.sort_order);
    return attachments;
  },
});

export const listByType = query({
  args: {
    companyId: v.id("companies"),
    type: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const attachments = await ctx.db
      .query("activity_attachments")
      .withIndex("by_type", (q) =>
        q.eq("company_id", args.companyId).eq("type", args.type)
      )
      .collect();

    // Sort by created_at descending (most recent first)
    attachments.sort((a, b) => b.created_at - a.created_at);

    if (args.limit) {
      return attachments.slice(0, args.limit);
    }
    return attachments;
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthenticatedUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.storage.generateUploadUrl();
  },
});

export const create = mutation({
  args: {
    activityId: v.id("activities"),
    type: v.string(),
    storageId: v.string(),
    fileName: v.string(),
    fileSizeBytes: v.optional(v.number()),
    mimeType: v.optional(v.string()),
    caption: v.optional(v.string()),
    takenAt: v.optional(v.number()),
    geoLat: v.optional(v.number()),
    geoLng: v.optional(v.number()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const activity = await ctx.db.get(args.activityId);
    if (!activity) throw new Error("Activity not found");
    const companyId = activity.company_id;
    if (!companyId) throw new Error("Activity has no company_id");

    // Get public URL from storage
    const fileUrl = await ctx.storage.getUrl(args.storageId as Id<"_storage">);
    if (!fileUrl) throw new Error("Could not get file URL");

    // If no sortOrder provided, put it at the end
    let sortOrder = args.sortOrder ?? 0;
    if (args.sortOrder === undefined) {
      const existing = await ctx.db
        .query("activity_attachments")
        .withIndex("by_activity", (q) => q.eq("activity_id", args.activityId))
        .collect();
      sortOrder = existing.length;
    }

    return await ctx.db.insert("activity_attachments", {
      activity_id: args.activityId,
      company_id: companyId,
      type: args.type,
      storage_id: args.storageId,
      file_url: fileUrl,
      file_name: args.fileName,
      file_size_bytes: args.fileSizeBytes,
      mime_type: args.mimeType,
      caption: args.caption,
      taken_at: args.takenAt,
      geo_lat: args.geoLat,
      geo_lng: args.geoLng,
      sort_order: sortOrder,
      uploaded_by: userId,
      created_at: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    attachmentId: v.id("activity_attachments"),
    caption: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db.get(args.attachmentId);
    if (!existing) throw new Error("Attachment not found");

    const patch: Record<string, unknown> = {};
    if (args.caption !== undefined) patch.caption = args.caption;
    if (args.sortOrder !== undefined) patch.sort_order = args.sortOrder;
    if (args.type !== undefined) patch.type = args.type;

    await ctx.db.patch(args.attachmentId, patch);
  },
});

export const remove = mutation({
  args: {
    attachmentId: v.id("activity_attachments"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db.get(args.attachmentId);
    if (!existing) throw new Error("Attachment not found");

    // Delete file from Convex storage
    try {
      await ctx.storage.delete(existing.storage_id as Id<"_storage">);
    } catch {
      // Storage file may already be deleted; continue with record removal
    }

    await ctx.db.delete(args.attachmentId);
  },
});

export const reorder = mutation({
  args: {
    activityId: v.id("activities"),
    attachmentIds: v.array(v.id("activity_attachments")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    for (let i = 0; i < args.attachmentIds.length; i++) {
      await ctx.db.patch(args.attachmentIds[i], { sort_order: i });
    }
  },
});

// ============================================================================
// MIGRATION
// ============================================================================

export const migrateAttachments = mutation({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const activities = await ctx.db
      .query("activities")
      .withIndex("by_company", (q) => q.eq("company_id", args.companyId))
      .collect();

    let migrated = 0;
    const errors: string[] = [];

    for (const activity of activities) {
      // Check if already migrated
      const existing = await ctx.db
        .query("activity_attachments")
        .withIndex("by_activity", (q) => q.eq("activity_id", activity._id))
        .first();
      if (existing) continue;

      const photos: string[] = activity.photos ?? [];
      const files: string[] = (activity as Record<string, unknown>).files as string[] ?? [];

      let sortOrder = 0;

      // Migrate photos
      for (const url of photos) {
        try {
          await ctx.db.insert("activity_attachments", {
            activity_id: activity._id,
            company_id: args.companyId,
            type: "photo",
            storage_id: url, // Legacy: URL as storage reference
            file_url: url,
            file_name: url.split("/").pop() ?? "photo",
            sort_order: sortOrder++,
            uploaded_by: activity.performed_by,
            created_at: activity.created_at,
          });
          migrated++;
        } catch (e) {
          errors.push(`photo ${url}: ${e}`);
        }
      }

      // Migrate files
      for (const url of files) {
        try {
          await ctx.db.insert("activity_attachments", {
            activity_id: activity._id,
            company_id: args.companyId,
            type: "document",
            storage_id: url,
            file_url: url,
            file_name: url.split("/").pop() ?? "file",
            sort_order: sortOrder++,
            uploaded_by: activity.performed_by,
            created_at: activity.created_at,
          });
          migrated++;
        } catch (e) {
          errors.push(`file ${url}: ${e}`);
        }
      }
    }

    return { attachments_migrated: migrated, errors };
  },
});
