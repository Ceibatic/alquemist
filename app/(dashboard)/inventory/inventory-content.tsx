'use client';

import { PageHeader } from '@/components/layout/page-header';
import { InventoryList } from '@/components/inventory/inventory-list';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useFacility } from '@/components/providers/facility-provider';

export function InventoryContent() {
  const { currentFacilityId, isLoading } = useFacility();

  // Loading state - only show skeleton while actually loading
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  // Error state - no facility selected (after loading completes)
  if (!currentFacilityId) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Inventario"
          breadcrumbs={[
            { label: 'Inicio', href: '/dashboard' },
            { label: 'Inventario' },
          ]}
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
      <PageHeader
        title="Inventario"
        description="Gestiona tu inventario y stock de productos"
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Inventario' },
        ]}
      />

      <InventoryList facilityId={currentFacilityId} />
    </div>
  );
}
