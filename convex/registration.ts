/**
 * Module 1: Registration - Company Setup
 * User creation is now handled by Convex Auth (Password provider).
 * This file handles Step 2: company creation after email verification.
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ============================================================================
// STEP 2: COMPANY CREATION (After Email Verification via Convex Auth)
// ============================================================================

/**
 * Step 2: Create company and assign user as COMPANY_OWNER
 * - Verify user exists and email is verified
 * - Create company
 * - Assign user to company with COMPANY_OWNER role
 * - Set company timezone from municipality
 */
export const registerCompanyStep2 = mutation({
  args: {
    userId: v.id("users"),
    companyName: v.string(),
    businessEntityType: v.string(), // S.A.S, S.A., Ltda, E.U., Persona Natural
    companyType: v.string(), // cannabis/coffee/cocoa/flowers/mixed
    country: v.string(), // Default: "CO"
    departmentCode: v.string(), // DANE division_1_code
    municipalityCode: v.string(), // DANE division_2_code
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // 1. Get user and verify email is verified
    const user = await ctx.db.get(args.userId);

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    if (!user.email_verified) {
      throw new Error("Debes verificar tu email antes de continuar");
    }

    if (user.company_id) {
      throw new Error("Este usuario ya tiene una empresa asociada");
    }

    // 2. Validate geographic location
    const municipality = await ctx.db
      .query("geographic_locations")
      .withIndex("by_division_2", (q) =>
        q.eq("country_code", args.country).eq("division_2_code", args.municipalityCode)
      )
      .filter((q) => q.eq(q.field("administrative_level"), 2))
      .first();

    if (!municipality) {
      throw new Error("Municipio no encontrado");
    }

    const department = await ctx.db
      .query("geographic_locations")
      .withIndex("by_division_1", (q) =>
        q.eq("country_code", args.country).eq("division_1_code", args.departmentCode)
      )
      .filter((q) => q.eq(q.field("administrative_level"), 1))
      .first();

    if (!department) {
      throw new Error("Departamento no encontrado");
    }

    // 3. Create company
    const companyId = await ctx.db.insert("companies", {
      name: args.companyName,
      company_type: args.companyType,
      business_entity_type: args.businessEntityType,
      country: args.country,
      administrative_division_1: department.division_1_name,
      administrative_division_2: municipality.division_2_name,
      regional_administrative_code: args.municipalityCode,
      city: municipality.division_2_name,

      // Localization - get from municipality
      default_locale: "es",
      default_currency: "COP",
      default_timezone: municipality.timezone || "America/Bogota",

      // Subscription defaults
      subscription_plan: "trial", // 30-day free trial
      max_facilities: 1,
      max_users: 3,
      feature_flags: {},

      // Status
      status: "active",

      created_at: now,
      updated_at: now,
    });

    // 4. Assign COMPANY_OWNER role
    const ownerRole = await ctx.db
      .query("roles")
      .filter((q) => q.eq(q.field("name"), "COMPANY_OWNER"))
      .first();

    // 5. Update user with company reference, role, and timezone
    await ctx.db.patch(args.userId, {
      company_id: companyId,
      ...(ownerRole ? { role_id: ownerRole._id } : {}),
      timezone: municipality.timezone || "America/Bogota",
      updated_at: now,
    });

    // 6. Retrieve updated user with all details
    const updatedUser = await ctx.db.get(args.userId);

    return {
      success: true,
      userId: args.userId,
      companyId,
      user: {
        firstName: updatedUser?.first_name || "",
        lastName: updatedUser?.last_name || "",
        email: updatedUser?.email || "",
        roleId: updatedUser?.role_id || "",
        locale: updatedUser?.locale || "es",
      },
      message:
        "¡Bienvenido! Tu empresa ha sido creada exitosamente. Acceso a plataforma.",
    };
  },
});

// ============================================================================
// UTILITY QUERIES
// ============================================================================

/**
 * Check email availability
 */
export const checkEmailAvailability = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    return {
      available: !existingUser,
      email: args.email.toLowerCase(),
    };
  },
});

/**
 * Get user info by ID (for checking verification status)
 */
export const getUserInfo = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    return {
      userId: user._id,
      email: user.email,
      emailVerified: user.email_verified,
      firstName: user.first_name,
      lastName: user.last_name,
      hasCompany: !!user.company_id,
      companyId: user.company_id,
    };
  },
});

/**
 * Get user by email
 */
export const getUserByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    return user;
  },
});

/**
 * Helper query to get user by email for password reset
 */
export const getUserByEmailForReset = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) return null;

    return {
      _id: user._id,
      first_name: user.first_name,
      email: user.email,
    };
  },
});
