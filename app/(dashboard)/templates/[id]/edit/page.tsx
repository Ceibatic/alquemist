'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  LayoutTemplate,
  Save,
  Plus,
  Trash2,
  GripVertical,
  Layers,
  Calendar,
  Clock,
  RefreshCw,
  CheckCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const areaTypes = [
  { value: 'propagation', label: 'Propagacion' },
  { value: 'vegetative', label: 'Vegetativo' },
  { value: 'flowering', label: 'Floracion' },
  { value: 'drying', label: 'Secado' },
  { value: 'curing', label: 'Curado' },
  { value: 'storage', label: 'Almacenamiento' },
  { value: 'processing', label: 'Procesamiento' },
];

const activityTypes = [
  { value: 'watering', label: 'Riego' },
  { value: 'feeding', label: 'Fertilizacion' },
  { value: 'pruning', label: 'Poda' },
  { value: 'transplanting', label: 'Trasplante' },
  { value: 'inspection', label: 'Inspeccion' },
  { value: 'treatment', label: 'Tratamiento' },
  { value: 'harvest', label: 'Cosecha' },
  { value: 'drying', label: 'Secado' },
  { value: 'curing', label: 'Curado' },
  { value: 'quality_check', label: 'Control Calidad' },
  { value: 'movement', label: 'Movimiento' },
  { value: 'planting', label: 'Siembra' },
];

export default function TemplateEditPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const templateId = params.id as string;

  // Fetch template with phases and activities
  const template = useQuery(api.productionTemplates.getById, {
    templateId: templateId as Id<'production_templates'>,
  });

  // Mutations
  const updateTemplate = useMutation(api.productionTemplates.update);
  const createPhase = useMutation(api.templatePhases.create);
  const updatePhase = useMutation(api.templatePhases.update);
  const removePhase = useMutation(api.templatePhases.remove);
  const createActivity = useMutation(api.templateActivities.create);
  const updateActivity = useMutation(api.templateActivities.update);
  const removeActivity = useMutation(api.templateActivities.remove);

  // Local state
  const [isSaving, setIsSaving] = useState(false);
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());

  // Phase modal state
  const [phaseModalOpen, setPhaseModalOpen] = useState(false);
  const [editingPhase, setEditingPhase] = useState<any>(null);
  const [phaseName, setPhaseName] = useState('');
  const [phaseDuration, setPhaseDuration] = useState('14');
  const [phaseAreaType, setPhaseAreaType] = useState('vegetative');
  const [phaseDescription, setPhaseDescription] = useState('');

  // Activity modal state
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<any>(null);
  const [activityPhaseId, setActivityPhaseId] = useState<string>('');
  const [activityName, setActivityName] = useState('');
  const [activityType, setActivityType] = useState('watering');
  const [activityDuration, setActivityDuration] = useState('30');
  const [activityRecurring, setActivityRecurring] = useState(false);
  const [activityQC, setActivityQC] = useState(false);
  const [activityInstructions, setActivityInstructions] = useState('');

  // Delete confirmation state
  const [deletePhaseId, setDeletePhaseId] = useState<string | null>(null);
  const [deleteActivityId, setDeleteActivityId] = useState<string | null>(null);

  // Toggle phase expansion
  const togglePhase = (phaseId: string) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(phaseId)) {
        next.delete(phaseId);
      } else {
        next.add(phaseId);
      }
      return next;
    });
  };

  // Phase handlers
  const openAddPhaseModal = () => {
    setEditingPhase(null);
    setPhaseName('');
    setPhaseDuration('14');
    setPhaseAreaType('vegetative');
    setPhaseDescription('');
    setPhaseModalOpen(true);
  };

  const openEditPhaseModal = (phase: any) => {
    setEditingPhase(phase);
    setPhaseName(phase.phase_name);
    setPhaseDuration(String(phase.estimated_duration_days));
    setPhaseAreaType(phase.area_type);
    setPhaseDescription(phase.description || '');
    setPhaseModalOpen(true);
  };

  const handleSavePhase = async () => {
    if (!phaseName.trim()) {
      toast({ title: 'Error', description: 'El nombre es requerido', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      if (editingPhase) {
        await updatePhase({
          phaseId: editingPhase._id as Id<'template_phases'>,
          phaseName: phaseName.trim(),
          estimatedDurationDays: parseInt(phaseDuration) || 14,
          areaType: phaseAreaType,
          description: phaseDescription.trim() || undefined,
        });
        toast({ title: 'Fase actualizada' });
      } else {
        await createPhase({
          templateId: templateId as Id<'production_templates'>,
          phaseName: phaseName.trim(),
          estimatedDurationDays: parseInt(phaseDuration) || 14,
          areaType: phaseAreaType,
          description: phaseDescription.trim() || undefined,
        });
        toast({ title: 'Fase creada' });
      }
      setPhaseModalOpen(false);
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo guardar la fase', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePhase = async () => {
    if (!deletePhaseId) return;
    setIsSaving(true);
    try {
      await removePhase({ phaseId: deletePhaseId as Id<'template_phases'> });
      toast({ title: 'Fase eliminada' });
      setDeletePhaseId(null);
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo eliminar la fase', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  // Activity handlers
  const openAddActivityModal = (phaseId: string) => {
    setEditingActivity(null);
    setActivityPhaseId(phaseId);
    setActivityName('');
    setActivityType('watering');
    setActivityDuration('30');
    setActivityRecurring(false);
    setActivityQC(false);
    setActivityInstructions('');
    setActivityModalOpen(true);
  };

  const openEditActivityModal = (activity: any) => {
    setEditingActivity(activity);
    setActivityPhaseId(activity.phase_id);
    setActivityName(activity.activity_name);
    setActivityType(activity.activity_type);
    setActivityDuration(String(activity.estimated_duration_minutes || 30));
    setActivityRecurring(activity.is_recurring || false);
    setActivityQC(activity.is_quality_check || false);
    setActivityInstructions(activity.instructions || '');
    setActivityModalOpen(true);
  };

  const handleSaveActivity = async () => {
    if (!activityName.trim()) {
      toast({ title: 'Error', description: 'El nombre es requerido', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      if (editingActivity) {
        await updateActivity({
          activityId: editingActivity._id as Id<'template_activities'>,
          activityName: activityName.trim(),
          activityType,
          estimatedDurationMinutes: parseInt(activityDuration) || 30,
          isRecurring: activityRecurring,
          isQualityCheck: activityQC,
          instructions: activityInstructions.trim() || undefined,
        });
        toast({ title: 'Actividad actualizada' });
      } else {
        await createActivity({
          phaseId: activityPhaseId as Id<'template_phases'>,
          activityName: activityName.trim(),
          activityType,
          estimatedDurationMinutes: parseInt(activityDuration) || 30,
          isRecurring: activityRecurring,
          isQualityCheck: activityQC,
          instructions: activityInstructions.trim() || undefined,
        });
        toast({ title: 'Actividad creada' });
      }
      setActivityModalOpen(false);
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo guardar la actividad', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteActivity = async () => {
    if (!deleteActivityId) return;
    setIsSaving(true);
    try {
      await removeActivity({ activityId: deleteActivityId as Id<'template_activities'> });
      toast({ title: 'Actividad eliminada' });
      setDeleteActivityId(null);
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo eliminar la actividad', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (template === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  // Not found
  if (template === null) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <LayoutTemplate className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Template no encontrado</h2>
        <Button onClick={() => router.push('/templates')}>Volver a Templates</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={`Editar: ${template.name}`}
        icon={LayoutTemplate}
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Templates', href: '/templates' },
          { label: template.name, href: `/templates/${templateId}` },
          { label: 'Editar' },
        ]}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/templates/${templateId}`)}>
              Cancelar
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => router.push(`/templates/${templateId}`)}
            >
              <Save className="mr-2 h-4 w-4" />
              Listo
            </Button>
          </div>
        }
      />

      {/* Phases Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Fases de Produccion ({template.phases?.length || 0})
          </CardTitle>
          <Button onClick={openAddPhaseModal} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Agregar Fase
          </Button>
        </CardHeader>
        <CardContent>
          {!template.phases || template.phases.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <Layers className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">No hay fases definidas</p>
              <Button onClick={openAddPhaseModal} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Agregar Primera Fase
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {template.phases.map((phase: any, index: number) => {
                const isExpanded = expandedPhases.has(phase._id);
                return (
                  <div key={phase._id} className="border rounded-lg">
                    {/* Phase Header */}
                    <div
                      className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50"
                      onClick={() => togglePhase(phase._id)}
                    >
                      <GripVertical className="h-5 w-5 text-gray-400" />
                      <div className="h-8 w-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-medium text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{phase.phase_name}</h4>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {phase.estimated_duration_days} dias
                          </span>
                          <span>{areaTypes.find((t) => t.value === phase.area_type)?.label || phase.area_type}</span>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {phase.activities?.length || 0} actividades
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditPhaseModal(phase);
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletePhaseId(phase._id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>

                    {/* Activities */}
                    {isExpanded && (
                      <div className="border-t p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="text-sm font-medium">Actividades</h5>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openAddActivityModal(phase._id)}
                          >
                            <Plus className="mr-2 h-3 w-3" />
                            Agregar
                          </Button>
                        </div>
                        {!phase.activities || phase.activities.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            Sin actividades
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {phase.activities.map((activity: any) => (
                              <div
                                key={activity._id}
                                className="flex items-center gap-3 p-3 bg-white rounded border"
                              >
                                <span className="flex-1 text-sm">{activity.activity_name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {activityTypes.find((t) => t.value === activity.activity_type)?.label || activity.activity_type}
                                </Badge>
                                {activity.is_recurring && (
                                  <Badge variant="outline" className="text-xs gap-1">
                                    <RefreshCw className="h-3 w-3" />
                                  </Badge>
                                )}
                                {activity.is_quality_check && (
                                  <Badge variant="outline" className="text-xs gap-1 text-blue-600">
                                    <CheckCircle className="h-3 w-3" />
                                  </Badge>
                                )}
                                {activity.estimated_duration_minutes && (
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {activity.estimated_duration_minutes}min
                                  </span>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditActivityModal(activity)}
                                >
                                  Editar
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => setDeleteActivityId(activity._id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Phase Modal */}
      <Dialog open={phaseModalOpen} onOpenChange={setPhaseModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPhase ? 'Editar Fase' : 'Nueva Fase'}</DialogTitle>
            <DialogDescription>
              Define los detalles de la fase de produccion
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nombre *</Label>
              <Input
                value={phaseName}
                onChange={(e) => setPhaseName(e.target.value)}
                placeholder="Ej: Propagacion, Vegetativo, Floracion"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Duracion (dias)</Label>
                <Input
                  type="number"
                  value={phaseDuration}
                  onChange={(e) => setPhaseDuration(e.target.value)}
                  min="1"
                />
              </div>
              <div className="grid gap-2">
                <Label>Tipo de Area</Label>
                <Select value={phaseAreaType} onValueChange={setPhaseAreaType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {areaTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Descripcion</Label>
              <Textarea
                value={phaseDescription}
                onChange={(e) => setPhaseDescription(e.target.value)}
                placeholder="Descripcion de la fase..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPhaseModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSavePhase} disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {editingPhase ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activity Modal */}
      <Dialog open={activityModalOpen} onOpenChange={setActivityModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingActivity ? 'Editar Actividad' : 'Nueva Actividad'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nombre *</Label>
              <Input
                value={activityName}
                onChange={(e) => setActivityName(e.target.value)}
                placeholder="Ej: Riego matutino, Fertilizacion semanal"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Tipo</Label>
                <Select value={activityType} onValueChange={setActivityType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {activityTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Duracion (min)</Label>
                <Input
                  type="number"
                  value={activityDuration}
                  onChange={(e) => setActivityDuration(e.target.value)}
                  min="1"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={activityRecurring}
                  onChange={(e) => setActivityRecurring(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Actividad recurrente</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={activityQC}
                  onChange={(e) => setActivityQC(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Control de calidad</span>
              </label>
            </div>
            <div className="grid gap-2">
              <Label>Instrucciones</Label>
              <Textarea
                value={activityInstructions}
                onChange={(e) => setActivityInstructions(e.target.value)}
                placeholder="Instrucciones para realizar la actividad..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActivityModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveActivity} disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {editingActivity ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Phase Dialog */}
      <AlertDialog open={!!deletePhaseId} onOpenChange={() => setDeletePhaseId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar fase?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminaran todas las actividades de esta fase. Esta accion no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePhase}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Activity Dialog */}
      <AlertDialog open={!!deleteActivityId} onOpenChange={() => setDeleteActivityId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar actividad?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteActivity}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
