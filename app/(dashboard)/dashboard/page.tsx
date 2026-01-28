'use client';

import { Id } from '@/convex/_generated/dataModel';
import { PageHeader } from '@/components/layout/page-header';
import { OnboardingChecklist } from '@/components/dashboard/onboarding-checklist';
import { EmptyState } from '@/components/ui/empty-state';
import { DashboardLoading } from '@/components/dashboard/dashboard-loading';
import { DashboardError } from '@/components/dashboard/dashboard-error';
import { TrialBanner } from '@/components/subscription/trial-banner';
import { AdminDashboard, OperativeDashboard, TrendCharts } from '@/components/home';
import { Sprout } from 'lucide-react';
import {
  useHomeDashboard,
  isAdminDashboard,
  isOperativeDashboard,
} from '@/hooks/use-home-dashboard';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useDashboard } from '@/hooks/use-dashboard';

export default function DashboardPage() {
  // Get current user via Convex Auth (no cookies)
  const user = useQuery(api.users.getCurrentUser);

  const primaryFacilityId = user?.primaryFacilityId ?? null;
  const companyId = user?.companyId ?? null;

  // Fetch role-based home dashboard data (consolidated query)
  const { data: dashboardData, roleInfo, isLoading: isHomeLoading } = useHomeDashboard(
    primaryFacilityId
      ? { facilityId: primaryFacilityId as Id<'facilities'> }
      : 'skip'
  );

  // Fetch onboarding status for new installations (lightweight query)
  const { onboardingStatus, metrics } = useDashboard(
    primaryFacilityId && companyId
      ? {
          facilityId: primaryFacilityId as Id<'facilities'>,
          companyId: companyId as Id<'companies'>,
        }
      : 'skip'
  );

  // Loading state
  if (user === undefined || isHomeLoading) {
    return <DashboardLoading />;
  }

  // Error state
  if (!user || !primaryFacilityId || !companyId) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          breadcrumbs={[{ label: 'Dashboard' }]}
          description="Vista general de tu instalacion"
        />
        <DashboardError
          error={new Error('No se encontro una instalacion activa')}
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

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos dias';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const userName = user.firstName || 'Usuario';

  return (
    <div className="space-y-6">
      {/* Page Header with personalized greeting */}
      <PageHeader
        title={`${getGreeting()}, ${userName}`}
        breadcrumbs={[{ label: 'Dashboard' }]}
        description={
          roleInfo
            ? `Panel ${roleInfo.roleDisplayName}`
            : 'Vista general de tu instalacion'
        }
      />

      {/* Trial Banner - Shows when trial is expiring */}
      <TrialBanner companyId={companyId as Id<'companies'>} />

      {/* Empty State for New Installations */}
      {isNewInstallation && onboardingStatus && (
        <>
          <EmptyState
            icon={Sprout}
            title="Bienvenido a Alquemist!"
            description="Tu instalacion esta lista. Comienza configurando los elementos basicos para tu operacion."
          />
          <OnboardingChecklist status={onboardingStatus} />
        </>
      )}

      {/* Role-based Dashboard Content */}
      {!isNewInstallation && dashboardData && (
        <>
          {/* Administrative Dashboard */}
          {isAdminDashboard(dashboardData) && (
            <>
              <AdminDashboard data={dashboardData} />
              <TrendCharts facilityId={primaryFacilityId as Id<'facilities'>} />
            </>
          )}

          {/* Operative Dashboard */}
          {isOperativeDashboard(dashboardData) && (
            <OperativeDashboard data={dashboardData} />
          )}

          {/* Show onboarding checklist if not complete */}
          {onboardingStatus && onboardingStatus.completionPercentage < 100 && (
            <OnboardingChecklist status={onboardingStatus} />
          )}
        </>
      )}
    </div>
  );
}
