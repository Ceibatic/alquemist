'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ProfileForm } from './profile-form';
import { PreferencesForm } from './preferences-form';
import { UserNotificationsForm } from './user-notifications-form';
import { SecurityForm } from './security-form';
import { Id } from '@/convex/_generated/dataModel';

interface AccountSettingsTabsProps {
  userId: Id<'users'>;
  user: any;
  isDirtyMap: {
    profile: boolean;
    preferences: boolean;
    notifications: boolean;
    security: boolean;
  };
  onDirtyChange: (tab: string, isDirty: boolean) => void;
}

export function AccountSettingsTabs({ userId, user, isDirtyMap, onDirtyChange }: AccountSettingsTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'profile';
  const [pendingTab, setPendingTab] = React.useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);

  const handleTabChange = (value: string) => {
    // Check if current tab has unsaved changes
    const currentTabKey = currentTab as keyof typeof isDirtyMap;
    if (isDirtyMap[currentTabKey]) {
      // Show confirmation dialog
      setPendingTab(value);
      setShowConfirmDialog(true);
    } else {
      // Navigate directly
      router.push(`/settings/account?tab=${value}`);
    }
  };

  const handleConfirmNavigation = () => {
    if (pendingTab) {
      router.push(`/settings/account?tab=${pendingTab}`);
      setPendingTab(null);
    }
    setShowConfirmDialog(false);
  };

  const handleCancelNavigation = () => {
    setPendingTab(null);
    setShowConfirmDialog(false);
  };

  return (
    <>
      <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="profile" className="relative">
            Perfil
            {isDirtyMap.profile && (
              <span className="ml-1 text-amber-500 font-bold">●</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="preferences" className="relative">
            Preferencias
            {isDirtyMap.preferences && (
              <span className="ml-1 text-amber-500 font-bold">●</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="relative">
            Notificaciones
            {isDirtyMap.notifications && (
              <span className="ml-1 text-amber-500 font-bold">●</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="security" className="relative">
            Seguridad
            {isDirtyMap.security && (
              <span className="ml-1 text-amber-500 font-bold">●</span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <ProfileForm
            userId={userId}
            user={user}
            onDirtyChange={(isDirty) => onDirtyChange('profile', isDirty)}
          />
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <PreferencesForm
            userId={userId}
            user={user}
            onDirtyChange={(isDirty) => onDirtyChange('preferences', isDirty)}
          />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <UserNotificationsForm
            userId={userId}
            user={user}
            onDirtyChange={(isDirty) => onDirtyChange('notifications', isDirty)}
          />
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <SecurityForm
            userId={userId}
            user={user}
            onDirtyChange={(isDirty) => onDirtyChange('security', isDirty)}
          />
        </TabsContent>
      </Tabs>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tienes cambios sin guardar</AlertDialogTitle>
            <AlertDialogDescription>
              Si cambias de pestaña ahora, perderás los cambios que no has guardado. ¿Estás seguro de que deseas continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelNavigation}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmNavigation}
              className="bg-destructive hover:bg-destructive/90"
            >
              Descartar cambios
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
