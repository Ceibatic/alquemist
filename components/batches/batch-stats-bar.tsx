'use client';

import { Badge } from '@/components/ui/badge';
import { PHASE_COLORS, PHASE_LABELS } from '@/lib/constants/phases';

interface CurrentPhaseInfo {
  phaseName: string;
  plannedStartDate: number;
  plannedEndDate: number;
  actualStartDate?: number;
  status: string;
  phaseOrder: number;
  totalPhases: number;
}

interface BatchStatsBarProps {
  currentPhase?: string;
  currentQuantity: number;
  initialQuantity: number;
  lostQuantity: number;
  daysInProduction: number;
  currentPhaseInfo: CurrentPhaseInfo | null;
}

export function BatchStatsBar({
  currentPhase,
  currentQuantity,
  initialQuantity,
  lostQuantity,
  daysInProduction,
  currentPhaseInfo,
}: BatchStatsBarProps) {
  const survivalRate =
    initialQuantity > 0
      ? Math.round((currentQuantity / initialQuantity) * 100)
      : 100;

  const phaseColors = currentPhase
    ? PHASE_COLORS[currentPhase] ?? { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' }
    : null;

  // Calculate "Day X of Y" for phase progress
  let phaseProgressLabel: string | null = null;
  if (currentPhaseInfo) {
    const startDate = currentPhaseInfo.actualStartDate ?? currentPhaseInfo.plannedStartDate;
    const dayInPhase = Math.max(
      1,
      Math.floor((Date.now() - startDate) / (1000 * 60 * 60 * 24)) + 1
    );
    const totalPhaseDays = Math.max(
      1,
      Math.floor(
        (currentPhaseInfo.plannedEndDate - currentPhaseInfo.plannedStartDate) /
          (1000 * 60 * 60 * 24)
      )
    );
    phaseProgressLabel = `Dia ${dayInPhase} de ${totalPhaseDays}`;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {/* Phase */}
      {currentPhase && phaseColors && (
        <Badge
          variant="outline"
          className={`${phaseColors.bg} ${phaseColors.text} ${phaseColors.border}`}
        >
          {PHASE_LABELS[currentPhase] ?? currentPhase}
        </Badge>
      )}

      {/* Plants: current / initial */}
      <Badge
        variant="outline"
        className={
          survivalRate >= 90
            ? 'bg-green-50 text-green-700 border-green-200'
            : 'bg-amber-50 text-amber-700 border-amber-200'
        }
      >
        {currentQuantity}/{initialQuantity}
      </Badge>

      {/* Losses */}
      <Badge
        variant="outline"
        className={
          lostQuantity > 0
            ? 'bg-red-50 text-red-700 border-red-200'
            : 'bg-gray-50 text-gray-500 border-gray-200'
        }
      >
        {lostQuantity > 0 ? `-${lostQuantity}` : '0'} perdidas
      </Badge>

      {/* Days in production */}
      <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
        {daysInProduction}d
      </Badge>

      {/* Survival rate */}
      <Badge
        variant="outline"
        className={
          survivalRate >= 90
            ? 'bg-green-50 text-green-700 border-green-200'
            : survivalRate >= 70
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-red-50 text-red-700 border-red-200'
        }
      >
        {survivalRate}%
      </Badge>

      {/* Phase progress: Day X of Y */}
      {phaseProgressLabel ? (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          {phaseProgressLabel}
        </Badge>
      ) : (
        <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">
          Dia {daysInProduction}
        </Badge>
      )}
    </div>
  );
}
