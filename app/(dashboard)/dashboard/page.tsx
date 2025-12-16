'use client';

import { useEffect, useState } from 'react';
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
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Get user ID from cookies on mount
  useEffect(() => {
    const userDataCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('user_data='));

    if (userDataCookie) {
      try {
        const userData = JSON.parse(
          decodeURIComponent(userDataCookie.split('=')[1])
        );
        setUserId(userData.userId);
      } catch {
        setError(new Error('Error al cargar datos del usuario'));
      }
    } else {
      setError(new Error('No se encontro informacion del usuario'));
    }
  }, []);

  // Get user data to access facility and company IDs
  const user = useQuery(
    api.users.getUserById,
    userId ? { userId: userId as Id<'users'> } : 'skip'
  );

  // Get facility ID
  const primaryFacilityId =
    user?.accessibleFacilityIds && user.accessibleFacilityIds.length > 0
      ? user.accessibleFacilityIds[0]
      : null;

  const companyId = user?.companyId;

  // Fetch role-based home dashboard data (consolidated query)
  const { data: dashboardData, roleInfo, isLoading: isHomeLoading } = useHomeDashboard(
    userId && primaryFacilityId
      ? {
          userId: userId as Id<'users'>,
          facilityId: primaryFacilityId as Id<'facilities'>,
        }
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
  if (!userId || !user || isHomeLoading) {
    return <DashboardLoading />;
  }

  // Error state
  if (error || !primaryFacilityId || !companyId) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          breadcrumbs={[{ label: 'Dashboard' }]}
          description="Vista general de tu instalacion"
        />
        <DashboardError
          error={error || new Error('No se encontro una instalacion activa')}
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
