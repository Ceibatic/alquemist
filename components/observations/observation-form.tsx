'use client';

import { useState, useMemo } from 'react';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Plus, ChevronDown, Loader2, Search, Check, ChevronsUpDown, X } from 'lucide-react';
import { ObservationCard, OBSERVATION_TYPE_CONFIG, SEVERITY_CONFIG } from './observation-card';
import { ObservationPhotoPicker } from '@/components/production/observation-photo-picker';

// ── Observation types that map to pest_diseases records ───────────────────────
const PEST_DISEASE_TYPES = new Set(['pest', 'disease', 'deficiency']);

// ── Schema ───────────────────────────────────────────────────────────────────

const observationSchema = z.object({
  observationType: z.string().min(1, 'Tipo requerido'),
  severity: z.string().optional(),
  organismId: z.string().optional(),
  organismName: z.string().optional(),
  affectedAreaPct: z.number().min(0).max(100).optional(),
  affectedPlantCount: z.number().min(0).optional(),
  incidenceCount: z.number().min(0).optional(),
  sampleSize: z.number().min(0).optional(),
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
  const [attachmentIds, setAttachmentIds] = useState<string[]>([]);

  // Organism combobox state
  const [organismOpen, setOrganismOpen] = useState(false);
  const [organismSearch, setOrganismSearch] = useState('');

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

  // Extract all watched values once to avoid duplicate subscriptions
  const observationType = form.watch('observationType');
  const severity = form.watch('severity');
  const organismId = form.watch('organismId');
  const organismName = form.watch('organismName');
  const affectedAreaPct = form.watch('affectedAreaPct');
  const plantPart = form.watch('plantPart');

  // Derive pest_diseases type from selected observation type
  const pestDiseaseType = PEST_DISEASE_TYPES.has(observationType)
    ? observationType
    : undefined;

  // Only query when a relevant observation type is selected
  const pestDiseases = useQuery(
    api.pestDiseases.listByType,
    pestDiseaseType ? { type: pestDiseaseType } : 'skip'
  );

  // Filter by search query
  const filteredPestDiseases = useMemo(() => {
    if (!pestDiseases) return [];
    if (!organismSearch) return pestDiseases;
    const q = organismSearch.toLowerCase();
    return pestDiseases.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.scientific_name.toLowerCase().includes(q)
    );
  }, [pestDiseases, organismSearch]);

  // Handle organism selection from combobox
  const handleOrganismSelect = (id: string, name: string) => {
    form.setValue('organismId', id);
    form.setValue('organismName', name);
    setOrganismSearch('');
    setOrganismOpen(false);
  };

  // Clear organism selection
  const handleOrganismClear = () => {
    form.setValue('organismId', undefined);
    form.setValue('organismName', undefined);
    setOrganismSearch('');
  };

  // When observation type changes, clear organism fields to avoid stale data
  const handleObservationTypeChange = (val: string) => {
    form.setValue('observationType', val);
    form.setValue('organismId', undefined);
    form.setValue('organismName', undefined);
    setOrganismSearch('');
  };

  const onSubmit = async (values: ObservationFormValues) => {
    setIsSubmitting(true);
    try {
      await createObservation({
        activityId,
        observationType: values.observationType,
        severity: values.severity || undefined,
        organismId: values.organismId
          ? (values.organismId as any)
          : undefined,
        organismName: values.organismName || undefined,
        affectedAreaPct: values.affectedAreaPct,
        affectedPlantCount: values.affectedPlantCount,
        incidenceCount: values.incidenceCount,
        sampleSize: values.sampleSize,
        plantPart: values.plantPart || undefined,
        description: values.description,
        recommendedAction: values.recommendedAction || undefined,
        followUpDate: values.followUpDate
          ? new Date(values.followUpDate).getTime()
          : undefined,
        attachmentIds: attachmentIds.length > 0 ? attachmentIds : undefined,
      });
      toast.success('Observación registrada');
      form.reset();
      setAttachmentIds([]);
      setOrganismSearch('');
      setOrganismOpen(false);
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
                  value={observationType}
                  onValueChange={handleObservationTypeChange}
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
                          severity === key
                            ? cfg.color + ' border-current font-medium'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() =>
                          form.setValue(
                            'severity',
                            severity === key ? undefined : key
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

            {/* Photos */}
            <div>
              <Label className="text-sm">Fotos</Label>
              <ObservationPhotoPicker
                attachmentIds={attachmentIds}
                onAttachmentsChange={setAttachmentIds}
              />
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
                  {pestDiseaseType ? (
                    // Combobox for types that have pest_diseases records
                    <div className="space-y-1">
                      <Popover open={organismOpen} onOpenChange={setOrganismOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            role="combobox"
                            aria-expanded={organismOpen}
                            className={cn(
                              'w-full justify-between font-normal',
                              !organismId && 'text-muted-foreground'
                            )}
                          >
                            <span className="truncate">
                              {organismName || 'Buscar organismo...'}
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                              {organismId && (
                                <span
                                  role="button"
                                  tabIndex={0}
                                  aria-label="Limpiar selección"
                                  className="rounded-sm p-0.5 hover:bg-gray-200 cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOrganismClear();
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.stopPropagation();
                                      handleOrganismClear();
                                    }
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </span>
                              )}
                              <ChevronsUpDown className="h-4 w-4 opacity-50" />
                            </div>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[320px] p-0" align="start">
                          {/* Search Input */}
                          <div className="flex items-center border-b px-3">
                            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                            <Input
                              placeholder="Buscar por nombre..."
                              value={organismSearch}
                              onChange={(e) => setOrganismSearch(e.target.value)}
                              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                          </div>
                          <ScrollArea className="h-[220px]">
                            {/* Free-text fallback option when searching */}
                            {organismSearch.trim() !== '' && (
                              <div
                                className="flex cursor-pointer items-center gap-2 border-b px-3 py-2 hover:bg-amber-50"
                                onClick={() => {
                                  form.setValue('organismId', undefined);
                                  form.setValue('organismName', organismSearch.trim());
                                  setOrganismSearch('');
                                  setOrganismOpen(false);
                                }}
                              >
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100">
                                  <Plus className="h-3.5 w-3.5 text-amber-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-amber-700">
                                    Usar &ldquo;{organismSearch.trim()}&rdquo;
                                  </p>
                                  <p className="text-xs text-gray-500">Texto libre</p>
                                </div>
                              </div>
                            )}

                            {/* Pest/disease list */}
                            {filteredPestDiseases.length === 0 && !pestDiseases ? (
                              <div className="py-6 text-center text-sm text-gray-500">
                                Cargando...
                              </div>
                            ) : filteredPestDiseases.length === 0 ? (
                              <div className="py-6 text-center text-sm text-gray-500">
                                {organismSearch
                                  ? 'No se encontraron organismos'
                                  : 'No hay organismos disponibles'}
                              </div>
                            ) : (
                              filteredPestDiseases.map((pd) => {
                                const isSelected = organismId === pd._id;
                                return (
                                  <div
                                    key={pd._id}
                                    className={cn(
                                      'flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-gray-50',
                                      isSelected && 'bg-blue-50'
                                    )}
                                    onClick={() =>
                                      handleOrganismSelect(pd._id, pd.name)
                                    }
                                  >
                                    <div className="flex-1 overflow-hidden">
                                      <p
                                        className={cn(
                                          'text-sm font-medium truncate',
                                          isSelected && 'text-blue-700'
                                        )}
                                      >
                                        {pd.name}
                                      </p>
                                      <p className="text-xs text-gray-500 truncate italic">
                                        {pd.scientific_name}
                                      </p>
                                    </div>
                                    {isSelected && (
                                      <Check className="h-4 w-4 shrink-0 text-blue-600" />
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </ScrollArea>
                        </PopoverContent>
                      </Popover>
                      {/* Show linked organism hint */}
                      {organismId && (
                        <p className="text-xs text-blue-600">
                          Vinculado al catálogo
                        </p>
                      )}
                      {organismName && !organismId && (
                        <p className="text-xs text-gray-500">
                          Texto libre (no vinculado al catálogo)
                        </p>
                      )}
                    </div>
                  ) : (
                    // Plain text input for observation types without pest_diseases
                    <Input
                      {...form.register('organismName')}
                      placeholder="Nombre del organismo (ej: Trips, Botrytis)"
                    />
                  )}
                </div>

                {/* Affected area slider */}
                <div>
                  <Label className="text-sm">
                    Área afectada: {affectedAreaPct ?? 0}%
                  </Label>
                  <Slider
                    min={0}
                    max={100}
                    step={5}
                    value={[affectedAreaPct ?? 0]}
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
                      value={plantPart ?? ''}
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

                {/* Incidence / Sample size */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm">Incidencia (plantas con síntomas)</Label>
                    <Input
                      type="number"
                      min={0}
                      {...form.register('incidenceCount', {
                        valueAsNumber: true,
                      })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Tamaño de muestra</Label>
                    <Input
                      type="number"
                      min={0}
                      {...form.register('sampleSize', {
                        valueAsNumber: true,
                      })}
                      placeholder="0"
                    />
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
                  setAttachmentIds([]);
                  setOrganismSearch('');
                  setOrganismOpen(false);
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
