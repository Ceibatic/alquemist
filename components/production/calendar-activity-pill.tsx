'use client';

import { cn } from '@/lib/utils';

export interface CalendarActivity {
  _id: string;
  activity_type: string;
  scheduled_date: number;
  status: string;
  batchCode: string | null;
  activityTypeName: string | null;
  activityTypeColor: string | null;
  assignedToName: string | null;
  areaName: string | null;
  batchPhase: string | null;
  templateName: string | null;
  resourceCount: number;
}

interface CalendarActivityPillProps {
  activity: CalendarActivity;
  onClick: () => void;
  compact?: boolean;
}

function getStatusColor(status: string, scheduledDate: number): string {
  const isOverdue = status === 'pending' && scheduledDate < Date.now();
  if (isOverdue) return 'bg-red-500';
  switch (status) {
    case 'pending': return 'bg-amber-500';
    case 'in_progress': return 'bg-blue-500';
    case 'completed': return 'bg-green-500';
    case 'skipped': return 'bg-gray-400';
    case 'cancelled': return 'bg-gray-300';
    default: return 'bg-gray-400';
  }
}

function getPillOpacity(status: string): string {
  if (status === 'completed') return 'opacity-60';
  if (status === 'skipped' || status === 'cancelled') return 'opacity-50';
  return '';
}

export function CalendarActivityPill({ activity, onClick, compact = false }: CalendarActivityPillProps) {
  const isOverdue = activity.status === 'pending' && activity.scheduled_date < Date.now();
  const dotColor = getStatusColor(activity.status, activity.scheduled_date);
  const opacity = getPillOpacity(activity.status);
  const displayName = activity.activityTypeName ?? activity.activity_type;

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 w-full text-left rounded-md px-2 py-1 text-xs',
        'hover:bg-muted/80 transition-colors cursor-pointer',
        isOverdue && 'bg-red-50',
        opacity,
      )}
    >
      <span className={cn('h-2 w-2 rounded-full shrink-0', dotColor)} />
      <span className="truncate font-medium">{displayName}</span>
      {!compact && activity.batchCode && (
        <span className="shrink-0 text-[10px] text-muted-foreground bg-muted rounded px-1">
          {activity.batchCode}
        </span>
      )}
    </button>
  );
}
