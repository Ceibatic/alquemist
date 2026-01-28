/**
 * Company Queries and Mutations
 * Multi-tenant company management
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * DEPRECATED: Get company by organization ID (from Clerk)
 * This function is no longer needed after switching to custom auth
 */
// export const getByOrganizationId = query({
//   args: {
//     organizationId: v.string(),
//   },
//   handler: async (ctx, args) => {
//     const company = await ctx.db
//       .query("companies")
//       .withIndex("by_organization_id", (q) =>
//         q.eq("organization_id", args.organizationId)
//       )
//       .first();
//
//     return company;
//   },
// });

/**
 * Get company by ID
 */
export const getById = query({
  args: {
    id: v.id("companies"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");
    return await ctx.db.get(args.id);
  },
});

/**
 * List all companies (admin only)
 */
export const list = query({
  args: {
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");

    let companiesQuery = ctx.db.query("companies");

    if (args.status) {
      companiesQuery = companiesQuery.filter((q) =>
        q.eq(q.field("status"), args.status)
      );
    }

    const companies = await companiesQuery
      .order("desc")
      .take(args.limit || 50);

    return companies;
  },
});

/**
 * Create a new company
 */
export const create = mutation({
  args: {
    // Required fields
    name: v.string(),
    company_type: v.string(),
    country: v.string(),
    default_locale: v.string(),
    default_currency: v.string(),
    default_timezone: v.string(),

    // Optional fields
    legal_name: v.optional(v.string()),
    tax_id: v.optional(v.string()),
    business_entity_type: v.optional(v.string()),
    business_registration_number: v.optional(v.string()),
    regional_administrative_code: v.optional(v.string()),
    administrative_division_1: v.optional(v.string()),

    primary_license_number: v.optional(v.string()),
    license_authority: v.optional(v.string()),

    primary_contact_name: v.optional(v.string()),
    primary_contact_email: v.optional(v.string()),
    primary_contact_phone: v.optional(v.string()),

    address_line1: v.optional(v.string()),
    address_line2: v.optional(v.string()),
    city: v.optional(v.string()),
    administrative_division_2: v.optional(v.string()),
    postal_code: v.optional(v.string()),

    created_by: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");

    const now = Date.now();

    const companyId = await ctx.db.insert("companies", {
      // Required fields
      name: args.name,
      company_type: args.company_type,
      country: args.country,
      default_locale: args.default_locale,
      default_currency: args.default_currency,
      default_timezone: args.default_timezone,

      // Optional fields
      legal_name: args.legal_name,
      tax_id: args.tax_id,
      business_entity_type: args.business_entity_type,
      business_registration_number: args.business_registration_number,
      regional_administrative_code: args.regional_administrative_code,
      administrative_division_1: args.administrative_division_1,

      primary_license_number: args.primary_license_number,
      license_authority: args.license_authority,
      compliance_certifications: [],

      primary_contact_name: args.primary_contact_name,
      primary_contact_email: args.primary_contact_email,
      primary_contact_phone: args.primary_contact_phone,

      address_line1: args.address_line1,
      address_line2: args.address_line2,
      city: args.city,
      administrative_division_2: args.administrative_division_2,
      postal_code: args.postal_code,

      // Defaults
      subscription_plan: "basic",
      max_facilities: 3,
      max_users: 10,
      feature_flags: {},
      status: "active",

      created_by: args.created_by,
      created_at: now,
      updated_at: now,
    });

    return companyId;
  },
});

/**
 * Update company
 */
export const update = mutation({
  args: {
    id: v.id("companies"),
    name: v.optional(v.string()),
    legal_name: v.optional(v.string()),
    tax_id: v.optional(v.string()),
    company_type: v.optional(v.string()),
    business_entity_type: v.optional(v.string()),
    primary_contact_email: v.optional(v.string()),
    primary_contact_phone: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");

    const { id, ...updates } = args;

    await ctx.db.patch(id, {
      ...updates,
      updated_at: Date.now(),
    });

    return id;
  },
});

/**
 * Get company by user ID
 */
export const getByUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user?.company_id) return null;

    return await ctx.db.get(user.company_id);
  },
});
