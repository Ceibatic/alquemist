'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Leaf, Ruler, Activity, QrCode } from 'lucide-react';

interface PlantCardProps {
  plant: {
    _id: string;
    plant_code: string;
    status: string;
    health_status: string;
    current_height_cm?: number;
    current_nodes?: number;
    plant_stage?: string;
    clones_taken_count?: number;
  };
  onClick?: () => void;
  selected?: boolean;
}

export function PlantCard({ plant, onClick, selected }: PlantCardProps) {
  const healthStyles = {
    healthy: {
      bg: 'bg-green-50 border-green-200',
      badge: 'bg-green-100 text-green-700',
      icon: 'text-green-600',
    },
    stressed: {
      bg: 'bg-amber-50 border-amber-200',
      badge: 'bg-amber-100 text-amber-700',
      icon: 'text-amber-600',
    },
    sick: {
      bg: 'bg-red-50 border-red-200',
      badge: 'bg-red-100 text-red-700',
      icon: 'text-red-600',
    },
  };

  const statusStyles = {
    active: 'bg-green-100 text-green-700',
    harvested: 'bg-blue-100 text-blue-700',
    lost: 'bg-red-100 text-red-700',
    transferred: 'bg-purple-100 text-purple-700',
  };

  const healthStyle = healthStyles[plant.health_status as keyof typeof healthStyles] || healthStyles.healthy;
  const statusStyle = statusStyles[plant.status as keyof typeof statusStyles] || statusStyles.active;

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        healthStyle.bg,
        selected && 'ring-2 ring-green-500'
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <QrCode className={cn('h-4 w-4', healthStyle.icon)} />
            <span className="font-mono text-sm font-semibold">
              {plant.plant_code.split('-').pop()}
            </span>
          </div>
          <Badge variant="secondary" className={statusStyle}>
            {plant.status === 'active' ? 'Activa' : plant.status}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={healthStyle.badge}>
              {plant.health_status === 'healthy'
                ? 'Sana'
                : plant.health_status === 'stressed'
                  ? 'Estresada'
                  : 'Enferma'}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            {plant.current_height_cm && (
              <div className="flex items-center gap-1">
                <Ruler className="h-3 w-3" />
                <span>{plant.current_height_cm} cm</span>
              </div>
            )}
            {plant.current_nodes && (
              <div className="flex items-center gap-1">
                <Leaf className="h-3 w-3" />
                <span>{plant.current_nodes} nodos</span>
              </div>
            )}
            {plant.plant_stage && (
              <div className="flex items-center gap-1 col-span-2">
                <Activity className="h-3 w-3" />
                <span className="capitalize">{plant.plant_stage}</span>
              </div>
            )}
          </div>

          {plant.clones_taken_count !== undefined && plant.clones_taken_count > 0 && (
            <div className="pt-2 border-t border-gray-200">
              <span className="text-xs text-purple-600">
                {plant.clones_taken_count} clones tomados
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
