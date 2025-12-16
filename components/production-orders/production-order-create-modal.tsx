'use client';

import { useState } from 'react';
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
import { ClipboardList, Loader2 } from 'lucide-react';
import { useUser } from '@/components/providers/user-provider';

interface ProductionOrderCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: Id<'companies'>;
  facilityId?: Id<'facilities'>;
  onSuccess: (orderId: string) => void;
}

export function ProductionOrderCreateModal({
  open,
  onOpenChange,
  companyId,
  facilityId,
  onSuccess,
}: ProductionOrderCreateModalProps) {
  const { toast } = useToast();
  const { userId } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [selectedFacility, setSelectedFacility] = useState<string>(facilityId || '');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedCropType, setSelectedCropType] = useState<string>('');
  const [selectedCultivar, setSelectedCultivar] = useState<string>('');
  const [orderType, setOrderType] = useState<string>('standard');
  const [sourceType, setSourceType] = useState<string>('seed');
  const [quantity, setQuantity] = useState<string>('100');
  const [batchSize, setBatchSize] = useState<string>('50');
  const [enableIndividualTracking, setEnableIndividualTracking] = useState(false);
  const [priority, setPriority] = useState<string>('normal');
  const [notes, setNotes] = useState('');

  // Fetch data
  const facilities = useQuery(api.facilities.list, { companyId });
  const templates = useQuery(api.productionTemplates.list, {
    companyId,
    status: 'active',
  });
  const cropTypes = useQuery(api.crops.getCropTypes, {});
  const cultivars = useQuery(
    api.cultivars.getByCrop,
    selectedCropType ? { cropTypeId: selectedCropType as Id<'crop_types'> } : 'skip'
  );

  // Mutations
  const createOrder = useMutation(api.productionOrders.create);

  // Reset form when modal closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedTemplate('');
      setSelectedCropType('');
      setSelectedCultivar('');
      setOrderType('standard');
      setSourceType('seed');
      setQuantity('100');
      setBatchSize('50');
      setEnableIndividualTracking(false);
      setPriority('normal');
      setNotes('');
    }
    onOpenChange(newOpen);
  };

  // When template is selected, pre-fill crop type
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates?.find((t) => t._id === templateId);
    if (template) {
      setSelectedCropType(template.crop_type_id);
      if (template.cultivar_id) {
        setSelectedCultivar(template.cultivar_id);
      }
      if (template.default_batch_size) {
        setBatchSize(template.default_batch_size.toString());
      }
      if (template.enable_individual_tracking) {
        setEnableIndividualTracking(template.enable_individual_tracking);
      }
    }
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

    if (!selectedCropType) {
      toast({
        title: 'Error',
        description: 'Selecciona un tipo de cultivo',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const orderId = await createOrder({
        companyId,
        facilityId: targetFacility as Id<'facilities'>,
        templateId: selectedTemplate
          ? (selectedTemplate as Id<'production_templates'>)
          : undefined,
        cropTypeId: selectedCropType as Id<'crop_types'>,
        cultivarId: selectedCultivar
          ? (selectedCultivar as Id<'cultivars'>)
          : undefined,
        orderType,
        sourceType,
        requestedQuantity: parseInt(quantity),
        batchSize: parseInt(batchSize),
        enableIndividualTracking,
        priority,
        notes: notes || undefined,
        requestedBy: userId as Id<'users'>,
      });

      toast({
        title: 'Orden creada',
        description: 'La orden de produccion ha sido creada correctamente.',
      });

      onSuccess(orderId);
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear la orden. Intenta de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <ClipboardList className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <DialogTitle>Nueva Orden de Produccion</DialogTitle>
              <DialogDescription>
                Crea una nueva orden para gestionar tu produccion
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Template Selection */}
          <div className="space-y-2">
            <Label>Template (opcional)</Label>
            <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar template..." />
              </SelectTrigger>
              <SelectContent>
                {templates?.map((template) => (
                  <SelectItem key={template._id} value={template._id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Un template pre-configura las fases y actividades de la orden
            </p>
          </div>

          {/* Facility Selection (if not already selected) */}
          {!facilityId && (
            <div className="space-y-2">
              <Label>Instalacion *</Label>
              <Select value={selectedFacility} onValueChange={setSelectedFacility}>
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

          {/* Order Type & Source */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Orden</Label>
              <Select value={orderType} onValueChange={setOrderType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Produccion Estandar</SelectItem>
                  <SelectItem value="propagation">Solo Propagacion</SelectItem>
                  <SelectItem value="mother">Plantas Madre</SelectItem>
                  <SelectItem value="research">Investigacion</SelectItem>
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
                  <SelectItem value="purchase">Compra Externa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quantities */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cantidad Solicitada *</Label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="100"
              />
            </div>
            <div className="space-y-2">
              <Label>Tamano de Lote</Label>
              <Input
                type="number"
                min="1"
                value={batchSize}
                onChange={(e) => setBatchSize(e.target.value)}
                placeholder="50"
              />
            </div>
          </div>

          {/* Priority & Individual Tracking */}
          <div className="grid grid-cols-2 gap-4 items-center">
            <div className="space-y-2">
              <Label>Prioridad</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
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
                'Crear Orden'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
