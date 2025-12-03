'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CultivarList } from '@/components/cultivars/cultivar-list';
import { Skeleton } from '@/components/ui/skeleton';
import { useFacility } from '@/components/providers/facility-provider';

export default function CultivarsPage() {
  const { currentFacilityId, isLoading: facilityLoading } = useFacility();

  // Fetch data for stats
  const cultivars = useQuery(api.cultivars.list, {});
  const cropTypes = useQuery(api.crops.getCropTypes, {});

  // Calculate stats
  const stats = {
    total: cultivars?.length || 0,
    byCropType: {} as Record<string, number>,
  };

  if (cultivars && cropTypes) {
    cultivars.forEach((cultivar) => {
      const cropType = cropTypes.find((ct) => ct._id === cultivar.crop_type_id);
      if (cropType) {
        const name = cropType.display_name_es;
        stats.byCropType[name] = (stats.byCropType[name] || 0) + 1;
      }
    });
  }

  // Loading state
  if (facilityLoading || cultivars === undefined || cropTypes === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Cultivares"
        breadcrumbs={[{ label: 'Inicio', href: '/dashboard' }, { label: 'Cultivares' }]}
        description="Gestiona los cultivares y variedades de tu instalación"
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total de Cultivares
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {stats.total}
            </div>
          </CardContent>
        </Card>

        {Object.entries(stats.byCropType)
          .slice(0, 3)
          .map(([cropTypeName, count]) => (
            <Card key={cropTypeName}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {cropTypeName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{count}</div>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Cultivar List - handles its own filters, search, and create modal */}
      <CultivarList facilityId={currentFacilityId || undefined} />
    </div>
  );
}
