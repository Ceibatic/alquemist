'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import type { UseFormReturn } from 'react-hook-form';
import type { ActivityExecutionInput } from '@/lib/validations/activity-execution';
import type { ExecutionMode } from '@/hooks/use-activity-execution';
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
import { ActivityTypePicker } from './activity-type-picker';
import { ResourceEditorInline } from './resource-editor-inline';
import { BatchMultiSelect } from './batch-multi-select';
import {
  Thermometer,
  Droplets,
  FlaskConical,
  Zap,
  Clock,
  DollarSign,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ExecutionStepActivityProps {
  form: UseFormReturn<ActivityExecutionInput>;
  mode: ExecutionMode;
  visibleFields: string[];
  companyId: Id<'companies'>;
  facilityId?: Id<'facilities'>;
  /** Product names for resource display */
  productNames?: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ExecutionStepActivity({
  form,
  mode,
  visibleFields,
  companyId,
  facilityId,
  productNames,
}: ExecutionStepActivityProps) {
  const fields = new Set(visibleFields);

  // Load users for responsible dropdown
  const companyUsers = useQuery(api.users.getUsersByCompany, { companyId });
  const activeUsers = companyUsers?.filter((u) => u.status === 'active') ?? [];

  // Watch form values
  const typeId = form.watch('typeId');
  const batchIds = form.watch('batchIds') ?? [];
  const resources = form.watch('resources') ?? [];
  const resourceDistribution = form.watch('resourceDistribution');

  const isMultiBatch = batchIds.length > 1;

  return (
    <div className="space-y-6">
      {/* ── Activity Type (ad-hoc only) ─────────────────────────── */}
      {mode === 'adhoc' ? (
        <div className="space-y-2">
          <Label>Tipo de actividad *</Label>
          <ActivityTypePicker
            companyId={companyId}
            value={typeId ?? ''}
            onChange={(val) => form.setValue('typeId', val)}
          />
          {form.formState.errors.typeId && (
            <p className="text-xs text-destructive">
              {form.formState.errors.typeId.message}
            </p>
          )}
        </div>
      ) : typeId ? (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">
            Tipo de actividad
          </Label>
          <ActivityTypePicker
            companyId={companyId}
            value={typeId}
            onChange={() => {}}
            disabled
          />
        </div>
      ) : null}

      {/* ── Essential fields ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        {/* Date */}
        <div className="space-y-2">
          <Label>Fecha *</Label>
          <Input
            type="date"
            {...form.register('activityDate')}
          />
          {form.formState.errors.activityDate && (
            <p className="text-xs text-destructive">
              {form.formState.errors.activityDate.message}
            </p>
          )}
        </div>

        {/* Responsible */}
        <div className="space-y-2">
          <Label>Responsable *</Label>
          <Select
            value={form.watch('responsibleId')}
            onValueChange={(val) => form.setValue('responsibleId', val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              {activeUsers.map((user) => (
                <SelectItem key={user.id} value={user.id as string}>
                  {[user.firstName, user.lastName].filter(Boolean).join(' ') || user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.responsibleId && (
            <p className="text-xs text-destructive">
              {form.formState.errors.responsibleId.message}
            </p>
          )}
        </div>
      </div>

      {/* ── Batch selection ──────────────────────────────────────── */}
      <div className="space-y-2">
        <Label>
          Lotes
          {isMultiBatch && (
            <Badge variant="secondary" className="ml-2">
              {batchIds.length} seleccionados
            </Badge>
          )}
        </Label>
        <BatchMultiSelect
          companyId={companyId}
          value={batchIds}
          onChange={(ids) => form.setValue('batchIds', ids)}
          facilityId={facilityId}
          areaId={form.watch('areaId') as Id<'areas'> | undefined}
          phase={form.watch('phase')}
        />
      </div>

      {/* ── Multi-batch distribution ─────────────────────────────── */}
      {isMultiBatch && resources.length > 0 && (
        <div className="space-y-2">
          <Label>Distribución de recursos</Label>
          <Select
            value={resourceDistribution}
            onValueChange={(val) =>
              form.setValue(
                'resourceDistribution',
                val as 'identical' | 'split_proportional',
              )
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="identical">
                Idéntico por lote
              </SelectItem>
              <SelectItem value="split_proportional">
                Dividir proporcional
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {resourceDistribution === 'identical'
              ? 'Misma cantidad de cada recurso para cada lote'
              : 'La cantidad total se divide entre los lotes'}
          </p>
        </div>
      )}

      {/* ── Resources ────────────────────────────────────────────── */}
      {resources.length > 0 && (
        <>
          <Separator />
          <ResourceEditorInline
            resources={resources}
            onChange={(updated) => form.setValue('resources', updated)}
            productNames={productNames}
          />
        </>
      )}

      {/* ── Optional fields ──────────────────────────────────────── */}
      {fields.has('observations') && (
        <>
          <Separator />
          <div className="space-y-2">
            <Label>Observaciones</Label>
            <Textarea
              {...form.register('observations')}
              placeholder="Notas y observaciones..."
              rows={3}
            />
          </div>
        </>
      )}

      {/* Environmental */}
      {(fields.has('environmental_temp') ||
        fields.has('environmental_humidity') ||
        fields.has('environmental_ph') ||
        fields.has('environmental_ec')) && (
        <>
          <Separator />
          <div className="space-y-3">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Datos ambientales
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {fields.has('environmental_temp') && (
                <div className="space-y-1">
                  <Label className="flex items-center gap-1 text-xs">
                    <Thermometer className="h-3 w-3" /> Temperatura (°C)
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    {...form.register('envTemp', { valueAsNumber: true })}
                    placeholder="--"
                  />
                </div>
              )}
              {fields.has('environmental_humidity') && (
                <div className="space-y-1">
                  <Label className="flex items-center gap-1 text-xs">
                    <Droplets className="h-3 w-3" /> Humedad (%)
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    {...form.register('envHumidity', { valueAsNumber: true })}
                    placeholder="--"
                  />
                </div>
              )}
              {fields.has('environmental_ph') && (
                <div className="space-y-1">
                  <Label className="flex items-center gap-1 text-xs">
                    <FlaskConical className="h-3 w-3" /> pH
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...form.register('envPh', { valueAsNumber: true })}
                    placeholder="--"
                  />
                </div>
              )}
              {fields.has('environmental_ec') && (
                <div className="space-y-1">
                  <Label className="flex items-center gap-1 text-xs">
                    <Zap className="h-3 w-3" /> EC (mS/cm)
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...form.register('envEc', { valueAsNumber: true })}
                    placeholder="--"
                  />
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Duration */}
      {fields.has('duration_minutes') && (
        <div className="space-y-1">
          <Label className="flex items-center gap-1 text-xs">
            <Clock className="h-3 w-3" /> Duración (minutos)
          </Label>
          <Input
            type="number"
            min={0}
            {...form.register('durationMinutes', { valueAsNumber: true })}
            placeholder="--"
          />
        </div>
      )}

      {/* Cost */}
      {(fields.has('estimated_cost') || fields.has('actual_cost')) && (
        <div className="grid grid-cols-2 gap-3">
          {fields.has('estimated_cost') && (
            <div className="space-y-1">
              <Label className="flex items-center gap-1 text-xs">
                <DollarSign className="h-3 w-3" /> Costo estimado
              </Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                {...form.register('estimatedCost', { valueAsNumber: true })}
                placeholder="--"
              />
            </div>
          )}
          {fields.has('actual_cost') && (
            <div className="space-y-1">
              <Label className="flex items-center gap-1 text-xs">
                <DollarSign className="h-3 w-3" /> Costo real
              </Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                {...form.register('actualCost', { valueAsNumber: true })}
                placeholder="--"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
