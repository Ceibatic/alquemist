'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Loader2, Sprout } from 'lucide-react';

interface YieldCascadePreviewProps {
  cultivarId: string;
  visiblePhases: string[];
}

export function YieldCascadePreview({ cultivarId, visiblePhases }: YieldCascadePreviewProps) {
  const cascade = useQuery(
    api.phaseProductFlows.getYieldCascade,
    cultivarId
      ? { cultivarId: cultivarId as Id<'cultivars'>, phaseNames: visiblePhases }
      : 'skip'
  );

  if (cascade === undefined) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando proyección de rendimiento...
      </div>
    );
  }

  if (!cascade || cascade.length === 0) return null;

  // Calculate cumulative yield from primary outputs only
  const primaryYields = cascade
    .map((phase) => phase.flows.find((f) => f.productRole === 'primary'))
    .filter(Boolean);

  if (primaryYields.length === 0) return null;

  const cumulativeYield = primaryYields.reduce(
    (acc, flow) => acc * (flow!.yieldPct ?? 1),
    1
  );

  // Collect secondary product names for the summary row
  const secondaryItems = cascade.flatMap((phase) =>
    phase.flows
      .filter((f) => f.productRole === 'secondary')
      .map((f) => `${phase.phaseName}: ${f.productName}`)
  );

  const hasSecondaries = secondaryItems.length > 0;

  return (
    <div className="rounded-lg border bg-emerald-50/50 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Sprout className="h-4 w-4 text-emerald-600" />
        <span className="text-sm font-medium text-emerald-800">
          Proyección de rendimiento
        </span>
        <Badge
          variant="outline"
          className="ml-auto text-xs bg-white border-emerald-200 text-emerald-700"
        >
          Rendimiento acumulado: {(cumulativeYield * 100).toFixed(1)}%
        </Badge>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 text-sm">
        {cascade.map((phase, idx) => {
          const primary = phase.flows.find((f) => f.productRole === 'primary');
          if (!primary) return null;

          return (
            <div key={phase.phaseName} className="flex items-center gap-1.5">
              {idx > 0 && (
                <ArrowRight className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
              )}
              <div className="flex items-center gap-1 rounded-md bg-white px-2 py-1 border border-emerald-200">
                <span className="text-emerald-800 font-medium">{phase.phaseName}</span>
                {primary.yieldPct !== undefined && primary.yieldPct !== null && (
                  <Badge
                    variant="secondary"
                    className="text-xs px-1.5 py-0 bg-emerald-100 text-emerald-700 border-0"
                  >
                    {(primary.yieldPct * 100).toFixed(0)}%
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {hasSecondaries && (
        <div className="text-xs text-muted-foreground pt-1 border-t border-emerald-200">
          {secondaryItems.join(' · ')}
        </div>
      )}
    </div>
  );
}
