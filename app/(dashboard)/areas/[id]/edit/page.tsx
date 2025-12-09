'use client';

import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { AreaForm } from '@/components/areas/area-form';
import { CreateAreaInput } from '@/lib/validations/area';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Map } from 'lucide-react';

export default function AreaEditPage() {
  const params = useParams();
  const router = useRouter();
  const areaId = params.id as Id<'areas'>;
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const area = useQuery(api.areas.getById, { areaId });
  const cropTypes = useQuery(api.crops.getCropTypes, { includeInactive: false });
  const updateArea = useMutation(api.areas.update);

  if (area === undefined || cropTypes === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20" />
        <Skeleton className="h-[600px]" />
      </div>
    );
  }

  if (area === null) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Area no encontrada"
          icon={Map}
          breadcrumbs={[
            { label: 'Inicio', href: '/dashboard' },
            { label: 'Areas', href: '/areas' },
            { label: 'No encontrada' },
          ]}
        />
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-gray-600">
              El area que buscas no existe o ha sido eliminada
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Transform area data to form format
  const defaultValues: Partial<CreateAreaInput> = {
    name: area.name,
    area_type: area.area_type as CreateAreaInput['area_type'],
    status: area.status as CreateAreaInput['status'],
    compatible_crop_type_ids: area.compatible_crop_type_ids.map(String),
    length_meters: area.length_meters ?? undefined,
    width_meters: area.width_meters ?? undefined,
    height_meters: area.height_meters ?? undefined,
    total_area_m2: area.total_area_m2 ?? undefined,
    usable_area_m2: area.usable_area_m2 ?? undefined,
    capacity_configurations: area.capacity_configurations as CreateAreaInput['capacity_configurations'],
    climate_controlled: area.climate_controlled,
    lighting_controlled: area.lighting_controlled,
    irrigation_system: area.irrigation_system,
    environmental_specs: area.environmental_specs as CreateAreaInput['environmental_specs'],
    equipment_list: area.equipment_list ?? [],
    notes: area.notes ?? undefined,
  };

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
        title: 'Area actualizada',
        description: `El area "${data.name}" ha sido actualizada exitosamente.`,
      });

      router.push(`/areas/${areaId}`);
    } catch (error) {
      console.error('Error updating area:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el area. Por favor, intenta nuevamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/areas/${areaId}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Editar: ${area.name}`}
        icon={Map}
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Areas', href: '/areas' },
          { label: area.name, href: `/areas/${areaId}` },
          { label: 'Editar' },
        ]}
      />

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
