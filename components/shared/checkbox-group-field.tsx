'use client';

import * as React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

export interface CheckboxOption {
  value: string;
  label: string;
  description?: string;
}

export interface CheckboxGroupFieldProps {
  label?: string;
  options: CheckboxOption[];
  value?: string[];
  onValueChange?: (value: string[]) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  minSelect?: number;
  maxSelect?: number;
  className?: string;
}

export function CheckboxGroupField({
  label,
  options,
  value = [],
  onValueChange,
  error,
  required = false,
  disabled = false,
  minSelect,
  maxSelect,
  className,
}: CheckboxGroupFieldProps) {
  const handleCheckboxChange = (optionValue: string, checked: boolean) => {
    let newValue: string[];

    if (checked) {
      // Add the value
      if (maxSelect && value.length >= maxSelect) {
        // Don't add if max limit reached
        return;
      }
      newValue = [...value, optionValue];
    } else {
      // Remove the value
      newValue = value.filter((v) => v !== optionValue);
    }

    onValueChange?.(newValue);
  };

  const isChecked = (optionValue: string) => value.includes(optionValue);

  const isDisabled = (optionValue: string) => {
    if (disabled) return true;

    // If max is reached and this option is not checked, disable it
    if (maxSelect && value.length >= maxSelect && !isChecked(optionValue)) {
      return true;
    }

    return false;
  };

  return (
    <div className={cn('space-y-3', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <Label>
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
          {(minSelect || maxSelect) && (
            <span className="text-xs text-muted-foreground">
              {minSelect && maxSelect
                ? `Selecciona ${minSelect}-${maxSelect} opciones`
                : minSelect
                  ? `Mínimo ${minSelect} ${minSelect === 1 ? 'opción' : 'opciones'}`
                  : maxSelect
                    ? `Máximo ${maxSelect} ${maxSelect === 1 ? 'opción' : 'opciones'}`
                    : null}
            </span>
          )}
        </div>
      )}

      <div className="space-y-3">
        {options.map((option) => (
          <div
            key={option.value}
            className="flex items-start space-x-3 space-y-0"
          >
            <Checkbox
              id={`checkbox-${option.value}`}
              checked={isChecked(option.value)}
              onCheckedChange={(checked) =>
                handleCheckboxChange(option.value, checked === true)
              }
              disabled={isDisabled(option.value)}
              className="mt-0.5"
            />
            <div className="flex-1">
              <Label
                htmlFor={`checkbox-${option.value}`}
                className="font-normal cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {option.label}
              </Label>
              {option.description && (
                <p className="text-sm text-muted-foreground mt-1.5">
                  {option.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {value.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {value.length} {value.length === 1 ? 'opción seleccionada' : 'opciones seleccionadas'}
        </p>
      )}
    </div>
  );
}
