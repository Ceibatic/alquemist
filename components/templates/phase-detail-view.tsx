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
import { AddActivityDialog } from '@/components/templates/add-activity-dialog';
import {
  Layers,
  Calendar,
  Clock,
  Plus,
  Package,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';

// ── Label and color maps ────────────────────────────────────────────────────

const AREA_TYPE_LABELS: Record<string, string> = {
  propagation: 'Propagación',
  vegetative: 'Vegetativo',
  flowering: 'Floración',
  drying: 'Secado',
  curing: 'Curado',
  storage: 'Almacenamiento',
  processing: 'Procesamiento',
};

// Category-based color map (fallback when activity_type_info has no custom color)
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
  phase_id: string;
  activity_name: string;
  activity_order: number;
  activity_type: string;
  is_recurring: boolean;
  is_quality_check: boolean;
  timing_configuration: { days_from_phase_start: number; time_of_day?: string };
  estimated_duration_minutes?: number;
  instructions?: string;
  activity_template_id?: string;
  duration_type?: string;
  duration_value?: number;
  resource_count: number;
  activity_type_info?: ActivityTypeInfo | null;
  phase_role?: 'entry' | 'exit';
}

// ── Activity Card ────────────────────────────────────────────────────────────

function ActivityCard({
  activity,
  currentDay,
}: {
  activity: ActivityData;
  currentDay: number;
}) {
  const startDay = activity.timing_configuration.days_from_phase_start + 1;
  const isOngoingDay =
    activity.duration_type === 'days' &&
    activity.duration_value != null &&
    activity.duration_value > 1 &&
    currentDay > startDay;

  // Derive colors from activity_type_info (backend) → category fallback → gray default
  const info = activity.activity_type_info;
  const categoryColors = info ? CATEGORY_COLORS[info.category] : undefined;
  const defaultColors = { border: 'border-gray-300 bg-gray-50', badge: 'bg-gray-100 text-gray-700' };
  const colors = categoryColors ?? defaultColors;

  const borderBg = colors.border;
  const badgeColor = colors.badge;
  const typeLabel = info?.name ?? activity.activity_type;

  // Duration display
  let durationText: string | null = null;
  if (activity.duration_type === 'days' && activity.duration_value != null) {
    durationText = `${activity.duration_value} días`;
  } else if (activity.estimated_duration_minutes != null) {
    const mins = activity.estimated_duration_minutes;
    durationText = mins >= 60 ? `${Math.round(mins / 60)}h` : `${mins}min`;
  }

  // Day X/N badge for ongoing spans
  let dayProgressLabel: string | null = null;
  if (isOngoingDay && activity.duration_value != null) {
    const dayWithinActivity = currentDay - startDay + 1;
    dayProgressLabel = `Día ${dayWithinActivity}/${activity.duration_value}`;
  }

  return (
    <div
      className={`border-l-4 rounded-md p-3 flex flex-col gap-1.5 ${borderBg}`}
    >
      {/* Name row */}
      <div className="flex items-start justify-between gap-2">
        <span className="font-medium text-sm leading-snug">
          {activity.activity_name}
        </span>
        <div className="flex items-center gap-1 flex-shrink-0">
          {activity.is_recurring && (
            <span title="Actividad recurrente">
              <RefreshCw className="h-3.5 w-3.5 text-gray-500" />
            </span>
          )}
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
        {activity.phase_role === 'entry' && (
          <span className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium bg-green-100 text-green-700">
            Entrada
          </span>
        )}
        {activity.phase_role === 'exit' && (
          <span className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-700">
            Salida
          </span>
        )}
        <span
          className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${badgeColor}`}
        >
          {typeLabel}
        </span>
        {durationText && (
          <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium bg-white/70 text-gray-600 border border-gray-200">
            <Clock className="h-3 w-3" />
            {durationText}
          </span>
        )}
        {dayProgressLabel && (
          <span className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium bg-white/70 text-gray-500 border border-gray-200">
            {dayProgressLabel}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Main view ────────────────────────────────────────────────────────────────

export function PhaseDetailView() {
  const params = useParams();
  const router = useRouter();
  const { currentCompanyId } = useFacility();

  const templateId = params.id as string;
  const phaseId = params.phaseId as string;

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addDialogDay, setAddDialogDay] = useState(1);

  const phase = useQuery(api.templatePhases.getById, {
    phaseId: phaseId as Id<'template_phases'>,
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
        <Button onClick={() => router.push(`/templates/${templateId}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al Template
        </Button>
      </div>
    );
  }

  const activities: ActivityData[] = phase.activities ?? [];
  const totalDays = phase.estimated_duration_days;
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);

  // Build a map: day -> activities visible on that day
  function getActivitiesForDay(day: number): ActivityData[] {
    return activities.filter((act) => {
      const startDay = act.timing_configuration.days_from_phase_start + 1;
      const isStart = startDay === day;
      const isOngoing =
        act.duration_type === 'days' &&
        act.duration_value != null &&
        act.duration_value > 1 &&
        day > startDay &&
        day < startDay + act.duration_value;
      return isStart || isOngoing;
    });
  }

  function handleAddClick(day: number) {
    setAddDialogDay(day);
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
          { label: 'Templates', href: '/templates' },
          {
            label: phase.templateName ?? 'Template',
            href: `/templates/${templateId}`,
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
                  {phase.estimated_duration_days} días
                </span>
              }
            />
            <InfoRow
              label="Tipo de área"
              value={AREA_TYPE_LABELS[phase.area_type] ?? phase.area_type}
            />
            {phase.description && (
              <InfoRow label="Descripción" value={phase.description} />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Day Schedule */}
      <div className="space-y-4">
        {/* Section header */}
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

        {/* Day rows */}
        <div className="space-y-2">
          {days.map((day) => {
            const dayActivities = getActivitiesForDay(day);

            return (
              <div
                key={day}
                className="flex gap-3 items-start rounded-lg border bg-white p-3"
              >
                {/* Day label */}
                <div className="flex-shrink-0 w-16 pt-0.5">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Día {day}
                  </span>
                </div>

                {/* Activities */}
                <div className="flex-1 min-w-0">
                  {dayActivities.length > 0 ? (
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {dayActivities.map((act) => (
                        <ActivityCard
                          key={`${act._id}-day${day}`}
                          activity={act}
                          currentDay={day}
                        />
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
                    onClick={() => handleAddClick(day)}
                    title={`Agregar actividad al día ${day}`}
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
        <AddActivityDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          phaseId={phaseId as Id<'template_phases'>}
          phaseAreaType={phase.area_type}
          day={addDialogDay}
          companyId={currentCompanyId}
        />
      )}
    </div>
  );
}

// ── InfoRow helper ───────────────────────────────────────────────────────────

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
