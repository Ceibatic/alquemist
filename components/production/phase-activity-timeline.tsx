'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  useDraggable,
  useDroppable,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { GripVertical, Lock } from 'lucide-react';

interface ActivityItem {
  _id: string;
  activity_type: string;
  status: string;
  phase_role?: string;
  order_phase_id?: string;
  entity_id?: string;
  group_id?: string;
  scheduled_date: number;
}

interface PhaseItem {
  _id: string;
  phase_name: string;
  phase_order: number;
  status: string;
}

function DraggableActivity({
  activity,
  isDragging,
}: {
  activity: ActivityItem;
  isDragging?: boolean;
}) {
  const canDrag =
    activity.status === 'pending' &&
    activity.phase_role !== 'entry' &&
    activity.phase_role !== 'exit';

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: activity._id,
    disabled: !canDrag,
    data: { activity },
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 px-2 py-1 rounded text-xs border ${
        canDrag ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
      } ${isDragging ? 'opacity-50' : ''} ${
        activity.status === 'completed'
          ? 'bg-green-50 border-green-200'
          : activity.status === 'cancelled'
          ? 'bg-gray-50 border-gray-200 text-muted-foreground line-through'
          : 'bg-white border-gray-200'
      }`}
      {...(canDrag ? { ...attributes, ...listeners } : {})}
    >
      {canDrag ? (
        <GripVertical className="h-3 w-3 text-gray-300 flex-shrink-0" />
      ) : (
        <Lock className="h-3 w-3 text-gray-300 flex-shrink-0" />
      )}
      <span className="truncate">{activity.activity_type}</span>
      {activity.phase_role && (
        <Badge
          className={
            activity.phase_role === 'entry'
              ? 'bg-green-100 text-green-700 text-[10px] px-1 py-0'
              : 'bg-amber-100 text-amber-700 text-[10px] px-1 py-0'
          }
        >
          {activity.phase_role === 'entry' ? 'E' : 'S'}
        </Badge>
      )}
      <Badge
        className={
          activity.status === 'completed'
            ? 'bg-green-100 text-green-700 text-[10px] px-1 py-0'
            : activity.status === 'pending'
            ? 'bg-gray-100 text-gray-600 text-[10px] px-1 py-0'
            : 'bg-gray-100 text-gray-600 text-[10px] px-1 py-0'
        }
      >
        {activity.status === 'completed' ? 'OK' : activity.status === 'pending' ? 'P' : activity.status.charAt(0).toUpperCase()}
      </Badge>
    </div>
  );
}

function DroppablePhase({
  phase,
  activities,
  activeId,
}: {
  phase: PhaseItem;
  activities: ActivityItem[];
  activeId: string | null;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: phase._id,
    data: { phase },
  });

  const phaseActivities = activities.filter(
    (a) => a.order_phase_id === phase._id && a.status !== 'cancelled'
  );

  return (
    <div
      ref={setNodeRef}
      className={`space-y-1 p-2 rounded-md border min-h-[60px] transition-colors ${
        isOver
          ? 'border-amber-400 bg-amber-50/50'
          : 'border-gray-200 bg-gray-50/30'
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium">{phase.phase_name}</span>
        <span className="text-[10px] text-muted-foreground">
          {phaseActivities.length} act.
        </span>
      </div>
      {phaseActivities.map((a) => (
        <DraggableActivity
          key={a._id}
          activity={a}
          isDragging={activeId === a._id}
        />
      ))}
      {phaseActivities.length === 0 && (
        <p className="text-[10px] text-muted-foreground italic py-2 text-center">
          Sin actividades
        </p>
      )}
    </div>
  );
}

interface PhaseActivityTimelineProps {
  phases: PhaseItem[];
  activities: ActivityItem[];
}

export function PhaseActivityTimeline({
  phases,
  activities,
}: PhaseActivityTimelineProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const reassignPhase = useMutation(api.scheduledActivities.reassignPhase);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activity = (active.data.current as any)?.activity as ActivityItem | undefined;
    const targetPhase = (over.data.current as any)?.phase as PhaseItem | undefined;

    if (!activity || !targetPhase) return;
    if (activity.order_phase_id === targetPhase._id) return;

    try {
      const result = await reassignPhase({
        activityId: activity._id as Id<'scheduled_activities'>,
        newPhaseId: targetPhase._id as Id<'order_phases'>,
        moveGroup: false,
      });
      toast.success(
        `Actividad movida a fase '${result.phaseName}'`
      );
    } catch (err: any) {
      toast.error('Error', {
        description: err?.message ?? 'No se pudo mover la actividad.',
      });
    }
  };

  const activeActivity = activeId
    ? activities.find((a) => a._id === activeId)
    : null;

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {phases.map((phase) => (
          <DroppablePhase
            key={phase._id}
            phase={phase}
            activities={activities}
            activeId={activeId}
          />
        ))}
      </div>

      <DragOverlay>
        {activeActivity && (
          <div className="flex items-center gap-2 px-2 py-1 rounded text-xs border bg-white border-amber-400 shadow-md">
            <GripVertical className="h-3 w-3 text-amber-500 flex-shrink-0" />
            <span>{activeActivity.activity_type}</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
