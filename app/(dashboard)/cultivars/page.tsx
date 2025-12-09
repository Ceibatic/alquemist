'use client';

import { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { PageHeader } from '@/components/layout/page-header';
import { CompactStats, CompactStat } from '@/components/ui/compact-stats';
import { CultivarList } from '@/components/cultivars/cultivar-list';
import { Skeleton } from '@/components/ui/skeleton';
import { useFacility } from '@/components/providers/facility-provider';
import { Sprout, Leaf, Flower2, Trees } from 'lucide-react';

export default function CultivarsPage() {
  const { currentFacilityId, isLoading: facilityLoading } = useFacility();

  // Fetch data for stats
  const cultivars = useQuery(api.cultivars.list, {});
  const cropTypes = useQuery(api.crops.getCropTypes, {});

  // Icons for crop types (rotate through these)
  const cropTypeIcons = [Leaf, Flower2, Trees, Sprout];

  // Calculate stats
  const compactStats = useMemo<CompactStat[]>(() => {
    const result: CompactStat[] = [
      { label: 'Total', value: cultivars?.length || 0, icon: Sprout, color: 'green' },
    ];

    if (cultivars && cropTypes) {
      const byCropType: Record<string, number> = {};
      cultivars.forEach((cultivar) => {
        const cropType = cropTypes.find((ct) => ct._id === cultivar.crop_type_id);
        if (cropType) {
          const name = cropType.display_name_es;
          byCropType[name] = (byCropType[name] || 0) + 1;
        }
      });

      Object.entries(byCropType)
        .slice(0, 3)
        .forEach(([name, count], index) => {
          result.push({
            label: name,
            value: count,
            icon: cropTypeIcons[index % cropTypeIcons.length],
            color: 'default',
          });
        });
    }

    return result;
  }, [cultivars, cropTypes]);

  // Loading state
  if (facilityLoading || cultivars === undefined || cropTypes === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14" />
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
        icon={Sprout}
        breadcrumbs={[{ label: 'Inicio', href: '/dashboard' }, { label: 'Cultivares' }]}
        description="Gestiona los cultivares y variedades de tu instalación"
      />

      {/* Compact Stats */}
      <CompactStats stats={compactStats} />

      {/* Cultivar List - handles its own filters, search, and create modal */}
      <CultivarList facilityId={currentFacilityId || undefined} />
    </div>
  );
}
