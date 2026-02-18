'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProductForm } from '@/components/products/product-form';
import { Plus, ArrowLeft } from 'lucide-react';
import { useFacility } from '@/components/providers/facility-provider';
import type { ProductFormInput } from '@/lib/validations/product';

export default function ResourceProductNewPage() {
  const router = useRouter();
  const { currentCompanyId } = useFacility();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createProduct = useMutation(api.products.create);

  const handleSubmit = async (data: ProductFormInput) => {
    if (!currentCompanyId) {
      toast.error('Error', { description: 'No se encontro la empresa' });
      return;
    }

    try {
      setIsSubmitting(true);

      const productId = await createProduct({
        companyId: currentCompanyId!,
        sku: data.sku || '',
        name: data.name,
        category: data.category,
        description: data.description || undefined,
        subcategory: data.subcategory || undefined,
        preferred_supplier_id: data.preferred_supplier_id
          ? (data.preferred_supplier_id as Id<'suppliers'>)
          : undefined,
        weight_value: typeof data.weight_value === 'number' ? data.weight_value : undefined,
        weight_unit: data.weight_unit || undefined,
        regulatory_registered: data.regulatory_registered,
        regulatory_registration_number: data.regulatory_registration_number || undefined,
        organic_certified: data.organic_certified,
        organic_cert_number: data.organic_cert_number || undefined,
        default_price: typeof data.default_price === 'number' ? data.default_price : undefined,
        price_unit: data.price_unit || undefined,
        procurement_type: data.procurement_type || undefined,
        lot_tracking: data.lot_tracking || undefined,
        shelf_life_days:
          typeof data.shelf_life_days === 'number' ? data.shelf_life_days : undefined,
      });

      toast.success('Producto creado', {
        description: `${data.name} ha sido creado correctamente`,
      });

      router.push(`/resources/products/${productId}`);
    } catch (error) {
      toast.error('Error al crear', {
        description: 'Ocurrio un error al crear el producto',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nuevo Producto"
        icon={Plus}
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Recursos', href: '/resources' },
          { label: 'Nuevo producto' },
        ]}
        action={
          <Button variant="outline" onClick={() => router.push('/resources')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Informacion del Producto</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm
            onSubmit={handleSubmit}
            onCancel={() => router.push('/resources')}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
}
