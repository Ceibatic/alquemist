'use client';

import { Check, X } from 'lucide-react';
import { checkPasswordRequirements } from '@/lib/validations';

interface PasswordRequirementsProps {
  password: string;
}

export function PasswordRequirements({ password }: PasswordRequirementsProps) {
  const requirements = checkPasswordRequirements(password);

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Requisitos de contraseña:</p>
      <ul className="space-y-1">
        {requirements.map((req, index) => (
          <li
            key={index}
            className={`flex items-center gap-2 text-sm ${
              req.met ? 'text-green-600' : 'text-muted-foreground'
            }`}
          >
            {req.met ? (
              <Check className="h-4 w-4" />
            ) : (
              <X className="h-4 w-4" />
            )}
            <span>{req.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
