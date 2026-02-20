'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ProductForm } from '@/components/products/product-form';
import { useFacility } from '@/components/providers/facility-provider';
import { toast } from 'sonner';
import { Package } from 'lucide-react';
import type { ProductFormInput } from '@/lib/validations/product';

interface CreatePhaseProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cultivarId: Id<'cultivars'>;
  cropPhase: string | null;
  cultivarName: string;
  phaseName: string;
}

export function CreatePhaseProductModal({
  open,
  onOpenChange,
  cultivarId,
  cropPhase,
  cultivarName,
  phaseName,
}: CreatePhaseProductModalProps) {
  const { currentCompanyId } = useFacility();
  const createProduct = useMutation(api.products.create);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: ProductFormInput) => {
    if (!currentCompanyId) return;

    try {
      setIsSubmitting(true);

      await createProduct({
        companyId: currentCompanyId as Id<'companies'>,
        sku: data.sku,
        name: data.name,
        description: data.description || undefined,
        category: data.category as any,
        subcategory: data.subcategory || undefined,
        default_unit: (data.default_unit as any) || undefined,
        preferred_supplier_id: data.preferred_supplier_id
          ? (data.preferred_supplier_id as Id<'suppliers'>)
          : undefined,
        brand_id: data.brand_id || undefined,
        manufacturer: data.manufacturer || undefined,
        weight_value: data.weight_value
          ? Number(data.weight_value)
          : undefined,
        weight_unit: data.weight_unit || undefined,
        regulatory_registered: data.regulatory_registered || false,
        regulatory_registration_number:
          data.regulatory_registration_number || undefined,
        organic_certified: data.organic_certified || false,
        organic_cert_number: data.organic_cert_number || undefined,
        default_price: data.default_price
          ? Number(data.default_price)
          : undefined,
        price_currency: (data.price_currency as any) || undefined,
        price_unit: data.price_unit || undefined,
        procurement_type: (data.procurement_type as any) || undefined,
        lot_tracking: (data.lot_tracking as any) || undefined,
        shelf_life_days: data.shelf_life_days
          ? Number(data.shelf_life_days)
          : undefined,
        transformation_produces_id: data.transformation_produces_id
          ? (data.transformation_produces_id as Id<'products'>)
          : undefined,
        default_yield_pct: data.default_yield_pct
          ? Number(data.default_yield_pct)
          : undefined,
        acquisition_value: data.acquisition_value
          ? Number(data.acquisition_value)
          : undefined,
        useful_life_months: data.useful_life_months
          ? Number(data.useful_life_months)
          : undefined,
        salvage_value: data.salvage_value
          ? Number(data.salvage_value)
          : undefined,
        // Cultivar link
        cultivar_id: cultivarId,
        crop_phase: cropPhase || undefined,
      });

      toast.success(`Producto "${data.name}" creado para fase ${phaseName}`);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating product:', error);
      toast.error(
        error?.message || 'No se pudo crear el producto. Intenta nuevamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-amber-500" />
            Nuevo Producto — {cultivarName} / {phaseName}
          </DialogTitle>
          <DialogDescription>
            Crea un producto de catalogo para la fase de {phaseName.toLowerCase()} del
            cultivar {cultivarName}. Este producto se usara para rastrear el
            material vegetal en inventario.
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
