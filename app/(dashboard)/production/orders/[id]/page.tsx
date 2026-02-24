'use client';

import { use, useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/status-badge';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { OrderBatchSummary } from '@/components/production-orders/order-batch-summary';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/providers/user-provider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ClipboardList,
  Play,
  Calendar,
  CheckCircle,
  Layers,
  MoreVertical,
  XCircle,
  MapPin,
  AlertTriangle,
} from 'lucide-react';

// ── Label maps ─────────────────────────────────────────────────────────────

const ORDER_TYPE_LABELS: Record<string, string> = {
  production: 'Producción',
  propagation: 'Propagación',
  custom: 'Personalizado',
};

const SOURCE_TYPE_LABELS: Record<string, string> = {
  seed: 'Semilla',
  clone: 'Clon',
  mother_plant: 'Planta Madre',
};

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  urgent: 'Urgente',
};

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<string, string> = {
  planning: 'En Planificación',
  active: 'Activa',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

const PHASE_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-700',
  awaiting_entry: 'bg-amber-100 text-amber-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
};

const PHASE_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  awaiting_entry: 'Esperando Inicio',
  in_progress: 'En Progreso',
  completed: 'Completada',
};

const ACTIVITY_TYPE_COLORS: Record<string, string> = {
  watering: 'bg-blue-100 text-blue-700',
  feeding: 'bg-green-100 text-green-700',
  pruning: 'bg-orange-100 text-orange-700',
  transplanting: 'bg-purple-100 text-purple-700',
  inspection: 'bg-cyan-100 text-cyan-700',
  treatment: 'bg-red-100 text-red-700',
  harvest: 'bg-amber-100 text-amber-700',
  drying: 'bg-yellow-100 text-yellow-700',
  curing: 'bg-teal-100 text-teal-700',
  quality_check: 'bg-indigo-100 text-indigo-700',
  monitoring: 'bg-sky-100 text-sky-700',
  planting: 'bg-lime-100 text-lime-700',
};

const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  watering: 'Riego',
  feeding: 'Fertilización',
  pruning: 'Poda',
  transplanting: 'Trasplante',
  inspection: 'Inspección',
  treatment: 'Tratamiento',
  harvest: 'Cosecha',
  drying: 'Secado',
  curing: 'Curado',
  quality_check: 'Control Calidad',
  monitoring: 'Monitoreo',
  planting: 'Siembra',
};

// Timeline bar colors
const TIMELINE_COLORS = [
  'bg-amber-500',
  'bg-blue-500',
  'bg-purple-500',
  'bg-teal-500',
  'bg-pink-500',
  'bg-orange-500',
];

// ── Types ───────────────────────────────────────────────────────────────────

interface ActivitySummary {
  _id: string;
  activity_type: string;
  scheduled_date: number;
  status: string;
  phase_role?: 'entry' | 'exit';
  order_phase_id?: string;
}

interface Phase {
  _id: string;
  phase_name: string;
  phase_order: number;
  planned_start_date: number;
  planned_end_date: number;
  actual_start_date?: number;
  actual_end_date?: number;
  status: string;
  areaName: string | null;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(timestamp?: number) {
  if (!timestamp) return '-';
  return new Date(timestamp).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatShortDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
  });
}

function getActivitiesForPhase(
  activities: ActivitySummary[],
  phase: Phase
): Record<string, number> {
  const phaseActivities = activities.filter(
    (a) =>
      a.scheduled_date >= phase.planned_start_date &&
      a.scheduled_date < phase.planned_end_date &&
      a.status !== 'cancelled'
  );
  return phaseActivities.reduce<Record<string, number>>((acc, a) => {
    acc[a.activity_type] = (acc[a.activity_type] ?? 0) + 1;
    return acc;
  }, {});
}

// ── Sub-components ──────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}

function OrderPhaseCard({
  phase,
  index,
  activities,
  orderId,
  orderStatus,
  hasPhaseRoleActivities,
  onClick,
  onComplete,
}: {
  phase: Phase;
  index: number;
  activities: ActivitySummary[];
  orderId: string;
  orderStatus: string;
  hasPhaseRoleActivities: boolean;
  onClick: () => void;
  onComplete: () => void;
}) {
  const typeCounts = getActivitiesForPhase(activities, phase);
  const isCompleted = phase.status === 'completed';
  const isInProgress = phase.status === 'in_progress';
  const isAwaitingEntry = phase.status === 'awaiting_entry';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className={`flex items-center gap-4 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
        isInProgress ? 'border-blue-300 bg-blue-50/30' : isAwaitingEntry ? 'border-amber-300 bg-amber-50/30' : ''
      }`}
    >
      {/* Phase number badge or check */}
      <div
        className={`flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center font-semibold text-sm ${
          isCompleted
            ? 'bg-green-500 text-white'
            : 'bg-amber-100 text-amber-800'
        }`}
      >
        {isCompleted ? <CheckCircle className="h-5 w-5" /> : index + 1}
      </div>

      {/* Phase info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{phase.phase_name}</p>
        <div className="flex items-center gap-3 mt-0.5 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formatShortDate(phase.planned_start_date)} —{' '}
            {formatShortDate(phase.planned_end_date)}
          </span>
          {phase.areaName && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {phase.areaName}
            </span>
          )}
        </div>
      </div>

      {/* Activity type badges + status */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="flex flex-wrap gap-1.5 justify-end max-w-xs">
          {Object.entries(typeCounts)
            .filter(([, count]) => count > 0)
            .map(([type, count]) => (
              <Badge
                key={type}
                className={ACTIVITY_TYPE_COLORS[type] ?? 'bg-gray-100 text-gray-700'}
              >
                {count} {ACTIVITY_TYPE_LABELS[type] ?? type}
              </Badge>
            ))}
        </div>

        <Badge className={PHASE_STATUS_COLORS[phase.status] ?? 'bg-gray-100 text-gray-700'}>
          {PHASE_STATUS_LABELS[phase.status] ?? phase.status}
        </Badge>

        {isInProgress && orderStatus === 'active' && !hasPhaseRoleActivities && (
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={(e) => {
              e.stopPropagation();
              onComplete();
            }}
          >
            <CheckCircle className="h-3.5 w-3.5 mr-1" />
            Completar
          </Button>
        )}
      </div>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id as Id<'production_orders'>;
  const router = useRouter();
  const { userId } = useUser();

  const order = useQuery(api.productionOrders.getById, { orderId });
  const activateOrder = useMutation(api.productionOrders.activate);
  const completePhase = useMutation(api.productionOrders.completePhase);
  const cancelOrder = useMutation(api.productionOrders.cancel);

  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const [selectedAreaId, setSelectedAreaId] = useState<string>('');
  const [isActivating, setIsActivating] = useState(false);

  // Query areas for the activation dialog
  const areas = useQuery(
    api.areas.getByFacility,
    order?.target_facility_id
      ? { facilityId: order.target_facility_id }
      : 'skip',
  );
  const activeAreas = areas?.filter((a) => a.status === 'active') ?? [];

  const handleActivate = async () => {
    if (!userId || !selectedAreaId) return;
    setIsActivating(true);
    try {
      await activateOrder({
        orderId,
        approvedBy: userId as Id<'users'>,
        targetAreaId: selectedAreaId as Id<'areas'>,
      });
      toast.success('Orden activada', {
        description: 'Lotes creados y primera fase activada.',
      });
      setActivateDialogOpen(false);
      setSelectedAreaId('');
    } catch {
      toast.error('Error', {
        description: 'No se pudo activar la orden.',
      });
    } finally {
      setIsActivating(false);
    }
  };

  const handleCompletePhase = async (phaseId: Id<'order_phases'>) => {
    try {
      const result = await completePhase({ orderId, phaseId });
      toast.success(result.isOrderComplete ? 'Orden completada' : 'Fase completada', {
        description: result.message,
      });
    } catch {
      toast.error('Error', {
        description: 'No se pudo completar la fase.',
      });
    }
  };

  const handleCancel = async () => {
    try {
      await cancelOrder({ orderId, reason: 'Cancelada por el usuario' });
      toast.success('Orden cancelada');
      setCancelConfirmOpen(false);
    } catch {
      toast.error('Error', {
        description: 'No se pudo cancelar la orden.',
      });
    }
  };

  // Loading state
  if (order === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Not found
  if (order === null) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertTriangle className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Orden no encontrada</h2>
        <p className="text-muted-foreground mb-4">
          La orden que buscas no existe o fue eliminada.
        </p>
        <Button onClick={() => router.push('/production?tab=ordenes')}>
          Volver a Ordenes
        </Button>
      </div>
    );
  }

  const phases: Phase[] = order.phases ?? [];
  const activities: ActivitySummary[] = order.activities ?? [];
  const hasPhaseRoleActivities = activities.some((a) => a.phase_role === 'entry' || a.phase_role === 'exit');

  // Calculate total timeline span for the bar
  const totalMs =
    phases.length > 0
      ? phases[phases.length - 1].planned_end_date - phases[0].planned_start_date
      : 1;

  const getStatusBadgeStatus = () => {
    switch (order.status) {
      case 'active':
        return 'active';
      case 'planning':
        return 'maintenance';
      default:
        return 'inactive';
    }
  };

  // Build info rows
  const infoRows: { label: string; value: React.ReactNode }[] = [];

  if (order.cropTypeName) {
    infoRows.push({ label: 'Tipo de Cultivo', value: order.cropTypeName });
  }
  infoRows.push({
    label: 'Cultivar',
    value: order.cultivarName ?? '-',
  });
  if (order.templateName) {
    infoRows.push({
      label: 'Template',
      value: order.template_id ? (
        <button
          className="text-amber-600 hover:underline"
          onClick={() => router.push(`/templates/${order.template_id}`)}
        >
          {order.templateName}
        </button>
      ) : (
        order.templateName
      ),
    });
  }
  if (order.facilityName) {
    infoRows.push({ label: 'Instalación', value: order.facilityName });
  }
  infoRows.push({
    label: 'Tipo de Orden',
    value: ORDER_TYPE_LABELS[order.order_type] ?? order.order_type,
  });
  infoRows.push({
    label: 'Fuente',
    value: SOURCE_TYPE_LABELS[order.source_type] ?? order.source_type,
  });
  infoRows.push({
    label: 'Prioridad',
    value: (
      <Badge className={PRIORITY_COLORS[order.priority] ?? 'bg-gray-100 text-gray-700'}>
        {PRIORITY_LABELS[order.priority] ?? order.priority}
      </Badge>
    ),
  });
  infoRows.push({
    label: 'Fecha Inicio',
    value: formatDate(order.actual_start_date || order.planned_start_date),
  });
  if (order.estimated_completion_date) {
    infoRows.push({
      label: 'Fecha Est. Fin',
      value: formatDate(order.estimated_completion_date),
    });
  }
  if (order.requested_delivery_date) {
    infoRows.push({
      label: 'Fecha Entrega',
      value: formatDate(order.requested_delivery_date),
    });
  }
  infoRows.push({
    label: 'Plantas Plan.',
    value: order.total_plants_planned?.toLocaleString() || '0',
  });
  infoRows.push({
    label: 'Plantas Act.',
    value: order.total_plants_actual?.toLocaleString() || '0',
  });
  if (order.batches && order.batches.length > 0) {
    infoRows.push({
      label: 'Lotes',
      value: order.batches.length,
    });
  }
  if (order.notes) {
    infoRows.push({
      label: 'Notas',
      value: <span className="text-xs">{order.notes}</span>,
    });
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={order.order_number}
        icon={ClipboardList}
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Producción', href: '/production' },
          { label: 'Ordenes', href: '/production?tab=ordenes' },
          { label: order.order_number },
        ]}
        description={order.templateName || order.cropTypeName || undefined}
        action={
          <div className="flex gap-2">
            {order.status === 'planning' && (
              <Button
                onClick={() => setActivateDialogOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Play className="mr-2 h-4 w-4" />
                Activar Orden
              </Button>
            )}
            {order.status !== 'completed' && order.status !== 'cancelled' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={handleCancel}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancelar Orden
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        }
      />

      {/* ── Status + Progress Card ───────────────────────────────────────── */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <StatusBadge
                status={getStatusBadgeStatus()}
                label={STATUS_LABELS[order.status]}
              />
              {order.priority === 'high' || order.priority === 'urgent' ? (
                <Badge className={PRIORITY_COLORS[order.priority]}>
                  {PRIORITY_LABELS[order.priority]}
                </Badge>
              ) : null}
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Progreso</p>
              <p className="text-xl font-bold">{order.completion_percentage}%</p>
            </div>
          </div>
          <Progress value={order.completion_percentage} className="h-2" />
        </CardContent>
      </Card>

      {/* ── Info Card ─────────────────────────────────────────────────────── */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-x-12 gap-y-0 sm:grid-cols-2 lg:grid-cols-3">
            {infoRows.map(({ label, value }) => (
              <InfoRow key={label} label={label} value={value} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Batches Section ──────────────────────────────────────────────── */}
      <OrderBatchSummary
        batches={order.batches ?? []}
        orderStatus={order.status}
      />

      {/* ── Phases Section ───────────────────────────────────────────────── */}
      <div className="space-y-4">
        {/* Section header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Layers className="h-5 w-5 text-muted-foreground" />
            Fases
            <span className="text-sm font-normal text-muted-foreground">
              ({phases.length})
            </span>
          </h2>
        </div>

        {phases.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-12 text-center">
              <Layers className="h-12 w-12 text-gray-300 mb-3" />
              <p className="text-muted-foreground">
                Esta orden no tiene fases definidas aún.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Timeline bar */}
            <div className="flex gap-1 h-7 rounded-lg overflow-hidden">
              {phases.map((phase, index) => {
                const phaseDuration =
                  phase.planned_end_date - phase.planned_start_date;
                const widthPct = (phaseDuration / totalMs) * 100;
                return (
                  <div
                    key={phase._id}
                    className={`${TIMELINE_COLORS[index % TIMELINE_COLORS.length]} flex items-center justify-center text-white text-xs font-medium px-2 truncate ${
                      phase.status === 'completed' ? 'opacity-60' : ''
                    }`}
                    style={{ width: `${Math.max(widthPct, 4)}%` }}
                    title={`${phase.phase_name}: ${formatShortDate(phase.planned_start_date)} — ${formatShortDate(phase.planned_end_date)}`}
                  >
                    {widthPct > 8 ? phase.phase_name : ''}
                  </div>
                );
              })}
            </div>

            {/* Phase cards */}
            <div className="space-y-2">
              {phases.map((phase, index) => (
                <OrderPhaseCard
                  key={phase._id}
                  phase={phase}
                  index={index}
                  activities={activities}
                  orderId={orderId}
                  orderStatus={order.status}
                  hasPhaseRoleActivities={hasPhaseRoleActivities}
                  onClick={() =>
                    router.push(
                      `/production/orders/${orderId}/phases/${phase._id}`
                    )
                  }
                  onComplete={() =>
                    handleCompletePhase(phase._id as Id<'order_phases'>)
                  }
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Activate Order Dialog ───────────────────────────────────── */}
      <Dialog open={activateDialogOpen} onOpenChange={setActivateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Activar Orden</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Al activar esta orden se crearán{' '}
              <strong>
                {order.batch_size && order.requested_quantity
                  ? Math.ceil(order.requested_quantity / order.batch_size)
                  : 1}{' '}
                lote(s)
              </strong>{' '}
              de {order.batch_size ?? order.requested_quantity ?? '?'} plantas y
              se activará la primera fase.
            </p>
            <div className="space-y-2">
              <Label>Área de destino *</Label>
              <Select
                value={selectedAreaId}
                onValueChange={setSelectedAreaId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar área" />
                </SelectTrigger>
                <SelectContent>
                  {activeAreas.map((area) => (
                    <SelectItem key={area._id} value={area._id}>
                      {area.name} ({area.area_type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {activeAreas.length === 0 && areas !== undefined && (
                <p className="text-xs text-destructive">
                  No hay áreas activas en esta instalación.
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setActivateDialogOpen(false);
                setSelectedAreaId('');
              }}
            >
              Cancelar
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleActivate}
              disabled={!selectedAreaId || isActivating}
            >
              {isActivating ? 'Activando...' : 'Confirmar Activación'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
