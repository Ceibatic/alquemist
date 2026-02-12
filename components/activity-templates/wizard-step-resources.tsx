'use client';

import { useState, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useFacility } from '@/components/providers/facility-provider';
import {
  Search,
  Plus,
  Trash2,
  Package,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';

const QUANTITY_BASIS_OPTIONS = [
  { value: 'fixed', label: 'Fijo' },
  { value: 'per_plant', label: 'Por planta' },
  { value: 'per_m2', label: 'Por m²' },
  { value: 'per_zone', label: 'Por zona' },
  { value: 'per_L_solution', label: 'Por L solucion' },
];

const DIRECTION_OPTIONS = [
  { value: 'consumed', label: 'Consumido' },
  { value: 'applied', label: 'Aplicado' },
  { value: 'produced', label: 'Producido' },
];

export interface WizardResource {
  /** DB id if this resource already exists (edit mode) */
  existingId?: string;
  productId: string;
  productName: string;
  productSku?: string;
  quantity: number;
  quantityBasis: string;
  direction: string;
  applicationRate: string;
  applicationMethod: string;
  isRequired: boolean;
  notes: string;
}

interface WizardStepResourcesProps {
  resources: WizardResource[];
  onChange: (resources: WizardResource[]) => void;
}

export function WizardStepResources({ resources, onChange }: WizardStepResourcesProps) {
  const { currentCompanyId } = useFacility();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Search products
  const productResults = useQuery(
    api.products.list,
    currentCompanyId && searchQuery.trim().length >= 2
      ? { companyId: currentCompanyId, status: 'active', search: searchQuery.trim(), limit: 10 }
      : 'skip' as any
  );

  const productList = productResults
    ? ('products' in productResults ? productResults.products : productResults)
    : [];

  // IDs already in cart
  const cartProductIds = useMemo(
    () => new Set(resources.map((r) => r.productId)),
    [resources]
  );

  // Filter search results to exclude already-added products
  const filteredProducts = useMemo(
    () => (productList as Array<{ _id: string; name: string; sku: string; default_unit?: string }>)
      .filter((p) => !cartProductIds.has(p._id)),
    [productList, cartProductIds]
  );

  const handleAddProduct = (product: { _id: string; name: string; sku: string }) => {
    const newResource: WizardResource = {
      productId: product._id,
      productName: product.name,
      productSku: product.sku,
      quantity: 1,
      quantityBasis: 'fixed',
      direction: 'consumed',
      applicationRate: '',
      applicationMethod: '',
      isRequired: true,
      notes: '',
    };
    onChange([...resources, newResource]);
    setSearchQuery('');
  };

  const handleRemoveResource = (index: number) => {
    onChange(resources.filter((_, i) => i !== index));
    if (expandedIndex === index) setExpandedIndex(null);
  };

  const updateResource = (index: number, partial: Partial<WizardResource>) => {
    onChange(resources.map((r, i) => (i === index ? { ...r, ...partial } : r)));
  };

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="space-y-2">
        <Label>Buscar producto</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre o codigo..."
            className="pl-9 pr-8"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        {/* Search results */}
        {searchQuery.trim().length >= 2 && (
          <div className="border rounded-lg max-h-48 overflow-y-auto">
            {productResults === undefined ? (
              <div className="p-3 text-sm text-muted-foreground text-center">Buscando...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-3 text-sm text-muted-foreground text-center">
                {(productList as Array<unknown>).length > 0
                  ? 'Todos los resultados ya estan agregados'
                  : 'No se encontraron productos'}
              </div>
            ) : (
              filteredProducts.map((product) => (
                <button
                  key={product._id}
                  type="button"
                  onClick={() => handleAddProduct(product)}
                  className="flex items-center justify-between w-full px-3 py-2 text-left hover:bg-muted/50 border-b last:border-b-0"
                >
                  <div>
                    <span className="text-sm font-medium">{product.name}</span>
                    <span className="text-xs text-muted-foreground ml-2 font-mono">
                      {product.sku}
                    </span>
                  </div>
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Cart — selected resources */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">
            Recursos seleccionados ({resources.length})
          </Label>
        </div>

        {resources.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed rounded-lg">
            <Package className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              No hay recursos agregados
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Busca un producto arriba para agregar
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {resources.map((resource, index) => {
              const basisLabel = QUANTITY_BASIS_OPTIONS.find(
                (o) => o.value === resource.quantityBasis
              )?.label ?? resource.quantityBasis;
              const isExpanded = expandedIndex === index;

              return (
                <Collapsible
                  key={`${resource.productId}-${index}`}
                  open={isExpanded}
                  onOpenChange={(open) => setExpandedIndex(open ? index : null)}
                >
                  <div className="border rounded-lg">
                    {/* Main row */}
                    <div className="flex items-center gap-2 p-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">
                            {resource.productName}
                          </span>
                          {resource.productSku && (
                            <span className="text-xs text-muted-foreground font-mono">
                              {resource.productSku}
                            </span>
                          )}
                          {!resource.isRequired && (
                            <Badge variant="outline" className="text-xs">Opcional</Badge>
                          )}
                        </div>
                      </div>

                      {/* Inline quantity */}
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        value={resource.quantity}
                        onChange={(e) =>
                          updateResource(index, { quantity: Number(e.target.value) || 0 })
                        }
                        className="w-20 h-8 text-sm"
                      />

                      {/* Basis selector */}
                      <Select
                        value={resource.quantityBasis}
                        onValueChange={(v) => updateResource(index, { quantityBasis: v })}
                      >
                        <SelectTrigger className="w-[120px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {QUANTITY_BASIS_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Direction selector */}
                      <Select
                        value={resource.direction}
                        onValueChange={(v) => updateResource(index, { direction: v })}
                      >
                        <SelectTrigger className="w-[110px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DIRECTION_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Expand/collapse */}
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>

                      {/* Remove */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-red-500"
                        onClick={() => handleRemoveResource(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Expanded details */}
                    <CollapsibleContent>
                      <div className="px-3 pb-3 pt-1 border-t space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Metodo de aplicacion</Label>
                            <Input
                              value={resource.applicationMethod}
                              onChange={(e) =>
                                updateResource(index, { applicationMethod: e.target.value })
                              }
                              placeholder="Ej: foliar, drench"
                              className="h-8 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Tasa de aplicacion</Label>
                            <Input
                              value={resource.applicationRate}
                              onChange={(e) =>
                                updateResource(index, { applicationRate: e.target.value })
                              }
                              placeholder="Ej: 2mL/L, 5g/m²"
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Notas</Label>
                          <Input
                            value={resource.notes}
                            onChange={(e) =>
                              updateResource(index, { notes: e.target.value })
                            }
                            placeholder="Ej: Disolver en agua tibia primero"
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={resource.isRequired}
                            onCheckedChange={(checked) =>
                              updateResource(index, { isRequired: checked })
                            }
                          />
                          <Label className="text-xs cursor-pointer">Recurso requerido</Label>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
