/**
 * Complete Geographic Data Seeder for Colombia
 * Uses structured data from colombiaMunicipalitiesData.ts
 */

import { mutation } from "./_generated/server";
import { allMunicipalities } from "./colombiaMunicipalitiesData";

// Department definitions with DANE codes
const departments = [
  { code: "05", name: "Antioquia", lat: 6.2518, lon: -75.5636 },
  { code: "08", name: "Atlántico", lat: 10.9639, lon: -74.7964 },
  { code: "11", name: "Bogotá D.C.", lat: 4.7110, lon: -74.0721 },
  { code: "13", name: "Bolívar", lat: 10.3910, lon: -75.4794 },
  { code: "15", name: "Boyacá", lat: 5.4545, lon: -73.3625 },
  { code: "17", name: "Caldas", lat: 5.0689, lon: -75.5174 },
  { code: "18", name: "Caquetá", lat: 1.6145, lon: -75.6062 },
  { code: "19", name: "Cauca", lat: 2.4448, lon: -76.6147 },
  { code: "20", name: "Cesar", lat: 9.3373, lon: -73.6536 },
  { code: "23", name: "Córdoba", lat: 8.7479, lon: -75.8814 },
  { code: "25", name: "Cundinamarca", lat: 5.0214, lon: -74.0575 },
  { code: "27", name: "Chocó", lat: 5.6978, lon: -76.6611 },
  { code: "41", name: "Huila", lat: 2.5359, lon: -75.5277 },
  { code: "44", name: "La Guajira", lat: 11.5447, lon: -72.9072 },
  { code: "47", name: "Magdalena", lat: 10.4113, lon: -74.4054 },
  { code: "50", name: "Meta", lat: 3.3272, lon: -73.2847 },
  { code: "52", name: "Nariño", lat: 1.2136, lon: -77.2811 },
  { code: "54", name: "Norte de Santander", lat: 7.9465, lon: -72.8988 },
  { code: "63", name: "Quindío", lat: 4.4611, lon: -75.6674 },
  { code: "66", name: "Risaralda", lat: 5.3200, lon: -75.9927 },
  { code: "68", name: "Santander", lat: 7.1254, lon: -73.1198 },
  { code: "70", name: "Sucre", lat: 9.1547, lon: -75.3472 },
  { code: "73", name: "Tolima", lat: 4.4389, lon: -75.2322 },
  { code: "76", name: "Valle del Cauca", lat: 3.4516, lon: -76.5320 },
  { code: "81", name: "Arauca", lat: 7.0902, lon: -70.7617 },
  { code: "85", name: "Casanare", lat: 5.7589, lon: -71.5724 },
  { code: "86", name: "Putumayo", lat: 0.4945, lon: -75.5236 },
  { code: "88", name: "Archipiélago de San Andrés, Providencia y Santa Catalina", lat: 12.5847, lon: -81.7006 },
  { code: "91", name: "Amazonas", lat: -1.4442, lon: -71.6388 },
  { code: "94", name: "Guainía", lat: 2.5833, lon: -68.5167 },
  { code: "95", name: "Guaviare", lat: 2.0833, lon: -72.6389 },
  { code: "97", name: "Vaupés", lat: 0.8554, lon: -70.8138 },
  { code: "99", name: "Vichada", lat: 4.4231, lon: -69.2894 },
];

export const clearGeographicData = mutation({
  args: {},
  handler: async (ctx) => {
    // Delete all existing geographic data for Colombia
    const allRecords = await ctx.db
      .query("geographic_locations")
      .withIndex("by_country", (q) => q.eq("country_code", "CO"))
      .collect();

    for (const record of allRecords) {
      await ctx.db.delete(record._id);
    }

    return {
      message: "Cleared existing geographic data",
      deletedCount: allRecords.length,
    };
  },
});

export const seedCompleteGeographicData = mutation({
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

    let departmentCount = 0;
    let municipalityCount = 0;

    // Insert all departments
    for (const dept of departments) {
      await ctx.db.insert("geographic_locations", {
        country_code: "CO",
        country_name: "Colombia",
        administrative_level: 1,
        division_1_code: dept.code,
        division_1_name: dept.name,
        latitude: dept.lat,
        longitude: dept.lon,
        timezone: "America/Bogota",
        is_active: true,
        created_at: now,
      });
      departmentCount++;
    }

    // Insert all municipalities from our data
    for (const [deptCode, municipalities] of Object.entries(allMunicipalities)) {
      const department = departments.find((d) => d.code === deptCode);
      if (!department) {
        console.warn(`Department ${deptCode} not found in departments list`);
        continue;
      }

      for (const muni of municipalities) {
        await ctx.db.insert("geographic_locations", {
          country_code: "CO",
          country_name: "Colombia",
          administrative_level: 2,
          division_1_code: deptCode,
          division_1_name: department.name,
          division_2_code: muni.code,
          division_2_name: muni.name,
          parent_division_1_code: deptCode,
          latitude: muni.lat,
          longitude: muni.lon,
          timezone: "America/Bogota",
          is_active: true,
          created_at: now,
        });
        municipalityCount++;
      }
    }

    return {
      message: "Geographic data seeded successfully",
      departments: departmentCount,
      municipalities: municipalityCount,
      total: departmentCount + municipalityCount,
    };
  },
});
