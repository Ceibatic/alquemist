'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { PageHeader } from '@/components/layout/page-header';
import { MetricsBar } from '@/components/dashboard/metrics-bar';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { OnboardingChecklist } from '@/components/dashboard/onboarding-checklist';
import { EmptyState } from '@/components/ui/empty-state';
import { DashboardLoading } from '@/components/dashboard/dashboard-loading';
import { DashboardError } from '@/components/dashboard/dashboard-error';
import { Sprout } from 'lucide-react';
import { useDashboard } from '@/hooks/use-dashboard';
import { useEffect, useState } from 'react';
import { TrialBanner } from '@/components/subscription/trial-banner';

export default function DashboardPage() {
  // Get user ID from session storage or context
  // In a production app, this would come from a user context provider
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Get user data from cookies (temporary solution)
    const userDataCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('user_data='));

    if (userDataCookie) {
      try {
        const userData = JSON.parse(
          decodeURIComponent(userDataCookie.split('=')[1])
        );
        setUserId(userData.userId);
      } catch (err) {
        setError(new Error('Error al cargar datos del usuario'));
      }
    } else {
      setError(new Error('No se encontró información del usuario'));
    }
  }, []);

  // Get user data to access facility and company IDs
  const user = useQuery(
    api.users.getUserById,
    userId ? { userId: userId as Id<'users'> } : 'skip'
  );

  // Get the user's primary facility or first accessible facility
  const primaryFacilityId =
    user?.accessibleFacilityIds && user.accessibleFacilityIds.length > 0
      ? user.accessibleFacilityIds[0]
      : null;

  const companyId = user?.companyId;

  // Fetch dashboard data using the custom hook
  const { metrics, onboardingStatus, recentActivities, isLoading } =
    useDashboard(
      primaryFacilityId && companyId
        ? {
            facilityId: primaryFacilityId as Id<'facilities'>,
            companyId: companyId as Id<'companies'>,
          }
        : 'skip'
    );

  // Loading state
  if (!userId || !user || isLoading) {
    return <DashboardLoading />;
  }

  // Error state
  if (error || !primaryFacilityId || !companyId) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          breadcrumbs={[{ label: 'Dashboard' }]}
          description="Vista general de tu instalación"
        />
        <DashboardError
          error={error || new Error('No se encontró una instalación activa')}
        />
      </div>
    );
  }

  // Check if this is a new installation (no data yet)
  const isNewInstallation =
    metrics &&
    metrics.areas.total === 0 &&
    metrics.cultivars.total === 0 &&
    metrics.inventory.total === 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Dashboard"
        breadcrumbs={[{ label: 'Dashboard' }]}
        description="Vista general de tu instalación"
      />

      {/* Trial Banner - Shows when trial is expiring */}
      <TrialBanner companyId={companyId as Id<'companies'>} />

      {/* Empty State for New Installations */}
      {isNewInstallation && onboardingStatus && (
        <>
          <EmptyState
            icon={Sprout}
            title="¡Bienvenido a Alquemist!"
            description="Tu instalación está lista. Comienza configurando los elementos básicos para tu operación."
          />
          <OnboardingChecklist status={onboardingStatus} />
        </>
      )}

      {/* Dashboard with Data */}
      {!isNewInstallation && metrics && (
        <>
          {/* Metrics Bar */}
          <MetricsBar
            areas={metrics.areas}
            cultivars={metrics.cultivars}
            inventory={metrics.inventory}
            alerts={metrics.alerts}
          />

          {/* Quick Actions */}
          <QuickActions />

          {/* Recent Activity */}
          <RecentActivity activities={recentActivities || []} />

          {/* Show onboarding checklist if not complete */}
          {onboardingStatus && onboardingStatus.completionPercentage < 100 && (
            <OnboardingChecklist status={onboardingStatus} />
          )}
        </>
      )}
    </div>
  );
}
