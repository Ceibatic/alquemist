/**
 * Supplier Queries and Mutations
 * Supplier management for inventory and purchasing
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { validateEmail, formatColombianPhone } from "./auth";

/**
 * Get suppliers by company
 */
export const getByCompany = query({
  args: {
    companyId: v.id("companies"),
    isActive: v.optional(v.boolean()),
    isApproved: v.optional(v.boolean()),
    productCategory: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let suppliersQuery = ctx.db
      .query("suppliers")
      .withIndex("by_company", (q) => q.eq("company_id", args.companyId));

    let suppliers = await suppliersQuery.collect();

    // Apply filters
    if (args.isActive !== undefined) {
      suppliers = suppliers.filter((s) => s.is_active === args.isActive);
    }

    if (args.isApproved !== undefined) {
      suppliers = suppliers.filter((s) => s.is_approved === args.isApproved);
    }

    if (args.productCategory) {
      suppliers = suppliers.filter((s) =>
        s.product_categories.includes(args.productCategory!)
      );
    }

    return suppliers;
  },
});

/**
 * Get supplier by ID
 */
export const get = query({
  args: {
    id: v.id("suppliers"),
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    const supplier = await ctx.db.get(args.id);

    // Verify company ownership
    if (!supplier || supplier.company_id !== args.companyId) {
      return null;
    }

    return supplier;
  },
});

/**
 * Create a new supplier
 */
export const create = mutation({
  args: {
    companyId: v.id("companies"),

    // Required
    name: v.string(),
    productCategories: v.array(v.string()),

    // Optional basic info
    legalName: v.optional(v.string()),
    taxId: v.optional(v.string()),
    businessType: v.optional(v.string()),
    registrationNumber: v.optional(v.string()),

    // Optional contact
    primaryContactName: v.optional(v.string()),
    primaryContactEmail: v.optional(v.string()),
    primaryContactPhone: v.optional(v.string()),

    // Optional location
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    administrativeDivision1: v.optional(v.string()),
    country: v.optional(v.string()),

    // Optional specialization
    cropSpecialization: v.optional(v.array(v.string())),

    // Optional compliance
    certifications: v.optional(v.array(v.any())),
    licenses: v.optional(v.array(v.any())),

    // Optional financial
    paymentTerms: v.optional(v.string()),
    currency: v.optional(v.string()),

    // Optional metadata
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Validate product categories
    if (!args.productCategories || args.productCategories.length === 0) {
      throw new Error("Debe seleccionar al menos una categoría de producto");
    }

    // Validate email format if provided
    if (args.primaryContactEmail && !validateEmail(args.primaryContactEmail)) {
      throw new Error("Formato de correo electrónico inválido");
    }

    // Format phone number if provided
    let formattedPhone = args.primaryContactPhone;
    if (formattedPhone) {
      formattedPhone = formatColombianPhone(formattedPhone);
    }

    const supplierId = await ctx.db.insert("suppliers", {
      company_id: args.companyId,

      // Basic information
      name: args.name,
      legal_name: args.legalName,
      tax_id: args.taxId,
      business_type: args.businessType,
      registration_number: args.registrationNumber,

      // Contact
      primary_contact_name: args.primaryContactName,
      primary_contact_email: args.primaryContactEmail,
      primary_contact_phone: formattedPhone,

      // Location
      address: args.address,
      city: args.city,
      administrative_division_1: args.administrativeDivision1,
      country: args.country || "CO",

      // Product & Specialization
      product_categories: args.productCategories,
      crop_specialization: args.cropSpecialization || [],

      // Performance (defaults)
      rating: undefined,
      delivery_reliability: undefined,
      quality_score: undefined,

      // Compliance
      certifications: args.certifications,
      licenses: args.licenses,

      // Financial
      payment_terms: args.paymentTerms,
      currency: args.currency || "COP",

      // Metadata
      is_approved: false, // Requires manual approval
      is_active: true,
      notes: args.notes,
      created_at: now,
      updated_at: now,
    });

    return supplierId;
  },
});

/**
 * Update supplier
 */
export const update = mutation({
  args: {
    id: v.id("suppliers"),
    companyId: v.id("companies"),

    // Optional fields
    name: v.optional(v.string()),
    legalName: v.optional(v.string()),
    taxId: v.optional(v.string()),
    businessType: v.optional(v.string()),
    registrationNumber: v.optional(v.string()),

    // Contact
    primaryContactName: v.optional(v.string()),
    primaryContactEmail: v.optional(v.string()),
    primaryContactPhone: v.optional(v.string()),

    // Location
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    administrativeDivision1: v.optional(v.string()),
    country: v.optional(v.string()),

    // Product & Specialization
    productCategories: v.optional(v.array(v.string())),
    cropSpecialization: v.optional(v.array(v.string())),

    // Performance
    rating: v.optional(v.number()),
    deliveryReliability: v.optional(v.number()),
    qualityScore: v.optional(v.number()),

    // Compliance
    certifications: v.optional(v.array(v.any())),
    licenses: v.optional(v.array(v.any())),

    // Financial
    paymentTerms: v.optional(v.string()),
    currency: v.optional(v.string()),

    // Metadata
    isApproved: v.optional(v.boolean()),
    isActive: v.optional(v.boolean()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, companyId, ...updates } = args;

    // Verify company ownership
    const supplier = await ctx.db.get(id);
    if (!supplier || supplier.company_id !== companyId) {
      throw new Error("Proveedor no encontrado o acceso denegado");
    }

    // Validate email format if being updated
    if (updates.primaryContactEmail && !validateEmail(updates.primaryContactEmail)) {
      throw new Error("Formato de correo electrónico inválido");
    }

    // Validate product categories if being updated
    if (updates.productCategories && updates.productCategories.length === 0) {
      throw new Error("Debe seleccionar al menos una categoría de producto");
    }

    // Build update object with proper field names
    const updateData: any = {
      updated_at: Date.now(),
    };

    // Basic information
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.legalName !== undefined) updateData.legal_name = updates.legalName;
    if (updates.taxId !== undefined) updateData.tax_id = updates.taxId;
    if (updates.businessType !== undefined) updateData.business_type = updates.businessType;
    if (updates.registrationNumber !== undefined) {
      updateData.registration_number = updates.registrationNumber;
    }

    // Contact
    if (updates.primaryContactName !== undefined) {
      updateData.primary_contact_name = updates.primaryContactName;
    }
    if (updates.primaryContactEmail !== undefined) {
      updateData.primary_contact_email = updates.primaryContactEmail;
    }
    if (updates.primaryContactPhone !== undefined) {
      updateData.primary_contact_phone = formatColombianPhone(updates.primaryContactPhone);
    }

    // Location
    if (updates.address !== undefined) updateData.address = updates.address;
    if (updates.city !== undefined) updateData.city = updates.city;
    if (updates.administrativeDivision1 !== undefined) {
      updateData.administrative_division_1 = updates.administrativeDivision1;
    }
    if (updates.country !== undefined) updateData.country = updates.country;

    // Product & Specialization
    if (updates.productCategories !== undefined) {
      updateData.product_categories = updates.productCategories;
    }
    if (updates.cropSpecialization !== undefined) {
      updateData.crop_specialization = updates.cropSpecialization;
    }

    // Performance
    if (updates.rating !== undefined) updateData.rating = updates.rating;
    if (updates.deliveryReliability !== undefined) {
      updateData.delivery_reliability = updates.deliveryReliability;
    }
    if (updates.qualityScore !== undefined) updateData.quality_score = updates.qualityScore;

    // Compliance
    if (updates.certifications !== undefined) updateData.certifications = updates.certifications;
    if (updates.licenses !== undefined) updateData.licenses = updates.licenses;

    // Financial
    if (updates.paymentTerms !== undefined) updateData.payment_terms = updates.paymentTerms;
    if (updates.currency !== undefined) updateData.currency = updates.currency;

    // Metadata
    if (updates.isApproved !== undefined) updateData.is_approved = updates.isApproved;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
    if (updates.notes !== undefined) updateData.notes = updates.notes;

    await ctx.db.patch(id, updateData);

    return id;
  },
});

/**
 * Delete supplier (soft delete)
 */
export const remove = mutation({
  args: {
    id: v.id("suppliers"),
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    // Verify company ownership
    const supplier = await ctx.db.get(args.id);
    if (!supplier || supplier.company_id !== args.companyId) {
      throw new Error("Proveedor no encontrado o acceso denegado");
    }

    // Check if supplier has active inventory items or purchase orders
    // For Phase 1, we'll just deactivate
    // In Phase 2, we should check for active POs and inventory

    // Soft delete by setting is_active to false
    await ctx.db.patch(args.id, {
      is_active: false,
      updated_at: Date.now(),
    });

    return args.id;
  },
});
