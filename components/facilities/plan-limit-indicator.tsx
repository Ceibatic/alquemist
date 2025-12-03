'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlanLimitIndicatorProps {
  currentCount: number;
  maxCount: number;
  planName?: string;
}

export function PlanLimitIndicator({
  currentCount,
  maxCount,
  planName = 'Básico',
}: PlanLimitIndicatorProps) {
  const percentage = (currentCount / maxCount) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = currentCount >= maxCount;

  return (
    <Card className={cn(
      'border-l-4',
      isAtLimit ? 'border-l-red-500 bg-red-50' : isNearLimit ? 'border-l-yellow-500 bg-yellow-50' : 'border-l-green-500'
    )}>
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-semibold text-gray-900">
                Plan {planName}: {currentCount} de {maxCount} instalaciones
              </h3>
              {(isNearLimit || isAtLimit) && (
                <AlertCircle className={cn(
                  'h-4 w-4',
                  isAtLimit ? 'text-red-600' : 'text-yellow-600'
                )} />
              )}
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
              <div
                className={cn(
                  'h-2.5 rounded-full transition-all',
                  isAtLimit ? 'bg-red-600' : isNearLimit ? 'bg-yellow-600' : 'bg-green-600'
                )}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>

            <p className="text-xs text-gray-600">
              {isAtLimit ? (
                'Has alcanzado el límite de instalaciones. Actualiza tu plan para agregar más.'
              ) : isNearLimit ? (
                `Estás cerca del límite. Te quedan ${maxCount - currentCount} instalaciones disponibles.`
              ) : (
                `${Math.round(percentage)}% utilizado`
              )}
            </p>
          </div>

          {isAtLimit && (
            <Button
              variant="default"
              size="sm"
              className="ml-4 bg-yellow-600 hover:bg-yellow-700"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Actualizar Plan
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
