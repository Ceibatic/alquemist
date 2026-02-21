'use client';

import { useMemo } from 'react';
import { format, isToday, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
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

export function CalendarDayView({ currentDate, activities, onActivityClick }: CalendarDayViewProps) {
  const groups = useMemo(() => {
    const now = Date.now();
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

    const result: StatusGroup[] = [];
    if (overdue.length > 0) result.push({ label: 'Vencidas', activities: overdue, bgClass: 'bg-red-50', textClass: 'text-red-700' });
    if (pending.length > 0) result.push({ label: 'Pendientes', activities: pending, bgClass: 'bg-amber-50', textClass: 'text-amber-700' });
    if (inProgress.length > 0) result.push({ label: 'En Progreso', activities: inProgress, bgClass: 'bg-blue-50', textClass: 'text-blue-700' });
    if (completed.length > 0) result.push({ label: 'Completadas', activities: completed, bgClass: 'bg-green-50', textClass: 'text-green-700' });
    if (skipped.length > 0) result.push({ label: 'Saltadas', activities: skipped, bgClass: 'bg-gray-50', textClass: 'text-gray-500' });

    return result;
  }, [activities, currentDate]);

  const total = activities.filter((a) => {
    const dayStart = new Date(currentDate).setHours(0, 0, 0, 0);
    const dayEnd = new Date(currentDate).setHours(23, 59, 59, 999);
    const isInDay = a.scheduled_date >= dayStart && a.scheduled_date <= dayEnd;
    const isOverdue = a.status === 'pending' && a.scheduled_date < dayStart;
    return isInDay || isOverdue;
  }).length;

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground border rounded-lg">
        <p className="text-sm">No hay actividades para este dia</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.label} className={cn('rounded-lg border p-3', group.bgClass)}>
          <p className={cn('text-xs font-medium mb-2', group.textClass)}>
            {group.label} ({group.activities.length})
          </p>
          <div className="space-y-1">
            {group.activities.map((a) => (
              <button
                key={a._id}
                onClick={() => onActivityClick(a._id)}
                className="flex items-center gap-3 w-full text-left bg-background rounded-md px-3 py-2 hover:bg-muted/80 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {a.activityTypeName ?? a.activity_type}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {a.batchCode && (
                      <span className="text-[10px] text-muted-foreground bg-muted rounded px-1">
                        {a.batchCode}
                      </span>
                    )}
                    {a.areaName && (
                      <span className="text-[10px] text-muted-foreground">
                        {a.areaName}
                      </span>
                    )}
                    {a.batchPhase && (
                      <span className="text-[10px] text-muted-foreground">
                        {PHASE_LABELS[a.batchPhase] ?? a.batchPhase}
                      </span>
                    )}
                  </div>
                </div>
                {a.assignedToName && (
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {a.assignedToName}
                  </span>
                )}
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {format(new Date(a.scheduled_date), 'd MMM', { locale: es })}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
