'use client';

import { useMemo } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  format,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { CalendarActivityPill, type CalendarActivity } from './calendar-activity-pill';

interface CalendarMonthViewProps {
  currentDate: Date;
  activities: CalendarActivity[];
  onActivityClick: (activityId: string) => void;
  onDayClick?: (date: Date) => void;
}

const MAX_PILLS = 3;

export function CalendarMonthView({
  currentDate,
  activities,
  onActivityClick,
  onDayClick,
}: CalendarMonthViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const dayNames = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];

  const activitiesByDay = useMemo(() => {
    const map = new Map<string, CalendarActivity[]>();
    for (const a of activities) {
      const key = new Date(a.scheduled_date).toISOString().slice(0, 10);
      const list = map.get(key) ?? [];
      list.push(a);
      map.set(key, list);
    }
    return map;
  }, [activities]);

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Day name headers */}
      <div className="grid grid-cols-7 bg-muted/50">
        {dayNames.map((name) => (
          <div key={name} className="text-center py-2 text-xs font-medium text-muted-foreground">
            {name}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-px bg-border">
        {days.map((day) => {
          const key = day.toISOString().slice(0, 10);
          const dayActivities = activitiesByDay.get(key) ?? [];
          const isCurrentMonth = isSameMonth(day, currentDate);
          const today = isToday(day);
          const overflow = dayActivities.length - MAX_PILLS;

          return (
            <div
              key={key}
              className={cn(
                'bg-background min-h-[100px] p-1',
                !isCurrentMonth && 'opacity-40',
                today && 'bg-amber-50/50'
              )}
            >
              {/* Day number */}
              <div className="flex justify-end mb-0.5">
                <span
                  className={cn(
                    'text-xs w-6 h-6 flex items-center justify-center rounded-full',
                    today && 'bg-amber-500 text-white font-bold'
                  )}
                >
                  {format(day, 'd')}
                </span>
              </div>

              {/* Pills */}
              <div className="space-y-0.5">
                {dayActivities.slice(0, MAX_PILLS).map((a) => (
                  <CalendarActivityPill
                    key={a._id}
                    activity={a}
                    onClick={() => onActivityClick(a._id)}
                    compact
                  />
                ))}
                {overflow > 0 && (
                  <button
                    onClick={() => onDayClick?.(day)}
                    className="text-[10px] text-muted-foreground hover:text-foreground w-full text-left px-2"
                  >
                    +{overflow} mas
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
