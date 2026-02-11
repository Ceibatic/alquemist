'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useFacility } from '@/components/providers/facility-provider';
import { toast } from 'sonner';
import { Plus, Trash2, Package, Loader2, GripVertical } from 'lucide-react';

const QUANTITY_BASIS_OPTIONS = [
  { value: 'fixed', label: 'Fijo' },
  { value: 'per_plant', label: 'Por planta' },
  { value: 'per_m2', label: 'Por m2' },
  { value: 'per_zone', label: 'Por zona' },
  { value: 'per_L_solution', label: 'Por L de solucion' },
];

const DIRECTION_OPTIONS = [
  { value: 'consumed', label: 'Consumido' },
  { value: 'applied', label: 'Aplicado' },
  { value: 'produced', label: 'Producido' },
];

interface ResourceEditorProps {
  templateId: Id<'activity_templates'>;
}

export function ResourceEditor({ templateId }: ResourceEditorProps) {
  const { currentCompanyId } = useFacility();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Form state for adding new resource
  const [productId, setProductId] = useState<string>('');
  const [quantity, setQuantity] = useState('');
  const [quantityBasis, setQuantityBasis] = useState('fixed');
  const [direction, setDirection] = useState('consumed');
  const [applicationRate, setApplicationRate] = useState('');
  const [applicationMethod, setApplicationMethod] = useState('');
  const [isRequired, setIsRequired] = useState(true);
  const [notes, setNotes] = useState('');

  const template = useQuery(api.activityTemplates.getById, { templateId });
  const products = useQuery(
    api.products.list,
    currentCompanyId ? { companyId: currentCompanyId, status: 'active' } : undefined
  );

  const addResourceMutation = useMutation(api.activityTemplates.addResource);
  const removeResourceMutation = useMutation(api.activityTemplates.removeResource);

  const resetForm = () => {
    setProductId('');
    setQuantity('');
    setQuantityBasis('fixed');
    setDirection('consumed');
    setApplicationRate('');
    setApplicationMethod('');
    setIsRequired(true);
    setNotes('');
  };

  const handleAdd = async () => {
    if (!productId) {
      toast.error('Selecciona un producto');
      return;
    }
    if (!quantity || Number(quantity) <= 0) {
      toast.error('Ingresa una cantidad valida');
      return;
    }

    try {
      setIsAdding(true);
      await addResourceMutation({
        templateId,
        productId: productId as Id<'products'>,
        quantity: Number(quantity),
        quantityBasis,
        direction,
        applicationRate: applicationRate.trim() || undefined,
        applicationMethod: applicationMethod.trim() || undefined,
        isRequired,
        notes: notes.trim() || undefined,
      });
      toast.success('Recurso agregado');
      resetForm();
      setAddDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al agregar');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemove = async (resourceId: Id<'activity_template_resources'>) => {
    try {
      await removeResourceMutation({ resourceId });
      toast.success('Recurso eliminado');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  const resources = template?.resources ?? [];
  const productList = products && 'products' in products ? products.products : (products ?? []);
  const productMap = new Map(
    (productList as Array<{ _id: string; name: string }>).map((p) => [p._id, p])
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="h-4 w-4" />
            Recursos ({resources.length})
          </CardTitle>
          <Button size="sm" variant="outline" onClick={() => setAddDialogOpen(true)}>
            <Plus className="mr-1 h-3 w-3" />
            Agregar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {resources.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay recursos definidos. Agrega productos para pre-llenar el formulario al ejecutar.
          </p>
        ) : (
          <div className="space-y-2">
            {resources.map((res) => {
              const product = productMap.get(res.product_id);
              const basisLabel = QUANTITY_BASIS_OPTIONS.find(
                (o) => o.value === res.quantity_basis
              )?.label ?? res.quantity_basis;
              const dirLabel = DIRECTION_OPTIONS.find(
                (o) => o.value === res.direction
              )?.label ?? res.direction;

              return (
                <div
                  key={res._id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">
                        {product?.name ?? 'Producto desconocido'}
                      </span>
                      {!res.is_required && (
                        <Badge variant="outline" className="text-xs">Opcional</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                      <span className="font-mono">{res.quantity} {basisLabel}</span>
                      <span>·</span>
                      <span>{dirLabel}</span>
                      {res.application_rate && (
                        <>
                          <span>·</span>
                          <span>{res.application_rate}</span>
                        </>
                      )}
                      {res.application_method && (
                        <>
                          <span>·</span>
                          <span>{res.application_method}</span>
                        </>
                      )}
                    </div>
                    {res.notes && (
                      <p className="text-xs text-muted-foreground mt-1 italic">{res.notes}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-red-500 flex-shrink-0"
                    onClick={() => handleRemove(res._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Add Resource Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar recurso</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Producto *</Label>
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar producto" />
                </SelectTrigger>
                <SelectContent>
                  {(productList as Array<{ _id: string; name: string; status?: string }>)
                    .map((p) => (
                      <SelectItem key={p._id} value={p._id}>
                        {p.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cantidad *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Ej: 2.5"
                  min={0}
                />
              </div>
              <div className="space-y-2">
                <Label>Base de calculo</Label>
                <Select value={quantityBasis} onValueChange={setQuantityBasis}>
                  <SelectTrigger>
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
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Direccion</Label>
                <Select value={direction} onValueChange={setDirection}>
                  <SelectTrigger>
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
              </div>
              <div className="space-y-2">
                <Label>Metodo aplicacion</Label>
                <Input
                  value={applicationMethod}
                  onChange={(e) => setApplicationMethod(e.target.value)}
                  placeholder="Ej: foliar, drench"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tasa aplicacion</Label>
              <Input
                value={applicationRate}
                onChange={(e) => setApplicationRate(e.target.value)}
                placeholder="Ej: 2mL/L, 5g/m2"
              />
            </div>

            <div className="space-y-2">
              <Label>Notas</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: Disolver en agua tibia primero"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={isRequired}
                onCheckedChange={setIsRequired}
              />
              <Label className="cursor-pointer">Recurso requerido</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAdd}
              disabled={isAdding}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {isAdding ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Agregar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
