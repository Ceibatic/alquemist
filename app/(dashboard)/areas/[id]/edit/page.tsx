'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { AreaForm } from '@/components/areas/area-form';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { CreateAreaInput } from '@/lib/validations/area';

export default function AreaEditPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const areaId = params.id as Id<'areas'>;

  const area = useQuery(api.areas.get, { id: areaId });
  const cropTypes = useQuery(api.crops.getCropTypes, { includeInactive: false });
  const updateArea = useMutation(api.areas.update);

  if (area === undefined || cropTypes === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (area === null) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Área no encontrada"
          breadcrumbs={[
            { label: 'Inicio', href: '/dashboard' },
            { label: 'Áreas', href: '/areas' },
            { label: 'No encontrada' },
          ]}
        />
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-gray-600">
              El área que buscas no existe o ha sido eliminada
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (data: CreateAreaInput) => {
    try {
      setIsSubmitting(true);

      await updateArea({
        id: areaId,
        name: data.name,
        areaType: data.area_type,
        compatibleCropTypeIds: data.compatible_crop_type_ids as Id<'crop_types'>[],
        status: data.status,
        totalAreaM2: data.total_area_m2,
        lengthMeters: data.length_meters,
        widthMeters: data.width_meters,
        heightMeters: data.height_meters,
        usableAreaM2: data.usable_area_m2,
        capacityConfigurations: data.capacity_configurations,
        climateControlled: data.climate_controlled,
        lightingControlled: data.lighting_controlled,
        irrigationSystem: data.irrigation_system,
        environmentalSpecs: data.environmental_specs,
        equipmentList: data.equipment_list || [],
        notes: data.notes,
      });

      toast({
        title: 'Área actualizada',
        description: `El área "${data.name}" ha sido actualizada exitosamente.`,
      });

      router.push(`/areas/${areaId}`);
    } catch (error) {
      console.error('Error updating area:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el área. Por favor, intenta nuevamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/areas/${areaId}`);
  };

  // Prepare default values for the form
  const defaultValues: Partial<CreateAreaInput> = {
    name: area.name,
    area_type: area.area_type as any,
    status: area.status as any,
    compatible_crop_type_ids: area.compatible_crop_type_ids,
    total_area_m2: area.total_area_m2 || 0,
    length_meters: area.length_meters,
    width_meters: area.width_meters,
    height_meters: area.height_meters,
    usable_area_m2: area.usable_area_m2,
    capacity_configurations: area.capacity_configurations as any,
    climate_controlled: area.climate_controlled,
    lighting_controlled: area.lighting_controlled,
    irrigation_system: area.irrigation_system,
    environmental_specs: area.environmental_specs,
    equipment_list: area.equipment_list,
    notes: area.notes,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={`Editar: ${area.name}`}
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Áreas', href: '/areas' },
          { label: area.name, href: `/areas/${areaId}` },
          { label: 'Editar' },
        ]}
      />

      {/* Form Card */}
      <Card>
        <CardContent className="pt-6">
          <AreaForm
            defaultValues={defaultValues}
            cropTypes={cropTypes.map((ct) => ({ _id: ct._id, name: ct.name }))}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
}
