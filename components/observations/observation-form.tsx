'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id, Doc } from '@/convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { toast } from 'sonner';
import { Plus, ChevronDown, Loader2, Trash2 } from 'lucide-react';
import { ObservationCard, OBSERVATION_TYPE_CONFIG, SEVERITY_CONFIG } from './observation-card';

// ── Schema ───────────────────────────────────────────────────────────────────

const observationSchema = z.object({
  observationType: z.string().min(1, 'Tipo requerido'),
  severity: z.string().optional(),
  organismId: z.string().optional(),
  organismName: z.string().optional(),
  affectedAreaPct: z.number().min(0).max(100).optional(),
  affectedPlantCount: z.number().min(0).optional(),
  plantPart: z.string().optional(),
  description: z.string().min(1, 'Descripción requerida'),
  recommendedAction: z.string().optional(),
  followUpDate: z.string().optional(), // ISO date string from input
});

type ObservationFormValues = z.infer<typeof observationSchema>;

// ── Component ────────────────────────────────────────────────────────────────

interface ObservationFormProps {
  activityId: Id<'activities'>;
  companyId: Id<'companies'>;
}

export function ObservationForm({ activityId }: ObservationFormProps) {
  const [showForm, setShowForm] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const observations = useQuery(api.activityObservations.listByActivity, { activityId });
  const createObservation = useMutation(api.activityObservations.create);
  const resolveObservation = useMutation(api.activityObservations.resolve);
  const reopenObservation = useMutation(api.activityObservations.reopen);

  const form = useForm<ObservationFormValues>({
    resolver: zodResolver(observationSchema),
    defaultValues: {
      observationType: '',
      severity: undefined,
      description: '',
    },
  });

  const onSubmit = async (values: ObservationFormValues) => {
    setIsSubmitting(true);
    try {
      await createObservation({
        activityId,
        observationType: values.observationType,
        severity: values.severity || undefined,
        organismName: values.organismName || undefined,
        affectedAreaPct: values.affectedAreaPct,
        affectedPlantCount: values.affectedPlantCount,
        plantPart: values.plantPart || undefined,
        description: values.description,
        recommendedAction: values.recommendedAction || undefined,
        followUpDate: values.followUpDate
          ? new Date(values.followUpDate).getTime()
          : undefined,
      });
      toast.success('Observación registrada');
      form.reset();
      setShowForm(false);
      setShowAdvanced(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Error al registrar observación'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolve = async (observationId: Id<'activity_observations'>) => {
    try {
      await resolveObservation({ observationId });
      toast.success('Observación resuelta');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Error al resolver'
      );
    }
  };

  const handleReopen = async (observationId: Id<'activity_observations'>) => {
    try {
      await reopenObservation({ observationId });
      toast.success('Observación reabierta');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Error al reabrir'
      );
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">Observaciones</h4>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Agregar observación
        </Button>
      </div>

      {/* Existing observations */}
      {observations && observations.length > 0 && (
        <div className="space-y-2">
          {observations.map((obs) => (
            <ObservationCard
              key={obs._id}
              observation={obs}
              onResolve={handleResolve}
              onReopen={handleReopen}
            />
          ))}
        </div>
      )}

      {/* New observation form */}
      {showForm && (
        <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Row 1: Type + Severity */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="observationType" className="text-sm">
                  Tipo de observación *
                </Label>
                <Select
                  value={form.watch('observationType')}
                  onValueChange={(val) => form.setValue('observationType', val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(OBSERVATION_TYPE_CONFIG).map(([key, cfg]) => {
                      const TypeIcon = cfg.icon;
                      return (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <TypeIcon className="h-4 w-4" />
                            {cfg.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {form.formState.errors.observationType && (
                  <p className="text-xs text-red-500 mt-1">
                    {form.formState.errors.observationType.message}
                  </p>
                )}
              </div>

              <div>
                <Label className="text-sm">Severidad</Label>
                <div className="flex gap-1 mt-1.5">
                  {Object.entries(SEVERITY_CONFIG)
                    .filter(([k]) => k !== 'none')
                    .map(([key, cfg]) => (
                      <button
                        key={key}
                        type="button"
                        className={`flex-1 px-2 py-1.5 text-xs rounded border transition-colors ${
                          form.watch('severity') === key
                            ? cfg.color + ' border-current font-medium'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() =>
                          form.setValue(
                            'severity',
                            form.watch('severity') === key ? undefined : key
                          )
                        }
                      >
                        {cfg.label}
                      </button>
                    ))}
                </div>
              </div>
            </div>

            {/* Row 2: Description */}
            <div>
              <Label htmlFor="description" className="text-sm">
                Descripción *
              </Label>
              <Textarea
                {...form.register('description')}
                placeholder="Describe el hallazgo..."
                rows={2}
              />
              {form.formState.errors.description && (
                <p className="text-xs text-red-500 mt-1">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            {/* Advanced fields (collapsible) */}
            <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
              <CollapsibleTrigger asChild>
                <Button type="button" variant="ghost" size="sm" className="text-gray-500">
                  <ChevronDown
                    className={`h-4 w-4 mr-1 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                  />
                  Campos adicionales
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 mt-2">
                {/* Organism name */}
                <div>
                  <Label className="text-sm">Organismo</Label>
                  <Input
                    {...form.register('organismName')}
                    placeholder="Nombre del organismo (ej: Trips, Botrytis)"
                  />
                </div>

                {/* Affected area slider */}
                <div>
                  <Label className="text-sm">
                    Área afectada: {form.watch('affectedAreaPct') ?? 0}%
                  </Label>
                  <Slider
                    min={0}
                    max={100}
                    step={5}
                    value={[form.watch('affectedAreaPct') ?? 0]}
                    onValueChange={([val]) =>
                      form.setValue('affectedAreaPct', val)
                    }
                    className="mt-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Affected plant count */}
                  <div>
                    <Label className="text-sm">Plantas afectadas</Label>
                    <Input
                      type="number"
                      min={0}
                      {...form.register('affectedPlantCount', {
                        valueAsNumber: true,
                      })}
                      placeholder="0"
                    />
                  </div>

                  {/* Plant part */}
                  <div>
                    <Label className="text-sm">Parte de planta</Label>
                    <Select
                      value={form.watch('plantPart') ?? ''}
                      onValueChange={(val) => form.setValue('plantPart', val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="root">Raíz</SelectItem>
                        <SelectItem value="stem">Tallo</SelectItem>
                        <SelectItem value="leaf">Hoja</SelectItem>
                        <SelectItem value="flower">Flor</SelectItem>
                        <SelectItem value="fruit">Fruto</SelectItem>
                        <SelectItem value="whole">Planta completa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Recommended action */}
                <div>
                  <Label className="text-sm">Acción recomendada</Label>
                  <Textarea
                    {...form.register('recommendedAction')}
                    placeholder="Describe la acción recomendada..."
                    rows={2}
                  />
                </div>

                {/* Follow-up date */}
                <div>
                  <Label className="text-sm">Fecha de seguimiento</Label>
                  <Input type="date" {...form.register('followUpDate')} />
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowForm(false);
                  form.reset();
                  setShowAdvanced(false);
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-amber-500 hover:bg-amber-600"
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                Guardar observación
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
