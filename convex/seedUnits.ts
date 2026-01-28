/**
 * Seed Units of Measure
 * Creates standard units for weight, volume, area, quantity, and time
 */

import { mutation } from "./_generated/server";

export const seedUnits = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("units_of_measure").collect();
    if (existing.length > 0) {
      return { message: "Units already exist", count: existing.length };
    }

    const now = Date.now();

    const units = [
      // Weight (base: kg)
      { name: "kilogram", symbol: "kg", category: "weight", base_unit_symbol: "kg", conversion_factor: 1 },
      { name: "gram", symbol: "g", category: "weight", base_unit_symbol: "kg", conversion_factor: 0.001 },
      { name: "milligram", symbol: "mg", category: "weight", base_unit_symbol: "kg", conversion_factor: 0.000001 },
      { name: "pound", symbol: "lb", category: "weight", base_unit_symbol: "kg", conversion_factor: 0.453592 },
      { name: "ounce", symbol: "oz", category: "weight", base_unit_symbol: "kg", conversion_factor: 0.0283495 },

      // Volume (base: L)
      { name: "liter", symbol: "L", category: "volume", base_unit_symbol: "L", conversion_factor: 1 },
      { name: "milliliter", symbol: "mL", category: "volume", base_unit_symbol: "L", conversion_factor: 0.001 },
      { name: "gallon", symbol: "gal", category: "volume", base_unit_symbol: "L", conversion_factor: 3.78541 },

      // Area (base: m²)
      { name: "square meter", symbol: "m²", category: "area", base_unit_symbol: "m²", conversion_factor: 1 },
      { name: "hectare", symbol: "ha", category: "area", base_unit_symbol: "m²", conversion_factor: 10000 },
      { name: "square foot", symbol: "ft²", category: "area", base_unit_symbol: "m²", conversion_factor: 0.092903 },

      // Quantity (base: unit)
      { name: "unit", symbol: "unit", category: "quantity", base_unit_symbol: "unit", conversion_factor: 1 },
      { name: "plant", symbol: "plant", category: "quantity", base_unit_symbol: "unit", conversion_factor: 1 },
      { name: "seed", symbol: "seed", category: "quantity", base_unit_symbol: "unit", conversion_factor: 1 },
      { name: "cutting", symbol: "cutting", category: "quantity", base_unit_symbol: "unit", conversion_factor: 1 },

      // Time (base: days)
      { name: "day", symbol: "day", category: "time", base_unit_symbol: "day", conversion_factor: 1 },
      { name: "week", symbol: "week", category: "time", base_unit_symbol: "day", conversion_factor: 7 },
      { name: "month", symbol: "month", category: "time", base_unit_symbol: "day", conversion_factor: 30 },
    ];

    let count = 0;
    for (const unit of units) {
      await ctx.db.insert("units_of_measure", {
        ...unit,
        is_active: true,
        created_at: now,
      });
      count++;
    }

    return { message: `Seeded ${count} units of measure`, count };
  },
});
