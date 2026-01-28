'use client';

import { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { InventoryReceiptModal } from '@/components/inventory/inventory-receipt-modal';
import { useFacility } from '@/components/providers/facility-provider';
import {
  ShoppingCart,
  Pencil,
  ArrowLeft,
  Package,
  Building2,
  DollarSign,
  Scale,
  FileCheck,
  Leaf,
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
  Truck,
} from 'lucide-react';
import { productCategoryLabels, productStatusLabels } from '@/lib/validations/product';
import { ProductPriceHistory } from '@/components/products';

interface ProductDetailContentProps {
  productId: string;
}

// Category icons
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

export function ProductDetailContent({ productId }: ProductDetailContentProps) {
  const router = useRouter();
  const { currentFacilityId } = useFacility();
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  const product = useQuery(api.products.getById, {
    productId: productId as Id<'products'>,
  });

  // Inventory count query
  const inventoryStats = useQuery(
    api.inventory.countByProduct,
    product ? { productId: product._id } : 'skip'
  );

  if (product === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
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
    // Product not found - redirect to products list
    useEffect(() => {
      toast.error('Producto no encontrado', {
        description: 'El producto que buscas no existe o fue eliminado',
      });
      router.push('/products');
    }, [router]);

    return null; // Return null while redirect happens
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
        icon={ShoppingCart}
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Productos', href: '/products' },
          { label: product.name },
        ]}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.push('/products')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
            <Button
              onClick={() => router.push(`/products/${productId}/edit`)}
              className="bg-amber-500 hover:bg-amber-600"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Información del Producto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">SKU</p>
                  <p className="font-mono font-medium">{product.sku}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Categoría</p>
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
                    <p className="text-sm text-gray-500">Subcategoría</p>
                    <p>{product.subcategory}</p>
                  </div>
                )}
              </div>

              {product.description && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Descripción</p>
                    <p className="text-gray-700">{product.description}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Pricing Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Información de Precios
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

          {/* Price History Card */}
          <ProductPriceHistory productId={productId} limit={10} />

          {/* Physical Properties Card */}
          {(product.weight_value || product.weight_unit) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  Propiedades Físicas
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

        {/* Sidebar - 1 column */}
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

          {/* Regulatory Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                Información Regulatoria
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Registro Regulatorio</span>
                <Badge
                  variant="secondary"
                  className={
                    product.regulatory_registered
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                  }
                >
                  {product.regulatory_registered ? 'Sí' : 'No'}
                </Badge>
              </div>
              {product.regulatory_registration_number && (
                <div>
                  <p className="text-sm text-gray-500">Número de Registro</p>
                  <p className="font-mono text-sm">
                    {product.regulatory_registration_number}
                  </p>
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <Leaf className="h-4 w-4" />
                  Certificación Orgánica
                </span>
                <Badge
                  variant="secondary"
                  className={
                    product.organic_certified
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                  }
                >
                  {product.organic_certified ? 'Sí' : 'No'}
                </Badge>
              </div>
              {product.organic_cert_number && (
                <div>
                  <p className="text-sm text-gray-500">Número de Certificación</p>
                  <p className="font-mono text-sm">{product.organic_cert_number}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Inventario Asociado */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Inventario Asociado
                </span>
                {inventoryStats && inventoryStats.totalItems > 0 && (
                  <Badge variant="outline" className="text-sm">
                    {inventoryStats.activeItems} activos
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {inventoryStats === undefined ? (
                // Loading skeleton
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ) : inventoryStats.totalItems === 0 ? (
                // Empty state
                <div className="text-center py-4 text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hay items de inventario para este producto</p>
                </div>
              ) : (
                // Stats display
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total de lotes:</span>
                    <span className="font-semibold">{inventoryStats.totalItems}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Lotes activos:</span>
                    <span className="font-semibold text-green-600">
                      {inventoryStats.activeItems}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Cantidad total:</span>
                    <span className="font-semibold">
                      {inventoryStats.totalQuantity} {product.default_unit || 'unidades'}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => router.push(`/inventory?product=${product._id}`)}
                    >
                      Ver Inventario
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1 bg-amber-500 hover:bg-amber-600"
                      onClick={() => setReceiptModalOpen(true)}
                    >
                      Agregar Stock
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

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
