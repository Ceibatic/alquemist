'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { CropTypeFilter } from './crop-type-filter';
import { Search, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CropType {
  _id: string;
  name: string;
  display_name_es: string;
}

interface SystemCultivar {
  _id: string;
  name: string;
  crop_type_id: string;
  variety_type?: string;
  genetic_lineage?: string;
  status: string;
  characteristics?: {
    flowering_time_days?: number;
    thc_min?: number;
    thc_max?: number;
    cbd_min?: number;
    cbd_max?: number;
  };
}

interface LinkCultivarsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cropTypes: CropType[];
  systemCultivars: SystemCultivar[];
  linkedCultivarIds: string[];
  onLink: (cultivarIds: string[]) => Promise<void>;
  isSubmitting?: boolean;
}

export function LinkCultivarsModal({
  open,
  onOpenChange,
  cropTypes,
  systemCultivars,
  linkedCultivarIds,
  onLink,
  isSubmitting = false,
}: LinkCultivarsModalProps) {
  const [selectedCropType, setSelectedCropType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCultivarIds, setSelectedCultivarIds] = useState<string[]>([]);

  // Filter cultivars by crop type and search query
  const filteredCultivars = useMemo(() => {
    let filtered = systemCultivars.filter(
      (cultivar) => !linkedCultivarIds.includes(cultivar._id)
    );

    // Filter by crop type
    if (selectedCropType !== 'all') {
      filtered = filtered.filter(
        (cultivar) => cultivar.crop_type_id === selectedCropType
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (cultivar) =>
          cultivar.name.toLowerCase().includes(query) ||
          cultivar.variety_type?.toLowerCase().includes(query) ||
          cultivar.genetic_lineage?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [systemCultivars, selectedCropType, searchQuery, linkedCultivarIds]);

  const handleToggleCultivar = (cultivarId: string) => {
    setSelectedCultivarIds((prev) =>
      prev.includes(cultivarId)
        ? prev.filter((id) => id !== cultivarId)
        : [...prev, cultivarId]
    );
  };

  const handleSubmit = async () => {
    if (selectedCultivarIds.length === 0) return;
    await onLink(selectedCultivarIds);
    setSelectedCultivarIds([]);
    setSearchQuery('');
    setSelectedCropType('all');
    onOpenChange(false);
  };

  const handleCancel = () => {
    setSelectedCultivarIds([]);
    setSearchQuery('');
    setSelectedCropType('all');
    onOpenChange(false);
  };

  // Format cultivar details for display
  const formatCultivarDetails = (cultivar: SystemCultivar) => {
    const details: string[] = [];

    if (cultivar.variety_type) {
      const variety =
        cultivar.variety_type.charAt(0).toUpperCase() +
        cultivar.variety_type.slice(1);
      details.push(variety);
    }

    if (cultivar.characteristics?.flowering_time_days) {
      const weeks = Math.round(
        cultivar.characteristics.flowering_time_days / 7
      );
      details.push(`${weeks} sem`);
    }

    const thcMin = cultivar.characteristics?.thc_min;
    const thcMax = cultivar.characteristics?.thc_max;
    if (thcMin !== undefined && thcMax !== undefined) {
      details.push(`THC ${thcMin}-${thcMax}%`);
    } else if (thcMin !== undefined) {
      details.push(`THC ${thcMin}%+`);
    } else if (thcMax !== undefined) {
      details.push(`THC hasta ${thcMax}%`);
    }

    return details.join(' - ');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Agregar Cultivares del Sistema</DialogTitle>
          <DialogDescription>
            Selecciona los cultivares que cultivas en tu instalación
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <CropTypeFilter
              cropTypes={cropTypes}
              value={selectedCropType}
              onChange={setSelectedCropType}
            />

            <div className="flex-1">
              <Label htmlFor="search" className="text-sm font-medium">
                Buscar
              </Label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  type="text"
                  placeholder="Buscar en catálogo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          {/* Cultivar List */}
          <ScrollArea className="flex-1 border rounded-md p-4">
            {filteredCultivars.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">
                  {linkedCultivarIds.length > 0 && searchQuery === ''
                    ? 'No hay más cultivares disponibles para agregar'
                    : 'No se encontraron cultivares que coincidan con la búsqueda'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCultivars.map((cultivar) => (
                  <div
                    key={cultivar._id}
                    className="flex items-start gap-3 p-3 rounded-md border hover:bg-gray-50 transition-colors"
                  >
                    <Checkbox
                      id={`cultivar-${cultivar._id}`}
                      checked={selectedCultivarIds.includes(cultivar._id)}
                      onCheckedChange={() => handleToggleCultivar(cultivar._id)}
                      disabled={isSubmitting}
                    />
                    <Label
                      htmlFor={`cultivar-${cultivar._id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-medium text-gray-900">
                        {cultivar.name}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {formatCultivarDetails(cultivar)}
                      </div>
                      {cultivar.genetic_lineage && (
                        <div className="text-xs text-gray-500 mt-1 italic">
                          {cultivar.genetic_lineage}
                        </div>
                      )}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Selection Count */}
          {selectedCultivarIds.length > 0 && (
            <div className="text-sm text-gray-600">
              {selectedCultivarIds.length} cultivar
              {selectedCultivarIds.length !== 1 ? 'es' : ''} seleccionado
              {selectedCultivarIds.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={selectedCultivarIds.length === 0 || isSubmitting}
            className="bg-yellow-500 hover:bg-yellow-600 text-gray-900"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Agregar {selectedCultivarIds.length > 0 && selectedCultivarIds.length}{' '}
            Seleccionado{selectedCultivarIds.length !== 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
