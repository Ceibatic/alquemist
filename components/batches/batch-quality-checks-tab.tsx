'use client';

import { Id } from '@/convex/_generated/dataModel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info, ClipboardCheck } from 'lucide-react';

interface BatchQualityChecksTabProps {
  batchId: Id<'batches'>;
}

export function BatchQualityChecksTab({ batchId }: BatchQualityChecksTabProps) {
  // TODO: Implement when quality checks module is ready
  // const qualityChecks = useQuery(api.qualityChecks.listByBatch, { batchId });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5" />
          Inspecciones de Calidad
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="rounded-full bg-blue-100 p-4 mb-4">
            <Info className="h-12 w-12 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Modulo Proximamente
          </h3>
          <p className="text-sm text-gray-600 text-center max-w-md mb-6">
            El modulo de inspecciones de calidad estara disponible pronto. Aqui podras:
          </p>
          <ul className="text-sm text-gray-600 space-y-2 mb-6">
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              Registrar inspecciones de calidad
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              Ver tendencias y graficos de calidad
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              Configurar alertas automaticas
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              Exportar reportes de calidad
            </li>
          </ul>
          <Button variant="outline" disabled>
            Crear Primera Inspeccion
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
