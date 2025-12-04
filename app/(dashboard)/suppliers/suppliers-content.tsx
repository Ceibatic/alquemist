'use client';

import { PageHeader } from '@/components/layout/page-header';
import { SupplierList } from '@/components/suppliers/supplier-list';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useFacility } from '@/components/providers/facility-provider';

export function SuppliersContent() {
  const { currentCompanyId, isLoading } = useFacility();

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

  // Error state - no company (after loading completes)
  if (!currentCompanyId) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Proveedores"
          breadcrumbs={[
            { label: 'Inicio', href: '/dashboard' },
            { label: 'Proveedores' },
          ]}
        />
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-gray-600">
              No se pudo cargar la información de la empresa. Por favor, inicia sesión nuevamente.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Proveedores"
        description="Gestiona tus proveedores y relaciones comerciales"
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Proveedores' },
        ]}
      />

      <SupplierList companyId={currentCompanyId} />
    </div>
  );
}
