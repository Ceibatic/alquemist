'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ActivityTypePicker } from './activity-type-picker';
import { BatchMultiSelect } from './batch-multi-select';
import { useFacility } from '@/components/providers/facility-provider';
import { toast } from 'sonner';
import { Loader2, CalendarPlus } from 'lucide-react';
import {
  scheduleActivitySchema,
  type ScheduleActivityInput,
} from '@/lib/validations/schedule-activity';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ScheduleActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fromOrderId?: Id<'production_orders'>;
  fromAreaId?: Id<'areas'>;
  fromPhase?: string;
  fromBatchId?: Id<'batches'>;
  onScheduled?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ScheduleActivityDialog({
  open,
  onOpenChange,
  fromOrderId,
  fromAreaId,
  fromPhase,
  fromBatchId,
  onScheduled,
}: ScheduleActivityDialogProps) {
  const { currentCompanyId, currentFacilityId } = useFacility();

  const form = useForm<ScheduleActivityInput>({
    resolver: zodResolver(scheduleActivitySchema),
    defaultValues: {
      typeId: '',
      templateId: undefined,
      scheduledDate: '',
      batchIds: fromBatchId ? [fromBatchId as string] : [],
      estimatedDurationMinutes: undefined,
      assignedTo: undefined,
      instructions: '',
      priority: 'routine',
    },
  });

  // Pre-fill batch from props
  useEffect(() => {
    if (fromBatchId) {
      form.setValue('batchIds', [fromBatchId as string]);
    }
  }, [fromBatchId, form]);

  const typeId = form.watch('typeId');

  // Load templates filtered by selected type
  const templates = useQuery(
    api.activityTemplates.list,
    currentCompanyId && typeId
      ? {
          companyId: currentCompanyId,
          typeId: typeId as Id<'activity_types'>,
          isActive: true,
        }
      : 'skip',
  );

  // Load users
  const companyUsers = useQuery(
    api.users.getUsersByCompany,
    currentCompanyId ? { companyId: currentCompanyId } : 'skip',
  );
  const activeUsers = companyUsers?.filter((u) => u.status === 'active') ?? [];

  const createManual = useMutation(api.scheduledActivities.createManual);

  // When template is selected, pre-fill duration and instructions
  const selectedTemplateId = form.watch('templateId');
  const selectedTemplate = templates?.find(
    (t) => (t._id as string) === selectedTemplateId,
  );

  useEffect(() => {
    if (selectedTemplate) {
      if (selectedTemplate.estimated_duration_minutes) {
        form.setValue(
          'estimatedDurationMinutes',
          selectedTemplate.estimated_duration_minutes,
        );
      }
      if (selectedTemplate.description) {
        const current = form.getValues('instructions');
        if (!current) {
          form.setValue('instructions', selectedTemplate.description);
        }
      }
    }
  }, [selectedTemplate, form]);

  async function onSubmit(values: ScheduleActivityInput) {
    if (!currentCompanyId) return;

    try {
      const result = await createManual({
        companyId: currentCompanyId,
        typeId: values.typeId as Id<'activity_types'>,
        templateId: values.templateId
          ? (values.templateId as Id<'activity_templates'>)
          : undefined,
        batchIds: values.batchIds as Id<'batches'>[],
        scheduledDate: new Date(values.scheduledDate).getTime(),
        estimatedDurationMinutes: values.estimatedDurationMinutes,
        assignedTo: values.assignedTo
          ? (values.assignedTo as Id<'users'>)
          : undefined,
        instructions: values.instructions || undefined,
        priority: values.priority,
      });

      const count = result.createdIds.length;
      toast.success(
        count === 1
          ? 'Actividad programada exitosamente'
          : `${count} actividades programadas exitosamente`,
      );
      form.reset();
      onOpenChange(false);
      onScheduled?.();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Error al programar actividad',
      );
    }
  }

  if (!currentCompanyId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarPlus className="h-5 w-5" />
            Programar Actividad
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          {/* Type */}
          <div className="space-y-2">
            <Label>Tipo de actividad *</Label>
            <ActivityTypePicker
              companyId={currentCompanyId}
              value={typeId ?? ''}
              onChange={(val) => {
                form.setValue('typeId', val);
                form.setValue('templateId', undefined); // reset template on type change
              }}
            />
            {form.formState.errors.typeId && (
              <p className="text-xs text-destructive">
                {form.formState.errors.typeId.message}
              </p>
            )}
          </div>

          {/* Template (optional, filtered by type) */}
          {templates && templates.length > 0 && (
            <div className="space-y-2">
              <Label>Template (opcional)</Label>
              <Select
                value={selectedTemplateId ?? ''}
                onValueChange={(val) =>
                  form.setValue('templateId', val || undefined)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin template</SelectItem>
                  {templates.map((t) => (
                    <SelectItem key={t._id} value={t._id as string}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Date */}
          <div className="space-y-2">
            <Label>Fecha programada *</Label>
            <Input type="date" {...form.register('scheduledDate')} />
            {form.formState.errors.scheduledDate && (
              <p className="text-xs text-destructive">
                {form.formState.errors.scheduledDate.message}
              </p>
            )}
          </div>

          {/* Batch selection */}
          <div className="space-y-2">
            <Label>Lotes *</Label>
            <BatchMultiSelect
              companyId={currentCompanyId}
              value={form.watch('batchIds')}
              onChange={(ids) => form.setValue('batchIds', ids)}
              facilityId={currentFacilityId ?? undefined}
              orderId={fromOrderId}
              areaId={fromAreaId}
              phase={fromPhase}
            />
            {form.formState.errors.batchIds && (
              <p className="text-xs text-destructive">
                {form.formState.errors.batchIds.message}
              </p>
            )}
          </div>

          {/* Assigned to */}
          <div className="space-y-2">
            <Label>Asignado a (opcional)</Label>
            <Select
              value={form.watch('assignedTo') ?? ''}
              onValueChange={(val) =>
                form.setValue('assignedTo', val || undefined)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sin asignar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sin asignar</SelectItem>
                {activeUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id as string}>
                    {[user.firstName, user.lastName].filter(Boolean).join(' ') ||
                      user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label>Prioridad</Label>
            <Select
              value={form.watch('priority')}
              onValueChange={(val) =>
                form.setValue(
                  'priority',
                  val as 'routine' | 'urgent' | 'critical',
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="routine">Rutina</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
                <SelectItem value="critical">Crítico</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <Label>Instrucciones (opcional)</Label>
            <Textarea
              {...form.register('instructions')}
              placeholder="Instrucciones especiales..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-amber-500 text-white hover:bg-amber-600"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CalendarPlus className="mr-2 h-4 w-4" />
              )}
              Programar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
