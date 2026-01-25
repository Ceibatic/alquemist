import { Suspense } from 'react';
import { Metadata } from 'next';
import { ProductEditContent } from './product-edit-content';

export const metadata: Metadata = {
  title: 'Editar Producto | Alquemist',
  description: 'Editar información del producto',
};

interface ProductEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductEditPage({ params }: ProductEditPageProps) {
  const { id } = await params;

  return (
    <div className="flex-1 space-y-6 p-8">
      <Suspense
        fallback={
          <div className="flex h-[400px] items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-green-600" />
              <p className="text-sm text-gray-600">Cargando producto...</p>
            </div>
          </div>
        }
      >
        <ProductEditContent productId={id} />
      </Suspense>
    </div>
  );
}
