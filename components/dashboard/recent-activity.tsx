'use client';

import {
  MapPin,
  Sprout,
  Package,
  UserPlus,
  Factory,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { ActivityType } from '@/lib/types/phase2';

export interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  timestamp: number;
}

export interface RecentActivityProps {
  activities: Activity[];
}

const activityIcons: Record<ActivityType, typeof MapPin> = {
  area_created: MapPin,
  area_updated: MapPin,
  area_status_changed: MapPin,
  cultivar_created: Sprout,
  cultivar_updated: Sprout,
  inventory_received: Package,
  inventory_low_stock: Package,
  inventory_expired: Package,
  supplier_created: Factory,
  supplier_approved: Factory,
  user_invited: UserPlus,
  user_joined: UserPlus,
  facility_created: Factory,
};

export function RecentActivity({ activities }: RecentActivityProps) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <TrendingUp className="mb-4 h-12 w-12 text-gray-300" />
            <p className="text-sm text-gray-600">No hay actividad reciente</p>
            <p className="mt-1 text-xs text-gray-500">
              Las actividades aparecerán aquí cuando comiences a trabajar
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Actividad Reciente</CardTitle>
        <Button variant="ghost" size="sm" disabled title="Disponible pronto">
          Ver todo
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activityIcons[activity.type] || TrendingUp;
            const relativeTime = formatDistanceToNow(activity.timestamp, {
              addSuffix: true,
              locale: es,
            });

            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 border-l-2 border-gray-200 pl-4 py-2"
              >
                <div className="mt-0.5 rounded-lg bg-green-50 p-2">
                  <Icon className="h-4 w-4 text-green-700" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">{relativeTime}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
