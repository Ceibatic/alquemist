'use client';

import { MapPin, Sprout, Package, AlertTriangle } from 'lucide-react';
import { MetricsCard } from './metrics-card';

export interface MetricsBarProps {
  areas: {
    total: number;
    active: number;
  };
  cultivars: {
    total: number;
  };
  inventory: {
    total: number;
    lowStock: number;
  };
  alerts: {
    total: number;
  };
}

export function MetricsBar({
  areas,
  cultivars,
  inventory,
  alerts,
}: MetricsBarProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricsCard
        icon={MapPin}
        title="Áreas"
        value={areas.active}
        subtitle={`${areas.total} total${areas.total === 1 ? '' : 'es'}`}
        href="/dashboard/areas"
      />

      <MetricsCard
        icon={Sprout}
        title="Cultivares"
        value={cultivars.total}
        subtitle={`activo${cultivars.total === 1 ? '' : 's'}`}
        href="/dashboard/cultivars"
      />

      <MetricsCard
        icon={Package}
        title="Inventario"
        value={inventory.total}
        subtitle={`${inventory.total} item${inventory.total === 1 ? '' : 's'}`}
        href="/dashboard/inventory"
      />

      <MetricsCard
        icon={AlertTriangle}
        title="Alertas"
        value={alerts.total}
        subtitle={
          alerts.total === 0
            ? 'sin alertas'
            : `${alerts.total} requiere${alerts.total === 1 ? '' : 'n'} atención`
        }
        variant={alerts.total > 0 ? 'warning' : 'default'}
        href={alerts.total > 0 ? '/dashboard/alerts' : undefined}
      />
    </div>
  );
}
