'use client';

import * as React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { AccountSettingsTabs } from '@/components/settings/account-settings-tabs';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AccountSettingsPage() {
  // Track dirty state for each tab
  const [isDirtyMap, setIsDirtyMap] = React.useState({
    profile: false,
    preferences: false,
    notifications: false,
    security: false,
  });

  // Get current authenticated user from Convex Auth
  const currentUser = useQuery(api.users.getCurrentUser);

  // Get full user details
  const user = useQuery(
    api.users.getUserById,
    currentUser?.userId ? { userId: currentUser.userId as Id<'users'> } : 'skip'
  );

  // Handle dirty state changes from forms
  const handleDirtyChange = React.useCallback((tab: string, isDirty: boolean) => {
    setIsDirtyMap((prev) => ({
      ...prev,
      [tab]: isDirty,
    }));
  }, []);

  // Add beforeunload listener for unsaved changes
  React.useEffect(() => {
    const hasUnsavedChanges = Object.values(isDirtyMap).some(Boolean);

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirtyMap]);

  // Loading state
  if (currentUser === undefined || user === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32" />
        <Skeleton className="h-[600px]" />
      </div>
    );
  }

  // Not authenticated state
  if (currentUser === null) {
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
          <AlertDescription className="flex items-center justify-between">
            <span>No estás autenticado. Por favor, inicia sesión para acceder a tu cuenta.</span>
            <Button asChild variant="outline" size="sm">
              <Link href="/login">Ir a Login</Link>
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // User data not found
  if (!user) {
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
            No se pudo cargar la información del usuario.
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
            userId={currentUser.userId as Id<'users'>}
            user={user}
            isDirtyMap={isDirtyMap}
            onDirtyChange={handleDirtyChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}
