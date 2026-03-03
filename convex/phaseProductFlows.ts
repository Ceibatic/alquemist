/**
 * Phase Product Flows — Queries for yield and transformation definitions per cultivar per phase.
 */

import { v } from "convex/values";
import { query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Get output flows for a cultivar+phase combination.
 * Used by the transformation outputs form to show expected outputs.
 */
export const getByCultivarPhase = query({
  args: {
    cultivarId: v.id("cultivars"),
    phaseName: v.string(),
    direction: v.optional(
      v.union(v.literal("input"), v.literal("output"))
    ),
  },
  handler: async (ctx, { cultivarId, phaseName, direction }) => {
    const flows = await ctx.db
      .query("phase_product_flows")
      .withIndex("by_cultivar_phase_direction", (q) => {
        const base = q.eq("cultivar_id", cultivarId).eq("phase_name", phaseName);
        if (direction !== undefined) {
          return base.eq("direction", direction);
        }
        return base;
      })
      .collect();

    // Enrich with product names and units
    const enriched = await Promise.all(
      flows
        .sort((a, b) => a.sort_order - b.sort_order)
        .map(async (flow) => {
          const product = await ctx.db.get(flow.product_id);
          return {
            ...flow,
            productName: product?.name ?? "Producto desconocido",
            productUnit: product?.default_unit ?? "unidades",
          };
        })
    );

    return enriched;
  },
});

/**
 * Get yield cascade data for a cultivar across multiple phases.
 * Used by the order wizard to preview expected yield progression.
 */
export const getYieldCascade = query({
  args: {
    cultivarId: v.id("cultivars"),
    phaseNames: v.optional(v.array(v.string())),
  },
  handler: async (ctx, { cultivarId, phaseNames }) => {
    const allFlows = await ctx.db
      .query("phase_product_flows")
      .withIndex("by_cultivar", (q) => q.eq("cultivar_id", cultivarId))
      .collect();

    // Filter to output flows only, and optionally to specific phases
    const outputFlows = allFlows.filter(
      (f) =>
        f.direction === "output" &&
        (!phaseNames || phaseNames.length === 0 || phaseNames.includes(f.phase_name))
    );

    // Group by phase
    const phaseMap = new Map<string, typeof outputFlows>();
    for (const flow of outputFlows) {
      const existing = phaseMap.get(flow.phase_name) ?? [];
      existing.push(flow);
      phaseMap.set(flow.phase_name, existing);
    }

    // Order phases by phaseNames array if provided, otherwise alphabetically
    const orderedPhases =
      phaseNames && phaseNames.length > 0
        ? phaseNames.filter((name) => phaseMap.has(name))
        : Array.from(phaseMap.keys()).sort();

    // Build cascade with enriched product data
    const cascade = await Promise.all(
      orderedPhases.map(async (phaseName) => {
        const flows = (phaseMap.get(phaseName) ?? []).sort(
          (a, b) => a.sort_order - b.sort_order
        );
        const enrichedFlows = await Promise.all(
          flows.map(async (flow) => {
            const product = await ctx.db.get(flow.product_id);
            return {
              productName: product?.name ?? "Producto desconocido",
              productUnit: (product as { default_unit?: string } | null)?.default_unit ?? "unidades",
              yieldPct: flow.yield_pct,
              productRole: flow.product_role,
              isDestructive: flow.is_destructive,
              isTransformation: flow.is_transformation,
            };
          })
        );
        return { phaseName, flows: enrichedFlows };
      })
    );

    return cascade;
  },
});

/**
 * Check if a cultivar+phase has any output flows defined.
 * Lightweight check used to decide whether to show the transformation step.
 */
export const hasOutputFlows = query({
  args: {
    cultivarId: v.id("cultivars"),
    phaseName: v.string(),
  },
  handler: async (ctx, { cultivarId, phaseName }) => {
    const flows = await ctx.db
      .query("phase_product_flows")
      .withIndex("by_cultivar_phase_direction", (q) =>
        q
          .eq("cultivar_id", cultivarId)
          .eq("phase_name", phaseName)
          .eq("direction", "output")
      )
      .first();
    return flows !== null;
  },
});
