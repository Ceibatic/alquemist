'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { StockStatus, StockLevelBar } from '@/components/inventory/stock-status';
import { AdjustStockModal } from '@/components/inventory/adjust-stock-modal';
import {
  Edit,
  Package,
  MapPin,
  Building2,
  Calendar,
  DollarSign,
  BarChart3,
  FileText,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface InventoryDetailContentProps {
  inventoryId: string;
}

export function InventoryDetailContent({
  inventoryId,
}: InventoryDetailContentProps) {
  const router = useRouter();
  const [adjustStockModalOpen, setAdjustStockModalOpen] = useState(false);

  // Fetch inventory item details
  const item = useQuery(api.inventory.getById, {
    inventoryId: inventoryId as any,
  });

  if (!item) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Item no encontrado
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            El item que buscas no existe o ha sido eliminado
          </p>
          <Button
            className="mt-4"
            onClick={() => router.push('/inventory')}
          >
            Volver al inventario
          </Button>
        </div>
      </div>
    );
  }

  // Calculate date information
  const isExpiringSoon =
    item.expiration_date &&
    item.expiration_date < Date.now() + 30 * 24 * 60 * 60 * 1000;
  const isExpired = item.expiration_date && item.expiration_date < Date.now();

  return (
    <>
      <PageHeader
        title={item.productName || 'Item de Inventario'}
        description={item.productSku || 'Detalles del item de inventario'}
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Inventario', href: '/inventory' },
          { label: item.productName || 'Detalle' },
        ]}
        action={
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setAdjustStockModalOpen(true)}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Ajustar Stock
            </Button>
            <Button
              onClick={() => router.push(`/inventory/${inventoryId}/edit`)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stock Status Card */}
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Estado del Stock
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Información actual del inventario
                </p>
              </div>
              <StockStatus status={item.stockStatus as any} />
            </div>

            <Separator className="my-6" />

            <StockLevelBar
              current={item.quantity_available}
              reorderPoint={item.reorder_point}
              minimum={item.minimum_stock_level}
              maximum={item.maximum_stock_level}
              unit={item.quantity_unit}
            />

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="text-xs text-gray-500">Disponible</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {item.quantity_available}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Reservado</p>
                <p className="mt-1 text-lg font-semibold text-blue-600">
                  {item.quantity_reserved || 0}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Comprometido</p>
                <p className="mt-1 text-lg font-semibold text-orange-600">
                  {item.quantity_committed || 0}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Unidad</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {item.quantity_unit}
                </p>
              </div>
            </div>
          </Card>

          {/* Product Information */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Información del Producto
            </h3>
            <Separator className="my-4" />

            <dl className="space-y-4">
              <div className="flex items-start justify-between">
                <dt className="flex items-center text-sm font-medium text-gray-500">
                  <Package className="mr-2 h-4 w-4" />
                  Nombre
                </dt>
                <dd className="text-sm text-gray-900">
                  {item.productName || '-'}
                </dd>
              </div>

              <div className="flex items-start justify-between">
                <dt className="flex items-center text-sm font-medium text-gray-500">
                  <FileText className="mr-2 h-4 w-4" />
                  SKU
                </dt>
                <dd className="text-sm text-gray-900">
                  {item.productSku || '-'}
                </dd>
              </div>

              <div className="flex items-start justify-between">
                <dt className="flex items-center text-sm font-medium text-gray-500">
                  <Package className="mr-2 h-4 w-4" />
                  Categoría
                </dt>
                <dd className="text-sm text-gray-900">
                  {item.productCategory || '-'}
                </dd>
              </div>

              {item.batch_number && (
                <div className="flex items-start justify-between">
                  <dt className="flex items-center text-sm font-medium text-gray-500">
                    <FileText className="mr-2 h-4 w-4" />
                    Lote
                  </dt>
                  <dd className="text-sm font-mono text-gray-900">
                    {item.batch_number}
                  </dd>
                </div>
              )}

              {item.supplier_lot_number && (
                <div className="flex items-start justify-between">
                  <dt className="flex items-center text-sm font-medium text-gray-500">
                    <FileText className="mr-2 h-4 w-4" />
                    Lote Proveedor
                  </dt>
                  <dd className="text-sm font-mono text-gray-900">
                    {item.supplier_lot_number}
                  </dd>
                </div>
              )}

              {item.quality_grade && (
                <div className="flex items-start justify-between">
                  <dt className="flex items-center text-sm font-medium text-gray-500">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Calidad
                  </dt>
                  <dd>
                    <Badge
                      className={cn(
                        item.quality_grade === 'A' &&
                          'bg-green-100 text-green-800 border-green-200',
                        item.quality_grade === 'B' &&
                          'bg-blue-100 text-blue-800 border-blue-200',
                        item.quality_grade === 'C' &&
                          'bg-gray-100 text-gray-800 border-gray-200'
                      )}
                    >
                      Grado {item.quality_grade}
                    </Badge>
                  </dd>
                </div>
              )}
            </dl>
          </Card>

          {/* Dates Card */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900">Fechas</h3>
            <Separator className="my-4" />

            <dl className="space-y-4">
              {item.received_date && (
                <div className="flex items-start justify-between">
                  <dt className="flex items-center text-sm font-medium text-gray-500">
                    <Calendar className="mr-2 h-4 w-4" />
                    Recepción
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {new Date(item.received_date).toLocaleDateString('es-CO')}
                  </dd>
                </div>
              )}

              {item.manufacturing_date && (
                <div className="flex items-start justify-between">
                  <dt className="flex items-center text-sm font-medium text-gray-500">
                    <Calendar className="mr-2 h-4 w-4" />
                    Fabricación
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {new Date(item.manufacturing_date).toLocaleDateString(
                      'es-CO'
                    )}
                  </dd>
                </div>
              )}

              {item.expiration_date && (
                <div className="flex items-start justify-between">
                  <dt className="flex items-center text-sm font-medium text-gray-500">
                    <Calendar className="mr-2 h-4 w-4" />
                    Vencimiento
                  </dt>
                  <dd
                    className={cn(
                      'text-sm font-medium',
                      isExpired && 'text-red-600',
                      isExpiringSoon && !isExpired && 'text-orange-600',
                      !isExpired && !isExpiringSoon && 'text-gray-900'
                    )}
                  >
                    {new Date(item.expiration_date).toLocaleDateString('es-CO')}
                    {isExpired && ' (Vencido)'}
                    {isExpiringSoon && !isExpired && ' (Por vencer)'}
                  </dd>
                </div>
              )}

              <div className="flex items-start justify-between">
                <dt className="flex items-center text-sm font-medium text-gray-500">
                  <Calendar className="mr-2 h-4 w-4" />
                  Último movimiento
                </dt>
                <dd className="text-sm text-gray-900">
                  {new Date(item.last_movement_date).toLocaleDateString('es-CO')}
                </dd>
              </div>
            </dl>
          </Card>

          {/* Notes */}
          {(item.notes || item.quality_notes) && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900">Notas</h3>
              <Separator className="my-4" />

              {item.quality_notes && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Notas de Calidad
                  </h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {item.quality_notes}
                  </p>
                </div>
              )}

              {item.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Notas Generales
                  </h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {item.notes}
                  </p>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Location Card */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900">Ubicación</h3>
            <Separator className="my-4" />

            <div className="space-y-4">
              <div>
                <dt className="flex items-center text-sm font-medium text-gray-500">
                  <MapPin className="mr-2 h-4 w-4" />
                  Área de Almacenamiento
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {item.areaName || '-'}
                </dd>
              </div>

              <div>
                <dt className="flex items-center text-sm font-medium text-gray-500">
                  <Building2 className="mr-2 h-4 w-4" />
                  Proveedor
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {item.supplierName || '-'}
                </dd>
              </div>
            </div>
          </Card>

          {/* Financial Card */}
          {(item.purchase_price || item.cost_per_unit) && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Información Financiera
              </h3>
              <Separator className="my-4" />

              <dl className="space-y-4">
                {item.purchase_price && (
                  <div>
                    <dt className="flex items-center text-sm font-medium text-gray-500">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Precio de Compra
                    </dt>
                    <dd className="mt-1 text-lg font-semibold text-gray-900">
                      ${item.purchase_price.toLocaleString('es-CO')} COP
                    </dd>
                  </div>
                )}

                {item.cost_per_unit && (
                  <div>
                    <dt className="flex items-center text-sm font-medium text-gray-500">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Costo por Unidad
                    </dt>
                    <dd className="mt-1 text-lg font-semibold text-gray-900">
                      ${item.cost_per_unit.toLocaleString('es-CO')} COP
                    </dd>
                  </div>
                )}

                {item.current_value && (
                  <div>
                    <dt className="flex items-center text-sm font-medium text-gray-500">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Valor Actual
                    </dt>
                    <dd className="mt-1 text-lg font-semibold text-green-600">
                      ${item.current_value.toLocaleString('es-CO')} COP
                    </dd>
                  </div>
                )}
              </dl>
            </Card>
          )}

          {/* Reorder Info Card */}
          {(item.reorder_point || item.lead_time_days) && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Información de Reorden
              </h3>
              <Separator className="my-4" />

              <dl className="space-y-4">
                {item.reorder_point && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Punto de Reorden
                    </dt>
                    <dd className="mt-1 text-lg font-semibold text-orange-600">
                      {item.reorder_point} {item.quantity_unit}
                    </dd>
                  </div>
                )}

                {item.minimum_stock_level && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Stock Mínimo
                    </dt>
                    <dd className="mt-1 text-lg font-semibold text-red-600">
                      {item.minimum_stock_level} {item.quantity_unit}
                    </dd>
                  </div>
                )}

                {item.maximum_stock_level && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Stock Máximo
                    </dt>
                    <dd className="mt-1 text-lg font-semibold text-blue-600">
                      {item.maximum_stock_level} {item.quantity_unit}
                    </dd>
                  </div>
                )}

                {item.lead_time_days && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Tiempo de Entrega
                    </dt>
                    <dd className="mt-1 text-lg font-semibold text-gray-900">
                      {item.lead_time_days} días
                    </dd>
                  </div>
                )}
              </dl>
            </Card>
          )}

          {/* Status Badge */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900">Estado</h3>
            <Separator className="my-4" />

            <div className="space-y-2">
              <Badge
                className={cn(
                  'w-full justify-center py-2',
                  item.lot_status === 'available' &&
                    'bg-green-100 text-green-800 border-green-200',
                  item.lot_status === 'reserved' &&
                    'bg-blue-100 text-blue-800 border-blue-200',
                  item.lot_status === 'expired' &&
                    'bg-red-100 text-red-800 border-red-200',
                  item.lot_status === 'quarantine' &&
                    'bg-yellow-100 text-yellow-800 border-yellow-200'
                )}
              >
                {item.lot_status === 'available' && 'Disponible'}
                {item.lot_status === 'reserved' && 'Reservado'}
                {item.lot_status === 'expired' && 'Vencido'}
                {item.lot_status === 'quarantine' && 'En Cuarentena'}
              </Badge>

              {(isExpired || isExpiringSoon) && (
                <div className="flex items-start gap-2 rounded-lg border border-orange-200 bg-orange-50 p-3">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium text-orange-800">
                      {isExpired ? 'Producto vencido' : 'Por vencer pronto'}
                    </p>
                    <p className="mt-1 text-xs text-orange-700">
                      {isExpired
                        ? 'Este producto ha expirado y debe ser revisado'
                        : 'Revisa la fecha de vencimiento'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      <AdjustStockModal
        open={adjustStockModalOpen}
        onOpenChange={setAdjustStockModalOpen}
        item={item}
      />
    </>
  );
}
