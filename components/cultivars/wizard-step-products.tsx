'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getPhaseLabel, getPhaseColors } from '@/lib/constants/phases';
import { productCategoryLabels } from '@/lib/validations/product';
import { Package, Sprout } from 'lucide-react';
import type { PhaseProductConfig } from './cultivar-create-wizard';

/** Plant-material related categories for phase products */
const PHASE_PRODUCT_CATEGORIES = [
  'seed',
  'clone',
  'seedling',
  'mother_plant',
  'plant_material',
  'plant_vegetative',
  'plant_flowering',
  'harvest_wet',
  'harvest_dry',
  'processed_plant',
] as const;

interface WizardStepProductsProps {
  phaseProducts: PhaseProductConfig[];
  onUpdatePhaseProduct: (index: number, update: Partial<PhaseProductConfig>) => void;
  cultivarName: string;
  generateSku: (index: number) => string;
  isSaving: boolean;
}

export function WizardStepProducts({
  phaseProducts,
  onUpdatePhaseProduct,
  cultivarName,
  generateSku,
  isSaving,
}: WizardStepProductsProps) {
  if (phaseProducts.length === 0) {
    return (
      <Card className="border-dashed border-2 border-amber-200 bg-amber-50/50">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Sprout className="h-12 w-12 text-amber-500 mb-3" />
          <h4 className="text-base font-semibold text-gray-900 mb-1">
            Sin fases disponibles
          </h4>
          <p className="text-sm text-gray-600 text-center max-w-md">
            Selecciona un tipo de cultivo en el paso anterior para ver las fases
            disponibles y crear productos para cada una.
          </p>
        </CardContent>
      </Card>
    );
  }

  const enabledCount = phaseProducts.filter((p) => p.enabled).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="h-4 w-4 text-amber-600" />
            Productos por Fase
            {enabledCount > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {enabledCount} seleccionado{enabledCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground mb-4">
            Activa las fases para crear productos de catalogo. Podras editarlos
            despues desde el detalle del cultivar. Este paso es opcional.
          </p>

          <div className="space-y-3">
            {phaseProducts.map((pp, index) => {
              const colors = getPhaseColors(pp.phase);
              const sku = pp.enabled ? generateSku(index) : '';

              return (
                <div
                  key={pp.phase}
                  className={`rounded-lg border p-4 transition-colors ${
                    pp.enabled
                      ? 'border-amber-200 bg-amber-50/50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Switch
                      checked={pp.enabled}
                      onCheckedChange={(checked) => {
                        onUpdatePhaseProduct(index, {
                          enabled: checked,
                          ...(checked
                            ? {
                                name: `${cultivarName} - ${getPhaseLabel(pp.phase)}`.trim().replace(/^- /, ''),
                              }
                            : {}),
                        });
                      }}
                      disabled={isSaving}
                    />
                    <Badge
                      className={`${colors.bg} ${colors.text} ${colors.border} border text-xs`}
                    >
                      {getPhaseLabel(pp.phase)}
                    </Badge>
                    {pp.enabled && sku && (
                      <span className="text-xs font-mono text-gray-400 ml-auto">
                        {sku}
                      </span>
                    )}
                  </div>

                  {pp.enabled && (
                    <div className="flex gap-3 pl-10">
                      <Input
                        value={pp.name}
                        onChange={(e) =>
                          onUpdatePhaseProduct(index, { name: e.target.value })
                        }
                        placeholder="Nombre del producto"
                        className="text-sm"
                        disabled={isSaving}
                      />
                      <Select
                        value={pp.category}
                        onValueChange={(val) =>
                          onUpdatePhaseProduct(index, { category: val })
                        }
                        disabled={isSaving}
                      >
                        <SelectTrigger className="w-[200px] text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PHASE_PRODUCT_CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {productCategoryLabels[cat]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
