import { Suspense } from 'react';
import { Metadata } from 'next';
import { InventoryEditContent } from './inventory-edit-content';

export const metadata: Metadata = {
  title: 'Editar Inventario | Alquemist',
  description: 'Editar item de inventario',
};

interface InventoryEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function InventoryEditPage({
  params,
}: InventoryEditPageProps) {
  const { id } = await params;
  return (
    <div className="flex-1 space-y-6 p-8">
      <Suspense
        fallback={
          <div className="flex h-[400px] items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-green-600" />
              <p className="text-sm text-gray-600">Cargando...</p>
            </div>
          </div>
        }
      >
        <InventoryEditContent inventoryId={id} />
      </Suspense>
    </div>
  );
}
