import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'active' | 'maintenance' | 'inactive' | string;
  label?: string;
  size?: 'sm' | 'default';
}

const statusConfig = {
  active: {
    label: 'Activa',
    dotColor: 'bg-green-500',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
  },
  maintenance: {
    label: 'Mantenimiento',
    dotColor: 'bg-yellow-500',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-200',
  },
  inactive: {
    label: 'Inactiva',
    dotColor: 'bg-red-500',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
  },
};

const sizeConfig = {
  sm: {
    container: 'px-2 py-0.5 text-[10px]',
    dot: 'h-1 w-1',
    gap: 'gap-1',
  },
  default: {
    container: 'px-2.5 py-0.5 text-xs',
    dot: 'h-1.5 w-1.5',
    gap: 'gap-1.5',
  },
};

export function StatusBadge({ status, label, size = 'default' }: StatusBadgeProps) {
  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
  const sizeStyles = sizeConfig[size];
  const displayLabel = label || config.label;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        sizeStyles.container,
        sizeStyles.gap,
        config.bgColor,
        config.textColor,
        config.borderColor
      )}
    >
      <span className={cn('rounded-full', sizeStyles.dot, config.dotColor)} />
      {displayLabel}
    </span>
  );
}
