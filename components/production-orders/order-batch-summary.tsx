'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Layers, Leaf, MapPin, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface BatchInfo {
  _id: string;
  batch_code: string;
  current_quantity: number;
  status: string;
  cultivarName?: string | null;
  areaName?: string | null;
  current_phase?: string | null;
}

interface OrderBatchSummaryProps {
  batches: BatchInfo[];
  orderStatus: string;
}

export function OrderBatchSummary({ batches, orderStatus }: OrderBatchSummaryProps) {
  if (orderStatus === 'planning' && batches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lote de Produccion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-gray-500">
            <Layers className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">Sin lote asignado</p>
            <p className="text-xs text-muted-foreground mt-1">
              Se creara automaticamente al activar la orden
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (batches.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {batches.length === 1 ? 'Lote de Produccion' : `Lotes de Produccion (${batches.length})`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {batches.map((batch) => {
            const mortalityInfo = getMortalityInfo(batch);
            return (
              <Link
                key={batch._id}
                href={`/batches/${batch._id}`}
                className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium text-gray-900">
                        {batch.batch_code}
                      </span>
                      <StatusBadge
                        status={batch.status === 'active' ? 'active' : 'inactive'}
                        size="sm"
                        label={batch.status === 'active' ? 'Activo' : batch.status}
                      />
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      {batch.cultivarName && (
                        <span className="flex items-center gap-1">
                          <Leaf className="h-3.5 w-3.5" />
                          {batch.cultivarName}
                        </span>
                      )}
                      {batch.areaName && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {batch.areaName}
                        </span>
                      )}
                      {batch.current_phase && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {batch.current_phase}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold flex items-center gap-1 justify-end">
                        <Leaf className="h-4 w-4 text-green-500" />
                        {batch.current_quantity.toLocaleString()}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function getMortalityInfo(batch: BatchInfo) {
  return null;
}
