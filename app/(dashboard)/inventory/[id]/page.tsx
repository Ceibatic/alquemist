import { Suspense } from 'react';
import { Metadata } from 'next';
import { InventoryDetailContent } from './inventory-detail-content';

export const metadata: Metadata = {
  title: 'Detalle de Inventario | Alquemist',
  description: 'Información detallada del item de inventario',
};

interface InventoryDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function InventoryDetailPage({
  params,
}: InventoryDetailPageProps) {
  const { id } = await params;
  return (
    <div className="flex-1 space-y-6 p-8">
      <Suspense
        fallback={
          <div className="flex h-[400px] items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-green-600" />
              <p className="text-sm text-gray-600">Cargando detalles...</p>
            </div>
          </div>
        }
      >
        <InventoryDetailContent inventoryId={id} />
      </Suspense>
    </div>
  );
}
