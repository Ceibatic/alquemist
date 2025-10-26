/**
 * Module 1: Two-Step Registration
 * Step 1: Create user + send verification email
 * Step 2: Verify email + create company
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  hashPassword,
  validateEmail,
  validatePassword,
  formatColombianPhone,
} from "./auth";
import { api } from "./_generated/api";

// ============================================================================
// STEP 1: USER REGISTRATION (Without Company)
// ============================================================================

/**
 * Step 1: Register user only (no company yet)
 * - Create user record
 * - Send verification email
 * - Return userId for next step
 */
export const registerUserStep1 = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<any> => {
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

    // 2. Get default role (USER role - not COMPANY_OWNER yet)
    const userRole = await ctx.db
      .query("roles")
      .withIndex("by_name", (q) => q.eq("name", "COMPANY_OWNER"))
      .first();

    if (!userRole) {
      throw new Error("Role COMPANY_OWNER no encontrado. Ejecute seedRoles primero.");
    }

    // 3. Hash password
    const passwordHash = await hashPassword(args.password);

    // 4. Create user WITHOUT company
    const userId = await ctx.db.insert("users", {
      company_id: undefined, // No company yet - will be set in step 2
      email: args.email.toLowerCase(),
      password_hash: passwordHash,
      email_verified: false,
      email_verified_at: undefined,

      first_name: args.firstName,
      last_name: args.lastName,
      phone: args.phone ? formatColombianPhone(args.phone) : undefined,

      role_id: userRole._id,
      additional_role_ids: [],
      accessible_facility_ids: [],
      accessible_area_ids: [],

      locale: "es",
      timezone: "America/Bogota", // Default - will be updated with company in step 2

      mfa_enabled: false,
      failed_login_attempts: 0,

      status: "active",
      created_at: now,
      updated_at: now,
    });

    // 5. Send verification email
    const emailResult: any = await ctx.runMutation(
      api.emailVerification.sendVerificationEmail,
      {
        userId,
        email: args.email.toLowerCase(),
      }
    );

    return {
      success: true,
      userId,
      email: args.email.toLowerCase(),
      message: "Cuenta creada. Por favor verifica tu correo electrónico.",
      verificationSent: emailResult.success,
      // For testing: include token
      token: emailResult.token,
    };
  },
});

// ============================================================================
// STEP 2: COMPANY CREATION (After Email Verification)
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

    // 3. Generate organization ID (for Clerk later)
    const organizationId = `org_test_${Date.now()}_${Math.random()
      .toString(36)
      .substring(7)}`;

    // 4. Create company
    const companyId = await ctx.db.insert("companies", {
      organization_id: organizationId,
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

    // 5. Update user with company reference and timezone
    await ctx.db.patch(args.userId, {
      company_id: companyId,
      timezone: municipality.timezone || "America/Bogota",
      updated_at: now,
    });

    return {
      success: true,
      userId: args.userId,
      companyId,
      organizationId,
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
 * Simple login (for testing - Clerk will replace in production)
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

    // Check if email verified
    if (!user.email_verified) {
      throw new Error("Debes verificar tu email antes de iniciar sesión");
    }

    // Check if has company
    if (!user.company_id) {
      throw new Error("Completa el paso 2 de registro para acceder");
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
