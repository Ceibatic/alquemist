/**
 * Clerk User Sync - Internal Mutations
 *
 * Internal mutations for syncing Clerk users to Convex users table.
 * Called from Clerk webhooks to keep user data in sync.
 */

import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Create or link a user from Clerk
 *
 * If a user with the same email exists, link the Clerk ID.
 * Otherwise, create a new user.
 */
export const createUserFromClerk = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists by email
    const existingUserByEmail = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first();

    if (existingUserByEmail) {
      // Link existing user to Clerk ID
      await ctx.db.patch(existingUserByEmail._id, {
        clerkId: args.clerkId,
        first_name: args.firstName,
        last_name: args.lastName,
        name: args.firstName && args.lastName
          ? `${args.firstName} ${args.lastName}`
          : args.firstName || args.lastName || existingUserByEmail.name,
        email_verified: true,
        email_verified_at: Date.now(),
        updated_at: Date.now(),
      });

      return existingUserByEmail._id;
    }

    // Check if Clerk ID already exists (shouldn't happen, but safe)
    const existingUserByClerk = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUserByClerk) {
      // Update existing user
      await ctx.db.patch(existingUserByClerk._id, {
        email: args.email,
        first_name: args.firstName,
        last_name: args.lastName,
        name: args.firstName && args.lastName
          ? `${args.firstName} ${args.lastName}`
          : args.firstName || args.lastName || existingUserByClerk.name,
        email_verified: true,
        email_verified_at: Date.now(),
        updated_at: Date.now(),
      });

      return existingUserByClerk._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      first_name: args.firstName,
      last_name: args.lastName,
      name: args.firstName && args.lastName
        ? `${args.firstName} ${args.lastName}`
        : args.firstName || args.lastName,
      email_verified: true,
      email_verified_at: Date.now(),
      status: "active",
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    return userId;
  },
});

/**
 * Update user from Clerk
 *
 * Updates user data when Clerk user is modified.
 */
export const updateUserFromClerk = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Find user by Clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error(`User with Clerk ID ${args.clerkId} not found`);
    }

    // Prepare update object
    const updates: any = {
      updated_at: Date.now(),
    };

    if (args.email !== undefined) {
      updates.email = args.email;
    }

    if (args.firstName !== undefined) {
      updates.first_name = args.firstName;
    }

    if (args.lastName !== undefined) {
      updates.last_name = args.lastName;
    }

    // Update name if first or last name changed
    if (args.firstName !== undefined || args.lastName !== undefined) {
      const firstName = args.firstName !== undefined ? args.firstName : user.first_name;
      const lastName = args.lastName !== undefined ? args.lastName : user.last_name;

      if (firstName && lastName) {
        updates.name = `${firstName} ${lastName}`;
      } else if (firstName) {
        updates.name = firstName;
      } else if (lastName) {
        updates.name = lastName;
      }
    }

    await ctx.db.patch(user._id, updates);

    return user._id;
  },
});

/**
 * Delete user from Clerk
 *
 * Soft delete - sets user status to inactive instead of hard delete.
 */
export const deleteUserFromClerk = internalMutation({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user by Clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error(`User with Clerk ID ${args.clerkId} not found`);
    }

    // Soft delete - set status to inactive
    await ctx.db.patch(user._id, {
      status: "inactive",
      updated_at: Date.now(),
    });

    return user._id;
  },
});
