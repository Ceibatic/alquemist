'use client';

import { AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface UserErrorFallbackProps {
  error?: Error | null;
}

export function UserErrorFallback({ error }: UserErrorFallbackProps) {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <Card className="p-8">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="rounded-full bg-red-100 p-4">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-900">
            Error al cargar usuarios
          </h3>
          <p className="text-sm text-gray-600 max-w-md">
            {error?.message || 'No se pudieron cargar los datos de usuarios. Por favor, intenta recargar la página.'}
          </p>
        </div>
        <Button
          onClick={handleReload}
          className="mt-4 bg-[#FFC107] text-gray-900 hover:bg-[#FFB300]"
        >
          Recargar página
        </Button>
      </div>
    </Card>
  );
}
