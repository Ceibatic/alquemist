'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
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
import { ActivityExecutionSheet } from '@/components/activities/activity-execution-sheet';
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

interface TodayActivitiesWidgetProps {
  companyId: Id<'companies'>;
  variant: 'full' | 'compact';
}

export function TodayActivitiesWidget({ companyId, variant }: TodayActivitiesWidgetProps) {
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

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // Today's activities
  const todayActivities = useQuery(
    api.cultivationSchedules.getScheduledForDate,
    {
      companyId,
      dateStart: startOfDay.getTime(),
      dateEnd: endOfDay.getTime(),
    }
  );

  // Upcoming 3 days
  const next3DaysEnd = new Date();
  next3DaysEnd.setDate(next3DaysEnd.getDate() + 3);
  next3DaysEnd.setHours(23, 59, 59, 999);

  const upcomingActivities = useQuery(
    api.cultivationSchedules.getScheduledForDate,
    {
      companyId,
      dateStart: endOfDay.getTime() + 1,
      dateEnd: next3DaysEnd.getTime(),
    }
  );

  // Overdue
  const overdueActivities = useQuery(
    api.cultivationSchedules.getOverdue,
    {
      companyId,
      beforeDate: startOfDay.getTime(),
    }
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

  // Loading state
  if (todayActivities === undefined || overdueActivities === undefined) {
    return <Skeleton className="h-48 w-full" />;
  }

  // Compact variant for admin dashboard — just show counts
  if (variant === 'compact') {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarCheck className="h-5 w-5 text-blue-500" />
            Actividades de Hoy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{pendingToday}</div>
              <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Clock className="h-3 w-3" /> Pendientes
              </div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${overdueCount > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                {overdueCount}
              </div>
              <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Atrasadas
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{completedToday}</div>
              <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <CheckCircle className="h-3 w-3" /> Completadas
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full variant for operative dashboard
  const noActivities = todayActivities.length === 0 && overdueCount === 0;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <CalendarCheck className="h-5 w-5 text-blue-500" />
        Actividades de Hoy
      </h2>

      {noActivities ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-gray-400">
            <CalendarCheck className="h-8 w-8 mb-2" />
            <span className="text-sm">Sin actividades programadas para hoy</span>
          </CardContent>
        </Card>
      ) : (
        <>
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
              {todayActivities.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
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
        </>
      )}

      {/* Upcoming 3 days — collapsible */}
      <Collapsible open={upcomingOpen} onOpenChange={setUpcomingOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4" />
                  Proximos 3 dias ({(upcomingActivities ?? []).length})
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
                  No hay actividades en los proximos 3 dias
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

      {/* Execution sheet */}
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
    </div>
  );
}

// Activity row component
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
