'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileForm } from './profile-form';
import { PreferencesForm } from './preferences-form';
import { UserNotificationsForm } from './user-notifications-form';
import { SecurityForm } from './security-form';
import { Id } from '@/convex/_generated/dataModel';

interface AccountSettingsTabsProps {
  userId: Id<'users'>;
  user: any;
}

export function AccountSettingsTabs({ userId, user }: AccountSettingsTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'profile';

  const handleTabChange = (value: string) => {
    router.push(`/settings/account?tab=${value}`);
  };

  return (
    <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-4 mb-8">
        <TabsTrigger value="profile">Perfil</TabsTrigger>
        <TabsTrigger value="preferences">Preferencias</TabsTrigger>
        <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
        <TabsTrigger value="security">Seguridad</TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="space-y-4">
        <ProfileForm userId={userId} user={user} />
      </TabsContent>

      <TabsContent value="preferences" className="space-y-4">
        <PreferencesForm userId={userId} user={user} />
      </TabsContent>

      <TabsContent value="notifications" className="space-y-4">
        <UserNotificationsForm userId={userId} user={user} />
      </TabsContent>

      <TabsContent value="security" className="space-y-4">
        <SecurityForm userId={userId} user={user} />
      </TabsContent>
    </Tabs>
  );
}
