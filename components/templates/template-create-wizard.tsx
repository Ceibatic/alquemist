'use client';

import { useState, useCallback } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useFacility } from '@/components/providers/facility-provider';
import { WizardStepBasic } from './wizard-step-basic';
import { WizardStepPhases } from './wizard-step-phases';
import {
  FileText,
  Layers,
  Check,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Save,
  LayoutTemplate,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types (exported so step components can import them)
// ---------------------------------------------------------------------------

export interface PhaseItem {
  id: string;
  name: string;
  durationDays: number;
  areaType: string;
  description: string;
}

export interface WizardFormData {
  name: string;
  description: string;
  cropTypeId: string;
  cultivarId: string;
  templateCategory: string;
  productionMethod: string;
  sourceType: string;
  phases: PhaseItem[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STEPS = [
  { key: 'basic', label: 'Datos basicos', icon: FileText },
  { key: 'phases', label: 'Fases', icon: Layers },
] as const;

const INITIAL_FORM_DATA: WizardFormData = {
  name: '',
  description: '',
  cropTypeId: '',
  cultivarId: '',
  templateCategory: 'seed_to_harvest',
  productionMethod: 'indoor',
  sourceType: 'seed',
  phases: [],
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TemplateCreateWizard() {
  const router = useRouter();
  const { currentCompanyId, isLoading: facilityLoading } = useFacility();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<WizardFormData>(INITIAL_FORM_DATA);
  const [isSaving, setIsSaving] = useState(false);

  const createTemplate = useMutation(api.productionTemplates.create);
  const createPhase = useMutation(api.templatePhases.create);

  const updateField = useCallback(
    <K extends keyof WizardFormData>(field: K, value: WizardFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handlePhasesFromCropType = useCallback((phases: PhaseItem[]) => {
    setFormData((prev) => ({ ...prev, phases }));
  }, []);

  const handlePhasesChange = useCallback((phases: PhaseItem[]) => {
    setFormData((prev) => ({ ...prev, phases }));
  }, []);

  // Validation for step 1
  const validateStep0 = (): string | null => {
    if (!formData.name.trim()) return 'El nombre del template es requerido';
    if (!formData.cropTypeId) return 'Selecciona un tipo de cultivo';
    return null;
  };

  const goNext = () => {
    const error = validateStep0();
    if (error) {
      toast.error(error);
      return;
    }
    setCurrentStep(1);
  };

  const goBack = () => {
    setCurrentStep(0);
  };

  const handleSave = async () => {
    if (!currentCompanyId) {
      toast.error('No se encontro la empresa activa');
      return;
    }

    const stepError = validateStep0();
    if (stepError) {
      toast.error(stepError);
      setCurrentStep(0);
      return;
    }

    try {
      setIsSaving(true);

      // 1. Create the template
      const templateId = await createTemplate({
        companyId: currentCompanyId,
        name: formData.name.trim(),
        cropTypeId: formData.cropTypeId as Id<'crop_types'>,
        cultivarId:
          formData.cultivarId && formData.cultivarId !== 'none'
            ? (formData.cultivarId as Id<'cultivars'>)
            : undefined,
        templateCategory: formData.templateCategory,
        productionMethod: formData.productionMethod,
        sourceType: formData.sourceType,
        description: formData.description.trim() || undefined,
        defaultBatchSize: 50,
        enableIndividualTracking: false,
      });

      // 2. Create phases in order
      for (const phase of formData.phases) {
        await createPhase({
          templateId,
          phaseName: phase.name,
          estimatedDurationDays: phase.durationDays,
          areaType: phase.areaType,
          description: phase.description.trim() || undefined,
        });
      }

      toast.success('Template creado correctamente');
      router.push(`/templates/${templateId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al crear el template');
    } finally {
      setIsSaving(false);
    }
  };

  const goToStep = (idx: number) => {
    if (idx < currentStep) {
      setCurrentStep(idx);
    }
  };

  if (facilityLoading || !currentCompanyId) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Nuevo Template de Produccion"
        icon={LayoutTemplate}
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Templates', href: '/templates' },
          { label: 'Nuevo Template' },
        ]}
      />

      {/* Step indicator */}
      <nav className="flex items-center justify-center gap-2">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isActive = idx === currentStep;
          const isCompleted = idx < currentStep;
          return (
            <div key={step.key} className="flex items-center">
              {idx > 0 && (
                <div
                  className={cn(
                    'h-px w-8 mx-1',
                    idx <= currentStep ? 'bg-amber-500' : 'bg-gray-200'
                  )}
                />
              )}
              <button
                type="button"
                onClick={() => goToStep(idx)}
                className={cn(
                  'flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive && 'bg-amber-500 text-white',
                  isCompleted && 'bg-amber-100 text-amber-800 cursor-pointer',
                  !isActive && !isCompleted && 'bg-gray-100 text-gray-500 cursor-default'
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">{step.label}</span>
                <span className="sm:hidden">{idx + 1}</span>
              </button>
            </div>
          );
        })}
      </nav>

      {/* Step content */}
      <div className="min-h-[400px]">
        {currentStep === 0 && (
          <WizardStepBasic
            formData={formData}
            updateField={updateField}
            onPhasesFromCropType={handlePhasesFromCropType}
            companyId={currentCompanyId}
          />
        )}
        {currentStep === 1 && (
          <WizardStepPhases
            phases={formData.phases}
            onPhasesChange={handlePhasesChange}
          />
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between border-t pt-4">
        {currentStep === 0 ? (
          <Button variant="outline" onClick={() => router.push('/templates')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
        ) : (
          <Button variant="outline" onClick={goBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Atras
          </Button>
        )}

        {currentStep === 0 ? (
          <Button onClick={goNext} className="bg-amber-500 hover:bg-amber-600 text-white">
            Siguiente
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isSaving ? 'Creando...' : 'Crear Template'}
          </Button>
        )}
      </div>
    </div>
  );
}
