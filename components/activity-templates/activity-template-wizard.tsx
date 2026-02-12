'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useFacility } from '@/components/providers/facility-provider';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Loader2,
  FileText,
  ListChecks,
  Package,
  Settings,
  Check,
} from 'lucide-react';
import { WizardStepBasic, type WizardBasicData } from './wizard-step-basic';
import { WizardStepFields } from './wizard-step-fields';

const STEPS = [
  { key: 'basic', label: 'Tipo y basico', icon: FileText },
  { key: 'fields', label: 'Campos del formulario', icon: ListChecks },
  { key: 'resources', label: 'Recursos', icon: Package },
  { key: 'config', label: 'Configuracion', icon: Settings },
] as const;

interface ActivityTemplateWizardProps {
  templateId?: Id<'activity_templates'>;
  isNew: boolean;
}

export function ActivityTemplateWizard({ templateId, isNew }: ActivityTemplateWizardProps) {
  const router = useRouter();
  const { currentCompanyId } = useFacility();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Step 1: Basic data
  const [basicData, setBasicData] = useState<WizardBasicData>({
    name: '',
    code: '',
    description: '',
    typeId: '',
    defaultPriority: 'routine',
    applicablePhases: [],
    phaseDayStart: '',
    phaseDayEnd: '',
  });

  // Step 2: Form fields
  const [formFields, setFormFields] = useState<string[]>([]);

  // Query existing template for edit mode
  const template = useQuery(
    api.activityTemplates.getById,
    templateId ? { templateId } : 'skip' as any
  );

  const createMutation = useMutation(api.activityTemplates.create);
  const updateMutation = useMutation(api.activityTemplates.update);

  // Load template data in edit mode
  useEffect(() => {
    if (template && !loaded) {
      setBasicData({
        name: template.name,
        code: template.code ?? '',
        description: template.description ?? '',
        typeId: template.type_id,
        defaultPriority: template.default_priority ?? 'routine',
        applicablePhases: template.applicable_phases,
        phaseDayStart: template.phase_day_start?.toString() ?? '',
        phaseDayEnd: template.phase_day_end?.toString() ?? '',
      });
      setFormFields(template.form_fields ?? []);
      setLoaded(true);
    }
  }, [template, loaded]);

  // Validation per step
  const validateStep = useCallback((step: number): string | null => {
    switch (step) {
      case 0: // Basic
        if (!basicData.name.trim()) return 'El nombre es requerido';
        if (!basicData.typeId) return 'Selecciona un tipo de actividad';
        if (basicData.applicablePhases.length === 0) return 'Selecciona al menos una fase';
        return null;
      case 1: // Fields — no required selections
        return null;
      case 2: // Resources — placeholder
        return null;
      case 3: // Config — placeholder
        return null;
      default:
        return null;
    }
  }, [basicData]);

  const handleNext = () => {
    const error = validateStep(currentStep);
    if (error) {
      toast.error(error);
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSave = async () => {
    // Validate all steps
    for (let i = 0; i <= currentStep; i++) {
      const error = validateStep(i);
      if (error) {
        toast.error(error);
        setCurrentStep(i);
        return;
      }
    }

    if (!currentCompanyId) return;

    try {
      setIsSaving(true);

      const baseArgs = {
        name: basicData.name.trim(),
        code: basicData.code.trim() || undefined,
        description: basicData.description.trim() || undefined,
        typeId: basicData.typeId as Id<'activity_types'>,
        applicablePhases: basicData.applicablePhases,
        phaseDayStart: basicData.phaseDayStart ? Number(basicData.phaseDayStart) : undefined,
        phaseDayEnd: basicData.phaseDayEnd ? Number(basicData.phaseDayEnd) : undefined,
        defaultPriority: basicData.defaultPriority,
        formFields: formFields.length > 0 ? formFields : undefined,
        // Defaults for fields not yet in wizard steps 3-4
        frequencyType: template?.frequency_type ?? 'once',
        requiresVerification: template?.requires_verification ?? false,
      };

      if (isNew) {
        const newId = await createMutation({
          ...baseArgs,
          companyId: currentCompanyId,
        });
        toast.success('Template creado');
        router.push(`/activity-templates/${newId}`);
      } else if (templateId) {
        await updateMutation({
          templateId,
          ...baseArgs,
        });
        toast.success('Template actualizado');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <nav aria-label="Progreso del wizard">
        <ol className="flex items-center gap-2">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            const isAccessible = index <= currentStep;

            return (
              <li key={step.key} className="flex items-center gap-2 flex-1">
                <button
                  type="button"
                  onClick={() => {
                    if (isAccessible) {
                      const error = validateStep(currentStep);
                      if (error && index > currentStep) {
                        toast.error(error);
                        return;
                      }
                      setCurrentStep(index);
                    }
                  }}
                  disabled={!isAccessible}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full ${
                    isActive
                      ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100'
                      : isCompleted
                        ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
                        : 'text-muted-foreground'
                  } ${isAccessible ? 'cursor-pointer hover:bg-muted' : 'cursor-not-allowed opacity-50'}`}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold flex-shrink-0 ${
                      isActive
                        ? 'bg-amber-500 text-white'
                        : isCompleted
                          ? 'bg-green-500 text-white'
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isCompleted ? <Check className="h-3.5 w-3.5" /> : index + 1}
                  </span>
                  <span className="hidden md:inline truncate">{step.label}</span>
                </button>
                {index < STEPS.length - 1 && (
                  <div
                    className={`h-px flex-1 min-w-[8px] ${
                      isCompleted ? 'bg-green-300' : 'bg-border'
                    }`}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Step content */}
      <Card>
        <CardContent className="pt-6">
          {currentStep === 0 && (
            <WizardStepBasic
              data={basicData}
              onChange={setBasicData}
              isNew={isNew}
            />
          )}

          {currentStep === 1 && (
            <WizardStepFields
              selectedFields={formFields}
              onChange={setFormFields}
            />
          )}

          {currentStep === 2 && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mb-4" />
              <p className="text-sm">
                Seleccion de recursos — disponible proximamente
              </p>
              <p className="text-xs mt-1">
                Puedes guardar el template ahora y agregar recursos desde el detalle
              </p>
            </div>
          )}

          {currentStep === 3 && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Settings className="h-12 w-12 mb-4" />
              <p className="text-sm">
                Configuracion final — disponible proximamente
              </p>
              <p className="text-xs mt-1">
                Puedes guardar el template ahora y configurar detalles desde el detalle
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Anterior
        </Button>

        <div className="flex items-center gap-2">
          {/* Save at any step */}
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-1 h-4 w-4" />
            )}
            Guardar
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button
              onClick={handleNext}
              className="bg-amber-500 hover:bg-amber-600"
            >
              Siguiente
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {isSaving ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-1 h-4 w-4" />
              )}
              Guardar Template
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
