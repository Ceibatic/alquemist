import { z } from 'zod';

// Facility form validation schema
export const facilityFormSchema = z.object({
  // Basic Information
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre debe tener máximo 100 caracteres'),
  license_number: z.string().min(1, 'El número de licencia es requerido').max(50, 'El número de licencia debe tener máximo 50 caracteres'),

  // License Details
  license_type: z.string().optional(),
  license_authority: z.string().optional(),
  license_issued_date: z.number().optional(),
  license_expiry_date: z.number().optional(),

  // Facility Type
  facility_type: z.string().optional(),
  primary_crop_type_ids: z.array(z.string()).default([]),

  // Location
  address: z.string().optional(),
  city: z.string().optional(),
  administrative_division_1: z.string().min(1, 'El departamento es requerido'),
  administrative_division_2: z.string().min(1, 'El municipio es requerido'),
  postal_code: z.string().optional(),

  // GPS Coordinates
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  altitude_meters: z.number().optional(),

  // Areas
  total_area_m2: z.number().min(0, 'El área total debe ser mayor o igual a 0').optional(),
  cultivation_area_m2: z.number().min(0, 'El área de cultivo debe ser mayor o igual a 0').optional(),
  canopy_area_m2: z.number().min(0, 'El área de dosel debe ser mayor o igual a 0').optional(),
}).refine((data) => {
  // Validate that cultivation area is not greater than total area
  if (data.total_area_m2 && data.cultivation_area_m2) {
    return data.cultivation_area_m2 <= data.total_area_m2;
  }
  return true;
}, {
  message: 'El área de cultivo no puede ser mayor que el área total',
  path: ['cultivation_area_m2'],
}).refine((data) => {
  // Validate that canopy area is not greater than cultivation area
  if (data.cultivation_area_m2 && data.canopy_area_m2) {
    return data.canopy_area_m2 <= data.cultivation_area_m2;
  }
  return true;
}, {
  message: 'El área de dosel no puede ser mayor que el área de cultivo',
  path: ['canopy_area_m2'],
});

export type FacilityFormData = z.infer<typeof facilityFormSchema>;

// License Types
export const LICENSE_TYPES = [
  { value: 'INVIMA', label: 'INVIMA - Instituto Nacional de Vigilancia de Medicamentos y Alimentos' },
  { value: 'ICA', label: 'ICA - Instituto Colombiano Agropecuario' },
  { value: 'Municipal', label: 'Municipal' },
  { value: 'other', label: 'Otra' },
] as const;

// Facility Types
export const FACILITY_TYPES = [
  { value: 'indoor', label: 'Indoor (Interior)' },
  { value: 'outdoor', label: 'Outdoor (Exterior)' },
  { value: 'greenhouse', label: 'Greenhouse (Invernadero)' },
  { value: 'mixed', label: 'Mixed (Mixta)' },
  { value: 'processing', label: 'Processing (Procesamiento)' },
] as const;

// Plan Limits
export const PLAN_LIMITS = {
  basic: 1,
  professional: 3,
  business: 5,
  enterprise: -1, // unlimited
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;

export function canCreateFacility(currentCount: number, planType: PlanType): boolean {
  const limit = PLAN_LIMITS[planType];
  return limit === -1 || currentCount < limit;
}

export function getPlanLimit(planType: PlanType): number {
  return PLAN_LIMITS[planType];
}
