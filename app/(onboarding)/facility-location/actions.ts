'use server';

import { z } from 'zod';
import { facilityCompleteSchema } from '@/lib/validations';
import { convex, getConvexErrorMessage } from '@/lib/convex';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

// Map frontend license types to backend format
const licenseTypeMap: Record<string, string> = {
  CultivoComercial: 'cultivation_commercial',
  Investigacion: 'research',
  Procesamiento: 'processing',
  Otro: 'other',
};

export async function createFacility(
  data: z.infer<typeof facilityCompleteSchema>,
  companyId: string
) {
  try {
    // Validate the complete data
    const validated = facilityCompleteSchema.parse(data);

    // Call Convex mutation to create facility
    const facilityId = await convex.mutation(api.facilities.create, {
      company_id: companyId as Id<'companies'>,
      name: validated.name,
      license_number: validated.licenseNumber,
      license_type: licenseTypeMap[validated.licenseType] || validated.licenseType,
      total_area_m2: validated.licensedArea,
      address: validated.address,
      administrative_division_1: validated.departmentCode,
      administrative_division_2: validated.municipalityCode,
      latitude: validated.latitude,
      longitude: validated.longitude,
      status: 'active',
    });

    console.log('Facility created successfully:', {
      facilityId,
      companyId,
      name: validated.name,
    });

    return {
      success: true,
      facilityId: facilityId,
    };
  } catch (error) {
    console.error('Error creating facility:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Datos inválidos. Por favor verifica el formulario.',
        details: error.errors,
      };
    }

    return {
      success: false,
      error: getConvexErrorMessage(error),
    };
  }
}
