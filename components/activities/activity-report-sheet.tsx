'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DynamicFormRenderer } from '@/components/quality-checks/dynamic-form-renderer';
import { useFacility } from '@/components/providers/facility-provider';
import { toast } from 'sonner';
import {
  Loader2,
  X,
  Thermometer,
  Droplets,
  FlaskConical,
  Zap,
  Clock,
  DollarSign,
  Package,
  ClipboardCheck,
  ArrowLeft,
  SkipForward,
  CheckCircle2,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ActivityReportSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Activity template to use for the report */
  activityTemplateId: Id<'activity_templates'>;
  /** Entity context */
  entityType: 'batch' | 'plant' | 'area';
  entityId: string;
  /** Pre-fill context */
  areaId?: Id<'areas'>;
  batchId?: Id<'batches'>;
  phase?: string;
  /** If coming from a scheduled activity */
  scheduledActivityId?: Id<'scheduled_activities'>;
  /** Callback after successful report */
  onCompleted?: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

const OVERALL_RESULT_OPTIONS = [
  { value: 'pass', label: 'Aprobado', color: 'bg-green-100 text-green-800' },
  { value: 'conditional', label: 'Condicional', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'fail', label: 'Rechazado', color: 'bg-red-100 text-red-800' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ActivityReportSheet({
  open,
  onOpenChange,
  activityTemplateId,
  entityType,
  entityId,
  areaId,
  batchId,
  phase,
  scheduledActivityId,
  onCompleted,
}: ActivityReportSheetProps) {
  const { currentCompanyId, currentFacilityId } = useFacility();

  // Queries
  const template = useQuery(
    api.activityTemplates.getById,
    { templateId: activityTemplateId }
  );

  const currentUser = useQuery(api.users.getCurrentUser, {});

  const companyUsers = useQuery(
    api.users.getUsersByCompany,
    currentCompanyId ? { companyId: currentCompanyId } : ('skip' as any)
  );

  const batches = useQuery(
    api.batches.list,
    currentCompanyId
      ? {
          companyId: currentCompanyId,
          areaId: areaId,
          status: 'active',
        }
      : ('skip' as any)
  );

  // QC template query — only when the activity template links one
  const qcTemplateId = template?.quality_check_template_id as
    | Id<'quality_check_templates'>
    | undefined;
  const qcTemplate = useQuery(
    api.qualityCheckTemplates.getById,
    qcTemplateId ? { templateId: qcTemplateId } : ('skip' as any)
  );

  const hasQualityStep = !!qcTemplateId && !!qcTemplate;

  // Mutations
  const logActivity = useMutation(api.activities.logV2);
  const createQualityCheck = useMutation(api.qualityChecks.create);
  const completeQualityCheck = useMutation(api.qualityChecks.complete);
  const recordQcTemplateUsage = useMutation(api.qualityCheckTemplates.recordUsage);
  const completeScheduled = useMutation(api.activities.completeScheduledActivity);

  // Step navigation (1 = activity report, 2 = quality check)
  const [step, setStep] = useState(1);

  // Form state — essential
  const [activityDate, setActivityDate] = useState(todayStr());
  const [responsibleId, setResponsibleId] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [selectedAreaId, setSelectedAreaId] = useState('');
  const [selectedPhase, setSelectedPhase] = useState('');

  // Form state — optional fields
  const [observations, setObservations] = useState('');
  const [envTemp, setEnvTemp] = useState('');
  const [envHumidity, setEnvHumidity] = useState('');
  const [envPh, setEnvPh] = useState('');
  const [envEc, setEnvEc] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [actualCost, setActualCost] = useState('');

  // Form state — resources (quantities user can adjust)
  const [resourceQuantities, setResourceQuantities] = useState<Record<string, number>>({});

  // Form state — quality check (step 2)
  const [qcFormData, setQcFormData] = useState<Record<string, any>>({});
  const [qcOverallResult, setQcOverallResult] = useState('pass');
  const [qcFollowUpRequired, setQcFollowUpRequired] = useState(false);
  const [qcFollowUpDate, setQcFollowUpDate] = useState('');
  const [qcNotes, setQcNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill from context and user
  useEffect(() => {
    if (currentUser?.userId && !responsibleId) {
      setResponsibleId(currentUser.userId);
    }
  }, [currentUser, responsibleId]);

  useEffect(() => {
    if (batchId && !selectedBatchId) setSelectedBatchId(batchId);
    if (areaId && !selectedAreaId) setSelectedAreaId(areaId);
    if (phase && !selectedPhase) setSelectedPhase(phase);
  }, [batchId, areaId, phase, selectedBatchId, selectedAreaId, selectedPhase]);

  // Pre-fill resource quantities from template
  useEffect(() => {
    if (template?.resources && Object.keys(resourceQuantities).length === 0) {
      const initial: Record<string, number> = {};
      for (const res of template.resources) {
        initial[res._id] = res.quantity;
      }
      setResourceQuantities(initial);
    }
  }, [template, resourceQuantities]);

  // Batch to get phase info
  const selectedBatch = useMemo(
    () => batches?.find((b) => b._id === selectedBatchId),
    [batches, selectedBatchId]
  );

  useEffect(() => {
    if (selectedBatch?.current_phase && !selectedPhase) {
      setSelectedPhase(selectedBatch.current_phase);
    }
  }, [selectedBatch, selectedPhase]);

  // Which optional fields are enabled
  const enabledFields = new Set(template?.form_fields ?? []);

  const resetForm = useCallback(() => {
    setStep(1);
    setActivityDate(todayStr());
    setResponsibleId(currentUser?.userId ?? '');
    setSelectedBatchId(batchId ?? '');
    setSelectedAreaId(areaId ?? '');
    setSelectedPhase(phase ?? '');
    setObservations('');
    setEnvTemp('');
    setEnvHumidity('');
    setEnvPh('');
    setEnvEc('');
    setDurationMinutes('');
    setEstimatedCost('');
    setActualCost('');
    setResourceQuantities({});
    setQcFormData({});
    setQcOverallResult('pass');
    setQcFollowUpRequired(false);
    setQcFollowUpDate('');
    setQcNotes('');
  }, [currentUser?.userId, batchId, areaId, phase]);

  // Build the resources array for logV2
  const buildResources = () => {
    if (!template?.resources || template.resources.length === 0) return undefined;
    return template.resources
      .filter((res: any) => {
        const qty = resourceQuantities[res._id] ?? res.quantity;
        return qty > 0;
      })
      .map((res: any) => ({
        product_id: res.product_id as Id<'products'>,
        direction: res.direction as string,
        quantity: resourceQuantities[res._id] ?? res.quantity,
        quantity_unit: res.quantity_basis ?? 'fixed',
        application_rate: res.application_rate,
        application_method: res.application_method,
        notes: res.notes,
      }));
  };

  // Submit activity (and optionally advance to QC step)
  const submitActivity = async (skipQuality: boolean) => {
    if (!template) return;
    if (!responsibleId) {
      toast.error('Selecciona un responsable');
      return;
    }

    try {
      setIsSubmitting(true);
      const resources = buildResources();

      await logActivity({
        type_id: template.type_id as Id<'activity_types'>,
        entity_type: entityType,
        entity_id: entityId,
        performed_by: responsibleId as Id<'users'>,
        company_id: currentCompanyId || undefined,
        facility_id: currentFacilityId
          ? (currentFacilityId as Id<'facilities'>)
          : undefined,
        batch_id: selectedBatchId
          ? (selectedBatchId as Id<'batches'>)
          : undefined,
        crop_phase: selectedPhase || undefined,
        zone_id: selectedAreaId
          ? (selectedAreaId as Id<'areas'>)
          : undefined,
        scheduled_activity_id: scheduledActivityId,
        observations: skipQuality && hasQualityStep
          ? ((observations.trim() ? observations.trim() + ' · ' : '') + 'QC omitido por el operador')
          : (observations.trim() || undefined),
        duration_minutes: durationMinutes ? Number(durationMinutes) : undefined,
        resources,
        consume_inventory: resources && resources.length > 0 ? true : undefined,
        notes: observations.trim() || undefined,
      });

      // Auto-complete the scheduled activity if this report came from one
      if (scheduledActivityId) {
        await completeScheduled({
          scheduledActivityId,
          completedBy: responsibleId as Id<'users'>,
          notes: observations.trim() || undefined,
          duration_minutes: durationMinutes ? Number(durationMinutes) : undefined,
        });
      }

      if (skipQuality || !hasQualityStep) {
        toast.success('Actividad reportada exitosamente');
        resetForm();
        onOpenChange(false);
        onCompleted?.();
      }
      // If not skipping quality, caller will advance to step 2
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle step 1 "Completar" / "Siguiente" click
  const handleStep1Action = async () => {
    if (hasQualityStep) {
      // Advance to quality step without submitting yet — we'll submit both at the end
      // Actually, submit activity first, then do QC step. Simpler and safer.
      try {
        await submitActivity(false);
        setStep(2);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Error al reportar actividad');
      }
    } else {
      try {
        await submitActivity(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Error al reportar actividad');
      }
    }
  };

  // Handle "Omitir calidad" on step 2
  const handleSkipQuality = () => {
    toast.success('Actividad reportada. Formulario de calidad omitido.');
    resetForm();
    onOpenChange(false);
    onCompleted?.();
  };

  // Handle "Completar" on step 2 (submit QC)
  const handleCompleteWithQC = async () => {
    if (!qcTemplateId || !currentCompanyId || !currentFacilityId) return;

    try {
      setIsSubmitting(true);

      // Create QC check
      const checkId = await createQualityCheck({
        templateId: qcTemplateId,
        entityType,
        entityId,
        performedBy: responsibleId as Id<'users'>,
        companyId: currentCompanyId,
        facilityId: currentFacilityId as Id<'facilities'>,
        formData: qcFormData,
        notes: qcNotes.trim() || undefined,
      });

      // Complete QC check
      await completeQualityCheck({
        checkId,
        formData: qcFormData,
        overallResult: qcOverallResult,
        notes: qcNotes.trim() || undefined,
        followUpRequired: qcFollowUpRequired || undefined,
        followUpDate: qcFollowUpRequired && qcFollowUpDate
          ? new Date(qcFollowUpDate).getTime()
          : undefined,
      });

      // Record template usage
      await recordQcTemplateUsage({ templateId: qcTemplateId });

      toast.success('Actividad y control de calidad completados');
      resetForm();
      onOpenChange(false);
      onCompleted?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al completar control de calidad');
    } finally {
      setIsSubmitting(false);
    }
  };

  const templateName = template?.name ?? 'Reportar Actividad';

  // QC template structure for DynamicFormRenderer
  const qcTemplateStructure = qcTemplate?.template_structure as
    | { version: string; sections: any[] }
    | undefined;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[500px] flex flex-col p-0 gap-0"
      >
        {/* Fixed header */}
        <SheetHeader className="px-6 py-4 border-b shrink-0">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <SheetTitle className="text-lg truncate">{templateName}</SheetTitle>
              {/* Step indicator */}
              {hasQualityStep && (
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        step === 1
                          ? 'bg-amber-500 text-white'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {step > 1 ? <CheckCircle2 className="h-3.5 w-3.5" /> : '1'}
                    </div>
                    <span className={`text-xs ${step === 1 ? 'font-medium' : 'text-muted-foreground'}`}>
                      Reporte
                    </span>
                  </div>
                  <div className="w-4 h-px bg-gray-300" />
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        step === 2
                          ? 'bg-amber-500 text-white'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      2
                    </div>
                    <span className={`text-xs ${step === 2 ? 'font-medium' : 'text-muted-foreground'}`}>
                      Calidad
                    </span>
                  </div>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Loading */}
          {!template && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Step 1: Activity report */}
          {template && step === 1 && (
            <>
              {/* Essential fields */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Datos esenciales
                </h4>

                <div className="space-y-2">
                  <Label>Fecha de actividad</Label>
                  <Input
                    type="date"
                    value={activityDate}
                    onChange={(e) => setActivityDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Responsable *</Label>
                  <Select value={responsibleId} onValueChange={setResponsibleId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar responsable" />
                    </SelectTrigger>
                    <SelectContent>
                      {companyUsers?.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.firstName} {u.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {batches && batches.length > 0 && (
                  <div className="space-y-2">
                    <Label>Lote</Label>
                    <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar lote" />
                      </SelectTrigger>
                      <SelectContent>
                        {batches.map((b) => (
                          <SelectItem key={b._id} value={b._id}>
                            {b.batch_code} — {b.cultivarName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {selectedBatch && (
                  <div className="text-sm text-muted-foreground">
                    Fase: <span className="font-medium">{selectedBatch.current_phase}</span>
                    {' · '}Area: <span className="font-medium">{selectedBatch.areaName}</span>
                  </div>
                )}
              </div>

              {/* Optional fields */}
              {enabledFields.size > 0 && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      Campos adicionales
                    </h4>

                    {enabledFields.has('observations') && (
                      <div className="space-y-2">
                        <Label>Observaciones / Notas</Label>
                        <Textarea
                          value={observations}
                          onChange={(e) => setObservations(e.target.value)}
                          placeholder="Notas de la actividad..."
                          rows={3}
                        />
                      </div>
                    )}

                    {/* Environmental data */}
                    {(enabledFields.has('environmental_temp') ||
                      enabledFields.has('environmental_humidity') ||
                      enabledFields.has('environmental_ph') ||
                      enabledFields.has('environmental_ec')) && (
                      <div className="grid grid-cols-2 gap-3">
                        {enabledFields.has('environmental_temp') && (
                          <div className="space-y-1">
                            <Label className="text-xs flex items-center gap-1">
                              <Thermometer className="h-3 w-3" /> Temperatura (°C)
                            </Label>
                            <Input
                              type="number"
                              step="0.1"
                              value={envTemp}
                              onChange={(e) => setEnvTemp(e.target.value)}
                              placeholder="°C"
                              className="h-8"
                            />
                          </div>
                        )}
                        {enabledFields.has('environmental_humidity') && (
                          <div className="space-y-1">
                            <Label className="text-xs flex items-center gap-1">
                              <Droplets className="h-3 w-3" /> Humedad (%)
                            </Label>
                            <Input
                              type="number"
                              step="0.1"
                              value={envHumidity}
                              onChange={(e) => setEnvHumidity(e.target.value)}
                              placeholder="%"
                              className="h-8"
                            />
                          </div>
                        )}
                        {enabledFields.has('environmental_ph') && (
                          <div className="space-y-1">
                            <Label className="text-xs flex items-center gap-1">
                              <FlaskConical className="h-3 w-3" /> pH
                            </Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={envPh}
                              onChange={(e) => setEnvPh(e.target.value)}
                              placeholder="pH"
                              className="h-8"
                            />
                          </div>
                        )}
                        {enabledFields.has('environmental_ec') && (
                          <div className="space-y-1">
                            <Label className="text-xs flex items-center gap-1">
                              <Zap className="h-3 w-3" /> EC (mS/cm)
                            </Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={envEc}
                              onChange={(e) => setEnvEc(e.target.value)}
                              placeholder="mS/cm"
                              className="h-8"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {enabledFields.has('duration_minutes') && (
                      <div className="space-y-1">
                        <Label className="text-xs flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Duracion real (minutos)
                        </Label>
                        <Input
                          type="number"
                          value={durationMinutes}
                          onChange={(e) => setDurationMinutes(e.target.value)}
                          placeholder="Ej: 30"
                          min={0}
                          className="h-8 w-[150px]"
                        />
                      </div>
                    )}

                    {(enabledFields.has('estimated_cost') || enabledFields.has('actual_cost')) && (
                      <div className="grid grid-cols-2 gap-3">
                        {enabledFields.has('estimated_cost') && (
                          <div className="space-y-1">
                            <Label className="text-xs flex items-center gap-1">
                              <DollarSign className="h-3 w-3" /> Costo estimado
                            </Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={estimatedCost}
                              onChange={(e) => setEstimatedCost(e.target.value)}
                              placeholder="$"
                              className="h-8"
                            />
                          </div>
                        )}
                        {enabledFields.has('actual_cost') && (
                          <div className="space-y-1">
                            <Label className="text-xs flex items-center gap-1">
                              <DollarSign className="h-3 w-3" /> Costo real
                            </Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={actualCost}
                              onChange={(e) => setActualCost(e.target.value)}
                              placeholder="$"
                              className="h-8"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Resources */}
              {template.resources && template.resources.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                      <Package className="h-3.5 w-3.5" />
                      Recursos ({template.resources.length})
                    </h4>

                    <div className="space-y-2">
                      {template.resources.map((res: any) => {
                        const qty = resourceQuantities[res._id] ?? res.quantity;
                        return (
                          <div
                            key={res._id}
                            className="flex items-center gap-3 rounded-lg border px-3 py-2"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {res.productName ?? res.product_id}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {res.quantity_basis} · {res.direction}
                              </p>
                            </div>
                            <Input
                              type="number"
                              step="0.01"
                              min={0}
                              value={qty}
                              onChange={(e) =>
                                setResourceQuantities((prev) => ({
                                  ...prev,
                                  [res._id]: Number(e.target.value) || 0,
                                }))
                              }
                              className="w-20 h-8 text-sm"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* QC step hint */}
              {hasQualityStep && qcTemplate && (
                <>
                  <Separator />
                  <div className="rounded-lg bg-blue-50 p-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-blue-900">
                      <ClipboardCheck className="h-4 w-4" />
                      Siguiente: Formulario de Calidad
                    </div>
                    <p className="text-xs text-blue-700 mt-1">
                      {qcTemplate.name}
                      {qcTemplate.procedure_type && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {qcTemplate.procedure_type}
                        </Badge>
                      )}
                    </p>
                  </div>
                </>
              )}
            </>
          )}

          {/* Step 2: Quality check form */}
          {template && step === 2 && qcTemplate && qcTemplateStructure && (
            <>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4 text-amber-600" />
                  <h4 className="text-sm font-medium uppercase tracking-wide">
                    {qcTemplate.name}
                  </h4>
                </div>

                {/* Dynamic QC form */}
                <DynamicFormRenderer
                  template={qcTemplateStructure as any}
                  initialValues={qcFormData}
                  onChange={setQcFormData}
                  showSubmitButton={false}
                  className="space-y-4"
                />
              </div>

              <Separator />

              {/* Overall result */}
              <div className="space-y-3">
                <Label>Resultado general *</Label>
                <div className="flex gap-2">
                  {OVERALL_RESULT_OPTIONS.map((opt) => (
                    <Button
                      key={opt.value}
                      type="button"
                      variant={qcOverallResult === opt.value ? 'default' : 'outline'}
                      size="sm"
                      className={
                        qcOverallResult === opt.value
                          ? opt.color
                          : ''
                      }
                      onClick={() => setQcOverallResult(opt.value)}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Follow-up */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="qc-followup"
                    checked={qcFollowUpRequired}
                    onChange={(e) => setQcFollowUpRequired(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="qc-followup" className="cursor-pointer">
                    Requiere seguimiento
                  </Label>
                </div>
                {qcFollowUpRequired && (
                  <div className="space-y-2 ml-7">
                    <Label className="text-xs">Fecha de seguimiento</Label>
                    <Input
                      type="date"
                      value={qcFollowUpDate}
                      onChange={(e) => setQcFollowUpDate(e.target.value)}
                      className="h-8 w-[200px]"
                    />
                  </div>
                )}
              </div>

              {/* QC Notes */}
              <div className="space-y-2">
                <Label>Notas de calidad</Label>
                <Textarea
                  value={qcNotes}
                  onChange={(e) => setQcNotes(e.target.value)}
                  placeholder="Observaciones de la inspeccion..."
                  rows={3}
                />
              </div>
            </>
          )}
        </div>

        {/* Fixed footer */}
        <SheetFooter className="px-6 py-4 border-t shrink-0">
          {step === 1 && (
            <div className="flex items-center justify-end gap-2 w-full">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleStep1Action}
                disabled={isSubmitting || !template}
                className="bg-amber-500 hover:bg-amber-600"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting
                  ? 'Completando...'
                  : hasQualityStep
                    ? 'Siguiente: Calidad'
                    : 'Completar Actividad'}
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="flex items-center justify-between w-full">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep(1)}
                disabled={isSubmitting}
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Volver
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSkipQuality}
                  disabled={isSubmitting}
                >
                  <SkipForward className="mr-1 h-4 w-4" />
                  Omitir calidad
                </Button>
                <Button
                  onClick={handleCompleteWithQC}
                  disabled={isSubmitting}
                  className="bg-amber-500 hover:bg-amber-600"
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSubmitting ? 'Completando...' : 'Completar'}
                </Button>
              </div>
            </div>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
