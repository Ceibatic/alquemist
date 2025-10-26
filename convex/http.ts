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
 * POST /registration/register
 * Register new user with company creation
 *
 * Body: {
 *   email, password, firstName, lastName, phone,
 *   companyName, businessEntityType, companyType,
 *   country, departmentCode, municipalityCode
 * }
 * Response: { success, userId, companyId, organizationId, message }
 */
http.route({
  path: "/registration/register",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "email", "password", "firstName", "lastName",
      "companyName", "businessEntityType", "companyType",
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
      const result = await ctx.runMutation(api.registration.register, body);

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

export default http;
