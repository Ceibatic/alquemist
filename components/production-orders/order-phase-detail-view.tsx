'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useFacility } from '@/components/providers/facility-provider';
import { AddOrderActivityDialog } from '@/components/production-orders/add-order-activity-dialog';
import {
  Layers,
  Calendar,
  Clock,
  Plus,
  Package,
  ArrowLeft,
  MapPin,
} from 'lucide-react';

// ── Label and color maps ────────────────────────────────────────────────────

const PHASE_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
};

const PHASE_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  in_progress: 'En Progreso',
  completed: 'Completada',
};

const ACTIVITY_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  skipped: 'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-700',
};

const ACTIVITY_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  in_progress: 'En Progreso',
  completed: 'Completada',
  skipped: 'Saltada',
  cancelled: 'Cancelada',
};

// Category-based color map (same as template phase-detail-view)
const CATEGORY_COLORS: Record<string, { border: string; badge: string }> = {
  cultivation: { border: 'border-green-400 bg-green-50', badge: 'bg-green-100 text-green-700' },
  monitoring: { border: 'border-amber-400 bg-amber-50', badge: 'bg-amber-100 text-amber-700' },
  transformation: { border: 'border-violet-400 bg-violet-50', badge: 'bg-violet-100 text-violet-700' },
  application: { border: 'border-red-400 bg-red-50', badge: 'bg-red-100 text-red-700' },
  movement: { border: 'border-cyan-400 bg-cyan-50', badge: 'bg-cyan-100 text-cyan-700' },
  maintenance: { border: 'border-slate-400 bg-slate-50', badge: 'bg-slate-100 text-slate-700' },
  quality: { border: 'border-rose-400 bg-rose-50', badge: 'bg-rose-100 text-rose-700' },
  harvest: { border: 'border-pink-400 bg-pink-50', badge: 'bg-pink-100 text-pink-700' },
  post_harvest: { border: 'border-orange-400 bg-orange-50', badge: 'bg-orange-100 text-orange-700' },
  administrative: { border: 'border-gray-400 bg-gray-50', badge: 'bg-gray-100 text-gray-700' },
};

// ── Types ───────────────────────────────────────────────────────────────────

interface ActivityTypeInfo {
  code: string;
  name: string;
  category: string;
  icon?: string;
  color?: string;
}

interface ActivityData {
  _id: string;
  activity_type: string;
  scheduled_date: number;
  estimated_duration_minutes?: number;
  status: string;
  instructions?: string;
  template_id?: string;
  activity_type_info?: ActivityTypeInfo | null;
  resource_count: number;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

const DAY_MS = 24 * 60 * 60 * 1000;

function formatDayLabel(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getDaysBetween(start: number, end: number): number[] {
  const days: number[] = [];
  // Normalize to midnight
  let current = new Date(start);
  current.setHours(0, 0, 0, 0);
  const endDate = new Date(end);
  endDate.setHours(0, 0, 0, 0);

  while (current.getTime() < endDate.getTime()) {
    days.push(current.getTime());
    current = new Date(current.getTime() + DAY_MS);
  }

  return days;
}

function isSameDay(a: number, b: number): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

// ── Activity Card ───────────────────────────────────────────────────────────

function OrderActivityCard({ activity }: { activity: ActivityData }) {
  const info = activity.activity_type_info;
  const categoryColors = info ? CATEGORY_COLORS[info.category] : undefined;
  const defaultColors = {
    border: 'border-gray-300 bg-gray-50',
    badge: 'bg-gray-100 text-gray-700',
  };
  const colors = categoryColors ?? defaultColors;
  const typeLabel = info?.name ?? activity.activity_type;

  let durationText: string | null = null;
  if (activity.estimated_duration_minutes != null) {
    const mins = activity.estimated_duration_minutes;
    durationText = mins >= 60 ? `${Math.round(mins / 60)}h` : `${mins}min`;
  }

  return (
    <div className={`border-l-4 rounded-md p-3 flex flex-col gap-1.5 ${colors.border}`}>
      {/* Name row */}
      <div className="flex items-start justify-between gap-2">
        <span className="font-medium text-sm leading-snug">
          {info?.name ?? activity.activity_type}
        </span>
        <div className="flex items-center gap-1 flex-shrink-0">
          {activity.resource_count > 0 && (
            <span
              className="flex items-center gap-0.5 text-xs text-gray-500"
              title={`${activity.resource_count} recurso(s)`}
            >
              <Package className="h-3.5 w-3.5" />
              {activity.resource_count}
            </span>
          )}
        </div>
      </div>

      {/* Badges row */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${colors.badge}`}
        >
          {typeLabel}
        </span>
        {durationText && (
          <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium bg-white/70 text-gray-600 border border-gray-200">
            <Clock className="h-3 w-3" />
            {durationText}
          </span>
        )}
        <Badge className={ACTIVITY_STATUS_COLORS[activity.status] ?? 'bg-gray-100 text-gray-600'}>
          {ACTIVITY_STATUS_LABELS[activity.status] ?? activity.status}
        </Badge>
      </div>
    </div>
  );
}

// ── Main view ───────────────────────────────────────────────────────────────

export function OrderPhaseDetailView() {
  const params = useParams();
  const router = useRouter();
  const { currentCompanyId } = useFacility();

  const orderId = params.id as string;
  const phaseId = params.phaseId as string;

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addDialogDate, setAddDialogDate] = useState<number>(Date.now());

  const phase = useQuery(api.orderPhases.getById, {
    phaseId: phaseId as Id<'order_phases'>,
  });

  // Loading state
  if (phase === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // Not found
  if (phase === null) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Layers className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Fase no encontrada</h2>
        <p className="text-muted-foreground mb-4">
          La fase que buscas no existe o fue eliminada.
        </p>
        <Button onClick={() => router.push(`/production/orders/${orderId}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a la Orden
        </Button>
      </div>
    );
  }

  const activities: ActivityData[] = phase.activities ?? [];
  const days = getDaysBetween(phase.planned_start_date, phase.planned_end_date);
  const durationDays = days.length;

  function getActivitiesForDay(dayTimestamp: number): ActivityData[] {
    return activities.filter((a) => isSameDay(a.scheduled_date, dayTimestamp));
  }

  function handleAddClick(dayTimestamp: number) {
    setAddDialogDate(dayTimestamp);
    setAddDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={phase.phase_name}
        icon={Layers}
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Producción', href: '/production' },
          {
            label: phase.orderNumber ?? 'Orden',
            href: `/production/orders/${orderId}`,
          },
          { label: phase.phase_name },
        ]}
      />

      {/* Info Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-x-12 gap-y-0 sm:grid-cols-2 lg:grid-cols-4">
            <InfoRow label="Fase" value={phase.phase_name} />
            <InfoRow
              label="Duración"
              value={
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  {durationDays} días
                </span>
              }
            />
            <InfoRow
              label="Fechas"
              value={`${formatDate(phase.planned_start_date)} — ${formatDate(phase.planned_end_date)}`}
            />
            <InfoRow
              label="Estado"
              value={
                <Badge
                  className={
                    PHASE_STATUS_COLORS[phase.status] ?? 'bg-gray-100 text-gray-700'
                  }
                >
                  {PHASE_STATUS_LABELS[phase.status] ?? phase.status}
                </Badge>
              }
            />
            {phase.areaName && (
              <InfoRow
                label="Área"
                value={
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    {phase.areaName}
                  </span>
                }
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Day Schedule */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            Cronograma
            <span className="text-sm font-normal text-muted-foreground">
              ({activities.length}{' '}
              {activities.length === 1 ? 'actividad' : 'actividades'})
            </span>
          </h2>
        </div>

        <div className="space-y-2">
          {days.map((dayTs) => {
            const dayActivities = getActivitiesForDay(dayTs);
            const isToday = isSameDay(dayTs, Date.now());

            return (
              <div
                key={dayTs}
                className={`flex gap-3 items-start rounded-lg border bg-white p-3 ${
                  isToday ? 'border-amber-300 bg-amber-50/30' : ''
                }`}
              >
                {/* Day label */}
                <div className="flex-shrink-0 w-24 pt-0.5">
                  <span
                    className={`text-xs font-semibold uppercase tracking-wide ${
                      isToday ? 'text-amber-600' : 'text-muted-foreground'
                    }`}
                  >
                    {formatDayLabel(dayTs)}
                  </span>
                  {isToday && (
                    <span className="block text-[10px] text-amber-500 font-medium">
                      Hoy
                    </span>
                  )}
                </div>

                {/* Activities */}
                <div className="flex-1 min-w-0">
                  {dayActivities.length > 0 ? (
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {dayActivities.map((act) => (
                        <OrderActivityCard key={act._id} activity={act} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground py-1 italic">
                      Sin actividades
                    </p>
                  )}
                </div>

                {/* Add button */}
                <div className="flex-shrink-0 pt-0.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-amber-600 hover:bg-amber-50"
                    onClick={() => handleAddClick(dayTs)}
                    title={`Agregar actividad al ${formatDayLabel(dayTs)}`}
                    disabled={!currentCompanyId}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Activity Dialog */}
      {currentCompanyId && (
        <AddOrderActivityDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          orderId={orderId as Id<'production_orders'>}
          scheduledDate={addDialogDate}
          minDate={phase.planned_start_date}
          maxDate={phase.planned_end_date}
          companyId={currentCompanyId}
        />
      )}
    </div>
  );
}

// ── InfoRow helper ──────────────────────────────────────────────────────────

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex justify-between gap-4 py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}
