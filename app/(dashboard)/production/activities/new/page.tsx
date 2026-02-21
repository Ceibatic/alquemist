'use client';

import { useFacility } from '@/components/providers/facility-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { ScheduleActivityWizard } from '@/components/production/schedule-activity-wizard';

export default function NewActivityPage() {
  const { currentCompanyId, currentFacilityId, isLoading } = useFacility();

  if (isLoading || !currentCompanyId) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <ScheduleActivityWizard
      companyId={currentCompanyId}
      facilityId={currentFacilityId}
    />
  );
}
