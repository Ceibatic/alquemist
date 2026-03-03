export interface MeasurementFieldDef {
  key: string;           // key in activity_metadata
  label: string;         // display label (in Spanish)
  type: 'number' | 'text' | 'select';
  unit?: string;
  step?: number;
  required?: boolean;
  options?: { value: string; label: string }[];
  group?: string;        // visual grouping
}

export const MEASUREMENT_SCHEMAS: Record<string, MeasurementFieldDef[]> = {
  fertilization: [
    { key: "water_ph", label: "pH del agua", type: "number", unit: "", step: 0.1, group: "Agua de entrada" },
    { key: "water_ec", label: "EC del agua", type: "number", unit: "mS/cm", step: 0.1, group: "Agua de entrada" },
    { key: "solution_ph", label: "pH de la solucion", type: "number", unit: "", step: 0.1, group: "Solucion preparada" },
    { key: "solution_ec", label: "EC de la solucion", type: "number", unit: "mS/cm", step: 0.1, group: "Solucion preparada" },
    { key: "volume_L", label: "Volumen aplicado", type: "number", unit: "L", step: 0.5, group: "Aplicacion" },
    { key: "dose", label: "Dosis", type: "text", group: "Aplicacion" },
    { key: "application_method", label: "Metodo de aplicacion", type: "select", options: [
      { value: "drench", label: "Drench (riego)" },
      { value: "foliar", label: "Foliar" },
      { value: "fertiriego", label: "Fertiriego" },
    ], group: "Aplicacion" },
  ],
  irrigation: [
    { key: "volume_L", label: "Volumen", type: "number", unit: "L", step: 0.5, group: "Riego" },
    { key: "water_ph", label: "pH del agua", type: "number", unit: "", step: 0.1, group: "Riego" },
    { key: "water_ec", label: "EC del agua", type: "number", unit: "mS/cm", step: 0.1, group: "Riego" },
    { key: "duration_minutes", label: "Duracion", type: "number", unit: "min", step: 1, group: "Riego" },
  ],
  mipe_application: [
    { key: "product_applied", label: "Producto aplicado", type: "text", required: true, group: "Producto" },
    { key: "dose", label: "Dosis", type: "text", group: "Producto" },
    { key: "volume_L", label: "Volumen aplicado", type: "number", unit: "L", step: 0.5, group: "Aplicacion" },
    { key: "phi_days", label: "Periodo de carencia (PHI)", type: "number", unit: "dias", step: 1, group: "Seguridad" },
    { key: "rei_hours", label: "Intervalo de reentrada (REI)", type: "number", unit: "horas", step: 1, group: "Seguridad" },
    { key: "application_method", label: "Metodo de aplicacion", type: "select", options: [
      { value: "foliar", label: "Foliar" },
      { value: "drench", label: "Drench" },
      { value: "fumigation", label: "Fumigacion" },
      { value: "broadcast", label: "Esparcido" },
    ], group: "Aplicacion" },
    { key: "equipment", label: "Equipo utilizado", type: "text", group: "Aplicacion" },
  ],
  lisimeter: [
    { key: "plant_id", label: "ID de planta", type: "text", group: "Planta" },
    { key: "plant_height_cm", label: "Altura de planta", type: "number", unit: "cm", step: 0.5, group: "Planta" },
    { key: "solution_in_volume", label: "Volumen solucion entrada", type: "number", unit: "mL", step: 1, group: "Mediciones" },
    { key: "solution_out_volume", label: "Volumen solucion salida", type: "number", unit: "mL", step: 1, group: "Mediciones" },
    { key: "drain_ec", label: "EC del drenaje", type: "number", unit: "mS/cm", step: 0.1, group: "Mediciones" },
    { key: "drain_ph", label: "pH del drenaje", type: "number", unit: "", step: 0.1, group: "Mediciones" },
  ],
  saturated_paste: [
    { key: "substrate_ec", label: "EC del sustrato", type: "number", unit: "mS/cm", step: 0.1, group: "Sustrato" },
    { key: "substrate_ph", label: "pH del sustrato", type: "number", unit: "", step: 0.1, group: "Sustrato" },
    { key: "paste_volume_ml", label: "Volumen de pasta", type: "number", unit: "mL", step: 1, group: "Medicion" },
    { key: "water_added_ml", label: "Agua agregada", type: "number", unit: "mL", step: 1, group: "Medicion" },
    { key: "filtrate_ec", label: "EC del filtrado", type: "number", unit: "mS/cm", step: 0.1, group: "Resultados" },
    { key: "filtrate_ph", label: "pH del filtrado", type: "number", unit: "", step: 0.1, group: "Resultados" },
  ],
  monitoring: [],
};

/** Get the suggested schema for an activity type code, or empty array */
export function getSuggestedSchema(activityTypeCode: string): MeasurementFieldDef[] {
  return MEASUREMENT_SCHEMAS[activityTypeCode] ?? [];
}
