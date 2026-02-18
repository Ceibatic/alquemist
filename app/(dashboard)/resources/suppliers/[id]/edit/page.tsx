'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { SupplierForm } from '@/components/suppliers/supplier-form';
import { CreateSupplierInput } from '@/lib/validations/supplier';
import { ArrowLeft } from 'lucide-react';

export default function ResourceSupplierEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supplier = useQuery(api.suppliers.get, { id: id as Id<'suppliers'> });
  const updateSupplier = useMutation(api.suppliers.update);

  const handleSubmit = async (data: CreateSupplierInput) => {
    if (!supplier) return;

    try {
      setIsSubmitting(true);

      await updateSupplier({
        id: id as Id<'suppliers'>,
        companyId: supplier.company_id,
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
      router.push(`/resources/suppliers/${id}`);
    } catch (error) {
      console.error('Error updating supplier:', error);
      toast.error(error instanceof Error ? error.message : 'Error al actualizar proveedor');
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
          <h2 className="text-2xl font-bold text-gray-900">Proveedor no encontrado</h2>
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
        title={`Editar: ${supplier.name}`}
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Recursos', href: '/resources?tab=suppliers' },
          { label: supplier.name, href: `/resources/suppliers/${id}` },
          { label: 'Editar' },
        ]}
        action={
          <Button variant="outline" onClick={() => router.push(`/resources/suppliers/${id}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        }
      />

      <div className="rounded-lg border bg-white p-6">
        <SupplierForm
          onSubmit={handleSubmit}
          onCancel={() => router.push(`/resources/suppliers/${id}`)}
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
