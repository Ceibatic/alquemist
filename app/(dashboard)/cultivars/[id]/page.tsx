'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pencil, ArrowLeft, CheckCircle } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { Id } from '@/convex/_generated/dataModel';

export default function CultivarDetailPage() {
  const router = useRouter();
  const params = useParams();
  const cultivarId = params.id as Id<'cultivars'>;

  // Fetch data
  const cultivar = useQuery(api.cultivars.get, { id: cultivarId });
  const cropType = useQuery(
    api.crops.getCropTypeById,
    cultivar ? { id: cultivar.crop_type_id } : 'skip'
  );

  if (!cultivar || !cropType) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center text-gray-500">
          <p>Cargando información del cultivar...</p>
        </div>
      </div>
    );
  }

  // Type-safe helpers
  const metrics = cultivar.performance_metrics as Record<string, number> | undefined;

  // Format variety type
  const formatVarietyType = (type?: string) => {
    if (!type) return 'N/A';
    const labels: Record<string, string> = {
      indica: 'Indica',
      sativa: 'Sativa',
      hybrid: 'Híbrida',
      ruderalis: 'Ruderalis',
    };
    return labels[type] || type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Format flowering time
  const getFloweringTimeDisplay = () => {
    const floweringDays = cultivar.flowering_time_days;
    if (!floweringDays) return 'N/A';
    const weeks = Math.round(floweringDays / 7);
    return `${weeks} semanas (${floweringDays} días)`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={cultivar.name}
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Cultivares', href: '/cultivars' },
          { label: cultivar.name },
        ]}
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push('/cultivars')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
            <Button
              onClick={() => router.push(`/cultivars/${cultivar._id}/edit`)}
              className="bg-green-900 hover:bg-green-800"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </div>
        }
      />

      {/* Status Badge */}
      <div className="flex gap-2">
        <Badge className="flex items-center gap-1 bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3" />
          Cultivar Personalizado
        </Badge>
        <Badge
          className={
            cultivar.status === 'active'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }
        >
          {cultivar.status === 'active' ? 'Activo' : 'Discontinuado'}
        </Badge>
      </div>

      {/* Main Information */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Tipo de Cultivo
              </p>
              <p className="text-base text-gray-900">
                {cropType.display_name_es}
              </p>
            </div>

            {cultivar.variety_type && (
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Tipo de Variedad
                </p>
                <p className="text-base text-gray-900">
                  {formatVarietyType(cultivar.variety_type)}
                </p>
              </div>
            )}

            {cultivar.genetic_lineage && (
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Linaje Genético
                </p>
                <p className="text-base text-gray-900">
                  {cultivar.genetic_lineage}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Characteristics */}
        <Card>
          <CardHeader>
            <CardTitle>Características</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Tiempo de Floración
              </p>
              <p className="text-base text-gray-900">
                {getFloweringTimeDisplay()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cannabinoids (Cannabis only) */}
      {cropType.name === 'Cannabis' &&
        (cultivar.thc_min !== undefined ||
          cultivar.thc_max !== undefined ||
          cultivar.cbd_min !== undefined ||
          cultivar.cbd_max !== undefined) && (
          <Card>
            <CardHeader>
              <CardTitle>Perfil de Cannabinoides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {(cultivar.thc_min !== undefined ||
                  cultivar.thc_max !== undefined) && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">
                      Rango de THC
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-purple-100 text-purple-800">
                        {cultivar.thc_min !== undefined
                          ? `${cultivar.thc_min}%`
                          : '0%'}{' '}
                        -{' '}
                        {cultivar.thc_max !== undefined
                          ? `${cultivar.thc_max}%`
                          : 'N/A'}
                      </Badge>
                    </div>
                    {/* Visual bar */}
                    <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
                      <div
                        className="absolute h-full bg-purple-600 rounded-full"
                        style={{
                          left: `${cultivar.thc_min || 0}%`,
                          right: `${100 - (cultivar.thc_max || 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {(cultivar.cbd_min !== undefined ||
                  cultivar.cbd_max !== undefined) && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">
                      Rango de CBD
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">
                        {cultivar.cbd_min !== undefined
                          ? `${cultivar.cbd_min}%`
                          : '0%'}{' '}
                        -{' '}
                        {cultivar.cbd_max !== undefined
                          ? `${cultivar.cbd_max}%`
                          : 'N/A'}
                      </Badge>
                    </div>
                    {/* Visual bar */}
                    <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
                      <div
                        className="absolute h-full bg-green-600 rounded-full"
                        style={{
                          left: `${cultivar.cbd_min || 0}%`,
                          right: `${100 - (cultivar.cbd_max || 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Notes */}
      {cultivar.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">
              {cultivar.notes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Métricas de Rendimiento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Lotes Totales
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics?.total_batches || 0}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Rendimiento Promedio
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics?.average_yield
                  ? `${metrics.average_yield}g`
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Tasa de Éxito</p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics?.success_rate
                  ? `${metrics.success_rate}%`
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Calificación de Calidad
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics?.quality_rating
                  ? `${metrics.quality_rating}/5`
                  : 'N/A'}
              </p>
            </div>
          </div>
          {!metrics?.total_batches && (
            <p className="text-sm text-gray-500 mt-4">
              Las métricas se generarán automáticamente a medida que se
              completen lotes con este cultivar.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
