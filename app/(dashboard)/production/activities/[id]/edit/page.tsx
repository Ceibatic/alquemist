'use client';

import { use } from 'react';
import { Id } from '@/convex/_generated/dataModel';
import { useFacility } from '@/components/providers/facility-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { EditActivityWizard } from '@/components/production/edit-activity-wizard';

export default function EditActivityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { currentCompanyId, isLoading } = useFacility();

  if (isLoading || !currentCompanyId) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <EditActivityWizard
      scheduledActivityId={id as Id<'scheduled_activities'>}
      companyId={currentCompanyId}
    />
  );
}
