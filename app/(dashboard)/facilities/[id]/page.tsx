'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Edit,
  Factory,
  MapPin,
  FileText,
  Map,
  BarChart3,
  Star,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FACILITY_TYPES, LICENSE_TYPES } from '@/lib/validations/facilities';

export default function FacilityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);

  const facilityId = params.id as string;

  useEffect(() => {
    // Get user data from cookies
    const userDataCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('user_data='));

    if (userDataCookie) {
      try {
        const userData = JSON.parse(
          decodeURIComponent(userDataCookie.split('=')[1])
        );
        setUserId(userData.userId);
        setCompanyId(userData.companyId);
      } catch (err) {
        console.error('Error loading user data:', err);
      }
    }
  }, []);

  // Fetch data
  const facility = useQuery(
    api.facilities.get,
    facilityId && companyId
      ? {
          id: facilityId as Id<'facilities'>,
          companyId: companyId as Id<'companies'>,
        }
      : 'skip'
  );

  const user = useQuery(
    api.users.getUserById,
    userId ? { userId: userId as Id<'users'> } : 'skip'
  );

  const cropTypes = useQuery(api.crops.getCropTypes, {});

  // Mutations
  const setCurrentFacility = useMutation(api.users.setCurrentFacility);

  const isCurrentFacility =
    user?.primary_facility_id === facilityId ||
    user?.accessibleFacilityIds?.includes(facilityId as Id<'facilities'>);

  const handleSwitchToFacility = async () => {
    if (!user || !facilityId) return;

    try {
      await setCurrentFacility({
        userId: userId as Id<'users'>,
        facilityId: facilityId as Id<'facilities'>,
      });

      toast({
        title: 'Instalación cambiada',
        description: 'Esta instalación es ahora tu instalación actual.',
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Error switching facility:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cambiar la instalación.',
        variant: 'destructive',
      });
    }
  };

  // Loading state
  if (!facility || !cropTypes) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  // Get enriched data
  const facilityCropTypes =
    facility.primary_crop_type_ids
      ?.map((id) => cropTypes.find((ct) => ct._id === id))
      .filter(Boolean) || [];

  const facilityTypeLabel =
    FACILITY_TYPES.find((t) => t.value === facility.facility_type)?.label ||
    facility.facility_type ||
    'N/A';

  const licenseTypeLabel =
    LICENSE_TYPES.find((t) => t.value === facility.license_type)?.label ||
    facility.license_type ||
    'N/A';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={facility.name}
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Instalaciones', href: '/facilities' },
          { label: facility.name },
        ]}
        action={
          <div className="flex items-center gap-2">
            {!isCurrentFacility && (
              <Button
                variant="outline"
                onClick={handleSwitchToFacility}
                className="border-green-600 text-green-700 hover:bg-green-50"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Cambiar a esta instalación
              </Button>
            )}
            <Button
              onClick={() => router.push(`/facilities/${facilityId}/edit`)}
              className="bg-green-900 hover:bg-green-800"
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </div>
        }
      />

      {/* Status and Type */}
      <div className="flex items-center gap-4">
        <StatusBadge status={facility.status} />
        {isCurrentFacility && (
          <Badge variant="default" className="bg-green-600">
            <Star className="mr-1 h-3 w-3" />
            INSTALACIÓN ACTUAL
          </Badge>
        )}
        <Badge variant="outline">{facilityTypeLabel}</Badge>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="location">Ubicación</TabsTrigger>
          <TabsTrigger value="license">Licencia</TabsTrigger>
          <TabsTrigger value="areas">Áreas</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Factory className="h-5 w-5" />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Nombre</p>
                  <p className="text-base mt-1">{facility.name}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Tipo de Instalación
                  </p>
                  <p className="text-base mt-1">{facilityTypeLabel}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Estado</p>
                  <div className="mt-1">
                    <StatusBadge status={facility.status} />
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Número de Licencia
                  </p>
                  <p className="text-base mt-1">{facility.license_number}</p>
                </div>
              </div>

              {/* Crop Types */}
              {facilityCropTypes.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">
                    Cultivos Primarios
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {facilityCropTypes.map((cropType: any) => (
                      <Badge key={cropType._id} variant="outline">
                        {cropType.display_name_es}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Location Tab */}
        <TabsContent value="location" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5" />
                Ubicación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {facility.address && (
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-gray-500">Dirección</p>
                    <p className="text-base mt-1">{facility.address}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Departamento
                  </p>
                  <p className="text-base mt-1">
                    {facility.administrative_division_1 || 'N/A'}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Municipio</p>
                  <p className="text-base mt-1">
                    {facility.administrative_division_2 || 'N/A'}
                  </p>
                </div>

                {facility.city && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Ciudad</p>
                    <p className="text-base mt-1">{facility.city}</p>
                  </div>
                )}

                {facility.postal_code && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Código Postal
                    </p>
                    <p className="text-base mt-1">{facility.postal_code}</p>
                  </div>
                )}
              </div>

              {/* GPS Coordinates */}
              {(facility.latitude || facility.longitude) && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-gray-500 mb-2">
                    Coordenadas GPS
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {facility.latitude && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Latitud
                        </p>
                        <p className="text-base mt-1 font-mono">
                          {facility.latitude.toFixed(6)}°
                        </p>
                      </div>
                    )}

                    {facility.longitude && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Longitud
                        </p>
                        <p className="text-base mt-1 font-mono">
                          {facility.longitude.toFixed(6)}°
                        </p>
                      </div>
                    )}

                    {facility.altitude_meters && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Altitud
                        </p>
                        <p className="text-base mt-1">
                          {facility.altitude_meters} m
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* License Tab */}
        <TabsContent value="license" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Información de Licencia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Número de Licencia
                  </p>
                  <p className="text-base mt-1">{facility.license_number}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Tipo de Licencia
                  </p>
                  <p className="text-base mt-1">{licenseTypeLabel}</p>
                </div>

                {facility.license_authority && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Autoridad Emisora
                    </p>
                    <p className="text-base mt-1">{facility.license_authority}</p>
                  </div>
                )}

                {facility.license_issued_date && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Fecha de Emisión
                    </p>
                    <p className="text-base mt-1">
                      {new Date(facility.license_issued_date).toLocaleDateString(
                        'es-CO'
                      )}
                    </p>
                  </div>
                )}

                {facility.license_expiry_date && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Fecha de Vencimiento
                    </p>
                    <p className="text-base mt-1">
                      {new Date(facility.license_expiry_date).toLocaleDateString(
                        'es-CO'
                      )}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Areas Tab */}
        <TabsContent value="areas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Áreas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {facility.total_area_m2 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Área Total
                    </p>
                    <p className="text-2xl font-bold mt-1">
                      {facility.total_area_m2.toLocaleString('es-CO')} m²
                    </p>
                  </div>
                )}

                {facility.cultivation_area_m2 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Área de Cultivo
                    </p>
                    <p className="text-2xl font-bold mt-1">
                      {facility.cultivation_area_m2.toLocaleString('es-CO')} m²
                    </p>
                  </div>
                )}

                {facility.canopy_area_m2 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Área de Dosel
                    </p>
                    <p className="text-2xl font-bold mt-1">
                      {facility.canopy_area_m2.toLocaleString('es-CO')} m²
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
