'use client';

import { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useFacility } from '@/components/providers/facility-provider';
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  SkipForward,
  CalendarCheck,
  CalendarOff,
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
};

// ── Helpers ──

function getDateRange(range: 'today' | 'week' | 'month' | 'all') {
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

// ── Component ──

export function ActivitySchedule({
  scope,
  compact = false,
  defaultDateRange = 'week',
  maxItems = 50,
}: ActivityScheduleProps) {
  const { currentCompanyId } = useFacility();

  const dateRange = getDateRange(defaultDateRange);

  const activities = useQuery(
    api.scheduledActivities.listForSchedule,
    currentCompanyId
      ? {
          companyId: currentCompanyId,
          scope,
          dateStart: dateRange.dateStart,
          dateEnd: dateRange.dateEnd,
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

  // Loading
  if (activities === undefined) {
    return <ScheduleSkeleton compact={compact} />;
  }

  // Empty
  if (activities.length === 0) {
    return <ScheduleEmpty />;
  }

  return (
    <div className="space-y-3">
      {/* Header with stats */}
      <ScheduleHeader stats={stats} compact={compact} />

      {/* Date groups */}
      {dateGroups.map((group) => (
        <ScheduleDateGroup
          key={group.key}
          group={group}
          compact={compact}
          scope={scope}
        />
      ))}
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
    <div className={`flex items-center gap-2 ${compact ? '' : 'mb-1'}`}>
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
}: {
  group: DateGroup;
  compact: boolean;
  scope: ScheduleScope;
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
}: {
  activity: EnrichedActivity;
  isOverdue: boolean;
  compact: boolean;
  scope: ScheduleScope;
}) {
  const displayName =
    activity.templateName ?? activity.activityTypeName ?? activity.activity_type;
  const date = new Date(activity.scheduled_date);
  const isCompleted = activity.status === 'completed';
  const isSkipped = activity.status === 'skipped';

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

  const iconColor = activity.activityTypeColor ?? statusColor;

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
          // Compact: single line
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">{displayName}</span>
            {showBatch && activity.batchCode && (
              <Badge variant="outline" className="text-xs shrink-0">
                {activity.batchCode}
              </Badge>
            )}
          </div>
        ) : (
          // Full: two lines
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
            </div>
          </>
        )}
      </div>
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
