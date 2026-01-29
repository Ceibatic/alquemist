'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlantCard } from './plant-card';
import { PlantDetailDrawer } from './plant-detail-drawer';
import {
  Leaf,
  Search,
  Filter,
  Grid3X3,
  List,
  Heart,
  AlertTriangle,
  Frown,
  Ruler,
  ArrowRight,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

interface PlantsTabProps {
  batchId: Id<'batches'>;
  userId: Id<'users'>;
}

export function PlantsTab({ batchId, userId }: PlantsTabProps) {
  const [selectedPlantId, setSelectedPlantId] = useState<Id<'plants'> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [healthFilter, setHealthFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPlantIds, setSelectedPlantIds] = useState<Id<'plants'>[]>([]);
  const [isBulkOperating, setIsBulkOperating] = useState(false);

  // Fetch plants
  const plants = useQuery(api.plants.listByBatch, { batchId });
  const stats = useQuery(api.plants.getStatsByBatch, { batchId });

  // Mutations
  const bulkHarvest = useMutation(api.plants.bulkHarvest);

  // Filter plants
  const filteredPlants = plants?.filter((plant) => {
    // Search filter
    if (searchQuery && !plant.plant_code.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    // Status filter
    if (statusFilter !== 'all' && plant.status !== statusFilter) {
      return false;
    }
    // Health filter
    if (healthFilter !== 'all' && plant.health_status !== healthFilter) {
      return false;
    }
    return true;
  });

  // Only allow selection of active plants
  const selectablePlants = filteredPlants?.filter(p => p.status === 'active') || [];

  // Select all logic
  const selectAll = selectedPlantIds.length > 0 &&
    selectedPlantIds.length === selectablePlants.length;

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedPlantIds([]);
    } else {
      setSelectedPlantIds(selectablePlants.map(p => p._id));
    }
  };

  // Toggle individual plant selection
  const togglePlantSelection = (plantId: Id<'plants'>) => {
    setSelectedPlantIds(prev =>
      prev.includes(plantId)
        ? prev.filter(id => id !== plantId)
        : [...prev, plantId]
    );
  };

  // Bulk action handlers
  const handleBulkHarvest = async () => {
    if (selectedPlantIds.length === 0) return;

    // Simple confirmation
    if (!confirm(`¿Deseas cosechar ${selectedPlantIds.length} planta(s)?`)) {
      return;
    }

    try {
      setIsBulkOperating(true);

      // For now, use default values - in a full implementation,
      // this would open a modal to collect these values
      await bulkHarvest({
        plantIds: selectedPlantIds,
        weightPerPlant: 0, // Would be collected from a modal
        quality: 'good',
        harvestedBy: userId,
      });

      toast.success(`${selectedPlantIds.length} planta(s) cosechadas exitosamente`);
      setSelectedPlantIds([]);
    } catch (error) {
      console.error('Error al cosechar plantas:', error);
      toast.error('Error al cosechar plantas');
    } finally {
      setIsBulkOperating(false);
    }
  };

  const handleBulkMove = () => {
    toast.info('Mover plantas - Próximamente');
  };

  const handleBulkMeasurement = () => {
    toast.info('Medición masiva - Próximamente');
  };

  // Clear selection when filters change
  useEffect(() => {
    setSelectedPlantIds([]);
  }, [statusFilter, healthFilter, searchQuery]);

  if (plants === undefined || stats === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gray-50">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-500">Total Plantas</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-700">{stats.healthy}</p>
            <p className="text-sm text-green-600 flex items-center justify-center gap-1">
              <Heart className="h-4 w-4" />
              Sanas
            </p>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-amber-700">{stats.stressed}</p>
            <p className="text-sm text-amber-600 flex items-center justify-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              Estresadas
            </p>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-red-700">{stats.sick + stats.lost}</p>
            <p className="text-sm text-red-600 flex items-center justify-center gap-1">
              <Frown className="h-4 w-4" />
              Enfermas/Perdidas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por codigo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activas</SelectItem>
                <SelectItem value="harvested">Cosechadas</SelectItem>
                <SelectItem value="lost">Perdidas</SelectItem>
              </SelectContent>
            </Select>

            {/* Health Filter */}
            <Select value={healthFilter} onValueChange={setHealthFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Salud" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="healthy">Sanas</SelectItem>
                <SelectItem value="stressed">Estresadas</SelectItem>
                <SelectItem value="sick">Enfermas</SelectItem>
              </SelectContent>
            </Select>

            {/* View Toggle */}
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selection Toolbar */}
      {selectedPlantIds.length > 0 && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectAll}
                  onCheckedChange={toggleSelectAll}
                  disabled={selectablePlants.length === 0}
                />
                <span className="font-medium text-gray-900">
                  {selectedPlantIds.length} planta(s) seleccionada(s)
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPlantIds([])}
                  className="bg-white"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkMeasurement}
                  disabled={isBulkOperating}
                  className="bg-white"
                >
                  <Ruler className="h-4 w-4 mr-2" />
                  Medir
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkMove}
                  disabled={isBulkOperating}
                  className="bg-white"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Mover
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleBulkHarvest}
                  disabled={isBulkOperating}
                  className="bg-amber-500 hover:bg-amber-600"
                >
                  <Leaf className="h-4 w-4 mr-2" />
                  {isBulkOperating ? 'Cosechando...' : 'Cosechar'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-500">
            Mostrando {filteredPlants?.length || 0} de {plants?.length || 0} plantas
          </p>
          {selectablePlants.length > 0 && selectedPlantIds.length === 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSelectAll}
              className="text-xs"
            >
              Seleccionar todas ({selectablePlants.length})
            </Button>
          )}
        </div>
        {(statusFilter !== 'all' || healthFilter !== 'all' || searchQuery) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStatusFilter('all');
              setHealthFilter('all');
              setSearchQuery('');
            }}
          >
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Plants Grid/List */}
      {filteredPlants && filteredPlants.length > 0 ? (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
              : 'space-y-2'
          }
        >
          {filteredPlants.map((plant) => {
            const isSelectable = plant.status === 'active';
            const isSelected = selectedPlantIds.includes(plant._id);

            return viewMode === 'grid' ? (
              <PlantCard
                key={plant._id}
                plant={plant}
                onClick={() => setSelectedPlantId(plant._id)}
                selected={isSelected}
                selectable={isSelectable}
                onSelectChange={isSelectable ? () => togglePlantSelection(plant._id) : undefined}
              />
            ) : (
              <Card
                key={plant._id}
                className="cursor-pointer hover:bg-gray-50"
              >
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isSelectable && (
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => togglePlantSelection(plant._id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                    <Leaf className="h-5 w-5 text-green-600" />
                    <span
                      className="font-mono font-medium"
                      onClick={() => setSelectedPlantId(plant._id)}
                    >
                      {plant.plant_code}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {plant.current_height_cm && (
                      <span className="text-sm text-gray-500">
                        {plant.current_height_cm} cm
                      </span>
                    )}
                    <Badge
                      variant="secondary"
                      className={
                        plant.health_status === 'healthy'
                          ? 'bg-green-100 text-green-700'
                          : plant.health_status === 'stressed'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                      }
                    >
                      {plant.health_status === 'healthy'
                        ? 'Sana'
                        : plant.health_status === 'stressed'
                          ? 'Estresada'
                          : 'Enferma'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Leaf className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">
              {plants?.length === 0
                ? 'No hay plantas registradas en este lote'
                : 'No hay plantas que coincidan con los filtros'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Plant Detail Drawer */}
      <PlantDetailDrawer
        plantId={selectedPlantId}
        onClose={() => setSelectedPlantId(null)}
        userId={userId}
      />
    </div>
  );
}
