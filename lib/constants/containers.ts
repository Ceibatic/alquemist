/**
 * Container Type Constants
 * Tipos de contenedores predefinidos para configuración de capacidad de áreas
 */

// ============================================================================
// CONTAINER TYPES
// ============================================================================

export const CONTAINER_TYPES = [
  {
    value: 'bandeja',
    label: 'Bandeja',
    defaultPlantsPerContainer: 20,
    description: 'Bandejas plásticas para propagación o vegetativo',
  },
  {
    value: 'maceta',
    label: 'Maceta',
    defaultPlantsPerContainer: 1,
    description: 'Macetas individuales para floración',
  },
  {
    value: 'charola_propagacion',
    label: 'Charola de Propagación',
    defaultPlantsPerContainer: 72,
    description: 'Charolas de alvéolos para germinación y clones',
  },
  {
    value: 'bolsa_cultivo',
    label: 'Bolsa de Cultivo',
    defaultPlantsPerContainer: 1,
    description: 'Bolsas de tela o plástico para cultivo',
  },
  {
    value: 'cubo_contenedor',
    label: 'Cubo/Contenedor',
    defaultPlantsPerContainer: 1,
    description: 'Cubos o contenedores grandes',
  },
  {
    value: 'cama_cultivo',
    label: 'Cama de Cultivo',
    defaultPlantsPerContainer: 50,
    description: 'Camas elevadas para cultivo en suelo',
  },
  {
    value: 'otro',
    label: 'Otro',
    defaultPlantsPerContainer: 1,
    description: 'Tipo de contenedor personalizado',
  },
] as const;

export type ContainerTypeValue = (typeof CONTAINER_TYPES)[number]['value'];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getContainerTypeLabel(value: string): string {
  const containerType = CONTAINER_TYPES.find((c) => c.value === value);
  return containerType?.label || value;
}

export function getDefaultPlantsPerContainer(value: string): number {
  const containerType = CONTAINER_TYPES.find((c) => c.value === value);
  return containerType?.defaultPlantsPerContainer || 1;
}

export function calculateMaxCapacity(
  containerCount: number,
  plantsPerContainer: number
): number {
  return containerCount * plantsPerContainer;
}

export function getContainerTypeDescription(value: string): string {
  const containerType = CONTAINER_TYPES.find((c) => c.value === value);
  return containerType?.description || '';
}

// ============================================================================
// CONTAINER TYPES BY ENVIRONMENT (for structure-based capacity model)
// ============================================================================

export interface ContainerTypeByEnvOption {
  value: string;
  label: string;
  defaultPositions: number;
  description: string;
}

export const CONTAINER_TYPES_BY_ENV: Record<string, ContainerTypeByEnvOption[]> = {
  indoor: [
    { value: 'bandeja', label: 'Bandeja', defaultPositions: 20, description: 'Bandejas plásticas para propagación o vegetativo' },
    { value: 'canal_nft', label: 'Canal NFT', defaultPositions: 12, description: 'Canales para cultivo hidropónico NFT' },
    { value: 'canaleta', label: 'Canaleta', defaultPositions: 8, description: 'Canaletas para cultivos como fresas' },
    { value: 'maceta_sustrato', label: 'Maceta Sustrato', defaultPositions: 1, description: 'Macetas individuales con sustrato' },
    { value: 'panel_aeroponia', label: 'Panel Aeroponia', defaultPositions: 36, description: 'Paneles verticales para cultivo aeropónico' },
    { value: 'charola_propagacion', label: 'Charola de Propagacion', defaultPositions: 72, description: 'Charolas de alvéolos para germinación y clones' },
    { value: 'maceta', label: 'Maceta', defaultPositions: 1, description: 'Macetas individuales de tamaño estándar' },
    { value: 'bolsa_cultivo', label: 'Bolsa de Cultivo', defaultPositions: 1, description: 'Bolsas de tela o plástico para cultivo' },
  ],
  outdoor: [
    { value: 'posicion_suelo', label: 'Posicion en Suelo', defaultPositions: 1, description: 'Posición directa en suelo natural' },
    { value: 'cama_elevada', label: 'Cama Elevada', defaultPositions: 50, description: 'Camas elevadas con sustrato controlado' },
    { value: 'hilera_suelo', label: 'Hilera en Suelo', defaultPositions: 20, description: 'Hilera de plantas directa en suelo' },
    { value: 'maceta_exterior', label: 'Maceta Exterior', defaultPositions: 1, description: 'Macetas resistentes para uso exterior' },
    { value: 'cama_cultivo', label: 'Cama de Cultivo', defaultPositions: 50, description: 'Camas de cultivo a nivel de suelo' },
  ],
};

// Greenhouse can use both indoor and outdoor container types
CONTAINER_TYPES_BY_ENV.greenhouse = [
  ...CONTAINER_TYPES_BY_ENV.indoor,
  ...CONTAINER_TYPES_BY_ENV.outdoor,
];

// Flat list of all container type values (for validation)
export const ALL_CONTAINER_TYPE_VALUES = [
  ...CONTAINER_TYPES_BY_ENV.indoor.map((c) => c.value),
  ...CONTAINER_TYPES_BY_ENV.outdoor.map((c) => c.value),
];

// ============================================================================
// ENVIRONMENT-AWARE HELPERS
// ============================================================================

export function getContainerTypesForEnvironment(
  environment: string
): ContainerTypeByEnvOption[] {
  if (environment === 'mixed') {
    return [...CONTAINER_TYPES_BY_ENV.indoor, ...CONTAINER_TYPES_BY_ENV.outdoor];
  }
  return CONTAINER_TYPES_BY_ENV[environment] || [
    ...CONTAINER_TYPES_BY_ENV.indoor,
    ...CONTAINER_TYPES_BY_ENV.outdoor,
  ];
}

export function getDefaultPositionsPerContainer(value: string): number {
  const allTypes = [
    ...CONTAINER_TYPES_BY_ENV.indoor,
    ...CONTAINER_TYPES_BY_ENV.outdoor,
  ];
  return allTypes.find((c) => c.value === value)?.defaultPositions || 1;
}

export function getContainerTypeLabelByEnv(value: string): string {
  const allTypes = [
    ...CONTAINER_TYPES_BY_ENV.indoor,
    ...CONTAINER_TYPES_BY_ENV.outdoor,
  ];
  return allTypes.find((c) => c.value === value)?.label || value;
}
