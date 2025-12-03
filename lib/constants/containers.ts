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
