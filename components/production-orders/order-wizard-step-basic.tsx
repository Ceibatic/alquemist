'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Loader2 } from 'lucide-react';
import type { OrderWizardFormData } from './order-create-wizard';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface OrderWizardStepBasicProps {
  formData: OrderWizardFormData;
  updateField: <K extends keyof OrderWizardFormData>(
    field: K,
    value: OrderWizardFormData[K]
  ) => void;
  companyId: Id<'companies'>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function OrderWizardStepBasic({
  formData,
  updateField,
  companyId,
}: OrderWizardStepBasicProps) {
  // Fetch data
  const templates = useQuery(api.productionTemplates.list, {
    companyId,
    status: 'active',
  });
  const cropTypes = useQuery(api.crops.getCropTypes, {});
  const cultivars = useQuery(
    api.cultivars.getByCrop,
    formData.cropTypeId
      ? {
          companyId,
          cropTypeId: formData.cropTypeId as Id<'crop_types'>,
        }
      : 'skip'
  );

  // When template is selected, pre-fill crop type + cultivar + batch size
  const handleTemplateChange = (templateId: string) => {
    updateField('templateId', templateId);
    if (templateId === 'none') {
      updateField('templateId', '');
      return;
    }
    const template = templates?.find((t) => t._id === templateId);
    if (template) {
      updateField('cropTypeId', template.crop_type_id);
      if (template.cultivar_id) {
        updateField('cultivarId', template.cultivar_id);
      }
      if (template.default_batch_size) {
        updateField('batchSize', template.default_batch_size.toString());
      }
    }
  };

  const isLoading = templates === undefined || cropTypes === undefined;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Template (optional) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Template (opcional)</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={formData.templateId || 'none'}
            onValueChange={handleTemplateChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sin template — crear fases manualmente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin template</SelectItem>
              {templates?.map((template) => (
                <SelectItem key={template._id} value={template._id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1.5">
            Un template pre-configura las fases y actividades de la orden
          </p>
        </CardContent>
      </Card>

      {/* Crop info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Información del cultivo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Tipo de Cultivo *</Label>
              <Select
                value={formData.cropTypeId}
                onValueChange={(val) => {
                  updateField('cropTypeId', val);
                  updateField('cultivarId', '');
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
            <div className="space-y-1.5">
              <Label>Cultivar</Label>
              <Select
                value={formData.cultivarId || 'none'}
                onValueChange={(val) =>
                  updateField('cultivarId', val === 'none' ? '' : val)
                }
                disabled={!formData.cropTypeId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Cualquiera</SelectItem>
                  {cultivars?.map((cv) => (
                    <SelectItem key={cv._id} value={cv._id}>
                      {cv.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Tipo de Orden</Label>
              <Select
                value={formData.orderType}
                onValueChange={(val) => updateField('orderType', val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Producción Estándar</SelectItem>
                  <SelectItem value="propagation">Solo Propagación</SelectItem>
                  <SelectItem value="mother">Plantas Madre</SelectItem>
                  <SelectItem value="research">Investigación</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Tipo de Fuente</Label>
              <Select
                value={formData.sourceType}
                onValueChange={(val) => updateField('sourceType', val)}
              >
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
        </CardContent>
      </Card>

      {/* Quantities */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Cantidades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Cantidad Solicitada *</Label>
              <Input
                type="number"
                min="1"
                value={formData.requestedQuantity}
                onChange={(e) => updateField('requestedQuantity', e.target.value)}
                placeholder="100"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Tamaño de Lote</Label>
              <Input
                type="number"
                min="1"
                value={formData.batchSize}
                onChange={(e) => updateField('batchSize', e.target.value)}
                placeholder="50"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Fecha Inicio *</Label>
              <Input
                type="date"
                value={formData.plannedStartDate}
                onChange={(e) => updateField('plannedStartDate', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Config */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Configuración</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Prioridad</Label>
            <Select
              value={formData.priority}
              onValueChange={(val) => updateField('priority', val)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baja</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Notas</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="Notas adicionales..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
