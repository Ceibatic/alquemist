/**
 * Module 1: User Registration & Company Creation
 * Combined registration flow - creates company and owner user in one transaction
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  hashPassword,
  validateEmail,
  validatePassword,
  formatColombianPhone,
} from "./auth";

/**
 * Register new user with company creation
 * Module 1 implementation - simplified onboarding flow
 */
export const register = mutation({
  args: {
    // User Information
    email: v.string(),
    password: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    phone: v.optional(v.string()),

    // Company Information
    companyName: v.string(),
    businessEntityType: v.string(), // S.A.S, S.A., Ltda, E.U., Persona Natural
    companyType: v.string(), // cannabis/coffee/cocoa/flowers/mixed

    // Regional Information
    country: v.string(), // Default: "CO"
    departmentCode: v.string(), // DANE division_1_code
    municipalityCode: v.string(), // DANE division_2_code

    // Organization ID (from Clerk - will be generated manually for now)
    organizationId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // 1. Validation
    if (!validateEmail(args.email)) {
      throw new Error("Formato de correo electrónico inválido");
    }

    const passwordError = validatePassword(args.password);
    if (passwordError) {
      throw new Error(passwordError);
    }

    // Check if email already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (existingUser) {
      throw new Error("El correo electrónico ya está registrado");
    }

    // 2. Get geographic location data for validation
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

    // 3. Get COMPANY_OWNER role
    const ownerRole = await ctx.db
      .query("roles")
      .withIndex("by_name", (q) => q.eq("name", "COMPANY_OWNER"))
      .first();

    if (!ownerRole) {
      throw new Error(
        "Role COMPANY_OWNER no encontrado. Ejecute seedRoles primero."
      );
    }

    // 4. Hash password
    const passwordHash = await hashPassword(args.password);

    // 5. Generate organization ID if not provided (for testing)
    const orgId =
      args.organizationId || `org_test_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // 6. Create Company
    const companyId = await ctx.db.insert("companies", {
      organization_id: orgId,
      name: args.companyName,
      company_type: args.companyType,
      business_entity_type: args.businessEntityType,
      country: args.country,
      administrative_division_1: department.division_1_name,
      administrative_division_2: municipality.division_2_name,
      regional_administrative_code: args.municipalityCode,
      city: municipality.division_2_name,

      // Localization defaults
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

    // 7. Create Owner User
    const userId = await ctx.db.insert("users", {
      company_id: companyId,
      email: args.email.toLowerCase(),
      password_hash: passwordHash,
      email_verified: false, // Will be verified in Module 2

      first_name: args.firstName,
      last_name: args.lastName,
      phone: args.phone ? formatColombianPhone(args.phone) : undefined,

      role_id: ownerRole._id,
      additional_role_ids: [],
      accessible_facility_ids: [],
      accessible_area_ids: [],

      locale: "es",
      timezone: municipality.timezone || "America/Bogota",

      mfa_enabled: false,
      failed_login_attempts: 0,

      status: "active",
      created_at: now,
      updated_at: now,
    });

    return {
      success: true,
      userId,
      companyId,
      organizationId: orgId,
      message: "Registro exitoso. Por favor verifica tu correo electrónico.",
    };
  },
});

/**
 * Check if email is available
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
 * Simple login (for testing - Clerk will handle this in production)
 */
export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (!user) {
      throw new Error("Correo electrónico o contraseña incorrectos");
    }

    // Verify password
    const { verifyPassword } = await import("./auth");
    const isValid = await verifyPassword(args.password, user.password_hash);

    if (!isValid) {
      // Increment failed login attempts
      await ctx.db.patch(user._id, {
        failed_login_attempts: user.failed_login_attempts + 1,
        updated_at: Date.now(),
      });

      throw new Error("Correo electrónico o contraseña incorrectos");
    }

    // Check if account is locked
    if (user.account_locked_until && user.account_locked_until > Date.now()) {
      throw new Error("Cuenta bloqueada temporalmente. Intenta más tarde.");
    }

    // Get company
    const company = await ctx.db.get(user.company_id);

    if (!company) {
      throw new Error("Empresa no encontrada");
    }

    // Check company status
    if (company.status !== "active") {
      throw new Error("La cuenta de la empresa está inactiva");
    }

    // Update last login
    await ctx.db.patch(user._id, {
      last_login: Date.now(),
      failed_login_attempts: 0,
      updated_at: Date.now(),
    });

    return {
      success: true,
      userId: user._id,
      companyId: company._id,
      organizationId: company.organization_id,
      user: {
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        locale: user.locale,
      },
      company: {
        name: company.name,
        subscriptionPlan: company.subscription_plan,
      },
    };
  },
});
