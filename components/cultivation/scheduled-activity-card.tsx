'use client';

import { Badge } from '@/components/ui/badge';
import {
  Clock,
  CheckCircle,
  SkipForward,
  AlertTriangle,
} from 'lucide-react';

const STATUS_ICONS: Record<string, typeof CheckCircle> = {
  pending: Clock,
  completed: CheckCircle,
  skipped: SkipForward,
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-gray-500',
  completed: 'text-green-600',
  skipped: 'text-yellow-600',
  in_progress: 'text-blue-600',
};

interface ScheduledActivityCardProps {
  activity: {
    _id: string;
    activity_type: string;
    scheduled_date: number;
    status: string;
    crop_phase?: string | null;
    phase_day?: number | null;
    recurrence_index?: number | null;
    recurrence_total?: number | null;
    templateName?: string | null;
    activityTypeName?: string | null;
    activityTypeIcon?: string | null;
    activityTypeColor?: string | null;
    estimated_duration_minutes?: number | null;
    skipped_reason?: string | null;
  };
  isOverdue: boolean;
}

export function ScheduledActivityCard({
  activity,
  isOverdue,
}: ScheduledActivityCardProps) {
  const StatusIcon = isOverdue
    ? AlertTriangle
    : STATUS_ICONS[activity.status] ?? Clock;
  const statusColor = isOverdue
    ? 'text-red-600'
    : STATUS_COLORS[activity.status] ?? 'text-gray-500';

  const displayName = activity.templateName ?? activity.activityTypeName ?? activity.activity_type;
  const date = new Date(activity.scheduled_date);

  return (
    <div
      className={`flex items-center gap-3 p-2 rounded-lg border ${
        isOverdue ? 'border-red-200 bg-red-50' : 'bg-muted/30'
      }`}
    >
      <StatusIcon className={`h-4 w-4 flex-shrink-0 ${statusColor}`} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{displayName}</span>
          {activity.recurrence_index && activity.recurrence_total && (
            <span className="text-xs text-muted-foreground">
              ({activity.recurrence_index}/{activity.recurrence_total})
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{date.toLocaleDateString()}</span>
          {activity.phase_day !== undefined && activity.phase_day !== null && (
            <>
              <span>·</span>
              <span>Dia {activity.phase_day}</span>
            </>
          )}
          {activity.estimated_duration_minutes && (
            <>
              <span>·</span>
              <span>{activity.estimated_duration_minutes}min</span>
            </>
          )}
        </div>
        {activity.skipped_reason && (
          <p className="text-xs text-yellow-600 mt-0.5">{activity.skipped_reason}</p>
        )}
      </div>

      <Badge
        variant="outline"
        className={`text-xs flex-shrink-0 ${
          isOverdue ? 'border-red-300 text-red-700' : ''
        }`}
      >
        {isOverdue ? 'Atrasada' : activity.status === 'completed' ? 'Completada' : activity.status === 'skipped' ? 'Saltada' : 'Pendiente'}
      </Badge>
    </div>
  );
}
