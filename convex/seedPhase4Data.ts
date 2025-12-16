/**
 * Phase 4 Seed Data Script
 * Seeds realistic production execution data for testing
 * Includes: Production Orders, Batches, Plants, Scheduled Activities, Activities
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// ============================================================================
// HELPER QUERIES
// ============================================================================

export const getPhase4SeedInfo = query({
  args: {},
  handler: async (ctx) => {
    const companies = await ctx.db.query("companies").collect();
    const facilities = await ctx.db.query("facilities").collect();
    const areas = await ctx.db.query("areas").collect();
    const cultivars = await ctx.db.query("cultivars").collect();
    const cropTypes = await ctx.db.query("crop_types").collect();
    const users = await ctx.db.query("users").collect();
    const templates = await ctx.db.query("production_templates").collect();

    return {
      companies: companies.map((c) => ({
        _id: c._id,
        name: c.name,
      })),
      facilities: facilities.map((f) => ({
        _id: f._id,
        name: f.name,
        company_id: f.company_id,
      })),
      areas: areas.map((a) => ({
        _id: a._id,
        name: a.name,
        area_type: a.area_type,
        facility_id: a.facility_id,
      })),
      cultivars: cultivars.map((c) => ({
        _id: c._id,
        name: c.name,
        crop_type_id: c.crop_type_id,
      })),
      cropTypes: cropTypes.map((ct) => ({
        _id: ct._id,
        name: ct.name,
      })),
      users: users.map((u) => ({
        _id: u._id,
        name: `${u.first_name} ${u.last_name}`,
        email: u.email,
      })),
      templates: templates.map((t) => ({
        _id: t._id,
        name: t.name,
      })),
    };
  },
});

// ============================================================================
// PRODUCTION TEMPLATES
// ============================================================================

export const seedProductionTemplates = mutation({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const cropTypes = await ctx.db.query("crop_types").collect();
    const cannabisType = cropTypes.find((ct) => ct.name === "Cannabis");

    if (!cannabisType) {
      return { success: false, message: "Cannabis crop type not found", count: 0 };
    }

    const existingTemplates = await ctx.db
      .query("production_templates")
      .withIndex("by_company", (q) => q.eq("company_id", args.companyId))
      .collect();

    if (existingTemplates.length > 0) {
      return {
        success: true,
        message: `Templates already exist (${existingTemplates.length} found)`,
        count: existingTemplates.length,
        templates: existingTemplates.map((t) => ({ _id: t._id, name: t.name })),
      };
    }

    const templateId = await ctx.db.insert("production_templates", {
      company_id: args.companyId,
      crop_type_id: cannabisType._id,
      name: "Cannabis Indoor Premium",
      description: "Plantilla estándar para cultivo indoor de cannabis medicinal.",
      estimated_duration_days: 120,
      default_batch_size: 50,
      enable_individual_tracking: true,
      estimated_yield: 100,
      yield_unit: "g",
      difficulty_level: "intermediate",
      usage_count: 0,
      is_public: false,
      status: "active",
      created_at: now - 180 * 24 * 60 * 60 * 1000,
      updated_at: now,
    });

    // Create template phases
    const phases = [
      { phase_name: "Propagación", phase_order: 1, estimated_duration_days: 14, area_type: "propagation" },
      { phase_name: "Vegetativo", phase_order: 2, estimated_duration_days: 28, area_type: "vegetative" },
      { phase_name: "Floración", phase_order: 3, estimated_duration_days: 56, area_type: "flowering" },
      { phase_name: "Secado", phase_order: 4, estimated_duration_days: 14, area_type: "drying" },
      { phase_name: "Curado", phase_order: 5, estimated_duration_days: 21, area_type: "curing" },
    ];

    for (const phase of phases) {
      await ctx.db.insert("template_phases", {
        template_id: templateId,
        phase_name: phase.phase_name,
        phase_order: phase.phase_order,
        estimated_duration_days: phase.estimated_duration_days,
        area_type: phase.area_type,
        required_equipment: [],
        required_materials: [],
        created_at: now,
      });
    }

    return {
      success: true,
      message: `Created template with ${phases.length} phases`,
      count: 1,
      templateId,
    };
  },
});

// ============================================================================
// PRODUCTION ORDERS
// ============================================================================

export const seedProductionOrders = mutation({
  args: {
    companyId: v.id("companies"),
    facilityId: v.id("facilities"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;

    const [cultivars, templates, cropTypes] = await Promise.all([
      ctx.db.query("cultivars").collect(),
      ctx.db.query("production_templates").withIndex("by_company", (q) => q.eq("company_id", args.companyId)).collect(),
      ctx.db.query("crop_types").collect(),
    ]);

    const cannabisType = cropTypes.find((ct) => ct.name === "Cannabis");
    if (!cannabisType) {
      return { success: false, message: "Cannabis crop type not found", count: 0 };
    }

    const existingOrders = await ctx.db
      .query("production_orders")
      .withIndex("by_company", (q) => q.eq("company_id", args.companyId))
      .collect();

    if (existingOrders.length > 0) {
      return { success: true, message: `Orders already exist (${existingOrders.length} found)`, count: existingOrders.length };
    }

    const template = templates[0];
    const blueDream = cultivars.find((c) => c.name === "Blue Dream");
    const ogKush = cultivars.find((c) => c.name === "OG Kush");
    const colombianGold = cultivars.find((c) => c.name === "Colombian Gold");

    const orders = [
      {
        order_number: "ORD-2024-001",
        company_id: args.companyId,
        template_id: template?._id,
        crop_type_id: cannabisType._id,
        cultivar_id: blueDream?._id,
        order_type: "seed-to-harvest",
        source_type: "clone",
        target_facility_id: args.facilityId,
        requested_quantity: 50,
        total_plants_actual: 48,
        unit_of_measure: "plants",
        enable_individual_tracking: true,
        transport_manifest_required: false,
        phytosanitary_cert_required: false,
        regulatory_documentation: {},
        status: "active",
        priority: "high",
        planned_start_date: now - 60 * DAY,
        actual_start_date: now - 60 * DAY,
        estimated_completion_date: now + 60 * DAY,
        completion_percentage: 55,
        notes: "Lote premium Blue Dream",
        requested_by: args.userId,
        created_at: now - 65 * DAY,
        updated_at: now,
      },
      {
        order_number: "ORD-2024-002",
        company_id: args.companyId,
        template_id: template?._id,
        crop_type_id: cannabisType._id,
        cultivar_id: ogKush?._id,
        order_type: "seed-to-harvest",
        source_type: "seed",
        target_facility_id: args.facilityId,
        requested_quantity: 40,
        total_plants_actual: 38,
        unit_of_measure: "plants",
        enable_individual_tracking: true,
        transport_manifest_required: false,
        phytosanitary_cert_required: false,
        regulatory_documentation: {},
        status: "active",
        priority: "normal",
        planned_start_date: now - 25 * DAY,
        actual_start_date: now - 25 * DAY,
        estimated_completion_date: now + 95 * DAY,
        completion_percentage: 25,
        notes: "OG Kush para stock",
        requested_by: args.userId,
        created_at: now - 30 * DAY,
        updated_at: now,
      },
      {
        order_number: "ORD-2024-000",
        company_id: args.companyId,
        template_id: template?._id,
        crop_type_id: cannabisType._id,
        cultivar_id: colombianGold?._id,
        order_type: "seed-to-harvest",
        source_type: "clone",
        target_facility_id: args.facilityId,
        requested_quantity: 45,
        total_plants_actual: 42,
        unit_of_measure: "plants",
        enable_individual_tracking: true,
        transport_manifest_required: false,
        phytosanitary_cert_required: false,
        regulatory_documentation: {},
        status: "completed",
        priority: "high",
        planned_start_date: now - 150 * DAY,
        actual_start_date: now - 150 * DAY,
        estimated_completion_date: now - 30 * DAY,
        actual_completion_date: now - 25 * DAY,
        completion_percentage: 100,
        notes: "Primera cosecha exitosa",
        requested_by: args.userId,
        created_at: now - 155 * DAY,
        updated_at: now - 25 * DAY,
      },
    ];

    const orderIds: Id<"production_orders">[] = [];
    for (const order of orders) {
      const id = await ctx.db.insert("production_orders", order);
      orderIds.push(id);
    }

    return { success: true, message: `Seeded ${orderIds.length} orders`, count: orderIds.length };
  },
});

// ============================================================================
// BATCHES
// ============================================================================

export const seedBatches = mutation({
  args: {
    facilityId: v.id("facilities"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;

    const facility = await ctx.db.get(args.facilityId);
    if (!facility) {
      return { success: false, message: "Facility not found", count: 0 };
    }

    const existingBatches = await ctx.db
      .query("batches")
      .withIndex("by_facility", (q) => q.eq("facility_id", args.facilityId))
      .collect();

    if (existingBatches.length > 0) {
      return { success: true, message: `Batches already exist (${existingBatches.length} found)`, count: existingBatches.length };
    }

    const [areas, cultivars, orders, cropTypes] = await Promise.all([
      ctx.db.query("areas").withIndex("by_facility", (q) => q.eq("facility_id", args.facilityId)).collect(),
      ctx.db.query("cultivars").collect(),
      ctx.db.query("production_orders").withIndex("by_company", (q) => q.eq("company_id", facility.company_id)).collect(),
      ctx.db.query("crop_types").collect(),
    ]);

    const cannabisType = cropTypes.find((ct) => ct.name === "Cannabis");
    if (!cannabisType) {
      return { success: false, message: "Cannabis crop type not found", count: 0 };
    }

    const floweringArea = areas.find((a) => a.area_type === "flowering");
    const vegetativeArea = areas.find((a) => a.area_type === "vegetative");
    const defaultArea = floweringArea || vegetativeArea || areas[0];

    if (!defaultArea) {
      return { success: false, message: "No areas found", count: 0 };
    }

    const blueDream = cultivars.find((c) => c.name === "Blue Dream");
    const ogKush = cultivars.find((c) => c.name === "OG Kush");
    const activeOrders = orders.filter((o) => o.status === "active");

    const batches = [
      {
        batch_code: "BD-241109-001",
        facility_id: args.facilityId,
        area_id: floweringArea?._id || defaultArea._id,
        crop_type_id: cannabisType._id,
        cultivar_id: blueDream?._id,
        production_order_id: activeOrders[0]?._id,
        batch_type: "production",
        source_type: "clone",
        tracking_level: "individual",
        enable_individual_tracking: true,
        planned_quantity: 50,
        initial_quantity: 50,
        current_quantity: 48,
        lost_quantity: 2,
        unit_of_measure: "plants",
        mortality_rate: 4,
        current_phase: "Floración",
        created_date: now - 60 * DAY,
        planned_completion_date: now + 60 * DAY,
        days_in_production: 60,
        quality_grade: "A",
        environmental_history: [],
        company_id: facility.company_id,
        created_by: args.userId,
        status: "active",
        priority: "high",
        notes: "Lote premium - Floración semana 4",
        updated_at: now,
      },
      {
        batch_code: "OK-241124-001",
        facility_id: args.facilityId,
        area_id: vegetativeArea?._id || defaultArea._id,
        crop_type_id: cannabisType._id,
        cultivar_id: ogKush?._id,
        production_order_id: activeOrders[1]?._id,
        batch_type: "production",
        source_type: "seed",
        tracking_level: "individual",
        enable_individual_tracking: true,
        planned_quantity: 40,
        initial_quantity: 40,
        current_quantity: 38,
        lost_quantity: 2,
        unit_of_measure: "plants",
        mortality_rate: 5,
        current_phase: "Vegetativo",
        created_date: now - 25 * DAY,
        planned_completion_date: now + 95 * DAY,
        days_in_production: 25,
        environmental_history: [],
        company_id: facility.company_id,
        created_by: args.userId,
        status: "active",
        priority: "normal",
        notes: "OG Kush - Fase vegetativa",
        updated_at: now,
      },
    ];

    const batchIds: Id<"batches">[] = [];
    for (const batch of batches) {
      const id = await ctx.db.insert("batches", batch);
      batchIds.push(id);
    }

    return { success: true, message: `Seeded ${batchIds.length} batches`, count: batchIds.length };
  },
});

// ============================================================================
// PLANTS
// ============================================================================

export const seedPlants = mutation({
  args: {
    facilityId: v.id("facilities"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;

    const batches = await ctx.db
      .query("batches")
      .withIndex("by_facility", (q) => q.eq("facility_id", args.facilityId))
      .filter((q) => q.eq(q.field("enable_individual_tracking"), true))
      .collect();

    if (batches.length === 0) {
      return { success: false, message: "No batches found", count: 0 };
    }

    const existingPlants = await ctx.db.query("plants").take(1);
    if (existingPlants.length > 0) {
      const allPlants = await ctx.db.query("plants").collect();
      return { success: true, message: `Plants already exist (${allPlants.length} found)`, count: allPlants.length };
    }

    let totalPlants = 0;
    const healthStatuses = ["healthy", "healthy", "healthy", "healthy", "stressed"];

    for (const batch of batches) {
      if (batch.status === "harvested") continue;

      for (let i = 1; i <= batch.current_quantity; i++) {
        const plantCode = `${batch.batch_code}-P${String(i).padStart(3, "0")}`;
        const healthStatus = healthStatuses[Math.floor(Math.random() * healthStatuses.length)];
        const daysOld = Math.floor((now - batch.created_date) / DAY);

        let height = 10;
        let nodeCount = 2;
        let stemDiameter = 3;

        if (batch.current_phase === "Vegetativo") {
          height = 20 + Math.random() * 30;
          nodeCount = 4 + Math.floor(Math.random() * 4);
          stemDiameter = 5 + Math.random() * 5;
        } else if (batch.current_phase === "Floración") {
          height = 60 + Math.random() * 60;
          nodeCount = 8 + Math.floor(Math.random() * 6);
          stemDiameter = 10 + Math.random() * 8;
        }

        // Get company_id from facility
        const facility = await ctx.db.get(args.facilityId);

        await ctx.db.insert("plants", {
          plant_code: plantCode,
          qr_code: `QR-${plantCode}`,
          batch_id: batch._id,
          facility_id: args.facilityId,
          area_id: batch.area_id,
          crop_type_id: batch.crop_type_id,
          company_id: facility!.company_id,
          plant_stage: batch.current_phase === "Floración" ? "flowering" : "vegetative",
          planted_date: batch.created_date,
          status: "active",
          health_status: healthStatus,
          current_height_cm: Math.round(height * 10) / 10,
          current_nodes: nodeCount,
          stem_diameter_mm: Math.round(stemDiameter * 10) / 10,
          sex: batch.source_type === "clone" ? "female" : "unknown",
          clones_taken_count: 0,
          notes: healthStatus === "stressed" ? "Muestra signos de estrés" : undefined,
          created_at: batch.created_date + i * 1000,
          updated_at: now,
        });

        totalPlants++;
      }
    }

    return { success: true, message: `Seeded ${totalPlants} plants`, count: totalPlants };
  },
});

// ============================================================================
// SCHEDULED ACTIVITIES
// ============================================================================

export const seedScheduledActivities = mutation({
  args: {
    facilityId: v.id("facilities"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;
    const HOUR = 60 * 60 * 1000;

    const batches = await ctx.db
      .query("batches")
      .withIndex("by_facility", (q) => q.eq("facility_id", args.facilityId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    if (batches.length === 0) {
      return { success: false, message: "No active batches found", count: 0 };
    }

    const existingActivities = await ctx.db
      .query("scheduled_activities")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .take(1);

    if (existingActivities.length > 0) {
      const allActivities = await ctx.db.query("scheduled_activities").collect();
      return { success: true, message: `Scheduled activities already exist (${allActivities.length} found)`, count: allActivities.length };
    }

    let totalActivities = 0;

    for (const batch of batches) {
      for (let day = 0; day < 7; day++) {
        const date = now + day * DAY;

        // Daily watering
        await ctx.db.insert("scheduled_activities", {
          entity_type: "batch",
          entity_id: batch._id,
          activity_type: "watering",
          scheduled_date: date + 8 * HOUR,
          estimated_duration_minutes: 30,
          is_recurring: true,
          recurring_pattern: "daily",
          assigned_to: args.userId,
          assigned_team: [],
          required_materials: [],
          required_equipment: [],
          activity_metadata: {},
          status: day === 0 ? "in_progress" : "pending",
          created_at: now - 7 * DAY,
          updated_at: now,
        });
        totalActivities++;

        // Feeding every 3 days
        if (day % 3 === 0) {
          await ctx.db.insert("scheduled_activities", {
            entity_type: "batch",
            entity_id: batch._id,
            activity_type: "feeding",
            scheduled_date: date + 9 * HOUR,
            estimated_duration_minutes: 45,
            is_recurring: true,
            recurring_pattern: "biweekly",
            assigned_to: args.userId,
            assigned_team: [],
            required_materials: [],
            required_equipment: [],
            activity_metadata: {},
            status: "pending",
            created_at: now - 7 * DAY,
            updated_at: now,
          });
          totalActivities++;
        }
      }

      // Add overdue activity
      await ctx.db.insert("scheduled_activities", {
        entity_type: "batch",
        entity_id: batch._id,
        activity_type: "pruning",
        scheduled_date: now - 2 * DAY,
        estimated_duration_minutes: 90,
        is_recurring: false,
        assigned_to: args.userId,
        assigned_team: [],
        required_materials: [],
        required_equipment: [],
        activity_metadata: {},
        status: "pending",
        created_at: now - 10 * DAY,
        updated_at: now,
      });
      totalActivities++;
    }

    return { success: true, message: `Seeded ${totalActivities} scheduled activities`, count: totalActivities };
  },
});

// ============================================================================
// ACTIVITIES LOG
// ============================================================================

export const seedActivities = mutation({
  args: {
    facilityId: v.id("facilities"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;

    const batches = await ctx.db
      .query("batches")
      .withIndex("by_facility", (q) => q.eq("facility_id", args.facilityId))
      .collect();

    if (batches.length === 0) {
      return { success: false, message: "No batches found", count: 0 };
    }

    const existingActivities = await ctx.db
      .query("activities")
      .withIndex("by_activity_type", (q) => q.eq("activity_type", "watering"))
      .take(1);

    if (existingActivities.length > 0) {
      const allActivities = await ctx.db.query("activities").collect();
      return { success: true, message: `Activities already exist (${allActivities.length} found)`, count: allActivities.length };
    }

    const activityTypes = ["watering", "feeding", "pruning", "inspection"];
    let totalActivities = 0;

    for (const batch of batches) {
      const daysToGenerate = Math.min(14, Math.floor((now - batch.created_date) / DAY));

      for (let day = 1; day <= daysToGenerate; day++) {
        const activityDate = now - day * DAY;
        const activitiesPerDay = 2 + Math.floor(Math.random() * 2);

        for (let i = 0; i < activitiesPerDay; i++) {
          const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];

          await ctx.db.insert("activities", {
            entity_type: "batch",
            entity_id: batch._id,
            activity_type: activityType,
            performed_by: args.userId,
            timestamp: activityDate + (8 + i * 2) * 60 * 60 * 1000,
            duration_minutes: 15 + Math.floor(Math.random() * 45),
            materials_consumed: [],
            equipment_used: [],
            photos: [],
            files: [],
            activity_metadata: {},
            notes: `${activityType} - ${batch.batch_code}`,
            created_at: activityDate,
          });

          totalActivities++;
        }
      }
    }

    return { success: true, message: `Seeded ${totalActivities} activities`, count: totalActivities };
  },
});

// ============================================================================
// QUALITY CHECK TEMPLATES
// ============================================================================

export const seedQualityCheckTemplates = mutation({
  args: {
    companyId: v.id("companies"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const cropTypes = await ctx.db.query("crop_types").collect();
    const cannabisType = cropTypes.find((ct) => ct.name === "Cannabis");

    if (!cannabisType) {
      return { success: false, message: "Cannabis crop type not found", count: 0 };
    }

    const existingTemplates = await ctx.db
      .query("quality_check_templates")
      .withIndex("by_company", (q) => q.eq("company_id", args.companyId))
      .collect();

    if (existingTemplates.length > 0) {
      return {
        success: true,
        message: `Quality check templates already exist (${existingTemplates.length} found)`,
        count: existingTemplates.length,
        templates: existingTemplates.map((t) => ({ _id: t._id, name: t.name })),
      };
    }

    const templates = [
      {
        name: "Inspección Visual de Planta",
        crop_type_id: cannabisType._id,
        procedure_type: "visual",
        inspection_level: "individual",
        regulatory_requirement: false,
        template_structure: {
          sections: [
            {
              title: "Estado General",
              fields: [
                {
                  id: "overall_health",
                  label: "Estado de Salud General",
                  type: "select",
                  options: ["Excelente", "Bueno", "Regular", "Malo", "Crítico"],
                  required: true,
                },
                {
                  id: "leaf_color",
                  label: "Color de Hojas",
                  type: "select",
                  options: ["Verde intenso", "Verde claro", "Amarillento", "Manchas", "Necrótico"],
                  required: true,
                },
                {
                  id: "vigor",
                  label: "Vigor de Crecimiento",
                  type: "rating",
                  max: 5,
                  required: true,
                },
              ],
            },
            {
              title: "Detección de Problemas",
              fields: [
                {
                  id: "pests_detected",
                  label: "Plagas Detectadas",
                  type: "multiselect",
                  options: ["Ninguna", "Ácaros", "Trips", "Mosca blanca", "Pulgones", "Orugas"],
                  required: true,
                },
                {
                  id: "diseases_detected",
                  label: "Enfermedades Detectadas",
                  type: "multiselect",
                  options: ["Ninguna", "Mildiu", "Botrytis", "Fusarium", "Pythium", "Oídio"],
                  required: true,
                },
                {
                  id: "deficiencies",
                  label: "Deficiencias Nutricionales",
                  type: "multiselect",
                  options: ["Ninguna", "Nitrógeno", "Fósforo", "Potasio", "Calcio", "Magnesio", "Hierro"],
                  required: false,
                },
              ],
            },
            {
              title: "Fotografías",
              fields: [
                {
                  id: "photos",
                  label: "Fotos de Evidencia",
                  type: "photo",
                  multiple: true,
                  required: false,
                  ai_analysis: true,
                },
              ],
            },
            {
              title: "Observaciones",
              fields: [
                {
                  id: "notes",
                  label: "Notas Adicionales",
                  type: "textarea",
                  required: false,
                },
                {
                  id: "action_required",
                  label: "Acción Requerida",
                  type: "checkbox",
                  required: false,
                },
              ],
            },
          ],
        },
        ai_assisted: true,
        ai_analysis_types: ["pest_detection", "disease_detection", "deficiency_detection", "health_assessment"],
        applicable_stages: ["vegetative", "flowering", "propagation"],
        frequency_recommendation: "weekly",
        usage_count: 0,
        company_id: args.companyId,
        created_by: args.userId,
        status: "active",
        created_at: now - 90 * 24 * 60 * 60 * 1000,
        updated_at: now,
      },
      {
        name: "Control de Calidad Pre-Cosecha",
        crop_type_id: cannabisType._id,
        procedure_type: "measurement",
        inspection_level: "batch",
        regulatory_requirement: true,
        compliance_standard: "INVIMA",
        template_structure: {
          sections: [
            {
              title: "Mediciones de Tricomas",
              fields: [
                {
                  id: "trichome_clarity",
                  label: "Claridad de Tricomas",
                  type: "select",
                  options: ["Transparentes (inmaduro)", "Lechosos (óptimo)", "Ámbar (maduro)", "Mixto"],
                  required: true,
                },
                {
                  id: "trichome_density",
                  label: "Densidad de Tricomas",
                  type: "rating",
                  max: 5,
                  required: true,
                },
                {
                  id: "trichome_photo",
                  label: "Foto Microscopio",
                  type: "photo",
                  ai_analysis: true,
                  required: true,
                },
              ],
            },
            {
              title: "Estado de Flores",
              fields: [
                {
                  id: "bud_density",
                  label: "Densidad de Cogollos",
                  type: "select",
                  options: ["Muy denso", "Denso", "Normal", "Suelto", "Muy suelto"],
                  required: true,
                },
                {
                  id: "pistil_color",
                  label: "Color de Pistilos",
                  type: "select",
                  options: ["Blancos (<25%)", "Mixtos (25-75%)", "Naranjas (>75%)"],
                  required: true,
                },
                {
                  id: "aroma_intensity",
                  label: "Intensidad de Aroma",
                  type: "rating",
                  max: 5,
                  required: true,
                },
                {
                  id: "aroma_profile",
                  label: "Perfil de Aroma",
                  type: "multiselect",
                  options: ["Cítrico", "Terroso", "Pino", "Dulce", "Diesel", "Floral", "Especiado"],
                  required: false,
                },
              ],
            },
            {
              title: "Verificación de Contaminantes",
              fields: [
                {
                  id: "mold_check",
                  label: "Verificación de Moho",
                  type: "select",
                  options: ["Sin presencia", "Sospecha", "Confirmado"],
                  required: true,
                },
                {
                  id: "pest_residue",
                  label: "Residuos de Plagas",
                  type: "select",
                  options: ["Ninguno", "Mínimo", "Moderado", "Severo"],
                  required: true,
                },
                {
                  id: "foreign_matter",
                  label: "Materia Extraña",
                  type: "checkbox",
                  required: true,
                },
              ],
            },
            {
              title: "Evaluación Final",
              fields: [
                {
                  id: "harvest_readiness",
                  label: "Listo para Cosecha",
                  type: "select",
                  options: ["Sí - Óptimo", "Sí - Aceptable", "No - Esperar", "No - Problemas"],
                  required: true,
                },
                {
                  id: "expected_quality_grade",
                  label: "Grado de Calidad Esperado",
                  type: "select",
                  options: ["Premium (AAA)", "Alta (AA)", "Estándar (A)", "Básica (B)"],
                  required: true,
                },
                {
                  id: "recommended_action",
                  label: "Acción Recomendada",
                  type: "textarea",
                  required: false,
                },
              ],
            },
          ],
        },
        ai_assisted: true,
        ai_analysis_types: ["trichome_analysis", "mold_detection", "harvest_readiness"],
        applicable_stages: ["flowering"],
        frequency_recommendation: "daily_before_harvest",
        usage_count: 0,
        company_id: args.companyId,
        created_by: args.userId,
        status: "active",
        created_at: now - 60 * 24 * 60 * 60 * 1000,
        updated_at: now,
      },
      {
        name: "Control de Secado y Curado",
        crop_type_id: cannabisType._id,
        procedure_type: "measurement",
        inspection_level: "batch",
        regulatory_requirement: true,
        compliance_standard: "INVIMA",
        template_structure: {
          sections: [
            {
              title: "Condiciones Ambientales",
              fields: [
                {
                  id: "temperature",
                  label: "Temperatura (°C)",
                  type: "number",
                  min: 15,
                  max: 25,
                  required: true,
                },
                {
                  id: "humidity",
                  label: "Humedad Relativa (%)",
                  type: "number",
                  min: 45,
                  max: 65,
                  required: true,
                },
                {
                  id: "air_circulation",
                  label: "Circulación de Aire",
                  type: "select",
                  options: ["Óptima", "Adecuada", "Insuficiente", "Excesiva"],
                  required: true,
                },
              ],
            },
            {
              title: "Estado del Producto",
              fields: [
                {
                  id: "moisture_content",
                  label: "Contenido de Humedad (%)",
                  type: "number",
                  min: 8,
                  max: 15,
                  required: true,
                },
                {
                  id: "stem_snap_test",
                  label: "Prueba de Tallo",
                  type: "select",
                  options: ["Se dobla (húmedo)", "Cruje (casi listo)", "Se quiebra (listo)", "Quebradizo (sobre-seco)"],
                  required: true,
                },
                {
                  id: "bud_feel",
                  label: "Textura de Cogollos",
                  type: "select",
                  options: ["Húmedos", "Ligeramente pegajosos", "Secos exterior", "Completamente secos"],
                  required: true,
                },
              ],
            },
            {
              title: "Control de Calidad",
              fields: [
                {
                  id: "mold_inspection",
                  label: "Inspección de Moho",
                  type: "select",
                  options: ["Sin presencia", "Sospecha leve", "Confirmado - descartar"],
                  required: true,
                },
                {
                  id: "aroma_preservation",
                  label: "Preservación de Aroma",
                  type: "rating",
                  max: 5,
                  required: true,
                },
                {
                  id: "color_retention",
                  label: "Retención de Color",
                  type: "select",
                  options: ["Excelente", "Buena", "Aceptable", "Degradada"],
                  required: true,
                },
              ],
            },
            {
              title: "Registro",
              fields: [
                {
                  id: "weight_loss_percentage",
                  label: "Pérdida de Peso (%)",
                  type: "number",
                  min: 0,
                  max: 80,
                  required: false,
                },
                {
                  id: "days_in_process",
                  label: "Días en Proceso",
                  type: "number",
                  required: true,
                },
                {
                  id: "ready_for_next_stage",
                  label: "Listo para Siguiente Etapa",
                  type: "checkbox",
                  required: true,
                },
                {
                  id: "notes",
                  label: "Observaciones",
                  type: "textarea",
                  required: false,
                },
              ],
            },
          ],
        },
        ai_assisted: false,
        ai_analysis_types: [],
        applicable_stages: ["drying", "curing"],
        frequency_recommendation: "daily",
        usage_count: 0,
        company_id: args.companyId,
        created_by: args.userId,
        status: "active",
        created_at: now - 45 * 24 * 60 * 60 * 1000,
        updated_at: now,
      },
    ];

    const templateIds: Id<"quality_check_templates">[] = [];
    for (const template of templates) {
      const id = await ctx.db.insert("quality_check_templates", template);
      templateIds.push(id);
    }

    return {
      success: true,
      message: `Seeded ${templateIds.length} quality check templates`,
      count: templateIds.length,
      templates: templates.map((t, i) => ({ _id: templateIds[i], name: t.name })),
    };
  },
});

// ============================================================================
// TEMPLATE ACTIVITIES WITH QUALITY CHECKS
// ============================================================================

export const seedTemplateActivities = mutation({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Get templates and quality check templates
    const productionTemplates = await ctx.db
      .query("production_templates")
      .withIndex("by_company", (q) => q.eq("company_id", args.companyId))
      .collect();

    const qualityCheckTemplates = await ctx.db
      .query("quality_check_templates")
      .withIndex("by_company", (q) => q.eq("company_id", args.companyId))
      .collect();

    if (productionTemplates.length === 0) {
      return { success: false, message: "No production templates found", count: 0 };
    }

    const template = productionTemplates[0];
    const visualInspection = qualityCheckTemplates.find((t) => t.name.includes("Visual"));
    const preHarvestCheck = qualityCheckTemplates.find((t) => t.name.includes("Pre-Cosecha"));
    const dryingCheck = qualityCheckTemplates.find((t) => t.name.includes("Secado"));

    // Get template phases
    const phases = await ctx.db
      .query("template_phases")
      .withIndex("by_template", (q) => q.eq("template_id", template._id))
      .collect();

    const existingActivities = await ctx.db
      .query("template_activities")
      .take(1);

    if (existingActivities.length > 0) {
      const allActivities = await ctx.db.query("template_activities").collect();
      return { success: true, message: `Template activities already exist (${allActivities.length} found)`, count: allActivities.length };
    }

    let totalActivities = 0;

    for (const phase of phases) {
      let activities: Array<{
        activity_type: string;
        activity_order: number;
        estimated_duration_minutes: number;
        timing_configuration: any;
        required_materials?: any[];
        instructions?: string;
        quality_check_template_id?: Id<"quality_check_templates">;
      }> = [];

      if (phase.phase_name === "Propagación") {
        activities = [
          {
            activity_type: "watering",
            activity_order: 1,
            estimated_duration_minutes: 20,
            timing_configuration: { type: "recurring", frequencyType: "daily_range", startDay: 1, endDay: 14 },
            instructions: "Riego suave con atomizador. Mantener sustrato húmedo.",
          },
          {
            activity_type: "inspection",
            activity_order: 2,
            estimated_duration_minutes: 30,
            timing_configuration: { type: "recurring", frequencyType: "every_n_days", intervalDays: 3, startDay: 1, endDay: 14 },
            quality_check_template_id: visualInspection?._id,
            instructions: "Revisar enraizamiento y signos de estrés.",
          },
        ];
      } else if (phase.phase_name === "Vegetativo") {
        activities = [
          {
            activity_type: "watering",
            activity_order: 1,
            estimated_duration_minutes: 30,
            timing_configuration: { type: "recurring", frequencyType: "daily_range", startDay: 1, endDay: 28 },
            instructions: "Riego abundante. Verificar drenaje.",
          },
          {
            activity_type: "feeding",
            activity_order: 2,
            estimated_duration_minutes: 45,
            timing_configuration: { type: "recurring", frequencyType: "every_n_days", intervalDays: 3, startDay: 1, endDay: 28 },
            required_materials: [{ product_type: "fertilizer", quantity: 1, unit: "L" }],
            instructions: "Aplicar nutrientes vegetativos según EC objetivo.",
          },
          {
            activity_type: "pruning",
            activity_order: 3,
            estimated_duration_minutes: 60,
            timing_configuration: { type: "recurring", frequencyType: "every_n_days", intervalDays: 7, startDay: 7, endDay: 28 },
            instructions: "Poda de bajos y defoliación selectiva.",
          },
          {
            activity_type: "inspection",
            activity_order: 4,
            estimated_duration_minutes: 45,
            timing_configuration: { type: "recurring", frequencyType: "every_n_days", intervalDays: 7, startDay: 1, endDay: 28 },
            quality_check_template_id: visualInspection?._id,
            instructions: "Inspección completa de plagas y enfermedades.",
          },
        ];
      } else if (phase.phase_name === "Floración") {
        activities = [
          {
            activity_type: "watering",
            activity_order: 1,
            estimated_duration_minutes: 30,
            timing_configuration: { type: "recurring", frequencyType: "daily_range", startDay: 1, endDay: 56 },
            instructions: "Riego controlado. Reducir frecuencia en últimas semanas.",
          },
          {
            activity_type: "feeding",
            activity_order: 2,
            estimated_duration_minutes: 45,
            timing_configuration: { type: "recurring", frequencyType: "every_n_days", intervalDays: 3, startDay: 1, endDay: 49 },
            required_materials: [{ product_type: "bloom_fertilizer", quantity: 1, unit: "L" }],
            instructions: "Nutrientes de floración. Flush en última semana.",
          },
          {
            activity_type: "inspection",
            activity_order: 3,
            estimated_duration_minutes: 45,
            timing_configuration: { type: "recurring", frequencyType: "every_n_days", intervalDays: 7, startDay: 1, endDay: 42 },
            quality_check_template_id: visualInspection?._id,
            instructions: "Inspección de desarrollo floral y plagas.",
          },
          {
            activity_type: "quality_check",
            activity_order: 4,
            estimated_duration_minutes: 60,
            timing_configuration: { type: "recurring", frequencyType: "daily_range", startDay: 49, endDay: 56 },
            quality_check_template_id: preHarvestCheck?._id,
            instructions: "Evaluación de madurez para cosecha.",
          },
        ];
      } else if (phase.phase_name === "Secado" || phase.phase_name === "Curado") {
        activities = [
          {
            activity_type: "inspection",
            activity_order: 1,
            estimated_duration_minutes: 30,
            timing_configuration: { type: "recurring", frequencyType: "daily_range", startDay: 1, endDay: phase.estimated_duration_days },
            quality_check_template_id: dryingCheck?._id,
            instructions: "Control diario de condiciones y estado del producto.",
          },
        ];
      }

      for (const activity of activities) {
        const activityTypeLabels: Record<string, string> = {
          watering: "Riego",
          feeding: "Fertilización",
          pruning: "Poda",
          inspection: "Inspección",
          quality_check: "Control de Calidad",
        };

        await ctx.db.insert("template_activities", {
          phase_id: phase._id,
          activity_name: activityTypeLabels[activity.activity_type] || activity.activity_type,
          activity_type: activity.activity_type,
          activity_order: activity.activity_order,
          is_recurring: activity.timing_configuration?.type === "recurring",
          is_quality_check: activity.activity_type === "quality_check" || !!activity.quality_check_template_id,
          estimated_duration_minutes: activity.estimated_duration_minutes,
          timing_configuration: activity.timing_configuration,
          required_materials: activity.required_materials || [],
          quality_check_template_id: activity.quality_check_template_id,
          instructions: activity.instructions,
          created_at: now,
        });
        totalActivities++;
      }
    }

    return {
      success: true,
      message: `Seeded ${totalActivities} template activities with quality checks`,
      count: totalActivities,
    };
  },
});

// ============================================================================
// CLEAR DATA
// ============================================================================

export const clearPhase4Data = mutation({
  args: {
    facilityId: v.id("facilities"),
  },
  handler: async (ctx, args) => {
    const facility = await ctx.db.get(args.facilityId);
    if (!facility) {
      return { success: false, message: "Facility not found" };
    }

    let deleted = { plants: 0, activities: 0, scheduledActivities: 0, batches: 0, orders: 0 };

    // Delete plants
    const batches = await ctx.db
      .query("batches")
      .withIndex("by_facility", (q) => q.eq("facility_id", args.facilityId))
      .collect();

    for (const batch of batches) {
      const plants = await ctx.db
        .query("plants")
        .withIndex("by_batch", (q) => q.eq("batch_id", batch._id))
        .collect();
      for (const plant of plants) {
        await ctx.db.delete(plant._id);
        deleted.plants++;
      }
    }

    // Delete scheduled activities
    const scheduledActivities = await ctx.db.query("scheduled_activities").collect();
    for (const activity of scheduledActivities) {
      await ctx.db.delete(activity._id);
      deleted.scheduledActivities++;
    }

    // Delete batches
    for (const batch of batches) {
      await ctx.db.delete(batch._id);
      deleted.batches++;
    }

    // Delete production orders
    const orders = await ctx.db
      .query("production_orders")
      .withIndex("by_company", (q) => q.eq("company_id", facility.company_id))
      .collect();
    for (const order of orders) {
      await ctx.db.delete(order._id);
      deleted.orders++;
    }

    return { success: true, message: "Phase 4 data cleared", deleted };
  },
});
