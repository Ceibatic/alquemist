import { z } from "zod";

export const scheduleActivitySchema = z.object({
  typeId: z.string().min(1, "Tipo de actividad requerido"),
  templateId: z.string().optional(),
  scheduledDate: z.string().min(1, "Fecha requerida"),
  batchIds: z.array(z.string()).min(1, "Selecciona al menos un lote"),
  estimatedDurationMinutes: z.number().min(0).optional(),
  assignedTo: z.string().optional(),
  instructions: z.string().optional(),
  priority: z.enum(["routine", "urgent", "critical"]).default("routine"),
});

export type ScheduleActivityInput = z.infer<typeof scheduleActivitySchema>;
