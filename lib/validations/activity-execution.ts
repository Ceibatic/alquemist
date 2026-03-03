import { z } from "zod";

// ---------------------------------------------------------------------------
// Resource entry schema
// ---------------------------------------------------------------------------

export const activityResourceSchema = z.object({
  productId: z.string().min(1, "Producto requerido"),
  direction: z.string().min(1, "Dirección requerida"), // consumed/produced/applied/wasted
  quantity: z.number().min(0, "Cantidad debe ser >= 0"),
  quantityUnit: z.string().min(1, "Unidad requerida"),
  unitId: z.string().optional(),
  inventoryItemId: z.string().optional(),
  applicationRate: z.string().optional(),
  applicationMethod: z.string().optional(),
  notes: z.string().optional(),
});

export type ActivityResourceInput = z.infer<typeof activityResourceSchema>;

// ---------------------------------------------------------------------------
// Main execution form schema
// ---------------------------------------------------------------------------

export const activityExecutionSchema = z.object({
  // Essential
  activityDate: z.string().min(1, "Fecha requerida"),
  responsibleId: z.string().min(1, "Responsable requerido"),
  typeId: z.string().optional(), // Required for ad-hoc, pre-filled for template/scheduled

  // Context
  batchIds: z.array(z.string()).optional(),
  areaId: z.string().optional(),
  phase: z.string().optional(),

  // Optional fields
  observations: z.string().optional(),
  durationMinutes: z.number().min(0, "Duración debe ser >= 0").optional(),

  // Environmental
  envTemp: z.number().optional(),
  envHumidity: z.number().min(0).max(100, "Humedad: 0-100%").optional(),
  envPh: z.number().min(0).max(14, "pH: 0-14").optional(),
  envEc: z.number().min(0, "EC debe ser >= 0").optional(),

  // Cost
  estimatedCost: z.number().min(0).optional(),
  actualCost: z.number().min(0).optional(),

  // Resources
  resources: z.array(activityResourceSchema).optional(),

  // Measurement data — structured fields from measurement schema
  measurementData: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),

  // Multi-batch distribution
  resourceDistribution: z
    .enum(["identical", "split_proportional"])
    .default("identical"),
});

export type ActivityExecutionInput = z.infer<typeof activityExecutionSchema>;
