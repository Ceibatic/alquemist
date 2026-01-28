'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
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
import { CascadingSelect } from '@/components/shared/cascading-select';
import { GeolocationButton, GeolocationCoordinates } from '@/components/shared/geolocation-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, MapPin, Factory, FileText, Map } from 'lucide-react';
import {
  facilityFormSchema,
  FacilityFormData,
  LICENSE_TYPES,
  FACILITY_TYPES,
} from '@/lib/validations/facilities';

interface FacilityFormProps {
  defaultValues?: Partial<FacilityFormData>;
  onSubmit: (data: FacilityFormData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  isLoading?: boolean;
}

export function FacilityForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = 'Crear Instalación',
  isLoading = false,
}: FacilityFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<FacilityFormData>({
    resolver: zodResolver(facilityFormSchema),
    defaultValues: {
      primary_crop_type_ids: [],
      ...defaultValues,
    },
  });

  // Detect edit mode - if defaultValues has a license_number, we're editing
  const isEditMode = !!defaultValues?.license_number;

  // Fetch crop types for multi-select
  const cropTypes = useQuery(api.crops.getCropTypes, {});

  // Watch values for cascading selects and GPS
  const departmentValue = watch('administrative_division_1');
  const municipalityValue = watch('administrative_division_2');
  const latitude = watch('latitude');
  const longitude = watch('longitude');
  const selectedCropTypeIds = watch('primary_crop_type_ids') || [];

  const handleLocationCapture = (coords: GeolocationCoordinates) => {
    setValue('latitude', coords.latitude);
    setValue('longitude', coords.longitude);
  };

  const handleCropTypeToggle = (cropTypeId: string) => {
    const currentIds = selectedCropTypeIds;
    const newIds = currentIds.includes(cropTypeId)
      ? currentIds.filter((id) => id !== cropTypeId)
      : [...currentIds, cropTypeId];
    setValue('primary_crop_type_ids', newIds);
  };

  const onFormSubmit = async (data: FacilityFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Factory className="h-5 w-5" />
            Información Básica
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Nombre de la Instalación
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Ej: Instalación Principal"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* License Number */}
          <div className="space-y-2">
            <Label htmlFor="license_number">
              Número de Licencia
              <span className="text-destructive ml-1">*</span>
              {isEditMode && (
                <span className="text-muted-foreground text-xs ml-2">(No editable)</span>
              )}
            </Label>
            <Input
              id="license_number"
              {...register('license_number')}
              placeholder="Ej: INV-2024-001"
              disabled={isEditMode}
              className={errors.license_number ? 'border-destructive' : ''}
            />
            {errors.license_number && (
              <p className="text-sm text-destructive">
                {errors.license_number.message}
              </p>
            )}
          </div>

          {/* Facility Type */}
          <div className="space-y-2">
            <Label htmlFor="facility_type">Tipo de Instalación</Label>
            <Select
              value={watch('facility_type') || ''}
              onValueChange={(value) => setValue('facility_type', value)}
            >
              <SelectTrigger id="facility_type">
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                {FACILITY_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.facility_type && (
              <p className="text-sm text-destructive">
                {errors.facility_type.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* License Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Detalles de Licencia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* License Type */}
          <div className="space-y-2">
            <Label htmlFor="license_type">Tipo de Licencia</Label>
            <Select
              value={watch('license_type') || ''}
              onValueChange={(value) => setValue('license_type', value)}
            >
              <SelectTrigger id="license_type">
                <SelectValue placeholder="Selecciona un tipo de licencia" />
              </SelectTrigger>
              <SelectContent>
                {LICENSE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* License Authority */}
          <div className="space-y-2">
            <Label htmlFor="license_authority">Autoridad Emisora</Label>
            <Input
              id="license_authority"
              {...register('license_authority')}
              placeholder="Ej: INVIMA"
            />
          </div>

          {/* License Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="license_issued_date">Fecha de Emisión</Label>
              <Input
                id="license_issued_date"
                type="date"
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value).getTime() : undefined;
                  setValue('license_issued_date', date);
                }}
                defaultValue={
                  defaultValues?.license_issued_date
                    ? new Date(defaultValues.license_issued_date).toISOString().split('T')[0]
                    : ''
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="license_expiry_date">Fecha de Vencimiento</Label>
              <Input
                id="license_expiry_date"
                type="date"
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value).getTime() : undefined;
                  setValue('license_expiry_date', date);
                }}
                defaultValue={
                  defaultValues?.license_expiry_date
                    ? new Date(defaultValues.license_expiry_date).toISOString().split('T')[0]
                    : ''
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Primary Crops */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Cultivos Primarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cropTypes === undefined ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando tipos de cultivo...
            </div>
          ) : cropTypes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay tipos de cultivo disponibles
            </p>
          ) : (
            <div className="space-y-3">
              {cropTypes.map((cropType) => (
                <div key={cropType._id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`crop-${cropType._id}`}
                    checked={selectedCropTypeIds.includes(cropType._id)}
                    onCheckedChange={() => handleCropTypeToggle(cropType._id)}
                  />
                  <Label
                    htmlFor={`crop-${cropType._id}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {cropType.display_name_es}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5" />
            Ubicación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              {...register('address')}
              placeholder="Ej: Calle 123 # 45-67"
            />
          </div>

          {/* Department and Municipality */}
          <CascadingSelect
            departmentValue={departmentValue}
            municipalityValue={municipalityValue}
            onDepartmentChange={(value) => setValue('administrative_division_1', value)}
            onMunicipalityChange={(value) => setValue('administrative_division_2', value)}
            departmentError={errors.administrative_division_1?.message}
            municipalityError={errors.administrative_division_2?.message}
            required
          />

          {/* City and Postal Code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Ciudad/Municipio</Label>
              <Input
                id="city"
                {...register('city')}
                placeholder="Ej: Bogotá"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postal_code">Código Postal</Label>
              <Input
                id="postal_code"
                {...register('postal_code')}
                placeholder="Ej: 110111"
              />
            </div>
          </div>

          <Separator />

          {/* GPS Coordinates */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Coordenadas GPS</h4>

            <GeolocationButton
              onLocationCapture={handleLocationCapture}
              coordinates={
                latitude && longitude
                  ? { latitude, longitude }
                  : undefined
              }
            />

            {/* Manual Coordinates Input */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitud</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  {...register('latitude', { valueAsNumber: true })}
                  placeholder="Ej: 4.7110"
                />
                {errors.latitude && (
                  <p className="text-sm text-destructive">
                    {errors.latitude.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="longitude">Longitud</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  {...register('longitude', { valueAsNumber: true })}
                  placeholder="Ej: -74.0721"
                />
                {errors.longitude && (
                  <p className="text-sm text-destructive">
                    {errors.longitude.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="altitude_meters">Altitud (metros)</Label>
                <Input
                  id="altitude_meters"
                  type="number"
                  {...register('altitude_meters', { valueAsNumber: true })}
                  placeholder="Ej: 2640"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Areas */}
      <Card>
        <CardHeader>
          <CardTitle>Áreas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <p className="text-sm text-destructive">
                  {errors.total_area_m2.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cultivation_area_m2">Área de Cultivo (m²)</Label>
              <Input
                id="cultivation_area_m2"
                type="number"
                step="any"
                {...register('cultivation_area_m2', { valueAsNumber: true })}
                placeholder="Ej: 800"
              />
              {errors.cultivation_area_m2 && (
                <p className="text-sm text-destructive">
                  {errors.cultivation_area_m2.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="canopy_area_m2">Área de Dosel (m²)</Label>
              <Input
                id="canopy_area_m2"
                type="number"
                step="any"
                {...register('canopy_area_m2', { valueAsNumber: true })}
                placeholder="Ej: 600"
              />
              {errors.canopy_area_m2 && (
                <p className="text-sm text-destructive">
                  {errors.canopy_area_m2.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-4 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting || isLoading}
          >
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="bg-amber-500 hover:bg-amber-600 text-white"
        >
          {isSubmitting || isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}
