'use client';

import { cn } from '@/lib/utils';
import { AreaType } from '@/lib/types/phase2';
import { Sprout, Leaf, Flower2, Sun, Package, Warehouse, Cog, ShieldAlert, LayoutGrid } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface AreaTypeTabsProps {
  selectedType: string | null;
  onTypeChange: (type: string | null) => void;
}

const areaTypes: { value: AreaType | 'all'; label: string; icon: React.ReactNode }[] = [
  { value: 'all', label: 'Todas', icon: <LayoutGrid className="h-4 w-4" /> },
  { value: 'propagation', label: 'Propagacion', icon: <Sprout className="h-4 w-4" /> },
  { value: 'vegetative', label: 'Vegetativo', icon: <Leaf className="h-4 w-4" /> },
  { value: 'flowering', label: 'Floracion', icon: <Flower2 className="h-4 w-4" /> },
  { value: 'drying', label: 'Secado', icon: <Sun className="h-4 w-4" /> },
  { value: 'curing', label: 'Curado', icon: <Package className="h-4 w-4" /> },
  { value: 'storage', label: 'Almacenamiento', icon: <Warehouse className="h-4 w-4" /> },
  { value: 'processing', label: 'Procesamiento', icon: <Cog className="h-4 w-4" /> },
  { value: 'quarantine', label: 'Cuarentena', icon: <ShieldAlert className="h-4 w-4" /> },
];

export function AreaTypeTabs({ selectedType, onTypeChange }: AreaTypeTabsProps) {
  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-2 pb-2">
        {areaTypes.map((type) => {
          const isSelected =
            (type.value === 'all' && selectedType === null) ||
            type.value === selectedType;

          return (
            <button
              key={type.value}
              onClick={() => onTypeChange(type.value === 'all' ? null : type.value)}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap',
                isSelected
                  ? 'border-2 border-green-700 bg-green-50 text-green-800'
                  : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300'
              )}
            >
              {type.icon}
              {type.label}
            </button>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" className="h-2" />
    </ScrollArea>
  );
}
