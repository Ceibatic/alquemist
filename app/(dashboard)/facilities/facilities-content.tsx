'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useRouter } from 'next/navigation';
import { FacilityCard } from '@/components/facilities/facility-card';
import { PlanLimitIndicator } from '@/components/facilities/plan-limit-indicator';
import { FacilityCreateModal } from '@/components/facilities/facility-create-modal';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Plus, Factory } from 'lucide-react';
import { FacilityFormData, PlanType, getPlanLimit } from '@/lib/validations/facilities';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { FacilityWithCropTypes } from '@/lib/types/facilities';

interface FacilitiesContentProps {
  userId: string;
  companyId: string;
  createModalTrigger?: number;
}

export function FacilitiesContent({ userId, companyId, createModalTrigger }: FacilitiesContentProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Open modal when trigger changes
  useEffect(() => {
    if (createModalTrigger && createModalTrigger > 0) {
      setIsCreateModalOpen(true);
    }
  }, [createModalTrigger]);

  // Fetch user data to get current facility
  const user = useQuery(api.users.getUserById, {
    userId: userId as Id<'users'>,
  });

  // Fetch facilities with crop types
  const facilitiesData = useQuery(api.facilities.list, {
    companyId: companyId as Id<'companies'>,
  });

  // Fetch crop types for facility cards
  const cropTypes = useQuery(api.crops.getCropTypes, {});

  // Mutations
  const createFacility = useMutation(api.facilities.create);
  const setCurrentFacility = useMutation(api.users.setCurrentFacility);

  // For now, we'll use 'business' as default plan type
  // In production, this would come from company settings
  const planType: PlanType = 'business';
  const planLimit = getPlanLimit(planType);

  const currentFacilityId = user?.primary_facility_id || user?.accessibleFacilityIds?.[0];
  const facilities = facilitiesData?.facilities || [];
  const totalFacilities = facilitiesData?.total || 0;

  // Enrich facilities with crop type information
  const enrichedFacilities: FacilityWithCropTypes[] = facilities.map((facility) => ({
    ...facility,
    cropTypes: facility.primary_crop_type_ids
      .map((id) => cropTypes?.find((ct) => ct._id === id))
      .filter(Boolean)
      .map((ct) => ({
        _id: ct!._id,
        name: ct!.name,
        display_name_es: ct!.display_name_es,
      })),
  }));

  const handleCreateFacility = async (data: FacilityFormData) => {
    try {
      const facilityId = await createFacility({
        company_id: companyId as Id<'companies'>,
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
        latitude: data.latitude,
        longitude: data.longitude,
        altitude_meters: data.altitude_meters,
        total_area_m2: data.total_area_m2,
        cultivation_area_m2: data.cultivation_area_m2,
        canopy_area_m2: data.canopy_area_m2,
        status: 'active',
      });

      toast({
        title: 'Instalación creada',
        description: `La instalación "${data.name}" ha sido creada exitosamente.`,
      });

      // If this is the first facility, set it as primary
      if (!currentFacilityId && user) {
        await setCurrentFacility({
          userId: userId as Id<'users'>,
          facilityId: facilityId as Id<'facilities'>,
        });
      }

      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating facility:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear la instalación. Por favor intenta de nuevo.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleSwitchToFacility = async (facilityId: string) => {
    if (!user) return;

    try {
      await setCurrentFacility({
        userId: userId as Id<'users'>,
        facilityId: facilityId as Id<'facilities'>,
      });

      toast({
        title: 'Instalación cambiada',
        description: 'Has cambiado a otra instalación exitosamente.',
      });

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error switching facility:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cambiar la instalación. Por favor intenta de nuevo.',
        variant: 'destructive',
      });
    }
  };

  // Loading state
  if (!user || facilitiesData === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Plan Limit Indicator */}
      {planLimit !== -1 && (
        <PlanLimitIndicator
          currentCount={totalFacilities}
          maxCount={planLimit}
          planName={planType.charAt(0).toUpperCase() + planType.slice(1)}
        />
      )}

      {/* Facilities Grid */}
      {enrichedFacilities.length === 0 ? (
        <EmptyState
          icon={Factory}
          title="No hay instalaciones"
          description="Crea tu primera instalación para comenzar"
          action={{
            label: 'Nueva Instalación',
            onClick: () => setIsCreateModalOpen(true),
          }}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {enrichedFacilities.map((facility) => (
            <FacilityCard
              key={facility._id}
              facility={facility}
              isCurrentFacility={facility._id === currentFacilityId}
              onSwitchToFacility={handleSwitchToFacility}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <FacilityCreateModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSubmit={handleCreateFacility}
        currentFacilityCount={totalFacilities}
        planType={planType}
      />
    </div>
  );
}
