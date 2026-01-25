'use client';

import { useMemo, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Search,
  Package,
  Calendar,
  AlertTriangle,
  Check,
  ChevronsUpDown,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

interface LotSelectorProps {
  productId: string;
  facilityId: string;
  value: string | null; // null = FIFO mode
  onValueChange: (value: string | null) => void;
  requiredQuantity?: number;
  disabled?: boolean;
}

interface InventoryLot {
  _id: string;
  batch_number?: string;
  quantity_available: number;
  quantity_unit: string;
  received_date?: number;
  expiration_date?: number;
  areaName?: string;
}

export function LotSelector({
  productId,
  facilityId,
  value,
  onValueChange,
  requiredQuantity,
  disabled = false,
}: LotSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Get inventory items for this product in this facility
  const inventoryItems = useQuery(api.inventory.getByFacility, {
    facilityId: facilityId as any,
    productId: productId as any,
  });

  const availableLots = useMemo(() => {
    if (!inventoryItems) return [];
    return inventoryItems
      .filter(
        (item: { lot_status?: string; quantity_available: number }) =>
          item.lot_status === 'available' &&
          item.quantity_available > 0
      )
      .sort((a: { received_date?: number }, b: { received_date?: number }) =>
        (a.received_date || 0) - (b.received_date || 0)
      ); // FIFO order
  }, [inventoryItems]);

  // Filter lots based on search
  const filteredLots = useMemo(() => {
    if (!searchQuery) return availableLots;
    const query = searchQuery.toLowerCase();
    return availableLots.filter(
      (lot) =>
        lot.batch_number?.toLowerCase().includes(query) ||
        lot.areaName?.toLowerCase().includes(query)
    );
  }, [availableLots, searchQuery]);

  // Get selected lot details
  const selectedLot = useMemo(() => {
    if (!value) return null;
    return availableLots.find((lot) => lot._id === value) || null;
  }, [availableLots, value]);

  // Calculate days until expiration
  const getDaysUntilExpiration = (expirationDate?: number) => {
    if (!expirationDate) return null;
    return differenceInDays(new Date(expirationDate), new Date());
  };

  // Check if quantity is sufficient
  const isQuantitySufficient = (lot: InventoryLot) => {
    if (!requiredQuantity) return true;
    return lot.quantity_available >= requiredQuantity;
  };

  // Calculate total available across all lots (for FIFO)
  const totalAvailable = useMemo(() => {
    return availableLots.reduce((sum, lot) => sum + lot.quantity_available, 0);
  }, [availableLots]);

  const fifoSufficientForRequired = requiredQuantity
    ? totalAvailable >= requiredQuantity
    : true;

  return (
    <div className="space-y-2">
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
            disabled={disabled || availableLots.length === 0}
          >
            {value === null ? (
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-500" />
                <span>FIFO Automático</span>
                <Badge variant="secondary" className="ml-1">
                  {availableLots.length} lotes
                </Badge>
              </div>
            ) : selectedLot ? (
              <div className="flex items-center gap-2 truncate">
                <Package className="h-4 w-4 text-gray-500" />
                <span className="truncate">
                  {selectedLot.batch_number || 'Sin lote'}
                </span>
                <Badge variant="outline" className="ml-1">
                  {selectedLot.quantity_available} {selectedLot.quantity_unit}
                </Badge>
              </div>
            ) : (
              <span>Seleccionar lote...</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          {/* Search Input */}
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder="Buscar por número de lote..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          <ScrollArea className="h-[300px]">
            <RadioGroup
              value={value || 'fifo'}
              onValueChange={(v) => {
                onValueChange(v === 'fifo' ? null : v);
                setOpen(false);
              }}
              className="p-2"
            >
              {/* FIFO Option */}
              <div
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-blue-50',
                  value === null && 'border-blue-500 bg-blue-50'
                )}
                onClick={() => {
                  onValueChange(null);
                  setOpen(false);
                }}
              >
                <RadioGroupItem value="fifo" id="fifo" className="sr-only" />
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                    value === null ? 'bg-blue-100' : 'bg-gray-100'
                  )}
                >
                  <Zap
                    className={cn(
                      'h-4 w-4',
                      value === null ? 'text-blue-600' : 'text-gray-500'
                    )}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'font-medium',
                        value === null && 'text-blue-700'
                      )}
                    >
                      FIFO Automático
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      Recomendado
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>
                      Consume del lote más antiguo primero
                    </span>
                    <span>•</span>
                    <span className="font-medium text-green-600">
                      Total: {totalAvailable} disponible
                    </span>
                  </div>
                  {requiredQuantity && !fifoSufficientForRequired && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-amber-600">
                      <AlertTriangle className="h-3 w-3" />
                      Stock insuficiente para la cantidad requerida
                    </div>
                  )}
                </div>
                {value === null && (
                  <Check className="h-4 w-4 shrink-0 text-blue-600" />
                )}
              </div>

              {/* Separator */}
              <div className="my-2 border-t" />
              <Label className="px-3 text-xs text-gray-500">
                Seleccionar lote específico:
              </Label>

              {/* Individual Lots */}
              {filteredLots.map((lot) => {
                const daysUntilExp = getDaysUntilExpiration(lot.expiration_date);
                const isExpiringSoon = daysUntilExp !== null && daysUntilExp <= 30;
                const isExpired = daysUntilExp !== null && daysUntilExp < 0;
                const isSufficient = isQuantitySufficient(lot);
                const isSelected = value === lot._id;

                return (
                  <div
                    key={lot._id}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-gray-50',
                      isSelected && 'border-green-500 bg-green-50',
                      !isSufficient && 'opacity-60'
                    )}
                    onClick={() => {
                      onValueChange(lot._id);
                      setOpen(false);
                    }}
                  >
                    <RadioGroupItem
                      value={lot._id}
                      id={lot._id}
                      className="sr-only"
                    />
                    <div
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                        isSelected ? 'bg-green-100' : 'bg-gray-100'
                      )}
                    >
                      <Package
                        className={cn(
                          'h-4 w-4',
                          isSelected ? 'text-green-600' : 'text-gray-500'
                        )}
                      />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'truncate font-medium',
                            isSelected && 'text-green-700'
                          )}
                        >
                          {lot.batch_number || 'Sin número de lote'}
                        </span>
                        <Badge
                          variant={isSufficient ? 'outline' : 'destructive'}
                          className="shrink-0 text-xs"
                        >
                          {lot.quantity_available} {lot.quantity_unit}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        {lot.received_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Recibido:{' '}
                            {format(new Date(lot.received_date), 'd MMM yyyy', {
                              locale: es,
                            })}
                          </span>
                        )}
                        {lot.expiration_date && (
                          <span
                            className={cn(
                              'flex items-center gap-1',
                              isExpired && 'text-red-600',
                              isExpiringSoon && !isExpired && 'text-amber-600'
                            )}
                          >
                            {(isExpired || isExpiringSoon) && (
                              <AlertTriangle className="h-3 w-3" />
                            )}
                            {isExpired ? 'Vencido' : `Vence: ${format(
                              new Date(lot.expiration_date),
                              'd MMM yyyy',
                              { locale: es }
                            )}`}
                          </span>
                        )}
                        {lot.areaName && <span>• {lot.areaName}</span>}
                      </div>
                      {requiredQuantity && !isSufficient && (
                        <div className="mt-1 flex items-center gap-1 text-xs text-red-600">
                          <AlertTriangle className="h-3 w-3" />
                          Cantidad insuficiente
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 shrink-0 text-green-600" />
                    )}
                  </div>
                );
              })}

              {filteredLots.length === 0 && (
                <div className="py-6 text-center text-sm text-gray-500">
                  {searchQuery
                    ? 'No se encontraron lotes'
                    : 'No hay lotes disponibles'}
                </div>
              )}
            </RadioGroup>
          </ScrollArea>
        </PopoverContent>
      </Popover>

      {availableLots.length === 0 && (
        <p className="text-xs text-amber-600">
          No hay inventario disponible de este producto
        </p>
      )}
    </div>
  );
}
