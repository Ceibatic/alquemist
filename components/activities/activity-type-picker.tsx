'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ActivityTypePickerProps {
  companyId: Id<'companies'>;
  value: string;
  onChange: (typeId: string) => void;
  disabled?: boolean;
}

export function ActivityTypePicker({
  companyId,
  value,
  onChange,
  disabled = false,
}: ActivityTypePickerProps) {
  const activityTypes = useQuery(api.activityTypes.list, { companyId });

  const activeTypes = activityTypes?.filter((t) => t.status === 'active') ?? [];

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder="Seleccionar tipo de actividad" />
      </SelectTrigger>
      <SelectContent>
        {activeTypes.map((type) => (
          <SelectItem key={type._id} value={type._id as string}>
            {type.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
