'use client';

import { useEffect } from 'react';
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
import type { WizardFormData, PhaseItem } from './template-create-wizard';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORY_OPTIONS = [
  { value: 'seed_to_harvest', label: 'Semilla a Cosecha' },
  { value: 'propagation', label: 'Propagacion' },
  { value: 'custom', label: 'Personalizado' },
];

const METHOD_OPTIONS = [
  { value: 'indoor', label: 'Indoor' },
  { value: 'outdoor', label: 'Outdoor' },
  { value: 'greenhouse', label: 'Invernadero' },
];

const SOURCE_OPTIONS = [
  { value: 'seed', label: 'Semilla' },
  { value: 'clone', label: 'Clon' },
  { value: 'tissue_culture', label: 'Cultivo de Tejido' },
];

const AREA_TYPE_DEFAULTS: Record<string, string> = {
  propagation: 'propagation',
  vegetative: 'vegetative',
  flowering: 'flowering',
  harvest: 'flowering',
  drying: 'drying',
  curing: 'curing',
  post_harvest: 'storage',
  processing: 'processing',
  storage: 'storage',
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface WizardStepBasicProps {
  formData: WizardFormData;
  updateField: <K extends keyof WizardFormData>(field: K, value: WizardFormData[K]) => void;
  onPhasesFromCropType: (phases: PhaseItem[]) => void;
  companyId: Id<'companies'>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function WizardStepBasic({
  formData,
  updateField,
  onPhasesFromCropType,
  companyId,
}: WizardStepBasicProps) {
  // Fetch crop types
  const cropTypes = useQuery(api.crops.getCropTypes, {});

  // Fetch the selected crop type to get default_phases
  const selectedCropType = useQuery(
    api.crops.getCropTypeById,
    formData.cropTypeId
      ? { id: formData.cropTypeId as Id<'crop_types'> }
      : 'skip'
  );

  // Fetch cultivars filtered by the selected crop type
  const cultivars = useQuery(
    api.cultivars.list,
    formData.cropTypeId
      ? {
          companyId,
          cropTypeId: formData.cropTypeId as Id<'crop_types'>,
        }
      : 'skip'
  );

  // When crop type changes and we load its data, pre-populate phases
  useEffect(() => {
    if (!selectedCropType || !formData.cropTypeId) return;

    const rawPhases: any[] = selectedCropType.default_phases ?? [];
    const mappedPhases: PhaseItem[] = rawPhases.map((p: any) => ({
      id: crypto.randomUUID(),
      name: p.name ?? p.phase_name ?? '',
      durationDays: p.duration_days ?? p.estimated_duration_days ?? 14,
      areaType:
        AREA_TYPE_DEFAULTS[p.area_type ?? p.name?.toLowerCase() ?? ''] ??
        p.area_type ??
        'vegetative',
      description: p.description ?? '',
    }));

    onPhasesFromCropType(mappedPhases);
    // We intentionally only run this when the crop type selection changes,
    // not on every render — cropTypeId is the dependency that matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCropType?._id]);

  const handleCropTypeChange = (value: string) => {
    updateField('cropTypeId', value);
    // Reset cultivar when crop type changes
    updateField('cultivarId', '');
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informacion basica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="template-name">Nombre *</Label>
            <Input
              id="template-name"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Ej: Cannabis Indoor - Ciclo Completo"
            />
          </div>

          {/* Crop Type + Cultivar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="crop-type">Tipo de Cultivo *</Label>
              <Select
                value={formData.cropTypeId}
                onValueChange={handleCropTypeChange}
              >
                <SelectTrigger id="crop-type">
                  <SelectValue placeholder="Seleccionar tipo de cultivo" />
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
              <Label htmlFor="cultivar">Cultivar (Opcional)</Label>
              <Select
                value={formData.cultivarId}
                onValueChange={(v) => updateField('cultivarId', v)}
                disabled={!formData.cropTypeId}
              >
                <SelectTrigger id="cultivar">
                  <SelectValue placeholder="Cualquier cultivar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Cualquier cultivar</SelectItem>
                  {cultivars?.map((cv) => (
                    <SelectItem key={cv._id} value={cv._id}>
                      {cv.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripcion</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Descripcion del proceso de produccion..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Production Config */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configuracion de produccion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={formData.templateCategory}
                onValueChange={(v) => updateField('templateCategory', v)}
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Production Method */}
            <div className="space-y-2">
              <Label htmlFor="method">Metodo de produccion</Label>
              <Select
                value={formData.productionMethod}
                onValueChange={(v) => updateField('productionMethod', v)}
              >
                <SelectTrigger id="method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {METHOD_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Source Type */}
            <div className="space-y-2">
              <Label htmlFor="source">Fuente del material</Label>
              <Select
                value={formData.sourceType}
                onValueChange={(v) => updateField('sourceType', v)}
              >
                <SelectTrigger id="source">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SOURCE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
