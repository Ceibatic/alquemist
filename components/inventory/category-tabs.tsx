'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type InventoryCategoryFilter =
  | 'all'
  | 'seed' | 'nutrient' | 'pesticide' | 'substrate' | 'biocontrol'
  | 'clone' | 'seedling' | 'mother_plant' | 'plant_material' | 'plant_vegetative' | 'plant_flowering' | 'harvest_wet' | 'harvest_dry' | 'processed_plant'
  | 'stock_solution' | 'substrate_mix'
  | 'equipment' | 'container' | 'tool' | 'other';

interface CategoryTabsProps {
  activeCategory: InventoryCategoryFilter;
  onCategoryChange: (category: InventoryCategoryFilter) => void;
  categoryCounts?: Record<string, number>;
  lowStockCounts?: Record<string, number>;
  className?: string;
}

const CATEGORY_CONFIG = [
  { value: 'all' as const, label: 'Todos', icon: '📦' },
  // Insumos
  { value: 'seed' as const, label: 'Semillas', icon: '🌱' },
  { value: 'nutrient' as const, label: 'Nutrientes', icon: '🧪' },
  { value: 'pesticide' as const, label: 'Pesticidas', icon: '🛡️' },
  { value: 'substrate' as const, label: 'Sustratos', icon: '🌾' },
  { value: 'biocontrol' as const, label: 'Biocontrol', icon: '🐛' },
  // Material vegetal
  { value: 'clone' as const, label: 'Esquejes', icon: '🪴' },
  { value: 'seedling' as const, label: 'Plántulas', icon: '🌿' },
  { value: 'mother_plant' as const, label: 'Plantas Madre', icon: '🌳' },
  { value: 'plant_material' as const, label: 'Material Vegetal', icon: '🍃' },
  { value: 'plant_vegetative' as const, label: 'Vegetativa', icon: '🌱' },
  { value: 'plant_flowering' as const, label: 'Floración', icon: '🌸' },
  { value: 'harvest_wet' as const, label: 'Cosecha Húmeda', icon: '🌿' },
  { value: 'harvest_dry' as const, label: 'Cosecha Seca', icon: '🍂' },
  { value: 'processed_plant' as const, label: 'Procesado', icon: '📦' },
  // Preparados
  { value: 'stock_solution' as const, label: 'Solución Madre', icon: '🧫' },
  { value: 'substrate_mix' as const, label: 'Mezcla Sustrato', icon: '🌾' },
  // Infraestructura
  { value: 'equipment' as const, label: 'Equipos', icon: '⚙️' },
  { value: 'container' as const, label: 'Contenedores', icon: '🪣' },
  { value: 'tool' as const, label: 'Herramientas', icon: '🔧' },
  { value: 'other' as const, label: 'Otros', icon: '📋' },
];

export function CategoryTabs({
  activeCategory,
  onCategoryChange,
  categoryCounts = {},
  lowStockCounts = {},
  className,
}: CategoryTabsProps) {
  return (
    <div className={cn('border-b border-gray-200 bg-white', className)}>
      <nav className="-mb-px flex space-x-2 overflow-x-auto px-4" aria-label="Categorías">
        {CATEGORY_CONFIG.map((category) => {
          const isActive = activeCategory === category.value;
          const count = categoryCounts[category.value] || 0;
          const lowStockCount = lowStockCounts[category.value] || 0;

          return (
            <button
              key={category.value}
              onClick={() => onCategoryChange(category.value)}
              className={cn(
                'group inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                isActive
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              )}
            >
              <span className="text-base">{category.icon}</span>
              <span>{category.label}</span>
              {count > 0 && (
                <Badge
                  className={cn(
                    'ml-1',
                    isActive
                      ? 'bg-green-100 text-green-700 border-green-200'
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  )}
                >
                  {count}
                </Badge>
              )}
              {lowStockCount > 0 && (
                <span
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500 text-xs font-bold text-white"
                  title={`${lowStockCount} items con stock bajo`}
                >
                  !
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export function getCategoryLabel(category: string): string {
  const config = CATEGORY_CONFIG.find((c) => c.value === category);
  return config ? config.label : category;
}

export function getCategoryIcon(category: string): string {
  const config = CATEGORY_CONFIG.find((c) => c.value === category);
  return config ? config.icon : '📦';
}
