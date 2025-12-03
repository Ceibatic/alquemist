'use client';

import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export interface DashboardErrorProps {
  error?: Error;
  reset?: () => void;
}

export function DashboardError({ error, reset }: DashboardErrorProps) {
  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="mb-4 rounded-full bg-red-100 p-4">
          <AlertTriangle className="h-12 w-12 text-red-600" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-red-900">
          Error al cargar el dashboard
        </h3>
        <p className="mb-6 max-w-md text-center text-sm text-red-700">
          {error?.message ||
            'Ocurrió un error inesperado. Por favor, intenta nuevamente.'}
        </p>
        {reset && (
          <Button
            onClick={reset}
            variant="destructive"
            className="bg-red-600 hover:bg-red-700"
          >
            Intentar nuevamente
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
