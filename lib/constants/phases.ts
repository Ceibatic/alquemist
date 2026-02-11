/**
 * Centralized crop phase constants, labels, colors, and helpers.
 */

export const CROP_PHASES = [
  'propagation',
  'germination',
  'seedling',
  'vegetative',
  'flowering',
  'harvest',
  'post_harvest',
  'processing',
] as const;

export type CropPhase = (typeof CROP_PHASES)[number];

/** Display-order for phases (matches biological progression). */
export const PHASE_ORDER: readonly string[] = CROP_PHASES;

export const PHASE_LABELS: Record<string, string> = {
  propagation: 'Propagacion',
  germination: 'Germinacion',
  seedling: 'Plantula',
  vegetative: 'Vegetativo',
  flowering: 'Floracion',
  harvest: 'Cosecha',
  post_harvest: 'Poscosecha',
  processing: 'Procesamiento',
};

/** Tailwind-compatible color tokens per phase (used for badges/cards). */
export const PHASE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  propagation: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  germination: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  seedling: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  vegetative: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  flowering: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
  harvest: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  post_harvest: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  processing: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
};

const DEFAULT_COLORS = { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };

export function getPhaseLabel(phase?: string | null): string {
  if (!phase) return 'Sin fase';
  return PHASE_LABELS[phase] ?? phase;
}

export function getPhaseColors(phase?: string | null) {
  if (!phase) return DEFAULT_COLORS;
  return PHASE_COLORS[phase] ?? DEFAULT_COLORS;
}
