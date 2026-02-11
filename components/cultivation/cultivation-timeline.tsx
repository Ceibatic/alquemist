'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ScheduleCreationDialog } from './schedule-creation-dialog';
import { ScheduledActivityCard } from './scheduled-activity-card';
import { toast } from 'sonner';
import {
  Calendar,
  Play,
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
  Loader2,
  RefreshCw,
} from 'lucide-react';

const PHASE_LABELS: Record<string, string> = {
  propagation: 'Propagacion',
  vegetative: 'Vegetativo',
  flowering: 'Floracion',
  harvest: 'Cosecha',
  drying: 'Secado',
  curing: 'Curado',
  post_harvest: 'Poscosecha',
  processing: 'Procesamiento',
  storage: 'Almacenamiento',
};

const PHASE_COLORS: Record<string, string> = {
  propagation: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  vegetative: 'bg-green-100 text-green-800 border-green-300',
  flowering: 'bg-purple-100 text-purple-800 border-purple-300',
  harvest: 'bg-red-100 text-red-800 border-red-300',
  drying: 'bg-amber-100 text-amber-800 border-amber-300',
  curing: 'bg-orange-100 text-orange-800 border-orange-300',
  post_harvest: 'bg-pink-100 text-pink-800 border-pink-300',
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendiente', color: 'bg-gray-100 text-gray-700' },
  completed: { label: 'Completada', color: 'bg-green-100 text-green-700' },
  skipped: { label: 'Saltada', color: 'bg-yellow-100 text-yellow-700' },
  overdue: { label: 'Atrasada', color: 'bg-red-100 text-red-700' },
  in_progress: { label: 'En progreso', color: 'bg-blue-100 text-blue-700' },
};

interface CultivationTimelineProps {
  batchId: Id<'batches'>;
  companyId: Id<'companies'>;
  cropTypeId?: Id<'crop_types'>;
}

export function CultivationTimeline({
  batchId,
  companyId,
  cropTypeId,
}: CultivationTimelineProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState<string | null>(null);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  const schedule = useQuery(api.cultivationSchedules.getByBatch, { batchId });
  const scheduledActivities = useQuery(
    api.cultivationSchedules.getScheduledForDate,
    schedule
      ? {
          companyId,
          dateStart: 0,
          dateEnd: Date.now() + 365 * 24 * 60 * 60 * 1000, // next year
        }
      : 'skip' as any
  );

  const generateMutation = useMutation(api.cultivationSchedules.generateFromSchedule);
  const activateMutation = useMutation(api.cultivationSchedules.activate);

  // Filter activities for this schedule
  const scheduleActivities = (scheduledActivities ?? []).filter(
    (a) => a.schedule_id === schedule?._id
  );

  const now = Date.now();

  // Determine overdue
  const activitiesWithOverdue = scheduleActivities.map((a) => ({
    ...a,
    isOverdue: a.status === 'pending' && a.scheduled_date < now,
  }));

  // Apply filters
  let filteredActivities = activitiesWithOverdue;
  if (selectedPhaseFilter) {
    filteredActivities = filteredActivities.filter(
      (a) => a.crop_phase === selectedPhaseFilter
    );
  }
  if (selectedStatusFilter) {
    if (selectedStatusFilter === 'overdue') {
      filteredActivities = filteredActivities.filter((a) => a.isOverdue);
    } else {
      filteredActivities = filteredActivities.filter(
        (a) => a.status === selectedStatusFilter
      );
    }
  }

  // Group by phase
  const phases = schedule?.planned_phases as Array<{
    phase: string;
    duration_days: number;
    start_day: number;
    end_day: number;
  }> ?? [];

  const activitiesByPhase = new Map<string, typeof filteredActivities>();
  for (const activity of filteredActivities) {
    const phase = activity.crop_phase ?? 'unknown';
    const list = activitiesByPhase.get(phase) ?? [];
    list.push(activity);
    activitiesByPhase.set(phase, list);
  }

  // Stats
  const totalActivities = scheduleActivities.length;
  const completedCount = scheduleActivities.filter((a) => a.status === 'completed').length;
  const pendingToday = scheduleActivities.filter(
    (a) => a.status === 'pending' && a.scheduled_date >= now - 86400000 && a.scheduled_date < now + 86400000
  ).length;
  const overdueCount = scheduleActivities.filter(
    (a) => a.status === 'pending' && a.scheduled_date < now
  ).length;

  const handleGenerate = async () => {
    if (!schedule) return;
    try {
      setIsGenerating(true);
      const result = await generateMutation({ scheduleId: schedule._id });
      toast.success(`${result.generated} actividades generadas`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al generar');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleActivate = async () => {
    if (!schedule) return;
    try {
      setIsActivating(true);
      await activateMutation({ scheduleId: schedule._id });
      toast.success('Plan activado');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al activar');
    } finally {
      setIsActivating(false);
    }
  };

  // Loading
  if (schedule === undefined) {
    return <Skeleton className="h-64 w-full" />;
  }

  // No schedule exists — show creation prompt
  if (schedule === null) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-1">Sin plan de cultivo</h3>
          <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
            Este batch no tiene plan de cultivo. Crea uno para programar actividades
            automaticamente desde los templates definidos.
          </p>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="bg-amber-500 hover:bg-amber-600"
          >
            <Plus className="mr-2 h-4 w-4" />
            Crear plan de cultivo
          </Button>

          <ScheduleCreationDialog
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
            batchId={batchId}
            companyId={companyId}
            cropTypeId={cropTypeId}
          />
        </CardContent>
      </Card>
    );
  }

  const progressPct = totalActivities > 0
    ? Math.round((completedCount / totalActivities) * 100)
    : 0;

  return (
    <div className="space-y-4">
      {/* Header with progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {schedule.name}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{schedule.status}</Badge>
                {schedule.current_phase && (
                  <Badge className={PHASE_COLORS[schedule.current_phase] ?? ''}>
                    {PHASE_LABELS[schedule.current_phase] ?? schedule.current_phase}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {schedule.status === 'draft' && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-1 h-3 w-3" />
                    )}
                    {totalActivities > 0 ? 'Regenerar' : 'Generar'} actividades
                  </Button>
                  {totalActivities > 0 && (
                    <Button
                      size="sm"
                      onClick={handleActivate}
                      disabled={isActivating}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isActivating ? (
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      ) : (
                        <Play className="mr-1 h-3 w-3" />
                      )}
                      Activar plan
                    </Button>
                  )}
                </>
              )}
              {schedule.status === 'active' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-1 h-3 w-3" />
                  )}
                  Regenerar pendientes
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Progreso</span>
              <span className="font-medium">{progressPct}%</span>
            </div>
            <Progress value={progressPct} className="h-2" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{totalActivities}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{completedCount}</div>
              <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <CheckCircle className="h-3 w-3" /> Completadas
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{pendingToday}</div>
              <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Clock className="h-3 w-3" /> Hoy
              </div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${overdueCount > 0 ? 'text-red-600' : ''}`}>
                {overdueCount}
              </div>
              <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Atrasadas
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={selectedPhaseFilter === null ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setSelectedPhaseFilter(null)}
        >
          Todas las fases
        </Badge>
        {phases.map((p) => (
          <Badge
            key={p.phase}
            variant={selectedPhaseFilter === p.phase ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() =>
              setSelectedPhaseFilter(
                selectedPhaseFilter === p.phase ? null : p.phase
              )
            }
          >
            {PHASE_LABELS[p.phase] ?? p.phase}
          </Badge>
        ))}

        <span className="mx-2 border-l" />

        <Badge
          variant={selectedStatusFilter === null ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setSelectedStatusFilter(null)}
        >
          Todos
        </Badge>
        {['pending', 'completed', 'skipped', 'overdue'].map((s) => (
          <Badge
            key={s}
            variant={selectedStatusFilter === s ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() =>
              setSelectedStatusFilter(
                selectedStatusFilter === s ? null : s
              )
            }
          >
            {STATUS_CONFIG[s]?.label ?? s}
          </Badge>
        ))}
      </div>

      {/* Phase sections */}
      {phases.map((phase) => {
        const phaseActivities = activitiesByPhase.get(phase.phase) ?? [];
        if (selectedPhaseFilter && selectedPhaseFilter !== phase.phase) return null;
        if (phaseActivities.length === 0 && selectedStatusFilter) return null;

        const phaseStart = new Date(
          schedule.planned_start_date + phase.start_day * 86400000
        );
        const phaseEnd = new Date(
          schedule.planned_start_date + phase.end_day * 86400000
        );

        return (
          <Card key={phase.phase}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={PHASE_COLORS[phase.phase] ?? 'bg-gray-100'}>
                    {PHASE_LABELS[phase.phase] ?? phase.phase}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {phase.duration_days} dias
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({phaseStart.toLocaleDateString()} — {phaseEnd.toLocaleDateString()})
                  </span>
                </div>
                <span className="text-sm font-medium">
                  {phaseActivities.length} actividades
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {phaseActivities.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay actividades programadas para esta fase
                </p>
              ) : (
                <div className="space-y-2">
                  {phaseActivities
                    .sort((a, b) => a.scheduled_date - b.scheduled_date)
                    .map((activity) => (
                      <ScheduledActivityCard
                        key={activity._id}
                        activity={activity}
                        isOverdue={activity.isOverdue}
                      />
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
