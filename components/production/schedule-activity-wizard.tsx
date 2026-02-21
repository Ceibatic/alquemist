'use client';

import { useState, useCallback } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Factory,
  MapPin,
  Layers,
  FileText,
  ClipboardCheck,
  Check,
  ArrowLeft,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { WizardStepSelectArea } from './wizard-step-select-area';
import { WizardStepSelectBatches } from './wizard-step-select-batches';
import { WizardStepSelectTemplate } from './wizard-step-select-template';
import { WizardStepReview } from './wizard-step-review';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ResourceItem {
  productId: Id<'products'>;
  templateResourceId?: Id<'activity_template_resources'>;
  productName: string;
  productCode: string | null;
  quantity: number;
  unitId?: Id<'units_of_measure'>;
  unitSymbol?: string;
  quantityBasis: string;
  direction: string;
  applicationRate?: string;
  applicationMethod?: string;
  isRequired: boolean;
  notes?: string;
}

export interface WizardFormData {
  // Step 1
  areaId: Id<'areas'> | null;
  areaName: string;
  // Step 2
  batchIds: Id<'batches'>[];
  // Step 3
  typeId: Id<'activity_types'> | null;
  templateId: Id<'activity_templates'> | null;
  templateName: string;
  // Step 4
  scheduledDate: Date | null;
  assignedTo: Id<'users'> | null;
  priority: string;
  estimatedDurationMinutes: number | null;
  instructions: string;
  resources: ResourceItem[];
  qualityCheckTemplateId: Id<'quality_check_templates'> | null;
}

const INITIAL_FORM_DATA: WizardFormData = {
  areaId: null,
  areaName: '',
  batchIds: [],
  typeId: null,
  templateId: null,
  templateName: '',
  scheduledDate: null,
  assignedTo: null,
  priority: 'routine',
  estimatedDurationMinutes: null,
  instructions: '',
  resources: [],
  qualityCheckTemplateId: null,
};

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------

const STEPS = [
  { key: 'area', label: 'Area', icon: MapPin },
  { key: 'batches', label: 'Lotes', icon: Layers },
  { key: 'template', label: 'Template', icon: FileText },
  { key: 'review', label: 'Revisar', icon: ClipboardCheck },
] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ScheduleActivityWizardProps {
  companyId: Id<'companies'>;
  facilityId: Id<'facilities'> | null;
}

export function ScheduleActivityWizard({ companyId, facilityId }: ScheduleActivityWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<WizardFormData>(INITIAL_FORM_DATA);
  const [isSaving, setIsSaving] = useState(false);

  const createManual = useMutation(api.scheduledActivities.createManual);

  const updateForm = useCallback((partial: Partial<WizardFormData>) => {
    setFormData((prev) => ({ ...prev, ...partial }));
  }, []);

  const canAdvance = (): boolean => {
    switch (currentStep) {
      case 0: return formData.areaId !== null;
      case 1: return formData.batchIds.length > 0;
      case 2: return formData.typeId !== null; // template is optional
      case 3: return formData.scheduledDate !== null;
      default: return false;
    }
  };

  const handleSave = async () => {
    if (!formData.scheduledDate || !formData.typeId) return;

    setIsSaving(true);
    try {
      await createManual({
        companyId,
        typeId: formData.typeId,
        templateId: formData.templateId ?? undefined,
        batchIds: formData.batchIds,
        scheduledDate: formData.scheduledDate.getTime(),
        estimatedDurationMinutes: formData.estimatedDurationMinutes ?? undefined,
        assignedTo: formData.assignedTo ?? undefined,
        instructions: formData.instructions || undefined,
        priority: formData.priority !== 'routine' ? formData.priority : undefined,
        resources: formData.resources.length > 0
          ? formData.resources.map((r) => ({
              productId: r.productId,
              templateResourceId: r.templateResourceId,
              quantity: r.quantity,
              unitId: r.unitId,
              quantityBasis: r.quantityBasis,
              direction: r.direction,
              applicationRate: r.applicationRate,
              applicationMethod: r.applicationMethod,
              isRequired: r.isRequired,
              notes: r.notes,
            }))
          : undefined,
      });
      toast.success('Actividad programada exitosamente');
      router.push('/production');
    } catch (e: any) {
      toast.error(e.message ?? 'Error al programar actividad');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nueva Actividad"
        icon={Factory}
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Produccion', href: '/production' },
          { label: 'Nueva Actividad' },
        ]}
      />

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-0">
        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isActive = idx === currentStep;
          const StepIcon = step.icon;

          return (
            <div key={step.key} className="flex items-center">
              {idx > 0 && (
                <div className={cn('h-px w-8', isCompleted ? 'bg-amber-500' : 'bg-border')} />
              )}
              <button
                onClick={() => idx < currentStep && setCurrentStep(idx)}
                disabled={idx > currentStep}
                className={cn(
                  'flex items-center justify-center h-8 w-8 rounded-full text-xs font-medium transition-colors',
                  isActive && 'bg-amber-500 text-white',
                  isCompleted && 'bg-amber-100 text-amber-800',
                  !isActive && !isCompleted && 'bg-muted text-muted-foreground',
                  idx < currentStep && 'cursor-pointer',
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : <StepIcon className="h-4 w-4" />}
              </button>
            </div>
          );
        })}
      </div>

      {/* Step label */}
      <p className="text-center text-sm text-muted-foreground">
        Paso {currentStep + 1} de {STEPS.length}: {STEPS[currentStep].label}
      </p>

      {/* Step content */}
      <div className="max-w-3xl mx-auto">
        {currentStep === 0 && facilityId && (
          <WizardStepSelectArea
            facilityId={facilityId}
            selectedAreaId={formData.areaId}
            onSelect={(areaId, areaName) => updateForm({ areaId, areaName, batchIds: [] })}
          />
        )}
        {currentStep === 0 && !facilityId && (
          <div className="py-8 text-center text-muted-foreground">
            Selecciona una instalacion para ver las areas disponibles.
          </div>
        )}

        {currentStep === 1 && formData.areaId && (
          <WizardStepSelectBatches
            companyId={companyId}
            areaId={formData.areaId}
            selectedBatchIds={formData.batchIds}
            onSelectionChange={(batchIds) => updateForm({ batchIds })}
          />
        )}

        {currentStep === 2 && (
          <WizardStepSelectTemplate
            companyId={companyId}
            selectedTypeId={formData.typeId}
            selectedTemplateId={formData.templateId}
            onTypeSelect={(typeId) => updateForm({ typeId, templateId: null, templateName: '' })}
            onTemplateSelect={(templateId, templateName, resources, instructions, duration, qcTemplateId) =>
              updateForm({
                templateId,
                templateName,
                resources,
                instructions: instructions ?? formData.instructions,
                estimatedDurationMinutes: duration ?? formData.estimatedDurationMinutes,
                qualityCheckTemplateId: qcTemplateId ?? formData.qualityCheckTemplateId,
              })
            }
          />
        )}

        {currentStep === 3 && (
          <WizardStepReview
            companyId={companyId}
            formData={formData}
            onUpdate={updateForm}
          />
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between max-w-3xl mx-auto">
        <Button
          variant="outline"
          onClick={() => currentStep === 0 ? router.push('/production') : setCurrentStep(currentStep - 1)}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          {currentStep === 0 ? 'Cancelar' : 'Anterior'}
        </Button>

        {currentStep < STEPS.length - 1 ? (
          <Button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={!canAdvance()}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            Siguiente
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button
            onClick={handleSave}
            disabled={isSaving || !canAdvance()}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Programando...
              </>
            ) : (
              'Programar Actividad'
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
