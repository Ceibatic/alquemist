/**
 * Products Queries and Mutations
 * Product catalog management
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * List products with optional filters
 */
export const list = query({
  args: {
    companyId: v.id("companies"),
    category: v.optional(v.string()),
    status: v.optional(v.string()),
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let productsQuery = ctx.db
      .query("products")
      .withIndex("by_company", (q) => q.eq("company_id", args.companyId));

    // Apply category filter
    if (args.category) {
      productsQuery = productsQuery.filter((q) =>
        q.eq(q.field("category"), args.category)
      );
    }

    // Apply status filter
    if (args.status) {
      productsQuery = productsQuery.filter((q) =>
        q.eq(q.field("status"), args.status)
      );
    }

    const products = await productsQuery.collect();

    // Apply search filter in memory (for name/sku search)
    let filteredProducts = products;
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      filteredProducts = products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.sku.toLowerCase().includes(searchLower)
      );
    }

    // Apply pagination
    const offset = args.offset || 0;
    const limit = args.limit || 50;

    return {
      products: filteredProducts.slice(offset, offset + limit),
      total: filteredProducts.length,
    };
  },
});

/**
 * Get product by ID
 */
export const getById = query({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) {
      return null;
    }

    // Get preferred supplier if exists
    const preferredSupplier = product.preferred_supplier_id
      ? await ctx.db.get(product.preferred_supplier_id)
      : null;

    return {
      ...product,
      preferredSupplierName: preferredSupplier?.name || null,
    };
  },
});

/**
 * Create a new product
 */
export const create = mutation({
  args: {
    companyId: v.id("companies"),
    sku: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    category: v.union(
      v.literal("seed"),
      v.literal("nutrient"),
      v.literal("pesticide"),
      v.literal("equipment"),
      v.literal("substrate"),
      v.literal("container"),
      v.literal("tool"),
      v.literal("clone"),
      v.literal("seedling"),
      v.literal("mother_plant"),
      v.literal("plant_material"),
      v.literal("other")
    ),
    subcategory: v.optional(v.string()),
    default_unit: v.optional(v.string()),

    // Optional fields
    gtin: v.optional(v.string()),
    applicable_crop_type_ids: v.optional(v.array(v.id("crop_types"))),
    brand_id: v.optional(v.string()),
    manufacturer: v.optional(v.string()),
    preferred_supplier_id: v.optional(v.id("suppliers")),

    // Physical properties
    weight_value: v.optional(v.number()),
    weight_unit: v.optional(v.string()),

    // Regulatory
    regulatory_registered: v.optional(v.boolean()),
    regulatory_registration_number: v.optional(v.string()),
    organic_certified: v.optional(v.boolean()),
    organic_cert_number: v.optional(v.string()),

    // Pricing
    default_price: v.optional(v.number()),
    price_currency: v.optional(
      v.union(v.literal("COP"), v.literal("USD"), v.literal("EUR"))
    ),
    price_unit: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");

    const now = Date.now();

    // Sanitize string inputs
    const sanitizedData = {
      sku: args.sku.trim().toUpperCase(),
      name: args.name.trim(),
      description: args.description?.trim(),
      manufacturer: args.manufacturer?.trim(),
      brand_id: args.brand_id?.trim(),
      subcategory: args.subcategory?.trim(),
      regulatory_registration_number: args.regulatory_registration_number?.trim(),
      organic_cert_number: args.organic_cert_number?.trim(),
    };

    // Check if SKU already exists
    const existingProduct = await ctx.db
      .query("products")
      .withIndex("by_sku", (q) => q.eq("sku", sanitizedData.sku))
      .first();

    if (existingProduct) {
      throw new Error(`Product with SKU "${sanitizedData.sku}" already exists`);
    }

    // Validate supplier if provided
    if (args.preferred_supplier_id) {
      const supplier = await ctx.db.get(args.preferred_supplier_id);
      if (!supplier) {
        throw new Error("Preferred supplier not found");
      }
    }

    const productId = await ctx.db.insert("products", {
      company_id: args.companyId,
      sku: sanitizedData.sku,
      gtin: args.gtin,
      name: sanitizedData.name,
      description: sanitizedData.description,
      category: args.category,
      subcategory: sanitizedData.subcategory,
      default_unit: args.default_unit,

      applicable_crop_type_ids: args.applicable_crop_type_ids || [],

      brand_id: sanitizedData.brand_id,
      manufacturer: sanitizedData.manufacturer,
      preferred_supplier_id: args.preferred_supplier_id,
      regional_suppliers: [],

      weight_value: args.weight_value,
      weight_unit: args.weight_unit,
      dimensions_length: undefined,
      dimensions_width: undefined,
      dimensions_height: undefined,
      dimensions_unit: undefined,

      product_metadata: undefined,

      regulatory_registered: args.regulatory_registered || false,
      regulatory_registration_number: sanitizedData.regulatory_registration_number,
      organic_certified: args.organic_certified || false,
      organic_cert_number: sanitizedData.organic_cert_number,

      default_price: args.default_price,
      price_currency: args.price_currency || "COP",
      price_unit: args.price_unit,

      status: "active",
      created_at: now,
      updated_at: now,
    });

    return productId;
  },
});

/**
 * Update a product
 */
export const update = mutation({
  args: {
    productId: v.id("products"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(
      v.union(
        v.literal("seed"),
        v.literal("nutrient"),
        v.literal("pesticide"),
        v.literal("equipment"),
        v.literal("substrate"),
        v.literal("container"),
        v.literal("tool"),
        v.literal("clone"),
        v.literal("seedling"),
        v.literal("mother_plant"),
        v.literal("plant_material"),
        v.literal("other")
      )
    ),
    subcategory: v.optional(v.string()),
    default_unit: v.optional(v.string()),
    preferred_supplier_id: v.optional(v.id("suppliers")),
    default_price: v.optional(v.number()),
    price_currency: v.optional(
      v.union(v.literal("COP"), v.literal("USD"), v.literal("EUR"))
    ),
    price_unit: v.optional(v.string()),
    weight_value: v.optional(v.number()),
    weight_unit: v.optional(v.string()),
    regulatory_registered: v.optional(v.boolean()),
    regulatory_registration_number: v.optional(v.string()),
    organic_certified: v.optional(v.boolean()),
    organic_cert_number: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("discontinued"))),
    // Price history tracking (optional)
    priceChangeReason: v.optional(v.string()),
    priceChangeCategory: v.optional(v.string()),
    priceChangeNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");

    const now = Date.now();

    // Sanitize string inputs if provided
    const sanitizedData: Partial<{
      name: string;
      description: string | undefined;
      subcategory: string | undefined;
      regulatory_registration_number: string | undefined;
      organic_cert_number: string | undefined;
    }> = {};

    if (args.name !== undefined) sanitizedData.name = args.name.trim();
    if (args.description !== undefined) sanitizedData.description = args.description?.trim();
    if (args.subcategory !== undefined) sanitizedData.subcategory = args.subcategory?.trim();
    if (args.regulatory_registration_number !== undefined) {
      sanitizedData.regulatory_registration_number = args.regulatory_registration_number?.trim();
    }
    if (args.organic_cert_number !== undefined) {
      sanitizedData.organic_cert_number = args.organic_cert_number?.trim();
    }

    // Verify product exists
    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // Validate supplier if provided
    if (args.preferred_supplier_id) {
      const supplier = await ctx.db.get(args.preferred_supplier_id);
      if (!supplier) {
        throw new Error("Preferred supplier not found");
      }
    }

    // Check if price is changing and record history
    const priceChanged =
      args.default_price !== undefined &&
      args.default_price !== product.default_price;

    if (priceChanged) {
      await ctx.db.insert("product_price_history", {
        product_id: args.productId,
        old_price: product.default_price,
        new_price: args.default_price!,
        price_currency: product.price_currency || "COP",
        change_type: product.default_price === undefined ? "initial" : "update",
        change_reason: args.priceChangeReason,
        change_category: args.priceChangeCategory,
        changed_by: userId,
        changed_at: now,
        notes: args.priceChangeNotes,
      });
    }

    const updates: Record<string, unknown> = {
      updated_at: now,
    };

    // Only update fields that are provided (use sanitized data)
    if (sanitizedData.name !== undefined) updates.name = sanitizedData.name;
    if (sanitizedData.description !== undefined) updates.description = sanitizedData.description;
    if (args.category !== undefined) updates.category = args.category;
    if (sanitizedData.subcategory !== undefined) updates.subcategory = sanitizedData.subcategory;
    if (args.default_unit !== undefined) updates.default_unit = args.default_unit;
    if (args.preferred_supplier_id !== undefined)
      updates.preferred_supplier_id = args.preferred_supplier_id;
    if (args.default_price !== undefined)
      updates.default_price = args.default_price;
    if (args.price_unit !== undefined) updates.price_unit = args.price_unit;
    if (args.weight_value !== undefined)
      updates.weight_value = args.weight_value;
    if (args.weight_unit !== undefined) updates.weight_unit = args.weight_unit;
    if (args.regulatory_registered !== undefined)
      updates.regulatory_registered = args.regulatory_registered;
    if (sanitizedData.regulatory_registration_number !== undefined)
      updates.regulatory_registration_number =
        sanitizedData.regulatory_registration_number;
    if (args.organic_certified !== undefined)
      updates.organic_certified = args.organic_certified;
    if (sanitizedData.organic_cert_number !== undefined)
      updates.organic_cert_number = sanitizedData.organic_cert_number;
    if (args.status !== undefined) updates.status = args.status;

    await ctx.db.patch(args.productId, updates);

    return {
      success: true,
      message: "Product updated successfully",
      priceChanged,
    };
  },
});

/**
 * Remove/discontinue a product
 */
export const remove = mutation({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");

    const now = Date.now();

    // Verify product exists
    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // Check if product has inventory items
    const inventoryItems = await ctx.db
      .query("inventory_items")
      .withIndex("by_product", (q) => q.eq("product_id", args.productId))
      .collect();

    const hasStock = inventoryItems.some(
      (item) =>
        item.quantity_available > 0 ||
        item.quantity_reserved > 0 ||
        item.quantity_committed > 0
    );

    if (hasStock) {
      // Soft delete - mark as discontinued
      await ctx.db.patch(args.productId, {
        status: "discontinued",
        updated_at: now,
      });

      return {
        success: true,
        message: "Product marked as discontinued (has inventory)",
      };
    }

    // If no inventory with stock, check if any inventory records exist
    if (inventoryItems.length > 0) {
      // Has history but no current stock - soft delete
      await ctx.db.patch(args.productId, {
        status: "discontinued",
        updated_at: now,
      });

      return {
        success: true,
        message: "Product marked as discontinued (has history)",
      };
    }

    // No inventory at all - hard delete
    await ctx.db.delete(args.productId);

    return {
      success: true,
      message: "Product deleted successfully",
    };
  },
});

/**
 * Get products by category
 */
export const getByCategory = query({
  args: {
    companyId: v.id("companies"),
    category: v.string(),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_company", (q) => q.eq("company_id", args.companyId))
      .filter((q) => q.eq(q.field("category"), args.category))
      .collect();

    // Filter by status if provided
    if (args.status) {
      return products.filter((p) => p.status === args.status);
    }

    return products;
  },
});

/**
 * Generate unique SKU for a category
 */
export const generateSku = query({
  args: {
    companyId: v.id("companies"),
    category: v.string(),
    prefix: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get category prefix
    const categoryPrefixes: Record<string, string> = {
      seed: "SEM",
      nutrient: "NUT",
      pesticide: "PES",
      equipment: "EQP",
      substrate: "SUS",
      container: "CON",
      tool: "HER",
      clone: "CLO",
      seedling: "PLT",
      mother_plant: "MAD",
      plant_material: "MAT",
      other: "OTR",
    };

    const prefix = args.prefix || categoryPrefixes[args.category] || "PRD";

    // Get count of products with this category in the company
    const products = await ctx.db
      .query("products")
      .withIndex("by_company", (q) => q.eq("company_id", args.companyId))
      .filter((q) => q.eq(q.field("category"), args.category))
      .collect();

    const nextNumber = products.length + 1;
    const paddedNumber = String(nextNumber).padStart(4, "0");

    return `${prefix}-${paddedNumber}`;
  },
});

/**
 * Check if SKU exists for a company (for real-time validation)
 */
export const checkSkuExists = query({
  args: {
    sku: v.string(),
    companyId: v.id("companies"),
    productId: v.optional(v.id("products")), // Para excluir el producto actual en edición
  },
  handler: async (ctx, args) => {
    // Normalize SKU (trim and uppercase)
    const normalizedSku = args.sku.trim().toUpperCase();

    // Query by company and SKU
    const existingProduct = await ctx.db
      .query("products")
      .withIndex("by_company", (q) => q.eq("company_id", args.companyId))
      .filter((q) => q.eq(q.field("sku"), normalizedSku))
      .first();

    // If editing, ignore the current product
    if (existingProduct && args.productId) {
      return existingProduct._id !== args.productId;
    }

    // Return true if SKU exists
    return existingProduct !== null;
  },
});

// ============================================================================
// PRICE HISTORY
// ============================================================================

/**
 * Get price history for a product
 */
export const getPriceHistory = query({
  args: {
    productId: v.id("products"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    const history = await ctx.db
      .query("product_price_history")
      .withIndex("by_product", (q) => q.eq("product_id", args.productId))
      .order("desc")
      .take(limit);

    // Enrich with user info
    const enrichedHistory = await Promise.all(
      history.map(async (record) => {
        const user = await ctx.db.get(record.changed_by);
        const userName = user
          ? user.first_name && user.last_name
            ? `${user.first_name} ${user.last_name}`
            : user.first_name || user.email
          : "Usuario desconocido";
        return {
          ...record,
          changedByName: userName,
        };
      })
    );

    return enrichedHistory;
  },
});

/**
 * Manually record a price change (for initial setup or corrections)
 */
export const recordPriceChange = mutation({
  args: {
    productId: v.id("products"),
    newPrice: v.number(),
    changeType: v.string(), // initial/update/correction/promotion/cost_increase
    changeReason: v.optional(v.string()),
    changeCategory: v.optional(v.string()), // market_adjustment/supplier_change/inflation/promotion/error_correction
    notes: v.optional(v.string()),
    effectiveDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");

    const now = Date.now();

    // Get current product
    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // Record price history
    await ctx.db.insert("product_price_history", {
      product_id: args.productId,
      old_price: product.default_price,
      new_price: args.newPrice,
      price_currency: product.price_currency || "COP",
      change_type: args.changeType,
      change_reason: args.changeReason,
      change_category: args.changeCategory,
      changed_by: userId,
      changed_at: now,
      notes: args.notes,
      effective_date: args.effectiveDate,
    });

    // Update product price
    await ctx.db.patch(args.productId, {
      default_price: args.newPrice,
      updated_at: now,
    });

    return {
      success: true,
      message: "Price updated and recorded successfully",
    };
  },
});

/**
 * Get price change categories
 */
export const getPriceChangeCategories = query({
  args: {},
  handler: async () => {
    return [
      { value: "market_adjustment", label: "Ajuste de mercado" },
      { value: "supplier_change", label: "Cambio de proveedor" },
      { value: "inflation", label: "Inflación" },
      { value: "promotion", label: "Promoción" },
      { value: "error_correction", label: "Corrección de error" },
      { value: "cost_increase", label: "Aumento de costos" },
      { value: "cost_decrease", label: "Reducción de costos" },
      { value: "new_contract", label: "Nuevo contrato" },
      { value: "other", label: "Otro" },
    ];
  },
});
