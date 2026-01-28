'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Layers, Loader2, AlertCircle, Info } from 'lucide-react';
import { useUser } from '@/components/providers/user-provider';

interface BatchCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: Id<'companies'>;
  facilityId?: Id<'facilities'>;
  orderId?: Id<'production_orders'>;
  onSuccess: (batchId: string) => void;
}

export function BatchCreateModal({
  open,
  onOpenChange,
  companyId,
  facilityId,
  orderId,
  onSuccess,
}: BatchCreateModalProps) {
  const { toast } = useToast();
  const { userId } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [selectedFacility, setSelectedFacility] = useState<string>(facilityId || '');
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [selectedCropType, setSelectedCropType] = useState<string>('');
  const [selectedCultivar, setSelectedCultivar] = useState<string>('');
  const [batchType, setBatchType] = useState<string>('production');
  const [sourceType, setSourceType] = useState<string>('seed');
  const [plannedQuantity, setPlannedQuantity] = useState<string>('50');
  const [initialQuantity, setInitialQuantity] = useState<string>('50');
  const [enableIndividualTracking, setEnableIndividualTracking] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<string>('germination');
  const [notes, setNotes] = useState('');

  // New fields for US-25.3
  const [useAutoCode, setUseAutoCode] = useState(true);
  const [customCode, setCustomCode] = useState('');
  const [supplierId, setSupplierId] = useState<string>('');
  const [germinationDate, setGerminationDate] = useState<string>('');
  const [productionOrderId, setProductionOrderId] = useState<string>(orderId || '');

  // Fetch data
  const facilities = useQuery(api.facilities.list, { companyId });
  const areas = useQuery(
    api.areas.getByFacility,
    selectedFacility ? { facilityId: selectedFacility as Id<'facilities'> } : 'skip'
  );
  const cropTypes = useQuery(api.crops.getCropTypes, {});
  const cultivars = useQuery(
    api.cultivars.getByCrop,
    selectedCropType ? { companyId, cropTypeId: selectedCropType as Id<'crop_types'> } : 'skip'
  );
  const suppliers = useQuery(api.suppliers.list, { companyId });
  const productionOrders = useQuery(
    api.productionOrders.list,
    selectedFacility
      ? {
          companyId,
          facilityId: selectedFacility as Id<'facilities'>,
          status: 'active',
        }
      : 'skip'
  );

  // Mutations
  const createBatch = useMutation(api.batches.create);

  // Generate preview of auto-generated code
  const autoCodePreview = () => {
    if (!useAutoCode) return '';

    const cultivarCode = selectedCultivar
      ? cultivars?.find((c) => c._id === selectedCultivar)?.name.substring(0, 3).toUpperCase()
      : 'GEN';

    const now = new Date();
    const dateStr =
      now.getFullYear().toString().slice(-2) +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0');

    return `${cultivarCode}-${dateStr}-XXX`;
  };

  // Reset form when modal closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedArea('');
      setSelectedCropType('');
      setSelectedCultivar('');
      setBatchType('production');
      setSourceType('seed');
      setPlannedQuantity('50');
      setInitialQuantity('50');
      setEnableIndividualTracking(false);
      setCurrentPhase('germination');
      setNotes('');
      setUseAutoCode(true);
      setCustomCode('');
      setSupplierId('');
      setGerminationDate('');
      setProductionOrderId(orderId || '');
    }
    onOpenChange(newOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      toast({
        title: 'Error',
        description: 'Usuario no autenticado',
        variant: 'destructive',
      });
      return;
    }

    const targetFacility = selectedFacility || facilityId;
    if (!targetFacility) {
      toast({
        title: 'Error',
        description: 'Selecciona una instalacion',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedArea) {
      toast({
        title: 'Error',
        description: 'Selecciona un area',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedCropType) {
      toast({
        title: 'Error',
        description: 'Selecciona un tipo de cultivo',
        variant: 'destructive',
      });
      return;
    }

    // Validate custom code if not using auto-generate
    if (!useAutoCode && !customCode.trim()) {
      toast({
        title: 'Error',
        description: 'Ingresa un codigo personalizado o activa la generacion automatica',
        variant: 'destructive',
      });
      return;
    }

    // Validate supplier for purchases
    if (sourceType === 'purchase' && !supplierId) {
      toast({
        title: 'Error',
        description: 'Selecciona un proveedor para compras externas',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const batchId = await createBatch({
        companyId,
        facilityId: targetFacility as Id<'facilities'>,
        areaId: selectedArea as Id<'areas'>,
        cropTypeId: selectedCropType as Id<'crop_types'>,
        cultivarId: selectedCultivar
          ? (selectedCultivar as Id<'cultivars'>)
          : undefined,
        orderId: productionOrderId
          ? (productionOrderId as Id<'production_orders'>)
          : undefined,
        batchType,
        sourceType,
        plannedQuantity: parseInt(plannedQuantity),
        initialQuantity: parseInt(initialQuantity),
        enableIndividualTracking,
        currentPhase,
        notes: notes || undefined,
        createdBy: userId as Id<'users'>,
        // New fields
        supplierId: supplierId ? (supplierId as Id<'suppliers'>) : undefined,
        germinationDate: germinationDate ? new Date(germinationDate).getTime() : undefined,
      });

      toast({
        title: 'Lote creado',
        description: 'El lote ha sido creado correctamente.',
      });

      onSuccess(batchId);
    } catch (error) {
      console.error('Error creating batch:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear el lote. Intenta de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get label for germination date based on source type
  const getGerminationDateLabel = () => {
    if (sourceType === 'seed') return 'Fecha de Germinacion';
    if (sourceType === 'clone') return 'Fecha de Clonacion';
    return 'Fecha de Inicio';
  };

  // Check if quantity is high for individual tracking warning
  const showTrackingWarning = enableIndividualTracking && parseInt(initialQuantity) > 100;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <Layers className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <DialogTitle>Nuevo Lote de Produccion</DialogTitle>
              <DialogDescription>
                Crea un nuevo lote para gestionar tus plantas
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Batch Code Configuration */}
          <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Codigo de Lote</Label>
                <p className="text-sm text-gray-500">
                  Configura como se generara el codigo
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="auto-code" className="text-sm">
                  Generar automatico
                </Label>
                <Switch
                  id="auto-code"
                  checked={useAutoCode}
                  onCheckedChange={setUseAutoCode}
                />
              </div>
            </div>

            {useAutoCode ? (
              <div className="space-y-2">
                <Label className="text-sm text-gray-600">Vista previa del codigo</Label>
                <div className="p-3 bg-white border rounded-md">
                  <p className="text-sm font-mono text-gray-700">
                    {autoCodePreview() || 'Selecciona un cultivar para ver la vista previa'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Formato: CULTIVAR-AAMMDD-XXX
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="custom-code">Codigo Personalizado *</Label>
                <Input
                  id="custom-code"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  placeholder="Ej: CUSTOM-2026-001"
                  required={!useAutoCode}
                />
              </div>
            )}
          </div>

          {/* Facility Selection (if not already selected) */}
          {!facilityId && (
            <div className="space-y-2">
              <Label>Instalacion *</Label>
              <Select
                value={selectedFacility}
                onValueChange={(value) => {
                  setSelectedFacility(value);
                  setSelectedArea('');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar instalacion..." />
                </SelectTrigger>
                <SelectContent>
                  {facilities?.facilities?.map((facility) => (
                    <SelectItem key={facility._id} value={facility._id}>
                      {facility.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Area Selection */}
          <div className="space-y-2">
            <Label>Area *</Label>
            <Select
              value={selectedArea}
              onValueChange={setSelectedArea}
              disabled={!selectedFacility && !facilityId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar area..." />
              </SelectTrigger>
              <SelectContent>
                {areas?.map((area) => (
                  <SelectItem key={area._id} value={area._id}>
                    {area.name} ({area.area_type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Crop Type & Cultivar */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Cultivo *</Label>
              <Select
                value={selectedCropType}
                onValueChange={(value) => {
                  setSelectedCropType(value);
                  setSelectedCultivar('');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {cropTypes?.map((ct) => (
                    <SelectItem key={ct._id} value={ct._id}>
                      {ct.display_name_es}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cultivar</Label>
              <Select
                value={selectedCultivar}
                onValueChange={setSelectedCultivar}
                disabled={!selectedCropType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {cultivars?.map((cv) => (
                    <SelectItem key={cv._id} value={cv._id}>
                      {cv.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Batch Type & Source */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Lote</Label>
              <Select value={batchType} onValueChange={setBatchType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="production">Produccion</SelectItem>
                  <SelectItem value="mother">Plantas Madre</SelectItem>
                  <SelectItem value="research">Investigacion</SelectItem>
                  <SelectItem value="rescue">Rescate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo de Fuente</Label>
              <Select value={sourceType} onValueChange={setSourceType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seed">Semilla</SelectItem>
                  <SelectItem value="clone">Clon</SelectItem>
                  <SelectItem value="purchase">Compra</SelectItem>
                  <SelectItem value="rescue">Rescate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Supplier Field (conditional) */}
          {sourceType === 'purchase' && (
            <div className="space-y-2">
              <Label>Proveedor *</Label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar proveedor..." />
                </SelectTrigger>
                <SelectContent>
                  {suppliers?.suppliers?.map((supplier) => (
                    <SelectItem key={supplier._id} value={supplier._id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Germination/Cloning Date */}
          <div className="space-y-2">
            <Label htmlFor="germination-date">{getGerminationDateLabel()}</Label>
            <Input
              id="germination-date"
              type="date"
              value={germinationDate}
              onChange={(e) => setGerminationDate(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Opcional - Registra la fecha de inicio del cultivo
            </p>
          </div>

          {/* Production Order Link (optional) */}
          {!orderId && productionOrders && productionOrders.length > 0 && (
            <div className="space-y-2">
              <Label>Orden de Produccion (Opcional)</Label>
              <Select value={productionOrderId} onValueChange={setProductionOrderId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sin vincular..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin vincular</SelectItem>
                  {productionOrders.map((order) => (
                    <SelectItem key={order._id} value={order._id}>
                      {order.orderNumber} - {order.cultivarName || order.cropTypeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Vincula este lote a una orden de produccion existente
              </p>
            </div>
          )}

          {/* Quantities */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cantidad Planificada *</Label>
              <Input
                type="number"
                min="1"
                value={plannedQuantity}
                onChange={(e) => setPlannedQuantity(e.target.value)}
                placeholder="50"
              />
            </div>
            <div className="space-y-2">
              <Label>Cantidad Inicial *</Label>
              <Input
                type="number"
                min="1"
                value={initialQuantity}
                onChange={(e) => setInitialQuantity(e.target.value)}
                placeholder="50"
              />
            </div>
          </div>

          {/* Phase & Individual Tracking */}
          <div className="grid grid-cols-2 gap-4 items-end">
            <div className="space-y-2">
              <Label>Fase Actual</Label>
              <Select value={currentPhase} onValueChange={setCurrentPhase}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="germination">Germinacion</SelectItem>
                  <SelectItem value="seedling">Plantula</SelectItem>
                  <SelectItem value="propagation">Propagacion</SelectItem>
                  <SelectItem value="vegetative">Vegetativo</SelectItem>
                  <SelectItem value="flowering">Floracion</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label>Rastreo Individual</Label>
                <p className="text-xs text-gray-500">Seguimiento por planta</p>
              </div>
              <Switch
                checked={enableIndividualTracking}
                onCheckedChange={setEnableIndividualTracking}
              />
            </div>
          </div>

          {/* Individual Tracking Info/Warning */}
          {enableIndividualTracking && (
            <div
              className={`p-3 border rounded-lg flex items-start gap-2 ${
                showTrackingWarning
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              {showTrackingWarning ? (
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              ) : (
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className={`text-sm ${showTrackingWarning ? 'text-amber-700' : 'text-blue-700'}`}>
                  {showTrackingWarning ? (
                    <>
                      <strong>No recomendado para lotes grandes:</strong> Se crearan{' '}
                      {initialQuantity} registros individuales. Esto puede tomar varios segundos y
                      aumentar la complejidad de gestion.
                    </>
                  ) : (
                    <>
                      Se crearan {initialQuantity} registros de plantas individuales. Esto permite
                      rastrear cada planta por separado (recomendado para lotes pequeños).
                    </>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notas</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas adicionales..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creando...
                </>
              ) : (
                'Crear Lote'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
