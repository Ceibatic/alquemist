'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Factory, ArrowRight } from 'lucide-react';
import {
  facilityBasicInfoSchema,
  type FacilityBasicInfoFormValues,
} from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckboxGroupField } from '@/components/shared/checkbox-group-field';
import { ProgressIndicator } from '@/components/shared/progress-indicator';

const LICENSE_TYPES = [
  { value: 'CultivoComercial', label: 'Cultivo Comercial' },
  { value: 'Investigacion', label: 'Investigación' },
  { value: 'Procesamiento', label: 'Procesamiento' },
  { value: 'Otro', label: 'Otro' },
];

const PRIMARY_CROPS = [
  {
    value: 'Cannabis',
    label: 'Cannabis',
    description: 'Cultivo de cannabis medicinal o industrial',
  },
  {
    value: 'Cafe',
    label: 'Café',
    description: 'Cultivo y procesamiento de café',
  },
  {
    value: 'Cacao',
    label: 'Cacao',
    description: 'Cultivo y procesamiento de cacao',
  },
  {
    value: 'Flores',
    label: 'Flores',
    description: 'Cultivo de flores ornamentales',
  },
];

export default function FacilityBasicPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const form = useForm<FacilityBasicInfoFormValues>({
    resolver: zodResolver(facilityBasicInfoSchema),
    defaultValues: {
      name: '',
      licenseNumber: '',
      licenseType: undefined,
      licensedArea: undefined,
      primaryCrops: [],
    },
  });

  // Verify company setup is complete and facility not already created
  useEffect(() => {
    const companyId = sessionStorage.getItem('companyId');
    if (!companyId) {
      router.push('/company-setup');
      return;
    }

    // If facility already created, skip to setup-complete
    const facilityId = sessionStorage.getItem('facilityId');
    if (facilityId) {
      router.push('/setup-complete');
      return;
    }

    // Load saved data if exists
    const savedData = sessionStorage.getItem('facilityBasicData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        form.reset(parsed);
      } catch (e) {
        console.error('Error loading saved data:', e);
      }
    }
  }, [router, form]);

  const onSubmit = async (data: FacilityBasicInfoFormValues) => {
    setIsSubmitting(true);
    setGlobalError(null);

    try {
      // Store data in sessionStorage for next step
      sessionStorage.setItem('facilityBasicData', JSON.stringify(data));

      // Navigate to location page
      router.push('/facility-location');
    } catch (error) {
      console.error('Error saving facility basic info:', error);
      setGlobalError('Error al guardar. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-2">
          <Factory className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Información Básica de la Instalación</h2>
        <p className="text-sm text-muted-foreground">
          Configura los datos básicos de tu instalación agrícola
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

        {/* Facility Name */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Nombre de la Instalación
            <span className="text-destructive ml-1">*</span>
          </Label>
          <Input
            id="name"
            placeholder="Ej: Finca La Esperanza"
            {...form.register('name')}
            disabled={isSubmitting}
          />
          {form.formState.errors.name && (
            <p className="text-sm text-destructive">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        {/* License Number */}
        <div className="space-y-2">
          <Label htmlFor="licenseNumber">
            Número de Licencia
            <span className="text-destructive ml-1">*</span>
          </Label>
          <Input
            id="licenseNumber"
            placeholder="Ej: LIC-2024-001234"
            {...form.register('licenseNumber')}
            disabled={isSubmitting}
          />
          {form.formState.errors.licenseNumber && (
            <p className="text-sm text-destructive">
              {form.formState.errors.licenseNumber.message}
            </p>
          )}
        </div>

        {/* License Type */}
        <div className="space-y-2">
          <Label htmlFor="licenseType">
            Tipo de Licencia
            <span className="text-destructive ml-1">*</span>
          </Label>
          <Select
            value={form.watch('licenseType')}
            onValueChange={(value) =>
              form.setValue('licenseType', value as FacilityBasicInfoFormValues['licenseType'])
            }
            disabled={isSubmitting}
          >
            <SelectTrigger id="licenseType">
              <SelectValue placeholder="Selecciona el tipo de licencia" />
            </SelectTrigger>
            <SelectContent>
              {LICENSE_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.licenseType && (
            <p className="text-sm text-destructive">
              {form.formState.errors.licenseType.message}
            </p>
          )}
        </div>

        {/* Licensed Area */}
        <div className="space-y-2">
          <Label htmlFor="licensedArea">
            Área Licenciada (m²)
          </Label>
          <Input
            id="licensedArea"
            type="number"
            placeholder="Ej: 5000"
            min="1"
            max="1000000"
            step="1"
            {...form.register('licensedArea', { valueAsNumber: true })}
            disabled={isSubmitting}
          />
          {form.formState.errors.licensedArea && (
            <p className="text-sm text-destructive">
              {form.formState.errors.licensedArea.message}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Área total autorizada para cultivo en metros cuadrados
          </p>
        </div>

        {/* Primary Crops */}
        <CheckboxGroupField
          label="Cultivos Principales"
          options={PRIMARY_CROPS}
          value={form.watch('primaryCrops') as string[]}
          onValueChange={(value) =>
            form.setValue('primaryCrops', value as FacilityBasicInfoFormValues['primaryCrops'])
          }
          error={form.formState.errors.primaryCrops?.message}
          required
          minSelect={1}
          maxSelect={4}
          disabled={isSubmitting}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            'Guardando...'
          ) : (
            <>
              Continuar a Ubicación
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      {/* Footer */}
      <p className="text-xs text-center text-muted-foreground">
        Paso 3 de 4 - Información de la Instalación (1/2)
      </p>
    </div>
  );
}
