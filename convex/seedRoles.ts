/**
 * Seed System Roles
 * Creates the 5 standard system roles
 */

import { mutation } from "./_generated/server";

export const seedSystemRoles = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if roles already exist
    const existingRoles = await ctx.db.query("roles").collect();
    if (existingRoles.length > 0) {
      return { message: "Roles already exist", count: existingRoles.length };
    }

    const now = Date.now();
    const roles = [
      {
        name: "COMPANY_OWNER",
        display_name_es: "Propietario de Empresa",
        display_name_en: "Company Owner",
        description: "Full access to all company resources and settings",
        level: 1000,
        scope_level: "company",
        permissions: {
          company: ["read", "write", "delete", "manage_users", "manage_settings"],
          facilities: ["read", "write", "delete", "manage"],
          batches: ["read", "write", "delete", "manage"],
          activities: ["read", "write", "delete", "manage"],
          compliance: ["read", "write", "delete", "manage"],
          inventory: ["read", "write", "delete", "manage"],
          reports: ["read", "write", "export"],
        },
        inherits_from_role_ids: [],
        is_system_role: true,
        is_active: true,
        created_at: now,
      },
      {
        name: "FACILITY_MANAGER",
        display_name_es: "Gerente de Instalación",
        display_name_en: "Facility Manager",
        description: "Manages facility operations and production",
        level: 500,
        scope_level: "facility",
        permissions: {
          facilities: ["read", "write"],
          batches: ["read", "write", "manage"],
          activities: ["read", "write", "manage"],
          compliance: ["read", "write"],
          inventory: ["read", "write"],
          reports: ["read", "export"],
        },
        inherits_from_role_ids: [],
        is_system_role: true,
        is_active: true,
        created_at: now,
      },
      {
        name: "PRODUCTION_SUPERVISOR",
        display_name_es: "Supervisor de Producción",
        display_name_en: "Production Supervisor",
        description: "Supervises production activities and quality",
        level: 300,
        scope_level: "area",
        permissions: {
          batches: ["read", "write"],
          activities: ["read", "write", "manage"],
          compliance: ["read"],
          inventory: ["read", "write"],
          reports: ["read"],
        },
        inherits_from_role_ids: [],
        is_system_role: true,
        is_active: true,
        created_at: now,
      },
      {
        name: "WORKER",
        display_name_es: "Trabajador",
        display_name_en: "Worker",
        description: "Executes assigned activities and tasks",
        level: 100,
        scope_level: "area",
        permissions: {
          batches: ["read"],
          activities: ["read", "write"],
          inventory: ["read"],
          reports: ["read"],
        },
        inherits_from_role_ids: [],
        is_system_role: true,
        is_active: true,
        created_at: now,
      },
      {
        name: "VIEWER",
        display_name_es: "Observador",
        display_name_en: "Viewer",
        description: "Read-only access to company data",
        level: 10,
        scope_level: "company",
        permissions: {
          facilities: ["read"],
          batches: ["read"],
          activities: ["read"],
          compliance: ["read"],
          inventory: ["read"],
          reports: ["read"],
        },
        inherits_from_role_ids: [],
        is_system_role: true,
        is_active: true,
        created_at: now,
      },
    ];

    const roleIds: Array<any> = [];
    for (const role of roles) {
      const roleId = await ctx.db.insert("roles", role);
      roleIds.push(roleId);
    }

    return {
      message: "Successfully created system roles",
      count: roleIds.length,
      roles: roles.map((r, i) => ({ name: r.name, id: roleIds[i] })),
    };
  },
});
