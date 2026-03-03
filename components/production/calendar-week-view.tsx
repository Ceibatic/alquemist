'use client';

import { useMemo, useState } from 'react';
import {
  startOfWeek,
  addDays,
  isToday,
  format,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CalendarActivityPill, type CalendarActivity } from './calendar-activity-pill';

interface CalendarWeekViewProps {
  currentDate: Date;
  activities: CalendarActivity[];
  onActivityClick: (activityId: string) => void;
}

const OVERDUE_PREVIEW_LIMIT = 5;

export function CalendarWeekView({ currentDate, activities, onActivityClick }: CalendarWeekViewProps) {
  const [overdueExpanded, setOverdueExpanded] = useState(false);
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const activitiesByDay = useMemo(() => {
    const map = new Map<string, CalendarActivity[]>();
    for (const day of days) {
      const key = day.toISOString().slice(0, 10);
      map.set(key, []);
    }
    for (const activity of activities) {
      const actDate = new Date(activity.scheduled_date);
      const key = actDate.toISOString().slice(0, 10);
      const list = map.get(key);
      if (list) list.push(activity);
    }
    return map;
  }, [activities, days]);

  // Overdue activities (pending before this week)
  const overdueActivities = useMemo(() => {
    const weekStartTs = weekStart.getTime();
    return activities.filter(
      (a) => a.status === 'pending' && a.scheduled_date < weekStartTs
    );
  }, [activities, weekStart]);

  return (
    <div className="space-y-2">
      {/* Collapsible overdue section */}
      {overdueActivities.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg">
          <button
            onClick={() => setOverdueExpanded((prev) => !prev)}
            className="flex items-center gap-2 w-full px-3 py-2.5 text-left hover:bg-red-100/50 transition-colors rounded-lg"
          >
            <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
            <span className="text-xs font-medium text-red-700 flex-1">
              {overdueActivities.length} {overdueActivities.length === 1 ? 'actividad vencida' : 'actividades vencidas'}
            </span>
            {overdueExpanded ? (
              <ChevronUp className="h-4 w-4 text-red-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-red-400" />
            )}
          </button>
          {overdueExpanded && (
            <div className="px-3 pb-3">
              <div className="flex flex-wrap gap-1">
                {overdueActivities.slice(0, OVERDUE_PREVIEW_LIMIT).map((a) => (
                  <CalendarActivityPill
                    key={a._id}
                    activity={a}
                    onClick={() => onActivityClick(a._id)}
                  />
                ))}
              </div>
              {overdueActivities.length > OVERDUE_PREVIEW_LIMIT && (
                <button
                  onClick={() => setOverdueExpanded(false)}
                  className="w-full text-center text-xs text-red-600 hover:text-red-800 py-1.5 mt-1 hover:bg-red-100/50 rounded transition-colors"
                >
                  +{overdueActivities.length - OVERDUE_PREVIEW_LIMIT} mas vencidas
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Week grid */}
      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden border">
        {/* Header */}
        {days.map((day) => {
          const today = isToday(day);
          return (
            <div
              key={day.toISOString()}
              className={cn(
                'text-center py-2 text-xs font-medium bg-muted/50',
                today && 'bg-amber-50'
              )}
            >
              <span className="capitalize">
                {format(day, 'EEE', { locale: es })}
              </span>
              <span
                className={cn(
                  'ml-1',
                  today && 'bg-amber-500 text-white rounded-full px-1.5 py-0.5'
                )}
              >
                {format(day, 'd')}
              </span>
            </div>
          );
        })}

        {/* Day columns */}
        {days.map((day) => {
          const key = day.toISOString().slice(0, 10);
          const dayActivities = activitiesByDay.get(key) ?? [];
          const today = isToday(day);

          return (
            <div
              key={key}
              className={cn(
                'bg-background min-h-[200px] p-1 flex flex-col gap-0.5 overflow-y-auto max-h-[400px]',
                today && 'bg-amber-50/30'
              )}
            >
              {dayActivities.length === 0 && (
                <div className="flex-1 flex items-center justify-center">
                  <span className="text-[10px] text-muted-foreground/50">—</span>
                </div>
              )}
              {dayActivities.map((a) => (
                <CalendarActivityPill
                  key={a._id}
                  activity={a}
                  onClick={() => onActivityClick(a._id)}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
