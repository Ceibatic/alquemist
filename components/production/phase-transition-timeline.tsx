'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  CheckCircle,
  Undo2,
  LogIn,
  LogOut,
  Shield,
} from 'lucide-react';

interface PhaseTransitionTimelineProps {
  orderId: Id<'production_orders'>;
}

const TRANSITION_CONFIG: Record<
  string,
  { label: string; icon: typeof Play; color: string }
> = {
  started: {
    label: 'Iniciada',
    icon: Play,
    color: 'text-blue-600 bg-blue-100',
  },
  completed: {
    label: 'Completada',
    icon: CheckCircle,
    color: 'text-green-600 bg-green-100',
  },
  reverted: {
    label: 'Revertida',
    icon: Undo2,
    color: 'text-amber-600 bg-amber-100',
  },
  entry_executed: {
    label: 'Entrada ejecutada',
    icon: LogIn,
    color: 'text-emerald-600 bg-emerald-100',
  },
  exit_executed: {
    label: 'Salida ejecutada',
    icon: LogOut,
    color: 'text-orange-600 bg-orange-100',
  },
};

const TRIGGERED_BY_LABELS: Record<string, string> = {
  manual: 'Manual',
  exit_activity: 'Actividad de salida',
  entry_activity: 'Actividad de entrada',
  admin_override: 'Override admin',
  activation: 'Activación',
};

function formatDateTime(timestamp: number) {
  return new Date(timestamp).toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function PhaseTransitionTimeline({
  orderId,
}: PhaseTransitionTimelineProps) {
  const logs = useQuery(api.productionOrders.getPhaseTransitionLog, {
    orderId,
  });

  if (logs === undefined) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No hay transiciones registradas aún.
      </p>
    );
  }

  // Show most recent first
  const sortedLogs = [...logs].reverse();

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

      <div className="space-y-0">
        {sortedLogs.map((log) => {
          const config = TRANSITION_CONFIG[log.transition_type] ?? {
            label: log.transition_type,
            icon: Shield,
            color: 'text-gray-600 bg-gray-100',
          };
          const Icon = config.icon;

          return (
            <div key={log._id} className="relative flex gap-3 py-2.5 pl-1">
              {/* Icon circle */}
              <div
                className={`z-10 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${config.color}`}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">
                    {log.phase_name}
                  </span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {config.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {TRIGGERED_BY_LABELS[log.triggered_by] ?? log.triggered_by}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                  <span>{formatDateTime(log.timestamp)}</span>
                  {log.performedByName && (
                    <>
                      <span>·</span>
                      <span>{log.performedByName}</span>
                    </>
                  )}
                </div>
                {log.reason && (
                  <p className="text-xs text-muted-foreground mt-0.5 italic">
                    {log.reason}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
