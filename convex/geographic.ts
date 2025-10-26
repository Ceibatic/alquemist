/**
 * Geographic Location Queries
 * Regional administrative divisions (departments, municipalities)
 */

import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * Get all departments/states for a country
 */
export const getDepartments = query({
  args: {
    countryCode: v.string(), // e.g., "CO"
  },
  handler: async (ctx, args) => {
    const departments = await ctx.db
      .query("geographic_locations")
      .withIndex("by_country", (q) => q.eq("country_code", args.countryCode))
      .filter((q) => q.and(
        q.eq(q.field("administrative_level"), 1),
        q.eq(q.field("is_active"), true)
      ))
      .collect();

    return departments.sort((a, b) =>
      (a.division_1_name || "").localeCompare(b.division_1_name || "")
    );
  },
});

/**
 * Get all municipalities for a department
 */
export const getMunicipalities = query({
  args: {
    countryCode: v.string(), // e.g., "CO"
    departmentCode: v.string(), // e.g., "05" for Antioquia
  },
  handler: async (ctx, args) => {
    const municipalities = await ctx.db
      .query("geographic_locations")
      .withIndex("by_country", (q) => q.eq("country_code", args.countryCode))
      .filter((q) =>
        q.and(
          q.eq(q.field("administrative_level"), 2),
          q.eq(q.field("parent_division_1_code"), args.departmentCode),
          q.eq(q.field("is_active"), true)
        )
      )
      .collect();

    return municipalities.sort((a, b) =>
      (a.division_2_name || "").localeCompare(b.division_2_name || "")
    );
  },
});

/**
 * Get a specific location by code
 */
export const getLocationByCode = query({
  args: {
    countryCode: v.string(),
    divisionCode: v.string(), // Can be division_1_code or division_2_code
  },
  handler: async (ctx, args) => {
    // Try level 1 first (department)
    const level1 = await ctx.db
      .query("geographic_locations")
      .withIndex("by_division_1", (q) =>
        q.eq("country_code", args.countryCode).eq("division_1_code", args.divisionCode)
      )
      .filter((q) => q.eq(q.field("administrative_level"), 1))
      .first();

    if (level1) return level1;

    // Try level 2 (municipality)
    const level2 = await ctx.db
      .query("geographic_locations")
      .withIndex("by_division_2", (q) =>
        q.eq("country_code", args.countryCode).eq("division_2_code", args.divisionCode)
      )
      .first();

    return level2;
  },
});
