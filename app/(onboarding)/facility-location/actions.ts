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

// Map frontend crop names to database crop names
// Database uses English names: Cannabis, Coffee, Cocoa, Flowers
const cropNameMap: Record<string, string> = {
  Cannabis: 'Cannabis',
  Cafe: 'Coffee',
  Cacao: 'Cocoa',
  Flores: 'Flowers',
};

export async function createFacility(
  data: z.infer<typeof facilityCompleteSchema>,
  companyId: string,
  userId: string,
  generateSampleData: boolean = true
) {
  try {
    // Validate the complete data
    const validated = facilityCompleteSchema.parse(data);

    console.log('[createFacility] Starting facility creation:', {
      companyId,
      userId,
      facilityName: validated.name,
      primaryCrops: validated.primaryCrops,
      departmentCode: validated.departmentCode,
      municipalityCode: validated.municipalityCode,
    });

    // 1. Get crop type IDs from names
    const cropTypeIds: Id<'crop_types'>[] = [];
    for (const cropName of validated.primaryCrops) {
      const dbCropName = cropNameMap[cropName] || cropName;
      console.log(`[createFacility] Looking up crop type: ${cropName} -> ${dbCropName}`);

      const cropType = await convex.query(api.crops.getCropTypeByName, {
        name: dbCropName,
      });

      if (cropType) {
        console.log(`[createFacility] Found crop type: ${cropType._id}`);
        cropTypeIds.push(cropType._id);
      } else {
        console.warn(`[createFacility] Crop type not found: ${dbCropName}`);
      }
    }

    if (cropTypeIds.length === 0) {
      console.error('[createFacility] No crop types found for:', validated.primaryCrops);
      return {
        success: false,
        error: 'No se encontraron los tipos de cultivo seleccionados. Verifica que los datos maestros estén configurados.',
      };
    }

    // 2. Get geographic location names from codes
    console.log('[createFacility] Looking up geographic locations...');

    // Get department name
    const departments = await convex.query(api.geographic.getDepartments, {
      countryCode: 'CO',
    });
    const department = departments.find(
      (d) => d.division_1_code === validated.departmentCode
    );

    if (!department) {
      console.error('[createFacility] Department not found:', validated.departmentCode);
      return {
        success: false,
        error: `Departamento no encontrado: ${validated.departmentCode}`,
      };
    }
    console.log(`[createFacility] Found department: ${department.division_1_name}`);

    // Get municipality name
    const municipalities = await convex.query(api.geographic.getMunicipalities, {
      countryCode: 'CO',
      departmentCode: validated.departmentCode,
    });
    const municipality = municipalities.find(
      (m) => m.division_2_code === validated.municipalityCode
    );

    if (!municipality) {
      console.error('[createFacility] Municipality not found:', validated.municipalityCode);
      return {
        success: false,
        error: `Municipio no encontrado: ${validated.municipalityCode}`,
      };
    }
    console.log(`[createFacility] Found municipality: ${municipality.division_2_name}`);

    // 3. Create facility with all required fields
    console.log('[createFacility] Creating facility in database...');
    const facilityId = await convex.mutation(api.facilities.create, {
      company_id: companyId as Id<'companies'>,
      name: validated.name,
      license_number: validated.licenseNumber,
      license_type: licenseTypeMap[validated.licenseType] || validated.licenseType,
      total_area_m2: validated.licensedArea,
      address: validated.address,
      administrative_division_1: department.division_1_name,
      administrative_division_2: municipality.division_2_name,
      regional_code: validated.municipalityCode,
      latitude: validated.latitude,
      longitude: validated.longitude,
      primary_crop_type_ids: cropTypeIds,
      climate_zone: validated.climateZone,
      status: 'active',
    });

    console.log('[createFacility] Facility created:', facilityId);

    // 4. Update user with primary facility
    console.log('[createFacility] Updating user primary facility...');
    await convex.mutation(api.users.setCurrentFacility, {
      userId: userId as Id<'users'>,
      facilityId: facilityId,
    });

    console.log('[createFacility] User updated successfully');

    // 5. Generate sample data if requested
    if (generateSampleData && cropTypeIds.length > 0) {
      console.log('[createFacility] Generating sample data...');
      try {
        const seedResult = await convex.mutation(api.seedOnboardingData.generateSampleDataForNewCompany, {
          companyId: companyId as Id<'companies'>,
          facilityId: facilityId,
          userId: userId as Id<'users'>,
          cropTypeId: cropTypeIds[0], // Use primary crop type
        });
        console.log('[createFacility] Sample data generated:', seedResult);
      } catch (seedError) {
        // Log but don't fail - sample data is nice to have but not critical
        console.error('[createFacility] Error generating sample data:', seedError);
      }
    }

    return {
      success: true,
      facilityId: facilityId,
    };
  } catch (error) {
    console.error('[createFacility] Error:', error);

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
