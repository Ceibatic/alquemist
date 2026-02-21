'use client';

import { use } from 'react';
import { Id } from '@/convex/_generated/dataModel';
import { ActivityDetailPage } from '@/components/production/activity-detail-page';

export default function ActivityDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <ActivityDetailPage
      scheduledActivityId={id as Id<'scheduled_activities'>}
    />
  );
}
