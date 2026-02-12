'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useCallback, Suspense } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useFacility } from '@/components/providers/facility-provider';
import { ProductionPhaseBoard } from '@/components/production/production-phase-board';
import { ProductionAnalytics } from '@/components/production/production-analytics';
import { Factory } from 'lucide-react';

const VALID_TABS = ['board', 'analytics', 'orders'] as const;
type ProductionTab = (typeof VALID_TABS)[number];

function ProductionPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { currentCompanyId, currentFacilityId, isLoading: facilityLoading } = useFacility();

  const tabParam = searchParams.get('tab');
  const activeTab: ProductionTab =
    tabParam && VALID_TABS.includes(tabParam as ProductionTab)
      ? (tabParam as ProductionTab)
      : 'board';

  const handleTabChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === 'board') {
        params.delete('tab');
      } else {
        params.set('tab', value);
      }
      const query = params.toString();
      router.push(`/production${query ? `?${query}` : ''}`, { scroll: false });
    },
    [searchParams, router]
  );

  if (facilityLoading || !currentCompanyId) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-10 w-80" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Produccion"
        icon={Factory}
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Produccion' },
        ]}
      />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="board">Tablero</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="orders">Ordenes</TabsTrigger>
        </TabsList>

        <TabsContent value="board">
          {currentFacilityId ? (
            <ProductionPhaseBoard
              companyId={currentCompanyId}
              facilityId={currentFacilityId}
            />
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              Selecciona una instalacion para ver el tablero de produccion.
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics">
          {currentFacilityId ? (
            <ProductionAnalytics
              companyId={currentCompanyId}
              facilityId={currentFacilityId}
            />
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              Selecciona una instalacion para ver analytics.
            </div>
          )}
        </TabsContent>

        <TabsContent value="orders">
          <div className="py-8 text-center text-muted-foreground">
            Ordenes de produccion — por implementar (US-PRD.5)
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function ProductionPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-80" />
        </div>
      }
    >
      <ProductionPageContent />
    </Suspense>
  );
}
