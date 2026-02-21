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
import { CannabinoidRangeInput } from './cannabinoid-range-input';
import type { CultivarWizardFormData } from './cultivar-create-wizard';

interface WizardStepBasicProps {
  formData: CultivarWizardFormData;
  updateField: <K extends keyof CultivarWizardFormData>(
    field: K,
    value: CultivarWizardFormData[K]
  ) => void;
  onCropTypeChange: (cropTypeId: string) => void;
  companyId: Id<'companies'>;
  isSaving: boolean;
}

export function WizardStepBasic({
  formData,
  updateField,
  onCropTypeChange,
  companyId,
  isSaving,
}: WizardStepBasicProps) {
  const cropTypes = useQuery(api.crops.getCropTypes, {});
  const suppliers = useQuery(api.suppliers.list, { companyId, isActive: true });

  const selectedCropType = cropTypes?.find((ct) => ct._id === formData.crop_type_id);
  const isCannabis = selectedCropType?.name === 'Cannabis';

  const handleCropTypeChange = (value: string) => {
    updateField('crop_type_id', value);
    updateField('variety_type', '');
    onCropTypeChange(value);
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informacion basica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="cultivar-name">Nombre del Cultivar *</Label>
              <Input
                id="cultivar-name"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Ej: Blue Dream, Geisha, Criollo"
                disabled={isSaving}
              />
            </div>

            {/* Crop Type */}
            <div className="space-y-2">
              <Label htmlFor="crop-type">Tipo de Cultivo *</Label>
              <Select
                value={formData.crop_type_id}
                onValueChange={handleCropTypeChange}
                disabled={isSaving}
              >
                <SelectTrigger id="crop-type">
                  <SelectValue placeholder="Selecciona tipo de cultivo" />
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
          </div>

          {/* Variety Type (Cannabis only) */}
          {isCannabis && (
            <div className="space-y-2">
              <Label htmlFor="variety-type">Tipo de Variedad</Label>
              <Select
                value={formData.variety_type}
                onValueChange={(v) => updateField('variety_type', v)}
                disabled={isSaving}
              >
                <SelectTrigger id="variety-type">
                  <SelectValue placeholder="Selecciona tipo de variedad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="indica">Indica</SelectItem>
                  <SelectItem value="sativa">Sativa</SelectItem>
                  <SelectItem value="hybrid">Hibrida</SelectItem>
                  <SelectItem value="ruderalis">Ruderalis</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Genetic Lineage */}
            <div className="space-y-2">
              <Label htmlFor="genetic-lineage">Linaje Genetico</Label>
              <Input
                id="genetic-lineage"
                value={formData.genetic_lineage}
                onChange={(e) => updateField('genetic_lineage', e.target.value)}
                placeholder="Ej: Blueberry x Haze"
                disabled={isSaving}
              />
            </div>

            {/* Supplier */}
            {suppliers && suppliers.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="supplier">Proveedor</Label>
                <Select
                  value={formData.supplier_id}
                  onValueChange={(v) => updateField('supplier_id', v)}
                  disabled={isSaving}
                >
                  <SelectTrigger id="supplier">
                    <SelectValue placeholder="Selecciona proveedor (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Ninguno</SelectItem>
                    {suppliers.map((s) => (
                      <SelectItem key={s._id} value={s._id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Growth Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informacion de Cultivo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="flowering-days">Tiempo de Floracion (dias)</Label>
            <Input
              id="flowering-days"
              type="number"
              value={formData.flowering_time_days ?? ''}
              onChange={(e) => {
                const val = e.target.value;
                updateField('flowering_time_days', val === '' ? undefined : parseInt(val));
              }}
              placeholder="56"
              disabled={isSaving}
            />
            <p className="text-xs text-muted-foreground">
              Tiempo estimado desde inicio de floracion hasta cosecha
            </p>
          </div>

          {/* Cannabinoids (Cannabis only) */}
          {isCannabis && (
            <div className="space-y-4">
              <CannabinoidRangeInput
                label="Rango de THC"
                minValue={formData.thc_min}
                maxValue={formData.thc_max}
                onMinChange={(v) => updateField('thc_min', v)}
                onMaxChange={(v) => updateField('thc_max', v)}
                disabled={isSaving}
              />
              <CannabinoidRangeInput
                label="Rango de CBD"
                minValue={formData.cbd_min}
                maxValue={formData.cbd_max}
                onMinChange={(v) => updateField('cbd_min', v)}
                onMaxChange={(v) => updateField('cbd_max', v)}
                disabled={isSaving}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notas</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            rows={3}
            placeholder="Informacion adicional sobre el cultivar..."
            disabled={isSaving}
          />
        </CardContent>
      </Card>
    </div>
  );
}
