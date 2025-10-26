/**
 * Geographic Data Seeder
 * Populates Colombian departments and municipalities (DANE codes)
 *
 * This is a simplified dataset with major departments and municipalities.
 * Full DANE dataset contains 1000+ municipalities.
 */

import { mutation } from "./_generated/server";

export const seedColombianGeography = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Check if data already exists
    const existingData = await ctx.db
      .query("geographic_locations")
      .withIndex("by_country", (q) => q.eq("country_code", "CO"))
      .first();

    if (existingData) {
      return {
        message: "Geographic data already seeded",
        count: 0,
      };
    }

    // Colombian Departments (DANE Level 1)
    const departments = [
      {
        country_code: "CO",
        country_name: "Colombia",
        administrative_level: 1,
        division_1_code: "05",
        division_1_name: "Antioquia",
        timezone: "America/Bogota",
        latitude: 6.2518,
        longitude: -75.5636,
        is_active: true,
        created_at: now,
      },
      {
        country_code: "CO",
        country_name: "Colombia",
        administrative_level: 1,
        division_1_code: "11",
        division_1_name: "Bogotá D.C.",
        timezone: "America/Bogota",
        latitude: 4.7110,
        longitude: -74.0721,
        is_active: true,
        created_at: now,
      },
      {
        country_code: "CO",
        country_name: "Colombia",
        administrative_level: 1,
        division_1_code: "76",
        division_1_name: "Valle del Cauca",
        timezone: "America/Bogota",
        latitude: 3.4516,
        longitude: -76.5320,
        is_active: true,
        created_at: now,
      },
      {
        country_code: "CO",
        country_name: "Colombia",
        administrative_level: 1,
        division_1_code: "25",
        division_1_name: "Cundinamarca",
        timezone: "America/Bogota",
        latitude: 5.0214,
        longitude: -74.0575,
        is_active: true,
        created_at: now,
      },
      {
        country_code: "CO",
        country_name: "Colombia",
        administrative_level: 1,
        division_1_code: "17",
        division_1_name: "Caldas",
        timezone: "America/Bogota",
        latitude: 5.0689,
        longitude: -75.5174,
        is_active: true,
        created_at: now,
      },
      {
        country_code: "CO",
        country_name: "Colombia",
        administrative_level: 1,
        division_1_code: "63",
        division_1_name: "Quindío",
        timezone: "America/Bogota",
        latitude: 4.4611,
        longitude: -75.6674,
        is_active: true,
        created_at: now,
      },
      {
        country_code: "CO",
        country_name: "Colombia",
        administrative_level: 1,
        division_1_code: "66",
        division_1_name: "Risaralda",
        timezone: "America/Bogota",
        latitude: 5.3200,
        longitude: -75.9927,
        is_active: true,
        created_at: now,
      },
      {
        country_code: "CO",
        country_name: "Colombia",
        administrative_level: 1,
        division_1_code: "73",
        division_1_name: "Tolima",
        timezone: "America/Bogota",
        latitude: 4.4389,
        longitude: -75.2322,
        is_active: true,
        created_at: now,
      },
      {
        country_code: "CO",
        country_name: "Colombia",
        administrative_level: 1,
        division_1_code: "13",
        division_1_name: "Bolívar",
        timezone: "America/Bogota",
        latitude: 10.3910,
        longitude: -75.4794,
        is_active: true,
        created_at: now,
      },
      {
        country_code: "CO",
        country_name: "Colombia",
        administrative_level: 1,
        division_1_code: "08",
        division_1_name: "Atlántico",
        timezone: "America/Bogota",
        latitude: 10.9639,
        longitude: -74.7964,
        is_active: true,
        created_at: now,
      },
    ];

    // Municipalities (DANE Level 2) - Major cities only for initial seeding
    const municipalities = [
      // Antioquia
      {
        country_code: "CO",
        country_name: "Colombia",
        administrative_level: 2,
        division_1_code: "05",
        division_1_name: "Antioquia",
        division_2_code: "05001",
        division_2_name: "Medellín",
        parent_division_1_code: "05",
        latitude: 6.2476,
        longitude: -75.5658,
        timezone: "America/Bogota",
        is_active: true,
        created_at: now,
      },
      {
        country_code: "CO",
        country_name: "Colombia",
        administrative_level: 2,
        division_1_code: "05",
        division_1_name: "Antioquia",
        division_2_code: "05088",
        division_2_name: "Bello",
        parent_division_1_code: "05",
        latitude: 6.3377,
        longitude: -75.5603,
        timezone: "America/Bogota",
        is_active: true,
        created_at: now,
      },
      {
        country_code: "CO",
        country_name: "Colombia",
        administrative_level: 2,
        division_1_code: "05",
        division_1_name: "Antioquia",
        division_2_code: "05308",
        division_2_name: "Guarne",
        parent_division_1_code: "05",
        latitude: 6.2744,
        longitude: -75.4414,
        timezone: "America/Bogota",
        is_active: true,
        created_at: now,
      },
      // Bogotá D.C.
      {
        country_code: "CO",
        country_name: "Colombia",
        administrative_level: 2,
        division_1_code: "11",
        division_1_name: "Bogotá D.C.",
        division_2_code: "11001",
        division_2_name: "Bogotá D.C.",
        parent_division_1_code: "11",
        latitude: 4.7110,
        longitude: -74.0721,
        timezone: "America/Bogota",
        is_active: true,
        created_at: now,
      },
      // Valle del Cauca
      {
        country_code: "CO",
        country_name: "Colombia",
        administrative_level: 2,
        division_1_code: "76",
        division_1_name: "Valle del Cauca",
        division_2_code: "76001",
        division_2_name: "Cali",
        parent_division_1_code: "76",
        latitude: 3.4516,
        longitude: -76.5320,
        timezone: "America/Bogota",
        is_active: true,
        created_at: now,
      },
      {
        country_code: "CO",
        country_name: "Colombia",
        administrative_level: 2,
        division_1_code: "76",
        division_1_name: "Valle del Cauca",
        division_2_code: "76111",
        division_2_name: "Buenaventura",
        parent_division_1_code: "76",
        latitude: 3.8801,
        longitude: -77.0310,
        timezone: "America/Bogota",
        is_active: true,
        created_at: now,
      },
      // Cundinamarca
      {
        country_code: "CO",
        country_name: "Colombia",
        administrative_level: 2,
        division_1_code: "25",
        division_1_name: "Cundinamarca",
        division_2_code: "25001",
        division_2_name: "Agua de Dios",
        parent_division_1_code: "25",
        latitude: 4.3764,
        longitude: -74.6703,
        timezone: "America/Bogota",
        is_active: true,
        created_at: now,
      },
      {
        country_code: "CO",
        country_name: "Colombia",
        administrative_level: 2,
        division_1_code: "25",
        division_1_name: "Cundinamarca",
        division_2_code: "25175",
        division_2_name: "Chía",
        parent_division_1_code: "25",
        latitude: 4.8619,
        longitude: -74.0517,
        timezone: "America/Bogota",
        is_active: true,
        created_at: now,
      },
      // Caldas
      {
        country_code: "CO",
        country_name: "Colombia",
        administrative_level: 2,
        division_1_code: "17",
        division_1_name: "Caldas",
        division_2_code: "17001",
        division_2_name: "Manizales",
        parent_division_1_code: "17",
        latitude: 5.0689,
        longitude: -75.5174,
        timezone: "America/Bogota",
        is_active: true,
        created_at: now,
      },
      // Quindío
      {
        country_code: "CO",
        country_name: "Colombia",
        administrative_level: 2,
        division_1_code: "63",
        division_1_name: "Quindío",
        division_2_code: "63001",
        division_2_name: "Armenia",
        parent_division_1_code: "63",
        latitude: 4.5339,
        longitude: -75.6811,
        timezone: "America/Bogota",
        is_active: true,
        created_at: now,
      },
      // Risaralda
      {
        country_code: "CO",
        country_name: "Colombia",
        administrative_level: 2,
        division_1_code: "66",
        division_1_name: "Risaralda",
        division_2_code: "66001",
        division_2_name: "Pereira",
        parent_division_1_code: "66",
        latitude: 4.8133,
        longitude: -75.6961,
        timezone: "America/Bogota",
        is_active: true,
        created_at: now,
      },
      // Tolima
      {
        country_code: "CO",
        country_name: "Colombia",
        administrative_level: 2,
        division_1_code: "73",
        division_1_name: "Tolima",
        division_2_code: "73001",
        division_2_name: "Ibagué",
        parent_division_1_code: "73",
        latitude: 4.4389,
        longitude: -75.2322,
        timezone: "America/Bogota",
        is_active: true,
        created_at: now,
      },
      // Bolívar
      {
        country_code: "CO",
        country_name: "Colombia",
        administrative_level: 2,
        division_1_code: "13",
        division_1_name: "Bolívar",
        division_2_code: "13001",
        division_2_name: "Cartagena",
        parent_division_1_code: "13",
        latitude: 10.3910,
        longitude: -75.4794,
        timezone: "America/Bogota",
        is_active: true,
        created_at: now,
      },
      // Atlántico
      {
        country_code: "CO",
        country_name: "Colombia",
        administrative_level: 2,
        division_1_code: "08",
        division_1_name: "Atlántico",
        division_2_code: "08001",
        division_2_name: "Barranquilla",
        parent_division_1_code: "08",
        latitude: 10.9685,
        longitude: -74.7813,
        timezone: "America/Bogota",
        is_active: true,
        created_at: now,
      },
    ];

    // Insert all departments
    for (const dept of departments) {
      await ctx.db.insert("geographic_locations", dept);
    }

    // Insert all municipalities
    for (const muni of municipalities) {
      await ctx.db.insert("geographic_locations", muni);
    }

    return {
      message: "Geographic data seeded successfully",
      departments: departments.length,
      municipalities: municipalities.length,
      total: departments.length + municipalities.length,
    };
  },
});
