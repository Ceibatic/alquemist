'use client';

import { PageHeader } from '@/components/layout/page-header';
import { AccountSettingsTabs } from '@/components/settings/account-settings-tabs';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function AccountSettingsPage() {
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

  // Get user data
  const user = useQuery(
    api.users.getUserById,
    userId ? { userId: userId as Id<'users'> } : 'skip'
  );

  // Loading state
  if (!userId || !user) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32" />
        <Skeleton className="h-[600px]" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Mi Cuenta"
          breadcrumbs={[
            { label: 'Inicio', href: '/dashboard' },
            { label: 'Configuración', href: '/settings' },
            { label: 'Mi Cuenta' },
          ]}
        />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error?.message || 'No se pudo cargar la información del usuario'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Mi Cuenta"
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Configuración', href: '/settings' },
          { label: 'Mi Cuenta' },
        ]}
        description="Administra tu perfil, preferencias y seguridad"
      />

      {/* Settings Tabs */}
      <Card>
        <CardContent className="p-6">
          <AccountSettingsTabs
            userId={userId as Id<'users'>}
            user={user}
          />
        </CardContent>
      </Card>
    </div>
  );
}
