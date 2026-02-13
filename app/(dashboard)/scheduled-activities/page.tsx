'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { useFacility } from '@/components/providers/facility-provider';
import { ActivityExecutionSheet } from '@/components/activities/activity-execution-sheet';
import { ScheduleActivityDialog } from '@/components/activities/schedule-activity-dialog';
import { toast } from 'sonner';
import {
  CalendarCheck,
  Clock,
  AlertTriangle,
  CheckCircle,
  SkipForward,
  ChevronDown,
  Loader2,
  ClipboardList,
} from 'lucide-react';

export default function ScheduledActivitiesPage() {
  const { currentCompanyId, isLoading: facilityLoading } = useFacility();

  const [skipDialogOpen, setSkipDialogOpen] = useState(false);
  const [activityToSkip, setActivityToSkip] = useState<Id<'scheduled_activities'> | null>(null);
  const [skipReason, setSkipReason] = useState('');
  const [isSkipping, setIsSkipping] = useState(false);
  const [upcomingOpen, setUpcomingOpen] = useState(false);

  // Execution sheet state
  const [executionSheetOpen, setExecutionSheetOpen] = useState(false);
  const [executionContext, setExecutionContext] = useState<{
    templateId?: Id<'activity_templates'>;
    scheduledActivityId?: Id<'scheduled_activities'>;
    groupId?: string;
    entityType?: string;
    entityId?: string;
    phase?: string;
    batchIds?: string[];
  } | null>(null);

  // Schedule dialog state
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);

  // Ad-hoc execution (no scheduled activity)
  const [adhocSheetOpen, setAdhocSheetOpen] = useState(false);

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // Today's activities
  const todayActivities = useQuery(
    api.cultivationSchedules.getScheduledForDate,
    currentCompanyId
      ? {
          companyId: currentCompanyId,
          dateStart: startOfDay.getTime(),
          dateEnd: endOfDay.getTime(),
        }
      : 'skip' as any
  );

  // Upcoming 7 days
  const nextWeekEnd = new Date();
  nextWeekEnd.setDate(nextWeekEnd.getDate() + 7);
  nextWeekEnd.setHours(23, 59, 59, 999);

  const upcomingActivities = useQuery(
    api.cultivationSchedules.getScheduledForDate,
    currentCompanyId
      ? {
          companyId: currentCompanyId,
          dateStart: endOfDay.getTime() + 1,
          dateEnd: nextWeekEnd.getTime(),
        }
      : 'skip' as any
  );

  // Overdue
  const overdueActivities = useQuery(
    api.cultivationSchedules.getOverdue,
    currentCompanyId
      ? {
          companyId: currentCompanyId,
          beforeDate: startOfDay.getTime(),
        }
      : 'skip' as any
  );

  const skipMutation = useMutation(api.cultivationSchedules.skipScheduledActivity);

  // Stats
  const pendingToday = (todayActivities ?? []).filter((a) => a.status === 'pending').length;
  const completedToday = (todayActivities ?? []).filter((a) => a.status === 'completed').length;
  const overdueCount = (overdueActivities ?? []).length;

  // Group today's activities by batch
  const todayByBatch = useMemo(() => {
    if (!todayActivities) return new Map<string, NonNullable<typeof todayActivities>>();
    const map = new Map<string, typeof todayActivities>();
    for (const a of todayActivities) {
      const batchKey = a.batchName ?? a.entity_id;
      const list = map.get(batchKey) ?? [];
      list.push(a);
      map.set(batchKey, list);
    }
    return map;
  }, [todayActivities]);

  const handleSkip = async () => {
    if (!activityToSkip || !skipReason.trim()) {
      toast.error('Ingresa una razon para saltar la actividad');
      return;
    }

    try {
      setIsSkipping(true);
      await skipMutation({
        scheduledActivityId: activityToSkip,
        reason: skipReason.trim(),
      });
      toast.success('Actividad saltada');
      setSkipDialogOpen(false);
      setSkipReason('');
      setActivityToSkip(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al saltar');
    } finally {
      setIsSkipping(false);
    }
  };

  const handleReport = (activity: any) => {
    setExecutionContext({
      templateId: activity.template_id ?? undefined,
      scheduledActivityId: activity._id as Id<'scheduled_activities'>,
      groupId: activity.group_id ?? undefined,
      entityType: activity.entity_type ?? 'batch',
      entityId: activity.entity_id,
      phase: activity.crop_phase ?? undefined,
      batchIds: activity.entity_type === 'batch' ? [activity.entity_id] : undefined,
    });
    setExecutionSheetOpen(true);
  };

  if (facilityLoading || !currentCompanyId) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <PageHeader
          title="Actividades Programadas"
          icon={CalendarCheck}
          breadcrumbs={[
            { label: 'Inicio', href: '/dashboard' },
            { label: 'Actividades Programadas' },
          ]}
          description="Actividades pendientes de hoy y proximos dias"
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setScheduleDialogOpen(true)}
          >
            <CalendarCheck className="h-3.5 w-3.5 mr-1" />
            Programar Actividad
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setAdhocSheetOpen(true)}
          >
            <ClipboardList className="h-3.5 w-3.5 mr-1" />
            Reportar Ad-hoc
          </Button>
        </div>
      </div>

      {/* Stats header */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{pendingToday}</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Clock className="h-3 w-3" /> Pendientes hoy
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className={`text-2xl font-bold ${overdueCount > 0 ? 'text-red-600' : ''}`}>
              {overdueCount}
            </div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <AlertTriangle className="h-3 w-3" /> Atrasadas
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-green-600">{completedToday}</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <CheckCircle className="h-3 w-3" /> Completadas hoy
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overdue section */}
      {overdueCount > 0 && (
        <Card className="border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              Atrasadas ({overdueCount})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(overdueActivities ?? []).map((a) => (
                <ActivityRow
                  key={a._id}
                  activity={a}
                  isOverdue
                  onSkip={() => {
                    setActivityToSkip(a._id);
                    setSkipDialogOpen(true);
                  }}
                  onReport={() => handleReport(a)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Hoy — {new Date().toLocaleDateString('es', { weekday: 'long', month: 'long', day: 'numeric' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayActivities === undefined ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : todayActivities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No hay actividades programadas para hoy
            </p>
          ) : (
            <div className="space-y-4">
              {Array.from(todayByBatch.entries()).map(([batchName, activities]) => (
                <div key={batchName}>
                  <h4 className="text-sm font-medium mb-2 text-muted-foreground">
                    {batchName}
                  </h4>
                  <div className="space-y-2">
                    {activities.map((a) => (
                      <ActivityRow
                        key={a._id}
                        activity={a}
                        onSkip={() => {
                          setActivityToSkip(a._id);
                          setSkipDialogOpen(true);
                        }}
                        onReport={() => handleReport(a)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming 7 days — collapsible */}
      <Collapsible open={upcomingOpen} onOpenChange={setUpcomingOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4" />
                  Proximos 7 dias ({(upcomingActivities ?? []).length})
                </span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${upcomingOpen ? 'rotate-180' : ''}`}
                />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              {upcomingActivities === undefined ? (
                <Skeleton className="h-32 w-full" />
              ) : upcomingActivities.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay actividades en los proximos 7 dias
                </p>
              ) : (
                <div className="space-y-2">
                  {upcomingActivities.map((a) => (
                    <ActivityRow key={a._id} activity={a} />
                  ))}
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Skip dialog */}
      <Dialog open={skipDialogOpen} onOpenChange={setSkipDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Saltar actividad</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Razon *</Label>
              <Textarea
                value={skipReason}
                onChange={(e) => setSkipReason(e.target.value)}
                placeholder="Ej: Condiciones climaticas no permiten la aplicacion"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSkipDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSkip}
              disabled={isSkipping}
              className="bg-yellow-500 hover:bg-yellow-600"
            >
              {isSkipping ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <SkipForward className="mr-2 h-4 w-4" />
              )}
              Saltar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Execution sheet — from scheduled activity */}
      {executionContext && (
        <ActivityExecutionSheet
          open={executionSheetOpen}
          onOpenChange={setExecutionSheetOpen}
          templateId={executionContext.templateId}
          scheduledActivityId={executionContext.scheduledActivityId}
          groupId={executionContext.groupId}
          entityType={executionContext.entityType}
          entityId={executionContext.entityId}
          phase={executionContext.phase}
          batchIds={executionContext.batchIds}
          onCompleted={() => {
            setExecutionSheetOpen(false);
            setExecutionContext(null);
          }}
        />
      )}

      {/* Ad-hoc execution sheet */}
      <ActivityExecutionSheet
        open={adhocSheetOpen}
        onOpenChange={setAdhocSheetOpen}
        onCompleted={() => setAdhocSheetOpen(false)}
      />

      {/* Schedule dialog */}
      <ScheduleActivityDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        onScheduled={() => setScheduleDialogOpen(false)}
      />
    </div>
  );
}

// Inline component for activity rows
function ActivityRow({
  activity,
  isOverdue,
  onSkip,
  onReport,
}: {
  activity: {
    _id: string;
    activity_type: string;
    scheduled_date: number;
    status: string;
    batchName?: string | null;
    templateName?: string | null;
    activityTypeName?: string | null;
    crop_phase?: string | null;
    estimated_duration_minutes?: number | null;
  };
  isOverdue?: boolean;
  onSkip?: () => void;
  onReport?: () => void;
}) {
  const date = new Date(activity.scheduled_date);
  const displayName = activity.templateName ?? activity.activityTypeName ?? activity.activity_type;

  const StatusIcon = activity.status === 'completed'
    ? CheckCircle
    : activity.status === 'skipped'
      ? SkipForward
      : isOverdue
        ? AlertTriangle
        : Clock;

  const statusColor = activity.status === 'completed'
    ? 'text-green-600'
    : activity.status === 'skipped'
      ? 'text-yellow-600'
      : isOverdue
        ? 'text-red-600'
        : 'text-gray-500';

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border ${
        isOverdue ? 'border-red-200 bg-red-50' : 'bg-muted/30'
      }`}
    >
      <StatusIcon className={`h-4 w-4 flex-shrink-0 ${statusColor}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{displayName}</span>
          {activity.batchName && (
            <Badge variant="outline" className="text-xs">
              {activity.batchName}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{date.toLocaleDateString()}</span>
          {activity.crop_phase && (
            <>
              <span>·</span>
              <span>{activity.crop_phase}</span>
            </>
          )}
          {activity.estimated_duration_minutes && (
            <>
              <span>·</span>
              <span>{activity.estimated_duration_minutes}min</span>
            </>
          )}
        </div>
      </div>

      {activity.status === 'pending' && (
        <div className="flex items-center gap-1">
          {onReport && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onReport}
              className="text-amber-600 hover:text-amber-700"
              title={activity.templateName ?? 'Reportar actividad'}
            >
              <ClipboardList className="h-3 w-3 mr-1" />
              Reportar
            </Button>
          )}
          {onSkip && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onSkip}
              className="text-yellow-600 hover:text-yellow-700"
            >
              <SkipForward className="h-3 w-3 mr-1" />
              Saltar
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
