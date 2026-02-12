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
  Calendar,
  User,
  Layers,
  MapPin,
  Leaf,
  Package,
} from 'lucide-react';

// Constants for optional field rendering
const OPTIONAL_FIELD_IDS = [
  'observations',
  'environmental_temp',
  'environmental_humidity',
  'environmental_ph',
  'environmental_ec',
  'duration_minutes',
  'estimated_cost',
  'actual_cost',
  'checklist',
  'additional_responsible',
] as const;

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

  // Mutations
  const logActivityV2 = useMutation(api.activities.logV2);

  const effectiveFacilityId = facilityId ?? currentFacilityId;

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

  const handleSubmit = async () => {
    if (!template || !currentUser) return;

    try {
      setIsSubmitting(true);

      // Build resources array from template + adjusted quantities
      const resources = (template.resources ?? []).map((r) => ({
        product_id: r.product_id as Id<'products'>,
        direction: r.direction,
        quantity: formData.resourceQuantities[r._id] ?? r.quantity,
        quantity_unit: r.quantity_basis,
        application_rate: r.application_rate,
        application_method: r.application_method,
      }));

      await logActivityV2({
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
        status: 'completed',
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
      });

      toast.success('Actividad registrada exitosamente');
      onOpenChange(false);
      onCompleted?.();

      // Reset form
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
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al registrar actividad');
    } finally {
      setIsSubmitting(false);
    }
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
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center flex-1 py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : template ? (
          <div className="flex-1 space-y-6 py-4">
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
          </div>
        ) : null}

        {/* Footer */}
        <SheetFooter className="sticky bottom-0 bg-background pt-4 border-t flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || isLoading}
            className="flex-1 bg-amber-500 hover:bg-amber-600"
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isSubmitting ? 'Registrando...' : 'Completar Actividad'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
