'use client';

import { use, useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { PageHeader } from '@/components/layout/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFacility } from '@/components/providers/facility-provider';
import { ResourceEditor } from '@/components/activity-templates/resource-editor';
import { ChecklistEditor } from '@/components/activity-templates/checklist-editor';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Save,
  ArrowLeft,
  Loader2,
} from 'lucide-react';

const PHASES = [
  { value: 'propagation', label: 'Propagacion' },
  { value: 'vegetative', label: 'Vegetativo' },
  { value: 'flowering', label: 'Floracion' },
  { value: 'harvest', label: 'Cosecha' },
  { value: 'drying', label: 'Secado' },
  { value: 'curing', label: 'Curado' },
  { value: 'post_harvest', label: 'Poscosecha' },
  { value: 'processing', label: 'Procesamiento' },
  { value: 'storage', label: 'Almacenamiento' },
];

const FREQUENCY_OPTIONS = [
  { value: 'once', label: 'Una vez' },
  { value: 'daily', label: 'Diario' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'biweekly', label: 'Bisemanal' },
  { value: 'monthly', label: 'Mensual' },
  { value: 'on_demand', label: 'A demanda' },
  { value: 'custom_days', label: 'Custom (cada N dias)' },
];

const PRIORITY_OPTIONS = [
  { value: 'routine', label: 'Rutinaria' },
  { value: 'urgent', label: 'Urgente' },
  { value: 'critical', label: 'Critica' },
];

export default function ActivityTemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { currentCompanyId } = useFacility();
  const isNew = id === 'new';

  // Form state
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [typeId, setTypeId] = useState<string>('');
  const [applicablePhases, setApplicablePhases] = useState<string[]>([]);
  const [phaseDayStart, setPhaseDayStart] = useState<string>('');
  const [phaseDayEnd, setPhaseDayEnd] = useState<string>('');
  const [estimatedDuration, setEstimatedDuration] = useState<string>('');
  const [laborHours, setLaborHours] = useState<string>('');
  const [frequencyType, setFrequencyType] = useState('once');
  const [frequencyInterval, setFrequencyInterval] = useState<string>('');
  const [repeatCount, setRepeatCount] = useState<string>('');
  const [defaultPriority, setDefaultPriority] = useState('routine');
  const [requiresVerification, setRequiresVerification] = useState(false);
  const [regulatoryReference, setRegulatoryReference] = useState('');
  const [dependsOnTemplateId, setDependsOnTemplateId] = useState<string>('');
  const [minDaysAfter, setMinDaysAfter] = useState<string>('');
  const [cropTypeIds, setCropTypeIds] = useState<string[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Queries
  const template = useQuery(
    api.activityTemplates.getById,
    !isNew ? { templateId: id as Id<'activity_templates'> } : 'skip' as any
  );

  const activityTypes = useQuery(
    api.activityTypes.list,
    currentCompanyId ? { companyId: currentCompanyId, status: 'active' } : 'skip' as any
  );

  const cropTypes = useQuery(api.crops.getCropTypes, {});

  const allTemplates = useQuery(
    api.activityTemplates.list,
    currentCompanyId ? { companyId: currentCompanyId, isActive: true } : 'skip' as any
  );

  // Mutations
  const createMutation = useMutation(api.activityTemplates.create);
  const updateMutation = useMutation(api.activityTemplates.update);

  // Load template data into form when edit mode
  useEffect(() => {
    if (template && !loaded) {
      setName(template.name);
      setCode(template.code ?? '');
      setDescription(template.description ?? '');
      setTypeId(template.type_id);
      setApplicablePhases(template.applicable_phases);
      setPhaseDayStart(template.phase_day_start?.toString() ?? '');
      setPhaseDayEnd(template.phase_day_end?.toString() ?? '');
      setEstimatedDuration(template.estimated_duration_minutes?.toString() ?? '');
      setLaborHours(template.labor_hours_per_1000_plants?.toString() ?? '');
      setFrequencyType(template.frequency_type);
      setFrequencyInterval(template.frequency_interval_days?.toString() ?? '');
      setRepeatCount(template.repeat_count?.toString() ?? '');
      setDefaultPriority(template.default_priority ?? 'routine');
      setRequiresVerification(template.requires_verification);
      setRegulatoryReference(template.regulatory_reference ?? '');
      setDependsOnTemplateId(template.depends_on_template_id ?? '');
      setMinDaysAfter(template.min_days_after_dependency?.toString() ?? '');
      setCropTypeIds((template.crop_type_ids ?? []) as string[]);
      setLoaded(true);
    }
  }, [template, loaded]);

  // Auto-generate code from name (create only)
  useEffect(() => {
    if (isNew && name && !code) {
      const generated = name
        .toUpperCase()
        .replace(/[^A-Z0-9\s]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .substring(0, 20);
      setCode(generated);
    }
  }, [isNew, name, code]);

  const togglePhase = (phase: string) => {
    setApplicablePhases((prev) =>
      prev.includes(phase) ? prev.filter((p) => p !== phase) : [...prev, phase]
    );
  };

  const toggleCropType = (ctId: string) => {
    setCropTypeIds((prev) =>
      prev.includes(ctId) ? prev.filter((c) => c !== ctId) : [...prev, ctId]
    );
  };

  const handleSave = async () => {
    if (!currentCompanyId) return;
    if (!name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }
    if (!typeId) {
      toast.error('Selecciona un tipo de actividad');
      return;
    }
    if (applicablePhases.length === 0) {
      toast.error('Selecciona al menos una fase');
      return;
    }

    try {
      setIsSaving(true);

      const baseArgs = {
        name: name.trim(),
        code: code.trim() || undefined,
        description: description.trim() || undefined,
        typeId: typeId as Id<'activity_types'>,
        applicablePhases,
        cropTypeIds: cropTypeIds.length > 0
          ? cropTypeIds as Id<'crop_types'>[]
          : undefined,
        phaseDayStart: phaseDayStart ? Number(phaseDayStart) : undefined,
        phaseDayEnd: phaseDayEnd ? Number(phaseDayEnd) : undefined,
        estimatedDurationMinutes: estimatedDuration ? Number(estimatedDuration) : undefined,
        laborHoursPer1000Plants: laborHours ? Number(laborHours) : undefined,
        frequencyType,
        frequencyIntervalDays: frequencyInterval ? Number(frequencyInterval) : undefined,
        repeatCount: repeatCount ? Number(repeatCount) : undefined,
        defaultPriority,
        requiresVerification,
        regulatoryReference: regulatoryReference.trim() || undefined,
        dependsOnTemplateId: dependsOnTemplateId
          ? (dependsOnTemplateId as Id<'activity_templates'>)
          : undefined,
        minDaysAfterDependency: minDaysAfter ? Number(minDaysAfter) : undefined,
      };

      if (isNew) {
        const newId = await createMutation({
          ...baseArgs,
          companyId: currentCompanyId,
        });
        toast.success('Template creado');
        router.push(`/activity-templates/${newId}`);
      } else {
        await updateMutation({
          templateId: id as Id<'activity_templates'>,
          ...baseArgs,
        });
        toast.success('Template actualizado');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  // Loading
  if (!isNew && template === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!isNew && template === null) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <h2 className="text-lg font-semibold">Template no encontrado</h2>
        <Button variant="link" onClick={() => router.push('/activity-templates')}>
          Volver a templates
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isNew ? 'Crear Template' : `Editar: ${template?.name ?? ''}`}
        icon={FileText}
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Templates de Actividad', href: '/activity-templates' },
          { label: isNew ? 'Nuevo' : (template?.name ?? '') },
        ]}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/activity-templates')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isSaving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main form — 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informacion basica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Fertirrigacion Vegetativa S1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Codigo</Label>
                  <Input
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Ej: FERT-VEG-S1"
                    className="font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo de actividad *</Label>
                <Select value={typeId} onValueChange={setTypeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {activityTypes?.map((at) => (
                      <SelectItem key={at._id} value={at._id}>
                        {at.name} ({at.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripcion / Instrucciones</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Instrucciones detalladas para el operador..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Prioridad por defecto</Label>
                <Select value={defaultPriority} onValueChange={setDefaultPriority}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Applicability */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Aplicabilidad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Phases */}
              <div className="space-y-2">
                <Label>Fases aplicables *</Label>
                <div className="flex flex-wrap gap-2">
                  {PHASES.map((phase) => (
                    <Badge
                      key={phase.value}
                      variant={applicablePhases.includes(phase.value) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => togglePhase(phase.value)}
                    >
                      {phase.label}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Crop types */}
              {cropTypes && cropTypes.length > 0 && (
                <div className="space-y-2">
                  <Label>Tipos de cultivo (opcional)</Label>
                  <div className="flex flex-wrap gap-2">
                    {cropTypes.map((ct) => (
                      <Badge
                        key={ct._id}
                        variant={cropTypeIds.includes(ct._id) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleCropType(ct._id)}
                      >
                        {ct.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Day range */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dayStart">Dia inicio de fase</Label>
                  <Input
                    id="dayStart"
                    type="number"
                    value={phaseDayStart}
                    onChange={(e) => setPhaseDayStart(e.target.value)}
                    placeholder="Ej: 1"
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dayEnd">Dia fin de fase</Label>
                  <Input
                    id="dayEnd"
                    type="number"
                    value={phaseDayEnd}
                    onChange={(e) => setPhaseDayEnd(e.target.value)}
                    placeholder="Ej: 14"
                    min={0}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time + Frequency */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tiempo y Recurrencia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duracion estimada (min)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={estimatedDuration}
                    onChange={(e) => setEstimatedDuration(e.target.value)}
                    placeholder="Ej: 30"
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="labor">Horas labor / 1000 plantas</Label>
                  <Input
                    id="labor"
                    type="number"
                    step="0.1"
                    value={laborHours}
                    onChange={(e) => setLaborHours(e.target.value)}
                    placeholder="Ej: 2.5"
                    min={0}
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Frecuencia</Label>
                  <Select value={frequencyType} onValueChange={setFrequencyType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FREQUENCY_OPTIONS.map((f) => (
                        <SelectItem key={f.value} value={f.value}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {frequencyType === 'custom_days' && (
                  <div className="space-y-2">
                    <Label htmlFor="interval">Cada N dias</Label>
                    <Input
                      id="interval"
                      type="number"
                      value={frequencyInterval}
                      onChange={(e) => setFrequencyInterval(e.target.value)}
                      placeholder="Ej: 3"
                      min={1}
                    />
                  </div>
                )}
              </div>

              {frequencyType !== 'once' && frequencyType !== 'on_demand' && (
                <div className="space-y-2">
                  <Label htmlFor="repeatCount">Repeticiones (vacio = hasta fin de fase)</Label>
                  <Input
                    id="repeatCount"
                    type="number"
                    value={repeatCount}
                    onChange={(e) => setRepeatCount(e.target.value)}
                    placeholder="Dejar vacio para repetir toda la fase"
                    min={1}
                    className="w-[300px]"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resources section — only for editing existing templates */}
          {!isNew && (
            <ResourceEditor templateId={id as Id<'activity_templates'>} />
          )}

          {/* Checklist section — only for editing existing templates */}
          {!isNew && (
            <ChecklistEditor templateId={id as Id<'activity_templates'>} />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Conditions & Dependencies */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Condiciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Depende de template</Label>
                <Select
                  value={dependsOnTemplateId || 'none'}
                  onValueChange={(v) => setDependsOnTemplateId(v === 'none' ? '' : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Ninguna" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguna dependencia</SelectItem>
                    {allTemplates
                      ?.filter((t) => t._id !== id)
                      .map((t) => (
                        <SelectItem key={t._id} value={t._id}>
                          {t.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {dependsOnTemplateId && (
                <div className="space-y-2">
                  <Label htmlFor="minDays">Dias min. despues de dependencia</Label>
                  <Input
                    id="minDays"
                    type="number"
                    value={minDaysAfter}
                    onChange={(e) => setMinDaysAfter(e.target.value)}
                    placeholder="Ej: 7"
                    min={0}
                  />
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="regulatory">Referencia regulatoria</Label>
                <Input
                  id="regulatory"
                  value={regulatoryReference}
                  onChange={(e) => setRegulatoryReference(e.target.value)}
                  placeholder="Ej: SOP-CUL-014"
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="verification"
                  checked={requiresVerification}
                  onCheckedChange={setRequiresVerification}
                />
                <Label htmlFor="verification" className="cursor-pointer">
                  Requiere verificacion de supervisor
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Template info (edit mode) */}
          {!isNew && template && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Informacion</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Version</span>
                  <span>{template.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estado</span>
                  <Badge variant={template.is_active ? 'default' : 'secondary'}>
                    {template.is_active ? 'Activo' : 'Archivado'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Recursos</span>
                  <span>{template.resourceCount ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Checklist</span>
                  <span>{template.checklistCount ?? 0} pasos</span>
                </div>
              </CardContent>
            </Card>
          )}

          {isNew && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  Guarda el template primero para agregar recursos y checklist.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
