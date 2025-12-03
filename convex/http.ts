/**
 * HTTP Actions for Bubble API Integration
 * Exposes Convex functions as standard REST endpoints
 *
 * These endpoints allow Bubble's API Connector to communicate with Convex
 * without needing the Convex JavaScript SDK.
 */

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// ============================================================================
// CORS Configuration
// ============================================================================

/**
 * Handle CORS preflight requests
 */
http.route({
  path: "/*",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    });
  }),
});

// ============================================================================
// GEOGRAPHIC DATA ENDPOINTS
// ============================================================================

/**
 * GET /geographic/departments
 * Returns list of departments/states for a country
 *
 * Body: { "countryCode": "CO" }
 * Response: [{ division_1_code, division_1_name, timezone, ... }]
 */
http.route({
  path: "/geographic/departments",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const { countryCode } = await request.json();

    const departments = await ctx.runQuery(api.geographic.getDepartments, {
      countryCode: countryCode || "CO",
    });

    return new Response(JSON.stringify(departments), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }),
});

/**
 * GET /geographic/municipalities
 * Returns list of municipalities for a department
 *
 * Body: { "countryCode": "CO", "departmentCode": "05" }
 * Response: [{ division_2_code, division_2_name, parent_division_1_code, ... }]
 */
http.route({
  path: "/geographic/municipalities",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const { countryCode, departmentCode } = await request.json();

    if (!countryCode || !departmentCode) {
      return new Response(
        JSON.stringify({
          error: "countryCode and departmentCode are required"
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    const municipalities = await ctx.runQuery(api.geographic.getMunicipalities, {
      countryCode,
      departmentCode,
    });

    return new Response(JSON.stringify(municipalities), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }),
});

// ============================================================================
// CROP TYPES ENDPOINTS
// ============================================================================

/**
 * POST /crop-types/list
 * Returns list of available crop types (Cannabis, Coffee, Cocoa, Flowers)
 *
 * Body: { "includeInactive": false } (optional)
 * Response: [{ id, name, display_name_es, category, default_units, ... }]
 */
http.route({
  path: "/crop-types/list",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();

    const cropTypes = await ctx.runQuery(api.crops.getCropTypes, {
      includeInactive: body?.includeInactive || false,
    });

    return new Response(JSON.stringify(cropTypes), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }),
});

// ============================================================================
// REGISTRATION ENDPOINTS
// ============================================================================

/**
 * POST /registration/check-email
 * Check if email is available for registration
 *
 * Body: { "email": "user@example.com" }
 * Response: { "available": true, "email": "user@example.com" }
 */
http.route({
  path: "/registration/check-email",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const { email } = await request.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "email is required" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    const result = await ctx.runQuery(api.registration.checkEmailAvailability, {
      email,
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }),
});

/**
 * POST /registration/register-step-1
 * Step 1: Create user account only (no company yet)
 *
 * IMPORTANT: Email is now sent by Bubble (not Convex)
 * This endpoint returns email content for Bubble to send via native action
 *
 * Body: {
 *   email, password, firstName, lastName, phone (optional)
 * }
 * Response: {
 *   success, userId, token, message, verificationToken,
 *   emailHtml, emailText, emailSubject
 * }
 */
http.route({
  path: "/registration/register-step-1",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ["email", "password", "firstName", "lastName"];
    const missingFields = requiredFields.filter(field => !body[field]);

    if (missingFields.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Campos requeridos faltantes: ${missingFields.join(", ")}`
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    try {
      const result = await ctx.runAction(api.registration.registerUserStep1, body);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

/**
 * POST /registration/verify-email
 * Verify email token and mark email as verified
 *
 * Body: { token }
 * Response: { success, message, userId }
 */
http.route({
  path: "/registration/verify-email",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const { token } = await request.json();

    if (!token) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Token es requerido"
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    try {
      const result = await ctx.runMutation(api.emailVerification.verifyEmailToken, {
        token,
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

/**
 * POST /registration/resend-verification
 * Resend verification email with new token
 *
 * Body: { email }
 * Response: { success, email, token, emailHtml, emailText, emailSubject, message }
 */
http.route({
  path: "/registration/resend-verification",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Email es requerido"
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    try {
      const result = await ctx.runAction(api.emailVerification.resendVerificationEmail, {
        email,
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

/**
 * POST /registration/register-step-2
 * Step 2: Create company and complete registration
 *
 * Body: {
 *   userId, companyName, businessEntityType, companyType,
 *   country, departmentCode, municipalityCode
 * }
 * Response: { success, userId, companyId, organizationId, message }
 */
http.route({
  path: "/registration/register-step-2",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "userId", "companyName", "businessEntityType", "companyType",
      "country", "departmentCode", "municipalityCode"
    ];

    const missingFields = requiredFields.filter(field => !body[field]);

    if (missingFields.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Campos requeridos faltantes: ${missingFields.join(", ")}`
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    try {
      const result = await ctx.runMutation(api.registration.registerCompanyStep2, body);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

/**
 * POST /registration/login
 * Simple login for testing (Clerk will replace in production)
 *
 * Body: { "email": "user@example.com", "password": "password" }
 * Response: { success, userId, companyId, user, company }
 */
http.route({
  path: "/registration/login",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const { email, password } = await request.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "email y password son requeridos"
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    try {
      const result = await ctx.runMutation(api.registration.login, {
        email,
        password,
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

// ============================================================================
// AUTO-LOGIN AFTER SIGNUP (Module 1 + Module 2 Complete)
// ============================================================================

/**
 * POST /registration/auto-login
 * Auto-login user after signup complete
 * Creates Clerk user and returns session info
 *
 * Body: {
 *   userId,
 *   email,
 *   password,
 *   firstName,
 *   lastName,
 *   companyName
 * }
 *
 * Response: {
 *   success: true,
 *   userId,
 *   clerkUserId,
 *   sessionId,
 *   companyId,
 *   redirectUrl: "/dashboard"
 * }
 */
http.route({
  path: "/registration/auto-login",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();

      // Validate required fields
      if (
        !body.userId ||
        !body.email ||
        !body.password ||
        !body.firstName ||
        !body.lastName ||
        !body.companyName
      ) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Campos requeridos faltantes",
          }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      }

      // DEPRECATED: This Clerk-specific endpoint is no longer supported
      // Use the standard register + login flow instead
      return new Response(
        JSON.stringify({
          success: false,
          error: "This endpoint is deprecated. Please use /api/v1/auth/register-step1 and /api/v1/auth/login instead.",
        }),
        {
          status: 410, // Gone
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

// ============================================================================
// MODULE 3: FACILITY ENDPOINTS
// ============================================================================

/**
 * POST /facilities/create
 * Create a new facility
 */
http.route({
  path: "/facilities/create",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();

      const result = await ctx.runMutation(api.facilities.create, body);

      return new Response(JSON.stringify({ success: true, facilityId: result }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

/**
 * POST /facilities/get-by-company
 * Get facilities for a company
 */
http.route({
  path: "/facilities/get-by-company",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();

      const result = await ctx.runQuery(api.facilities.list, body);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

/**
 * POST /facilities/check-license
 * Check if license number is available
 */
http.route({
  path: "/facilities/check-license",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const { licenseNumber } = await request.json();

      const result = await ctx.runQuery(api.facilities.checkLicenseAvailability, {
        licenseNumber,
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

/**
 * POST /facilities/update
 * Update facility
 */
http.route({
  path: "/facilities/update",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();

      const result = await ctx.runMutation(api.facilities.update, body);

      return new Response(JSON.stringify({ success: true, facilityId: result }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

/**
 * POST /facilities/delete
 * Delete (soft delete) facility
 */
http.route({
  path: "/facilities/delete",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();

      const result = await ctx.runMutation(api.facilities.remove, body);

      return new Response(JSON.stringify({ success: true, facilityId: result }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

/**
 * POST /facilities/link-cultivars
 * Link cultivars to a facility
 */
http.route({
  path: "/facilities/link-cultivars",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();

      const result = await ctx.runMutation(api.facilities.linkCultivars, body);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

// ============================================================================
// MODULE 4: AREA ENDPOINTS
// ============================================================================

/**
 * POST /areas/create
 * Create a new area
 */
http.route({
  path: "/areas/create",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();

      const result = await ctx.runMutation(api.areas.create, body);

      return new Response(JSON.stringify({ success: true, areaId: result }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

/**
 * POST /areas/get-by-facility
 * Get areas for a facility
 */
http.route({
  path: "/areas/get-by-facility",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();

      const result = await ctx.runQuery(api.areas.getByFacility, body);

      return new Response(JSON.stringify({ areas: result }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

/**
 * POST /areas/update
 * Update area
 */
http.route({
  path: "/areas/update",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();

      const result = await ctx.runMutation(api.areas.update, body);

      return new Response(JSON.stringify({ success: true, areaId: result }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

/**
 * POST /areas/delete
 * Delete (soft delete) area
 */
http.route({
  path: "/areas/delete",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();

      const result = await ctx.runMutation(api.areas.remove, body);

      return new Response(JSON.stringify({ success: true, areaId: result }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

/**
 * POST /areas/get-by-id
 * Get area by ID
 */
http.route({
  path: "/areas/get-by-id",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const result = await ctx.runQuery(api.areas.get, body);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

// ============================================================================
// MODULE 5: CROP & CULTIVAR ENDPOINTS
// ============================================================================

/**
 * POST /crops/get-types
 * Get all crop types
 */
http.route({
  path: "/crops/get-types",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();

      const result = await ctx.runQuery(api.crops.getCropTypes, body || {});

      return new Response(JSON.stringify({ cropTypes: result }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

/**
 * POST /cultivars/get-by-crop
 * Get cultivars for a crop type
 */
http.route({
  path: "/cultivars/get-by-crop",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();

      const result = await ctx.runQuery(api.cultivars.getByCrop, body);

      return new Response(JSON.stringify({ cultivars: result }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

/**
 * POST /cultivars/create
 * Create custom cultivar
 */
http.route({
  path: "/cultivars/create",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();

      const result = await ctx.runMutation(api.cultivars.create, body);

      return new Response(JSON.stringify({ success: true, cultivarId: result }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

/**
 * POST /cultivars/get-by-facility
 * Get cultivars linked to a facility
 */
http.route({
  path: "/cultivars/get-by-facility",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const result = await ctx.runQuery(api.cultivars.getByFacility, body);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

/**
 * POST /cultivars/get-by-id
 * Get cultivar by ID
 */
http.route({
  path: "/cultivars/get-by-id",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const result = await ctx.runQuery(api.cultivars.get, body);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

/**
 * POST /cultivars/update
 * Update cultivar details
 */
http.route({
  path: "/cultivars/update",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const result = await ctx.runMutation(api.cultivars.update, body);

      return new Response(JSON.stringify({ success: true, cultivarId: result }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

/**
 * POST /cultivars/delete
 * Delete a cultivar (soft delete)
 */
http.route({
  path: "/cultivars/delete",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const result = await ctx.runMutation(api.cultivars.remove, body);

      return new Response(JSON.stringify({ success: true, cultivarId: result }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

// ============================================================================
// MODULE 6: SUPPLIER ENDPOINTS
// ============================================================================

/**
 * POST /suppliers/create
 * Create a new supplier
 */
http.route({
  path: "/suppliers/create",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();

      const result = await ctx.runMutation(api.suppliers.create, body);

      return new Response(JSON.stringify({ success: true, supplierId: result }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

/**
 * POST /suppliers/get-by-company
 * Get suppliers for a company
 */
http.route({
  path: "/suppliers/get-by-company",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();

      const result = await ctx.runQuery(api.suppliers.getByCompany, body);

      return new Response(JSON.stringify({ suppliers: result }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

/**
 * POST /suppliers/get-by-id
 * Get supplier by ID
 */
http.route({
  path: "/suppliers/get-by-id",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const result = await ctx.runQuery(api.suppliers.get, body);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

/**
 * POST /suppliers/update
 * Update supplier
 */
http.route({
  path: "/suppliers/update",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();

      const result = await ctx.runMutation(api.suppliers.update, body);

      return new Response(JSON.stringify({ success: true, supplierId: result }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

/**
 * POST /suppliers/delete
 * Delete (soft delete) supplier
 */
http.route({
  path: "/suppliers/delete",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();

      const result = await ctx.runMutation(api.suppliers.remove, body);

      return new Response(JSON.stringify({ success: true, supplierId: result }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

// ============================================================================
// MODULE 19: INVENTORY MANAGEMENT ENDPOINTS
// ============================================================================

/**
 * POST /inventory/create
 * Create a new inventory item
 */
http.route({
  path: "/inventory/create",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();

      const result = await ctx.runMutation(api.inventory.create, body);

      return new Response(JSON.stringify({ success: true, inventoryId: result }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

/**
 * POST /inventory/get-by-facility
 * Get inventory items for a facility
 */
http.route({
  path: "/inventory/get-by-facility",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();

      const result = await ctx.runQuery(api.inventory.getByFacility, body);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

/**
 * POST /inventory/get-by-category
 * Get inventory items by category
 */
http.route({
  path: "/inventory/get-by-category",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();

      const result = await ctx.runQuery(api.inventory.getByCategory, body);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

/**
 * POST /inventory/get-by-id
 * Get single inventory item by ID
 */
http.route({
  path: "/inventory/get-by-id",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();

      const result = await ctx.runQuery(api.inventory.getById, body);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

/**
 * POST /inventory/update
 * Update inventory item details
 */
http.route({
  path: "/inventory/update",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();

      const result = await ctx.runMutation(api.inventory.update, body);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

/**
 * POST /inventory/adjust-stock
 * Adjust stock levels (add/consume)
 */
http.route({
  path: "/inventory/adjust-stock",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();

      const result = await ctx.runMutation(api.inventory.adjustStock, body);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

/**
 * POST /inventory/low-stock
 * Get items below reorder point
 */
http.route({
  path: "/inventory/low-stock",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();

      const result = await ctx.runQuery(api.inventory.getLowStock, body);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

/**
 * POST /inventory/delete
 * Delete (soft delete) inventory item
 */
http.route({
  path: "/inventory/delete",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();

      const result = await ctx.runMutation(api.inventory.remove, body);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

// ============================================================================
// MODULE 4: USER ROLE ASSIGNMENT ENDPOINTS
// ============================================================================

/**
 * POST /users/assign-role
 * Assign role to user (during onboarding or later)
 */
http.route({
  path: "/users/assign-role",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();

      const result = await ctx.runMutation(api.users.assignUserRole, body);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

/**
 * POST /users/get-by-company
 * Get all users in a company
 */
http.route({
  path: "/users/get-by-company",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();

      const result = await ctx.runQuery(api.users.getUsersByCompany, body);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

/**
 * POST /users/update-role
 * Update user's role or facility access
 */
http.route({
  path: "/users/update-role",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();

      const result = await ctx.runMutation(api.users.updateUserRole, body);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

/**
 * POST /users/deactivate
 * Deactivate user (soft delete)
 */
http.route({
  path: "/users/deactivate",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();

      const result = await ctx.runMutation(api.users.deactivateUser, body);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

// ============================================================================
// MODULE 5: DASHBOARD HOME ENDPOINTS
// ============================================================================

/**
 * POST /dashboard/summary
 * Get dashboard summary metrics
 */
http.route({
  path: "/dashboard/summary",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();

      const result = await ctx.runQuery(api.dashboard.getDashboardSummary, body);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

/**
 * POST /dashboard/recent-activities
 * Get recent/upcoming activities for dashboard
 */
http.route({
  path: "/dashboard/recent-activities",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();

      const result = await ctx.runQuery(api.dashboard.getRecentActivities, body);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

/**
 * POST /dashboard/alerts
 * Get active alerts and notifications
 */
http.route({
  path: "/dashboard/alerts",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();

      const result = await ctx.runQuery(api.dashboard.getActiveAlerts, body);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

// ============================================================================
// MODULE 20: FACILITY SETTINGS ENDPOINTS
// ============================================================================

/**
 * POST /facilities/settings/get
 * Get facility settings
 */
http.route({
  path: "/facilities/settings/get",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();

      const result = await ctx.runQuery(api.facilities.getSettings, body);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

/**
 * POST /facilities/settings/update
 * Update facility settings
 */
http.route({
  path: "/facilities/settings/update",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();

      const result = await ctx.runMutation(api.facilities.updateSettings, body);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

// ============================================================================
// MODULE 21: ACCOUNT SETTINGS ENDPOINTS
// ============================================================================

/**
 * POST /users/settings/get
 * Get account settings
 */
http.route({
  path: "/users/settings/get",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();

      const result = await ctx.runQuery(api.users.getSettings, body);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

/**
 * POST /users/settings/update
 * Update account settings
 */
http.route({
  path: "/users/settings/update",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();

      const result = await ctx.runMutation(api.users.updateSettings, body);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

// ============================================================================
// PHASE 2: MODULE 17 - OTHER CROPS MANAGEMENT
// ============================================================================

/**
 * POST /other-crops/create
 * Create new other crop entry
 */
http.route({
  path: "/other-crops/create",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const result = await ctx.runMutation(api.otherCrops.create, body);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

/**
 * POST /other-crops/get-by-facility
 * Get other crops for a facility
 */
http.route({
  path: "/other-crops/get-by-facility",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const result = await ctx.runQuery(api.otherCrops.getByFacility, body);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

/**
 * POST /other-crops/get-by-id
 * Get single other crop by ID
 */
http.route({
  path: "/other-crops/get-by-id",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const result = await ctx.runQuery(api.otherCrops.getById, body);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

/**
 * POST /other-crops/update
 * Update other crop details
 */
http.route({
  path: "/other-crops/update",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const result = await ctx.runMutation(api.otherCrops.update, body);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

/**
 * POST /other-crops/delete
 * Delete other crop (soft delete)
 */
http.route({
  path: "/other-crops/delete",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const result = await ctx.runMutation(api.otherCrops.remove, body);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

// ============================================================================
// DATABASE SEEDING (DEVELOPMENT/ADMIN)
// ============================================================================

/**
 * POST /seed/roles
 * Seed system roles
 */
http.route({
  path: "/seed/roles",
  method: "POST",
  handler: httpAction(async (ctx) => {
    try {
      const result = await ctx.runMutation(api.seed.seedRoles, {});

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

/**
 * POST /seed/crop-types
 * Seed crop types
 */
http.route({
  path: "/seed/crop-types",
  method: "POST",
  handler: httpAction(async (ctx) => {
    try {
      const result = await ctx.runMutation(api.seed.seedCropTypes, {});

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

// ============================================================================
// HEALTH CHECK
// ============================================================================

/**
 * GET /health
 * Simple health check endpoint
 */
http.route({
  path: "/health",
  method: "GET",
  handler: httpAction(async () => {
    return new Response(
      JSON.stringify({
        status: "ok",
        timestamp: Date.now(),
        service: "Alquemist API"
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }),
});

// ============================================================================
// CLEANUP ENDPOINT (Development Only)
// ============================================================================

/**
 * POST /cleanup/delete-user
 * Delete a user and all related data by email
 * WARNING: Use only for development/testing
 *
 * Body: { "email": "user@example.com" }
 */
http.route({
  path: "/cleanup/delete-user",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const email = body.email?.toLowerCase();

      if (!email) {
        return new Response(
          JSON.stringify({ success: false, error: "Email is required" }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      }

      // Find user by email
      const userDoc = await ctx.runQuery(api.registration.getUserByEmail, { email });

      if (!userDoc) {
        return new Response(
          JSON.stringify({
            success: false,
            message: `User with email ${email} not found`,
          }),
          {
            status: 404,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      }

      // Get full user info
      const user = await ctx.runQuery(api.registration.getUserInfo, { userId: userDoc._id });

      // Note: Email verification tokens are now stored in user record and auto-cleaned on verification
      // Note: Full user deletion requires additional implementation
      // For now, return user info for manual deletion
      return new Response(
        JSON.stringify({
          success: true,
          message: `Found user ${email}. Please use Convex dashboard to delete manually.`,
          userId: user.userId,
          email: user.email,
          companyId: user.companyId,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    } catch (error: any) {
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message || "Unknown error",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

// ============================================================================
// CONTEXT DATA ENDPOINTS (Persistent Data for Bubble State)
// ============================================================================

/**
 * GET /companies/get
 * Get complete company data for context persistence
 * Used to populate CurrentContext.company in Bubble
 */
http.route({
  path: "/companies/get",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const { companyId } = await request.json();

    if (!companyId) {
      return new Response(
        JSON.stringify({
          error: "companyId is required",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    const company = await ctx.runQuery(api.companies.getById, {
      id: companyId,
    });

    if (!company) {
      return new Response(
        JSON.stringify({
          error: "Company not found",
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    return new Response(JSON.stringify(company), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }),
});

/**
 * GET /facilities/get
 * Get complete facility data for context persistence
 * Used to populate CurrentContext.facility in Bubble
 */
http.route({
  path: "/facilities/get",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const { facilityId, companyId } = await request.json();

    if (!facilityId || !companyId) {
      return new Response(
        JSON.stringify({
          error: "facilityId and companyId are required",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    const facility = await ctx.runQuery(api.facilities.get, {
      id: facilityId,
      companyId: companyId,
    });

    if (!facility) {
      return new Response(
        JSON.stringify({
          error: "Facility not found",
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    return new Response(JSON.stringify(facility), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }),
});

// ============================================================================
// USER ENDPOINTS
// ============================================================================

/**
 * POST /users/set-current-facility
 * Set the user's current/primary facility
 * Body: { userId, facilityId }
 */
http.route({
  path: "/users/set-current-facility",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const { userId, facilityId } = await request.json();

      if (!userId || !facilityId) {
        return new Response(
          JSON.stringify({ success: false, error: "userId and facilityId are required" }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      }

      const result = await ctx.runMutation(api.users.setCurrentFacility, {
        userId,
        facilityId,
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }),
});

export default http;
