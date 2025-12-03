import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface OccupancyBarProps {
  current: number;
  max: number;
  showLabel?: boolean;
  variant?: 'default' | 'warning' | 'critical';
}

export function OccupancyBar({
  current,
  max,
  showLabel = true,
  variant,
}: OccupancyBarProps) {
  const percentage = max > 0 ? Math.round((current / max) * 100) : 0;

  // Auto-determine variant based on percentage if not provided
  const determineVariant = () => {
    if (variant) return variant;
    if (percentage >= 95) return 'critical';
    if (percentage >= 80) return 'warning';
    return 'default';
  };

  const finalVariant = determineVariant();

  const variantColors = {
    default: 'bg-green-600',
    warning: 'bg-yellow-500',
    critical: 'bg-red-500',
  };

  return (
    <div className="space-y-1">
      {showLabel && (
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Ocupación</span>
          <span className="font-medium">
            {current} / {max} ({percentage}%)
          </span>
        </div>
      )}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={cn(
            'h-full transition-all duration-300',
            variantColors[finalVariant]
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}
