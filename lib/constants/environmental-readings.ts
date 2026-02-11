/**
 * Environmental Reading Types
 * Constants for activity environmental readings
 */

export interface ReadingTypeConfig {
  type: string;
  label: string;
  defaultUnit: string;
  icon: string;
  normalRange: [number, number];
}

export const READING_TYPES: ReadingTypeConfig[] = [
  { type: "temperature", label: "Temperatura", defaultUnit: "C", icon: "Thermometer", normalRange: [18, 30] },
  { type: "humidity", label: "Humedad Relativa", defaultUnit: "%", icon: "Droplets", normalRange: [40, 70] },
  { type: "vpd", label: "VPD", defaultUnit: "kPa", icon: "Wind", normalRange: [0.8, 1.4] },
  { type: "co2", label: "CO2", defaultUnit: "ppm", icon: "Cloud", normalRange: [400, 1500] },
  { type: "light_ppfd", label: "Luz PPFD", defaultUnit: "umol/m2/s", icon: "Sun", normalRange: [200, 1000] },
  { type: "light_dli", label: "Luz DLI", defaultUnit: "mol/m2/d", icon: "Sun", normalRange: [12, 40] },
  { type: "ph", label: "pH", defaultUnit: "", icon: "Flask", normalRange: [5.5, 6.5] },
  { type: "ec", label: "EC", defaultUnit: "mS/cm", icon: "Zap", normalRange: [1.0, 2.5] },
  { type: "dissolved_oxygen", label: "Oxigeno Disuelto", defaultUnit: "mg/L", icon: "Waves", normalRange: [5, 8] },
  { type: "wind_speed", label: "Velocidad del Viento", defaultUnit: "m/s", icon: "Wind", normalRange: [0.5, 3] },
  { type: "soil_moisture", label: "Humedad del Suelo", defaultUnit: "%", icon: "Droplet", normalRange: [40, 70] },
];

export const READING_TYPE_MAP = new Map(
  READING_TYPES.map((rt) => [rt.type, rt])
);

/** Quick-input types shown by default in the environmental readings form */
export const QUICK_READING_TYPES = ["temperature", "humidity", "vpd", "co2", "ph", "ec"];
