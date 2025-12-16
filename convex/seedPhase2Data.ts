/**
 * Phase 2 Seed Data Script
 * Seeds realistic cannabis cultivation data for testing
 * Includes: Cultivars, Suppliers, Products, Inventory Items
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// ============================================================================
// HELPER QUERIES
// ============================================================================

export const getSeedInfo = query({
  args: {},
  handler: async (ctx) => {
    const cropTypes = await ctx.db.query("crop_types").collect();
    const companies = await ctx.db.query("companies").collect();
    const facilities = await ctx.db.query("facilities").collect();
    const areas = await ctx.db.query("areas").collect();

    return {
      cropTypes: cropTypes.map((ct) => ({
        _id: ct._id,
        name: ct.name,
      })),
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
    };
  },
});

// ============================================================================
// CULTIVARS - Cannabis Strains
// ============================================================================

export const seedCultivars = mutation({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Get Cannabis crop type
    const cropTypes = await ctx.db.query("crop_types").collect();
    const cannabisType = cropTypes.find((ct) => ct.name === "Cannabis");

    if (!cannabisType) {
      return {
        success: false,
        message: "Cannabis crop type not found. Please run seedCropTypes first.",
        count: 0,
      };
    }

    // Check if cultivars already exist
    const existingCultivars = await ctx.db
      .query("cultivars")
      .withIndex("by_crop_type", (q) => q.eq("crop_type_id", cannabisType._id))
      .collect();

    if (existingCultivars.length > 0) {
      return {
        success: true,
        message: `Cultivars already exist (${existingCultivars.length} found)`,
        count: existingCultivars.length,
      };
    }

    // Cannabis Strains - Popular varieties for Colombian cultivation
    const cannabisStrains = [
      {
        company_id: args.companyId,
        name: "Blue Dream",
        crop_type_id: cannabisType._id,
        variety_type: "hybrid",
        genetic_lineage: "Blueberry x Haze",
        flowering_time_days: 65,
        thc_min: 17,
        thc_max: 24,
        cbd_min: 0.1,
        cbd_max: 0.2,
        performance_metrics: {},
        status: "active",
        notes: "Aromas: blueberry, sweet, herbal. Efectos: relaxed, creative, euphoric. Excelente para climas tropicales.",
        created_at: now - 180 * 24 * 60 * 60 * 1000,
        updated_at: now,
      },
      {
        company_id: args.companyId,
        name: "OG Kush",
        crop_type_id: cannabisType._id,
        variety_type: "indica",
        genetic_lineage: "Hindu Kush x Chemdawg",
        flowering_time_days: 56,
        thc_min: 20,
        thc_max: 26,
        cbd_min: 0.1,
        cbd_max: 0.3,
        performance_metrics: {},
        status: "active",
        notes: "Aromas: pine, fuel, earthy. Efectos: happy, relaxed, uplifted. Genética estable.",
        created_at: now - 200 * 24 * 60 * 60 * 1000,
        updated_at: now,
      },
      {
        company_id: args.companyId,
        name: "Girl Scout Cookies (GSC)",
        crop_type_id: cannabisType._id,
        variety_type: "hybrid",
        genetic_lineage: "Durban Poison x OG Kush",
        flowering_time_days: 63,
        thc_min: 22,
        thc_max: 28,
        cbd_min: 0.09,
        cbd_max: 0.2,
        performance_metrics: {},
        status: "active",
        notes: "Aromas: sweet, earthy, mint. Efectos: euphoric, relaxed, creative. Alto THC.",
        created_at: now - 150 * 24 * 60 * 60 * 1000,
        updated_at: now,
      },
      {
        company_id: args.companyId,
        name: "White Widow",
        crop_type_id: cannabisType._id,
        variety_type: "hybrid",
        genetic_lineage: "Brazilian Sativa x South Indian Indica",
        flowering_time_days: 60,
        thc_min: 18,
        thc_max: 25,
        cbd_min: 0.1,
        cbd_max: 0.2,
        performance_metrics: {},
        status: "active",
        notes: "Aromas: earthy, woody, pungent. Muy estable, excelente para principiantes.",
        created_at: now - 365 * 24 * 60 * 60 * 1000,
        updated_at: now,
      },
      {
        company_id: args.companyId,
        name: "Gorilla Glue #4",
        crop_type_id: cannabisType._id,
        variety_type: "indica",
        genetic_lineage: "Chem's Sister x Sour Dubb x Chocolate Diesel",
        flowering_time_days: 58,
        thc_min: 25,
        thc_max: 30,
        cbd_min: 0.1,
        cbd_max: 0.1,
        performance_metrics: {},
        status: "active",
        notes: "Aromas: diesel, pine, chocolate. Muy resinosa, ideal para extracciones.",
        created_at: now - 120 * 24 * 60 * 60 * 1000,
        updated_at: now,
      },
      {
        company_id: args.companyId,
        name: "Amnesia Haze",
        crop_type_id: cannabisType._id,
        variety_type: "sativa",
        genetic_lineage: "South Asian x Jamaican x Laos x Afghan Hawaiian",
        flowering_time_days: 77,
        thc_min: 20,
        thc_max: 25,
        cbd_min: 0.1,
        cbd_max: 0.1,
        performance_metrics: {},
        status: "active",
        notes: "Aromas: citrus, lemon, earthy. Floración larga pero alto rendimiento.",
        created_at: now - 90 * 24 * 60 * 60 * 1000,
        updated_at: now,
      },
      {
        company_id: args.companyId,
        name: "Colombian Gold",
        crop_type_id: cannabisType._id,
        variety_type: "sativa",
        genetic_lineage: "Landrace Colombiana (Santa Marta)",
        flowering_time_days: 84,
        thc_min: 16,
        thc_max: 20,
        cbd_min: 0.5,
        cbd_max: 1,
        performance_metrics: {},
        status: "active",
        notes: "Genética nativa colombiana, perfectamente adaptada al clima local. Patrimonio genético.",
        created_at: now - 400 * 24 * 60 * 60 * 1000,
        updated_at: now,
      },
      {
        company_id: args.companyId,
        name: "Critical Mass",
        crop_type_id: cannabisType._id,
        variety_type: "indica",
        genetic_lineage: "Afghani x Skunk #1",
        flowering_time_days: 50,
        thc_min: 19,
        thc_max: 22,
        cbd_min: 5,
        cbd_max: 8,
        performance_metrics: {},
        status: "active",
        notes: "Alto CBD, ideal para uso medicinal. Cogollos muy densos.",
        created_at: now - 60 * 24 * 60 * 60 * 1000,
        updated_at: now,
      },
    ];

    const cultivarIds: Id<"cultivars">[] = [];
    for (const strain of cannabisStrains) {
      const id = await ctx.db.insert("cultivars", strain);
      cultivarIds.push(id);
    }

    return {
      success: true,
      message: `Successfully seeded ${cultivarIds.length} cannabis cultivars`,
      count: cultivarIds.length,
      cultivars: cannabisStrains.map((s) => s.name),
    };
  },
});

// ============================================================================
// SUPPLIERS - Realistic Cannabis Cultivation Suppliers
// ============================================================================

export const seedSuppliers = mutation({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Check if suppliers already exist for this company
    const existingSuppliers = await ctx.db
      .query("suppliers")
      .withIndex("by_company", (q) => q.eq("company_id", args.companyId))
      .collect();

    if (existingSuppliers.length > 0) {
      return {
        success: true,
        message: `Suppliers already exist for this company (${existingSuppliers.length} found)`,
        count: existingSuppliers.length,
      };
    }

    const suppliers = [
      {
        company_id: args.companyId,
        name: "AgroNutrientes Colombia",
        legal_name: "AgroNutrientes Colombia S.A.S.",
        tax_id: "900456789-1",
        business_type: "S.A.S.",
        primary_contact_name: "Carlos Mendoza",
        primary_contact_email: "ventas@agronutrientes.co",
        primary_contact_phone: "+57 316 789 4567",
        address: "Carrera 45 #78-90, Zona Industrial",
        city: "Bogotá",
        administrative_division_1: "Cundinamarca",
        country: "CO",
        product_categories: ["nutrients", "fertilizers", "substrates"],
        crop_specialization: ["cannabis", "flowers"],
        rating: 4.8,
        delivery_reliability: 95,
        quality_score: 92,
        certifications: [
          { name: "ICA", number: "ICA-2024-001", expiry: "2025-12-31" },
          { name: "BPA", number: "BPA-5678", expiry: "2025-06-30" },
        ],
        payment_terms: "Net 30",
        currency: "COP",
        is_approved: true,
        is_active: true,
        notes: "Proveedor principal de nutrientes. Entregas puntuales.",
        created_at: now - 365 * 24 * 60 * 60 * 1000,
        updated_at: now,
      },
      {
        company_id: args.companyId,
        name: "Semillas del Caribe",
        legal_name: "Semillas del Caribe Ltda.",
        tax_id: "800234567-8",
        business_type: "Ltda.",
        primary_contact_name: "María García",
        primary_contact_email: "maria@semillascaribe.com",
        primary_contact_phone: "+57 300 123 4567",
        address: "Calle 50 #12-34",
        city: "Santa Marta",
        administrative_division_1: "Magdalena",
        country: "CO",
        product_categories: ["seeds", "genetics"],
        crop_specialization: ["cannabis"],
        rating: 4.9,
        delivery_reliability: 98,
        quality_score: 96,
        certifications: [
          { name: "ICA Semillas", number: "ICA-SEM-2024-089", expiry: "2025-08-31" },
        ],
        payment_terms: "50% anticipado",
        currency: "COP",
        is_approved: true,
        is_active: true,
        notes: "Especialistas en genética colombiana. Genética Colombian Gold autóctona.",
        created_at: now - 500 * 24 * 60 * 60 * 1000,
        updated_at: now,
      },
      {
        company_id: args.companyId,
        name: "Hidroponía Profesional",
        legal_name: "Hidroponía Profesional de Colombia S.A.",
        tax_id: "901234567-0",
        business_type: "S.A.",
        primary_contact_name: "Andrés López",
        primary_contact_email: "andres@hidroponiapro.co",
        primary_contact_phone: "+57 318 567 8901",
        address: "Avenida El Dorado #68-90",
        city: "Bogotá",
        administrative_division_1: "Cundinamarca",
        country: "CO",
        product_categories: ["equipment", "irrigation", "lighting"],
        crop_specialization: ["cannabis", "vegetables", "flowers"],
        rating: 4.6,
        delivery_reliability: 90,
        quality_score: 88,
        certifications: [],
        payment_terms: "Net 15",
        currency: "COP",
        is_approved: true,
        is_active: true,
        notes: "Sistemas de riego y equipos de iluminación LED de alta eficiencia.",
        created_at: now - 200 * 24 * 60 * 60 * 1000,
        updated_at: now,
      },
      {
        company_id: args.companyId,
        name: "BioControl Colombia",
        legal_name: "BioControl Soluciones Agrícolas S.A.S.",
        tax_id: "900789012-3",
        business_type: "S.A.S.",
        primary_contact_name: "Juliana Martínez",
        primary_contact_email: "juliana@biocontrol.co",
        primary_contact_phone: "+57 311 234 5678",
        address: "Km 5 Vía Chía-Cajicá",
        city: "Chía",
        administrative_division_1: "Cundinamarca",
        country: "CO",
        product_categories: ["pesticides", "biological_control", "preventive"],
        crop_specialization: ["cannabis", "organic"],
        rating: 4.7,
        delivery_reliability: 92,
        quality_score: 94,
        certifications: [
          { name: "Orgánico", number: "ORG-COL-2024-456", expiry: "2025-04-30" },
          { name: "ICA Plaguicidas", number: "ICA-PLAG-789", expiry: "2025-09-30" },
        ],
        payment_terms: "Net 30",
        currency: "COP",
        is_approved: true,
        is_active: true,
        notes: "Control biológico de plagas. Productos orgánicos certificados.",
        created_at: now - 180 * 24 * 60 * 60 * 1000,
        updated_at: now,
      },
      {
        company_id: args.companyId,
        name: "Sustratos Andinos",
        legal_name: "Sustratos Andinos E.U.",
        tax_id: "800567890-4",
        business_type: "E.U.",
        primary_contact_name: "Pedro Ramírez",
        primary_contact_email: "pedro@sustratosandinos.com",
        primary_contact_phone: "+57 314 890 1234",
        address: "Vereda El Roble, Lote 15",
        city: "Zipaquirá",
        administrative_division_1: "Cundinamarca",
        country: "CO",
        product_categories: ["substrates", "amendments", "containers"],
        crop_specialization: ["cannabis", "flowers", "ornamental"],
        rating: 4.5,
        delivery_reliability: 88,
        quality_score: 90,
        certifications: [],
        payment_terms: "Contado",
        currency: "COP",
        is_approved: true,
        is_active: true,
        notes: "Sustratos premium para cannabis. Mezclas personalizadas disponibles.",
        created_at: now - 150 * 24 * 60 * 60 * 1000,
        updated_at: now,
      },
      {
        company_id: args.companyId,
        name: "Iluminación Grow Tech",
        legal_name: "Grow Tech Importaciones S.A.S.",
        tax_id: "901567890-2",
        business_type: "S.A.S.",
        primary_contact_name: "Roberto Sánchez",
        primary_contact_email: "roberto@growtech.co",
        primary_contact_phone: "+57 320 456 7890",
        address: "Zona Franca Fontibón, Bodega 45",
        city: "Bogotá",
        administrative_division_1: "Cundinamarca",
        country: "CO",
        product_categories: ["lighting", "equipment", "climate_control"],
        crop_specialization: ["cannabis"],
        rating: 4.4,
        delivery_reliability: 85,
        quality_score: 91,
        certifications: [],
        payment_terms: "50% anticipado, 50% contra entrega",
        currency: "USD",
        is_approved: true,
        is_active: true,
        notes: "Importador de lámparas LED de alta gama. Garantía extendida.",
        created_at: now - 100 * 24 * 60 * 60 * 1000,
        updated_at: now,
      },
      {
        company_id: args.companyId,
        name: "Cannabis Tools International",
        legal_name: "Cannabis Tools International LLC",
        tax_id: "EIN-98-7654321",
        business_type: "LLC",
        primary_contact_name: "John Smith",
        primary_contact_email: "john@cannabistools.com",
        primary_contact_phone: "+1 303 555 1234",
        address: "1234 Hemp Street",
        city: "Denver",
        administrative_division_1: "Colorado",
        country: "US",
        product_categories: ["tools", "equipment", "automation"],
        crop_specialization: ["cannabis"],
        rating: 4.3,
        delivery_reliability: 82,
        quality_score: 89,
        certifications: [],
        payment_terms: "100% anticipado",
        currency: "USD",
        is_approved: false,
        is_active: true,
        notes: "Proveedor internacional. Tiempos de importación 15-30 días.",
        created_at: now - 45 * 24 * 60 * 60 * 1000,
        updated_at: now,
      },
    ];

    const supplierIds: Id<"suppliers">[] = [];
    for (const supplier of suppliers) {
      const id = await ctx.db.insert("suppliers", supplier);
      supplierIds.push(id);
    }

    return {
      success: true,
      message: `Successfully seeded ${supplierIds.length} suppliers`,
      count: supplierIds.length,
      suppliers: suppliers.map((s) => s.name),
    };
  },
});

// ============================================================================
// PRODUCTS - Cultivation Products
// ============================================================================

export const seedProducts = mutation({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Get crop types
    const cropTypes = await ctx.db.query("crop_types").collect();
    const cannabisType = cropTypes.find((ct) => ct.name === "Cannabis");

    if (!cannabisType) {
      return {
        success: false,
        message: "Cannabis crop type not found.",
        count: 0,
      };
    }

    // Check if products already exist
    const existingProducts = await ctx.db.query("products").collect();
    if (existingProducts.length > 0) {
      return {
        success: true,
        message: `Products already exist (${existingProducts.length} found)`,
        count: existingProducts.length,
      };
    }

    // Get suppliers to link
    const suppliers = await ctx.db
      .query("suppliers")
      .withIndex("by_company", (q) => q.eq("company_id", args.companyId))
      .collect();

    const nutrientSupplier = suppliers.find((s) => s.product_categories.includes("nutrients"));
    const seedSupplier = suppliers.find((s) => s.product_categories.includes("seeds"));
    const equipmentSupplier = suppliers.find((s) => s.product_categories.includes("equipment"));
    const pesticideSupplier = suppliers.find((s) => s.product_categories.includes("pesticides"));
    const substrateSupplier = suppliers.find((s) => s.product_categories.includes("substrates"));

    const products = [
      // NUTRIENTS
      {
        sku: "NUT-BASE-A-001",
        name: "Base Nutrient A - Crecimiento",
        description: "Nutriente base parte A para fase vegetativa. Rico en nitrógeno.",
        category: "nutrient",
        subcategory: "base",
        applicable_crop_type_ids: [cannabisType._id],
        manufacturer: "Advanced Nutrients",
        preferred_supplier_id: nutrientSupplier?._id,
        regional_suppliers: nutrientSupplier ? [nutrientSupplier._id] : [],
        weight_value: 1,
        weight_unit: "L",
        regulatory_registered: true,
        regulatory_registration_number: "ICA-NUT-2024-001",
        organic_certified: false,
        default_price: 85000,
        price_currency: "COP",
        price_unit: "per_unit",
        status: "active",
        created_at: now - 200 * 24 * 60 * 60 * 1000,
        updated_at: now,
      },
      {
        sku: "NUT-BASE-B-001",
        name: "Base Nutrient B - Crecimiento",
        description: "Nutriente base parte B para fase vegetativa. Rico en calcio y magnesio.",
        category: "nutrient",
        subcategory: "base",
        applicable_crop_type_ids: [cannabisType._id],
        manufacturer: "Advanced Nutrients",
        preferred_supplier_id: nutrientSupplier?._id,
        regional_suppliers: nutrientSupplier ? [nutrientSupplier._id] : [],
        weight_value: 1,
        weight_unit: "L",
        regulatory_registered: true,
        regulatory_registration_number: "ICA-NUT-2024-002",
        organic_certified: false,
        default_price: 85000,
        price_currency: "COP",
        price_unit: "per_unit",
        status: "active",
        created_at: now - 200 * 24 * 60 * 60 * 1000,
        updated_at: now,
      },
      {
        sku: "NUT-BLOOM-A-001",
        name: "Bloom Nutrient A - Floración",
        description: "Nutriente floración parte A. Alto en fósforo y potasio.",
        category: "nutrient",
        subcategory: "bloom",
        applicable_crop_type_ids: [cannabisType._id],
        manufacturer: "Advanced Nutrients",
        preferred_supplier_id: nutrientSupplier?._id,
        regional_suppliers: nutrientSupplier ? [nutrientSupplier._id] : [],
        weight_value: 1,
        weight_unit: "L",
        regulatory_registered: true,
        regulatory_registration_number: "ICA-NUT-2024-003",
        organic_certified: false,
        default_price: 95000,
        price_currency: "COP",
        price_unit: "per_unit",
        status: "active",
        created_at: now - 180 * 24 * 60 * 60 * 1000,
        updated_at: now,
      },
      {
        sku: "NUT-BLOOM-B-001",
        name: "Bloom Nutrient B - Floración",
        description: "Nutriente floración parte B. Micronutrientes esenciales.",
        category: "nutrient",
        subcategory: "bloom",
        applicable_crop_type_ids: [cannabisType._id],
        manufacturer: "Advanced Nutrients",
        preferred_supplier_id: nutrientSupplier?._id,
        regional_suppliers: nutrientSupplier ? [nutrientSupplier._id] : [],
        weight_value: 1,
        weight_unit: "L",
        regulatory_registered: true,
        regulatory_registration_number: "ICA-NUT-2024-004",
        organic_certified: false,
        default_price: 95000,
        price_currency: "COP",
        price_unit: "per_unit",
        status: "active",
        created_at: now - 180 * 24 * 60 * 60 * 1000,
        updated_at: now,
      },
      {
        sku: "NUT-CALMAG-001",
        name: "Cal-Mag Plus",
        description: "Suplemento de calcio y magnesio. Previene deficiencias.",
        category: "nutrient",
        subcategory: "supplement",
        applicable_crop_type_ids: [cannabisType._id],
        manufacturer: "General Hydroponics",
        preferred_supplier_id: nutrientSupplier?._id,
        regional_suppliers: nutrientSupplier ? [nutrientSupplier._id] : [],
        weight_value: 1,
        weight_unit: "L",
        regulatory_registered: true,
        regulatory_registration_number: "ICA-NUT-2024-005",
        organic_certified: false,
        default_price: 65000,
        price_currency: "COP",
        price_unit: "per_unit",
        status: "active",
        created_at: now - 150 * 24 * 60 * 60 * 1000,
        updated_at: now,
      },
      {
        sku: "NUT-ROOT-001",
        name: "Root Stimulator",
        description: "Estimulador de raíces orgánico. Mejora desarrollo radicular.",
        category: "nutrient",
        subcategory: "stimulant",
        applicable_crop_type_ids: [cannabisType._id],
        manufacturer: "BioBizz",
        preferred_supplier_id: nutrientSupplier?._id,
        regional_suppliers: nutrientSupplier ? [nutrientSupplier._id] : [],
        weight_value: 250,
        weight_unit: "mL",
        regulatory_registered: true,
        regulatory_registration_number: "ICA-NUT-2024-006",
        organic_certified: true,
        organic_cert_number: "ORG-2024-789",
        default_price: 120000,
        price_currency: "COP",
        price_unit: "per_unit",
        status: "active",
        created_at: now - 120 * 24 * 60 * 60 * 1000,
        updated_at: now,
      },

      // PESTICIDES / BIOLOGICAL CONTROL
      {
        sku: "PEST-NEEM-001",
        name: "Aceite de Neem Orgánico",
        description: "Aceite de neem 100% orgánico. Control de insectos y hongos.",
        category: "pesticide",
        subcategory: "organic",
        applicable_crop_type_ids: [cannabisType._id],
        manufacturer: "BioControl Colombia",
        preferred_supplier_id: pesticideSupplier?._id,
        regional_suppliers: pesticideSupplier ? [pesticideSupplier._id] : [],
        weight_value: 1,
        weight_unit: "L",
        regulatory_registered: true,
        regulatory_registration_number: "ICA-PEST-2024-001",
        organic_certified: true,
        organic_cert_number: "ORG-2024-456",
        default_price: 75000,
        price_currency: "COP",
        price_unit: "per_unit",
        status: "active",
        created_at: now - 100 * 24 * 60 * 60 * 1000,
        updated_at: now,
      },
      {
        sku: "PEST-BT-001",
        name: "Bacillus thuringiensis (Bt)",
        description: "Control biológico de orugas y larvas. Orgánico certificado.",
        category: "pesticide",
        subcategory: "biological",
        applicable_crop_type_ids: [cannabisType._id],
        manufacturer: "BioControl Colombia",
        preferred_supplier_id: pesticideSupplier?._id,
        regional_suppliers: pesticideSupplier ? [pesticideSupplier._id] : [],
        weight_value: 500,
        weight_unit: "g",
        regulatory_registered: true,
        regulatory_registration_number: "ICA-BIO-2024-002",
        organic_certified: true,
        organic_cert_number: "ORG-2024-457",
        default_price: 180000,
        price_currency: "COP",
        price_unit: "per_unit",
        status: "active",
        created_at: now - 90 * 24 * 60 * 60 * 1000,
        updated_at: now,
      },
      {
        sku: "PEST-TRICHO-001",
        name: "Trichoderma harzianum",
        description: "Hongo benéfico para control de patógenos del suelo.",
        category: "pesticide",
        subcategory: "biological",
        applicable_crop_type_ids: [cannabisType._id],
        manufacturer: "BioControl Colombia",
        preferred_supplier_id: pesticideSupplier?._id,
        regional_suppliers: pesticideSupplier ? [pesticideSupplier._id] : [],
        weight_value: 100,
        weight_unit: "g",
        regulatory_registered: true,
        regulatory_registration_number: "ICA-BIO-2024-003",
        organic_certified: true,
        organic_cert_number: "ORG-2024-458",
        default_price: 95000,
        price_currency: "COP",
        price_unit: "per_unit",
        status: "active",
        created_at: now - 85 * 24 * 60 * 60 * 1000,
        updated_at: now,
      },

      // SUBSTRATES
      {
        sku: "SUB-COCO-001",
        name: "Fibra de Coco Premium",
        description: "Sustrato de fibra de coco lavada y buffereada. 70L.",
        category: "substrate",
        subcategory: "coco",
        applicable_crop_type_ids: [cannabisType._id],
        manufacturer: "Sustratos Andinos",
        preferred_supplier_id: substrateSupplier?._id,
        regional_suppliers: substrateSupplier ? [substrateSupplier._id] : [],
        weight_value: 70,
        weight_unit: "L",
        regulatory_registered: false,
        organic_certified: true,
        organic_cert_number: "ORG-2024-SUB-001",
        default_price: 45000,
        price_currency: "COP",
        price_unit: "per_unit",
        status: "active",
        created_at: now - 150 * 24 * 60 * 60 * 1000,
        updated_at: now,
      },
      {
        sku: "SUB-PERLITE-001",
        name: "Perlita Expandida",
        description: "Perlita agrícola para mejora de drenaje. 100L.",
        category: "substrate",
        subcategory: "amendment",
        applicable_crop_type_ids: [cannabisType._id],
        manufacturer: "Sustratos Andinos",
        preferred_supplier_id: substrateSupplier?._id,
        regional_suppliers: substrateSupplier ? [substrateSupplier._id] : [],
        weight_value: 100,
        weight_unit: "L",
        regulatory_registered: false,
        organic_certified: false,
        default_price: 55000,
        price_currency: "COP",
        price_unit: "per_unit",
        status: "active",
        created_at: now - 140 * 24 * 60 * 60 * 1000,
        updated_at: now,
      },
      {
        sku: "SUB-MIX-CANNABIS-001",
        name: "Cannabis Pro Mix",
        description: "Mezcla premium: 60% coco, 30% perlita, 10% humus. Optimizado para cannabis.",
        category: "substrate",
        subcategory: "mix",
        applicable_crop_type_ids: [cannabisType._id],
        manufacturer: "Sustratos Andinos",
        preferred_supplier_id: substrateSupplier?._id,
        regional_suppliers: substrateSupplier ? [substrateSupplier._id] : [],
        weight_value: 50,
        weight_unit: "L",
        regulatory_registered: false,
        organic_certified: true,
        organic_cert_number: "ORG-2024-SUB-002",
        default_price: 65000,
        price_currency: "COP",
        price_unit: "per_unit",
        status: "active",
        created_at: now - 60 * 24 * 60 * 60 * 1000,
        updated_at: now,
      },

      // EQUIPMENT
      {
        sku: "EQ-LED-600W-001",
        name: "LED Full Spectrum 600W",
        description: "Lámpara LED espectro completo. Samsung LM301H. Eficiencia 2.7 μmol/J.",
        category: "equipment",
        subcategory: "lighting",
        applicable_crop_type_ids: [cannabisType._id],
        manufacturer: "Grow Tech",
        preferred_supplier_id: equipmentSupplier?._id,
        regional_suppliers: equipmentSupplier ? [equipmentSupplier._id] : [],
        dimensions_length: 110,
        dimensions_width: 55,
        dimensions_height: 8,
        dimensions_unit: "cm",
        regulatory_registered: false,
        organic_certified: false,
        default_price: 2800000,
        price_currency: "COP",
        price_unit: "per_unit",
        status: "active",
        created_at: now - 120 * 24 * 60 * 60 * 1000,
        updated_at: now,
      },
      {
        sku: "EQ-FAN-OSC-001",
        name: "Ventilador Oscilante 16\"",
        description: "Ventilador de pedestal oscilante. 3 velocidades.",
        category: "equipment",
        subcategory: "climate",
        applicable_crop_type_ids: [cannabisType._id],
        manufacturer: "Industrial Fans",
        preferred_supplier_id: equipmentSupplier?._id,
        regional_suppliers: equipmentSupplier ? [equipmentSupplier._id] : [],
        regulatory_registered: false,
        organic_certified: false,
        default_price: 180000,
        price_currency: "COP",
        price_unit: "per_unit",
        status: "active",
        created_at: now - 100 * 24 * 60 * 60 * 1000,
        updated_at: now,
      },
      {
        sku: "EQ-DEHUM-001",
        name: "Deshumidificador Industrial 50L/día",
        description: "Deshumidificador capacidad 50L/día. Control digital de humedad.",
        category: "equipment",
        subcategory: "climate",
        applicable_crop_type_ids: [cannabisType._id],
        manufacturer: "Climate Master",
        preferred_supplier_id: equipmentSupplier?._id,
        regional_suppliers: equipmentSupplier ? [equipmentSupplier._id] : [],
        regulatory_registered: false,
        organic_certified: false,
        default_price: 1500000,
        price_currency: "COP",
        price_unit: "per_unit",
        status: "active",
        created_at: now - 80 * 24 * 60 * 60 * 1000,
        updated_at: now,
      },

      // CONTAINERS
      {
        sku: "CONT-FABRIC-20L-001",
        name: "Maceta de Tela 20L",
        description: "Maceta fabric pot 20L. Promueve poda aérea de raíces.",
        category: "container",
        subcategory: "fabric_pot",
        applicable_crop_type_ids: [cannabisType._id],
        manufacturer: "Root Pouch",
        preferred_supplier_id: substrateSupplier?._id,
        regional_suppliers: substrateSupplier ? [substrateSupplier._id] : [],
        regulatory_registered: false,
        organic_certified: false,
        default_price: 12000,
        price_currency: "COP",
        price_unit: "per_unit",
        status: "active",
        created_at: now - 90 * 24 * 60 * 60 * 1000,
        updated_at: now,
      },
      {
        sku: "CONT-FABRIC-10L-001",
        name: "Maceta de Tela 10L",
        description: "Maceta fabric pot 10L. Ideal para vegetativo.",
        category: "container",
        subcategory: "fabric_pot",
        applicable_crop_type_ids: [cannabisType._id],
        manufacturer: "Root Pouch",
        preferred_supplier_id: substrateSupplier?._id,
        regional_suppliers: substrateSupplier ? [substrateSupplier._id] : [],
        regulatory_registered: false,
        organic_certified: false,
        default_price: 8000,
        price_currency: "COP",
        price_unit: "per_unit",
        status: "active",
        created_at: now - 90 * 24 * 60 * 60 * 1000,
        updated_at: now,
      },

      // TOOLS
      {
        sku: "TOOL-TRIM-001",
        name: "Tijeras de Poda Profesional",
        description: "Tijeras de poda de precisión. Acero inoxidable. Para manicurado.",
        category: "tool",
        subcategory: "cutting",
        applicable_crop_type_ids: [cannabisType._id],
        manufacturer: "Fiskars",
        preferred_supplier_id: equipmentSupplier?._id,
        regional_suppliers: equipmentSupplier ? [equipmentSupplier._id] : [],
        regulatory_registered: false,
        organic_certified: false,
        default_price: 45000,
        price_currency: "COP",
        price_unit: "per_unit",
        status: "active",
        created_at: now - 60 * 24 * 60 * 60 * 1000,
        updated_at: now,
      },
      {
        sku: "TOOL-PHEC-001",
        name: "Medidor pH/EC Digital",
        description: "Medidor combo pH y EC. Calibración automática. Resistente al agua.",
        category: "tool",
        subcategory: "measuring",
        applicable_crop_type_ids: [cannabisType._id],
        manufacturer: "Bluelab",
        preferred_supplier_id: equipmentSupplier?._id,
        regional_suppliers: equipmentSupplier ? [equipmentSupplier._id] : [],
        regulatory_registered: false,
        organic_certified: false,
        default_price: 650000,
        price_currency: "COP",
        price_unit: "per_unit",
        status: "active",
        created_at: now - 50 * 24 * 60 * 60 * 1000,
        updated_at: now,
      },
      {
        sku: "TOOL-LUPE-001",
        name: "Lupa Joyero 60x LED",
        description: "Lupa de aumento 60x con luz LED. Para inspección de tricomas.",
        category: "tool",
        subcategory: "inspection",
        applicable_crop_type_ids: [cannabisType._id],
        manufacturer: "Generic",
        preferred_supplier_id: equipmentSupplier?._id,
        regional_suppliers: equipmentSupplier ? [equipmentSupplier._id] : [],
        regulatory_registered: false,
        organic_certified: false,
        default_price: 25000,
        price_currency: "COP",
        price_unit: "per_unit",
        status: "active",
        created_at: now - 45 * 24 * 60 * 60 * 1000,
        updated_at: now,
      },

      // SEEDS
      {
        sku: "SEED-BLUEDREAM-FEM-5",
        name: "Blue Dream Feminizada (5 pack)",
        description: "Semillas feminizadas Blue Dream. Genética premium verificada.",
        category: "seed",
        subcategory: "feminized",
        applicable_crop_type_ids: [cannabisType._id],
        manufacturer: "Humboldt Seeds",
        preferred_supplier_id: seedSupplier?._id,
        regional_suppliers: seedSupplier ? [seedSupplier._id] : [],
        regulatory_registered: true,
        regulatory_registration_number: "ICA-SEM-2024-BD01",
        organic_certified: false,
        default_price: 350000,
        price_currency: "COP",
        price_unit: "per_unit",
        status: "active",
        created_at: now - 30 * 24 * 60 * 60 * 1000,
        updated_at: now,
      },
      {
        sku: "SEED-COLGOLD-REG-10",
        name: "Colombian Gold Regular (10 pack)",
        description: "Semillas regulares Colombian Gold. Landrace autóctona Santa Marta.",
        category: "seed",
        subcategory: "regular",
        applicable_crop_type_ids: [cannabisType._id],
        manufacturer: "Semillas del Caribe",
        preferred_supplier_id: seedSupplier?._id,
        regional_suppliers: seedSupplier ? [seedSupplier._id] : [],
        regulatory_registered: true,
        regulatory_registration_number: "ICA-SEM-2024-CG01",
        organic_certified: true,
        organic_cert_number: "ORG-2024-SEM-001",
        default_price: 280000,
        price_currency: "COP",
        price_unit: "per_unit",
        status: "active",
        created_at: now - 25 * 24 * 60 * 60 * 1000,
        updated_at: now,
      },
    ];

    const productIds: Id<"products">[] = [];
    for (const product of products) {
      const id = await ctx.db.insert("products", product);
      productIds.push(id);
    }

    return {
      success: true,
      message: `Successfully seeded ${productIds.length} products`,
      count: productIds.length,
      products: products.map((p) => p.name),
    };
  },
});

// ============================================================================
// INVENTORY ITEMS - Stock in Areas
// ============================================================================

export const seedInventory = mutation({
  args: {
    facilityId: v.id("facilities"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Get areas for this facility
    const areas = await ctx.db
      .query("areas")
      .withIndex("by_facility", (q) => q.eq("facility_id", args.facilityId))
      .collect();

    if (areas.length === 0) {
      return {
        success: false,
        message: "No areas found for this facility. Please run seedAreas first.",
        count: 0,
      };
    }

    // Get storage area
    const storageArea = areas.find((a) => a.area_type === "storage");
    const propagationArea = areas.find((a) => a.area_type === "propagation");
    const vegetativeArea = areas.find((a) => a.area_type === "vegetative");
    const floweringArea = areas.find((a) => a.area_type === "flowering");

    if (!storageArea) {
      return {
        success: false,
        message: "No storage area found. Please ensure seedAreas includes a storage area.",
        count: 0,
      };
    }

    // Check if inventory already exists
    const existingInventory = await ctx.db
      .query("inventory_items")
      .withIndex("by_area", (q) => q.eq("area_id", storageArea._id))
      .collect();

    if (existingInventory.length > 0) {
      return {
        success: true,
        message: `Inventory already exists for this facility (${existingInventory.length} items found)`,
        count: existingInventory.length,
      };
    }

    // Get products
    const products = await ctx.db.query("products").collect();
    if (products.length === 0) {
      return {
        success: false,
        message: "No products found. Please run seedProducts first.",
        count: 0,
      };
    }

    // Get suppliers
    const facility = await ctx.db.get(args.facilityId);
    if (!facility) {
      return { success: false, message: "Facility not found", count: 0 };
    }

    const suppliers = await ctx.db
      .query("suppliers")
      .withIndex("by_company", (q) => q.eq("company_id", facility.company_id))
      .collect();

    // Create inventory items
    const inventoryData: Array<{
      product_id: Id<"products">;
      area_id: Id<"areas">;
      supplier_id?: Id<"suppliers">;
      quantity_available: number;
      quantity_reserved: number;
      quantity_committed: number;
      quantity_unit: string;
      batch_number: string;
      received_date: number;
      expiration_date?: number;
      purchase_price: number;
      current_value: number;
      cost_per_unit: number;
      quality_grade: string;
      lot_status: string;
      minimum_stock_level: number;
      reorder_point: number;
      serial_numbers: string[];
      certificates: unknown[];
      last_movement_date: number;
      notes?: string;
      created_at: number;
      updated_at: number;
    }> = [];

    for (const product of products) {
      const supplier = suppliers.find((s) =>
        s._id === product.preferred_supplier_id ||
        product.regional_suppliers.includes(s._id)
      );

      // Determine which area based on product category
      let targetArea = storageArea;
      if (product.category === "nutrient" && (propagationArea || vegetativeArea)) {
        targetArea = vegetativeArea || propagationArea || storageArea;
      }

      // Calculate quantities based on product type
      let quantity = 0;
      let unit = "units";
      let minStock = 5;
      let reorderPoint = 10;

      if (product.weight_unit) {
        unit = product.weight_unit;
      }

      switch (product.category) {
        case "nutrient":
          quantity = Math.floor(Math.random() * 15) + 5; // 5-20 units
          minStock = 3;
          reorderPoint = 5;
          break;
        case "pesticide":
          quantity = Math.floor(Math.random() * 8) + 2; // 2-10 units
          minStock = 2;
          reorderPoint = 4;
          break;
        case "substrate":
          quantity = Math.floor(Math.random() * 30) + 10; // 10-40 units
          minStock = 10;
          reorderPoint = 20;
          break;
        case "equipment":
          quantity = Math.floor(Math.random() * 5) + 1; // 1-6 units
          minStock = 1;
          reorderPoint = 2;
          break;
        case "container":
          quantity = Math.floor(Math.random() * 100) + 50; // 50-150 units
          minStock = 30;
          reorderPoint = 50;
          break;
        case "tool":
          quantity = Math.floor(Math.random() * 10) + 3; // 3-13 units
          minStock = 2;
          reorderPoint = 5;
          break;
        case "seed":
          quantity = Math.floor(Math.random() * 10) + 2; // 2-12 packs
          minStock = 2;
          reorderPoint = 4;
          break;
        default:
          quantity = Math.floor(Math.random() * 10) + 5;
      }

      const purchasePrice = product.default_price || 50000;
      const batchNumber = `LOT-${product.sku}-${Date.now().toString(36).toUpperCase()}`;
      const receivedDate = now - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000; // 0-60 days ago

      // Expiration date for perishables (nutrients, pesticides, substrates)
      let expirationDate: number | undefined;
      if (["nutrient", "pesticide", "substrate"].includes(product.category)) {
        expirationDate = receivedDate + 365 * 24 * 60 * 60 * 1000; // 1 year from received
      }

      inventoryData.push({
        product_id: product._id,
        area_id: targetArea._id,
        supplier_id: supplier?._id,
        quantity_available: quantity,
        quantity_reserved: 0,
        quantity_committed: 0,
        quantity_unit: unit,
        batch_number: batchNumber,
        received_date: receivedDate,
        expiration_date: expirationDate,
        purchase_price: purchasePrice * quantity,
        current_value: purchasePrice * quantity,
        cost_per_unit: purchasePrice,
        quality_grade: "A",
        lot_status: "available",
        minimum_stock_level: minStock,
        reorder_point: reorderPoint,
        serial_numbers: [],
        certificates: [],
        last_movement_date: now,
        notes: `Inventario inicial - ${product.name}`,
        created_at: receivedDate,
        updated_at: now,
      });
    }

    // Add some items with low stock to test alerts
    const lowStockItems = inventoryData.slice(0, 3);
    lowStockItems.forEach((item) => {
      item.quantity_available = Math.max(1, item.minimum_stock_level - 1);
      item.notes = "STOCK BAJO - Reordenar pronto";
    });

    const inventoryIds: Id<"inventory_items">[] = [];
    for (const item of inventoryData) {
      const id = await ctx.db.insert("inventory_items", item);
      inventoryIds.push(id);
    }

    return {
      success: true,
      message: `Successfully seeded ${inventoryIds.length} inventory items`,
      count: inventoryIds.length,
      lowStockCount: 3,
    };
  },
});

// ============================================================================
// MASTER SEED - Run all seeds in sequence
// ============================================================================

export const seedAllPhase2Data = mutation({
  args: {
    companyId: v.id("companies"),
    facilityId: v.id("facilities"),
  },
  handler: async (ctx, args) => {
    const results: string[] = [];

    // Note: In Convex mutations, we can't call other mutations directly
    // This is a documentation helper - run each seed separately
    results.push("To seed all Phase 2 data, run these commands in order:");
    results.push("1. npx convex run seedAreas:seedAreas --args '{\"facilityId\": \"" + args.facilityId + "\"}'");
    results.push("2. npx convex run seedPhase2Data:seedCultivars --args '{\"companyId\": \"" + args.companyId + "\"}'");
    results.push("3. npx convex run seedPhase2Data:seedSuppliers --args '{\"companyId\": \"" + args.companyId + "\"}'");
    results.push("4. npx convex run seedPhase2Data:seedProducts --args '{\"companyId\": \"" + args.companyId + "\"}'");
    results.push("5. npx convex run seedPhase2Data:seedInventory --args '{\"facilityId\": \"" + args.facilityId + "\"}'");

    return {
      success: true,
      message: "See instructions below",
      instructions: results,
    };
  },
});

// ============================================================================
// CLEAR DATA - For testing/reset
// ============================================================================

export const clearCultivars = mutation({
  args: {},
  handler: async (ctx) => {
    const cultivars = await ctx.db.query("cultivars").collect();
    for (const cultivar of cultivars) {
      await ctx.db.delete(cultivar._id);
    }
    return { success: true, deleted: cultivars.length };
  },
});

export const clearSuppliers = mutation({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    const suppliers = await ctx.db
      .query("suppliers")
      .withIndex("by_company", (q) => q.eq("company_id", args.companyId))
      .collect();
    for (const supplier of suppliers) {
      await ctx.db.delete(supplier._id);
    }
    return { success: true, deleted: suppliers.length };
  },
});

export const clearProducts = mutation({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    for (const product of products) {
      await ctx.db.delete(product._id);
    }
    return { success: true, deleted: products.length };
  },
});

export const clearInventory = mutation({
  args: {
    facilityId: v.id("facilities"),
  },
  handler: async (ctx, args) => {
    const areas = await ctx.db
      .query("areas")
      .withIndex("by_facility", (q) => q.eq("facility_id", args.facilityId))
      .collect();

    let deleted = 0;
    for (const area of areas) {
      const items = await ctx.db
        .query("inventory_items")
        .withIndex("by_area", (q) => q.eq("area_id", area._id))
        .collect();
      for (const item of items) {
        await ctx.db.delete(item._id);
        deleted++;
      }
    }
    return { success: true, deleted };
  },
});
