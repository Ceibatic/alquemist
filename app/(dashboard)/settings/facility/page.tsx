'use client';

import { PageHeader } from '@/components/layout/page-header';
import { FacilitySettingsTabs } from '@/components/settings/facility-settings-tabs';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function FacilitySettingsPage() {
  const [userId, setUserId] = useState<string | null>(null);
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
      } catch (err) {
        setError(new Error('Error al cargar datos del usuario'));
      }
    } else {
      setError(new Error('No se encontró información del usuario'));
    }
  }, []);

  // Get user data to access facility
  const user = useQuery(
    api.users.getUserById,
    userId ? { userId: userId as Id<'users'> } : 'skip'
  );

  // Get the user's primary facility or first accessible facility
  const facilityId =
    user?.accessibleFacilityIds && user.accessibleFacilityIds.length > 0
      ? user.accessibleFacilityIds[0]
      : null;

  // Get facility details
  const facility = useQuery(
    api.facilities.get,
    facilityId && user?.companyId
      ? { id: facilityId as Id<'facilities'>, companyId: user.companyId as Id<'companies'> }
      : 'skip'
  );

  // Loading state
  if (!userId || !user || !facility) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32" />
        <Skeleton className="h-[600px]" />
      </div>
    );
  }

  // Error state
  if (error || !facilityId) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Configuración de Instalación"
          breadcrumbs={[
            { label: 'Inicio', href: '/dashboard' },
            { label: 'Configuración', href: '/settings/facility' },
            { label: 'Instalación' },
          ]}
        />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error?.message || 'No se pudo cargar la información de la instalación'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={`Configuración: ${facility.name}`}
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Configuración', href: '/settings/facility' },
          { label: 'Instalación' },
        ]}
        description="Administra la configuración de tu instalación"
      />

      {/* Settings Tabs */}
      <Card>
        <CardContent className="p-6">
          <FacilitySettingsTabs
            facilityId={facilityId as Id<'facilities'>}
            facility={facility}
          />
        </CardContent>
      </Card>
    </div>
  );
}
