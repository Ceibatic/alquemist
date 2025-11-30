'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface PhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, value, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Remove non-digit characters
      const digits = e.target.value.replace(/\D/g, '');

      // Limit to 10 digits (Colombian format)
      const limited = digits.slice(0, 10);

      if (onChange) {
        onChange(limited);
      }
    };

    return (
      <div className="relative">
        <Input
          type="tel"
          inputMode="numeric"
          value={value}
          onChange={handleChange}
          placeholder="3001234567"
          className={cn(className)}
          ref={ref}
          {...props}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Formato: 10 dígitos (ej: 3001234567)
        </p>
      </div>
    );
  }
);

PhoneInput.displayName = 'PhoneInput';

export { PhoneInput };
