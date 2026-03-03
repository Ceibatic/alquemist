'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import type { UseFormReturn } from 'react-hook-form';
import type { ActivityExecutionInput } from '@/lib/validations/activity-execution';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  CalendarIcon,
  Package,
  MapPin,
  Layers,
  FileText,
  Clock,
  Thermometer,
  Droplets,
  FlaskConical,
  Zap,
  DollarSign,
} from 'lucide-react';
import { MeasurementFields } from './measurement-fields';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PHASE_LABELS: Record<string, string> = {
  germination: 'Germinacion',
  propagation: 'Propagacion',
  vegetative: 'Vegetativo',
  flowering: 'Floracion',
  harvest: 'Cosecha',
  drying: 'Secado',
  curing: 'Curado',
  post_harvest: 'Post-cosecha',
  processing: 'Procesamiento',
  storage: 'Almacenamiento',
};

const SOURCE_LABELS: Record<string, string> = {
  template: 'Desde template',
  manual: 'Manual',
  adhoc: 'Ad-hoc',
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReferenceParameter {
  metric: string;
  target?: number;
  min?: number;
  max?: number;
  unit: string;
}

interface ReportStepExecutionProps {
  form: UseFormReturn<ActivityExecutionInput>;
  visibleFields: string[];
  companyId: Id<'companies'>;
  /** Enriched scheduled activity from getById */
  activity: {
    activity_type: string;
    activityTypeName?: string | null;
    scheduled_date: number;
    estimated_duration_minutes?: number | null;
    batchCode?: string | null;
    batchId?: string | null;
    batchPhase?: string | null;
    areaName?: string | null;
    templateName?: string | null;
    template_id?: string | null;
    source?: string | null;
    instructions?: string | null;
    referenceParameters?: ReferenceParameter[] | null;
    measurementSchema?: Array<{
      key: string;
      label: string;
      type: 'number' | 'text' | 'select';
      unit?: string;
      step?: number;
      required?: boolean;
      options?: { value: string; label: string }[];
      group?: string;
    }> | null;
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function RangeHint({ metric, referenceParameters }: {
  metric: string;
  referenceParameters?: ReferenceParameter[] | null;
}) {
  if (!referenceParameters) return null;
  const param = referenceParameters.find(p => p.metric === metric);
  if (!param) return null;
  const parts: string[] = [];
  if (param.min !== undefined && param.max !== undefined) {
    parts.push(`Rango: ${param.min}–${param.max} ${param.unit}`);
  }
  if (param.target !== undefined) {
    parts.push(`ideal: ${param.target}`);
  }
  if (parts.length === 0) return null;
  return (
    <p className="text-[10px] text-muted-foreground mt-0.5">{parts.join(' (') + (parts.length > 1 ? ')' : '')}</p>
  );
}

export function ReportStepExecution({
  form,
  visibleFields,
  companyId,
  activity,
}: ReportStepExecutionProps) {
  const fields = new Set(visibleFields);

  // Load users for responsible dropdown
  const companyUsers = useQuery(api.users.getUsersByCompany, { companyId });
  const activeUsers = companyUsers?.filter((u) => u.status === 'active') ?? [];

  // Resolve measurement schema: snapshot > MEASUREMENT_SCHEMAS fallback
  const measurementSchema = activity.measurementSchema;

  return (
    <div className="space-y-6">
      {/* Context card — read-only */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Actividad programada</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <ContextItem
              icon={<FileText className="h-3.5 w-3.5" />}
              label="Tipo"
              value={
                <Badge variant="outline" className="text-xs">
                  {activity.activityTypeName ?? activity.activity_type}
                </Badge>
              }
            />
            <ContextItem
              icon={<CalendarIcon className="h-3.5 w-3.5" />}
              label="Fecha programada"
              value={format(new Date(activity.scheduled_date), 'd MMM yyyy', {
                locale: es,
              })}
            />
            {activity.estimated_duration_minutes && (
              <ContextItem
                icon={<Clock className="h-3.5 w-3.5" />}
                label="Duracion est."
                value={`${activity.estimated_duration_minutes} min`}
              />
            )}
            {activity.batchCode && (
              <ContextItem
                icon={<Package className="h-3.5 w-3.5" />}
                label="Lote"
                value={activity.batchCode}
              />
            )}
            {activity.areaName && (
              <ContextItem
                icon={<MapPin className="h-3.5 w-3.5" />}
                label="Area"
                value={activity.areaName}
              />
            )}
            {activity.batchPhase && (
              <ContextItem
                icon={<Layers className="h-3.5 w-3.5" />}
                label="Fase"
                value={
                  PHASE_LABELS[activity.batchPhase] ?? activity.batchPhase
                }
              />
            )}
            {activity.templateName && (
              <ContextItem
                icon={<FileText className="h-3.5 w-3.5" />}
                label="Template"
                value={activity.templateName}
              />
            )}
            {activity.source && (
              <ContextItem
                icon={<FileText className="h-3.5 w-3.5" />}
                label="Fuente"
                value={SOURCE_LABELS[activity.source] ?? activity.source}
              />
            )}
          </div>

          {activity.instructions && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Instrucciones
              </p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {activity.instructions}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Editable fields */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Datos de ejecucion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Date + Responsible */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha *</Label>
              <Input type="date" {...form.register('activityDate')} />
              {form.formState.errors.activityDate && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.activityDate.message}
                </p>
              )}
            </div>

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
                      {[user.firstName, user.lastName]
                        .filter(Boolean)
                        .join(' ') || user.email}
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

          {/* Duration */}
          {fields.has('duration_minutes') && (
            <div className="space-y-1">
              <Label className="flex items-center gap-1 text-xs">
                <Clock className="h-3 w-3" /> Duracion (minutos)
              </Label>
              <Input
                type="number"
                min={0}
                {...form.register('durationMinutes', { valueAsNumber: true })}
                placeholder="--"
              />
            </div>
          )}

          {/* Observations */}
          {fields.has('observations') && (
            <div className="space-y-2">
              <Label>Observaciones</Label>
              <Textarea
                {...form.register('observations')}
                placeholder="Notas y observaciones..."
                rows={3}
              />
            </div>
          )}

          {/* Environmental */}
          {(fields.has('environmental_temp') ||
            fields.has('environmental_humidity') ||
            fields.has('environmental_ph') ||
            fields.has('environmental_ec')) && (
            <div className="space-y-3 pt-2 border-t">
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
                    <RangeHint metric="temperature" referenceParameters={activity.referenceParameters} />
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
                      {...form.register('envHumidity', {
                        valueAsNumber: true,
                      })}
                      placeholder="--"
                    />
                    <RangeHint metric="humidity" referenceParameters={activity.referenceParameters} />
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
                    <RangeHint metric="ph" referenceParameters={activity.referenceParameters} />
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
                    <RangeHint metric="ec" referenceParameters={activity.referenceParameters} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Measurement fields (structured by activity type) */}
          {measurementSchema && measurementSchema.length > 0 && (
            <MeasurementFields
              schema={measurementSchema}
              form={form}
              referenceParameters={activity.referenceParameters}
            />
          )}

          {/* Cost */}
          {(fields.has('estimated_cost') || fields.has('actual_cost')) && (
            <div className="grid grid-cols-2 gap-3 pt-2 border-t">
              {fields.has('estimated_cost') && (
                <div className="space-y-1">
                  <Label className="flex items-center gap-1 text-xs">
                    <DollarSign className="h-3 w-3" /> Costo estimado
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    {...form.register('estimatedCost', {
                      valueAsNumber: true,
                    })}
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
                    {...form.register('actualCost', {
                      valueAsNumber: true,
                    })}
                    placeholder="--"
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function ContextItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-1.5">
      <span className="text-muted-foreground mt-0.5">{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <div className="text-sm font-medium truncate">{value}</div>
      </div>
    </div>
  );
}
