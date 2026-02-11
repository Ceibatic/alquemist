'use client';

import { Doc } from '@/convex/_generated/dataModel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Bug,
  Leaf,
  AlertTriangle,
  TrendingUp,
  Zap,
  Wind,
  ThumbsUp,
  HelpCircle,
  Wrench,
  CheckCircle,
  RotateCcw,
  Calendar,
} from 'lucide-react';

// ── Constants ────────────────────────────────────────────────────────────────

const OBSERVATION_TYPE_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; color: string }
> = {
  pest: { label: 'Plaga', icon: Bug, color: 'text-red-600 bg-red-50' },
  disease: { label: 'Enfermedad', icon: AlertTriangle, color: 'text-orange-600 bg-orange-50' },
  deficiency: { label: 'Deficiencia', icon: TrendingUp, color: 'text-yellow-600 bg-yellow-50' },
  excess: { label: 'Exceso', icon: Zap, color: 'text-purple-600 bg-purple-50' },
  mechanical_damage: { label: 'Daño mecánico', icon: Wrench, color: 'text-gray-600 bg-gray-50' },
  environmental_stress: { label: 'Estrés ambiental', icon: Wind, color: 'text-blue-600 bg-blue-50' },
  growth: { label: 'Crecimiento', icon: Leaf, color: 'text-green-600 bg-green-50' },
  positive: { label: 'Positiva', icon: ThumbsUp, color: 'text-emerald-600 bg-emerald-50' },
  other: { label: 'Otra', icon: HelpCircle, color: 'text-gray-600 bg-gray-50' },
};

const SEVERITY_CONFIG: Record<string, { label: string; color: string }> = {
  none: { label: 'Sin severidad', color: 'bg-gray-100 text-gray-700' },
  low: { label: 'Baja', color: 'bg-green-100 text-green-700' },
  medium: { label: 'Media', color: 'bg-yellow-100 text-yellow-800' },
  high: { label: 'Alta', color: 'bg-orange-100 text-orange-700' },
  critical: { label: 'Crítica', color: 'bg-red-100 text-red-700' },
};

export { OBSERVATION_TYPE_CONFIG, SEVERITY_CONFIG };

// ── Component ────────────────────────────────────────────────────────────────

interface ObservationCardProps {
  observation: Doc<'activity_observations'>;
  onResolve?: (observationId: Doc<'activity_observations'>['_id']) => void;
  onReopen?: (observationId: Doc<'activity_observations'>['_id']) => void;
  compact?: boolean;
}

export function ObservationCard({
  observation,
  onResolve,
  onReopen,
  compact = false,
}: ObservationCardProps) {
  const typeConfig = OBSERVATION_TYPE_CONFIG[observation.observation_type] ?? OBSERVATION_TYPE_CONFIG.other;
  const severityConfig = observation.severity
    ? SEVERITY_CONFIG[observation.severity]
    : null;
  const Icon = typeConfig.icon;

  const daysSinceDetection = Math.floor(
    (Date.now() - observation.created_at) / (1000 * 60 * 60 * 24)
  );

  const isOverdue =
    !observation.resolved &&
    observation.follow_up_date != null &&
    observation.follow_up_date < Date.now();

  return (
    <div
      className={`border rounded-lg p-3 ${observation.resolved ? 'bg-gray-50 border-gray-200' : isOverdue ? 'border-red-300 bg-red-50/30' : 'border-gray-200'}`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-1.5 rounded-md ${typeConfig.color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{typeConfig.label}</span>
            {severityConfig && (
              <Badge variant="outline" className={`text-xs ${severityConfig.color}`}>
                {severityConfig.label}
              </Badge>
            )}
            {observation.resolved && (
              <Badge variant="outline" className="text-xs bg-green-100 text-green-700">
                <CheckCircle className="h-3 w-3 mr-1" />
                Resuelto
              </Badge>
            )}
            {isOverdue && (
              <Badge variant="outline" className="text-xs bg-red-100 text-red-700">
                <Calendar className="h-3 w-3 mr-1" />
                Vencido
              </Badge>
            )}
          </div>
          {observation.organism_name && (
            <p className="text-xs text-gray-500 mt-0.5">{observation.organism_name}</p>
          )}
          {!compact && (
            <>
              <p className="text-sm text-gray-700 mt-1">{observation.description}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                {observation.affected_area_pct != null && (
                  <span>{observation.affected_area_pct}% área afectada</span>
                )}
                {observation.affected_plant_count != null && (
                  <span>{observation.affected_plant_count} plantas</span>
                )}
                {observation.plant_part && <span>Parte: {observation.plant_part}</span>}
                <span>{daysSinceDetection}d desde detección</span>
              </div>
              {observation.recommended_action && (
                <p className="text-xs text-blue-700 bg-blue-50 rounded px-2 py-1 mt-2">
                  Acción: {observation.recommended_action}
                </p>
              )}
            </>
          )}
        </div>
        {!observation.resolved && onResolve && (
          <Button
            variant="ghost"
            size="sm"
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
            onClick={() => onResolve(observation._id)}
          >
            <CheckCircle className="h-4 w-4" />
          </Button>
        )}
        {observation.resolved && onReopen && (
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
            onClick={() => onReopen(observation._id)}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
