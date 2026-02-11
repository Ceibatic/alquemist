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
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

  // Mutations
  const logActivity = useMutation(api.activities.logV2);

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

  // Product lookup for resource names
  const productMap = useMemo(() => {
    const map = new Map<string, string>();
    // template.resources already has product info from getById enrichment
    return map;
  }, []);

  const resetForm = () => {
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
  };

  const handleSubmit = async () => {
    if (!template) return;
    if (!responsibleId) {
      toast.error('Selecciona un responsable');
      return;
    }

    try {
      setIsSubmitting(true);

      // Build resources array
      const resources =
        template.resources && template.resources.length > 0
          ? template.resources
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
              }))
          : undefined;

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
        observations: observations.trim() || undefined,
        duration_minutes: durationMinutes ? Number(durationMinutes) : undefined,
        resources,
        consume_inventory: resources && resources.length > 0 ? true : undefined,
        notes: observations.trim() || undefined,
      });

      toast.success('Actividad reportada exitosamente');
      resetForm();
      onOpenChange(false);
      onCompleted?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al reportar actividad');
    } finally {
      setIsSubmitting(false);
    }
  };

  const templateName = template?.name ?? 'Reportar Actividad';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[500px] flex flex-col p-0 gap-0"
      >
        {/* Fixed header */}
        <SheetHeader className="px-6 py-4 border-b shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg">{templateName}</SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
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

          {template && (
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
            </>
          )}
        </div>

        {/* Fixed footer */}
        <SheetFooter className="px-6 py-4 border-t shrink-0">
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !template}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isSubmitting ? 'Completando...' : 'Completar Actividad'}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
