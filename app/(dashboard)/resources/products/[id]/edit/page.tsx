'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductForm } from '@/components/products/product-form';
import { Pencil, ArrowLeft } from 'lucide-react';
import type { ProductFormInput } from '@/lib/validations/product';

export default function ResourceProductEditPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const product = useQuery(api.products.getById, {
    productId: productId as Id<'products'>,
  });

  const updateProduct = useMutation(api.products.update);

  const handleSubmit = async (data: ProductFormInput) => {
    try {
      setIsSubmitting(true);

      const cleanedData = {
        productId: productId as Id<'products'>,
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
        transformation_produces_id: data.transformation_produces_id
          ? (data.transformation_produces_id as Id<'products'>)
          : undefined,
        default_yield_pct:
          typeof data.default_yield_pct === 'number' ? data.default_yield_pct : undefined,
        procurement_type: data.procurement_type || undefined,
        lot_tracking: data.lot_tracking || undefined,
        shelf_life_days:
          typeof data.shelf_life_days === 'number' ? data.shelf_life_days : undefined,
        priceChangeCategory: data.priceChangeCategory || undefined,
        priceChangeReason: data.priceChangeReason || undefined,
        priceChangeNotes: data.priceChangeNotes || undefined,
        acquisition_value:
          typeof data.acquisition_value === 'number' ? data.acquisition_value : undefined,
        useful_life_months:
          typeof data.useful_life_months === 'number' ? data.useful_life_months : undefined,
        salvage_value:
          typeof data.salvage_value === 'number' ? data.salvage_value : undefined,
      };

      await updateProduct(cleanedData);

      toast.success('Producto actualizado', {
        description: `${data.name} ha sido actualizado correctamente`,
      });

      router.push(`/resources/products/${productId}`);
    } catch (error) {
      toast.error('Error al actualizar', {
        description: 'Ocurrio un error al actualizar el producto',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (product === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (product === null) {
    useEffect(() => {
      toast.error('Producto no encontrado');
      router.push('/resources');
    }, [router]);
    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Editar: ${product.name}`}
        icon={Pencil}
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Recursos', href: '/resources' },
          { label: product.name, href: `/resources/products/${productId}` },
          { label: 'Editar' },
        ]}
        action={
          <Button
            variant="outline"
            onClick={() => router.push(`/resources/products/${productId}`)}
          >
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
            productId={productId}
            onSubmit={handleSubmit}
            onCancel={() => router.push(`/resources/products/${productId}`)}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
}
