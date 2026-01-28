'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useFacility } from '@/components/providers/facility-provider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProductForm } from './product-form';
import type { ProductFormInput } from '@/lib/validations/product';

interface ProductCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductCreateModal({ open, onOpenChange }: ProductCreateModalProps) {
  const router = useRouter();
  const { currentCompanyId } = useFacility();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createProduct = useMutation(api.products.create);

  const handleSubmit = async (data: ProductFormInput) => {
    try {
      setIsSubmitting(true);

      // Clean up empty strings to undefined
      const cleanedData = {
        sku: data.sku,
        name: data.name,
        category: data.category,
        description: data.description || undefined,
        subcategory: data.subcategory || undefined,
        preferred_supplier_id: data.preferred_supplier_id || undefined,
        brand_id: data.brand_id || undefined,
        manufacturer: data.manufacturer || undefined,
        weight_value: typeof data.weight_value === 'number' ? data.weight_value : undefined,
        weight_unit: data.weight_unit || undefined,
        regulatory_registered: data.regulatory_registered,
        regulatory_registration_number: data.regulatory_registration_number || undefined,
        organic_certified: data.organic_certified,
        organic_cert_number: data.organic_cert_number || undefined,
        default_price: typeof data.default_price === 'number' ? data.default_price : undefined,
        price_currency: data.price_currency || 'COP',
        price_unit: data.price_unit || undefined,
      };

      const productId = await createProduct({ ...cleanedData, companyId: currentCompanyId! } as any);

      toast.success('Producto creado', {
        description: `"${data.name}" ha sido creado exitosamente.`,
      });

      onOpenChange(false);
      router.push(`/products/${productId}`);
    } catch (error: any) {
      console.error('Error creating product:', error);
      toast.error('Error al crear producto', {
        description: error.message || 'Intenta nuevamente',
        action: {
          label: 'Reintentar',
          onClick: () => handleSubmit(data),
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Producto</DialogTitle>
          <DialogDescription>
            Agrega un nuevo producto al catálogo maestro. Los productos se utilizan para
            gestionar el inventario.
          </DialogDescription>
        </DialogHeader>

        <ProductForm
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
