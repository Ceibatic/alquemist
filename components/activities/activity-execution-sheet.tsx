'use client';

import { useState, useRef, useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFacility } from '@/components/providers/facility-provider';
import { toast } from 'sonner';
import {
  Loader2,
  ArrowLeft,
  SkipForward,
  CheckCircle2,
} from 'lucide-react';
import {
  useActivityExecution,
  type UseActivityExecutionOptions,
} from '@/hooks/use-activity-execution';
import { ExecutionStepActivity } from './execution-step-activity';
import { ExecutionStepQuality } from './execution-step-quality';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ActivityExecutionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId?: Id<'activity_templates'>;
  scheduledActivityId?: Id<'scheduled_activities'>;
  groupId?: string;
  entityType?: string;
  entityId?: string;
  areaId?: Id<'areas'>;
  batchIds?: string[];
  phase?: string;
  onCompleted?: () => void;
}

// ---------------------------------------------------------------------------
// Mode labels
// ---------------------------------------------------------------------------

const MODE_LABELS: Record<string, string> = {
  template: 'Template',
  scheduled: 'Programada',
  multi_batch: 'Multi-lote',
  adhoc: 'Ad-hoc',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ActivityExecutionSheet({
  open,
  onOpenChange,
  templateId,
  scheduledActivityId,
  groupId,
  entityType,
  entityId,
  areaId,
  batchIds,
  phase,
  onCompleted,
}: ActivityExecutionSheetProps) {
  const { currentCompanyId, currentFacilityId } = useFacility();
  const [step, setStep] = useState<1 | 2>(1);
  const [activityCreated, setActivityCreated] = useState(false);

  // Resolve templateId from scheduled activity if needed
  const scheduledActivity = useQuery(
    api.scheduledActivities.listByEntity,
    // We can't query by ID directly — but the component should work
    // with the hook that handles this internally
    'skip',
  );

  // For scheduled mode, resolve template from scheduled activity
  const scheduledRecord = useQuery(
    api.scheduledActivities.getGroup,
    // If we have scheduledActivityId but no templateId, we need to look up template
    // This is handled by the parent passing templateId from the scheduled activity
    'skip',
  );

  const hookOptions: UseActivityExecutionOptions = {
    templateId,
    scheduledActivityId,
    groupId,
    entityType,
    entityId,
    areaId,
    batchIds,
    phase,
    onCompleted: () => {
      setActivityCreated(true);
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

  // QC support
  const qcTemplateId = template?.quality_check_template_id as
    | Id<'quality_check_templates'>
    | undefined;
  const hasQualityStep = !!qcTemplateId;

  // Product names for resource display
  const resources = form.watch('resources') ?? [];
  const productIds = resources.map((r) => r.productId);
  // We'll build product names from template if available
  const productNames: Record<string, string> =
    template?.resources?.reduce(
      (acc, r) => {
        acc[r.product_id as string] = r.productName ?? (r.product_id as string);
        return acc;
      },
      {} as Record<string, string>,
    ) ?? {};

  // QC submit ref
  const qcSubmitRef = useRef<(() => Promise<void>) | null>(null);

  // Close and reset
  function handleClose() {
    setStep(1);
    setActivityCreated(false);
    form.reset();
    onOpenChange(false);
  }

  // Step 1 → Submit activity, advance to QC or complete
  async function handleStep1() {
    // Trigger form validation
    const valid = await form.trigger();
    if (!valid) return;

    try {
      await handleSubmit();

      if (hasQualityStep) {
        setStep(2);
      } else {
        toast.success('Actividad completada exitosamente');
        onCompleted?.();
        handleClose();
      }
    } catch {
      // Error already handled by hook
    }
  }

  // Step 2 → Submit QC
  async function handleQcComplete() {
    toast.success('Actividad y control de calidad completados');
    onCompleted?.();
    handleClose();
  }

  function handleSkipQc() {
    toast.success('Actividad completada (calidad omitida)');
    onCompleted?.();
    handleClose();
  }

  if (!currentCompanyId) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-[500px]"
      >
        {/* ── Header ─────────────────────────────────────────────── */}
        <SheetHeader className="shrink-0 border-b px-6 py-4">
          <div className="flex items-center gap-2">
            {step === 2 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setStep(1)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <SheetTitle className="flex-1">
              {step === 1 ? 'Ejecutar Actividad' : 'Control de Calidad'}
            </SheetTitle>
            <Badge variant="outline">{MODE_LABELS[mode] ?? mode}</Badge>
            {hasQualityStep && (
              <Badge variant="secondary" className="text-xs">
                Paso {step}/2
              </Badge>
            )}
          </div>
        </SheetHeader>

        {/* ── Body ───────────────────────────────────────────────── */}
        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-4">
          {step === 1 && (
            <ExecutionStepActivity
              form={form}
              mode={mode}
              visibleFields={visibleFields}
              companyId={currentCompanyId}
              facilityId={currentFacilityId ?? undefined}
              productNames={productNames}
            />
          )}

          {step === 2 && qcTemplateId && currentFacilityId && (
            <ExecutionStepQuality
              qcTemplateId={qcTemplateId}
              entityType={entityType ?? 'batch'}
              entityId={entityId ?? (form.watch('batchIds')?.[0] ?? '')}
              performedBy={form.watch('responsibleId') as Id<'users'>}
              companyId={currentCompanyId}
              facilityId={currentFacilityId}
              onCompleted={handleQcComplete}
              onSkip={handleSkipQc}
            />
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────────────── */}
        <SheetFooter className="shrink-0 border-t px-6 py-4">
          {step === 1 && (
            <div className="flex w-full gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleClose}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-amber-500 text-white hover:bg-amber-600"
                onClick={handleStep1}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                )}
                {hasQualityStep ? 'Siguiente: Calidad' : 'Completar Actividad'}
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="flex w-full gap-2">
              <Button
                variant="outline"
                onClick={handleSkipQc}
              >
                <SkipForward className="mr-1 h-4 w-4" />
                Omitir
              </Button>
              <Button
                className="flex-1 bg-amber-500 text-white hover:bg-amber-600"
                onClick={async () => {
                  // Find and trigger the QC submit
                  const qcStep = document.querySelector('[data-qc-submit]') as HTMLElement;
                  if (qcStep) {
                    qcStep.click();
                  } else {
                    handleQcComplete();
                  }
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                )}
                Completar con Calidad
              </Button>
            </div>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
