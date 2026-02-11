'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { getPhaseLabel, getPhaseColors } from '@/lib/constants/phases';
import { Layers, Sprout, Clock } from 'lucide-react';
import Link from 'next/link';
import { Id } from '@/convex/_generated/dataModel';

interface PhaseBatch {
  _id: Id<'batches'>;
  batch_code: string;
  current_quantity: number;
  cultivarName: string;
  daysInProduction: number;
}

interface PhaseCardProps {
  phase: string;
  batchCount: number;
  totalPlants: number;
  avgDays: number;
  batches: PhaseBatch[];
  areaId: string;
}

export function PhaseCard({
  phase,
  batchCount,
  totalPlants,
  avgDays,
  batches,
  areaId,
}: PhaseCardProps) {
  const colors = getPhaseColors(phase);
  const label = getPhaseLabel(phase);

  return (
    <Link href={`/areas/${areaId}/phases/${phase}`} className="block">
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium border ${colors.bg} ${colors.text} ${colors.border}`}
            >
              {label}
            </span>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
            <div className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              <span>{batchCount} {batchCount === 1 ? 'lote' : 'lotes'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sprout className="h-3.5 w-3.5" />
              <span>{totalPlants.toLocaleString()} plantas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>{avgDays}d prom.</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-2">
            {batches.map((batch) => (
              <div
                key={batch._id}
                className="flex items-center justify-between py-1.5 px-2 rounded bg-gray-50 text-sm"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono font-medium text-gray-900 truncate">
                    {batch.batch_code}
                  </span>
                  <span className="text-gray-500 truncate">{batch.cultivarName}</span>
                </div>
                <span className="text-gray-700 font-medium whitespace-nowrap ml-2">
                  {batch.current_quantity.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
