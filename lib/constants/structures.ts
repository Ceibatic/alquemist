/**
 * Structure Type Constants
 * Tipos de estructura agrupados por environment para el modelo jerarquico de capacidad
 */

// ============================================================================
// STRUCTURE TYPES BY ENVIRONMENT
// ============================================================================

export interface StructureTypeOption {
  value: string;
  label: string;
  description: string;
  defaultLevels: number;
}

export const STRUCTURE_TYPES: Record<string, StructureTypeOption[]> = {
  indoor: [
    {
      value: 'rack_movil',
      label: 'Rack Movil',
      description: 'Estanteria con ruedas para maximizar espacio',
      defaultLevels: 4,
    },
    {
      value: 'rack_fijo',
      label: 'Rack Fijo',
      description: 'Estanteria fija de multiples niveles',
      defaultLevels: 3,
    },
    {
      value: 'mesa_rolling',
      label: 'Mesa Rolling',
      description: 'Mesas moviles para optimizar espacio',
      defaultLevels: 1,
    },
    {
      value: 'rack_vertical',
      label: 'Rack Vertical',
      description: 'Sistema vertical de alta densidad',
      defaultLevels: 8,
    },
    {
      value: 'hilera_tunel',
      label: 'Hilera en Tunel',
      description: 'Hileras dentro de tunel o invernadero',
      defaultLevels: 1,
    },
  ],
  outdoor: [
    {
      value: 'hilera',
      label: 'Hilera',
      description: 'Hilera directa en suelo',
      defaultLevels: 1,
    },
    {
      value: 'cama',
      label: 'Cama',
      description: 'Cama de cultivo elevada',
      defaultLevels: 1,
    },
    {
      value: 'hilera_espaldera',
      label: 'Hilera con Espaldera',
      description: 'Sistema de soporte vertical para trepadoras',
      defaultLevels: 1,
    },
    {
      value: 'bloque',
      label: 'Bloque',
      description: 'Bloque rectangular de plantas',
      defaultLevels: 1,
    },
  ],
};

// Greenhouse can use both indoor and outdoor structure types
STRUCTURE_TYPES.greenhouse = [
  ...STRUCTURE_TYPES.indoor,
  ...STRUCTURE_TYPES.outdoor,
];

// ============================================================================
// FLAT LIST FOR VALIDATION
// ============================================================================

export const ALL_STRUCTURE_TYPE_VALUES = [
  ...STRUCTURE_TYPES.indoor.map((s) => s.value),
  ...STRUCTURE_TYPES.outdoor.map((s) => s.value),
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getStructureTypesForEnvironment(
  environment: string
): StructureTypeOption[] {
  if (environment === 'mixed') {
    return [...STRUCTURE_TYPES.indoor, ...STRUCTURE_TYPES.outdoor];
  }
  return STRUCTURE_TYPES[environment] || [
    ...STRUCTURE_TYPES.indoor,
    ...STRUCTURE_TYPES.outdoor,
  ];
}

export function getStructureTypeLabel(value: string): string {
  const allTypes = [
    ...STRUCTURE_TYPES.indoor,
    ...STRUCTURE_TYPES.outdoor,
  ];
  return allTypes.find((s) => s.value === value)?.label || value;
}

export function getStructureTypeDefaults(value: string): {
  defaultLevels: number;
} {
  const allTypes = [
    ...STRUCTURE_TYPES.indoor,
    ...STRUCTURE_TYPES.outdoor,
  ];
  const type = allTypes.find((s) => s.value === value);
  return { defaultLevels: type?.defaultLevels || 1 };
}
