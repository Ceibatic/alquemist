/**
 * Recipes Queries and Mutations
 * Recipe management and execution with inventory consumption
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * List recipes for a company
 */
export const list = query({
  args: {
    companyId: v.id("companies"),
    recipe_type: v.optional(v.string()),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let recipesQuery = ctx.db
      .query("recipes")
      .withIndex("by_company", (q) => q.eq("company_id", args.companyId));

    const recipes = await recipesQuery.collect();

    // Apply filters in memory
    let filteredRecipes = recipes;

    if (args.recipe_type) {
      filteredRecipes = filteredRecipes.filter(
        (r) => r.recipe_type === args.recipe_type
      );
    }

    if (args.status) {
      filteredRecipes = filteredRecipes.filter((r) => r.status === args.status);
    }

    // Apply pagination
    const offset = args.offset || 0;
    const limit = args.limit || 50;

    return {
      recipes: filteredRecipes.slice(offset, offset + limit),
      total: filteredRecipes.length,
    };
  },
});

/**
 * Get recipe by ID with enriched ingredient data
 */
export const getById = query({
  args: {
    recipeId: v.id("recipes"),
  },
  handler: async (ctx, args) => {
    const recipe = await ctx.db.get(args.recipeId);
    if (!recipe) {
      return null;
    }

    // Enrich ingredients with product names
    const enrichedIngredients = await Promise.all(
      (recipe.ingredients || []).map(async (ingredient: any) => {
        if (ingredient.product_id) {
          const product = await ctx.db.get(ingredient.product_id as Id<"products">);
          return {
            ...ingredient,
            productName: product?.name || "Unknown Product",
            productSku: product?.sku || null,
          };
        }
        return ingredient;
      })
    );

    return {
      ...recipe,
      ingredients: enrichedIngredients,
    };
  },
});

/**
 * Create a new recipe
 */
export const create = mutation({
  args: {
    companyId: v.id("companies"),
    name: v.string(),
    description: v.optional(v.string()),
    recipe_type: v.string(),
    applicable_crop_types: v.optional(v.array(v.id("crop_types"))),
    applicable_growth_stages: v.optional(v.array(v.string())),

    // Ingredients: array of { product_id, quantity, unit }
    ingredients: v.array(
      v.object({
        product_id: v.id("products"),
        quantity: v.number(),
        unit: v.string(),
      })
    ),

    // Output
    output_quantity: v.optional(v.number()),
    output_unit: v.optional(v.string()),
    batch_size: v.optional(v.number()),

    // Instructions
    preparation_steps: v.optional(v.array(v.string())),
    application_method: v.optional(v.string()),
    storage_instructions: v.optional(v.string()),
    shelf_life_hours: v.optional(v.number()),

    // Target parameters
    target_ph: v.optional(v.number()),
    target_ec: v.optional(v.number()),

    // Cost
    estimated_cost: v.optional(v.number()),

    created_by: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Validate all products exist
    for (const ingredient of args.ingredients) {
      const product = await ctx.db.get(ingredient.product_id);
      if (!product) {
        throw new Error(`Product ${ingredient.product_id} not found`);
      }
    }

    // Calculate cost per unit if estimated_cost provided
    let costPerUnit: number | undefined;
    if (args.estimated_cost && args.output_quantity) {
      costPerUnit = args.estimated_cost / args.output_quantity;
    }

    const recipeId = await ctx.db.insert("recipes", {
      company_id: args.companyId,
      name: args.name,
      description: args.description,
      recipe_type: args.recipe_type,
      applicable_crop_types: args.applicable_crop_types || [],
      applicable_growth_stages: args.applicable_growth_stages || [],

      ingredients: args.ingredients,

      output_quantity: args.output_quantity,
      output_unit: args.output_unit,
      batch_size: args.batch_size,

      preparation_steps: args.preparation_steps?.map((step, i) => ({
        step_number: i + 1,
        description: step,
      })),
      application_method: args.application_method,
      storage_instructions: args.storage_instructions,
      shelf_life_hours: args.shelf_life_hours,

      target_ph: args.target_ph,
      target_ec: args.target_ec,
      acceptable_ph_range: undefined,
      acceptable_ec_range: undefined,

      estimated_cost: args.estimated_cost,
      cost_per_unit: costPerUnit,
      times_used: 0,
      success_rate: undefined,
      last_used_date: undefined,

      created_by: args.created_by,
      status: "active",
      created_at: now,
      updated_at: now,
    });

    return recipeId;
  },
});

/**
 * Update a recipe
 */
export const update = mutation({
  args: {
    recipeId: v.id("recipes"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    recipe_type: v.optional(v.string()),
    ingredients: v.optional(
      v.array(
        v.object({
          product_id: v.id("products"),
          quantity: v.number(),
          unit: v.string(),
        })
      )
    ),
    output_quantity: v.optional(v.number()),
    output_unit: v.optional(v.string()),
    preparation_steps: v.optional(v.array(v.string())),
    application_method: v.optional(v.string()),
    target_ph: v.optional(v.number()),
    target_ec: v.optional(v.number()),
    estimated_cost: v.optional(v.number()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Verify recipe exists
    const recipe = await ctx.db.get(args.recipeId);
    if (!recipe) {
      throw new Error("Recipe not found");
    }

    // Validate ingredients if provided
    if (args.ingredients) {
      for (const ingredient of args.ingredients) {
        const product = await ctx.db.get(ingredient.product_id);
        if (!product) {
          throw new Error(`Product ${ingredient.product_id} not found`);
        }
      }
    }

    const updates: Record<string, unknown> = {
      updated_at: now,
    };

    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.recipe_type !== undefined) updates.recipe_type = args.recipe_type;
    if (args.ingredients !== undefined) updates.ingredients = args.ingredients;
    if (args.output_quantity !== undefined)
      updates.output_quantity = args.output_quantity;
    if (args.output_unit !== undefined) updates.output_unit = args.output_unit;
    if (args.preparation_steps !== undefined)
      updates.preparation_steps = args.preparation_steps.map((step, i) => ({
        step_number: i + 1,
        description: step,
      }));
    if (args.application_method !== undefined)
      updates.application_method = args.application_method;
    if (args.target_ph !== undefined) updates.target_ph = args.target_ph;
    if (args.target_ec !== undefined) updates.target_ec = args.target_ec;
    if (args.estimated_cost !== undefined)
      updates.estimated_cost = args.estimated_cost;
    if (args.status !== undefined) updates.status = args.status;

    await ctx.db.patch(args.recipeId, updates);

    return {
      success: true,
      message: "Recipe updated successfully",
    };
  },
});

/**
 * Execute a recipe - CONSUMES INVENTORY AUTOMATICALLY
 *
 * This mutation:
 * 1. Validates all ingredients have sufficient stock
 * 2. Deducts inventory for each ingredient
 * 3. Optionally creates output inventory item (if recipe produces a product)
 * 4. Updates recipe usage statistics
 * 5. Creates activity log entry
 */
export const execute = mutation({
  args: {
    recipeId: v.id("recipes"),
    facilityId: v.id("facilities"),
    multiplier: v.optional(v.number()), // Scale the recipe (default: 1)
    performedBy: v.id("users"),
    notes: v.optional(v.string()),

    // Optional: specify which inventory lots to use
    // If not provided, uses FIFO (oldest first)
    inventorySelections: v.optional(
      v.array(
        v.object({
          product_id: v.id("products"),
          inventory_item_id: v.id("inventory_items"),
          quantity: v.number(),
        })
      )
    ),

    // Optional: create output inventory item
    createOutput: v.optional(v.boolean()),
    outputAreaId: v.optional(v.id("areas")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const multiplier = args.multiplier || 1;

    // Get recipe
    const recipe = await ctx.db.get(args.recipeId);
    if (!recipe) {
      throw new Error("Recipe not found");
    }

    if (recipe.status !== "active") {
      throw new Error("Cannot execute an inactive recipe");
    }

    // Get all areas for this facility
    const areas = await ctx.db
      .query("areas")
      .withIndex("by_facility", (q) => q.eq("facility_id", args.facilityId))
      .collect();
    const areaIds = areas.map((a) => a._id);

    // Validate and collect inventory to consume
    const consumptionPlan: Array<{
      inventoryItemId: Id<"inventory_items">;
      quantity: number;
      productName: string;
    }> = [];

    for (const ingredient of recipe.ingredients as Array<{
      product_id: Id<"products">;
      quantity: number;
      unit: string;
    }>) {
      const requiredQuantity = ingredient.quantity * multiplier;

      // Get product name for error messages
      const product = await ctx.db.get(ingredient.product_id);
      const productName = product?.name || "Unknown";

      // Check if user specified which inventory to use
      const userSelection = args.inventorySelections?.filter(
        (s) => s.product_id === ingredient.product_id
      );

      if (userSelection && userSelection.length > 0) {
        // Use user-specified inventory
        let selectedQuantity = 0;
        for (const selection of userSelection) {
          const item = await ctx.db.get(selection.inventory_item_id);
          if (!item) {
            throw new Error(`Inventory item ${selection.inventory_item_id} not found`);
          }
          if (item.product_id !== ingredient.product_id) {
            throw new Error(
              `Inventory item ${selection.inventory_item_id} is not for product ${productName}`
            );
          }
          if (item.quantity_available < selection.quantity) {
            throw new Error(
              `Insufficient stock in selected inventory for ${productName}. Available: ${item.quantity_available}, Requested: ${selection.quantity}`
            );
          }
          consumptionPlan.push({
            inventoryItemId: selection.inventory_item_id,
            quantity: selection.quantity,
            productName,
          });
          selectedQuantity += selection.quantity;
        }
        if (selectedQuantity < requiredQuantity) {
          throw new Error(
            `Selected inventory for ${productName} is insufficient. Required: ${requiredQuantity}, Selected: ${selectedQuantity}`
          );
        }
      } else {
        // Use FIFO - get available inventory for this product in facility areas
        const allInventory = await ctx.db.query("inventory_items").collect();
        const inventoryItems = allInventory
          .filter(
            (item) =>
              item.product_id === ingredient.product_id &&
              item.area_id &&
              areaIds.includes(item.area_id) &&
              item.lot_status === "available" &&
              item.quantity_available > 0
          )
          .sort((a, b) => (a.received_date || 0) - (b.received_date || 0)); // FIFO

        let remainingToConsume = requiredQuantity;

        for (const item of inventoryItems) {
          if (remainingToConsume <= 0) break;

          const consumeFromThis = Math.min(
            item.quantity_available,
            remainingToConsume
          );
          consumptionPlan.push({
            inventoryItemId: item._id,
            quantity: consumeFromThis,
            productName,
          });
          remainingToConsume -= consumeFromThis;
        }

        if (remainingToConsume > 0) {
          throw new Error(
            `Insufficient stock for ${productName}. Required: ${requiredQuantity}, Available: ${requiredQuantity - remainingToConsume}`
          );
        }
      }
    }

    // Execute consumption - deduct from inventory
    const consumedItems: Array<{
      product_id: Id<"products">;
      inventory_item_id: Id<"inventory_items">;
      quantity_consumed: number;
      productName: string;
    }> = [];

    for (const consumption of consumptionPlan) {
      const item = await ctx.db.get(consumption.inventoryItemId);
      if (!item) continue;

      const newQuantity = item.quantity_available - consumption.quantity;

      await ctx.db.patch(consumption.inventoryItemId, {
        quantity_available: newQuantity,
        last_movement_date: now,
        updated_at: now,
      });

      consumedItems.push({
        product_id: item.product_id,
        inventory_item_id: consumption.inventoryItemId,
        quantity_consumed: consumption.quantity,
        productName: consumption.productName,
      });
    }

    // Create output inventory if requested
    let outputInventoryId: Id<"inventory_items"> | undefined;

    if (args.createOutput && recipe.output_quantity && args.outputAreaId) {
      // Find or create a product for the recipe output
      // For now, we'll create an inventory item linked to a generic "recipe output" product
      // In a full implementation, recipes would have an output_product_id field

      // Verify area exists
      const area = await ctx.db.get(args.outputAreaId);
      if (!area) {
        throw new Error("Output area not found");
      }

      // For production outputs, we'd need a product_id
      // This is a placeholder - full implementation would require output product configuration
      // outputInventoryId = await ctx.db.insert("inventory_items", { ... });
    }

    // Update recipe statistics
    await ctx.db.patch(args.recipeId, {
      times_used: (recipe.times_used || 0) + 1,
      last_used_date: now,
      updated_at: now,
    });

    // Create activity log entry
    await ctx.db.insert("activities", {
      entity_type: "recipe",
      entity_id: args.recipeId as unknown as string,
      activity_type: "recipe_execution",
      performed_by: args.performedBy,
      timestamp: now,

      materials_consumed: consumedItems,
      equipment_used: [],
      photos: [],
      files: [],
      notes: args.notes,

      // Metadata stored in materials_consumed instead (activity_metadata is v.object({}) in schema)
      activity_metadata: {},

      created_at: now,
    });

    return {
      success: true,
      message: `Recipe "${recipe.name}" executed successfully`,
      consumed: consumedItems,
      outputInventoryId,
      statistics: {
        ingredientsConsumed: consumedItems.length,
        totalTimesUsed: (recipe.times_used || 0) + 1,
      },
    };
  },
});

/**
 * Archive a recipe
 */
export const archive = mutation({
  args: {
    recipeId: v.id("recipes"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const recipe = await ctx.db.get(args.recipeId);
    if (!recipe) {
      throw new Error("Recipe not found");
    }

    await ctx.db.patch(args.recipeId, {
      status: "archived",
      updated_at: now,
    });

    return {
      success: true,
      message: "Recipe archived successfully",
    };
  },
});
