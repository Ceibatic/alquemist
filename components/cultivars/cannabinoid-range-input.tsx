'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface CannabinoidRangeInputProps {
  label: string;
  minValue?: number;
  maxValue?: number;
  onMinChange: (value: number | undefined) => void;
  onMaxChange: (value: number | undefined) => void;
  error?: string;
  disabled?: boolean;
}

export function CannabinoidRangeInput({
  label,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  error,
  disabled = false,
}: CannabinoidRangeInputProps) {
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      onMinChange(undefined);
    } else {
      const num = parseFloat(val);
      if (!isNaN(num) && num >= 0 && num <= 100) {
        onMinChange(num);
      }
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      onMaxChange(undefined);
    } else {
      const num = parseFloat(val);
      if (!isNaN(num) && num >= 0 && num <= 100) {
        onMaxChange(num);
      }
    }
  };

  // Calculate percentage for visual indicator
  const minPercent = minValue !== undefined ? minValue : 0;
  const maxPercent = maxValue !== undefined ? maxValue : 100;

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor={`${label}-min`} className="text-xs text-gray-600">
            Mínimo (%)
          </Label>
          <Input
            id={`${label}-min`}
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={minValue ?? ''}
            onChange={handleMinChange}
            placeholder="0"
            disabled={disabled}
            className={cn(error && 'border-red-500')}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor={`${label}-max`} className="text-xs text-gray-600">
            Máximo (%)
          </Label>
          <Input
            id={`${label}-max`}
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={maxValue ?? ''}
            onChange={handleMaxChange}
            placeholder="100"
            disabled={disabled}
            className={cn(error && 'border-red-500')}
          />
        </div>
      </div>

      {/* Visual Range Indicator */}
      {(minValue !== undefined || maxValue !== undefined) && (
        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute h-full bg-green-600 rounded-full"
            style={{
              left: `${minPercent}%`,
              right: `${100 - maxPercent}%`,
            }}
          />
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
