'use client';

import { useMemo, useCallback, Suspense } from 'react';
import { useQuery } from 'convex/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { PageHeader } from '@/components/layout/page-header';
import { CompactStats, CompactStat } from '@/components/ui/compact-stats';
import { ProductList } from '@/components/products/product-list';
import { SupplierList } from '@/components/suppliers/supplier-list';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useFacility } from '@/components/providers/facility-provider';
import {
  Boxes,
  ShoppingCart,
  Building2,
  Layers,
  Truck,
  BadgeCheck,
  Star,
  XCircle,
} from 'lucide-react';

type TabValue = 'products' | 'suppliers';

const TAB_CONFIG: Record<TabValue, { title: string; description: string }> = {
  products: {
    title: 'Recursos',
    description: 'Catalogo de productos, proveedores e inventario',
  },
  suppliers: {
    title: 'Recursos',
    description: 'Gestiona tus proveedores y relaciones comerciales',
  },
};

function ProductStats({ companyId }: { companyId: Id<'companies'> }) {
  const products = useQuery(api.products.list, {
    companyId,
  });

  const stats = useMemo<CompactStat[]>(() => {
    if (!products?.products) {
      return [
        { label: 'Productos', value: 0, icon: ShoppingCart, color: 'default' },
        { label: 'Categorias', value: 0, icon: Layers, color: 'default' },
        { label: 'Con proveedor', value: 0, icon: Truck, color: 'default' },
        { label: 'Descontinuados', value: 0, icon: XCircle, color: 'red' },
      ];
    }

    const items = products.products;
    const totalProducts = items.filter((p) => p.status === 'active').length;
    const uniqueCategories = new Set(items.map((p) => p.category)).size;
    const withSupplier = items.filter((p) => p.preferred_supplier_id).length;
    const discontinued = items.filter((p) => p.status === 'discontinued').length;

    return [
      { label: 'Productos', value: totalProducts, icon: ShoppingCart, color: 'default' },
      { label: 'Categorias', value: uniqueCategories, icon: Layers, color: 'default' },
      { label: 'Con proveedor', value: withSupplier, icon: Truck, color: 'default' },
      { label: 'Descontinuados', value: discontinued, icon: XCircle, color: 'red' },
    ];
  }, [products]);

  return <CompactStats stats={stats} />;
}

function SupplierStats({ companyId }: { companyId: Id<'companies'> }) {
  const suppliers = useQuery(api.suppliers.list, {
    companyId,
  });

  const stats = useMemo<CompactStat[]>(() => {
    if (!suppliers) {
      return [
        { label: 'Proveedores', value: 0, icon: Building2, color: 'default' },
        { label: 'Aprobados', value: 0, icon: BadgeCheck, color: 'default' },
        { label: 'Rating prom.', value: '-', icon: Star, color: 'default' },
        { label: 'Categorias', value: 0, icon: Layers, color: 'default' },
      ];
    }

    const active = suppliers.filter((s) => s.is_active !== false);
    const approved = suppliers.filter((s) => s.is_approved).length;
    const withRating = suppliers.filter((s) => s.rating != null);
    const avgRating =
      withRating.length > 0
        ? (withRating.reduce((sum, s) => sum + (s.rating || 0), 0) / withRating.length).toFixed(1)
        : null;
    const uniqueCategories = new Set(
      suppliers.flatMap((s) => s.product_categories || [])
    ).size;

    return [
      { label: 'Proveedores', value: active.length, icon: Building2, color: 'default' },
      { label: 'Aprobados', value: approved, icon: BadgeCheck, color: 'default' },
      {
        label: 'Rating prom.',
        value: avgRating !== null ? avgRating : '-',
        icon: Star,
        color: 'default',
      },
      { label: 'Categorias', value: uniqueCategories, icon: Layers, color: 'default' },
    ];
  }, [suppliers]);

  return <CompactStats stats={stats} />;
}

function ResourcesPageContent() {
  const { currentCompanyId, isLoading: facilityLoading } = useFacility();
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeTab = (searchParams.get('tab') as TabValue) || 'products';
  const config = TAB_CONFIG[activeTab] || TAB_CONFIG.products;

  const handleTabChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams();
      if (value !== 'products') {
        params.set('tab', value);
      }
      const query = params.toString();
      router.replace(`/resources${query ? `?${query}` : ''}`, { scroll: false });
    },
    [router]
  );

  if (facilityLoading || !currentCompanyId) {
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
      <PageHeader
        title={config.title}
        icon={Boxes}
        breadcrumbs={[{ label: 'Inicio', href: '/dashboard' }, { label: 'Recursos' }]}
        description={config.description}
      />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="products">Productos</TabsTrigger>
          <TabsTrigger value="suppliers">Proveedores</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <ProductStats companyId={currentCompanyId} />
          <ProductList />
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-6">
          <SupplierStats companyId={currentCompanyId} />
          <SupplierList companyId={currentCompanyId as string} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function ResourcesPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-80" />
        </div>
      }
    >
      <ResourcesPageContent />
    </Suspense>
  );
}
