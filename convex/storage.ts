/**
 * File Storage Module
 *
 * Provides mutations for uploading files to Convex storage
 * and generating public URLs for file access.
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Generate an upload URL for file uploads
 *
 * Usage:
 * 1. Call this mutation to get an upload URL
 * 2. POST the file to the URL
 * 3. Store the returned storage ID
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Get a public URL for a stored file
 *
 * Usage:
 * 1. Call with a storage ID
 * 2. Returns a URL that can be used in <img> tags
 */
export const getUrl = query({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

/**
 * Delete a file from storage
 *
 * Usage:
 * 1. Call with a storage ID to remove the file
 */
export const deleteFile = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    await ctx.storage.delete(args.storageId);
  },
});
