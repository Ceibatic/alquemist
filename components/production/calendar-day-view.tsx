'use client';

import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CalendarActivity } from './calendar-activity-pill';

interface CalendarDayViewProps {
  currentDate: Date;
  activities: CalendarActivity[];
  onActivityClick: (activityId: string) => void;
}

interface StatusGroup {
  label: string;
  activities: CalendarActivity[];
  bgClass: string;
  textClass: string;
}

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

const OVERDUE_PREVIEW_LIMIT = 5;

function ActivityRow({ activity, onActivityClick }: { activity: CalendarActivity; onActivityClick: (id: string) => void }) {
  return (
    <button
      onClick={() => onActivityClick(activity._id)}
      className="flex items-center gap-3 w-full text-left bg-background rounded-md px-3 py-2 hover:bg-muted/80 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {activity.activityTypeName ?? activity.activity_type}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {activity.batchCode && (
            <span className="text-[10px] text-muted-foreground bg-muted rounded px-1">
              {activity.batchCode}
            </span>
          )}
          {activity.areaName && (
            <span className="text-[10px] text-muted-foreground">
              {activity.areaName}
            </span>
          )}
          {activity.batchPhase && (
            <span className="text-[10px] text-muted-foreground">
              {PHASE_LABELS[activity.batchPhase] ?? activity.batchPhase}
            </span>
          )}
        </div>
      </div>
      {activity.assignedToName && (
        <span className="text-[10px] text-muted-foreground shrink-0">
          {activity.assignedToName}
        </span>
      )}
      <span className="text-[10px] text-muted-foreground shrink-0">
        {format(new Date(activity.scheduled_date), 'd MMM', { locale: es })}
      </span>
    </button>
  );
}

export function CalendarDayView({ currentDate, activities, onActivityClick }: CalendarDayViewProps) {
  const [overdueExpanded, setOverdueExpanded] = useState(false);

  const { overdueGroup, dayGroups } = useMemo(() => {
    const dayStart = new Date(currentDate).setHours(0, 0, 0, 0);
    const dayEnd = new Date(currentDate).setHours(23, 59, 59, 999);

    const overdue: CalendarActivity[] = [];
    const pending: CalendarActivity[] = [];
    const inProgress: CalendarActivity[] = [];
    const completed: CalendarActivity[] = [];
    const skipped: CalendarActivity[] = [];

    for (const a of activities) {
      const isInDay = a.scheduled_date >= dayStart && a.scheduled_date <= dayEnd;
      const isOverdue = a.status === 'pending' && a.scheduled_date < dayStart;

      if (isOverdue) {
        overdue.push(a);
      } else if (isInDay) {
        switch (a.status) {
          case 'pending': pending.push(a); break;
          case 'in_progress': inProgress.push(a); break;
          case 'completed': completed.push(a); break;
          case 'skipped':
          case 'cancelled': skipped.push(a); break;
        }
      }
    }

    const groups: StatusGroup[] = [];
    if (pending.length > 0) groups.push({ label: 'Pendientes', activities: pending, bgClass: 'bg-amber-50', textClass: 'text-amber-700' });
    if (inProgress.length > 0) groups.push({ label: 'En Progreso', activities: inProgress, bgClass: 'bg-blue-50', textClass: 'text-blue-700' });
    if (completed.length > 0) groups.push({ label: 'Completadas', activities: completed, bgClass: 'bg-green-50', textClass: 'text-green-700' });
    if (skipped.length > 0) groups.push({ label: 'Saltadas', activities: skipped, bgClass: 'bg-gray-50', textClass: 'text-gray-500' });

    return {
      overdueGroup: overdue.length > 0 ? overdue : null,
      dayGroups: groups,
    };
  }, [activities, currentDate]);

  const hasAny = overdueGroup !== null || dayGroups.length > 0;

  if (!hasAny) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground border rounded-lg">
        <p className="text-sm">No hay actividades para este dia</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Collapsible overdue section */}
      {overdueGroup && (
        <div className="rounded-lg border border-red-200 bg-red-50">
          <button
            onClick={() => setOverdueExpanded((prev) => !prev)}
            className="flex items-center gap-2 w-full px-3 py-2.5 text-left hover:bg-red-100/50 transition-colors rounded-lg"
          >
            <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
            <span className="text-xs font-medium text-red-700 flex-1">
              {overdueGroup.length} {overdueGroup.length === 1 ? 'actividad vencida' : 'actividades vencidas'}
            </span>
            {overdueExpanded ? (
              <ChevronUp className="h-4 w-4 text-red-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-red-400" />
            )}
          </button>
          {overdueExpanded && (
            <div className="px-3 pb-3 space-y-1">
              {overdueGroup.slice(0, OVERDUE_PREVIEW_LIMIT).map((a) => (
                <ActivityRow key={a._id} activity={a} onActivityClick={onActivityClick} />
              ))}
              {overdueGroup.length > OVERDUE_PREVIEW_LIMIT && (
                <button
                  onClick={() => setOverdueExpanded(false)}
                  className="w-full text-center text-xs text-red-600 hover:text-red-800 py-1.5 hover:bg-red-100/50 rounded transition-colors"
                >
                  +{overdueGroup.length - OVERDUE_PREVIEW_LIMIT} mas vencidas
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Day groups (Pendientes, En Progreso, Completadas, Saltadas) */}
      {dayGroups.map((group) => (
        <div key={group.label} className={cn('rounded-lg border p-3', group.bgClass)}>
          <p className={cn('text-xs font-medium mb-2', group.textClass)}>
            {group.label} ({group.activities.length})
          </p>
          <div className="space-y-1">
            {group.activities.map((a) => (
              <ActivityRow key={a._id} activity={a} onActivityClick={onActivityClick} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
