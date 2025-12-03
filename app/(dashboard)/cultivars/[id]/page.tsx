'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Pencil, ArrowLeft, Star, CheckCircle } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { Id } from '@/convex/_generated/dataModel';
import { cn } from '@/lib/utils';

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

  // Determine if system cultivar
  const isSystem = cultivar?.origin_metadata !== undefined;

  if (!cultivar || !cropType) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center text-gray-500">
          <p>Cargando información del cultivar...</p>
        </div>
      </div>
    );
  }

  // Type-safe helpers to access characteristics
  const chars = cultivar.characteristics as any;
  const origin = cultivar.origin_metadata as any;
  const metrics = cultivar.performance_metrics as any;

  // Format variety type
  const formatVarietyType = (type?: string) => {
    if (!type) return 'N/A';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Format flowering time
  const getFloweringTimeWeeks = () => {
    const floweringDays = chars?.flowering_time_days;
    if (!floweringDays) return 'N/A';
    const weeks = Math.round(floweringDays / 7);
    return `${weeks} semanas (${floweringDays} días)`;
  };

  // Format difficulty
  const formatDifficulty = (difficulty?: string) => {
    if (!difficulty) return 'N/A';
    const labels: Record<string, string> = {
      easy: 'Fácil',
      medium: 'Medio',
      difficult: 'Difícil',
    };
    return labels[difficulty] || difficulty;
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
            {!isSystem && (
              <Button
                onClick={() => router.push(`/cultivars/${cultivar._id}/edit`)}
                className="bg-green-900 hover:bg-green-800"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Button>
            )}
          </div>
        }
      />

      {/* Status Badge */}
      <div className="flex gap-2">
        <Badge
          variant={isSystem ? 'default' : 'secondary'}
          className={cn(
            'flex items-center gap-1',
            isSystem
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-green-100 text-green-800'
          )}
        >
          {isSystem ? (
            <>
              <Star className="h-3 w-3" />
              Cultivar del Sistema
            </>
          ) : (
            <>
              <CheckCircle className="h-3 w-3" />
              Cultivar Personalizado
            </>
          )}
        </Badge>
        <Badge
          variant={cultivar.status === 'active' ? 'default' : 'secondary'}
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

            {origin?.breeder && (
              <div>
                <p className="text-sm font-medium text-gray-600">Criador</p>
                <p className="text-base text-gray-900">
                  {origin.breeder}
                </p>
              </div>
            )}

            {origin?.origin_country && (
              <div>
                <p className="text-sm font-medium text-gray-600">
                  País de Origen
                </p>
                <p className="text-base text-gray-900">
                  {origin.origin_country}
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
                {getFloweringTimeWeeks()}
              </p>
            </div>

            {chars?.growth_difficulty && (
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Dificultad de Cultivo
                </p>
                <p className="text-base text-gray-900">
                  {formatDifficulty(chars.growth_difficulty)}
                </p>
              </div>
            )}

            {chars?.yield_per_plant_g && (
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Rendimiento por Planta
                </p>
                <p className="text-base text-gray-900">
                  {chars.yield_per_plant_g}g
                </p>
              </div>
            )}

            {chars?.height_cm && (
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Altura Promedio
                </p>
                <p className="text-base text-gray-900">
                  {chars.height_cm} cm
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cannabinoids (Cannabis only) */}
      {cropType.name === 'Cannabis' && (
        <Card>
          <CardHeader>
            <CardTitle>Perfil de Cannabinoides</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {(chars?.thc_min !== undefined ||
                chars?.thc_max !== undefined) && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    Rango de THC
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-purple-100 text-purple-800">
                      {chars.thc_min !== undefined
                        ? `${chars.thc_min}%`
                        : '0%'}{' '}
                      -{' '}
                      {chars.thc_max !== undefined
                        ? `${chars.thc_max}%`
                        : 'N/A'}
                    </Badge>
                  </div>
                  {/* Visual bar */}
                  <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
                    <div
                      className="absolute h-full bg-purple-600 rounded-full"
                      style={{
                        left: `${chars.thc_min || 0}%`,
                        right: `${100 - (chars.thc_max || 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {(chars?.cbd_min !== undefined ||
                chars?.cbd_max !== undefined) && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    Rango de CBD
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800">
                      {chars.cbd_min !== undefined
                        ? `${chars.cbd_min}%`
                        : '0%'}{' '}
                      -{' '}
                      {chars.cbd_max !== undefined
                        ? `${chars.cbd_max}%`
                        : 'N/A'}
                    </Badge>
                  </div>
                  {/* Visual bar */}
                  <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
                    <div
                      className="absolute h-full bg-green-600 rounded-full"
                      style={{
                        left: `${chars.cbd_min || 0}%`,
                        right: `${100 - (chars.cbd_max || 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {chars?.terpene_profile && chars.terpene_profile.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">
                  Perfil de Terpenos
                </p>
                <div className="flex flex-wrap gap-2">
                  {chars.terpene_profile.map(
                    (terpene: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {terpene}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            )}

            {chars?.effects && chars.effects.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">
                  Efectos
                </p>
                <div className="flex flex-wrap gap-2">
                  {chars.effects.map((effect: string, index: number) => (
                    <Badge key={index} variant="outline">
                      {effect}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sensory Profile */}
      {(chars?.aroma || chars?.flavor) && (
        <Card>
          <CardHeader>
            <CardTitle>Perfil Sensorial</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {chars.aroma && (
              <div>
                <p className="text-sm font-medium text-gray-600">Aroma</p>
                <p className="text-base text-gray-900">
                  {chars.aroma}
                </p>
              </div>
            )}
            {chars.flavor && (
              <div>
                <p className="text-sm font-medium text-gray-600">Sabor</p>
                <p className="text-base text-gray-900">
                  {chars.flavor}
                </p>
              </div>
            )}
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
