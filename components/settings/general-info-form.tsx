'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const generalInfoSchema = z.object({
  name: z
    .string()
    .min(3, 'Nombre debe tener al menos 3 caracteres')
    .max(200, 'Nombre no puede exceder 200 caracteres'),
  facility_type: z.string().min(1, 'Tipo de instalación es requerido'),
  primary_crop_type_ids: z.array(z.string()).min(1, 'Debes seleccionar al menos un tipo de cultivo'),
  status: z.enum(['active', 'inactive']),
  total_area_m2: z.number().optional(),
});

type GeneralInfoFormData = z.infer<typeof generalInfoSchema>;

interface GeneralInfoFormProps {
  facilityId: Id<'facilities'>;
  facility: any;
}

export function GeneralInfoForm({ facilityId, facility }: GeneralInfoFormProps) {
  const [selectedCrops, setSelectedCrops] = React.useState<string[]>(
    facility.primary_crop_type_ids || []
  );

  const updateFacility = useMutation(api.facilities.update);
  const cropTypes = useQuery(api.crops.getCropTypes, {});

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<GeneralInfoFormData>({
    resolver: zodResolver(generalInfoSchema),
    defaultValues: {
      name: facility.name || '',
      facility_type: facility.facility_type || 'indoor',
      primary_crop_type_ids: facility.primary_crop_type_ids || [],
      status: facility.status || 'active',
      total_area_m2: facility.total_area_m2 || undefined,
    },
  });

  const onSubmit = async (data: GeneralInfoFormData) => {
    try {
      await updateFacility({
        id: facilityId,
        companyId: facility.company_id,
        name: data.name,
        facility_type: data.facility_type,
        status: data.status,
        total_area_m2: data.total_area_m2,
      });

      toast.success('Configuración general actualizada exitosamente');
    } catch (error) {
      toast.error('Error al actualizar configuración');
      console.error('Error updating facility:', error);
    }
  };

  const handleCropToggle = (cropId: string) => {
    const newSelectedCrops = selectedCrops.includes(cropId)
      ? selectedCrops.filter((id) => id !== cropId)
      : [...selectedCrops, cropId];

    setSelectedCrops(newSelectedCrops);
    setValue('primary_crop_type_ids', newSelectedCrops, { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Información General</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Configuración básica de la instalación
        </p>
      </div>

      {/* Facility Name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Nombre de la Instalación <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="Ej: North Farm"
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Facility Type */}
      <div className="space-y-2">
        <Label htmlFor="facility_type">Tipo de Instalación</Label>
        <Select
          defaultValue={facility.facility_type || 'indoor'}
          onValueChange={(value) => setValue('facility_type', value)}
        >
          <SelectTrigger id="facility_type">
            <SelectValue placeholder="Selecciona tipo de instalación" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="indoor">Indoor (Interior)</SelectItem>
            <SelectItem value="outdoor">Outdoor (Exterior)</SelectItem>
            <SelectItem value="greenhouse">Greenhouse (Invernadero)</SelectItem>
            <SelectItem value="mixed">Mixed (Mixto)</SelectItem>
          </SelectContent>
        </Select>
        {errors.facility_type && (
          <p className="text-sm text-destructive">{errors.facility_type.message}</p>
        )}
      </div>

      {/* Primary Crop Types */}
      <div className="space-y-3">
        <Label>
          Cultivos Primarios <span className="text-destructive">*</span>
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {cropTypes === undefined ? (
            <p className="text-sm text-muted-foreground col-span-2">Cargando tipos de cultivo...</p>
          ) : (
            cropTypes.map((crop: any) => (
              <div key={crop._id} className="flex items-center space-x-2">
                <Checkbox
                  id={`crop-${crop._id}`}
                  checked={selectedCrops.includes(crop._id)}
                  onCheckedChange={() => handleCropToggle(crop._id)}
                />
                <Label
                  htmlFor={`crop-${crop._id}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {crop.display_name_es}
                </Label>
              </div>
            ))
          )}
        </div>
        {errors.primary_crop_type_ids && (
          <p className="text-sm text-destructive">{errors.primary_crop_type_ids.message}</p>
        )}
      </div>

      {/* Total Area */}
      <div className="space-y-2">
        <Label htmlFor="total_area_m2">Área Total (m²)</Label>
        <Input
          id="total_area_m2"
          type="number"
          step="any"
          {...register('total_area_m2', { valueAsNumber: true })}
          placeholder="Ej: 1000"
        />
        {errors.total_area_m2 && (
          <p className="text-sm text-destructive">{errors.total_area_m2.message}</p>
        )}
      </div>

      {/* Status */}
      <div className="space-y-3">
        <Label>Estado</Label>
        <RadioGroup
          defaultValue={facility.status || 'active'}
          onValueChange={(value) => setValue('status', value as 'active' | 'inactive')}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="active" id="status-active" />
            <Label htmlFor="status-active" className="font-normal cursor-pointer">
              Activa
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="inactive" id="status-inactive" />
            <Label htmlFor="status-inactive" className="font-normal cursor-pointer">
              Inactiva
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4 border-t">
        <Button type="submit" disabled={isSubmitting} className="bg-[#1B5E20] hover:bg-[#1B5E20]/90">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            'Guardar Cambios'
          )}
        </Button>
      </div>
    </form>
  );
}
