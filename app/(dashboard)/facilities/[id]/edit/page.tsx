'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { FacilityForm } from '@/components/facilities/facility-form';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FacilityFormData } from '@/lib/validations/facilities';
import { useToast } from '@/hooks/use-toast';

export default function FacilityEditPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);

  const facilityId = params.id as string;

  useEffect(() => {
    // Get user data from cookies
    const userDataCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('user_data='));

    if (userDataCookie) {
      try {
        const userData = JSON.parse(
          decodeURIComponent(userDataCookie.split('=')[1])
        );
        setUserId(userData.userId);
        setCompanyId(userData.companyId);
      } catch (err) {
        console.error('Error loading user data:', err);
      }
    }
  }, []);

  // Fetch facility data
  const facility = useQuery(
    api.facilities.get,
    facilityId && companyId
      ? {
          id: facilityId as Id<'facilities'>,
          companyId: companyId as Id<'companies'>,
        }
      : 'skip'
  );

  // Mutation
  const updateFacility = useMutation(api.facilities.update);

  const handleSubmit = async (data: FacilityFormData) => {
    if (!companyId || !facilityId) return;

    try {
      await updateFacility({
        id: facilityId as Id<'facilities'>,
        companyId: companyId as Id<'companies'>,
        name: data.name,
        license_number: data.license_number,
        license_type: data.license_type,
        license_authority: data.license_authority,
        license_issued_date: data.license_issued_date,
        license_expiry_date: data.license_expiry_date,
        facility_type: data.facility_type,
        primary_crop_type_ids: data.primary_crop_type_ids as Id<'crop_types'>[],
        address: data.address,
        city: data.city,
        administrative_division_1: data.administrative_division_1,
        administrative_division_2: data.administrative_division_2,
        postal_code: data.postal_code,
        gps_latitude: data.latitude,
        gps_longitude: data.longitude,
        altitude_meters: data.altitude_meters,
        total_area_m2: data.total_area_m2,
        cultivation_area_m2: data.cultivation_area_m2,
        canopy_area_m2: data.canopy_area_m2,
      });

      toast({
        title: 'Instalación actualizada',
        description: 'Los cambios han sido guardados exitosamente.',
      });

      router.push(`/facilities/${facilityId}`);
    } catch (error) {
      console.error('Error updating facility:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la instalación.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleCancel = () => {
    router.push(`/facilities/${facilityId}`);
  };

  // Loading state
  if (!facility) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  // Prepare default values
  const defaultValues: Partial<FacilityFormData> = {
    name: facility.name,
    license_number: facility.license_number,
    license_type: facility.license_type,
    license_authority: facility.license_authority,
    license_issued_date: facility.license_issued_date,
    license_expiry_date: facility.license_expiry_date,
    facility_type: facility.facility_type,
    primary_crop_type_ids: facility.primary_crop_type_ids as string[],
    address: facility.address,
    city: facility.city,
    administrative_division_1: facility.administrative_division_1,
    administrative_division_2: facility.administrative_division_2,
    postal_code: facility.postal_code,
    latitude: facility.latitude,
    longitude: facility.longitude,
    altitude_meters: facility.altitude_meters,
    total_area_m2: facility.total_area_m2,
    cultivation_area_m2: facility.cultivation_area_m2,
    canopy_area_m2: facility.canopy_area_m2,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={`Editar: ${facility.name}`}
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Instalaciones', href: '/facilities' },
          { label: facility.name, href: `/facilities/${facilityId}` },
          { label: 'Editar' },
        ]}
      />

      {/* Form */}
      <FacilityForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        submitLabel="Guardar Cambios"
      />
    </div>
  );
}
