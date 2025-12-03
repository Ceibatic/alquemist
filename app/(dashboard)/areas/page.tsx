'use client';

import { PageHeader } from '@/components/layout/page-header';
import { AreaList } from '@/components/areas/area-list';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Skeleton } from '@/components/ui/skeleton';
import { useFacility } from '@/components/providers/facility-provider';

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
        <Skeleton className="h-32" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
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
        breadcrumbs={[{ label: 'Inicio', href: '/dashboard' }, { label: 'Áreas' }]}
        description="Gestiona las áreas de cultivo de tu instalación"
      />

      {/* Stats Bar */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats === undefined ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </>
        ) : (
          <>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">Total de Áreas</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">
                  {stats.active}
                </div>
                <p className="text-xs text-muted-foreground">Áreas Activas</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.maintenance}
                </div>
                <p className="text-xs text-muted-foreground">En Mantenimiento</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-red-600">
                  {stats.inactive}
                </div>
                <p className="text-xs text-muted-foreground">Áreas Inactivas</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Areas List */}
      <AreaList facilityId={currentFacilityId} />
    </div>
  );
}
