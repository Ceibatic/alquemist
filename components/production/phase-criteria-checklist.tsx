'use client';

import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckSquare } from 'lucide-react';

interface Criterion {
  id: string;
  label: string;
  type: string;
  config?: any;
  is_required: boolean;
}

interface CriterionStatus {
  criterion_id: string;
  status: string;
  completed_at?: number;
  completed_by?: string;
}

interface PhaseCriteriaChecklistProps {
  orderId: Id<'production_orders'>;
  phaseId: Id<'order_phases'>;
  criteria: Criterion[];
  criteriaStatus: CriterionStatus[];
  userId: Id<'users'>;
  readonly?: boolean;
}

export function PhaseCriteriaChecklist({
  orderId,
  phaseId,
  criteria,
  criteriaStatus,
  userId,
  readonly = false,
}: PhaseCriteriaChecklistProps) {
  const updateStatus = useMutation(api.productionOrders.updateCriterionStatus);

  if (criteria.length === 0) return null;

  const completedCount = criteria.filter((c) => {
    const cs = criteriaStatus.find((s) => s.criterion_id === c.id);
    return cs?.status === 'completed';
  }).length;

  const handleToggle = async (criterionId: string, currentlyCompleted: boolean) => {
    try {
      await updateStatus({
        orderId,
        phaseId,
        criterionId,
        status: currentlyCompleted ? 'pending' : 'completed',
        performedBy: userId,
      });
    } catch {
      toast.error('Error al actualizar criterio');
    }
  };

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex items-center gap-2">
        <CheckSquare className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">
          {completedCount}/{criteria.length} criterios
        </span>
      </div>
      <div className="space-y-1">
        {criteria.map((criterion) => {
          const cs = criteriaStatus.find((s) => s.criterion_id === criterion.id);
          const isCompleted = cs?.status === 'completed';

          return (
            <div
              key={criterion.id}
              className="flex items-center gap-2 text-xs"
            >
              <Checkbox
                checked={isCompleted}
                onCheckedChange={() => handleToggle(criterion.id, isCompleted)}
                disabled={readonly || criterion.type !== 'manual_check'}
                className="h-3.5 w-3.5"
              />
              <span className={isCompleted ? 'line-through text-muted-foreground' : ''}>
                {criterion.label}
              </span>
              {criterion.is_required && !isCompleted && (
                <Badge className="bg-red-100 text-red-700 text-[10px] px-1 py-0">
                  Requerido
                </Badge>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
