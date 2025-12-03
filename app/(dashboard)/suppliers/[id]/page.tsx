'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Mail, Phone, MapPin, Building2, Star } from 'lucide-react';
import { getCategoryLabel, getCategoryIcon, getCropSpecializationLabel } from '@/lib/constants/suppliers';
import { cn } from '@/lib/utils';

interface SupplierDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function SupplierDetailPage({ params }: SupplierDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string | null>(null);

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
        setCompanyId(userData.companyId);
      } catch (err) {
        console.error('Error al cargar datos del usuario:', err);
      }
    }
  }, []);

  const supplier = useQuery(
    api.suppliers.get,
    companyId && id
      ? {
          id: id as Id<'suppliers'>,
          companyId: companyId as any,
        }
      : 'skip'
  );

  if (supplier === undefined) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-green-600" />
          <p className="text-sm text-gray-600">Cargando proveedor...</p>
        </div>
      </div>
    );
  }

  if (supplier === null) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Proveedor no encontrado</h2>
          <p className="mt-2 text-gray-600">El proveedor que buscas no existe o no tienes acceso.</p>
          <Button
            onClick={() => router.push('/suppliers')}
            className="mt-4"
          >
            Volver a Proveedores
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8">
      <PageHeader
        title={supplier.name}
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Proveedores', href: '/suppliers' },
          { label: supplier.name },
        ]}
        action={
          <Button
            onClick={() => router.push(`/suppliers/${id}/edit`)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Button>
        }
      />

      {/* Status Badges */}
      <div className="flex gap-2">
        <Badge
          variant="outline"
          className={cn(
            'text-sm',
            supplier.is_active
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-gray-200 bg-gray-50 text-gray-700'
          )}
        >
          {supplier.is_active ? 'Activo' : 'Inactivo'}
        </Badge>
        {supplier.is_approved && (
          <Badge
            variant="outline"
            className="text-sm border-blue-200 bg-blue-50 text-blue-700"
          >
            Aprobado
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="rounded-lg border bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Información Básica
            </h2>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Nombre Comercial</dt>
                <dd className="mt-1 text-sm text-gray-900">{supplier.name}</dd>
              </div>
              {supplier.legal_name && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Razón Social</dt>
                  <dd className="mt-1 text-sm text-gray-900">{supplier.legal_name}</dd>
                </div>
              )}
              {supplier.tax_id && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">NIT</dt>
                  <dd className="mt-1 text-sm text-gray-900">{supplier.tax_id}</dd>
                </div>
              )}
              {supplier.business_type && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Tipo de Empresa</dt>
                  <dd className="mt-1 text-sm text-gray-900">{supplier.business_type}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Contact Information */}
          <div className="rounded-lg border bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Phone className="mr-2 h-5 w-5" />
              Información de Contacto
            </h2>
            <dl className="space-y-4">
              {supplier.primary_contact_name && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Contacto Principal</dt>
                  <dd className="mt-1 text-sm text-gray-900">{supplier.primary_contact_name}</dd>
                </div>
              )}
              {supplier.primary_contact_email && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1">
                    <a
                      href={`mailto:${supplier.primary_contact_email}`}
                      className="text-sm text-green-600 hover:text-green-700 flex items-center"
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      {supplier.primary_contact_email}
                    </a>
                  </dd>
                </div>
              )}
              {supplier.primary_contact_phone && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Teléfono</dt>
                  <dd className="mt-1">
                    <a
                      href={`tel:${supplier.primary_contact_phone}`}
                      className="text-sm text-green-600 hover:text-green-700 flex items-center"
                    >
                      <Phone className="mr-2 h-4 w-4" />
                      {supplier.primary_contact_phone}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Location */}
          {(supplier.address || supplier.city || supplier.administrative_division_1) && (
            <div className="rounded-lg border bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                Ubicación
              </h2>
              <dl className="space-y-4">
                {supplier.address && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Dirección</dt>
                    <dd className="mt-1 text-sm text-gray-900">{supplier.address}</dd>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  {supplier.city && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Ciudad</dt>
                      <dd className="mt-1 text-sm text-gray-900">{supplier.city}</dd>
                    </div>
                  )}
                  {supplier.administrative_division_1 && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Departamento</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {supplier.administrative_division_1}
                      </dd>
                    </div>
                  )}
                </div>
              </dl>
            </div>
          )}

          {/* Notes */}
          {supplier.notes && (
            <div className="rounded-lg border bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notas</h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{supplier.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Product Categories */}
          <div className="rounded-lg border bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Categorías de Productos
            </h2>
            <div className="flex flex-wrap gap-2">
              {supplier.product_categories.map((cat) => (
                <Badge
                  key={cat}
                  variant="outline"
                  className="border-green-200 bg-green-50 text-green-700"
                >
                  <span className="mr-1">{getCategoryIcon(cat)}</span>
                  {getCategoryLabel(cat)}
                </Badge>
              ))}
            </div>
          </div>

          {/* Crop Specialization */}
          {supplier.crop_specialization && supplier.crop_specialization.length > 0 && (
            <div className="rounded-lg border bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Especialización de Cultivos
              </h2>
              <div className="flex flex-wrap gap-2">
                {supplier.crop_specialization.map((crop) => (
                  <Badge
                    key={crop}
                    variant="outline"
                    className="border-blue-200 bg-blue-50 text-blue-700"
                  >
                    {getCropSpecializationLabel(crop)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Performance Metrics */}
          {(supplier.rating || supplier.delivery_reliability || supplier.quality_score) && (
            <div className="rounded-lg border bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Star className="mr-2 h-5 w-5" />
                Desempeño
              </h2>
              <dl className="space-y-3">
                {supplier.rating && (
                  <div className="flex justify-between items-center">
                    <dt className="text-sm font-medium text-gray-500">Calificación</dt>
                    <dd className="text-sm font-semibold text-gray-900">
                      {supplier.rating.toFixed(1)} / 5.0
                    </dd>
                  </div>
                )}
                {supplier.delivery_reliability && (
                  <div className="flex justify-between items-center">
                    <dt className="text-sm font-medium text-gray-500">Confiabilidad</dt>
                    <dd className="text-sm font-semibold text-gray-900">
                      {supplier.delivery_reliability}%
                    </dd>
                  </div>
                )}
                {supplier.quality_score && (
                  <div className="flex justify-between items-center">
                    <dt className="text-sm font-medium text-gray-500">Calidad</dt>
                    <dd className="text-sm font-semibold text-gray-900">
                      {supplier.quality_score}%
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Financial */}
          {supplier.payment_terms && (
            <div className="rounded-lg border bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building2 className="mr-2 h-5 w-5" />
                Información Financiera
              </h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Términos de Pago</dt>
                  <dd className="mt-1 text-sm text-gray-900">{supplier.payment_terms}</dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
