/**
 * Seed Crop Types
 * Creates the 4 standard crop types
 */

import { mutation } from "./_generated/server";

export const seedCropTypes = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if crop types already exist
    const existingCropTypes = await ctx.db.query("crop_types").collect();
    if (existingCropTypes.length > 0) {
      return { message: "Crop types already exist", count: existingCropTypes.length };
    }

    const now = Date.now();
    const cropTypes = [
      {
        name: "Cannabis",
        display_name_es: "Cannabis",
        display_name_en: "Cannabis",
        scientific_name: "Cannabis sativa",
        default_tracking_level: "batch",
        individual_tracking_optional: true,
        compliance_profile: {
          colombia: {
            authority: "INVIMA",
            individual_tracking_required: true,
            transport_manifest_required: true,
            phytosanitary_certificate_required: true,
            retention_years: 5,
          },
        },
        default_phases: [
          { name: "Propagation", duration_days: 14 },
          { name: "Vegetative", duration_days: 30 },
          { name: "Flowering", duration_days: 60 },
          { name: "Harvest", duration_days: 7 },
          { name: "Drying", duration_days: 14 },
          { name: "Curing", duration_days: 21 },
        ],
        environmental_requirements: {
          temperature_min: 20,
          temperature_max: 28,
          humidity_min: 40,
          humidity_max: 60,
          ph_min: 6.0,
          ph_max: 7.0,
        },
        average_cycle_days: 146,
        average_yield_per_plant: 50,
        yield_unit: "g",
        is_active: true,
        created_at: now,
      },
      {
        name: "Coffee",
        display_name_es: "Café",
        display_name_en: "Coffee",
        scientific_name: "Coffea arabica",
        default_tracking_level: "batch",
        individual_tracking_optional: false,
        compliance_profile: {
          colombia: {
            authority: "FNC",
            quality_standards_required: true,
            organic_certification_optional: true,
            retention_years: 3,
          },
        },
        default_phases: [
          { name: "Nursery", duration_days: 180 },
          { name: "Field Planting", duration_days: 365 },
          { name: "First Harvest", duration_days: 365 },
          { name: "Production", duration_days: 1825 },
        ],
        environmental_requirements: {
          temperature_min: 18,
          temperature_max: 24,
          altitude_min: 1200,
          altitude_max: 2000,
          rainfall_mm_year: 2000,
        },
        average_cycle_days: 730,
        average_yield_per_plant: 2.5,
        yield_unit: "kg",
        is_active: true,
        created_at: now,
      },
      {
        name: "Cocoa",
        display_name_es: "Cacao",
        display_name_en: "Cocoa",
        scientific_name: "Theobroma cacao",
        default_tracking_level: "batch",
        individual_tracking_optional: false,
        compliance_profile: {
          colombia: {
            authority: "ICA",
            export_certification_required: true,
            organic_certification_optional: true,
            retention_years: 3,
          },
        },
        default_phases: [
          { name: "Nursery", duration_days: 120 },
          { name: "Field Planting", duration_days: 730 },
          { name: "First Harvest", duration_days: 365 },
          { name: "Production", duration_days: 3650 },
        ],
        environmental_requirements: {
          temperature_min: 21,
          temperature_max: 32,
          altitude_max: 1000,
          humidity_min: 70,
          humidity_max: 90,
        },
        average_cycle_days: 1095,
        average_yield_per_plant: 1.5,
        yield_unit: "kg",
        is_active: true,
        created_at: now,
      },
      {
        name: "Flowers",
        display_name_es: "Flores",
        display_name_en: "Flowers",
        scientific_name: "Various species",
        default_tracking_level: "batch",
        individual_tracking_optional: false,
        compliance_profile: {
          colombia: {
            authority: "ICA",
            phytosanitary_certificate_required: true,
            export_certification_required: true,
            retention_years: 2,
          },
        },
        default_phases: [
          { name: "Propagation", duration_days: 21 },
          { name: "Growth", duration_days: 45 },
          { name: "Flowering", duration_days: 30 },
          { name: "Harvest", duration_days: 7 },
        ],
        environmental_requirements: {
          temperature_min: 15,
          temperature_max: 25,
          humidity_min: 60,
          humidity_max: 80,
        },
        average_cycle_days: 103,
        average_yield_per_plant: 15,
        yield_unit: "stems",
        is_active: true,
        created_at: now,
      },
    ];

    const cropTypeIds: Array<any> = [];
    for (const cropType of cropTypes) {
      const cropTypeId = await ctx.db.insert("crop_types", cropType);
      cropTypeIds.push(cropTypeId);
    }

    return {
      message: "Successfully created crop types",
      count: cropTypeIds.length,
      cropTypes: cropTypes.map((c, i) => ({ name: c.name, id: cropTypeIds[i] })),
    };
  },
});
