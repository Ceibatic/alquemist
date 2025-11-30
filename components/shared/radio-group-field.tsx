'use client';

import * as React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

export interface RadioGroupFieldProps {
  label?: string;
  options: RadioOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

export function RadioGroupField({
  label,
  options,
  value,
  onValueChange,
  error,
  required = false,
  disabled = false,
  orientation = 'vertical',
  className,
}: RadioGroupFieldProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {label && (
        <Label>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}

      <RadioGroup
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        className={cn(
          orientation === 'horizontal' && 'flex flex-row flex-wrap gap-4'
        )}
      >
        {options.map((option) => (
          <div
            key={option.value}
            className={cn(
              'flex items-start space-x-3 space-y-0',
              orientation === 'vertical' && 'pb-3'
            )}
          >
            <RadioGroupItem
              value={option.value}
              id={`radio-${option.value}`}
              className="mt-0.5"
            />
            <div className="flex-1">
              <Label
                htmlFor={`radio-${option.value}`}
                className="font-normal cursor-pointer"
              >
                {option.label}
              </Label>
              {option.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {option.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </RadioGroup>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
