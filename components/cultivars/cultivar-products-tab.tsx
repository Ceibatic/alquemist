'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { getPhaseLabel, getPhaseColors } from '@/lib/constants/phases';
import { productCategoryLabels } from '@/lib/validations/product';
import { CreatePhaseProductModal } from './create-phase-product-modal';
import {
  Plus,
  Package,
  ArrowRight,
  Sprout,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

interface CultivarProductsTabProps {
  cultivarId: Id<'cultivars'>;
}

export function CultivarProductsTab({ cultivarId }: CultivarProductsTabProps) {
  const data = useQuery(api.cultivars.getProductsByPhase, { cultivarId });
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);

  if (data === undefined) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  if (data === null) {
    return (
      <EmptyState
        icon={Package}
        title="Cultivar no encontrado"
        description="No se pudo cargar la informacion del cultivar."
      />
    );
  }

  const handleCreateProduct = (phaseName: string) => {
    setSelectedPhase(phaseName);
    setCreateModalOpen(true);
  };

  const hasAnyProducts = data.totalProducts > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            Productos por Fase — {data.cropTypeName}
          </h3>
          <p className="text-sm text-gray-500">
            {data.totalProducts} {data.totalProducts === 1 ? 'producto' : 'productos'} configurados
          </p>
        </div>
      </div>

      {/* Empty state CTA */}
      {!hasAnyProducts && (
        <Card className="border-dashed border-2 border-amber-200 bg-amber-50/50">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Sprout className="h-12 w-12 text-amber-500 mb-3" />
            <h4 className="text-base font-semibold text-gray-900 mb-1">
              Sin productos configurados
            </h4>
            <p className="text-sm text-gray-600 text-center max-w-md mb-4">
              Crea productos para cada fase del ciclo de {data.cropTypeName}.
              Esto permite trazabilidad completa del material vegetal de {data.cultivarName} en inventario.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Phases timeline */}
      <div className="space-y-3">
        {data.phases.map((phase, index) => {
          const colors = getPhaseColors(phase.phase);
          const label = getPhaseLabel(phase.phase);
          const hasProduct = !!phase.product;
          const isLast = index === data.phases.length - 1;

          return (
            <div key={phase.phase} className="relative">
              {/* Connection line to next phase */}
              {!isLast && hasProduct && data.phases[index + 1]?.product && (
                <div className="absolute left-6 top-full w-0.5 h-3 bg-gray-200 z-0" />
              )}

              <Card className={hasProduct ? '' : 'border-dashed'}>
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    {/* Phase badge */}
                    <div className="shrink-0">
                      <Badge
                        className={`${colors.bg} ${colors.text} ${colors.border} border`}
                      >
                        {label}
                      </Badge>
                      <p className="text-xs text-gray-400 mt-1 text-center">
                        {phase.duration_days}d
                      </p>
                    </div>

                    {/* Arrow */}
                    <ArrowRight className="h-4 w-4 text-gray-300 shrink-0" />

                    {/* Product info or create button */}
                    {hasProduct ? (
                      <div className="flex items-center justify-between flex-1 min-w-0">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm truncate">
                              {phase.product!.name}
                            </span>
                            <span className="text-xs text-gray-400 font-mono">
                              {phase.product!.sku}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {productCategoryLabels[phase.product!.category] || phase.product!.category}
                            {phase.product!.default_unit && ` · ${phase.product!.default_unit}`}
                          </p>
                        </div>
                        <Link
                          href={`/resources/products/${phase.product!._id}`}
                          className="shrink-0"
                        >
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-amber-600 border-amber-200 hover:bg-amber-50"
                        onClick={() => handleCreateProduct(phase.phase)}
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Crear producto para {label.toLowerCase()}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Orphaned products (linked to cultivar but no valid phase) */}
      {data.orphanedProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-600">
              Productos sin fase asignada
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.orphanedProducts.map((product) => (
              <div
                key={product._id}
                className="flex items-center justify-between p-2 rounded bg-gray-50"
              >
                <div>
                  <span className="text-sm font-medium">{product.name}</span>
                  <span className="text-xs text-gray-400 ml-2">{product.sku}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {productCategoryLabels[product.category] || product.category}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Create product modal */}
      <CreatePhaseProductModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        cultivarId={cultivarId}
        cropPhase={selectedPhase}
        cultivarName={data.cultivarName}
        phaseName={selectedPhase ? getPhaseLabel(selectedPhase) : ''}
      />
    </div>
  );
}
