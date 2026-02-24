'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Factory,
  MoreHorizontal,
  Pencil,
  SkipForward,
  CalendarIcon,
  ClipboardCheck,
  Package,
  FileText,
  User,
  MapPin,
  Layers,
  Clock,
  AlertTriangle,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }> = {
  pending: { label: 'Pendiente', variant: 'outline', className: 'border-amber-500 text-amber-700' },
  in_progress: { label: 'En Progreso', variant: 'default', className: 'bg-blue-500' },
  completed: { label: 'Completada', variant: 'default', className: 'bg-green-500' },
  skipped: { label: 'Saltada', variant: 'secondary' },
  cancelled: { label: 'Cancelada', variant: 'destructive' },
};

const SOURCE_LABELS: Record<string, string> = {
  template: 'Desde template',
  manual: 'Manual',
  adhoc: 'Ad-hoc',
};

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

const DIRECTION_LABELS: Record<string, string> = {
  consumed: 'Consumido',
  applied: 'Aplicado',
  produced: 'Producido',
};

const BASIS_LABELS: Record<string, string> = {
  fixed: 'Fija',
  per_plant: 'Por planta',
  per_m2: 'Por m²',
  per_zone: 'Por zona',
  'per_L_solution': 'Por L solucion',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ActivityDetailPageProps {
  scheduledActivityId: Id<'scheduled_activities'>;
}

export function ActivityDetailPage({ scheduledActivityId }: ActivityDetailPageProps) {
  const router = useRouter();
  const [skipDialogOpen, setSkipDialogOpen] = useState(false);
  const [skipReason, setSkipReason] = useState('');
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activity = useQuery(api.scheduledActivities.getById, { scheduledActivityId });
  const resources = useQuery(api.scheduledActivities.getResourcesForActivity, { scheduledActivityId });

  // Fetch execution record if completed/in_progress
  const executionRecord = useQuery(
    api.activities.list,
    activity && (activity.status === 'completed' || activity.status === 'in_progress')
      ? { companyId: activity.company_id!, limit: 1 }
      : 'skip'
  );

  const skipActivity = useMutation(api.cultivationSchedules.skipScheduledActivity);
  const rescheduleActivity = useMutation(api.cultivationSchedules.rescheduleActivity);

  if (activity === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full" />
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

  const statusConfig = STATUS_CONFIG[activity.status] ?? STATUS_CONFIG.pending;
  const isOverdue = activity.status === 'pending' && activity.scheduled_date < Date.now();
  const canEdit = activity.status === 'pending' || activity.status === 'in_progress';
  const canReport = activity.status === 'pending' || activity.status === 'in_progress';
  const canSkip = activity.status === 'pending';

  const handleSkip = async () => {
    if (!skipReason.trim()) {
      toast.error('Ingresa una razon para saltar la actividad');
      return;
    }
    setIsSubmitting(true);
    try {
      await skipActivity({
        scheduledActivityId,
        reason: skipReason.trim(),
      });
      toast.success('Actividad saltada');
      setSkipDialogOpen(false);
      setSkipReason('');
    } catch (e: any) {
      toast.error(e.message ?? 'Error al saltar actividad');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleDate) return;
    setIsSubmitting(true);
    try {
      await rescheduleActivity({
        scheduledActivityId,
        newDate: rescheduleDate.getTime(),
      });
      toast.success('Actividad reprogramada');
      setRescheduleOpen(false);
      setRescheduleDate(undefined);
    } catch (e: any) {
      toast.error(e.message ?? 'Error al reprogramar');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title={activity.activityTypeName ?? activity.activity_type}
          icon={Factory}
          breadcrumbs={[
            { label: 'Inicio', href: '/dashboard' },
            { label: 'Produccion', href: '/production' },
            { label: 'Actividades', href: '/production' },
            { label: activity.activityTypeName ?? activity.activity_type },
          ]}
        />
        <div className="flex items-center gap-2 shrink-0">
          {canReport && (
            <Button
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-white"
              onClick={() => router.push(`/production/activities/${scheduledActivityId}/report`)}
            >
              <ClipboardCheck className="h-3.5 w-3.5 mr-1" />
              Reportar
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canEdit && (
                <DropdownMenuItem onClick={() => router.push(`/production/activities/${scheduledActivityId}/edit`)}>
                  <Pencil className="h-3.5 w-3.5 mr-2" />
                  Editar
                </DropdownMenuItem>
              )}
              {canSkip && (
                <DropdownMenuItem onClick={() => setSkipDialogOpen(true)}>
                  <SkipForward className="h-3.5 w-3.5 mr-2" />
                  Saltar
                </DropdownMenuItem>
              )}
              {canEdit && (
                <DropdownMenuItem onClick={() => setRescheduleOpen(true)}>
                  <CalendarIcon className="h-3.5 w-3.5 mr-2" />
                  Reprogramar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Phase role context banner */}
      {activity.phase_role === 'exit' && activity.status !== 'completed' && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <strong>Actividad de salida de fase:</strong> Al completar esta actividad, la fase se completara automaticamente y se avanzara a la siguiente.
        </div>
      )}
      {activity.phase_role === 'entry' && activity.status !== 'completed' && (
        <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          <strong>Actividad de entrada a fase:</strong> Al completar esta actividad, la fase se marcara como iniciada.
        </div>
      )}

      {/* Info card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informacion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoItem
              icon={<ClipboardCheck className="h-4 w-4" />}
              label="Estado"
              value={
                <div className="flex items-center gap-2">
                  <Badge variant={statusConfig.variant} className={statusConfig.className}>
                    {statusConfig.label}
                  </Badge>
                  {isOverdue && (
                    <Badge variant="destructive" className="text-[10px]">
                      Vencida
                    </Badge>
                  )}
                </div>
              }
            />
            <InfoItem
              icon={<CalendarIcon className="h-4 w-4" />}
              label="Fecha programada"
              value={format(new Date(activity.scheduled_date), "d MMM yyyy", { locale: es })}
            />
            {activity.estimated_duration_minutes && (
              <InfoItem
                icon={<Clock className="h-4 w-4" />}
                label="Duracion estimada"
                value={`${activity.estimated_duration_minutes} min`}
              />
            )}
            {activity.assignedToName && (
              <InfoItem
                icon={<User className="h-4 w-4" />}
                label="Asignado a"
                value={activity.assignedToName}
              />
            )}
            {activity.batchCode && (
              <InfoItem
                icon={<Package className="h-4 w-4" />}
                label="Lote"
                value={
                  activity.batchId ? (
                    <button
                      className="text-amber-600 hover:underline"
                      onClick={() => router.push(`/batches/${activity.batchId}`)}
                    >
                      {activity.batchCode}
                    </button>
                  ) : activity.batchCode
                }
              />
            )}
            {activity.areaName && (
              <InfoItem
                icon={<MapPin className="h-4 w-4" />}
                label="Area"
                value={activity.areaName}
              />
            )}
            {activity.phase_role && (
              <InfoItem
                icon={<Layers className="h-4 w-4" />}
                label="Rol en fase"
                value={
                  <Badge className={activity.phase_role === 'entry' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                    {activity.phase_role === 'entry' ? 'Entrada' : 'Salida'}
                  </Badge>
                }
              />
            )}
            {activity.batchPhase && (
              <InfoItem
                icon={<Layers className="h-4 w-4" />}
                label="Fase"
                value={PHASE_LABELS[activity.batchPhase] ?? activity.batchPhase}
              />
            )}
            {activity.templateName && (
              <InfoItem
                icon={<FileText className="h-4 w-4" />}
                label="Template"
                value={
                  activity.template_id ? (
                    <button
                      className="text-amber-600 hover:underline"
                      onClick={() => router.push(`/activity-templates/${activity.template_id}`)}
                    >
                      {activity.templateName}
                    </button>
                  ) : activity.templateName
                }
              />
            )}
            {activity.source && (
              <InfoItem
                icon={<FileText className="h-4 w-4" />}
                label="Fuente"
                value={SOURCE_LABELS[activity.source] ?? activity.source}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      {activity.instructions && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Instrucciones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {activity.instructions}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Resources */}
      {resources && resources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recursos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-left">
                    <th className="pb-2 font-medium">Producto</th>
                    <th className="pb-2 font-medium">Cantidad</th>
                    <th className="pb-2 font-medium">Base</th>
                    <th className="pb-2 font-medium">Direccion</th>
                    <th className="pb-2 font-medium">Requerido</th>
                  </tr>
                </thead>
                <tbody>
                  {resources.map((r) => (
                    <tr key={r._id} className="border-b last:border-0">
                      <td className="py-2">
                        <span className="font-medium">{r.productName}</span>
                        {r.productCode && (
                          <span className="text-xs text-muted-foreground ml-1">({r.productCode})</span>
                        )}
                      </td>
                      <td className="py-2">
                        {r.effectiveQuantity} {r.unitSymbol ?? r.unitName ?? ''}
                      </td>
                      <td className="py-2 text-muted-foreground">
                        {BASIS_LABELS[r.quantity_basis] ?? r.quantity_basis}
                      </td>
                      <td className="py-2 text-muted-foreground">
                        {DIRECTION_LABELS[r.direction] ?? r.direction}
                      </td>
                      <td className="py-2">
                        {r.is_required ? (
                          <Badge variant="outline" className="text-[10px]">Requerido</Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">Opcional</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skip reason (if skipped) */}
      {activity.status === 'skipped' && activity.skipped_reason && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Razon de salto</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{activity.skipped_reason}</p>
          </CardContent>
        </Card>
      )}

      {/* Skip dialog */}
      <Dialog open={skipDialogOpen} onOpenChange={setSkipDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Saltar actividad</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Razon</Label>
            <Textarea
              value={skipReason}
              onChange={(e) => setSkipReason(e.target.value)}
              placeholder="Indica por que se salta esta actividad..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSkipDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSkip} disabled={isSubmitting}>
              {isSubmitting ? 'Saltando...' : 'Saltar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule dialog */}
      <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reprogramar actividad</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Nueva fecha</Label>
            <Input
              type="date"
              value={rescheduleDate ? format(rescheduleDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => setRescheduleDate(e.target.value ? new Date(e.target.value + 'T12:00:00') : undefined)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleOpen(false)}>Cancelar</Button>
            <Button onClick={handleReschedule} disabled={isSubmitting || !rescheduleDate}>
              {isSubmitting ? 'Reprogramando...' : 'Reprogramar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

// ---------------------------------------------------------------------------
// Helper component
// ---------------------------------------------------------------------------

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-muted-foreground mt-0.5">{icon}</span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}
