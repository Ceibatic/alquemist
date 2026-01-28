'use server';

import { z } from 'zod';
import { companySetupSchema } from '@/lib/validations';
import { convex, getConvexErrorMessage } from '@/lib/convex';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

/**
 * Create company for the registered user (Step 2 of registration)
 * Requires userId from verified email step
 */
export async function createCompany(
  data: z.infer<typeof companySetupSchema>,
  userId: string
) {
  try {
    // Validate the data
    const validated = companySetupSchema.parse(data);

    // Map frontend field names to backend field names
    // Frontend: businessType, industry
    // Backend: businessEntityType, companyType
    const businessEntityTypeMap: Record<string, string> = {
      SAS: 'S.A.S',
      SA: 'S.A.',
      LTDA: 'Ltda',
      EU: 'E.U.',
      PersonaNatural: 'Persona Natural',
    };

    const companyTypeMap: Record<string, string> = {
      Cannabis: 'cannabis',
      Cafe: 'coffee',
      Cacao: 'cocoa',
      Flores: 'flowers',
      Mixto: 'mixed',
    };

    const mappedBusinessEntityType = businessEntityTypeMap[validated.businessType] || validated.businessType;
    const mappedCompanyType = companyTypeMap[validated.industry] || validated.industry.toLowerCase();

    // Call Convex mutation to create company
    const result = await convex.mutation(api.registration.registerCompanyStep2, {
      userId: userId as Id<'users'>,
      companyName: validated.name,
      businessEntityType: mappedBusinessEntityType,
      companyType: mappedCompanyType,
      country: 'CO', // Default to Colombia
      departmentCode: validated.departmentCode,
      municipalityCode: validated.municipalityCode,
    });

    if (!result.success) {
      return {
        success: false,
        error: 'Error al crear la empresa',
      };
    }

    return {
      success: true,
      companyId: result.companyId,
      userId: result.userId,
      message: result.message,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Datos inválidos. Por favor verifica el formulario.',
        details: error.errors,
      };
    }

    const errorMessage = getConvexErrorMessage(error);

    return {
      success: false,
      error: errorMessage,
    };
  }
}
