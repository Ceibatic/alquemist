'use client';

import { PageHeader } from '@/components/layout/page-header';
import { AreaList } from '@/components/areas/area-list';
import { Card, CardContent } from '@/components/ui/card';
import { CompactStats } from '@/components/ui/compact-stats';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Skeleton } from '@/components/ui/skeleton';
import { useFacility } from '@/components/providers/facility-provider';
import { LayoutGrid, CheckCircle, Wrench, XCircle, Map } from 'lucide-react';

export default function AreasPage() {
  const { currentFacilityId, isLoading } = useFacility();

  // Fetch stats
  const stats = useQuery(
    api.areas.getStats,
    currentFacilityId ? { facilityId: currentFacilityId } : 'skip'
  );

  // Loading state
  if (isLoading || !currentFacilityId) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  // Error state - no facility selected
  if (!currentFacilityId) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Áreas"
          icon={Map}
          breadcrumbs={[{ label: 'Inicio', href: '/dashboard' }, { label: 'Áreas' }]}
        />
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-gray-600">
              No tienes una instalación seleccionada. Selecciona una instalación desde el menú lateral.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Áreas"
        icon={Map}
        breadcrumbs={[{ label: 'Inicio', href: '/dashboard' }, { label: 'Áreas' }]}
        description="Gestiona las áreas de cultivo de tu instalación"
      />

      {/* Compact Stats */}
      {stats === undefined ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      ) : (
        <CompactStats
          stats={[
            { label: 'Total', value: stats.total, icon: LayoutGrid, color: 'blue' },
            { label: 'Activas', value: stats.active, icon: CheckCircle, color: 'green' },
            { label: 'Mantenimiento', value: stats.maintenance, icon: Wrench, color: 'yellow' },
            { label: 'Inactivas', value: stats.inactive, icon: XCircle, color: 'red' },
          ]}
        />
      )}

      {/* Areas List */}
      <AreaList facilityId={currentFacilityId} />
    </div>
  );
}
