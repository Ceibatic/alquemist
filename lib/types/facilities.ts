/**
 * Facility-specific Types
 * Extended types for facilities management
 */

import { Id } from '@/convex/_generated/dataModel';

export type FacilityType = 'indoor' | 'outdoor' | 'greenhouse' | 'mixed';
export type FacilityStatus = 'active' | 'inactive' | 'suspended';
export type LicenseType = 'INVIMA' | 'ICA' | 'Municipal';

export interface Facility {
  _id: Id<'facilities'>;
  company_id: Id<'companies'>;
  name: string;
  license_number: string;
  license_type?: string;
  license_authority?: string;
  license_issued_date?: number;
  license_expiry_date?: number;
  facility_type?: string;
  primary_crop_type_ids: Id<'crop_types'>[];
  address?: string;
  city?: string;
  administrative_division_1?: string;
  administrative_division_2?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  altitude_meters?: number;
  total_area_m2?: number;
  canopy_area_m2?: number;
  cultivation_area_m2?: number;
  status: string;
  created_at: number;
  updated_at: number;
}

export interface FacilityFormData {
  name: string;
  license_number: string;
  license_type?: string;
  license_authority?: string;
  license_issued_date?: number;
  license_expiry_date?: number;
  facility_type?: string;
  primary_crop_type_ids: string[];
  address?: string;
  city?: string;
  administrative_division_1?: string;
  administrative_division_2?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  altitude_meters?: number;
  total_area_m2?: number;
  canopy_area_m2?: number;
  cultivation_area_m2?: number;
}

export interface FacilityWithCropTypes extends Facility {
  cropTypes?: Array<{
    _id: Id<'crop_types'>;
    name: string;
    display_name_es: string;
  }>;
}
