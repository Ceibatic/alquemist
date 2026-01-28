'use client';

import { useState, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Check,
  ChevronsUpDown,
  Search,
  Plus,
  Package,
  Sprout,
  FlaskConical,
  Shield,
  Cog,
  Layers,
  Container,
  Wrench,
  FileText,
  Plant,
  Seedling,
  Tree,
  Leaf,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFacility } from '@/components/providers/facility-provider';

interface ProductComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  onProductSelect?: (product: {
    _id: string;
    name: string;
    sku: string;
    category: string;
    default_price?: number;
    price_currency?: string;
  }) => void;
  onCreateNew?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  seed: Sprout,
  nutrient: FlaskConical,
  pesticide: Shield,
  equipment: Cog,
  substrate: Layers,
  container: Container,
  tool: Wrench,
  clone: Plant,
  seedling: Seedling,
  mother_plant: Tree,
  plant_material: Leaf,
  other: FileText,
};

const categoryLabels: Record<string, string> = {
  seed: 'Semillas',
  nutrient: 'Nutrientes',
  pesticide: 'Pesticidas',
  equipment: 'Equipos',
  substrate: 'Sustratos',
  container: 'Contenedores',
  tool: 'Herramientas',
  clone: 'Esquejes',
  seedling: 'Plántulas',
  mother_plant: 'Plantas Madre',
  plant_material: 'Material Vegetal',
  other: 'Otros',
};

export function ProductCombobox({
  value,
  onValueChange,
  onProductSelect,
  onCreateNew,
  placeholder = 'Seleccionar producto...',
  disabled = false,
}: ProductComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { currentCompanyId } = useFacility();

  // Fetch products with search
  const productsResult = useQuery(
    api.products.list,
    currentCompanyId
      ? { companyId: currentCompanyId, status: 'active', limit: 100 }
      : 'skip'
  );

  const products = productsResult?.products || [];

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    const query = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  // Get selected product info
  const selectedProduct = useMemo(() => {
    if (!value) return null;
    return products.find((p) => p._id === value) || null;
  }, [products, value]);

  const handleSelect = (product: (typeof products)[0]) => {
    onValueChange(product._id);
    onProductSelect?.({
      _id: product._id,
      name: product.name,
      sku: product.sku,
      category: product.category,
      default_price: product.default_price,
      price_currency: product.price_currency,
    });
    setOpen(false);
    setSearchQuery('');
  };

  const handleCreateNew = () => {
    setOpen(false);
    setSearchQuery('');
    onCreateNew?.();
  };

  const formatPrice = (price?: number, currency?: string) => {
    if (price === undefined) return null;
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency || 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between font-normal',
            !value && 'text-muted-foreground'
          )}
          disabled={disabled}
        >
          {selectedProduct ? (
            <div className="flex items-center gap-2 truncate">
              {(() => {
                const Icon = categoryIcons[selectedProduct.category] || Package;
                return <Icon className="h-4 w-4 shrink-0 text-gray-500" />;
              })()}
              <span className="truncate">{selectedProduct.name}</span>
              <Badge variant="secondary" className="ml-1 text-xs">
                {selectedProduct.sku}
              </Badge>
            </div>
          ) : (
            <span>{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        {/* Search Input */}
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder="Buscar por nombre o SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>

        {/* Product List */}
        <ScrollArea className="h-[300px]">
          {/* Create New Option */}
          {onCreateNew && (
            <div
              className="flex cursor-pointer items-center gap-2 border-b px-3 py-2 hover:bg-green-50"
              onClick={handleCreateNew}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                <Plus className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-green-700">Crear nuevo producto</p>
                <p className="text-xs text-gray-500">
                  Agregar un producto al catálogo
                </p>
              </div>
            </div>
          )}

          {/* Products */}
          {filteredProducts.length === 0 ? (
            <div className="py-6 text-center text-sm text-gray-500">
              {searchQuery
                ? 'No se encontraron productos'
                : 'No hay productos disponibles'}
            </div>
          ) : (
            filteredProducts.map((product) => {
              const Icon = categoryIcons[product.category] || Package;
              const isSelected = value === product._id;

              return (
                <div
                  key={product._id}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-gray-50',
                    isSelected && 'bg-blue-50'
                  )}
                  onClick={() => handleSelect(product)}
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                      isSelected ? 'bg-blue-100' : 'bg-gray-100'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-4 w-4',
                        isSelected ? 'text-blue-600' : 'text-gray-500'
                      )}
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'font-medium truncate',
                          isSelected && 'text-blue-700'
                        )}
                      >
                        {product.name}
                      </span>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {product.sku}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{categoryLabels[product.category] || product.category}</span>
                      {product.default_price !== undefined && (
                        <>
                          <span>•</span>
                          <span className="font-medium text-green-600">
                            {formatPrice(product.default_price, product.price_currency)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Check Icon */}
                  {isSelected && (
                    <Check className="h-4 w-4 shrink-0 text-blue-600" />
                  )}
                </div>
              );
            })
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
