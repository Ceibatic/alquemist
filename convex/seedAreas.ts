/**
 * Areas Seed Script
 * Seeds sample areas for testing Phase 2 - Areas Module
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Get current data to help with seeding
 */
export const getSeedData = query({
  args: {},
  handler: async (ctx) => {
    const facilities = await ctx.db.query("facilities").collect();
    const cropTypes = await ctx.db.query("crop_types").collect();

    return {
      facilities: facilities.map((f) => ({
        _id: f._id,
        name: f.name,
        company_id: f.company_id,
      })),
      cropTypes: cropTypes.map((ct) => ({
        _id: ct._id,
        name: ct.name,
      })),
    };
  },
});

/**
 * Seed sample areas for a facility
 * Creates a variety of area types for testing
 */
export const seedAreas = mutation({
  args: {
    facilityId: v.id("facilities"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Check if areas already exist for this facility
    const existingAreas = await ctx.db
      .query("areas")
      .withIndex("by_facility", (q) => q.eq("facility_id", args.facilityId))
      .collect();

    if (existingAreas.length > 0) {
      return {
        success: true,
        message: `Areas already exist for this facility (${existingAreas.length} found)`,
        count: existingAreas.length,
      };
    }

    // Get crop types to link to areas
    const cropTypes = await ctx.db.query("crop_types").collect();
    const cannabisType = cropTypes.find((ct) => ct.name === "Cannabis");
    const coffeeType = cropTypes.find((ct) => ct.name === "Coffee");
    const flowersType = cropTypes.find((ct) => ct.name === "Flowers");

    if (!cannabisType) {
      return {
        success: false,
        message: "Cannabis crop type not found. Please run seedCropTypes first.",
        count: 0,
      };
    }

    // Sample areas with realistic data for a cannabis/mixed facility
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sampleAreas: any[] = [
      // Propagation Areas
      {
        facility_id: args.facilityId,
        name: "Sala de Propagación A",
        area_type: "propagation",
        compatible_crop_type_ids: [cannabisType._id],
        current_crop_type_id: cannabisType._id,
        length_meters: 10,
        width_meters: 5,
        height_meters: 3,
        total_area_m2: 50,
        usable_area_m2: 45,
        capacity_configurations: { max_capacity: 500 },
        current_occupancy: 320,
        reserved_capacity: 50,
        climate_controlled: true,
        lighting_controlled: true,
        irrigation_system: true,
        environmental_specs: {
          temperature_min: 22,
          temperature_max: 26,
          humidity_min: 70,
          humidity_max: 85,
          light_hours: 18,
          ph_min: 5.8,
          ph_max: 6.2,
        },
        equipment_list: [
          { name: "Humidificador", quantity: 2 },
          { name: "Ventilador oscilante", quantity: 4 },
          { name: "Lámparas LED", quantity: 8 },
        ],
        status: "active",
        notes: "Sala principal de clonación con alta tasa de éxito (95%)",
        created_at: now - 30 * 24 * 60 * 60 * 1000, // 30 days ago
        updated_at: now,
      },
      // Vegetative Areas
      {
        facility_id: args.facilityId,
        name: "Cuarto Vegetativo B",
        area_type: "vegetative",
        compatible_crop_type_ids: [cannabisType._id],
        current_crop_type_id: cannabisType._id,
        length_meters: 15,
        width_meters: 8,
        height_meters: 3.5,
        total_area_m2: 120,
        usable_area_m2: 100,
        capacity_configurations: { max_capacity: 800 },
        current_occupancy: 650,
        reserved_capacity: 100,
        climate_controlled: true,
        lighting_controlled: true,
        irrigation_system: true,
        environmental_specs: {
          temperature_min: 22,
          temperature_max: 28,
          humidity_min: 55,
          humidity_max: 70,
          light_hours: 18,
          ph_min: 6.0,
          ph_max: 6.5,
        },
        equipment_list: [
          { name: "Sistema de riego automatizado", quantity: 1 },
          { name: "Extractores de aire", quantity: 4 },
          { name: "Lámparas HPS 600W", quantity: 12 },
        ],
        status: "active",
        notes: "Área de crecimiento vegetativo con ciclo de 4 semanas",
        created_at: now - 60 * 24 * 60 * 60 * 1000,
        updated_at: now,
      },
      {
        facility_id: args.facilityId,
        name: "Sala Vegetativa C",
        area_type: "vegetative",
        compatible_crop_type_ids: [cannabisType._id],
        current_crop_type_id: undefined,
        length_meters: 10,
        width_meters: 10,
        height_meters: 3,
        total_area_m2: 100,
        usable_area_m2: 85,
        capacity_configurations: { max_capacity: 600 },
        current_occupancy: 0,
        reserved_capacity: 0,
        climate_controlled: true,
        lighting_controlled: true,
        irrigation_system: false,
        environmental_specs: {
          temperature_min: 20,
          temperature_max: 26,
          humidity_min: 50,
          humidity_max: 65,
          light_hours: 18,
        },
        equipment_list: [
          { name: "Lámparas LED 400W", quantity: 10 },
          { name: "Deshumidificador", quantity: 2 },
        ],
        status: "maintenance",
        notes: "En mantenimiento - actualización de sistema de ventilación",
        created_at: now - 90 * 24 * 60 * 60 * 1000,
        updated_at: now - 5 * 24 * 60 * 60 * 1000,
      },
      // Flowering Areas
      {
        facility_id: args.facilityId,
        name: "Invernadero de Floración 1",
        area_type: "flowering",
        compatible_crop_type_ids: [cannabisType._id],
        current_crop_type_id: cannabisType._id,
        length_meters: 20,
        width_meters: 10,
        height_meters: 4,
        total_area_m2: 200,
        usable_area_m2: 180,
        capacity_configurations: { max_capacity: 600 },
        current_occupancy: 450,
        reserved_capacity: 50,
        climate_controlled: true,
        lighting_controlled: true,
        irrigation_system: true,
        environmental_specs: {
          temperature_min: 20,
          temperature_max: 26,
          humidity_min: 40,
          humidity_max: 55,
          light_hours: 12,
          ph_min: 6.0,
          ph_max: 6.8,
        },
        equipment_list: [
          { name: "Sistema de riego por goteo", quantity: 1 },
          { name: "Controlador de CO2", quantity: 1 },
          { name: "Lámparas HPS 1000W", quantity: 20 },
          { name: "Extractor industrial", quantity: 2 },
        ],
        status: "active",
        notes: "Invernadero principal con ciclo 12/12 para floración óptima",
        created_at: now - 120 * 24 * 60 * 60 * 1000,
        updated_at: now,
      },
      {
        facility_id: args.facilityId,
        name: "Sala de Floración 2",
        area_type: "flowering",
        compatible_crop_type_ids: [cannabisType._id],
        current_crop_type_id: cannabisType._id,
        length_meters: 12,
        width_meters: 8,
        height_meters: 3.5,
        total_area_m2: 96,
        usable_area_m2: 80,
        capacity_configurations: { max_capacity: 300 },
        current_occupancy: 280,
        reserved_capacity: 20,
        climate_controlled: true,
        lighting_controlled: true,
        irrigation_system: true,
        environmental_specs: {
          temperature_min: 21,
          temperature_max: 25,
          humidity_min: 45,
          humidity_max: 55,
          light_hours: 12,
          ph_min: 6.2,
          ph_max: 6.8,
        },
        equipment_list: [
          { name: "Lámparas LED espectro completo", quantity: 10 },
          { name: "Sistema de filtración de aire", quantity: 1 },
        ],
        status: "active",
        notes: "Sala secundaria de floración con iluminación LED de última generación",
        created_at: now - 45 * 24 * 60 * 60 * 1000,
        updated_at: now,
      },
      // Drying Areas
      {
        facility_id: args.facilityId,
        name: "Cuarto de Secado 1",
        area_type: "drying",
        compatible_crop_type_ids: [cannabisType._id],
        current_crop_type_id: cannabisType._id,
        length_meters: 8,
        width_meters: 5,
        height_meters: 3,
        total_area_m2: 40,
        usable_area_m2: 35,
        capacity_configurations: { max_capacity: 200 },
        current_occupancy: 180,
        reserved_capacity: 0,
        climate_controlled: true,
        lighting_controlled: false,
        irrigation_system: false,
        environmental_specs: {
          temperature_min: 18,
          temperature_max: 21,
          humidity_min: 55,
          humidity_max: 65,
        },
        equipment_list: [
          { name: "Deshumidificador industrial", quantity: 2 },
          { name: "Ventilador de techo", quantity: 4 },
          { name: "Termohigrómetro digital", quantity: 2 },
        ],
        status: "active",
        notes: "Cuarto de secado oscuro con control preciso de humedad para preservar terpenos",
        created_at: now - 100 * 24 * 60 * 60 * 1000,
        updated_at: now,
      },
      // Curing Area
      {
        facility_id: args.facilityId,
        name: "Sala de Curado",
        area_type: "curing",
        compatible_crop_type_ids: [cannabisType._id],
        current_crop_type_id: cannabisType._id,
        length_meters: 6,
        width_meters: 4,
        height_meters: 2.8,
        total_area_m2: 24,
        usable_area_m2: 22,
        capacity_configurations: { max_capacity: 150 },
        current_occupancy: 85,
        reserved_capacity: 30,
        climate_controlled: true,
        lighting_controlled: false,
        irrigation_system: false,
        environmental_specs: {
          temperature_min: 16,
          temperature_max: 20,
          humidity_min: 58,
          humidity_max: 65,
        },
        equipment_list: [
          { name: "Frascos de curado", quantity: 200 },
          { name: "Boveda 62%", quantity: 300 },
          { name: "Sellador al vacío", quantity: 1 },
        ],
        status: "active",
        notes: "Área controlada para curado lento de 4-6 semanas",
        created_at: now - 80 * 24 * 60 * 60 * 1000,
        updated_at: now,
      },
      // Storage Area
      {
        facility_id: args.facilityId,
        name: "Almacén de Producto Terminado",
        area_type: "storage",
        compatible_crop_type_ids: [cannabisType._id],
        current_crop_type_id: undefined,
        length_meters: 10,
        width_meters: 6,
        height_meters: 3,
        total_area_m2: 60,
        usable_area_m2: 55,
        capacity_configurations: { max_capacity: 500 },
        current_occupancy: 220,
        reserved_capacity: 100,
        climate_controlled: true,
        lighting_controlled: false,
        irrigation_system: false,
        environmental_specs: {
          temperature_min: 15,
          temperature_max: 20,
          humidity_min: 55,
          humidity_max: 62,
        },
        equipment_list: [
          { name: "Estanterías metálicas", quantity: 10 },
          { name: "Sistema de seguridad", quantity: 1 },
          { name: "Caja fuerte", quantity: 2 },
        ],
        status: "active",
        notes: "Almacén seguro para producto terminado y empaquetado",
        created_at: now - 150 * 24 * 60 * 60 * 1000,
        updated_at: now,
      },
    ];

    // Optionally add flower areas if the crop type exists
    if (flowersType) {
      sampleAreas.push({
        facility_id: args.facilityId,
        name: "Invernadero de Flores Ornamentales",
        area_type: "flowering",
        compatible_crop_type_ids: [flowersType._id],
        current_crop_type_id: flowersType._id,
        length_meters: 25,
        width_meters: 15,
        height_meters: 5,
        total_area_m2: 375,
        usable_area_m2: 340,
        capacity_configurations: { max_capacity: 2000 },
        current_occupancy: 1500,
        reserved_capacity: 200,
        climate_controlled: true,
        lighting_controlled: true,
        irrigation_system: true,
        environmental_specs: {
          temperature_min: 18,
          temperature_max: 24,
          humidity_min: 60,
          humidity_max: 75,
          light_hours: 14,
        },
        equipment_list: [
          { name: "Sistema de riego por aspersión", quantity: 1 },
          { name: "Malla de sombreo", quantity: 1 },
        ],
        status: "active",
        notes: "Invernadero multi-especie para flores de corte",
        created_at: now - 200 * 24 * 60 * 60 * 1000,
        updated_at: now,
      });
    }

    // Insert all areas
    const areaIds: Id<"areas">[] = [];
    for (const area of sampleAreas) {
      const areaId = await ctx.db.insert("areas", area);
      areaIds.push(areaId);
    }

    return {
      success: true,
      message: `Successfully seeded ${areaIds.length} areas`,
      count: areaIds.length,
      areas: sampleAreas.map((a) => a.name),
    };
  },
});

/**
 * Clear all areas for a facility
 * Useful for testing/resetting
 */
export const clearAreas = mutation({
  args: {
    facilityId: v.id("facilities"),
  },
  handler: async (ctx, args) => {
    const areas = await ctx.db
      .query("areas")
      .withIndex("by_facility", (q) => q.eq("facility_id", args.facilityId))
      .collect();

    for (const area of areas) {
      await ctx.db.delete(area._id);
    }

    return {
      success: true,
      message: `Deleted ${areas.length} areas`,
      count: areas.length,
    };
  },
});
