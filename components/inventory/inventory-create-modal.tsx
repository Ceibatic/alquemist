'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Package } from 'lucide-react';
import { InventoryForm } from './inventory-form';
import { CreateInventoryItemInput } from '@/lib/validations/inventory';

interface InventoryCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facilityId: string;
}

export function InventoryCreateModal({
  open,
  onOpenChange,
  facilityId,
}: InventoryCreateModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createInventoryItem = useMutation(api.inventory.create);

  const handleSubmit = async (data: CreateInventoryItemInput) => {
    setIsSubmitting(true);

    try {
      await createInventoryItem({
        product_id: data.product_id as any,
        area_id: data.area_id as any,
        supplier_id: data.supplier_id as any,
        quantity_available: data.quantity_available,
        quantity_unit: data.quantity_unit,
        batch_number: data.batch_number,
        supplier_lot_number: data.supplier_lot_number,
        received_date: data.received_date,
        manufacturing_date: data.manufacturing_date,
        expiration_date: data.expiration_date,
        purchase_price: data.purchase_price,
        cost_per_unit: data.cost_per_unit,
        lot_status: 'available',
      });

      toast.success('Item de inventario creado exitosamente');
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating inventory item:', error);
      toast.error('Error al crear el item de inventario');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Package className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <DialogTitle>Agregar Item al Inventario</DialogTitle>
              <DialogDescription>
                Registra un nuevo item en el inventario de tu instalación
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <InventoryForm
          facilityId={facilityId}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          submitLabel="Crear Item"
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
