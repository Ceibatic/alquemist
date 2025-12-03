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

    console.log('[createCompany] Starting company creation:', {
      userId,
      companyName: validated.name,
      businessType: validated.businessType,
      industry: validated.industry,
      departmentCode: validated.departmentCode,
      municipalityCode: validated.municipalityCode,
    });

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

    console.log('[createCompany] Mapped values:', {
      businessEntityType: mappedBusinessEntityType,
      companyType: mappedCompanyType,
    });

    // Call Convex mutation to create company
    console.log('[createCompany] Calling registerCompanyStep2 mutation...');
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
      console.error('[createCompany] Mutation returned failure:', result);
      return {
        success: false,
        error: 'Error al crear la empresa',
      };
    }

    console.log('[createCompany] Company created successfully:', {
      userId: result.userId,
      companyId: result.companyId,
    });

    return {
      success: true,
      companyId: result.companyId,
      userId: result.userId,
      message: result.message,
    };
  } catch (error) {
    console.error('[createCompany] Error:', error);

    if (error instanceof z.ZodError) {
      console.error('[createCompany] Validation errors:', error.errors);
      return {
        success: false,
        error: 'Datos inválidos. Por favor verifica el formulario.',
        details: error.errors,
      };
    }

    // Extract meaningful error message
    const errorMessage = getConvexErrorMessage(error);
    console.error('[createCompany] Convex error message:', errorMessage);

    return {
      success: false,
      error: errorMessage,
    };
  }
}
