'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import {
  Search,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Package,
} from 'lucide-react';
import type { WizardFormData, ResourceItem, ProductListItem } from './activity-template-wizard';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

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

const CATEGORY_LABELS: Record<string, string> = {
  seed: 'Semillas',
  nutrient: 'Nutrientes',
  pesticide: 'Pesticidas',
  equipment: 'Equipos',
  substrate: 'Sustratos',
  container: 'Contenedores',
  tool: 'Herramientas',
  clone: 'Esquejes',
  seedling: 'Plantulas',
  mother_plant: 'Plantas Madre',
  plant_material: 'Material Vegetal',
  other: 'Otros',
};

function formatPrice(price: number, currency?: string) {
  const curr = currency ?? 'COP';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: curr,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface WizardStepResourcesProps {
  formData: WizardFormData;
  updateField: <K extends keyof WizardFormData>(field: K, value: WizardFormData[K]) => void;
  productList: ProductListItem[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function WizardStepResources({
  formData,
  updateField,
  productList,
}: WizardStepResourcesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const resources = formData.resources;

  // IDs already in cart
  const cartProductIds = new Set(resources.map((r) => r.productId));

  // Available categories from actual products
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    for (const p of productList) {
      if (p.category) cats.add(p.category);
    }
    return Array.from(cats).sort();
  }, [productList]);

  // Filtered products: by category first, then by search text
  const filteredProducts = useMemo(() => {
    let filtered = productList.filter((p) => !cartProductIds.has(p._id));

    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.code && p.code.toLowerCase().includes(q))
      );
    }

    return filtered.slice(0, 20);
  }, [searchQuery, selectedCategory, productList, cartProductIds]);

  const showProductList = searchQuery.trim() || selectedCategory;

  const addProduct = (product: ProductListItem) => {
    const newResource: ResourceItem = {
      productId: product._id,
      productName: product.name,
      productCode: product.code,
      productCategory: product.category,
      productUnit: product.defaultUnit,
      productPrice: product.defaultPrice,
      productCurrency: product.priceCurrency,
      productSupplier: product.supplierName,
      quantity: 1,
      quantityBasis: 'fixed',
      direction: 'consumed',
      applicationRate: '',
      applicationMethod: '',
      isRequired: true,
      notes: '',
    };
    updateField('resources', [...resources, newResource]);
    setSearchQuery('');
  };

  const removeResource = (idx: number) => {
    const updated = resources.filter((_, i) => i !== idx);
    updateField('resources', updated);
    if (expandedIdx === idx) setExpandedIdx(null);
    else if (expandedIdx !== null && expandedIdx > idx) setExpandedIdx(expandedIdx - 1);
  };

  const updateResource = (idx: number, field: keyof ResourceItem, value: any) => {
    const updated = resources.map((r, i) =>
      i === idx ? { ...r, [field]: value } : r
    );
    updateField('resources', updated);
  };

  const basisLabel = (val: string) =>
    QUANTITY_BASIS_OPTIONS.find((o) => o.value === val)?.label ?? val;

  return (
    <div className="space-y-6">
      {/* Search & add */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Buscar productos</CardTitle>
          <CardDescription>
            Filtra por categoria o busca por nombre/codigo para agregar productos al template.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            {/* Category filter */}
            <Select
              value={selectedCategory ?? 'all'}
              onValueChange={(v) => setSelectedCategory(v === 'all' ? null : v)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorias</SelectItem>
                {availableCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {CATEGORY_LABELS[cat] || cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Search input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o codigo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Product results */}
          {showProductList && filteredProducts.length > 0 && (
            <div className="border rounded-lg divide-y max-h-[300px] overflow-auto">
              {filteredProducts.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between px-3 py-2 hover:bg-gray-50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      {product.category && (
                        <Badge variant="outline" className="text-xs shrink-0">
                          {CATEGORY_LABELS[product.category] || product.category}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      {product.code && (
                        <span className="font-mono">{product.code}</span>
                      )}
                      {product.defaultUnit && (
                        <>
                          <span>·</span>
                          <span>{product.defaultUnit}</span>
                        </>
                      )}
                      {product.defaultPrice != null && (
                        <>
                          <span>·</span>
                          <span className="text-green-600 font-medium">
                            {formatPrice(product.defaultPrice, product.priceCurrency)}
                          </span>
                        </>
                      )}
                      {product.supplierName && (
                        <>
                          <span>·</span>
                          <span>{product.supplierName}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addProduct(product)}
                    className="shrink-0 ml-2"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Agregar
                  </Button>
                </div>
              ))}
            </div>
          )}

          {showProductList && filteredProducts.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-2">
              No se encontraron productos
            </p>
          )}
        </CardContent>
      </Card>

      {/* Cart: selected resources */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="h-4 w-4" />
            Recursos seleccionados ({resources.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {resources.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed rounded-lg">
              <Package className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                Usa el buscador de arriba para agregar productos
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {resources.map((res, idx) => {
                const isExpanded = expandedIdx === idx;
                return (
                  <Collapsible
                    key={`${res.productId}-${idx}`}
                    open={isExpanded}
                    onOpenChange={(open) => setExpandedIdx(open ? idx : null)}
                  >
                    <div className="border rounded-lg">
                      {/* Inline row */}
                      <div className="flex items-center gap-2 p-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">
                              {res.productName}
                            </span>
                            {!res.isRequired && (
                              <Badge variant="outline" className="text-xs">Opcional</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            {res.productCode && (
                              <span className="font-mono">{res.productCode}</span>
                            )}
                            {res.productUnit && (
                              <>
                                <span>·</span>
                                <span>{res.productUnit}</span>
                              </>
                            )}
                            {res.productPrice != null && (
                              <>
                                <span>·</span>
                                <span className="text-green-600 font-medium">
                                  {formatPrice(res.productPrice, res.productCurrency)}
                                </span>
                              </>
                            )}
                            {res.productSupplier && (
                              <>
                                <span>·</span>
                                <span>{res.productSupplier}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Quantity */}
                        <Input
                          type="number"
                          step="0.01"
                          min={0}
                          value={res.quantity}
                          onChange={(e) =>
                            updateResource(idx, 'quantity', Number(e.target.value) || 0)
                          }
                          className="w-20 h-8 text-sm"
                        />

                        {/* Basis */}
                        <Select
                          value={res.quantityBasis}
                          onValueChange={(v) => updateResource(idx, 'quantityBasis', v)}
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

                        {/* Direction */}
                        <Select
                          value={res.direction}
                          onValueChange={(v) => updateResource(idx, 'direction', v)}
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

                        {/* Expand toggle */}
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>

                        {/* Delete */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-red-500 shrink-0"
                          onClick={() => removeResource(idx)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Subtotal hint */}
                      <div className="px-3 pb-2">
                        <span className="text-xs text-muted-foreground">
                          {res.quantity} {basisLabel(res.quantityBasis)}
                          {res.applicationRate && ` · ${res.applicationRate}`}
                        </span>
                      </div>

                      {/* Expanded section */}
                      <CollapsibleContent>
                        <div className="border-t px-3 py-3 space-y-3 bg-gray-50/50">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Metodo aplicacion</Label>
                              <Input
                                value={res.applicationMethod}
                                onChange={(e) =>
                                  updateResource(idx, 'applicationMethod', e.target.value)
                                }
                                placeholder="Ej: foliar, drench"
                                className="h-8 text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Tasa aplicacion</Label>
                              <Input
                                value={res.applicationRate}
                                onChange={(e) =>
                                  updateResource(idx, 'applicationRate', e.target.value)
                                }
                                placeholder="Ej: 2mL/L, 5g/m²"
                                className="h-8 text-sm"
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Notas</Label>
                            <Input
                              value={res.notes}
                              onChange={(e) =>
                                updateResource(idx, 'notes', e.target.value)
                              }
                              placeholder="Ej: Disolver en agua tibia primero"
                              className="h-8 text-sm"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={res.isRequired}
                              onCheckedChange={(v) =>
                                updateResource(idx, 'isRequired', v)
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
        </CardContent>
      </Card>
    </div>
  );
}
