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

// Error message mapping for user-friendly feedback
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Map backend errors to user-friendly Spanish messages
    if (message.includes('insufficient stock') || message.includes('insuficiente')) {
      return 'Stock insuficiente para realizar esta operación';
    }
    if (message.includes('not found') || message.includes('no existe') || message.includes('does not exist')) {
      return 'El item de inventario no fue encontrado';
    }
    if (message.includes('product') && (message.includes('not found') || message.includes('does not exist'))) {
      return 'El producto seleccionado no existe. Por favor selecciona otro';
    }
    if (message.includes('area') && (message.includes('not found') || message.includes('does not exist'))) {
      return 'El área seleccionada no existe. Por favor selecciona otra';
    }
    if (message.includes('supplier') && (message.includes('not found') || message.includes('does not exist'))) {
      return 'El proveedor seleccionado no existe. Por favor selecciona otro';
    }
    if (message.includes('unauthorized') || message.includes('access denied') || message.includes('permission')) {
      return 'No tienes permiso para realizar esta operación';
    }
    if (message.includes('invalid') && message.includes('quantity')) {
      return 'La cantidad ingresada es inválida. Debe ser mayor a 0';
    }
    if (message.includes('invalid') && message.includes('date')) {
      return 'Una o más fechas son inválidas. Verifica las fechas ingresadas';
    }
    if (message.includes('invalid') && message.includes('price')) {
      return 'El precio ingresado es inválido. Debe ser mayor a 0';
    }
    if (message.includes('invalid')) {
      return 'Datos inválidos. Verifica los campos e intenta nuevamente';
    }
    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      return 'Error de conexión. Verifica tu conexión a internet e intenta nuevamente';
    }
    if (message.includes('duplicate') && message.includes('batch')) {
      return 'Ya existe un lote con este número. Usa un número diferente';
    }
    if (message.includes('duplicate')) {
      return 'Ya existe un registro similar. Verifica los datos';
    }
    if (message.includes('expired')) {
      return 'No se puede crear un item de inventario con producto ya vencido';
    }

    // Return original message if it's already user-friendly
    return error.message;
  }

  return 'Ocurrió un error inesperado. Intenta nuevamente';
};

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
      const userMessage = getErrorMessage(error);
      toast.error(userMessage);
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
