'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { PRODUCT_CATEGORIES } from '@/lib/constants/suppliers';

interface CategoryMultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
}

export function CategoryMultiSelect({
  value = [],
  onChange,
  error,
}: CategoryMultiSelectProps) {
  const handleToggle = (categoryValue: string) => {
    const newValue = value.includes(categoryValue)
      ? value.filter((v) => v !== categoryValue)
      : [...value, categoryValue];
    onChange(newValue);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {PRODUCT_CATEGORIES.map((category) => {
          const isSelected = value.includes(category.value);
          return (
            <button
              type="button"
              key={category.value}
              onClick={() => handleToggle(category.value)}
              className={cn(
                'flex items-center space-x-2 rounded-lg border p-3 cursor-pointer transition-colors text-left',
                isSelected
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              )}
            >
              <div
                className={cn(
                  'h-4 w-4 rounded border flex items-center justify-center flex-shrink-0',
                  isSelected
                    ? 'bg-green-600 border-green-600'
                    : 'border-gray-300 bg-white'
                )}
              >
                {isSelected && <Check className="h-3 w-3 text-white" />}
              </div>
              <span className="flex items-center space-x-2 flex-1">
                <span className="text-lg">{category.icon}</span>
                <span className="text-sm font-medium">{category.label}</span>
              </span>
            </button>
          );
        })}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {value.length > 0 && (
        <p className="text-sm text-gray-600">
          {value.length} categoría{value.length !== 1 ? 's' : ''} seleccionada
          {value.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}

interface CropSpecializationMultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  crops: Array<{ value: string; label: string }>;
}

export function CropSpecializationMultiSelect({
  value = [],
  onChange,
  error,
  crops,
}: CropSpecializationMultiSelectProps) {
  const handleToggle = (cropValue: string) => {
    const newValue = value.includes(cropValue)
      ? value.filter((v) => v !== cropValue)
      : [...value, cropValue];
    onChange(newValue);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {crops.map((crop) => {
          const isSelected = value.includes(crop.value);
          return (
            <button
              type="button"
              key={crop.value}
              onClick={() => handleToggle(crop.value)}
              className={cn(
                'flex items-center space-x-2 rounded-lg border p-3 cursor-pointer transition-colors text-left',
                isSelected
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              )}
            >
              <div
                className={cn(
                  'h-4 w-4 rounded border flex items-center justify-center flex-shrink-0',
                  isSelected
                    ? 'bg-green-600 border-green-600'
                    : 'border-gray-300 bg-white'
                )}
              >
                {isSelected && <Check className="h-3 w-3 text-white" />}
              </div>
              <span className="flex-1 text-sm font-medium">{crop.label}</span>
            </button>
          );
        })}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {value.length > 0 && (
        <p className="text-sm text-gray-600">
          {value.length} cultivo{value.length !== 1 ? 's' : ''} seleccionado
          {value.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
