'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  PRODUCT_CATEGORIES,
  getCategoryIcon,
} from '@/lib/constants/suppliers';

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
            <div
              key={category.value}
              onClick={() => handleToggle(category.value)}
              className={cn(
                'flex items-center space-x-2 rounded-lg border p-3 cursor-pointer transition-colors',
                isSelected
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              )}
            >
              <Checkbox
                id={`category-${category.value}`}
                checked={isSelected}
                onCheckedChange={() => handleToggle(category.value)}
              />
              <Label
                htmlFor={`category-${category.value}`}
                className="flex items-center space-x-2 cursor-pointer flex-1"
              >
                <span className="text-lg">{category.icon}</span>
                <span className="text-sm font-medium">{category.label}</span>
              </Label>
            </div>
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
            <div
              key={crop.value}
              onClick={() => handleToggle(crop.value)}
              className={cn(
                'flex items-center space-x-2 rounded-lg border p-3 cursor-pointer transition-colors',
                isSelected
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              )}
            >
              <Checkbox
                id={`crop-${crop.value}`}
                checked={isSelected}
                onCheckedChange={() => handleToggle(crop.value)}
              />
              <Label
                htmlFor={`crop-${crop.value}`}
                className="cursor-pointer flex-1 text-sm font-medium"
              >
                {crop.label}
              </Label>
            </div>
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
