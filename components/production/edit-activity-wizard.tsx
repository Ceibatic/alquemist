'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/layout/page-header';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  Factory,
  FileText,
  ClipboardCheck,
  Check,
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EditFormData {
  scheduledDate: Date | null;
  assignedTo: Id<'users'> | null;
  priority: string;
  estimatedDurationMinutes: number | null;
  instructions: string;
}

const PRIORITY_OPTIONS = [
  { value: 'routine', label: 'Rutinaria' },
  { value: 'urgent', label: 'Urgente' },
  { value: 'critical', label: 'Critica' },
];

const STEPS = [
  { key: 'details', label: 'Detalles', icon: FileText },
  { key: 'resources', label: 'Recursos', icon: ClipboardCheck },
] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface EditActivityWizardProps {
  scheduledActivityId: Id<'scheduled_activities'>;
  companyId: Id<'companies'>;
}

export function EditActivityWizard({ scheduledActivityId, companyId }: EditActivityWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [formInitialized, setFormInitialized] = useState(false);
  const [formData, setFormData] = useState<EditFormData>({
    scheduledDate: null,
    assignedTo: null,
    priority: 'routine',
    estimatedDurationMinutes: null,
    instructions: '',
  });

  const activity = useQuery(api.scheduledActivities.getById, { scheduledActivityId });
  const resources = useQuery(api.scheduledActivities.getResourcesForActivity, { scheduledActivityId });
  const users = useQuery(api.users.getUsersByCompany, { companyId });
  const updateActivity = useMutation(api.scheduledActivities.update);

  // Initialize form with current activity data
  useEffect(() => {
    if (activity && !formInitialized) {
      setFormData({
        scheduledDate: new Date(activity.scheduled_date),
        assignedTo: activity.assigned_to ?? null,
        priority: (activity.activity_metadata as any)?.priority ?? 'routine',
        estimatedDurationMinutes: activity.estimated_duration_minutes ?? null,
        instructions: activity.instructions ?? '',
      });
      setFormInitialized(true);
    }
  }, [activity, formInitialized]);

  if (activity === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (activity === null) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <AlertTriangle className="h-12 w-12 mb-4 opacity-40" />
        <p className="text-lg font-medium">Actividad no encontrada</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/production')}>
          Volver a Produccion
        </Button>
      </div>
    );
  }

  if (activity.status === 'completed' || activity.status === 'skipped') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <AlertTriangle className="h-12 w-12 mb-4 opacity-40" />
        <p className="text-lg font-medium">Esta actividad no se puede editar</p>
        <p className="text-sm">Las actividades completadas o saltadas no son editables.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Volver
        </Button>
      </div>
    );
  }

  const hasResources = resources && resources.length > 0;
  const activeSteps = hasResources ? STEPS : [STEPS[0]];

  const handleSave = async () => {
    if (!formData.scheduledDate) {
      toast.error('La fecha es requerida');
      return;
    }

    setIsSaving(true);
    try {
      await updateActivity({
        scheduledActivityId,
        scheduledDate: formData.scheduledDate.getTime(),
        assignedTo: formData.assignedTo ?? undefined,
        instructions: formData.instructions || undefined,
        estimatedDurationMinutes: formData.estimatedDurationMinutes ?? undefined,
        priority: formData.priority !== 'routine' ? formData.priority : undefined,
      });
      toast.success('Actividad actualizada');
      router.push(`/production/activities/${scheduledActivityId}`);
    } catch (e: any) {
      toast.error(e.message ?? 'Error al actualizar');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Editar: ${activity.activityTypeName ?? activity.activity_type}`}
        icon={Factory}
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Produccion', href: '/production' },
          { label: activity.activityTypeName ?? activity.activity_type, href: `/production/activities/${scheduledActivityId}` },
          { label: 'Editar' },
        ]}
      />

      {/* Step indicator */}
      {hasResources && (
        <div className="flex items-center justify-center gap-0">
          {activeSteps.map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isActive = idx === currentStep;
            const StepIcon = step.icon;
            return (
              <div key={step.key} className="flex items-center">
                {idx > 0 && (
                  <div className={cn('h-px w-8', isCompleted ? 'bg-amber-500' : 'bg-border')} />
                )}
                <button
                  onClick={() => idx < currentStep && setCurrentStep(idx)}
                  disabled={idx > currentStep}
                  className={cn(
                    'flex items-center justify-center h-8 w-8 rounded-full text-xs font-medium transition-colors',
                    isActive && 'bg-amber-500 text-white',
                    isCompleted && 'bg-amber-100 text-amber-800',
                    !isActive && !isCompleted && 'bg-muted text-muted-foreground',
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : <StepIcon className="h-4 w-4" />}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Step content */}
      <div className="max-w-2xl mx-auto">
        {currentStep === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detalles de la actividad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date */}
              <div className="space-y-2">
                <Label>Fecha programada *</Label>
                <Input
                  type="date"
                  value={formData.scheduledDate ? format(formData.scheduledDate, 'yyyy-MM-dd') : ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      scheduledDate: e.target.value ? new Date(e.target.value + 'T12:00:00') : null,
                    }))
                  }
                />
              </div>

              {/* Assigned to */}
              <div className="space-y-2">
                <Label>Asignado a</Label>
                <Select
                  value={formData.assignedTo ?? ''}
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, assignedTo: (v || null) as Id<'users'> | null }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sin asignar" />
                  </SelectTrigger>
                  <SelectContent>
                    {users?.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {[user.firstName, user.lastName].filter(Boolean).join(' ') || user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label>Prioridad</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, priority: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label>Duracion estimada (minutos)</Label>
                <Input
                  type="number"
                  min={1}
                  value={formData.estimatedDurationMinutes ?? ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      estimatedDurationMinutes: e.target.value ? parseInt(e.target.value) : null,
                    }))
                  }
                  placeholder="Ej: 60"
                />
              </div>

              {/* Instructions */}
              <div className="space-y-2">
                <Label>Instrucciones</Label>
                <Textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData((prev) => ({ ...prev, instructions: e.target.value }))}
                  placeholder="Instrucciones..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 1 && hasResources && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recursos materializados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {resources!.map((r) => (
                  <div key={r._id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{r.productName}</span>
                      {r.is_required && (
                        <span className="text-[10px] text-amber-600 font-medium">Requerido</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Cantidad base: {r.effectiveQuantity} {r.unitSymbol ?? ''}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Los recursos se editan desde el detalle de la actividad.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between max-w-2xl mx-auto">
        <Button
          variant="outline"
          onClick={() => {
            if (currentStep === 0) {
              router.push(`/production/activities/${scheduledActivityId}`);
            } else {
              setCurrentStep(currentStep - 1);
            }
          }}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          {currentStep === 0 ? 'Cancelar' : 'Anterior'}
        </Button>

        {currentStep < activeSteps.length - 1 ? (
          <Button
            onClick={() => setCurrentStep(currentStep + 1)}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            Siguiente
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button
            onClick={handleSave}
            disabled={isSaving || !formData.scheduledDate}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar cambios'
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
