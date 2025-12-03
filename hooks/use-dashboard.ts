'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';

export interface UseDashboardOptions {
  facilityId: Id<'facilities'>;
  companyId: Id<'companies'>;
}

export function useDashboard(
  options: UseDashboardOptions | 'skip'
) {
  // Real-time subscription to metrics
  const metrics = useQuery(
    api.dashboard.getMetrics,
    options !== 'skip' ? { facilityId: options.facilityId } : 'skip'
  );

  // Real-time subscription to onboarding status
  const onboardingStatus = useQuery(
    api.dashboard.getOnboardingStatus,
    options !== 'skip'
      ? {
          facilityId: options.facilityId,
          companyId: options.companyId,
        }
      : 'skip'
  );

  // Real-time subscription to recent activities
  const recentActivities = useQuery(
    api.dashboard.getRecentActivities,
    options !== 'skip'
      ? {
          facilityId: options.facilityId,
          limit: 5,
        }
      : 'skip'
  );

  // Real-time subscription to active alerts
  const alerts = useQuery(
    api.dashboard.getActiveAlerts,
    options !== 'skip' ? { facilityId: options.facilityId } : 'skip'
  );

  return {
    metrics,
    onboardingStatus,
    recentActivities,
    alerts,
    isLoading:
      metrics === undefined ||
      onboardingStatus === undefined ||
      recentActivities === undefined ||
      alerts === undefined,
  };
}
