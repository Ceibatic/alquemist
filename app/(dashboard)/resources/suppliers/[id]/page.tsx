'use client';

import { useRouter, useParams } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Mail, Phone, MapPin, Building2, Star, ArrowLeft } from 'lucide-react';
import { getCategoryLabel, getCategoryIcon, getCropSpecializationLabel } from '@/lib/constants/suppliers';
import { cn } from '@/lib/utils';

export default function ResourceSupplierDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const supplier = useQuery(api.suppliers.get, { id: id as Id<'suppliers'> });

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
          <Button onClick={() => router.push('/resources?tab=suppliers')} className="mt-4">
            Volver a Recursos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={supplier.name}
        icon={Building2}
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Recursos', href: '/resources?tab=suppliers' },
          { label: supplier.name },
        ]}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.push('/resources?tab=suppliers')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
            <Button
              onClick={() => router.push(`/resources/suppliers/${id}/edit`)}
              className="bg-amber-500 hover:bg-amber-600"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </div>
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
          <Badge variant="outline" className="text-sm border-blue-200 bg-blue-50 text-blue-700">
            Aprobado
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informacion Basica</h2>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Nombre Comercial</dt>
                <dd className="mt-1 text-sm text-gray-900">{supplier.name}</dd>
              </div>
              {supplier.legal_name && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Razon Social</dt>
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

          {/* Contact */}
          <div className="rounded-lg border bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Phone className="mr-2 h-5 w-5" />
              Informacion de Contacto
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
                      className="text-sm text-amber-600 hover:text-amber-700 flex items-center"
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      {supplier.primary_contact_email}
                    </a>
                  </dd>
                </div>
              )}
              {supplier.primary_contact_phone && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Telefono</dt>
                  <dd className="mt-1">
                    <a
                      href={`tel:${supplier.primary_contact_phone}`}
                      className="text-sm text-amber-600 hover:text-amber-700 flex items-center"
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
                Ubicacion
              </h2>
              <dl className="space-y-4">
                {supplier.address && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Direccion</dt>
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
                      <dd className="mt-1 text-sm text-gray-900">{supplier.administrative_division_1}</dd>
                    </div>
                  )}
                </div>
              </dl>
            </div>
          )}

          {supplier.notes && (
            <div className="rounded-lg border bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notas</h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{supplier.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-lg border bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Categorias de Productos</h2>
            <div className="flex flex-wrap gap-2">
              {supplier.product_categories.map((cat) => (
                <Badge key={cat} variant="outline" className="border-green-200 bg-green-50 text-green-700">
                  <span className="mr-1">{getCategoryIcon(cat)}</span>
                  {getCategoryLabel(cat)}
                </Badge>
              ))}
            </div>
          </div>

          {supplier.crop_specialization && supplier.crop_specialization.length > 0 && (
            <div className="rounded-lg border bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Especializacion de Cultivos</h2>
              <div className="flex flex-wrap gap-2">
                {supplier.crop_specialization.map((crop) => (
                  <Badge key={crop} variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                    {getCropSpecializationLabel(crop)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {(supplier.rating || supplier.delivery_reliability || supplier.quality_score) && (
            <div className="rounded-lg border bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Star className="mr-2 h-5 w-5" />
                Desempeno
              </h2>
              <dl className="space-y-3">
                {supplier.rating && (
                  <div className="flex justify-between items-center">
                    <dt className="text-sm font-medium text-gray-500">Calificacion</dt>
                    <dd className="text-sm font-semibold text-gray-900">{supplier.rating.toFixed(1)} / 5.0</dd>
                  </div>
                )}
                {supplier.delivery_reliability && (
                  <div className="flex justify-between items-center">
                    <dt className="text-sm font-medium text-gray-500">Confiabilidad</dt>
                    <dd className="text-sm font-semibold text-gray-900">{supplier.delivery_reliability}%</dd>
                  </div>
                )}
                {supplier.quality_score && (
                  <div className="flex justify-between items-center">
                    <dt className="text-sm font-medium text-gray-500">Calidad</dt>
                    <dd className="text-sm font-semibold text-gray-900">{supplier.quality_score}%</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {supplier.payment_terms && (
            <div className="rounded-lg border bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building2 className="mr-2 h-5 w-5" />
                Informacion Financiera
              </h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Terminos de Pago</dt>
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
