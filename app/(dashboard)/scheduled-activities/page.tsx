'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { useFacility } from '@/components/providers/facility-provider';
import { ActivitySchedule } from '@/components/activities/activity-schedule';
import { ActivityExecutionSheet } from '@/components/activities/activity-execution-sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarCheck, ClipboardList } from 'lucide-react';

export default function ScheduledActivitiesPage() {
  const { isLoading: facilityLoading, currentCompanyId } = useFacility();
  const [adhocSheetOpen, setAdhocSheetOpen] = useState(false);

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
        <Button
          size="sm"
          variant="outline"
          onClick={() => setAdhocSheetOpen(true)}
        >
          <ClipboardList className="h-3.5 w-3.5 mr-1" />
          Reportar Ad-hoc
        </Button>
      </div>

      <ActivitySchedule
        scope={{ type: 'global' }}
        defaultDateRange="month"
        maxItems={100}
      />

      {/* Ad-hoc execution sheet (no scheduled activity) */}
      <ActivityExecutionSheet
        open={adhocSheetOpen}
        onOpenChange={setAdhocSheetOpen}
        onCompleted={() => setAdhocSheetOpen(false)}
      />
    </div>
  );
}
