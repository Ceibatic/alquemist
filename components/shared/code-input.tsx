'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface CodeInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  className?: string;
}

export function CodeInput({
  length = 6,
  value,
  onChange,
  onComplete,
  className,
}: CodeInputProps) {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  const [values, setValues] = React.useState<string[]>(
    Array(length).fill('')
  );

  // Sync internal state with external value
  React.useEffect(() => {
    const chars = value.split('').slice(0, length);
    const newValues = Array(length).fill('');
    chars.forEach((char, i) => {
      newValues[i] = char;
    });
    setValues(newValues);
  }, [value, length]);

  const handleChange = (index: number, digit: string) => {
    // Only allow digits
    if (digit && !/^\d$/.test(digit)) return;

    const newValues = [...values];
    newValues[index] = digit;
    setValues(newValues);

    const newCode = newValues.join('');
    onChange(newCode);

    // Auto-advance to next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Call onComplete if all digits are filled
    if (newCode.length === length && onComplete) {
      onComplete(newCode);
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain');
    const digits = pastedData.replace(/\D/g, '').slice(0, length);

    const newValues = Array(length).fill('');
    digits.split('').forEach((digit, i) => {
      newValues[i] = digit;
    });
    setValues(newValues);

    const newCode = newValues.join('');
    onChange(newCode);

    // Focus last filled input or first empty
    const lastFilledIndex = digits.length - 1;
    if (lastFilledIndex >= 0 && lastFilledIndex < length) {
      inputRefs.current[lastFilledIndex]?.focus();
    }

    // Call onComplete if all digits are filled
    if (digits.length === length && onComplete) {
      onComplete(newCode);
    }
  };

  return (
    <div
      className={cn('flex gap-2 sm:gap-3 justify-center max-w-sm mx-auto', className)}
      onPaste={handlePaste}
    >
      {Array.from({ length }).map((_, index) => (
        <Input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={values[index]}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          className="w-9 h-11 sm:w-11 sm:h-12 text-center text-base sm:text-lg font-semibold flex-shrink-0"
          aria-label={`Dígito ${index + 1} de ${length}`}
        />
      ))}
    </div>
  );
}
