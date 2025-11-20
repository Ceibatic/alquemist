/**
 * Other Crops Management
 * Phase 2 Module 17
 * Track non-primary crops (companion plants, experimental varieties, etc.)
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Create other crop entry
 * Phase 2 Module 17
 */
export const create = mutation({
  args: {
    facilityId: v.id("facilities"),
    name: v.string(),
    category: v.string(), // "herbs" | "vegetables" | "fruits" | "ornamental" | "experimental" | "other"
    purpose: v.string(), // "companion_planting" | "pest_control" | "experimental" | "diversification" | "other"
    quantity: v.optional(v.number()),
    unit: v.optional(v.string()),
    plantingDate: v.optional(v.number()),
    expectedHarvestDate: v.optional(v.number()),
    locationNotes: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Verify facility exists
    const facility = await ctx.db.get(args.facilityId);
    if (!facility) {
      throw new Error("Facility not found");
    }

    // Validate category
    const validCategories = ["herbs", "vegetables", "fruits", "ornamental", "experimental", "other"];
    if (!validCategories.includes(args.category)) {
      throw new Error(`Invalid category. Use one of: ${validCategories.join(", ")}`);
    }

    // Validate purpose
    const validPurposes = ["companion_planting", "pest_control", "experimental", "diversification", "other"];
    if (!validPurposes.includes(args.purpose)) {
      throw new Error(`Invalid purpose. Use one of: ${validPurposes.join(", ")}`);
    }

    // Check for duplicate name in same facility
    const existingCrop = await ctx.db
      .query("other_crops")
      .filter((q) =>
        q.and(
          q.eq(q.field("facility_id"), args.facilityId),
          q.eq(q.field("name"), args.name)
        )
      )
      .first();

    if (existingCrop) {
      throw new Error(`A crop named "${args.name}" already exists in this facility`);
    }

    // Create other crop
    const cropId = await ctx.db.insert("other_crops", {
      facility_id: args.facilityId,
      name: args.name,
      category: args.category,
      purpose: args.purpose,
      quantity: args.quantity,
      unit: args.unit,
      planting_date: args.plantingDate,
      expected_harvest_date: args.expectedHarvestDate,
      location_notes: args.locationNotes,
      notes: args.notes,
      status: "active",
      created_at: now,
      updated_at: now,
    });

    return {
      success: true,
      cropId,
      message: "Other crop created successfully",
    };
  },
});

/**
 * Get other crops by facility
 * Phase 2 Module 17
 */
export const getByFacility = query({
  args: {
    facilityId: v.id("facilities"),
    category: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Query crops for this facility
    let crops = await ctx.db
      .query("other_crops")
      .filter((q) => q.eq(q.field("facility_id"), args.facilityId))
      .collect();

    // Apply category filter if provided
    if (args.category) {
      crops = crops.filter((crop) => crop.category === args.category);
    }

    // Apply status filter if provided
    if (args.status) {
      crops = crops.filter((crop) => crop.status === args.status);
    }

    // Enrich with calculated fields
    const enrichedCrops = crops.map((crop) => {
      const now = Date.now();

      let harvestStatus = "pending";
      if (crop.expected_harvest_date) {
        const daysUntilHarvest = Math.floor((crop.expected_harvest_date - now) / (1000 * 60 * 60 * 24));
        if (daysUntilHarvest < 0) {
          harvestStatus = "overdue";
        } else if (daysUntilHarvest <= 7) {
          harvestStatus = "ready_soon";
        } else {
          harvestStatus = "growing";
        }
      }

      let daysPlanted = undefined;
      if (crop.planting_date) {
        daysPlanted = Math.floor((now - crop.planting_date) / (1000 * 60 * 60 * 24));
      }

      return {
        ...crop,
        harvestStatus,
        daysPlanted,
      };
    });

    return enrichedCrops;
  },
});

/**
 * Get single other crop by ID
 * Phase 2 Module 17
 */
export const getById = query({
  args: {
    cropId: v.id("other_crops"),
  },
  handler: async (ctx, args) => {
    const crop = await ctx.db.get(args.cropId);
    if (!crop) {
      return null;
    }

    // Get facility details
    const facility = crop.facility_id ? await ctx.db.get(crop.facility_id) : null;

    // Calculate status fields
    const now = Date.now();

    let harvestStatus = "pending";
    if (crop.expected_harvest_date) {
      const daysUntilHarvest = Math.floor((crop.expected_harvest_date - now) / (1000 * 60 * 60 * 24));
      if (daysUntilHarvest < 0) {
        harvestStatus = "overdue";
      } else if (daysUntilHarvest <= 7) {
        harvestStatus = "ready_soon";
      } else {
        harvestStatus = "growing";
      }
    }

    let daysPlanted = undefined;
    if (crop.planting_date) {
      daysPlanted = Math.floor((now - crop.planting_date) / (1000 * 60 * 60 * 24));
    }

    return {
      ...crop,
      facilityName: facility?.name || null,
      harvestStatus,
      daysPlanted,
    };
  },
});

/**
 * Update other crop
 * Phase 2 Module 17
 */
export const update = mutation({
  args: {
    cropId: v.id("other_crops"),
    name: v.optional(v.string()),
    category: v.optional(v.string()),
    purpose: v.optional(v.string()),
    quantity: v.optional(v.number()),
    unit: v.optional(v.string()),
    plantingDate: v.optional(v.number()),
    expectedHarvestDate: v.optional(v.number()),
    locationNotes: v.optional(v.string()),
    notes: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Verify crop exists
    const crop = await ctx.db.get(args.cropId);
    if (!crop) {
      throw new Error("Crop not found");
    }

    const updates: any = {
      updated_at: now,
    };

    // Validate and update category if provided
    if (args.category !== undefined) {
      const validCategories = ["herbs", "vegetables", "fruits", "ornamental", "experimental", "other"];
      if (!validCategories.includes(args.category)) {
        throw new Error(`Invalid category. Use one of: ${validCategories.join(", ")}`);
      }
      updates.category = args.category;
    }

    // Validate and update purpose if provided
    if (args.purpose !== undefined) {
      const validPurposes = ["companion_planting", "pest_control", "experimental", "diversification", "other"];
      if (!validPurposes.includes(args.purpose)) {
        throw new Error(`Invalid purpose. Use one of: ${validPurposes.join(", ")}`);
      }
      updates.purpose = args.purpose;
    }

    // Validate and update status if provided
    if (args.status !== undefined) {
      const validStatuses = ["active", "harvested", "removed", "failed"];
      if (!validStatuses.includes(args.status)) {
        throw new Error(`Invalid status. Use one of: ${validStatuses.join(", ")}`);
      }
      updates.status = args.status;
    }

    // Check for name conflicts if name is being changed
    if (args.name !== undefined && args.name !== crop.name) {
      const existingCrop = await ctx.db
        .query("other_crops")
        .filter((q) =>
          q.and(
            q.eq(q.field("facility_id"), crop.facility_id),
            q.eq(q.field("name"), args.name)
          )
        )
        .first();

      if (existingCrop) {
        throw new Error(`A crop named "${args.name}" already exists in this facility`);
      }
      updates.name = args.name;
    }

    // Update other optional fields
    if (args.quantity !== undefined) updates.quantity = args.quantity;
    if (args.unit !== undefined) updates.unit = args.unit;
    if (args.plantingDate !== undefined) updates.planting_date = args.plantingDate;
    if (args.expectedHarvestDate !== undefined) updates.expected_harvest_date = args.expectedHarvestDate;
    if (args.locationNotes !== undefined) updates.location_notes = args.locationNotes;
    if (args.notes !== undefined) updates.notes = args.notes;

    await ctx.db.patch(args.cropId, updates);

    return {
      success: true,
      message: "Crop updated successfully",
    };
  },
});

/**
 * Delete other crop (soft delete)
 * Phase 2 Module 17
 */
export const remove = mutation({
  args: {
    cropId: v.id("other_crops"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Verify crop exists
    const crop = await ctx.db.get(args.cropId);
    if (!crop) {
      throw new Error("Crop not found");
    }

    // Check if crop is already inactive
    if (crop.status === "removed" || crop.status === "harvested") {
      // Hard delete if already marked as removed/harvested
      await ctx.db.delete(args.cropId);
      return {
        success: true,
        message: "Crop deleted successfully",
      };
    }

    // Soft delete - mark as removed
    await ctx.db.patch(args.cropId, {
      status: "removed",
      updated_at: now,
    });

    return {
      success: true,
      message: "Crop marked as removed (soft delete)",
    };
  },
});
