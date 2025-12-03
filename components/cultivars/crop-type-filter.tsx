'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface CropType {
  _id: string;
  name: string;
  display_name_es: string;
}

interface CropTypeFilterProps {
  cropTypes: CropType[];
  value?: string;
  onChange: (value: string) => void;
}

// Icon mapping for crop types
const cropIcons: Record<string, string> = {
  Cannabis: '🌿',
  Coffee: '☕',
  Cocoa: '🍫',
  Flowers: '🌸',
};

export function CropTypeFilter({
  cropTypes,
  value,
  onChange,
}: CropTypeFilterProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="crop-type-filter" className="text-sm font-medium">
        Tipo de Cultivo
      </Label>
      <Select value={value || 'all'} onValueChange={onChange}>
        <SelectTrigger id="crop-type-filter" className="w-[200px]">
          <SelectValue placeholder="Todos los cultivos" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <span className="flex items-center gap-2">
              <span>📋</span>
              <span>Todos</span>
            </span>
          </SelectItem>
          {cropTypes.map((cropType) => (
            <SelectItem key={cropType._id} value={cropType._id}>
              <span className="flex items-center gap-2">
                <span>{cropIcons[cropType.name] || '🌱'}</span>
                <span>{cropType.display_name_es}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
