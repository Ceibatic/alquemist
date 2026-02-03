'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import {
  companySetupSchema,
  type CompanySetupFormValues,
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
import { CascadingSelect } from '@/components/shared/cascading-select';
import { ProgressIndicator } from '@/components/shared/progress-indicator';

const BUSINESS_TYPES = [
  { value: 'SAS', label: 'SAS - Sociedad por Acciones Simplificada' },
  { value: 'SA', label: 'SA - Sociedad Anónima' },
  { value: 'LTDA', label: 'LTDA - Sociedad Limitada' },
  { value: 'EU', label: 'EU - Empresa Unipersonal' },
  { value: 'PersonaNatural', label: 'Persona Natural' },
];

const INDUSTRIES = [
  { value: 'Cannabis', label: 'Cannabis' },
  { value: 'Cafe', label: 'Café' },
  { value: 'Cacao', label: 'Cacao' },
  { value: 'Flores', label: 'Flores' },
  { value: 'Mixto', label: 'Mixto' },
];

const BUSINESS_ENTITY_TYPE_MAP: Record<string, string> = {
  SAS: 'S.A.S',
  SA: 'S.A.',
  LTDA: 'Ltda',
  EU: 'E.U.',
  PersonaNatural: 'Persona Natural',
};

const COMPANY_TYPE_MAP: Record<string, string> = {
  Cannabis: 'cannabis',
  Cafe: 'coffee',
  Cacao: 'cocoa',
  Flores: 'flowers',
  Mixto: 'mixed',
};

export default function CompanySetupPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Use Convex Auth to get the authenticated user's onboarding status
  const onboardingStatus = useQuery(api.users.getOnboardingStatus);
  const registerCompany = useMutation(api.registration.registerCompanyStep2);

  const form = useForm<CompanySetupFormValues>({
    resolver: zodResolver(companySetupSchema),
    defaultValues: {
      name: '',
      businessType: undefined,
      industry: undefined,
      departmentCode: '',
      municipalityCode: '',
    },
  });

  // Memoized callbacks to prevent infinite re-renders in CascadingSelect
  const handleDepartmentChange = useCallback(
    (value: string) => {
      form.setValue('departmentCode', value, { shouldValidate: true });
    },
    [form]
  );

  const handleMunicipalityChange = useCallback(
    (value: string) => {
      form.setValue('municipalityCode', value, { shouldValidate: true });
    },
    [form]
  );

  const onSubmit = async (data: CompanySetupFormValues) => {
    setIsSubmitting(true);
    setGlobalError(null);

    try {
      const mappedBusinessEntityType =
        BUSINESS_ENTITY_TYPE_MAP[data.businessType] || data.businessType;
      const mappedCompanyType =
        COMPANY_TYPE_MAP[data.industry] || data.industry.toLowerCase();

      const result = await registerCompany({
        companyName: data.name,
        businessEntityType: mappedBusinessEntityType,
        companyType: mappedCompanyType,
        country: 'CO',
        departmentCode: data.departmentCode,
        municipalityCode: data.municipalityCode,
      });

      if (!result.success) {
        setGlobalError('Error al crear la empresa');
        return;
      }

      // Store company ID in sessionStorage for facility setup
      if (result.companyId) {
        sessionStorage.setItem('companyId', result.companyId);
      }

      toast.success('Empresa creada correctamente');
      router.push('/facility-basic');
    } catch (err: any) {
      setGlobalError(err?.message || 'Error inesperado. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Redirect based on onboarding status (must be in useEffect, not during render)
  useEffect(() => {
    if (onboardingStatus === null) {
      router.push('/login');
    } else if (onboardingStatus?.hasCompany) {
      if (onboardingStatus.onboardingCompleted) {
        router.push('/dashboard');
      } else {
        router.push('/facility-basic');
      }
    }
  }, [onboardingStatus, router]);

  // Show loading while waiting for auth or redirecting
  if (onboardingStatus === undefined || onboardingStatus === null || onboardingStatus.hasCompany) {
    return (
      <div className="text-center p-8">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-sm text-muted-foreground mt-2">
          {onboardingStatus === undefined ? '' : 'Redirigiendo...'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-2">
          <Building2 className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Crea tu Empresa</h2>
        <p className="text-sm text-muted-foreground">
          Configura los datos de tu empresa para continuar
        </p>
        <ProgressIndicator currentStep={1} totalSteps={2} />
      </div>

      {/* Form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* Global Error */}
        {globalError && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
            {globalError}
          </div>
        )}

        {/* Company Name */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Nombre de la Empresa
            <span className="text-destructive ml-1">*</span>
          </Label>
          <Input
            id="name"
            placeholder="Ej: Agroindustrias del Cauca S.A.S"
            {...form.register('name')}
            disabled={isSubmitting}
          />
          {form.formState.errors.name && (
            <p className="text-sm text-destructive">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        {/* Business Type */}
        <div className="space-y-2">
          <Label htmlFor="businessType">
            Tipo de Negocio
            <span className="text-destructive ml-1">*</span>
          </Label>
          <Select
            value={form.watch('businessType') ?? ''}
            onValueChange={(value) =>
              form.setValue('businessType', value as CompanySetupFormValues['businessType'])
            }
            disabled={isSubmitting}
          >
            <SelectTrigger id="businessType">
              <SelectValue placeholder="Selecciona el tipo de negocio" />
            </SelectTrigger>
            <SelectContent>
              {BUSINESS_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.businessType && (
            <p className="text-sm text-destructive">
              {form.formState.errors.businessType.message}
            </p>
          )}
        </div>

        {/* Industry */}
        <div className="space-y-2">
          <Label htmlFor="industry">
            Industria Principal
            <span className="text-destructive ml-1">*</span>
          </Label>
          <Select
            value={form.watch('industry') ?? ''}
            onValueChange={(value) =>
              form.setValue('industry', value as CompanySetupFormValues['industry'])
            }
            disabled={isSubmitting}
          >
            <SelectTrigger id="industry">
              <SelectValue placeholder="Selecciona la industria" />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map((ind) => (
                <SelectItem key={ind.value} value={ind.value}>
                  {ind.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.industry && (
            <p className="text-sm text-destructive">
              {form.formState.errors.industry.message}
            </p>
          )}
        </div>

        {/* Location (Department & Municipality) */}
        <CascadingSelect
          departmentValue={form.watch('departmentCode')}
          municipalityValue={form.watch('municipalityCode')}
          onDepartmentChange={handleDepartmentChange}
          onMunicipalityChange={handleMunicipalityChange}
          departmentError={form.formState.errors.departmentCode?.message}
          municipalityError={form.formState.errors.municipalityCode?.message}
          departmentLabel="Departamento"
          municipalityLabel="Municipio"
          required
          disabled={isSubmitting}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-amber-500 hover:bg-amber-600 text-white"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            'Creando empresa...'
          ) : (
            'Crear Empresa'
          )}
        </Button>
      </form>

      {/* Footer */}
      <p className="text-xs text-center text-muted-foreground">
        Paso 1 de 2 - Crea tu Empresa
      </p>
    </div>
  );
}
