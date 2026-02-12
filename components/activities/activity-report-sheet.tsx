'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { DynamicFormRenderer } from '@/components/quality-checks/dynamic-form-renderer';
import { useFacility } from '@/components/providers/facility-provider';
import { toast } from 'sonner';
import {
  Loader2,
  Calendar,
  User,
  Layers,
  Leaf,
  Package,
  ChevronLeft,
  ClipboardCheck,
  Check,
  SkipForward,
  Timer,
} from 'lucide-react';


interface ActivityReportSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The activity template to use for this report */
  activityTemplateId: Id<'activity_templates'>;
  /** What entity this activity is for */
  entityType: 'batch' | 'plant' | 'area';
  entityId: string;
  /** Area context */
  areaId?: Id<'areas'>;
  facilityId?: Id<'facilities'>;
  /** If reporting from a scheduled activity, link it */
  scheduledActivityId?: Id<'scheduled_activities'>;
  /** Pre-fill crop phase */
  cropPhase?: string;
  /** Pre-fill batch */
  batchId?: Id<'batches'>;
  /** Callback after successful submission */
  onCompleted?: () => void;
}

interface ReportFormData {
  // Essential fields
  activityDate: string; // YYYY-MM-DD
  observations: string;
  // Environmental data
  temperature: string;
  humidity: string;
  ph: string;
  ec: string;
  // Duration & cost
  durationMinutes: string;
  estimatedCost: string;
  actualCost: string;
  // Resources — track adjusted quantities
  resourceQuantities: Record<string, number>;
  // Checklist completion
  checklistCompleted: Record<string, boolean>;
}

export function ActivityReportSheet({
  open,
  onOpenChange,
  activityTemplateId,
  entityType,
  entityId,
  areaId,
  facilityId,
  scheduledActivityId,
  cropPhase,
  batchId,
  onCompleted,
}: ActivityReportSheetProps) {
  const { currentCompanyId, currentFacilityId } = useFacility();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step state: 1 = activity report, 2 = quality form
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [showSkipDialog, setShowSkipDialog] = useState(false);

  // QC form state
  const [qcFormData, setQcFormData] = useState<Record<string, any>>({});
  const [qcResult, setQcResult] = useState<'pass' | 'conditional' | 'fail'>('pass');
  const [qcNotes, setQcNotes] = useState('');
  const [qcFollowUpRequired, setQcFollowUpRequired] = useState(false);
  const [qcFollowUpDate, setQcFollowUpDate] = useState('');
  const [qcStartTime, setQcStartTime] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState<ReportFormData>({
    activityDate: new Date().toISOString().split('T')[0],
    observations: '',
    temperature: '',
    humidity: '',
    ph: '',
    ec: '',
    durationMinutes: '',
    estimatedCost: '',
    actualCost: '',
    resourceQuantities: {},
    checklistCompleted: {},
  });

  // Queries
  const template = useQuery(
    api.activityTemplates.getById,
    open ? { templateId: activityTemplateId } : 'skip' as any
  );

  const currentUser = useQuery(api.users.getCurrentUser, open ? {} : 'skip' as any);

  // QC template query (only when template has a linked QC)
  const qcTemplateId = template?.quality_check_template_id;
  const qcTemplate = useQuery(
    api.qualityCheckTemplates.getById,
    qcTemplateId ? { templateId: qcTemplateId } : 'skip' as any
  );

  const hasQualityStep = !!qcTemplateId;

  // Mutations
  const logActivityV2 = useMutation(api.activities.logV2);
  const markScheduledCompleted = useMutation(api.cultivationSchedules.markScheduledActivityCompleted);
  const createQualityCheck = useMutation(api.qualityChecks.create);
  const completeQualityCheck = useMutation(api.qualityChecks.complete);

  const effectiveFacilityId = facilityId ?? currentFacilityId;

  // Reset state when sheet closes
  useEffect(() => {
    if (!open) {
      setCurrentStep(1);
      setQcFormData({});
      setQcResult('pass');
      setQcNotes('');
      setQcFollowUpRequired(false);
      setQcFollowUpDate('');
      setQcStartTime(null);
    }
  }, [open]);

  // Initialize resource quantities from template
  useEffect(() => {
    if (template?.resources && Object.keys(formData.resourceQuantities).length === 0) {
      const quantities: Record<string, number> = {};
      template.resources.forEach((r) => {
        quantities[r._id] = r.quantity;
      });
      setFormData((prev) => ({ ...prev, resourceQuantities: quantities }));
    }
  }, [template?.resources, formData.resourceQuantities]);

  // Which optional fields are enabled
  const enabledFields = useMemo(
    () => new Set(template?.form_fields ?? []),
    [template?.form_fields]
  );

  const update = (partial: Partial<ReportFormData>) => {
    setFormData((prev) => ({ ...prev, ...partial }));
  };

  /** Build activity resources from template + adjusted quantities */
  const buildResources = () => {
    if (!template) return [];
    return (template.resources ?? []).map((r) => ({
      product_id: r.product_id as Id<'products'>,
      direction: r.direction,
      quantity: formData.resourceQuantities[r._id] ?? r.quantity,
      quantity_unit: r.quantity_basis,
      application_rate: r.application_rate,
      application_method: r.application_method,
    }));
  };

  /** Build logV2 args from form state */
  const buildActivityArgs = () => {
    if (!template || !currentUser) return null;
    const resources = buildResources();
    return {
      type_id: template.type_id,
      entity_type: entityType,
      entity_id: entityId,
      performed_by: currentUser.userId,
      company_id: currentCompanyId ?? undefined,
      facility_id: effectiveFacilityId
        ? (effectiveFacilityId as Id<'facilities'>)
        : undefined,
      batch_id: batchId,
      crop_phase: cropPhase,
      zone_id: areaId,
      status: 'completed' as const,
      priority: template.default_priority ?? 'routine',
      title: template.name,
      observations: formData.observations || undefined,
      duration_minutes: formData.durationMinutes
        ? Number(formData.durationMinutes)
        : undefined,
      started_at: new Date(formData.activityDate).getTime(),
      scheduled_activity_id: scheduledActivityId,
      resources: resources.length > 0 ? resources : undefined,
      consume_inventory: resources.length > 0,
      notes: formData.observations || undefined,
    };
  };

  const resetForm = () => {
    setFormData({
      activityDate: new Date().toISOString().split('T')[0],
      observations: '',
      temperature: '',
      humidity: '',
      ph: '',
      ec: '',
      durationMinutes: '',
      estimatedCost: '',
      actualCost: '',
      resourceQuantities: {},
      checklistCompleted: {},
    });
  };

  /** Step 1: "Completar Actividad" — either advance to QC step or submit directly */
  const handleStep1Complete = () => {
    if (hasQualityStep) {
      setCurrentStep(2);
      setQcStartTime(Date.now());
    } else {
      handleSubmitActivityOnly();
    }
  };

  /** Submit activity without QC */
  const handleSubmitActivityOnly = async (qcSkipped = false) => {
    const args = buildActivityArgs();
    if (!args || !currentUser) return;

    try {
      setIsSubmitting(true);

      const notes = qcSkipped
        ? `${args.notes ? args.notes + '\n' : ''}[QC omitido por el operador]`
        : args.notes;

      await logActivityV2({ ...args, notes });

      // Mark scheduled activity as completed
      if (scheduledActivityId) {
        await markScheduledCompleted({
          scheduledActivityId,
          completedBy: currentUser.userId,
        });
      }

      toast.success('Actividad registrada exitosamente');
      onOpenChange(false);
      onCompleted?.();
      resetForm();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al registrar actividad');
    } finally {
      setIsSubmitting(false);
    }
  };

  /** Submit activity + QC check */
  const handleSubmitWithQuality = async () => {
    const args = buildActivityArgs();
    if (!args || !currentUser || !currentCompanyId || !effectiveFacilityId || !qcTemplateId) return;

    try {
      setIsSubmitting(true);

      // 1. Create the activity
      await logActivityV2(args);

      // 2. Create QC record (draft)
      const checkId = await createQualityCheck({
        templateId: qcTemplateId,
        entityType,
        entityId,
        performedBy: currentUser.userId,
        companyId: currentCompanyId,
        facilityId: effectiveFacilityId as Id<'facilities'>,
      });

      // 3. Mark scheduled activity as completed
      if (scheduledActivityId) {
        await markScheduledCompleted({
          scheduledActivityId,
          completedBy: currentUser.userId,
        });
      }

      // 4. Complete the QC record
      const durationMinutes = qcStartTime
        ? Math.round((Date.now() - qcStartTime) / 60000)
        : undefined;

      await completeQualityCheck({
        checkId,
        formData: qcFormData,
        overallResult: qcResult,
        durationMinutes: durationMinutes || undefined,
        notes: qcNotes || undefined,
        followUpRequired: qcFollowUpRequired,
        followUpDate: qcFollowUpDate
          ? new Date(qcFollowUpDate).getTime()
          : undefined,
      });

      toast.success('Actividad y control de calidad registrados');
      onOpenChange(false);
      onCompleted?.();
      resetForm();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al registrar');
    } finally {
      setIsSubmitting(false);
    }
  };

  /** Skip QC — submit activity only with note */
  const handleSkipQuality = () => {
    setShowSkipDialog(false);
    handleSubmitActivityOnly(true);
  };

  const isLoading = template === undefined || template === null || currentUser === undefined || currentUser === null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg overflow-y-auto flex flex-col"
      >
        <SheetHeader className="sticky top-0 bg-background z-10 pb-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-amber-500" />
            {template?.name ?? 'Reporte de Actividad'}
          </SheetTitle>
          {template && (
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs">
                {template.default_priority ?? 'routine'}
              </Badge>
              {template.applicable_phases.slice(0, 3).map((p) => (
                <Badge key={p} variant="secondary" className="text-xs">
                  {p}
                </Badge>
              ))}
            </div>
          )}

          {/* Step indicator — only when QC step exists */}
          {hasQualityStep && (
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => currentStep === 2 && setCurrentStep(1)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  currentStep === 1
                    ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100'
                    : 'text-muted-foreground hover:bg-muted cursor-pointer'
                }`}
              >
                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                  currentStep > 1 ? 'bg-green-500 text-white' : currentStep === 1 ? 'bg-amber-500 text-white' : 'bg-muted'
                }`}>
                  {currentStep > 1 ? <Check className="h-3 w-3" /> : '1'}
                </span>
                Reporte
              </button>
              <div className={`h-px w-6 ${currentStep > 1 ? 'bg-green-300' : 'bg-border'}`} />
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                currentStep === 2
                  ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100'
                  : 'text-muted-foreground'
              }`}>
                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                  currentStep === 2 ? 'bg-amber-500 text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  2
                </span>
                Calidad
              </div>
            </div>
          )}
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center flex-1 py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : template ? (
          <div className="flex-1 space-y-6 py-4">

            {/* ===== STEP 1: Activity Report ===== */}
            {currentStep === 1 && (<>
            {/* Essential fields — always shown */}
            <div className="space-y-4">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                Informacion esencial
              </Label>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Fecha
                  </Label>
                  <Input
                    type="date"
                    value={formData.activityDate}
                    onChange={(e) => update({ activityDate: e.target.value })}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs flex items-center gap-1">
                    <User className="h-3 w-3" /> Responsable
                  </Label>
                  <Input
                    value={
                      currentUser
                        ? `${currentUser.firstName ?? ''} ${currentUser.lastName ?? ''}`
                        : ''
                    }
                    disabled
                    className="h-9 bg-muted"
                  />
                </div>
              </div>

              {cropPhase && (
                <div className="space-y-1">
                  <Label className="text-xs flex items-center gap-1">
                    <Leaf className="h-3 w-3" /> Fase del cultivo
                  </Label>
                  <Input
                    value={cropPhase}
                    disabled
                    className="h-9 bg-muted"
                  />
                </div>
              )}
            </div>

            {/* Optional fields — based on template.form_fields */}
            {enabledFields.size > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                    Datos de la actividad
                  </Label>

                  {enabledFields.has('observations') && (
                    <div className="space-y-1">
                      <Label className="text-xs">Observaciones / Notas</Label>
                      <Textarea
                        value={formData.observations}
                        onChange={(e) => update({ observations: e.target.value })}
                        placeholder="Notas del operador..."
                        rows={3}
                        className="text-sm"
                      />
                    </div>
                  )}

                  {/* Environmental fields */}
                  {(enabledFields.has('environmental_temp') ||
                    enabledFields.has('environmental_humidity') ||
                    enabledFields.has('environmental_ph') ||
                    enabledFields.has('environmental_ec')) && (
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        Datos ambientales
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        {enabledFields.has('environmental_temp') && (
                          <div className="space-y-1">
                            <Label className="text-xs">Temp. (°C)</Label>
                            <Input
                              type="number"
                              step="0.1"
                              value={formData.temperature}
                              onChange={(e) => update({ temperature: e.target.value })}
                              placeholder="25.5"
                              className="h-8 text-sm"
                            />
                          </div>
                        )}
                        {enabledFields.has('environmental_humidity') && (
                          <div className="space-y-1">
                            <Label className="text-xs">Humedad (%)</Label>
                            <Input
                              type="number"
                              step="0.1"
                              value={formData.humidity}
                              onChange={(e) => update({ humidity: e.target.value })}
                              placeholder="65"
                              className="h-8 text-sm"
                            />
                          </div>
                        )}
                        {enabledFields.has('environmental_ph') && (
                          <div className="space-y-1">
                            <Label className="text-xs">pH</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={formData.ph}
                              onChange={(e) => update({ ph: e.target.value })}
                              placeholder="6.2"
                              className="h-8 text-sm"
                            />
                          </div>
                        )}
                        {enabledFields.has('environmental_ec') && (
                          <div className="space-y-1">
                            <Label className="text-xs">EC (mS/cm)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={formData.ec}
                              onChange={(e) => update({ ec: e.target.value })}
                              placeholder="1.8"
                              className="h-8 text-sm"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {enabledFields.has('duration_minutes') && (
                    <div className="space-y-1">
                      <Label className="text-xs">Duracion real (minutos)</Label>
                      <Input
                        type="number"
                        value={formData.durationMinutes}
                        onChange={(e) => update({ durationMinutes: e.target.value })}
                        placeholder="30"
                        min={0}
                        className="h-9 max-w-[200px]"
                      />
                    </div>
                  )}

                  {/* Cost fields */}
                  {(enabledFields.has('estimated_cost') || enabledFields.has('actual_cost')) && (
                    <div className="grid grid-cols-2 gap-3">
                      {enabledFields.has('estimated_cost') && (
                        <div className="space-y-1">
                          <Label className="text-xs">Costo estimado</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={formData.estimatedCost}
                            onChange={(e) => update({ estimatedCost: e.target.value })}
                            placeholder="0.00"
                            className="h-8 text-sm"
                          />
                        </div>
                      )}
                      {enabledFields.has('actual_cost') && (
                        <div className="space-y-1">
                          <Label className="text-xs">Costo real</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={formData.actualCost}
                            onChange={(e) => update({ actualCost: e.target.value })}
                            placeholder="0.00"
                            className="h-8 text-sm"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Checklist */}
                  {enabledFields.has('checklist') &&
                    template.checklist &&
                    template.checklist.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">
                          Checklist de verificacion
                        </Label>
                        <div className="space-y-2">
                          {template.checklist.map((item) => (
                            <label
                              key={item._id}
                              className="flex items-start gap-2 p-2 rounded border hover:bg-muted/30 cursor-pointer"
                            >
                              <Checkbox
                                checked={formData.checklistCompleted[item._id] ?? false}
                                onCheckedChange={(checked) =>
                                  update({
                                    checklistCompleted: {
                                      ...formData.checklistCompleted,
                                      [item._id]: !!checked,
                                    },
                                  })
                                }
                                className="mt-0.5"
                              />
                              <div>
                                <span className="text-sm font-medium">
                                  {item.title}
                                  {item.is_required && (
                                    <span className="text-red-500 ml-1">*</span>
                                  )}
                                </span>
                                {item.description && (
                                  <p className="text-xs text-muted-foreground">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </>
            )}

            {/* Resources section */}
            {template.resources && template.resources.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground font-semibold flex items-center gap-1">
                    <Package className="h-3 w-3" /> Recursos ({template.resources.length})
                  </Label>

                  <div className="space-y-2">
                    {template.resources.map((resource) => (
                      <div
                        key={resource._id}
                        className="flex items-center gap-3 p-2 rounded border"
                      >
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium truncate block">
                            {resource.product_id}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {resource.quantity_basis} · {resource.direction}
                          </span>
                        </div>
                        <Input
                          type="number"
                          step="0.01"
                          min={0}
                          value={formData.resourceQuantities[resource._id] ?? resource.quantity}
                          onChange={(e) =>
                            update({
                              resourceQuantities: {
                                ...formData.resourceQuantities,
                                [resource._id]: Number(e.target.value) || 0,
                              },
                            })
                          }
                          className="w-20 h-8 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
            </>)}

            {/* ===== STEP 2: Quality Check Form ===== */}
            {currentStep === 2 && qcTemplate && (
              <div className="space-y-6">
                {/* QC header */}
                <div className="flex items-center justify-between">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground font-semibold flex items-center gap-1">
                    <ClipboardCheck className="h-3 w-3" /> Formulario de Calidad
                  </Label>
                  {qcStartTime && (
                    <QcTimer startTime={qcStartTime} />
                  )}
                </div>

                <div className="p-3 rounded-lg bg-muted/50 border text-sm">
                  <div className="font-medium">{qcTemplate.name}</div>
                  {qcTemplate.procedure_type && (
                    <Badge variant="outline" className="text-xs mt-1">
                      {qcTemplate.procedure_type}
                    </Badge>
                  )}
                </div>

                {/* Dynamic QC form */}
                {qcTemplate.template_structure && (
                  <DynamicFormRenderer
                    template={qcTemplate.template_structure}
                    initialValues={qcFormData}
                    onChange={setQcFormData}
                    showSubmitButton={false}
                  />
                )}

                <Separator />

                {/* Result selector */}
                <div className="space-y-3">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                    Resultado de inspeccion
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { value: 'pass', label: 'Aprobado', color: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-950 dark:text-green-200 dark:border-green-800' },
                      { value: 'conditional', label: 'Condicional', color: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-950 dark:text-yellow-200 dark:border-yellow-800' },
                      { value: 'fail', label: 'Rechazado', color: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-200 dark:border-red-800' },
                    ] as const).map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setQcResult(opt.value)}
                        className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                          qcResult === opt.value
                            ? `${opt.color} ring-2 ring-offset-1 ring-current`
                            : 'border-border text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Follow-up */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={qcFollowUpRequired}
                      onCheckedChange={setQcFollowUpRequired}
                    />
                    <Label className="cursor-pointer text-sm">
                      Requiere seguimiento
                    </Label>
                  </div>

                  {qcFollowUpRequired && (
                    <div className="space-y-1 ml-11">
                      <Label className="text-xs">Fecha de seguimiento</Label>
                      <Input
                        type="date"
                        value={qcFollowUpDate}
                        onChange={(e) => setQcFollowUpDate(e.target.value)}
                        className="h-9 max-w-[200px]"
                      />
                    </div>
                  )}
                </div>

                {/* QC notes */}
                <div className="space-y-1">
                  <Label className="text-xs">Notas del inspector</Label>
                  <Textarea
                    value={qcNotes}
                    onChange={(e) => setQcNotes(e.target.value)}
                    placeholder="Observaciones sobre la inspeccion..."
                    rows={2}
                    className="text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* Skip QC confirmation dialog */}
        <AlertDialog open={showSkipDialog} onOpenChange={setShowSkipDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Omitir control de calidad?</AlertDialogTitle>
              <AlertDialogDescription>
                La actividad se registrara sin el formulario de calidad. Se anotara que el QC fue omitido.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleSkipQuality}>
                Omitir y guardar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Footer */}
        <SheetFooter className="sticky bottom-0 bg-background pt-4 border-t flex-row gap-2">
          {currentStep === 1 ? (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleStep1Complete}
                disabled={isSubmitting || isLoading}
                className="flex-1 bg-amber-500 hover:bg-amber-600"
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {isSubmitting
                  ? 'Registrando...'
                  : hasQualityStep
                    ? 'Siguiente: Calidad'
                    : 'Completar Actividad'}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
                disabled={isSubmitting}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Atras
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowSkipDialog(true)}
                disabled={isSubmitting}
                className="text-muted-foreground"
              >
                <SkipForward className="mr-1 h-4 w-4" />
                Omitir
              </Button>
              <Button
                onClick={handleSubmitWithQuality}
                disabled={isSubmitting || isLoading}
                className="flex-1 bg-amber-500 hover:bg-amber-600"
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ClipboardCheck className="mr-2 h-4 w-4" />
                )}
                {isSubmitting ? 'Registrando...' : 'Completar con Calidad'}
              </Button>
            </>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

/** Small timer component that shows elapsed time since QC step started */
function QcTimer({ startTime }: { startTime: number }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <Timer className="h-3 w-3" />
      {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
    </div>
  );
}
