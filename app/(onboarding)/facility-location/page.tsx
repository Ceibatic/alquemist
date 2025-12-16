'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MapPin, ArrowRight, Sparkles } from 'lucide-react';
import {
  facilityLocationSchema,
  type FacilityLocationFormValues,
} from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CascadingSelect } from '@/components/shared/cascading-select';
import {
  GeolocationButton,
  type GeolocationCoordinates,
} from '@/components/shared/geolocation-button';
import { ProgressIndicator } from '@/components/shared/progress-indicator';
import { createFacility } from './actions';

const CLIMATE_ZONES = [
  { value: 'Tropical', label: 'Tropical' },
  { value: 'Subtropical', label: 'Subtropical' },
  { value: 'Templado', label: 'Templado' },
];

export default function FacilityLocationPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<GeolocationCoordinates | undefined>();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [generateSampleData, setGenerateSampleData] = useState(true);

  const form = useForm<FacilityLocationFormValues>({
    resolver: zodResolver(facilityLocationSchema),
    defaultValues: {
      departmentCode: '',
      municipalityCode: '',
      address: '',
      latitude: undefined,
      longitude: undefined,
      climateZone: undefined,
    },
  });

  // Verify previous step is complete
  useEffect(() => {
    const storedCompanyId = sessionStorage.getItem('companyId');
    const storedUserId = sessionStorage.getItem('signupUserId');
    const basicData = sessionStorage.getItem('facilityBasicData');

    if (!storedCompanyId || !basicData || !storedUserId) {
      // Redirect to appropriate step
      if (!storedUserId) {
        router.push('/signup');
      } else if (!storedCompanyId) {
        router.push('/company-setup');
      } else {
        router.push('/facility-basic');
      }
      return;
    }

    setCompanyId(storedCompanyId);
    setUserId(storedUserId);

    // Load saved location data if exists
    const savedLocationData = sessionStorage.getItem('facilityLocationData');
    if (savedLocationData) {
      try {
        const parsed = JSON.parse(savedLocationData);
        form.reset(parsed);
        if (parsed.latitude && parsed.longitude) {
          setCoordinates({
            latitude: parsed.latitude,
            longitude: parsed.longitude,
          });
        }
      } catch (e) {
        console.error('Error loading saved location data:', e);
      }
    }
  }, [router, form]);

  const handleLocationCapture = (coords: GeolocationCoordinates) => {
    setCoordinates(coords);
    form.setValue('latitude', coords.latitude, { shouldValidate: true });
    form.setValue('longitude', coords.longitude, { shouldValidate: true });
  };

  const onSubmit = async (data: FacilityLocationFormValues) => {
    if (!companyId || !userId) {
      setGlobalError('Sesión expirada. Por favor vuelve a iniciar el proceso.');
      router.push('/signup');
      return;
    }

    setIsSubmitting(true);
    setGlobalError(null);

    try {
      // Get basic info from sessionStorage
      const basicDataStr = sessionStorage.getItem('facilityBasicData');
      if (!basicDataStr) {
        setGlobalError('Datos básicos no encontrados. Por favor completa el paso anterior.');
        router.push('/facility-basic');
        return;
      }

      const basicData = JSON.parse(basicDataStr);

      // Combine both datasets
      const completeData = {
        ...basicData,
        ...data,
      };

      // Submit to server with companyId, userId, and sample data flag
      const result = await createFacility(completeData, companyId, userId, generateSampleData);

      if (!result.success) {
        setGlobalError(result.error || 'Error al crear la instalación');
        return;
      }

      // Clear sessionStorage data
      sessionStorage.removeItem('facilityBasicData');
      sessionStorage.removeItem('facilityLocationData');

      // Store facility ID
      if (result.facilityId) {
        sessionStorage.setItem('facilityId', result.facilityId);
      }

      // Navigate to setup complete
      router.push('/setup-complete');
    } catch (error) {
      console.error('Error submitting facility:', error);
      setGlobalError('Error inesperado. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-2">
          <MapPin className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Ubicación de la Instalación</h2>
        <p className="text-sm text-muted-foreground">
          Configura la ubicación geográfica de tu instalación
        </p>
        <ProgressIndicator currentStep={3} totalSteps={4} />
      </div>

      {/* Form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* Global Error */}
        {globalError && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
            {globalError}
          </div>
        )}

        {/* Location (Department & Municipality) */}
        <CascadingSelect
          departmentValue={form.watch('departmentCode')}
          municipalityValue={form.watch('municipalityCode')}
          onDepartmentChange={(value) =>
            form.setValue('departmentCode', value, { shouldValidate: true })
          }
          onMunicipalityChange={(value) =>
            form.setValue('municipalityCode', value, { shouldValidate: true })
          }
          departmentError={form.formState.errors.departmentCode?.message}
          municipalityError={form.formState.errors.municipalityCode?.message}
          departmentLabel="Departamento"
          municipalityLabel="Municipio"
          required
          disabled={isSubmitting}
        />

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address">
            Dirección
            <span className="text-destructive ml-1">*</span>
          </Label>
          <Input
            id="address"
            placeholder="Ej: Vereda El Placer, Km 5 Vía Popayán"
            {...form.register('address')}
            disabled={isSubmitting}
          />
          {form.formState.errors.address && (
            <p className="text-sm text-destructive">
              {form.formState.errors.address.message}
            </p>
          )}
        </div>

        {/* GPS Coordinates */}
        <div className="space-y-2">
          <Label>
            Coordenadas GPS
            <span className="text-destructive ml-1">*</span>
          </Label>
          <GeolocationButton
            coordinates={coordinates}
            onLocationCapture={handleLocationCapture}
            disabled={isSubmitting}
          />

          {/* Manual coordinate input */}
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="space-y-1.5">
              <Label htmlFor="latitude" className="text-xs">
                Latitud
              </Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                placeholder="-90 a 90"
                {...form.register('latitude', { valueAsNumber: true })}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="longitude" className="text-xs">
                Longitud
              </Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                placeholder="-180 a 180"
                {...form.register('longitude', { valueAsNumber: true })}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {(form.formState.errors.latitude || form.formState.errors.longitude) && (
            <p className="text-sm text-destructive">
              {form.formState.errors.latitude?.message ||
                form.formState.errors.longitude?.message}
            </p>
          )}
        </div>

        {/* Climate Zone */}
        <div className="space-y-2">
          <Label htmlFor="climateZone">
            Zona Climática
            <span className="text-destructive ml-1">*</span>
          </Label>
          <Select
            value={form.watch('climateZone') ?? ''}
            onValueChange={(value) =>
              form.setValue('climateZone', value as FacilityLocationFormValues['climateZone'])
            }
            disabled={isSubmitting}
          >
            <SelectTrigger id="climateZone">
              <SelectValue placeholder="Selecciona la zona climática" />
            </SelectTrigger>
            <SelectContent>
              {CLIMATE_ZONES.map((zone) => (
                <SelectItem key={zone.value} value={zone.value}>
                  {zone.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.climateZone && (
            <p className="text-sm text-destructive">
              {form.formState.errors.climateZone.message}
            </p>
          )}
        </div>

        {/* Sample Data Option */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="generateSampleData"
              checked={generateSampleData}
              onCheckedChange={(checked) => setGenerateSampleData(checked === true)}
              disabled={isSubmitting}
            />
            <div className="flex-1">
              <Label
                htmlFor="generateSampleData"
                className="text-sm font-medium cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4 text-primary" />
                Generar datos de ejemplo
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Incluye areas, cultivares, proveedores, productos y una plantilla de produccion para explorar la plataforma
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            'Creando instalación...'
          ) : (
            <>
              Completar Configuración
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>

        {/* Back Button */}
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={() => {
            // Save current data before going back
            sessionStorage.setItem(
              'facilityLocationData',
              JSON.stringify(form.getValues())
            );
            router.push('/facility-basic');
          }}
          disabled={isSubmitting}
        >
          Volver a Información Básica
        </Button>
      </form>

      {/* Footer */}
      <p className="text-xs text-center text-muted-foreground">
        Paso 3 de 4 - Ubicación de la Instalación (2/2)
      </p>
    </div>
  );
}
