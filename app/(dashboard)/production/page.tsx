'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useCallback, Suspense } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { useFacility } from '@/components/providers/facility-provider';
import { ActivitiesTab } from '@/components/production/activities-tab';
import { OrdersTab } from '@/components/production/orders-tab';
import { Factory, BarChart3 } from 'lucide-react';

const VALID_TABS = ['actividades', 'ordenes', 'analiticas'] as const;
type ProductionTab = (typeof VALID_TABS)[number];

function ProductionPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { currentCompanyId, currentFacilityId, isLoading: facilityLoading } = useFacility();

  const tabParam = searchParams.get('tab');
  const activeTab: ProductionTab =
    tabParam && VALID_TABS.includes(tabParam as ProductionTab)
      ? (tabParam as ProductionTab)
      : 'actividades';

  const handleTabChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === 'actividades') {
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
        <Skeleton className="h-96 w-full" />
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
          <TabsTrigger value="actividades">Actividades</TabsTrigger>
          <TabsTrigger value="ordenes">Ordenes</TabsTrigger>
          <TabsTrigger value="analiticas">Analiticas</TabsTrigger>
        </TabsList>

        <TabsContent value="actividades">
          <ActivitiesTab
            companyId={currentCompanyId}
            facilityId={currentFacilityId}
          />
        </TabsContent>

        <TabsContent value="ordenes">
          <OrdersTab
            companyId={currentCompanyId}
            facilityId={currentFacilityId}
          />
        </TabsContent>

        <TabsContent value="analiticas">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mb-4 opacity-40" />
              <p className="text-lg font-medium">Analiticas de Productividad</p>
              <p className="text-sm">Proximamente</p>
            </CardContent>
          </Card>
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
          <Skeleton className="h-96 w-full" />
        </div>
      }
    >
      <ProductionPageContent />
    </Suspense>
  );
}
