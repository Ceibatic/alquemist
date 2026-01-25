'use client';

import { PageHeader } from '@/components/layout/page-header';
import { ProductList } from '@/components/products/product-list';
import { ShoppingCart } from 'lucide-react';

export function ProductsContent() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Productos"
        icon={ShoppingCart}
        breadcrumbs={[{ label: 'Inicio', href: '/dashboard' }, { label: 'Productos' }]}
        description="Catálogo maestro de productos e insumos"
      />

      <ProductList />
    </div>
  );
}
