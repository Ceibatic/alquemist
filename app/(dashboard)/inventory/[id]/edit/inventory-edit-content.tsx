'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { InventoryForm } from '@/components/inventory/inventory-form';
import { CreateInventoryItemInput } from '@/lib/validations/inventory';
import { Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InventoryEditContentProps {
  inventoryId: string;
}

export function InventoryEditContent({
  inventoryId,
}: InventoryEditContentProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch inventory item
  const item = useQuery(api.inventory.getById, {
    inventoryId: inventoryId as any,
  });

  // Update mutation
  const updateInventoryItem = useMutation(api.inventory.update);

  // Get facility ID from area
  const area = useQuery(
    api.areas.getById,
    item?.area_id ? { areaId: item.area_id } : 'skip'
  );

  const handleSubmit = async (data: CreateInventoryItemInput) => {
    setIsSubmitting(true);

    try {
      await updateInventoryItem({
        inventoryId: inventoryId as any,
        supplier_id: data.supplier_id as any,
        reorder_point: data.reorder_point,
        cost_per_unit: data.cost_per_unit,
        expiration_date: data.expiration_date,
        notes: data.notes,
      });

      toast.success('Item de inventario actualizado exitosamente');
      router.push(`/inventory/${inventoryId}`);
    } catch (error) {
      console.error('Error updating inventory item:', error);
      toast.error('Error al actualizar el item de inventario');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  if (!area) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-green-600" />
      </div>
    );
  }

  // Prepare initial data for form
  const initialData: Partial<CreateInventoryItemInput> = {
    product_id: item.product_id,
    area_id: item.area_id,
    supplier_id: item.supplier_id,
    quantity_available: item.quantity_available,
    quantity_unit: item.quantity_unit,
    batch_number: item.batch_number,
    supplier_lot_number: item.supplier_lot_number,
    serial_numbers: item.serial_numbers,
    received_date: item.received_date,
    manufacturing_date: item.manufacturing_date,
    expiration_date: item.expiration_date,
    purchase_price: item.purchase_price,
    cost_per_unit: item.cost_per_unit,
    quality_grade: item.quality_grade as 'A' | 'B' | 'C' | undefined,
    quality_notes: item.quality_notes,
    source_type: item.source_type as 'purchase' | 'production' | 'transfer' | undefined,
    minimum_stock_level: item.minimum_stock_level,
    maximum_stock_level: item.maximum_stock_level,
    reorder_point: item.reorder_point,
    lead_time_days: item.lead_time_days,
    notes: item.notes,
  };

  return (
    <>
      <PageHeader
        title="Editar Item de Inventario"
        description="Actualiza la información del item de inventario"
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Inventario', href: '/inventory' },
          { label: item.productName || 'Item', href: `/inventory/${inventoryId}` },
          { label: 'Editar' },
        ]}
      />

      <Card className="p-6">
        <InventoryForm
          facilityId={area.facility_id}
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={() => router.push(`/inventory/${inventoryId}`)}
          submitLabel="Actualizar Item"
          isSubmitting={isSubmitting}
        />
      </Card>
    </>
  );
}
