'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AreaForm } from './area-form';
import { CreateAreaInput } from '@/lib/validations/area';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useToast } from '@/hooks/use-toast';
import { Id } from '@/convex/_generated/dataModel';
import { LayoutGrid } from 'lucide-react';

interface AreaCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facilityId: Id<'facilities'>;
  cropTypes: Array<{ _id: string; name: string }>;
}

export function AreaCreateModal({
  open,
  onOpenChange,
  facilityId,
  cropTypes,
}: AreaCreateModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createArea = useMutation(api.areas.create);
  const { toast } = useToast();

  const handleSubmit = async (data: CreateAreaInput) => {
    try {
      setIsSubmitting(true);

      await createArea({
        facilityId,
        name: data.name,
        areaType: data.area_type,
        compatibleCropTypeIds: data.compatible_crop_type_ids as Id<'crop_types'>[],
        status: data.status || 'active',
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
        title: 'Área creada',
        description: `El área "${data.name}" ha sido creada exitosamente.`,
      });

      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating area:', error);
      toast({
        title: 'Error al crear área',
        description: error?.message || 'No se pudo crear el área. Por favor, intenta nuevamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <LayoutGrid className="h-5 w-5 text-green-700" />
            </div>
            Nueva Área
          </DialogTitle>
          <DialogDescription>
            Crea un área de cultivo en tu instalación. Los campos marcados con *
            son obligatorios.
          </DialogDescription>
        </DialogHeader>

        <AreaForm
          cropTypes={cropTypes}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
