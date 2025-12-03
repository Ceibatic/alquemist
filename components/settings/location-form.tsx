'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CascadingSelect } from '@/components/shared/cascading-select';
import { GeolocationButton, GeolocationCoordinates } from '@/components/shared/geolocation-button';
import { toast } from 'sonner';
import { Loader2, MapPin } from 'lucide-react';

const locationSchema = z.object({
  address: z
    .string()
    .min(5, 'Dirección debe tener al menos 5 caracteres')
    .max(200, 'Dirección no puede exceder 200 caracteres')
    .optional(),
  administrative_division_1: z
    .string()
    .min(1, 'Departamento es requerido'),
  administrative_division_2: z
    .string()
    .min(1, 'Municipio es requerido'),
  postal_code: z
    .string()
    .max(20, 'Código postal no puede exceder 20 caracteres')
    .optional(),
  gps_latitude: z.number().min(-90).max(90).optional(),
  gps_longitude: z.number().min(-180).max(180).optional(),
  altitude_meters: z.number().min(-500).max(9000).optional(),
});

type LocationFormData = z.infer<typeof locationSchema>;

interface LocationFormProps {
  facilityId: Id<'facilities'>;
  facility: any;
}

export function LocationForm({ facilityId, facility }: LocationFormProps) {
  const updateFacility = useMutation(api.facilities.update);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      address: facility.address || '',
      administrative_division_1: facility.administrative_division_1 || '',
      administrative_division_2: facility.administrative_division_2 || '',
      postal_code: facility.postal_code || '',
      gps_latitude: facility.latitude || undefined,
      gps_longitude: facility.longitude || undefined,
      altitude_meters: facility.altitude_meters || undefined,
    },
  });

  const gpsLatitude = watch('gps_latitude');
  const gpsLongitude = watch('gps_longitude');
  const departmentValue = watch('administrative_division_1');
  const municipalityValue = watch('administrative_division_2');

  const handleLocationCapture = (coords: GeolocationCoordinates) => {
    setValue('gps_latitude', coords.latitude);
    setValue('gps_longitude', coords.longitude);
  };

  const coordinates: GeolocationCoordinates | undefined =
    gpsLatitude && gpsLongitude
      ? { latitude: gpsLatitude, longitude: gpsLongitude }
      : undefined;

  const onSubmit = async (data: LocationFormData) => {
    try {
      await updateFacility({
        id: facilityId,
        companyId: facility.company_id,
        address: data.address || undefined,
        administrative_division_1: data.administrative_division_1,
        administrative_division_2: data.administrative_division_2,
        postal_code: data.postal_code || undefined,
        gps_latitude: data.gps_latitude,
        gps_longitude: data.gps_longitude,
        altitude_meters: data.altitude_meters,
      });

      toast.success('Ubicación actualizada exitosamente');
    } catch (error) {
      toast.error('Error al actualizar ubicación');
      console.error('Error updating location:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Ubicación</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Información de ubicación física de la instalación
        </p>
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="address">Dirección</Label>
        <Input
          id="address"
          {...register('address')}
          placeholder="Ej: Calle 123 #45-67"
        />
        {errors.address && (
          <p className="text-sm text-destructive">{errors.address.message}</p>
        )}
      </div>

      {/* Department & Municipality */}
      <CascadingSelect
        departmentValue={departmentValue}
        municipalityValue={municipalityValue}
        onDepartmentChange={(value) => setValue('administrative_division_1', value)}
        onMunicipalityChange={(value) => setValue('administrative_division_2', value)}
        departmentError={errors.administrative_division_1?.message}
        municipalityError={errors.administrative_division_2?.message}
        required
      />

      {/* Postal Code */}
      <div className="space-y-2">
        <Label htmlFor="postal_code">Código Postal</Label>
        <Input
          id="postal_code"
          {...register('postal_code')}
          placeholder="Ej: 110111"
        />
        {errors.postal_code && (
          <p className="text-sm text-destructive">{errors.postal_code.message}</p>
        )}
      </div>

      {/* GPS Coordinates */}
      <div className="space-y-4">
        <div>
          <Label>Coordenadas GPS</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Captura la ubicación GPS de la instalación
          </p>
        </div>

        <GeolocationButton
          onLocationCapture={handleLocationCapture}
          coordinates={coordinates}
        />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="gps_latitude">Latitud</Label>
            <Input
              id="gps_latitude"
              type="number"
              step="0.000001"
              {...register('gps_latitude', { valueAsNumber: true })}
              placeholder="Ej: 4.710989"
            />
            {errors.gps_latitude && (
              <p className="text-sm text-destructive">{errors.gps_latitude.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gps_longitude">Longitud</Label>
            <Input
              id="gps_longitude"
              type="number"
              step="0.000001"
              {...register('gps_longitude', { valueAsNumber: true })}
              placeholder="Ej: -74.072092"
            />
            {errors.gps_longitude && (
              <p className="text-sm text-destructive">{errors.gps_longitude.message}</p>
            )}
          </div>
        </div>

        {/* Map Preview Placeholder */}
        {coordinates && (
          <div className="bg-muted/50 border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center gap-2">
            <MapPin className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">
              Vista previa del mapa
            </p>
            <p className="text-xs text-muted-foreground">
              Disponible en versiones futuras
            </p>
          </div>
        )}
      </div>

      {/* Altitude */}
      <div className="space-y-2">
        <Label htmlFor="altitude_meters">Altitud (metros sobre el nivel del mar)</Label>
        <Input
          id="altitude_meters"
          type="number"
          step="0.1"
          {...register('altitude_meters', { valueAsNumber: true })}
          placeholder="Ej: 2640"
        />
        {errors.altitude_meters && (
          <p className="text-sm text-destructive">{errors.altitude_meters.message}</p>
        )}
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
