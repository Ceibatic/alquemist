'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Package,
  ArrowDownToLine,
  Info,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReportStepEntryMaterialProps {
  companyId: Id<'companies'>;
  cultivarId?: string;
  selectedItemId?: string;
  onItemSelect: (itemId: string, quantity: number) => void;
  initialQuantity?: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ReportStepEntryMaterial({
  companyId,
  cultivarId,
  selectedItemId,
  onItemSelect,
  initialQuantity = 0,
}: ReportStepEntryMaterialProps) {
  // ── Queries ─────────────────────────────────────────────────────────────
  // Fetch inventory items for the cultivar that are available
  // Categories: seed, clone, plant_material
  const inventory = useQuery(
    api.inventory.listAvailableByCultivar,
    cultivarId ? { companyId, cultivarId: cultivarId as Id<'cultivars'> } : 'skip'
  );

  const selectedItemData = inventory?.find(i => i._id === selectedItemId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ArrowDownToLine className="h-4 w-4 text-emerald-600" />
            Ingreso de Material Vegetal
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Selecciona el lote de inventario de origen para formalizar la entrada a produccion.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {!cultivarId ? (
            <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>
                No se ha definido un cultivar para este lote. No es posible filtrar el inventario.
              </span>
            </div>
          ) : inventory === undefined ? (
            <div className="h-20 rounded-md bg-muted animate-pulse" />
          ) : inventory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed rounded-lg bg-muted/20">
              <Package className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground text-center px-4">
                No hay material disponible en inventario para el cultivar seleccionado.
                <br />
                <span className="text-[11px] italic">Asegurate de haber registrado la compra o recepcion del material.</span>
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Lote de Inventario Origen *</Label>
                <Select value={selectedItemId} onValueChange={(val) => onItemSelect(val, initialQuantity)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Selecciona un lote de semillas/esquejes..." />
                  </SelectTrigger>
                  <SelectContent>
                    {inventory.map((item) => (
                      <SelectItem key={item._id} value={item._id}>
                        <div className="flex flex-col items-start py-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{item.batch_number || 'Sin lote'}</span>
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              {item.productName}
                            </Badge>
                          </div>
                          <div className="text-[11px] text-muted-foreground flex gap-2">
                            <span>Disponible: <strong>{item.quantity_available} {item.quantity_unit}</strong></span>
                            <span>Recibido: {item.received_date ? format(item.received_date, 'dd/MM/yy', { locale: es }) : 'N/A'}</span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedItemData && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <Label className="text-xs">Cantidad a Ingresar</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={1}
                        max={selectedItemData.quantity_available}
                        value={initialQuantity || ''}
                        onChange={(e) => onItemSelect(selectedItemId!, parseFloat(e.target.value) || 0)}
                        className="h-10 text-lg font-bold"
                      />
                      <span className="text-sm font-medium text-muted-foreground">{selectedItemData.quantity_unit}</span>
                    </div>
                    {initialQuantity > selectedItemData.quantity_available && (
                      <p className="text-[10px] text-destructive font-medium">Excede el stock disponible</p>
                    )}
                  </div>

                  <div className="rounded-md bg-muted/30 p-3 flex flex-col justify-center">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <Info className="h-3.5 w-3.5" />
                      <span>Resumen de Origen</span>
                    </div>
                    <p className="text-[11px] text-foreground">
                      Proveedor: <strong>{selectedItemData.supplierName || 'N/A'}</strong>
                    </p>
                    <p className="text-[11px] text-foreground">
                      Ubicación: <strong>{selectedItemData.areaName || 'Almacén'}</strong>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
