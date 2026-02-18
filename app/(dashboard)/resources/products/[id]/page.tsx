'use client';

import { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { InventoryReceiptModal } from '@/components/inventory/inventory-receipt-modal';
import { ProductPriceHistory } from '@/components/products';
import { TransformationChain } from '@/components/products/transformation-chain';
import { ProductInventoryTab } from '@/components/inventory/product-inventory-tab';
import { ProductQualityTab } from '@/components/products/product-quality-tab';
import { useFacility } from '@/components/providers/facility-provider';
import {
  Boxes,
  Pencil,
  ArrowLeft,
  Package,
  Building2,
  DollarSign,
  Scale,
  Sprout,
  FlaskConical,
  Shield,
  Cog,
  Layers,
  Container,
  Wrench,
  FileText,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { productCategoryLabels, productStatusLabels } from '@/lib/validations/product';

type SectionValue = 'info' | 'inventory' | 'quality';

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  seed: Sprout,
  nutrient: FlaskConical,
  pesticide: Shield,
  equipment: Cog,
  substrate: Layers,
  container: Container,
  tool: Wrench,
  other: FileText,
};

function ProductDetailPageContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const productId = params.id as string;
  const { currentFacilityId } = useFacility();
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  const activeSection = (searchParams.get('section') as SectionValue) || 'info';

  const handleSectionChange = useCallback(
    (value: string) => {
      const p = new URLSearchParams();
      if (value !== 'info') {
        p.set('section', value);
      }
      const query = p.toString();
      router.replace(
        `/resources/products/${productId}${query ? `?${query}` : ''}`,
        { scroll: false }
      );
    },
    [router, productId]
  );

  const product = useQuery(api.products.getById, {
    productId: productId as Id<'products'>,
  });

  if (product === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-10 w-80" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-48" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  if (product === null) {
    useEffect(() => {
      toast.error('Producto no encontrado', {
        description: 'El producto que buscas no existe o fue eliminado',
      });
      router.push('/resources');
    }, [router]);
    return null;
  }

  const CategoryIcon = categoryIcons[product.category] || FileText;
  const categoryLabel = productCategoryLabels[product.category] || product.category;
  const statusLabel = productStatusLabels[product.status] || product.status;
  const isActive = product.status === 'active';

  const formatPrice = (price: number | undefined, currency: string = 'COP') => {
    if (price === undefined || price === null) return 'No definido';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={product.name}
        icon={Boxes}
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Recursos', href: '/resources' },
          { label: product.name },
        ]}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.push('/resources')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
            <Button
              onClick={() => router.push(`/resources/products/${productId}/edit`)}
              className="bg-amber-500 hover:bg-amber-600"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </div>
        }
      />

      {/* Sub-tabs */}
      <Tabs value={activeSection} onValueChange={handleSectionChange}>
        <TabsList>
          <TabsTrigger value="info">Informacion</TabsTrigger>
          <TabsTrigger value="inventory">Inventario</TabsTrigger>
          <TabsTrigger value="quality">Calidad</TabsTrigger>
        </TabsList>

        {/* Tab: Info */}
        <TabsContent value="info" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Informacion del Producto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">SKU</p>
                      <p className="font-mono font-medium">{product.sku}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Categoria</p>
                      <div className="flex items-center gap-2">
                        <CategoryIcon className="h-4 w-4 text-gray-600" />
                        <span>{categoryLabel}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Estado</p>
                      <Badge
                        variant="secondary"
                        className={
                          isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {isActive ? (
                          <CheckCircle className="mr-1 h-3 w-3" />
                        ) : (
                          <XCircle className="mr-1 h-3 w-3" />
                        )}
                        {statusLabel}
                      </Badge>
                    </div>
                    {product.subcategory && (
                      <div>
                        <p className="text-sm text-gray-500">Subcategoria</p>
                        <p>{product.subcategory}</p>
                      </div>
                    )}
                  </div>
                  {product.description && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Descripcion</p>
                        <p className="text-gray-700">{product.description}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Transformation Chain */}
              <TransformationChain productId={productId} />

              {/* Pricing Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Informacion de Precios
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Precio Base</p>
                      <p className="text-2xl font-bold text-green-700">
                        {formatPrice(product.default_price, product.price_currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Moneda</p>
                      <p className="font-medium">{product.price_currency || 'COP'}</p>
                    </div>
                    {product.price_unit && (
                      <div>
                        <p className="text-sm text-gray-500">Unidad de Precio</p>
                        <p>{product.price_unit}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Price History */}
              <ProductPriceHistory productId={productId} limit={10} />

              {/* Physical Properties */}
              {(product.weight_value || product.weight_unit) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Scale className="h-5 w-5" />
                      Propiedades Fisicas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {product.weight_value && (
                        <div>
                          <p className="text-sm text-gray-500">Peso</p>
                          <p className="font-medium">
                            {product.weight_value} {product.weight_unit || ''}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Supplier Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Proveedor y Fabricante
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Proveedor Preferido</p>
                    <p className="font-medium">
                      {product.preferredSupplierName || 'No asignado'}
                    </p>
                  </div>
                  {product.manufacturer && (
                    <div>
                      <p className="text-sm text-gray-500">Fabricante</p>
                      <p>{product.manufacturer}</p>
                    </div>
                  )}
                  {product.brand_id && (
                    <div>
                      <p className="text-sm text-gray-500">Marca</p>
                      <p>{product.brand_id}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tab: Inventory */}
        <TabsContent value="inventory" className="space-y-6">
          <ProductInventoryTab
            productId={productId}
            productName={product.name}
            defaultUnit={product.default_unit}
            onAddStock={() => setReceiptModalOpen(true)}
          />
        </TabsContent>

        {/* Tab: Quality */}
        <TabsContent value="quality" className="space-y-6">
          <ProductQualityTab
            product={product}
            onEdit={() => router.push(`/resources/products/${productId}/edit`)}
          />
        </TabsContent>
      </Tabs>

      {/* Receipt Modal */}
      {currentFacilityId && (
        <InventoryReceiptModal
          open={receiptModalOpen}
          onOpenChange={setReceiptModalOpen}
          facilityId={currentFacilityId}
          preSelectedProductId={productId}
        />
      )}
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-80" />
        </div>
      }
    >
      <ProductDetailPageContent />
    </Suspense>
  );
}
