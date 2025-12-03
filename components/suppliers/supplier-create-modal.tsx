'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Truck } from 'lucide-react';
import { SupplierForm } from './supplier-form';
import { CreateSupplierInput } from '@/lib/validations/supplier';

interface SupplierCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: Id<'companies'>;
}

export function SupplierCreateModal({
  open,
  onOpenChange,
  companyId,
}: SupplierCreateModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createSupplier = useMutation(api.suppliers.create);

  const handleSubmit = async (data: CreateSupplierInput) => {
    try {
      setIsSubmitting(true);

      const supplierId = await createSupplier({
        companyId,
        name: data.name,
        legalName: data.legal_name,
        taxId: data.tax_id,
        businessType: data.business_type,
        primaryContactName: data.primary_contact_name,
        primaryContactEmail: data.primary_contact_email,
        primaryContactPhone: data.primary_contact_phone,
        address: data.address,
        city: data.city,
        administrativeDivision1: data.administrative_division_1,
        productCategories: data.product_categories,
        cropSpecialization: data.crop_specialization,
        paymentTerms: data.payment_terms,
        notes: data.notes,
      });

      toast.success('Proveedor creado exitosamente');
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error('Error creating supplier:', error);
      toast.error(
        error instanceof Error ? error.message : 'Error al crear proveedor'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <Truck className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <DialogTitle>Nuevo Proveedor</DialogTitle>
              <DialogDescription>
                Completa la información del nuevo proveedor. Los campos marcados con
                (*) son obligatorios.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <SupplierForm
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
          submitLabel="Crear Proveedor"
        />
      </DialogContent>
    </Dialog>
  );
}
