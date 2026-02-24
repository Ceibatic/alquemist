'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/layout/page-header';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  ClipboardCheck,
  Package,
  ShieldCheck,
  Check,
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import {
  useActivityExecution,
  type UseActivityExecutionOptions,
} from '@/hooks/use-activity-execution';
import { ReportStepExecution } from './report-step-execution';
import { ReportStepResources } from './report-step-resources';
import { ReportStepQuality } from './report-step-quality';
import type { LucideIcon } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReportActivityWizardProps {
  scheduledActivityId: Id<'scheduled_activities'>;
  companyId: Id<'companies'>;
  facilityId?: Id<'facilities'>;
}

interface StepDef {
  key: 'execution' | 'resources' | 'quality';
  label: string;
  icon: LucideIcon;
}

const ALL_STEPS: StepDef[] = [
  { key: 'execution', label: 'Ejecucion', icon: ClipboardCheck },
  { key: 'resources', label: 'Recursos', icon: Package },
  { key: 'quality', label: 'Calidad', icon: ShieldCheck },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ReportActivityWizard({
  scheduledActivityId,
  companyId,
  facilityId,
}: ReportActivityWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [activitySubmitted, setActivitySubmitted] = useState(false);
  const qcSubmitRef = useRef<(() => Promise<void>) | null>(null);

  // ── Data queries ──────────────────────────────────────────────
  const activity = useQuery(api.scheduledActivities.getById, {
    scheduledActivityId,
  });

  const materializedResources = useQuery(
    api.scheduledActivities.getResourcesForActivity,
    { scheduledActivityId },
  );

  // ── Execution hook ────────────────────────────────────────────
  const hookOptions: UseActivityExecutionOptions = {
    companyId,
    facilityId,
    scheduledActivityId,
    onCompleted: () => {
      setActivitySubmitted(true);
    },
  };

  const {
    form,
    mode,
    template,
    visibleFields,
    handleSubmit,
    isSubmitting,
  } = useActivityExecution(hookOptions);

  // ── Dynamic steps ─────────────────────────────────────────────
  const resources = form.watch('resources') ?? [];
  const hasResources = resources.length > 0;
  const qcTemplateId = template?.quality_check_template_id as
    | Id<'quality_check_templates'>
    | undefined;
  const hasQuality = !!qcTemplateId;

  const steps = useMemo(() => {
    return ALL_STEPS.filter((s) => {
      if (s.key === 'resources') return hasResources;
      if (s.key === 'quality') return hasQuality;
      return true;
    });
  }, [hasResources, hasQuality]);

  const currentStepKey = steps[currentStep]?.key ?? 'execution';
  const isLastStep = currentStep === steps.length - 1;

  // Check if the step BEFORE quality is the current step
  const isStepBeforeQuality =
    hasQuality && currentStep === steps.length - 2;

  // ── Product names for resource display ────────────────────────
  const productNames: Record<string, string> = useMemo(() => {
    if (materializedResources && materializedResources.length > 0) {
      return materializedResources.reduce(
        (acc, r) => {
          acc[r.product_id as string] = r.productName ?? (r.product_id as string);
          return acc;
        },
        {} as Record<string, string>,
      );
    }
    if (template?.resources) {
      return template.resources.reduce(
        (acc, r) => {
          acc[r.product_id as string] = r.productName ?? (r.product_id as string);
          return acc;
        },
        {} as Record<string, string>,
      );
    }
    return {};
  }, [materializedResources, template?.resources]);

  // ── Detail URL for navigation ─────────────────────────────────
  const detailUrl = `/production/activities/${scheduledActivityId}`;

  // ── Handlers ──────────────────────────────────────────────────
  const handleNext = useCallback(async () => {
    if (currentStepKey === 'execution') {
      // Validate essential fields before advancing
      const valid = await form.trigger(['activityDate', 'responsibleId']);
      if (!valid) {
        toast.error('Completa los campos requeridos');
        return;
      }
    }

    // If we're on the step right before quality, submit the activity first
    if (isStepBeforeQuality && !activitySubmitted) {
      try {
        await handleSubmit();
        setCurrentStep((s) => s + 1);
      } catch {
        // Error handled by hook
      }
      return;
    }

    // If this is the last step and it's NOT quality, submit and navigate
    if (isLastStep && currentStepKey !== 'quality') {
      try {
        await handleSubmit();
        if (activity?.phase_role === 'exit') {
          toast.success('Fase completada', {
            description: 'La actividad de salida completo la fase y avanzo a la siguiente.',
          });
        } else if (activity?.phase_role === 'entry') {
          toast.success('Fase iniciada', {
            description: 'La actividad de entrada inicio la fase.',
          });
        } else {
          toast.success('Actividad completada exitosamente');
        }
        router.push(detailUrl);
      } catch {
        // Error handled by hook
      }
      return;
    }

    // Otherwise just advance
    setCurrentStep((s) => s + 1);
  }, [currentStepKey, isStepBeforeQuality, isLastStep, activitySubmitted, handleSubmit, form, router, detailUrl]);

  const handleQcComplete = useCallback(async () => {
    try {
      if (qcSubmitRef.current) {
        await qcSubmitRef.current();
      }
      toast.success('Actividad y control de calidad completados');
      router.push(detailUrl);
    } catch {
      toast.error('Error al guardar control de calidad');
    }
  }, [router, detailUrl]);

  const handleSkipQc = useCallback(() => {
    toast.success('Actividad completada (calidad omitida)');
    router.push(detailUrl);
  }, [router, detailUrl]);

  // ── Loading & error states ────────────────────────────────────
  if (activity === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-12 w-64 mx-auto" />
        <Skeleton className="h-96 max-w-3xl mx-auto" />
      </div>
    );
  }

  if (activity === null) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <AlertTriangle className="h-12 w-12 mb-4 opacity-40" />
        <p className="text-lg font-medium">Actividad no encontrada</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push('/production')}
        >
          Volver a Produccion
        </Button>
      </div>
    );
  }

  // ── Button labels ─────────────────────────────────────────────
  let nextLabel = 'Siguiente';
  let nextIcon = <ArrowRight className="ml-1 h-4 w-4" />;
  if (isLastStep && currentStepKey === 'quality') {
    nextLabel = 'Completar con Calidad';
    nextIcon = <Check className="ml-1 h-4 w-4" />;
  } else if (isLastStep) {
    nextLabel = 'Completar Actividad';
    nextIcon = <Check className="ml-1 h-4 w-4" />;
  } else if (isStepBeforeQuality) {
    nextLabel = 'Siguiente: Calidad';
    nextIcon = <ArrowRight className="ml-1 h-4 w-4" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reportar Actividad"
        icon={ClipboardCheck}
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Produccion', href: '/production' },
          {
            label: activity.activityTypeName ?? activity.activity_type,
            href: detailUrl,
          },
          { label: 'Reportar' },
        ]}
      />

      {/* Phase role context */}
      {activity.phase_role === 'exit' && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 text-center">
          <strong>Actividad de salida:</strong> Al completar, la fase actual se cerrara y se avanzara a la siguiente.
        </div>
      )}
      {activity.phase_role === 'entry' && (
        <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800 text-center">
          <strong>Actividad de entrada:</strong> Al completar, la fase se marcara como iniciada.
        </div>
      )}

      {/* Step indicator */}
      {steps.length > 1 && (
        <div className="flex items-center justify-center gap-0">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isActive = idx === currentStep;
            const StepIcon = step.icon;

            return (
              <div key={step.key} className="flex items-center">
                {idx > 0 && (
                  <div
                    className={cn(
                      'h-px w-8',
                      isCompleted ? 'bg-amber-500' : 'bg-border',
                    )}
                  />
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
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <StepIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Step label */}
      <p className="text-center text-sm text-muted-foreground">
        {steps.length > 1
          ? `Paso ${currentStep + 1} de ${steps.length}: ${steps[currentStep].label}`
          : steps[currentStep].label}
      </p>

      {/* Step content */}
      <div className="max-w-3xl mx-auto">
        {currentStepKey === 'execution' && (
          <ReportStepExecution
            form={form}
            visibleFields={visibleFields}
            companyId={companyId}
            activity={activity}
          />
        )}

        {currentStepKey === 'resources' && (
          <ReportStepResources
            form={form}
            productNames={productNames}
          />
        )}

        {currentStepKey === 'quality' && qcTemplateId && facilityId && (
          <ReportStepQuality
            qcTemplateId={qcTemplateId}
            entityType={activity.entity_type ?? 'batch'}
            entityId={activity.entity_id ?? (form.watch('batchIds')?.[0] ?? '')}
            performedBy={form.watch('responsibleId') as Id<'users'>}
            companyId={companyId}
            facilityId={facilityId}
            onRegisterSubmit={(fn) => {
              qcSubmitRef.current = fn;
            }}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between max-w-3xl mx-auto pt-4 border-t">
        <Button
          variant="outline"
          onClick={() => {
            if (currentStep === 0) {
              router.push(detailUrl);
            } else {
              setCurrentStep((s) => s - 1);
            }
          }}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          {currentStep === 0 ? 'Cancelar' : 'Anterior'}
        </Button>

        <div className="flex items-center gap-2">
          {currentStepKey === 'quality' && (
            <Button variant="outline" onClick={handleSkipQc}>
              Omitir Calidad
            </Button>
          )}
          <Button
            className="bg-amber-500 text-white hover:bg-amber-600"
            onClick={
              currentStepKey === 'quality' ? handleQcComplete : handleNext
            }
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
            {nextLabel}
            {!isSubmitting && nextIcon}
          </Button>
        </div>
      </div>
    </div>
  );
}
