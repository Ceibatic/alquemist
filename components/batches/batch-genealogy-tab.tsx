'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import {
  GitBranch,
  ArrowDown,
  ArrowUp,
  Merge,
  Layers,
} from 'lucide-react';

interface BatchGenealogyTabProps {
  batch: {
    _id: Id<'batches'>;
    parent_batch_id?: Id<'batches'>;
    merged_into_batch_id?: Id<'batches'>;
    batch_code: string;
    company_id: Id<'companies'>;
  };
}

export function BatchGenealogyTab({ batch }: BatchGenealogyTabProps) {
  const router = useRouter();

  // Get parent batch if exists
  const parentBatch = useQuery(
    batch.parent_batch_id
      ? api.batches.getById
      : 'skip' as any,
    batch.parent_batch_id ? { batchId: batch.parent_batch_id } : 'skip' as any
  );

  // Get merged-into batch if exists
  const mergedIntoBatch = useQuery(
    batch.merged_into_batch_id
      ? api.batches.getById
      : 'skip' as any,
    batch.merged_into_batch_id ? { batchId: batch.merged_into_batch_id } : 'skip' as any
  );

  // Get child batches (batches that were split from this one)
  const allBatches = useQuery(api.batches.list, {
    companyId: batch.company_id,
  });

  const childBatches = allBatches?.filter(
    (b: any) => b.parent_batch_id === batch._id
  );

  // Loading state
  if (
    (batch.parent_batch_id && parentBatch === undefined) ||
    (batch.merged_into_batch_id && mergedIntoBatch === undefined) ||
    allBatches === undefined
  ) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const hasGenealogy =
    batch.parent_batch_id ||
    batch.merged_into_batch_id ||
    (childBatches && childBatches.length > 0);

  if (!hasGenealogy) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <GitBranch className="h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Sin relaciones genealogicas
          </h3>
          <p className="text-sm text-gray-600 text-center max-w-md">
            Este lote no tiene lotes padres ni hijos. Las relaciones apareceran cuando el lote sea dividido, fusionado, o provenga de una division.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Parent Batch */}
      {batch.parent_batch_id && parentBatch && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowUp className="h-5 w-5 text-blue-600" />
              Lote Padre
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Layers className="h-5 w-5 text-gray-400" />
                    <span className="font-medium text-lg">{parentBatch.batch_code}</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <span className="font-medium">Cultivar:</span>{' '}
                      {parentBatch.cultivarName || 'N/A'}
                    </p>
                    <p>
                      <span className="font-medium">Estado:</span>{' '}
                      <span className="capitalize">{parentBatch.status}</span>
                    </p>
                    <p>
                      <span className="font-medium">Cantidad Actual:</span>{' '}
                      {parentBatch.current_quantity} plantas
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/batches/${parentBatch._id}`)}
                >
                  Ver Detalles
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Batch - Visual Center */}
      <Card className="border-2 border-amber-500 bg-amber-50">
        <CardContent className="py-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Layers className="h-6 w-6 text-amber-600" />
              <span className="text-xl font-bold text-amber-900">
                {batch.batch_code}
              </span>
            </div>
            <p className="text-sm text-amber-700">Lote Actual</p>
          </div>
        </CardContent>
      </Card>

      {/* Child Batches */}
      {childBatches && childBatches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowDown className="h-5 w-5 text-green-600" />
              Lotes Hijos ({childBatches.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                Lotes creados a partir de la division de este lote:
              </p>
              {childBatches.map((child: any) => (
                <div
                  key={child._id}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Layers className="h-5 w-5 text-gray-400" />
                        <span className="font-medium">{child.batch_code}</span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          <span className="font-medium">Estado:</span>{' '}
                          <span className="capitalize">{child.status}</span>
                        </p>
                        <p>
                          <span className="font-medium">Cantidad Actual:</span>{' '}
                          {child.current_quantity} plantas
                        </p>
                        <p>
                          <span className="font-medium">Area:</span>{' '}
                          {child.areaName || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/batches/${child._id}`)}
                    >
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Merged Into Batch */}
      {batch.merged_into_batch_id && mergedIntoBatch && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Merge className="h-5 w-5 text-purple-600" />
              Fusionado En
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 border border-purple-200 rounded-lg bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Layers className="h-5 w-5 text-purple-400" />
                    <span className="font-medium text-lg">{mergedIntoBatch.batch_code}</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <span className="font-medium">Cultivar:</span>{' '}
                      {mergedIntoBatch.cultivarName || 'N/A'}
                    </p>
                    <p>
                      <span className="font-medium">Estado:</span>{' '}
                      <span className="capitalize">{mergedIntoBatch.status}</span>
                    </p>
                    <p>
                      <span className="font-medium">Cantidad Actual:</span>{' '}
                      {mergedIntoBatch.current_quantity} plantas
                    </p>
                  </div>
                  <div className="mt-2 text-sm text-purple-700 bg-purple-100 px-3 py-1 rounded-md inline-block">
                    Este lote fue fusionado en el lote destino
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/batches/${mergedIntoBatch._id}`)}
                >
                  Ver Detalles
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
