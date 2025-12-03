'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GeneralInfoForm } from './general-info-form';
import { LocationForm } from './location-form';
import { LicenseForm } from './license-form';
import { OperationsForm } from './operations-form';
import { FacilityNotificationsForm } from './facility-notifications-form';
import { Id } from '@/convex/_generated/dataModel';

interface FacilitySettingsTabsProps {
  facilityId: Id<'facilities'>;
  facility: any;
}

export function FacilitySettingsTabs({ facilityId, facility }: FacilitySettingsTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'general';

  const handleTabChange = (value: string) => {
    router.push(`/settings/facility?tab=${value}`);
  };

  return (
    <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-5 mb-8">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="ubicacion">Ubicación</TabsTrigger>
        <TabsTrigger value="licencias">Licencias</TabsTrigger>
        <TabsTrigger value="operaciones">Operaciones</TabsTrigger>
        <TabsTrigger value="notificaciones">Notificaciones</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="space-y-4">
        <GeneralInfoForm facilityId={facilityId} facility={facility} />
      </TabsContent>

      <TabsContent value="ubicacion" className="space-y-4">
        <LocationForm facilityId={facilityId} facility={facility} />
      </TabsContent>

      <TabsContent value="licencias" className="space-y-4">
        <LicenseForm facilityId={facilityId} facility={facility} />
      </TabsContent>

      <TabsContent value="operaciones" className="space-y-4">
        <OperationsForm facilityId={facilityId} facility={facility} />
      </TabsContent>

      <TabsContent value="notificaciones" className="space-y-4">
        <FacilityNotificationsForm facilityId={facilityId} facility={facility} />
      </TabsContent>
    </Tabs>
  );
}
