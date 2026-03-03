'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
  PackagePlus,
  ArrowDownToLine,
  Eye,
} from 'lucide-react';
import {
  useActivityExecution,
} from '@/hooks/use-activity-execution';
import { ReportStepExecution } from './report-step-execution';
import { ReportStepResources } from './report-step-resources';
import { ReportStepQuality } from './report-step-quality';
import { ReportStepObservations, ObservationEntry } from './report-step-observations';
import { ReportStepEntryMaterial } from './report-step-entry-material';
import {
  TransformationOutputsForm,
  type TransformationOutput,
} from './transformation-outputs-form';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GlobalReportWizardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  scheduledActivityId?: string;
  adhocTemplateId?: string;
  batchIds?: string[];
  areaId?: string;
  facilityId?: string;
}

type StepKey = 'execution' | 'entry' | 'transformation' | 'resources' | 'observations' | 'quality';

interface StepDef {
  key: StepKey;
  label: string;
  icon: any;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function GlobalReportWizardDialog({
  isOpen,
  onClose,
  scheduledActivityId,
  adhocTemplateId,
  batchIds: propBatchIds,
  areaId: propAreaId,
  facilityId: propFacilityId,
}: GlobalReportWizardDialogProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const qcSubmitRef = useRef<(() => Promise<void>) | null>(null);

  // ── Form States ──────────────────────────────────────────────────────────
  const [transformationOutputs, setTransformationOutputs] = useState<TransformationOutput[]>([]);
  const [observations, setObservations] = useState<ObservationEntry[]>([]);
  const [entryMaterial, setEntryMaterial] = useState<{ itemId: string; quantity: number } | null>(null);

  // ── Queries ─────────────────────────────────────────────────────────────
  const currentUser = useQuery(api.users.getCurrentUser, {});
  const companyId = currentUser?.companyId;

  const activity = useQuery(
    api.scheduledActivities.getById,
    scheduledActivityId ? { scheduledActivityId: scheduledActivityId as Id<'scheduled_activities'> } : 'skip'
  );

  const template = useQuery(
    api.activityTemplates.getById,
    adhocTemplateId ? { templateId: adhocTemplateId as Id<'activity_templates'> } : 'skip'
  );

  const materializedResources = useQuery(
    api.scheduledActivities.getResourcesForActivity,
    scheduledActivityId ? { scheduledActivityId: scheduledActivityId as Id<'scheduled_activities'> } : 'skip'
  );

  // ── Execution hook ──────────────────────────────────────────────────────
  const {
    form,
    visibleFields,
    handleSubmit: handleHookSubmit,
  } = useActivityExecution({
    companyId,
    facilityId: propFacilityId as Id<'facilities'>,
    scheduledActivityId: scheduledActivityId as Id<'scheduled_activities'>,
    templateId: adhocTemplateId as Id<'activity_templates'>,
    batchIds: propBatchIds,
    areaId: propAreaId as Id<'areas'>,
  });

  // ── Dynamic Steps Calculation ───────────────────────────────────────────
  const activityType = useMemo(() => {
    return activity?.activity_type;
  }, [activity, template]);

  const triggersTransformation = useMemo(() => {
    return activity?.triggersTransformation ?? false;
  }, [activity, template]);

  const steps = useMemo(() => {
    const list: StepDef[] = [
      { key: 'execution', label: 'Ejecución', icon: ClipboardCheck },
    ];

    if (activityType === 'ENTRY-MATERIAL') {
      list.push({ key: 'entry', label: 'Material Inicial', icon: ArrowDownToLine });
    }

    if (triggersTransformation) {
      list.push({ key: 'transformation', label: 'Material Final', icon: PackagePlus });
    }

    // Always show resources and observations
    list.push({ key: 'resources', label: 'Recursos', icon: Package });
    list.push({ key: 'observations', label: 'Monitoreo', icon: Eye });

    const qcTemplateId = (activity as any)?.quality_check_template_id ?? template?.quality_check_template_id;
    if (qcTemplateId) {
      list.push({ key: 'quality', label: 'Calidad', icon: ShieldCheck });
    }

    return list;
  }, [activityType, triggersTransformation, activity, template]);

  const currentStepKey = steps[currentStep]?.key ?? 'execution';
  const isLastStep = currentStep === steps.length - 1;

  // ── Handlers ────────────────────────────────────────────────────────────
  const createObservationMutation = useMutation(api.activityObservations.create);

  const handleFinish = async () => {
    if (!companyId) return;
    
    setIsSubmitting(true);
    try {
      // 1. Submit the main activity through the hook logic
      // Note: we need to manually inject transformation outputs and entry material into the form resources
      const resources = form.getValues('resources') ?? [];
      const finalResources = [...resources];

      if (entryMaterial) {
        finalResources.push({
          productId: (activity as any)?.initialProductId ?? (template as any)?.initialProductId, // Needs resolution
          direction: 'consumed',
          quantity: entryMaterial.quantity,
          quantityUnit: 'units', // Generic
          inventoryItemId: entryMaterial.itemId,
        } as any);
      }

      // Inject transformation outputs as produced
      transformationOutputs.forEach(o => {
        if (o.productRole !== 'waste') {
          finalResources.push({
            productId: o.productId as Id<'products'>,
            direction: 'produced',
            quantity: o.actualQuantity,
            quantityUnit: o.unit,
          } as any);
        }
      });

      form.setValue('resources', finalResources);

      // Call handleHookSubmit which uses executeActivity
      const result = await handleHookSubmit();
      const activityId = (result as any)?.activityId;

      // 2. Submit observations if any
      if (activityId && observations.length > 0) {
        for (const obs of observations) {
          await createObservationMutation({
            activityId,
            observationType: obs.type,
            severity: obs.severity,
            organismId: obs.organismId as Id<'pest_diseases'>,
            organismName: obs.organismName,
            incidenceCount: obs.incidenceCount,
            affectedAreaPct: obs.severityPct,
            plantPart: obs.plantPart,
            description: obs.description,
          });
        }
      }

      // 3. Submit Quality Check if any
      if (qcSubmitRef.current) {
        await qcSubmitRef.current();
      }

      toast.success('Reporte guardado exitosamente');
      onClose();
      setCurrentStep(0);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar reporte');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (isLastStep) {
      handleFinish();
    } else {
      setCurrentStep(s => s + 1);
    }
  };

  // ── Loading state ───────────────────────────────────────────────────────
  if (isOpen && scheduledActivityId && !activity) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent><div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div></DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl overflow-hidden p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-emerald-500" />
            Reportar Actividad
          </DialogTitle>
        </DialogHeader>

        {/* Dynamic Stepper */}
        <div className="flex flex-col">
          <div className="flex border-b bg-muted/30 px-6 py-2 overflow-x-auto no-scrollbar">
            {steps.map((step, idx) => (
              <div key={step.key} className="flex items-center shrink-0">
                {idx > 0 && <div className="mx-2 h-px w-4 bg-border" />}
                <button
                  onClick={() => idx < currentStep && setCurrentStep(idx)}
                  disabled={idx > currentStep}
                  className={cn(
                    'flex items-center gap-1.5 text-xs font-medium transition-colors',
                    currentStep === idx ? 'text-emerald-600' : 'text-muted-foreground'
                  )}
                >
                  <step.icon className="h-3.5 w-3.5" />
                  {step.label}
                </button>
              </div>
            ))}
          </div>

          <div className="p-6 min-h-[400px] overflow-y-auto max-h-[60vh]">
            {currentStepKey === 'execution' && (
              <ReportStepExecution
                form={form}
                visibleFields={visibleFields}
                companyId={companyId as Id<'companies'>}
                activity={activity as any || { activity_type: 'Ad-hoc' }}
              />
            )}

            {currentStepKey === 'entry' && companyId && (
              <ReportStepEntryMaterial
                companyId={companyId}
                cultivarId={(activity as any)?.batchCultivarId}
                selectedItemId={entryMaterial?.itemId}
                initialQuantity={(activity as any)?.batchPlannedQuantity}
                onItemSelect={(itemId, quantity) => setEntryMaterial({ itemId, quantity })}
              />
            )}

            {currentStepKey === 'transformation' && (
              <TransformationOutputsForm
                cultivarId={(activity as any)?.batchCultivarId}
                phaseName={(activity as any)?.batchPhase}
                sourceQuantity={(activity as any)?.batchCurrentQuantity ?? 0}
                sourceUnit={(activity as any)?.batchUnit ?? 'plantas'}
                onChange={setTransformationOutputs}
              />
            )}

            {currentStepKey === 'resources' && (
              <ReportStepResources
                form={form}
                productNames={{}} // Enriched via hook normally
              />
            )}

            {currentStepKey === 'observations' && (
              <ReportStepObservations
                observations={observations}
                onChange={setObservations}
              />
            )}

            {currentStepKey === 'quality' && companyId && propFacilityId && (
              <ReportStepQuality
                qcTemplateId={(activity as any)?.quality_check_template_id as Id<'quality_check_templates'>}
                entityType="batch"
                entityId={(activity as any)?.entity_id}
                performedBy={currentUser?.userId as Id<'users'>}
                companyId={companyId}
                facilityId={propFacilityId as Id<'facilities'>}
                onRegisterSubmit={(fn) => { qcSubmitRef.current = fn; }}
              />
            )}
          </div>
        </div>

        <DialogFooter className="bg-muted/30 p-4 px-6 border-t">
          <Button variant="ghost" onClick={currentStep === 0 ? onClose : () => setCurrentStep(s => s - 1)} className="text-xs">
            <ArrowLeft className="mr-2 h-3.5 w-3.5" />
            {currentStep === 0 ? 'Cancelar' : 'Anterior'}
          </Button>

          <Button
            onClick={handleNext}
            disabled={isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
          >
            {isSubmitting && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
            {isLastStep ? 'Finalizar Reporte' : 'Siguiente'}
            {!isSubmitting && !isLastStep && <ArrowRight className="ml-2 h-3.5 w-3.5" />}
            {!isSubmitting && isLastStep && <Check className="ml-2 h-3.5 w-3.5" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
