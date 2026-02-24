'use client';

import { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  addDays,
  subDays,
} from 'date-fns';
import type { CalendarViewMode } from './calendar-toolbar';
import type { CalendarActivity } from './calendar-activity-pill';
import { CalendarWeekView } from './calendar-week-view';
import { CalendarDayView } from './calendar-day-view';
import { CalendarMonthView } from './calendar-month-view';

interface ActivityCalendarProps {
  companyId: Id<'companies'>;
  currentDate: Date;
  viewMode: CalendarViewMode;
  onDateChange?: (date: Date) => void;
  onViewModeChange?: (mode: CalendarViewMode) => void;
}

function computeDateRange(date: Date, viewMode: CalendarViewMode): { dateStart: number; dateEnd: number } {
  switch (viewMode) {
    case 'day':
      return {
        dateStart: startOfDay(date).getTime(),
        dateEnd: endOfDay(date).getTime(),
      };
    case 'week': {
      const ws = startOfWeek(date, { weekStartsOn: 1 });
      const we = endOfWeek(date, { weekStartsOn: 1 });
      return { dateStart: ws.getTime(), dateEnd: we.getTime() };
    }
    case 'month': {
      const ms = startOfMonth(date);
      const me = endOfMonth(date);
      // Include surrounding week days for month grid
      const gridStart = startOfWeek(ms, { weekStartsOn: 1 });
      const gridEnd = endOfWeek(me, { weekStartsOn: 1 });
      return { dateStart: gridStart.getTime(), dateEnd: gridEnd.getTime() };
    }
  }
}

export function ActivityCalendar({ companyId, currentDate, viewMode, onDateChange, onViewModeChange }: ActivityCalendarProps) {
  const router = useRouter();

  const { dateStart, dateEnd } = useMemo(
    () => computeDateRange(currentDate, viewMode),
    [currentDate, viewMode]
  );

  // Also fetch overdue activities (pending before date range)
  const overdueStart = subDays(new Date(), 90).getTime(); // last 90 days of overdue

  const activities = useQuery(api.scheduledActivities.listForSchedule, {
    companyId,
    scope: { type: 'global' },
    dateStart: Math.min(overdueStart, dateStart),
    dateEnd,
    limit: 200,
  });

  const handleActivityClick = (activityId: string) => {
    router.push(`/production/activities/${activityId}`);
  };

  if (activities === undefined) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const calendarActivities: CalendarActivity[] = activities.map((a) => ({
    _id: a._id as string,
    activity_type: a.activity_type,
    scheduled_date: a.scheduled_date,
    status: a.status,
    batchCode: a.batchCode,
    activityTypeName: a.activityTypeName,
    activityTypeColor: a.activityTypeColor,
    assignedToName: a.assignedToName,
    areaName: a.areaName,
    batchPhase: a.batchPhase,
    templateName: a.templateName,
    resourceCount: a.resourceCount,
    phase_role: a.phase_role as CalendarActivity['phase_role'],
  }));

  // Filter activities within view range for the calendar views
  const rangeActivities = calendarActivities.filter(
    (a) => a.scheduled_date >= dateStart && a.scheduled_date <= dateEnd
  );

  // Overdue for week/month views
  const overdueActivities = calendarActivities.filter(
    (a) => a.status === 'pending' && a.scheduled_date < dateStart
  );

  switch (viewMode) {
    case 'day':
      return (
        <CalendarDayView
          currentDate={currentDate}
          activities={[...overdueActivities, ...rangeActivities]}
          onActivityClick={handleActivityClick}
        />
      );
    case 'week':
      return (
        <CalendarWeekView
          currentDate={currentDate}
          activities={[...overdueActivities, ...rangeActivities]}
          onActivityClick={handleActivityClick}
        />
      );
    case 'month':
      return (
        <CalendarMonthView
          currentDate={currentDate}
          activities={[...overdueActivities, ...rangeActivities]}
          onActivityClick={handleActivityClick}
          onDayClick={(date) => {
            onDateChange?.(date);
            onViewModeChange?.('day');
          }}
        />
      );
  }
}
