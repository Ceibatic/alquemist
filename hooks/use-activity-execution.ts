'use client';

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { toast } from 'sonner';
import {
  activityExecutionSchema,
  type ActivityExecutionInput,
} from '@/lib/validations/activity-execution';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ExecutionMode = 'template' | 'scheduled' | 'multi_batch' | 'adhoc';

export interface UseActivityExecutionOptions {
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
// Hook
// ---------------------------------------------------------------------------

export function useActivityExecution(options: UseActivityExecutionOptions) {
  const {
    templateId,
    scheduledActivityId,
    groupId,
    entityType,
    entityId,
    areaId,
    batchIds: propBatchIds,
    phase,
    onCompleted,
  } = options;

  // ── Resolve mode ─────────────────────────────────────────────────
  const mode: ExecutionMode = groupId
    ? 'multi_batch'
    : scheduledActivityId
      ? 'scheduled'
      : templateId
        ? 'template'
        : 'adhoc';

  // ── Data queries ─────────────────────────────────────────────────
  const template = useQuery(
    api.activityTemplates.getById,
    templateId ? { templateId } : 'skip',
  );

  const scheduledActivity = useQuery(
    api.scheduledActivities.listByEntity,
    scheduledActivityId
      ? // We query by entity to find the scheduled activity — but we already have its ID.
        // Use a dedicated getGroup or fetch via entity. For single, use a direct approach.
        'skip'
      : 'skip',
  );

  // For scheduled: we load it indirectly — the component should pass relevant info.
  // For group: load all group members
  const groupMembers = useQuery(
    api.scheduledActivities.getGroup,
    groupId ? { groupId } : 'skip',
  );

  const currentUser = useQuery(api.users.getCurrentUser, {});

  // If we have a scheduled activity ID, we need to load the template from it.
  // The scheduled_activities table has template_id. The parent component should
  // resolve this and pass templateId if available.

  // ── Form ─────────────────────────────────────────────────────────
  const today = new Date().toISOString().slice(0, 10);

  const form = useForm<ActivityExecutionInput>({
    resolver: zodResolver(activityExecutionSchema),
    defaultValues: {
      activityDate: today,
      responsibleId: '',
      typeId: '',
      batchIds: propBatchIds ?? [],
      areaId: areaId ? (areaId as string) : undefined,
      phase: phase ?? '',
      observations: '',
      durationMinutes: undefined,
      envTemp: undefined,
      envHumidity: undefined,
      envPh: undefined,
      envEc: undefined,
      estimatedCost: undefined,
      actualCost: undefined,
      resources: [],
      resourceDistribution: 'identical',
    },
  });

  // ── Pre-fill from currentUser ────────────────────────────────────
  useEffect(() => {
    if (currentUser?.userId && !form.getValues('responsibleId')) {
      form.setValue('responsibleId', currentUser.userId as string);
    }
  }, [currentUser, form]);

  // ── Pre-fill from template ───────────────────────────────────────
  useEffect(() => {
    if (template) {
      // Set type from template
      if (template.type_id) {
        form.setValue('typeId', template.type_id as string);
      }

      // Pre-fill duration
      if (template.estimated_duration_minutes) {
        const current = form.getValues('durationMinutes');
        if (!current) {
          form.setValue('durationMinutes', template.estimated_duration_minutes);
        }
      }

      // Pre-fill resources from template
      if (template.resources && template.resources.length > 0) {
        const currentResources = form.getValues('resources');
        if (!currentResources || currentResources.length === 0) {
          form.setValue(
            'resources',
            template.resources.map((r) => ({
              productId: r.product_id as string,
              direction: r.direction,
              quantity: r.quantity,
              quantityUnit: r.quantity_basis ?? '',
              unitId: r.unit_id as string | undefined,
              applicationRate: r.application_rate ?? undefined,
              applicationMethod: r.application_method ?? undefined,
            })),
          );
        }
      }
    }
  }, [template, form]);

  // ── Pre-fill from props ──────────────────────────────────────────
  useEffect(() => {
    if (propBatchIds && propBatchIds.length > 0) {
      form.setValue('batchIds', propBatchIds);
    }
  }, [propBatchIds, form]);

  useEffect(() => {
    if (areaId) {
      form.setValue('areaId', areaId as string);
    }
  }, [areaId, form]);

  useEffect(() => {
    if (phase) {
      form.setValue('phase', phase);
    }
  }, [phase, form]);

  // ── Pre-fill from group ──────────────────────────────────────────
  useEffect(() => {
    if (groupMembers && groupMembers.length > 0) {
      const ids = groupMembers
        .filter((m) => m.entity_type === 'batch')
        .map((m) => m.entity_id);
      form.setValue('batchIds', ids);

      // Set type from first member
      const firstType = groupMembers[0]?.type_id;
      if (firstType && !form.getValues('typeId')) {
        form.setValue('typeId', firstType as string);
      }
    }
  }, [groupMembers, form]);

  // ── Visible fields ───────────────────────────────────────────────
  const visibleFields = useMemo(() => {
    if (mode === 'adhoc') {
      // Ad-hoc: all optional fields visible
      return [
        'observations',
        'environmental_temp',
        'environmental_humidity',
        'environmental_ph',
        'environmental_ec',
        'duration_minutes',
        'estimated_cost',
        'actual_cost',
      ];
    }

    // Template/scheduled: use template's form_fields or show all
    return template?.form_fields ?? [
      'observations',
      'environmental_temp',
      'environmental_humidity',
      'environmental_ph',
      'environmental_ec',
      'duration_minutes',
      'estimated_cost',
      'actual_cost',
    ];
  }, [mode, template?.form_fields]);

  // ── Submit ───────────────────────────────────────────────────────
  const executeActivity = useMutation(api.activities.executeActivity);

  async function handleSubmit(values: ActivityExecutionInput) {
    try {
      const result = await executeActivity({
        scheduledActivityId: scheduledActivityId,
        groupId: groupId,
        typeId: values.typeId
          ? (values.typeId as Id<'activity_types'>)
          : undefined,
        batchIds:
          values.batchIds && values.batchIds.length > 0
            ? (values.batchIds as Id<'batches'>[])
            : undefined,
        entityType: entityType,
        entityId: entityId,
        performedBy: values.responsibleId as Id<'users'>,
        cropPhase: values.phase || undefined,
        observations: values.observations || undefined,
        durationMinutes: values.durationMinutes,
        priority: undefined,
        envTemp: values.envTemp,
        envHumidity: values.envHumidity,
        envPh: values.envPh,
        envEc: values.envEc,
        resources: values.resources?.map((r) => ({
          product_id: r.productId as Id<'products'>,
          direction: r.direction,
          quantity: r.quantity,
          quantity_unit: r.quantityUnit,
          unit_id: r.unitId ? (r.unitId as Id<'units_of_measure'>) : undefined,
          inventory_item_id: r.inventoryItemId
            ? (r.inventoryItemId as Id<'inventory_items'>)
            : undefined,
          application_rate: r.applicationRate,
          application_method: r.applicationMethod,
          notes: r.notes,
        })),
        consumeInventory: true,
        resourceDistribution: values.resourceDistribution,
      });

      toast.success('Actividad completada exitosamente');
      form.reset();
      onCompleted?.();
      return result;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error al ejecutar actividad';
      toast.error(message);
      throw error;
    }
  }

  return {
    form,
    mode,
    template,
    groupMembers,
    currentUser,
    visibleFields,
    handleSubmit: form.handleSubmit(handleSubmit),
    isSubmitting: form.formState.isSubmitting,
  };
}
