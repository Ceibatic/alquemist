'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { FacilityList } from '@/components/facilities/facility-list';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function FacilitiesPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Get user data from cookies
    const userDataCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('user_data='));

    if (userDataCookie) {
      try {
        const userData = JSON.parse(
          decodeURIComponent(userDataCookie.split('=')[1])
        );
        setUserId(userData.userId);
        setCompanyId(userData.companyId);
      } catch (err) {
        setError(new Error('Error al cargar datos del usuario'));
      }
    } else {
      setError(new Error('No se encontró información del usuario'));
    }
  }, []);

  // Loading state
  if (!userId || !companyId) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Instalaciones"
          breadcrumbs={[{ label: 'Inicio', href: '/dashboard' }, { label: 'Instalaciones' }]}
        />
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-gray-600">{error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Instalaciones"
        breadcrumbs={[{ label: 'Inicio', href: '/dashboard' }, { label: 'Instalaciones' }]}
        description="Gestiona las instalaciones de tu empresa"
      />

      {/* Facility List - handles its own filters, search, and create modal */}
      <FacilityList userId={userId} companyId={companyId} />
    </div>
  );
}
