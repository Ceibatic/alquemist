'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { SupplierForm } from '@/components/suppliers/supplier-form';
import { CreateSupplierInput } from '@/lib/validations/supplier';

interface SupplierEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function SupplierEditPage({ params }: SupplierEditPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const updateSupplier = useMutation(api.suppliers.update);

  const handleSubmit = async (data: CreateSupplierInput) => {
    if (!companyId) return;

    try {
      setIsSubmitting(true);

      await updateSupplier({
        id: id as Id<'suppliers'>,
        companyId: companyId as any,
        name: data.name,
        legalName: data.legal_name,
        taxId: data.tax_id,
        businessType: data.business_type,
        primaryContactName: data.primary_contact_name,
        primaryContactEmail: data.primary_contact_email,
        primaryContactPhone: data.primary_contact_phone,
        address: data.address,
        city: data.city,
        administrativeDivision1: data.administrative_division_1,
        productCategories: data.product_categories,
        cropSpecialization: data.crop_specialization,
        paymentTerms: data.payment_terms,
        notes: data.notes,
      });

      toast.success('Proveedor actualizado exitosamente');
      router.push(`/suppliers/${id}`);
    } catch (error) {
      console.error('Error updating supplier:', error);
      toast.error(
        error instanceof Error ? error.message : 'Error al actualizar proveedor'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <h2 className="text-2xl font-bold text-gray-900">
            Proveedor no encontrado
          </h2>
          <p className="mt-2 text-gray-600">
            El proveedor que buscas no existe o no tienes acceso.
          </p>
          <Button onClick={() => router.push('/suppliers')} className="mt-4">
            Volver a Proveedores
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8">
      <PageHeader
        title={`Editar: ${supplier.name}`}
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Proveedores', href: '/suppliers' },
          { label: supplier.name, href: `/suppliers/${id}` },
          { label: 'Editar' },
        ]}
      />

      <div className="rounded-lg border bg-white p-6">
        <SupplierForm
          onSubmit={handleSubmit}
          onCancel={() => router.push(`/suppliers/${id}`)}
          initialData={{
            name: supplier.name,
            legal_name: supplier.legal_name,
            tax_id: supplier.tax_id,
            business_type: supplier.business_type as any,
            primary_contact_name: supplier.primary_contact_name,
            primary_contact_email: supplier.primary_contact_email,
            primary_contact_phone: supplier.primary_contact_phone,
            address: supplier.address,
            city: supplier.city,
            administrative_division_1: supplier.administrative_division_1,
            product_categories: supplier.product_categories as any,
            crop_specialization: supplier.crop_specialization as any,
            payment_terms: supplier.payment_terms,
            notes: supplier.notes,
            is_active: supplier.is_active,
            is_approved: supplier.is_approved,
          }}
          isSubmitting={isSubmitting}
          submitLabel="Guardar Cambios"
        />
      </div>
    </div>
  );
}
