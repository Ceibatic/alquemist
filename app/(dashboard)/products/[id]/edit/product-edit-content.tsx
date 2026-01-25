'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/components/providers/user-provider';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductForm } from '@/components/products/product-form';
import { ShoppingCart, ArrowLeft, Pencil } from 'lucide-react';
import type { ProductFormInput } from '@/lib/validations/product';

interface ProductEditContentProps {
  productId: string;
}

export function ProductEditContent({ productId }: ProductEditContentProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { userId } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const product = useQuery(api.products.getById, {
    productId: productId as Id<'products'>,
  });

  const updateProduct = useMutation(api.products.update);

  const handleSubmit = async (data: ProductFormInput) => {
    try {
      setIsSubmitting(true);

      // Clean up empty strings to undefined
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
        // Price change tracking
        userId: userId || undefined,
        priceChangeCategory: data.priceChangeCategory || undefined,
        priceChangeReason: data.priceChangeReason || undefined,
        priceChangeNotes: data.priceChangeNotes || undefined,
      };

      await updateProduct(cleanedData);

      toast({
        title: 'Producto actualizado',
        description: `"${data.name}" ha sido actualizado exitosamente.`,
      });

      router.push(`/products/${productId}`);
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar el producto.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (product === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-[600px]" />
      </div>
    );
  }

  if (product === null) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Producto no encontrado"
          icon={ShoppingCart}
          breadcrumbs={[
            { label: 'Inicio', href: '/dashboard' },
            { label: 'Productos', href: '/products' },
            { label: 'No encontrado' },
          ]}
        />
        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">El producto solicitado no existe o fue eliminado.</p>
            <Button
              variant="link"
              onClick={() => router.push('/products')}
              className="mt-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a productos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Editar: ${product.name}`}
        icon={Pencil}
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Productos', href: '/products' },
          { label: product.name, href: `/products/${productId}` },
          { label: 'Editar' },
        ]}
        action={
          <Button variant="outline" onClick={() => router.push(`/products/${productId}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Información del Producto</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm
            productId={productId}
            onSubmit={handleSubmit}
            onCancel={() => router.push(`/products/${productId}`)}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
}
