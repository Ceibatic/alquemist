'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useFacility } from '@/components/providers/facility-provider';
import { ActivityExecutionSheet } from '@/components/activities/activity-execution-sheet';
import { ScheduleActivityDialog } from '@/components/activities/schedule-activity-dialog';
import { toast } from 'sonner';
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  SkipForward,
  CalendarCheck,
  CalendarOff,
  ClipboardList,
  MoreHorizontal,
  CalendarClock,
  Loader2,
  Plus,
  Filter,
  Package,
} from 'lucide-react';

// ── Types ──

export type ScheduleScope =
  | { type: 'global' }
  | { type: 'batch'; batchId: Id<'batches'> }
  | { type: 'order'; orderId: Id<'production_orders'> }
  | { type: 'area'; areaId: Id<'areas'> }
  | { type: 'phase'; areaId: Id<'areas'>; phase: string };

export interface ActivityScheduleProps {
  scope: ScheduleScope;
  compact?: boolean;
  defaultDateRange?: 'today' | 'week' | 'month' | 'all';
  showFilters?: boolean;
  maxItems?: number;
}

type EnrichedActivity = {
  _id: Id<'scheduled_activities'>;
  entity_type: string;
  entity_id: string;
  activity_type: string;
  scheduled_date: number;
  status: string;
  estimated_duration_minutes?: number | null;
  template_id?: Id<'activity_templates'> | null;
  group_id?: string | null;
  crop_phase?: string | null;
  assigned_to?: Id<'users'> | null;
  type_id?: Id<'activity_types'> | null;
  production_order_id?: Id<'production_orders'> | null;
  batchCode: string | null;
  batchPhase: string | null;
  activityTypeName: string | null;
  activityTypeIcon: string | null;
  activityTypeColor: string | null;
  templateName: string | null;
  assignedToName: string | null;
  areaName: string | null;
  resourceCount: number;
};

type DateRangePreset = 'today' | 'week' | 'month' | 'all';

// ── Helpers ──

function getDateRange(range: DateRangePreset) {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  switch (range) {
    case 'today': {
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      return { dateStart: startOfDay.getTime(), dateEnd: endOfDay.getTime() };
    }
    case 'week': {
      const endOfWeek = new Date(startOfDay);
      endOfWeek.setDate(endOfWeek.getDate() + 7);
      return { dateStart: undefined, dateEnd: endOfWeek.getTime() };
    }
    case 'month': {
      const endOfMonth = new Date(startOfDay);
      endOfMonth.setDate(endOfMonth.getDate() + 30);
      return { dateStart: undefined, dateEnd: endOfMonth.getTime() };
    }
    case 'all':
      return { dateStart: undefined, dateEnd: undefined };
  }
}

function getStartOfDay(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function formatDateLabel(dateKey: string, todayKey: string): string {
  if (dateKey === 'overdue') return 'Vencidas';
  if (dateKey === todayKey) return 'Hoy';
  const date = new Date(dateKey);
  return date.toLocaleDateString('es', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

type DateGroup = {
  key: string;
  label: string;
  isOverdue: boolean;
  isToday: boolean;
  activities: EnrichedActivity[];
};

function groupByDate(activities: EnrichedActivity[]): DateGroup[] {
  const now = new Date();
  const todayStart = getStartOfDay(now);
  const todayKey = new Date(todayStart).toISOString().slice(0, 10);

  const groups = new Map<string, EnrichedActivity[]>();
  const overdueActivities: EnrichedActivity[] = [];

  for (const a of activities) {
    const actDate = new Date(a.scheduled_date);
    const actDateStart = getStartOfDay(actDate);
    const actKey = actDate.toISOString().slice(0, 10);

    if (
      (a.status === 'pending' || a.status === 'in_progress') &&
      actDateStart < todayStart
    ) {
      overdueActivities.push(a);
    } else {
      const list = groups.get(actKey) ?? [];
      list.push(a);
      groups.set(actKey, list);
    }
  }

  const result: DateGroup[] = [];

  if (overdueActivities.length > 0) {
    result.push({
      key: 'overdue',
      label: 'Vencidas',
      isOverdue: true,
      isToday: false,
      activities: overdueActivities,
    });
  }

  const sortedKeys = [...groups.keys()].sort();
  for (const key of sortedKeys) {
    result.push({
      key,
      label: formatDateLabel(key, todayKey),
      isOverdue: false,
      isToday: key === todayKey,
      activities: groups.get(key)!,
    });
  }

  return result;
}

const DATE_RANGE_LABELS: Record<DateRangePreset, string> = {
  today: 'Hoy',
  week: 'Esta semana',
  month: 'Este mes',
  all: 'Todas',
};

// ── Component ──

export function ActivitySchedule({
  scope,
  compact = false,
  defaultDateRange = 'week',
  showFilters: showFiltersProp,
  maxItems = 50,
}: ActivityScheduleProps) {
  const { currentCompanyId } = useFacility();
  const showFilters = showFiltersProp ?? !compact;

  // Filter state
  const [dateRangePreset, setDateRangePreset] = useState<DateRangePreset>(defaultDateRange);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Schedule dialog state
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);

  // Action state
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
  const [skipDialogOpen, setSkipDialogOpen] = useState(false);
  const [activityToSkip, setActivityToSkip] = useState<Id<'scheduled_activities'> | null>(null);
  const [skipReason, setSkipReason] = useState('');
  const [isSkipping, setIsSkipping] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState<Id<'scheduled_activities'> | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);

  const skipMutation = useMutation(api.cultivationSchedules.skipScheduledActivity);
  const rescheduleMutation = useMutation(api.cultivationSchedules.rescheduleActivity);

  // Activity types for filter
  const activityTypes = useQuery(
    api.activityTypes.list,
    currentCompanyId ? { companyId: currentCompanyId } : 'skip'
  );

  const dateRange = getDateRange(dateRangePreset);

  const activities = useQuery(
    api.scheduledActivities.listForSchedule,
    currentCompanyId
      ? {
          companyId: currentCompanyId,
          scope,
          dateStart: dateRange.dateStart,
          dateEnd: dateRange.dateEnd,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          typeId: typeFilter !== 'all' ? (typeFilter as Id<'activity_types'>) : undefined,
          limit: maxItems,
        }
      : 'skip'
  ) as EnrichedActivity[] | undefined;

  const dateGroups = useMemo(() => {
    if (!activities) return [];
    return groupByDate(activities);
  }, [activities]);

  // Stats
  const stats = useMemo(() => {
    if (!activities) return { overdue: 0, today: 0, upcoming: 0, completed: 0 };
    const todayStart = getStartOfDay(new Date());
    const todayEnd = todayStart + 24 * 60 * 60 * 1000;
    return {
      overdue: activities.filter(
        (a) =>
          (a.status === 'pending' || a.status === 'in_progress') &&
          a.scheduled_date < todayStart
      ).length,
      today: activities.filter(
        (a) =>
          (a.status === 'pending' || a.status === 'in_progress') &&
          a.scheduled_date >= todayStart &&
          a.scheduled_date < todayEnd
      ).length,
      upcoming: activities.filter(
        (a) =>
          (a.status === 'pending' || a.status === 'in_progress') &&
          a.scheduled_date >= todayStart + 24 * 60 * 60 * 1000
      ).length,
      completed: activities.filter((a) => a.status === 'completed').length,
    };
  }, [activities]);

  // Derive schedule dialog context from scope
  const scheduleDialogContext = useMemo(() => {
    switch (scope.type) {
      case 'area':
        return { fromAreaId: scope.areaId };
      case 'batch':
        return { fromBatchId: scope.batchId };
      case 'order':
        return { fromOrderId: scope.orderId };
      case 'phase':
        return { fromAreaId: scope.areaId, fromPhase: scope.phase };
      default:
        return {};
    }
  }, [scope]);

  // Action handlers
  const handleReport = (activity: EnrichedActivity) => {
    setExecutionContext({
      templateId: activity.template_id ?? undefined,
      scheduledActivityId: activity._id,
      groupId: activity.group_id ?? undefined,
      entityType: activity.entity_type ?? 'batch',
      entityId: activity.entity_id,
      phase: activity.crop_phase ?? undefined,
      batchIds: activity.entity_type === 'batch' ? [activity.entity_id] : undefined,
    });
    setExecutionSheetOpen(true);
  };

  const handleSkipRequest = (activityId: Id<'scheduled_activities'>) => {
    setActivityToSkip(activityId);
    setSkipReason('');
    setSkipDialogOpen(true);
  };

  const handleSkipConfirm = async () => {
    if (!activityToSkip || !skipReason.trim()) {
      toast.error('Ingresa una razon para saltar la actividad');
      return;
    }
    try {
      setIsSkipping(true);
      await skipMutation({ scheduledActivityId: activityToSkip, reason: skipReason.trim() });
      toast.success('Actividad saltada');
      setSkipDialogOpen(false);
      setActivityToSkip(null);
      setSkipReason('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al saltar');
    } finally {
      setIsSkipping(false);
    }
  };

  const handleRescheduleRequest = (activityId: Id<'scheduled_activities'>) => {
    setRescheduleTarget(activityId);
    setRescheduleDate('');
    setRescheduleDialogOpen(true);
  };

  const handleRescheduleConfirm = async () => {
    if (!rescheduleTarget || !rescheduleDate) {
      toast.error('Selecciona una fecha');
      return;
    }
    try {
      setIsRescheduling(true);
      const newDate = new Date(rescheduleDate);
      newDate.setHours(8, 0, 0, 0);
      await rescheduleMutation({
        scheduledActivityId: rescheduleTarget,
        newDate: newDate.getTime(),
      });
      toast.success('Actividad reprogramada');
      setRescheduleDialogOpen(false);
      setRescheduleTarget(null);
      setRescheduleDate('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al reprogramar');
    } finally {
      setIsRescheduling(false);
    }
  };

  // Filter controls component
  const filterControls = (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={dateRangePreset} onValueChange={(v) => setDateRangePreset(v as DateRangePreset)}>
        <SelectTrigger className="h-8 w-[130px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.entries(DATE_RANGE_LABELS) as [DateRangePreset, string][]).map(([key, label]) => (
            <SelectItem key={key} value={key} className="text-xs">{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="h-8 w-[130px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-xs">Todos los estados</SelectItem>
          <SelectItem value="pending" className="text-xs">Pendientes</SelectItem>
          <SelectItem value="completed" className="text-xs">Completadas</SelectItem>
          <SelectItem value="skipped" className="text-xs">Saltadas</SelectItem>
        </SelectContent>
      </Select>

      {activityTypes && activityTypes.length > 0 && (
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-8 w-[150px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">Todos los tipos</SelectItem>
            {activityTypes.map((t) => (
              <SelectItem key={t._id} value={t._id} className="text-xs">
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );

  // Loading
  if (activities === undefined) {
    return <ScheduleSkeleton compact={compact} />;
  }

  return (
    <div className="space-y-3">
      {/* Header — compact: single line with stats + actions */}
      {compact ? (
        <div className="flex items-center justify-between gap-2">
          <ScheduleHeader stats={stats} compact />
          <div className="flex items-center gap-1 shrink-0">
            <Popover>
              <PopoverTrigger asChild>
                <Button size="sm" variant="ghost" className="h-7 px-2">
                  <Filter className="h-3 w-3 mr-1" />
                  Filtrar
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3" align="end">
                <div className="space-y-2">
                  {filterControls}
                </div>
              </PopoverContent>
            </Popover>
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2"
              onClick={() => setScheduleDialogOpen(true)}
            >
              <Plus className="h-3 w-3 mr-1" />
              Programar
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Full mode: stats + schedule button */}
          <div className="flex items-center justify-between gap-2">
            <ScheduleHeader stats={stats} compact={false} />
            <Button
              size="sm"
              variant="outline"
              onClick={() => setScheduleDialogOpen(true)}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Programar
            </Button>
          </div>
          {/* Full mode: filter toolbar */}
          {showFilters && filterControls}
        </>
      )}

      {/* Content area — with max-height scroll in compact mode */}
      {activities.length === 0 ? (
        <ScheduleEmpty />
      ) : (
        <div className={compact ? 'max-h-[400px] overflow-y-auto space-y-3' : 'space-y-3'}>
          {dateGroups.map((group) => (
            <ScheduleDateGroup
              key={group.key}
              group={group}
              compact={compact}
              scope={scope}
              onReport={handleReport}
              onSkip={handleSkipRequest}
              onReschedule={handleRescheduleRequest}
            />
          ))}
        </div>
      )}

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
              onClick={handleSkipConfirm}
              disabled={isSkipping || !skipReason.trim()}
              className="bg-yellow-500 hover:bg-yellow-600"
            >
              {isSkipping && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <SkipForward className="mr-1 h-4 w-4" />
              Saltar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule dialog */}
      <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Reprogramar actividad</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nueva fecha *</Label>
              <Input
                type="date"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleRescheduleConfirm}
              disabled={isRescheduling || !rescheduleDate}
            >
              {isRescheduling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <CalendarClock className="mr-1 h-4 w-4" />
              Reprogramar
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

      {/* Schedule activity dialog */}
      <ScheduleActivityDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        {...scheduleDialogContext}
        onScheduled={() => setScheduleDialogOpen(false)}
      />
    </div>
  );
}

// ── Sub-components ──

function ScheduleHeader({
  stats,
  compact,
}: {
  stats: { overdue: number; today: number; upcoming: number; completed: number };
  compact: boolean;
}) {
  return (
    <div className={`flex items-center gap-2 flex-wrap ${compact ? '' : 'mb-1'}`}>
      {stats.overdue > 0 && (
        <Badge variant="destructive" className="text-xs">
          <AlertTriangle className="h-3 w-3 mr-1" />
          {stats.overdue} vencidas
        </Badge>
      )}
      {stats.today > 0 && (
        <Badge className="text-xs bg-amber-100 text-amber-800 hover:bg-amber-100">
          <Clock className="h-3 w-3 mr-1" />
          {stats.today} hoy
        </Badge>
      )}
      {stats.upcoming > 0 && (
        <Badge variant="secondary" className="text-xs">
          <CalendarCheck className="h-3 w-3 mr-1" />
          {stats.upcoming} proximas
        </Badge>
      )}
      {stats.completed > 0 && (
        <Badge variant="outline" className="text-xs text-green-600 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          {stats.completed} completadas
        </Badge>
      )}
    </div>
  );
}

function ScheduleDateGroup({
  group,
  compact,
  scope,
  onReport,
  onSkip,
  onReschedule,
}: {
  group: DateGroup;
  compact: boolean;
  scope: ScheduleScope;
  onReport: (activity: EnrichedActivity) => void;
  onSkip: (activityId: Id<'scheduled_activities'>) => void;
  onReschedule: (activityId: Id<'scheduled_activities'>) => void;
}) {
  return (
    <div
      className={`rounded-lg border ${
        group.isOverdue
          ? 'border-red-200 bg-red-50/50'
          : group.isToday
            ? 'border-amber-200 bg-amber-50/30'
            : 'border-border'
      }`}
    >
      <div className="px-3 py-2 border-b border-border/50">
        <h4
          className={`text-sm font-medium ${
            group.isOverdue
              ? 'text-red-600'
              : group.isToday
                ? 'text-amber-700'
                : 'text-muted-foreground'
          }`}
        >
          {group.label}
          <span className="ml-2 text-xs font-normal">({group.activities.length})</span>
        </h4>
      </div>
      <div className="divide-y divide-border/50">
        {group.activities.map((activity) => (
          <ScheduleActivityRow
            key={activity._id}
            activity={activity}
            isOverdue={group.isOverdue}
            compact={compact}
            scope={scope}
            onReport={onReport}
            onSkip={onSkip}
            onReschedule={onReschedule}
          />
        ))}
      </div>
    </div>
  );
}

function ScheduleActivityRow({
  activity,
  isOverdue,
  compact,
  scope,
  onReport,
  onSkip,
  onReschedule,
}: {
  activity: EnrichedActivity;
  isOverdue: boolean;
  compact: boolean;
  scope: ScheduleScope;
  onReport: (activity: EnrichedActivity) => void;
  onSkip: (activityId: Id<'scheduled_activities'>) => void;
  onReschedule: (activityId: Id<'scheduled_activities'>) => void;
}) {
  const displayName =
    activity.templateName ?? activity.activityTypeName ?? activity.activity_type;
  const date = new Date(activity.scheduled_date);
  const isCompleted = activity.status === 'completed';
  const isSkipped = activity.status === 'skipped';
  const isActionable = activity.status === 'pending' || activity.status === 'in_progress';

  const StatusIcon = isCompleted
    ? CheckCircle
    : isSkipped
      ? SkipForward
      : isOverdue
        ? AlertTriangle
        : Clock;

  const statusColor = isCompleted
    ? 'text-green-600'
    : isSkipped
      ? 'text-muted-foreground'
      : isOverdue
        ? 'text-red-600'
        : 'text-amber-600';

  // Show batch column unless scope is batch (redundant)
  const showBatch = scope.type !== 'batch';
  // Show area for global and order scopes
  const showArea = scope.type === 'global' || scope.type === 'order';

  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 ${
        isCompleted || isSkipped ? 'opacity-50' : ''
      }`}
    >
      <StatusIcon className={`h-4 w-4 flex-shrink-0 ${statusColor}`} />

      <div className="flex-1 min-w-0">
        {compact ? (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">{displayName}</span>
            {showBatch && activity.batchCode && (
              <Badge variant="outline" className="text-xs shrink-0">
                {activity.batchCode}
              </Badge>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium truncate">{displayName}</span>
              {showBatch && activity.batchCode && (
                <Badge variant="outline" className="text-xs shrink-0">
                  {activity.batchCode}
                </Badge>
              )}
              {showArea && activity.areaName && (
                <Badge variant="secondary" className="text-xs shrink-0">
                  {activity.areaName}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>
                {date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
              </span>
              {activity.assignedToName && (
                <>
                  <span>·</span>
                  <span>{activity.assignedToName}</span>
                </>
              )}
              {activity.crop_phase && (
                <>
                  <span>·</span>
                  <span className="capitalize">{activity.crop_phase}</span>
                </>
              )}
              {activity.resourceCount > 0 && (
                <>
                  <span>·</span>
                  <span className="inline-flex items-center gap-0.5">
                    <Package className="h-3 w-3" />
                    {activity.resourceCount}
                  </span>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Actions for pending/overdue activities */}
      {isActionable && (
        <div className="flex items-center gap-1 shrink-0">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onReport(activity)}
            className="text-amber-600 hover:text-amber-700 h-7 px-2"
          >
            <ClipboardList className="h-3 w-3 mr-1" />
            {!compact && 'Reportar'}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onSkip(activity._id)}>
                <SkipForward className="h-4 w-4 mr-2" />
                Saltar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onReschedule(activity._id)}>
                <CalendarClock className="h-4 w-4 mr-2" />
                Reprogramar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}

function ScheduleSkeleton({ compact }: { compact: boolean }) {
  const rows = compact ? 3 : 5;
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-24" />
      </div>
      <div className="rounded-lg border p-3 space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}

function ScheduleEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
      <CalendarOff className="h-8 w-8 mb-2" />
      <p className="text-sm">No hay actividades programadas</p>
    </div>
  );
}
