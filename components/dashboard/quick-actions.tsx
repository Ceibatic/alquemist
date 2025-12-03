'use client';

import { Plus, MapPin, Sprout, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Accesos Rápidos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button
            asChild
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-gray-900 sm:flex-initial"
          >
            <Link href="/areas">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Área
            </Link>
          </Button>

          <Button
            asChild
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-gray-900 sm:flex-initial"
          >
            <Link href="/cultivars">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Cultivar
            </Link>
          </Button>

          <Button
            asChild
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-gray-900 sm:flex-initial"
          >
            <Link href="/inventory">
              <Plus className="mr-2 h-4 w-4" />
              Agregar Inventario
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
