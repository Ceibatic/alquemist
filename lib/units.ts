/**
 * Units of Measurement Reference Data
 * Module 07: Reference Data - US-07.8
 *
 * Standardized units for use across the application.
 * These are used in inventory, production, and recipes.
 */

// ============================================================================
// UNIT DEFINITIONS
// ============================================================================

export interface Unit {
  code: string;
  name_es: string;
  name_en: string;
  symbol: string;
  category: 'weight' | 'volume' | 'area' | 'quantity' | 'time' | 'length';
  baseUnit?: string; // Reference to base unit for conversions
  conversionFactor?: number; // Factor to convert to base unit
}

// Weight Units
export const WEIGHT_UNITS: Unit[] = [
  {
    code: 'kg',
    name_es: 'Kilogramo',
    name_en: 'Kilogram',
    symbol: 'kg',
    category: 'weight',
    conversionFactor: 1,
  },
  {
    code: 'g',
    name_es: 'Gramo',
    name_en: 'Gram',
    symbol: 'g',
    category: 'weight',
    baseUnit: 'kg',
    conversionFactor: 0.001,
  },
  {
    code: 'mg',
    name_es: 'Miligramo',
    name_en: 'Milligram',
    symbol: 'mg',
    category: 'weight',
    baseUnit: 'kg',
    conversionFactor: 0.000001,
  },
  {
    code: 'lb',
    name_es: 'Libra',
    name_en: 'Pound',
    symbol: 'lb',
    category: 'weight',
    baseUnit: 'kg',
    conversionFactor: 0.453592,
  },
  {
    code: 'oz',
    name_es: 'Onza',
    name_en: 'Ounce',
    symbol: 'oz',
    category: 'weight',
    baseUnit: 'kg',
    conversionFactor: 0.0283495,
  },
];

// Volume Units
export const VOLUME_UNITS: Unit[] = [
  {
    code: 'L',
    name_es: 'Litro',
    name_en: 'Liter',
    symbol: 'L',
    category: 'volume',
    conversionFactor: 1,
  },
  {
    code: 'mL',
    name_es: 'Mililitro',
    name_en: 'Milliliter',
    symbol: 'mL',
    category: 'volume',
    baseUnit: 'L',
    conversionFactor: 0.001,
  },
  {
    code: 'gal',
    name_es: 'Galón',
    name_en: 'Gallon',
    symbol: 'gal',
    category: 'volume',
    baseUnit: 'L',
    conversionFactor: 3.78541,
  },
];

// Area Units
export const AREA_UNITS: Unit[] = [
  {
    code: 'm2',
    name_es: 'Metro cuadrado',
    name_en: 'Square meter',
    symbol: 'm²',
    category: 'area',
    conversionFactor: 1,
  },
  {
    code: 'ha',
    name_es: 'Hectárea',
    name_en: 'Hectare',
    symbol: 'ha',
    category: 'area',
    baseUnit: 'm2',
    conversionFactor: 10000,
  },
  {
    code: 'ft2',
    name_es: 'Pie cuadrado',
    name_en: 'Square foot',
    symbol: 'ft²',
    category: 'area',
    baseUnit: 'm2',
    conversionFactor: 0.092903,
  },
];

// Quantity Units
export const QUANTITY_UNITS: Unit[] = [
  {
    code: 'unit',
    name_es: 'Unidad',
    name_en: 'Unit',
    symbol: 'ud',
    category: 'quantity',
  },
  {
    code: 'plant',
    name_es: 'Planta',
    name_en: 'Plant',
    symbol: 'plt',
    category: 'quantity',
  },
  {
    code: 'seed',
    name_es: 'Semilla',
    name_en: 'Seed',
    symbol: 'sem',
    category: 'quantity',
  },
  {
    code: 'clone',
    name_es: 'Esqueje',
    name_en: 'Clone',
    symbol: 'esq',
    category: 'quantity',
  },
  {
    code: 'batch',
    name_es: 'Lote',
    name_en: 'Batch',
    symbol: 'lote',
    category: 'quantity',
  },
];

// Time Units
export const TIME_UNITS: Unit[] = [
  {
    code: 'day',
    name_es: 'Día',
    name_en: 'Day',
    symbol: 'd',
    category: 'time',
    conversionFactor: 1,
  },
  {
    code: 'week',
    name_es: 'Semana',
    name_en: 'Week',
    symbol: 'sem',
    category: 'time',
    baseUnit: 'day',
    conversionFactor: 7,
  },
  {
    code: 'month',
    name_es: 'Mes',
    name_en: 'Month',
    symbol: 'mes',
    category: 'time',
    baseUnit: 'day',
    conversionFactor: 30,
  },
  {
    code: 'hour',
    name_es: 'Hora',
    name_en: 'Hour',
    symbol: 'h',
    category: 'time',
    baseUnit: 'day',
    conversionFactor: 1 / 24,
  },
  {
    code: 'minute',
    name_es: 'Minuto',
    name_en: 'Minute',
    symbol: 'min',
    category: 'time',
    baseUnit: 'day',
    conversionFactor: 1 / 1440,
  },
];

// Length Units
export const LENGTH_UNITS: Unit[] = [
  {
    code: 'm',
    name_es: 'Metro',
    name_en: 'Meter',
    symbol: 'm',
    category: 'length',
    conversionFactor: 1,
  },
  {
    code: 'cm',
    name_es: 'Centímetro',
    name_en: 'Centimeter',
    symbol: 'cm',
    category: 'length',
    baseUnit: 'm',
    conversionFactor: 0.01,
  },
  {
    code: 'mm',
    name_es: 'Milímetro',
    name_en: 'Millimeter',
    symbol: 'mm',
    category: 'length',
    baseUnit: 'm',
    conversionFactor: 0.001,
  },
  {
    code: 'in',
    name_es: 'Pulgada',
    name_en: 'Inch',
    symbol: 'in',
    category: 'length',
    baseUnit: 'm',
    conversionFactor: 0.0254,
  },
  {
    code: 'ft',
    name_es: 'Pie',
    name_en: 'Foot',
    symbol: 'ft',
    category: 'length',
    baseUnit: 'm',
    conversionFactor: 0.3048,
  },
];

// ============================================================================
// ALL UNITS COMBINED
// ============================================================================

export const ALL_UNITS: Unit[] = [
  ...WEIGHT_UNITS,
  ...VOLUME_UNITS,
  ...AREA_UNITS,
  ...QUANTITY_UNITS,
  ...TIME_UNITS,
  ...LENGTH_UNITS,
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get unit by code
 */
export function getUnit(code: string): Unit | undefined {
  return ALL_UNITS.find((u) => u.code === code);
}

/**
 * Get units by category
 */
export function getUnitsByCategory(
  category: Unit['category']
): Unit[] {
  return ALL_UNITS.filter((u) => u.category === category);
}

/**
 * Get unit display name
 */
export function getUnitDisplayName(
  code: string,
  locale: 'es' | 'en' = 'es'
): string {
  const unit = getUnit(code);
  if (!unit) return code;
  return locale === 'es' ? unit.name_es : unit.name_en;
}

/**
 * Get unit symbol
 */
export function getUnitSymbol(code: string): string {
  const unit = getUnit(code);
  return unit?.symbol || code;
}

/**
 * Convert value between units
 */
export function convertUnits(
  value: number,
  fromCode: string,
  toCode: string
): number | null {
  const fromUnit = getUnit(fromCode);
  const toUnit = getUnit(toCode);

  if (!fromUnit || !toUnit) return null;
  if (fromUnit.category !== toUnit.category) return null;

  // Get conversion factors (default to 1 if not set)
  const fromFactor = fromUnit.conversionFactor || 1;
  const toFactor = toUnit.conversionFactor || 1;

  // Convert to base unit, then to target unit
  const baseValue = value * fromFactor;
  return baseValue / toFactor;
}

/**
 * Format value with unit
 */
export function formatWithUnit(
  value: number,
  unitCode: string,
  options?: {
    locale?: 'es' | 'en';
    precision?: number;
    useSymbol?: boolean;
  }
): string {
  const { locale = 'es', precision = 2, useSymbol = true } = options || {};
  const unit = getUnit(unitCode);

  if (!unit) return `${value} ${unitCode}`;

  const formattedValue = value.toLocaleString(locale === 'es' ? 'es-CO' : 'en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: precision,
  });

  const unitLabel = useSymbol ? unit.symbol : (locale === 'es' ? unit.name_es : unit.name_en);

  return `${formattedValue} ${unitLabel}`;
}

// ============================================================================
// UNIT OPTIONS FOR SELECT COMPONENTS
// ============================================================================

/**
 * Get unit options for select dropdowns
 */
export function getUnitOptions(
  category?: Unit['category'],
  locale: 'es' | 'en' = 'es'
): Array<{ value: string; label: string }> {
  const units = category ? getUnitsByCategory(category) : ALL_UNITS;
  return units.map((u) => ({
    value: u.code,
    label: `${u.symbol} - ${locale === 'es' ? u.name_es : u.name_en}`,
  }));
}

/**
 * Common unit options for inventory
 */
export const INVENTORY_UNIT_OPTIONS = [
  { value: 'kg', label: 'kg - Kilogramo' },
  { value: 'g', label: 'g - Gramo' },
  { value: 'L', label: 'L - Litro' },
  { value: 'mL', label: 'mL - Mililitro' },
  { value: 'unit', label: 'ud - Unidad' },
];

/**
 * Common unit options for production
 */
export const PRODUCTION_UNIT_OPTIONS = [
  { value: 'plant', label: 'plt - Planta' },
  { value: 'seed', label: 'sem - Semilla' },
  { value: 'clone', label: 'esq - Esqueje' },
  { value: 'batch', label: 'lote - Lote' },
  { value: 'kg', label: 'kg - Kilogramo' },
  { value: 'g', label: 'g - Gramo' },
];
