'use client';

import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { OccupancyBar } from '@/components/ui/occupancy-bar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { getContainerTypeLabel } from '@/lib/constants/containers';
import { AreaBatchesTab } from '@/components/areas/area-batches-tab';
import { AreaActivitiesTab } from '@/components/areas/area-activities-tab';
import { AreaInventoryTab } from '@/components/areas/area-inventory-tab';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Edit,
  Calendar,
  Thermometer,
  Droplets,
  Sun,
  FlaskConical,
  Package,
  Info,
  Layers,
  Activity,
  Box,
} from 'lucide-react';
import Link from 'next/link';
import { useFacility } from '@/components/providers/facility-provider';

const areaTypeLabels: Record<string, string> = {
  propagation: 'Propagacion',
  vegetative: 'Vegetativo',
  flowering: 'Floracion',
  drying: 'Secado',
  curing: 'Curado',
  storage: 'Almacenamiento',
  processing: 'Procesamiento',
  quarantine: 'Cuarentena',
};

interface EnvironmentalSpecs {
  temperature_min?: number;
  temperature_max?: number;
  humidity_min?: number;
  humidity_max?: number;
  light_hours?: number;
  ph_min?: number;
  ph_max?: number;
}

interface CapacityConfig {
  max_capacity?: number;
  container_type?: string;
  container_count?: number;
  plants_per_container?: number;
}

export default function AreaDetailPage() {
  const params = useParams();
  const areaId = params.id as Id<'areas'>;
  const { currentCompanyId } = useFacility();
  const companyId = currentCompanyId ?? '';

  const area = useQuery(api.areas.getById, { areaId });
  const cropTypes = useQuery(api.crops.getCropTypes, { includeInactive: false });

  if (area === undefined || cropTypes === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (area === null) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Area no encontrada"
          breadcrumbs={[
            { label: 'Inicio', href: '/dashboard' },
            { label: 'Areas', href: '/areas' },
            { label: 'No encontrada' },
          ]}
        />
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-gray-600">
              El area que buscas no existe o ha sido eliminada
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const capacityConfig = area.capacity_configurations as CapacityConfig | undefined;
  const maxCapacity = capacityConfig?.max_capacity || 0;
  const hasContainerConfig = !!capacityConfig?.container_type;
  const compatibleCrops = cropTypes.filter((ct) =>
    area.compatible_crop_type_ids.includes(ct._id)
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={area.name}
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Areas', href: '/areas' },
          { label: area.name },
        ]}
        action={
          <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white">
            <Link href={`/areas/${areaId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
        }
      />

      {/* Tabs */}
      <Tabs defaultValue="detail" className="w-full">
        <ScrollArea className="w-full">
          <TabsList className="inline-flex h-auto p-1 bg-gray-100 rounded-lg">
            <TabsTrigger
              value="detail"
              className="inline-flex items-center gap-2 px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
            >
              <Info className="h-4 w-4" />
              Detalle
            </TabsTrigger>
            <TabsTrigger
              value="batches"
              className="inline-flex items-center gap-2 px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
            >
              <Layers className="h-4 w-4" />
              Lotes
            </TabsTrigger>
            <TabsTrigger
              value="activities"
              className="inline-flex items-center gap-2 px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
            >
              <Activity className="h-4 w-4" />
              Actividades
            </TabsTrigger>
            <TabsTrigger
              value="inventory"
              className="inline-flex items-center gap-2 px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
            >
              <Box className="h-4 w-4" />
              Inventario
            </TabsTrigger>
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Detail Tab */}
        <TabsContent value="detail" className="space-y-6 mt-6">
          {/* General Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Informacion General</CardTitle>
                <StatusBadge status={area.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tipo de Area</p>
                  <p className="text-lg font-semibold">
                    {areaTypeLabels[area.area_type] || area.area_type}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600">Area Total</p>
                  <p className="text-lg font-semibold">
                    {area.total_area_m2 || 0} m²
                  </p>
                </div>

                {area.usable_area_m2 && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Area Util</p>
                    <p className="text-lg font-semibold">{area.usable_area_m2} m²</p>
                  </div>
                )}

                {area.length_meters && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Dimensiones</p>
                    <p className="text-lg font-semibold">
                      {area.length_meters} × {area.width_meters}
                      {area.height_meters && ` × ${area.height_meters}`} m
                    </p>
                  </div>
                )}
              </div>

              {/* Capacity */}
              {maxCapacity > 0 && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium text-gray-600 mb-3">
                    Capacidad y Ocupacion
                  </p>

                  {/* Container details if using container mode */}
                  {hasContainerConfig && capacityConfig && (
                    <div className="grid gap-4 md:grid-cols-3 mb-4">
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                        <Package className="h-5 w-5 text-gray-600 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-gray-500">
                            Tipo de Contenedor
                          </p>
                          <p className="text-base font-semibold">
                            {getContainerTypeLabel(capacityConfig.container_type!)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                        <div>
                          <p className="text-xs font-medium text-gray-500">
                            Cantidad
                          </p>
                          <p className="text-base font-semibold">
                            {capacityConfig.container_count?.toLocaleString()} contenedores
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                        <div>
                          <p className="text-xs font-medium text-gray-500">
                            Plantas por Contenedor
                          </p>
                          <p className="text-base font-semibold">
                            {capacityConfig.plants_per_container} plantas
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <OccupancyBar
                    current={area.current_occupancy}
                    max={maxCapacity}
                    showLabel
                  />

                  {!hasContainerConfig && (
                    <p className="text-xs text-gray-500 mt-2">
                      Capacidad manual: {maxCapacity.toLocaleString()} plantas
                    </p>
                  )}
                </div>
              )}

              {/* Notes */}
              {area.notes && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    Descripcion
                  </p>
                  <p className="text-sm text-gray-700">{area.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Compatible Crops */}
          <Card>
            <CardHeader>
              <CardTitle>Cultivos Compatibles</CardTitle>
            </CardHeader>
            <CardContent>
              {compatibleCrops.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {compatibleCrops.map((crop) => (
                    <span
                      key={crop._id}
                      className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700 border border-green-200"
                    >
                      {crop.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  No se han especificado cultivos compatibles
                </p>
              )}
            </CardContent>
          </Card>

          {/* Climate Control */}
          {area.climate_controlled && area.environmental_specs && (() => {
            const specs = area.environmental_specs as EnvironmentalSpecs;
            return (
              <Card>
                <CardHeader>
                  <CardTitle>Especificaciones Ambientales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {specs.temperature_min !== undefined && (
                      <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50">
                        <Thermometer className="h-5 w-5 text-gray-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Temperatura
                          </p>
                          <p className="text-lg font-semibold">
                            {specs.temperature_min}°C - {specs.temperature_max}°C
                          </p>
                        </div>
                      </div>
                    )}

                    {specs.humidity_min !== undefined && (
                      <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50">
                        <Droplets className="h-5 w-5 text-gray-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Humedad</p>
                          <p className="text-lg font-semibold">
                            {specs.humidity_min}% - {specs.humidity_max}%
                          </p>
                        </div>
                      </div>
                    )}

                    {specs.light_hours !== undefined && (
                      <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50">
                        <Sun className="h-5 w-5 text-gray-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Iluminacion
                          </p>
                          <p className="text-lg font-semibold">
                            {specs.light_hours} horas/dia
                          </p>
                        </div>
                      </div>
                    )}

                    {specs.ph_min !== undefined && (
                      <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50">
                        <FlaskConical className="h-5 w-5 text-gray-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">pH</p>
                          <p className="text-lg font-semibold">
                            {specs.ph_min} - {specs.ph_max}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })()}

          {/* Technical Features */}
          <Card>
            <CardHeader>
              <CardTitle>Caracteristicas Tecnicas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      area.climate_controlled ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                  <span className="text-sm">Control Climatico</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      area.lighting_controlled ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                  <span className="text-sm">Control de Iluminacion</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      area.irrigation_system ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                  <span className="text-sm">Sistema de Riego</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Fechas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Creada</p>
                    <p className="text-sm">
                      {new Date(area.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Ultima Actualizacion
                    </p>
                    <p className="text-sm">
                      {new Date(area.updated_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Batches Tab */}
        <TabsContent value="batches" className="mt-6">
          <AreaBatchesTab areaId={areaId} companyId={companyId} />
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities" className="mt-6">
          <AreaActivitiesTab areaId={areaId} companyId={companyId} />
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="mt-6">
          <AreaInventoryTab areaId={areaId} companyId={companyId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
