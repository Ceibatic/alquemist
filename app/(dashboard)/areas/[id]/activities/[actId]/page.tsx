'use client';

import { useParams } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { PageHeader } from '@/components/layout/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { ActivityDetailEssential } from '@/components/activities/activity-detail-essential';
import { ActivityDetailResources } from '@/components/activities/activity-detail-resources';
import { ActivityDetailDocuments } from '@/components/activities/activity-detail-documents';
import { ActivityPhotoGallery } from '@/components/attachments/activity-photo-gallery';
import { Info, Package, Camera, FileText } from 'lucide-react';

export default function ActivityDetailPage() {
  const params = useParams();
  const areaId = params.id as Id<'areas'>;
  const activityId = params.actId as Id<'activities'>;

  const activity = useQuery(api.activities.getById, { activityId });
  const area = useQuery(api.areas.getById, { areaId });

  if (activity === undefined || area === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (activity === null) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Actividad no encontrada"
          breadcrumbs={[
            { label: 'Inicio', href: '/dashboard' },
            { label: 'Areas', href: '/areas' },
            { label: area?.name ?? 'Area', href: `/areas/${areaId}` },
            { label: 'No encontrada' },
          ]}
        />
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-gray-600">
              La actividad que buscas no existe o ha sido eliminada.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const title =
    activity.title || activity.activityTypeName || 'Actividad';

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Areas', href: '/areas' },
          { label: area?.name ?? 'Area', href: `/areas/${areaId}` },
          { label: title },
        ]}
      />

      <Tabs defaultValue="esencial" className="w-full">
        <ScrollArea className="w-full">
          <TabsList className="inline-flex h-auto p-1 bg-gray-100 rounded-lg">
            <TabsTrigger
              value="esencial"
              className="inline-flex items-center gap-2 px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
            >
              <Info className="h-4 w-4" />
              Esencial
            </TabsTrigger>
            <TabsTrigger
              value="recursos"
              className="inline-flex items-center gap-2 px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
            >
              <Package className="h-4 w-4" />
              Recursos
            </TabsTrigger>
            <TabsTrigger
              value="fotos"
              className="inline-flex items-center gap-2 px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
            >
              <Camera className="h-4 w-4" />
              Fotos
            </TabsTrigger>
            <TabsTrigger
              value="documentos"
              className="inline-flex items-center gap-2 px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
            >
              <FileText className="h-4 w-4" />
              Documentos
            </TabsTrigger>
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <TabsContent value="esencial" className="mt-6">
          <ActivityDetailEssential activity={activity} areaId={areaId} />
        </TabsContent>

        <TabsContent value="recursos" className="mt-6">
          <ActivityDetailResources activityId={activityId} />
        </TabsContent>

        <TabsContent value="fotos" className="mt-6">
          <ActivityPhotoGallery activityId={activityId} />
        </TabsContent>

        <TabsContent value="documentos" className="mt-6">
          <ActivityDetailDocuments activityId={activityId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
