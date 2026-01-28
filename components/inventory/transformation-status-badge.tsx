import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type TransformationStatus =
  | 'active'
  | 'transformed'
  | 'consumed'
  | 'harvested'
  | 'expired'
  | 'waste';

interface TransformationStatusBadgeProps {
  status: TransformationStatus;
}

const statusConfig: Record<TransformationStatus, { label: string; className: string }> = {
  active: {
    label: 'Activo',
    className: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100',
  },
  transformed: {
    label: 'Transformado',
    className: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100',
  },
  consumed: {
    label: 'Consumido',
    className: 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-100',
  },
  harvested: {
    label: 'Cosechado',
    className: 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100',
  },
  expired: {
    label: 'Expirado',
    className: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100',
  },
  waste: {
    label: 'Desperdicio',
    className: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100',
  },
};

export function TransformationStatusBadge({ status }: TransformationStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.active;

  return (
    <Badge
      variant="outline"
      className={cn(config.className)}
    >
      {config.label}
    </Badge>
  );
}
