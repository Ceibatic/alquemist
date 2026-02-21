'use client';

import { useState } from 'react';
import { Id } from '@/convex/_generated/dataModel';
import { CalendarToolbar, type CalendarViewMode } from './calendar-toolbar';
import { ActivityCalendar } from './activity-calendar';

interface ActivitiesTabProps {
  companyId: Id<'companies'>;
  facilityId: Id<'facilities'> | null;
}

export function ActivitiesTab({ companyId }: ActivitiesTabProps) {
  const [viewMode, setViewMode] = useState<CalendarViewMode>('week');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  return (
    <div className="space-y-4">
      <CalendarToolbar
        currentDate={currentDate}
        viewMode={viewMode}
        onDateChange={setCurrentDate}
        onViewModeChange={setViewMode}
      />
      <ActivityCalendar
        companyId={companyId}
        currentDate={currentDate}
        viewMode={viewMode}
        onDateChange={setCurrentDate}
        onViewModeChange={setViewMode}
      />
    </div>
  );
}
