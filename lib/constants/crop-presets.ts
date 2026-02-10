/**
 * Crop Presets
 * Configuraciones predefinidas por tipo de cultivo para auto-fill del formulario de estructura.
 * Cada preset define la jerarquia tipica: tipo de estructura, niveles, contenedores, posiciones.
 */

export interface CropPreset {
  value: string;
  label: string;
  environment: 'indoor' | 'outdoor';
  structure_type: string;
  num_levels: number;
  containers_per_level: number;
  container_type: string;
  positions_per_container: number;
  spacing_notes: string;
}

export const CROP_PRESETS: CropPreset[] = [
  {
    value: 'cannabis_indoor',
    label: 'Cannabis Indoor',
    environment: 'indoor',
    structure_type: 'rack_movil',
    num_levels: 2,
    containers_per_level: 5,
    container_type: 'bandeja',
    positions_per_container: 16,
    spacing_notes: 'SOG: 16-25 pl/m2 | Estandar: 9-16 pl/m2 | ScrOG: 1-4 pl/m2',
  },
  {
    value: 'cannabis_outdoor',
    label: 'Cannabis Outdoor',
    environment: 'outdoor',
    structure_type: 'cama',
    num_levels: 1,
    containers_per_level: 1,
    container_type: 'cama_elevada',
    positions_per_container: 50,
    spacing_notes: 'Auto: 0.3m entre plantas | Foto: 1.2-1.8m entre plantas',
  },
  {
    value: 'arandanos_suelo',
    label: 'Arandanos Campo',
    environment: 'outdoor',
    structure_type: 'hilera',
    num_levels: 1,
    containers_per_level: 1,
    container_type: 'hilera_suelo',
    positions_per_container: 33,
    spacing_notes: 'Estandar: 3.0x1.0m = 3,333/ha | Alta densidad: 2.5x0.6m = 6,667/ha',
  },
  {
    value: 'arandanos_sustrato',
    label: 'Arandanos Sustrato',
    environment: 'indoor',
    structure_type: 'hilera_tunel',
    num_levels: 1,
    containers_per_level: 1,
    container_type: 'maceta_sustrato',
    positions_per_container: 55,
    spacing_notes: 'Contenedor: 3.0x0.6m = 5,556/ha | Dinamico: inicio 10K → 5K/ha',
  },
  {
    value: 'manzanos',
    label: 'Manzanos',
    environment: 'outdoor',
    structure_type: 'hilera_espaldera',
    num_levels: 1,
    containers_per_level: 1,
    container_type: 'posicion_suelo',
    positions_per_container: 100,
    spacing_notes: 'Tradicional: 250/ha | Tall Spindle: 2,500-3,570/ha | Super: 5,500/ha',
  },
  {
    value: 'citricos',
    label: 'Citricos',
    environment: 'outdoor',
    structure_type: 'hilera',
    num_levels: 1,
    containers_per_level: 1,
    container_type: 'posicion_suelo',
    positions_per_container: 28,
    spacing_notes: 'Tradicional: 200-400/ha | Intensivo: 600-865/ha | SHD: 1,600-2,200/ha',
  },
  {
    value: 'lechuga_vertical',
    label: 'Lechuga Vertical Farm',
    environment: 'indoor',
    structure_type: 'rack_vertical',
    num_levels: 8,
    containers_per_level: 4,
    container_type: 'canal_nft',
    positions_per_container: 30,
    spacing_notes: '25-40 pl/m2/nivel x 8 niveles = 200-320 posiciones/m2 piso',
  },
  {
    value: 'fresa_indoor',
    label: 'Fresas Indoor',
    environment: 'indoor',
    structure_type: 'rack_vertical',
    num_levels: 6,
    containers_per_level: 3,
    container_type: 'canaleta',
    positions_per_container: 19,
    spacing_notes: 'Tabletop: 6-12 pl/m2 | Vertical 6 niveles: 90 pl/m2 piso',
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getCropPreset(value: string): CropPreset | undefined {
  return CROP_PRESETS.find((p) => p.value === value);
}

export function getCropPresetsForEnvironment(
  environment: string
): CropPreset[] {
  if (environment === 'mixed' || environment === 'greenhouse') {
    return CROP_PRESETS;
  }
  return CROP_PRESETS.filter((p) => p.environment === environment);
}
