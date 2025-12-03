'use client';

import { Check, Circle, MapPin, Sprout, Factory, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface OnboardingChecklistProps {
  status: {
    areasConfigured: boolean;
    cultivarsLinked: boolean;
    suppliersAdded: boolean;
    inventorySetup: boolean;
    completionPercentage: number;
  };
}

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: typeof MapPin;
  completed: boolean;
  optional?: boolean;
}

export function OnboardingChecklist({ status }: OnboardingChecklistProps) {
  const items: ChecklistItem[] = [
    {
      id: 'areas',
      title: 'Crear tu primera Área de cultivo',
      description: 'Define las zonas de producción de tu instalación',
      href: '/dashboard/areas',
      icon: MapPin,
      completed: status.areasConfigured,
    },
    {
      id: 'cultivars',
      title: 'Agregar Cultivares',
      description: 'Registra las variedades que vas a cultivar',
      href: '/dashboard/cultivars',
      icon: Sprout,
      completed: status.cultivarsLinked,
    },
    {
      id: 'suppliers',
      title: 'Registrar Proveedores',
      description: 'Añade tus proveedores de semillas e insumos',
      href: '/dashboard/suppliers',
      icon: Factory,
      completed: status.suppliersAdded,
      optional: true,
    },
    {
      id: 'inventory',
      title: 'Configurar Inventario',
      description: 'Registra tus productos e insumos disponibles',
      href: '/dashboard/inventory',
      icon: Package,
      completed: status.inventorySetup,
      optional: true,
    },
  ];

  const completedCount = items.filter((item) => item.completed).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Configuración Inicial</span>
          <span className="text-sm font-normal text-gray-600">
            {completedCount} de {items.length}
          </span>
        </CardTitle>
        <Progress value={status.completionPercentage} className="mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.id}
                className={cn(
                  'flex items-start gap-4 rounded-lg border p-4 transition-colors',
                  item.completed
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                )}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {item.completed ? (
                    <div className="rounded-full bg-green-600 p-1">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  ) : (
                    <Circle className="h-6 w-6 text-gray-400" />
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-gray-600" />
                    <h4 className="font-medium text-gray-900">
                      {item.title}
                      {item.optional && (
                        <span className="ml-2 text-xs font-normal text-gray-500">
                          (opcional)
                        </span>
                      )}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600">{item.description}</p>

                  {!item.completed && (
                    <Button
                      asChild
                      size="sm"
                      className="bg-green-900 hover:bg-green-800"
                    >
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      <Link href={item.href as any}>
                        {item.id === 'areas' ? 'Crear Área' : 'Configurar'}
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {completedCount === items.length && (
          <div className="mt-6 rounded-lg bg-green-50 border border-green-200 p-4 text-center">
            <p className="text-sm font-medium text-green-900">
              ¡Configuración completada!
            </p>
            <p className="mt-1 text-xs text-green-700">
              Ya puedes comenzar a crear órdenes de producción
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
