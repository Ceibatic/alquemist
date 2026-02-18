'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { SupplierForm } from '@/components/suppliers/supplier-form';
import { CreateSupplierInput } from '@/lib/validations/supplier';
import { useFacility } from '@/components/providers/facility-provider';
import { Plus, ArrowLeft } from 'lucide-react';

export default function ResourceSupplierNewPage() {
  const router = useRouter();
  const { currentCompanyId } = useFacility();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createSupplier = useMutation(api.suppliers.create);

  const handleSubmit = async (data: CreateSupplierInput) => {
    if (!currentCompanyId) {
      toast.error('No se encontro la empresa');
      return;
    }

    try {
      setIsSubmitting(true);

      await createSupplier({
        companyId: currentCompanyId!,
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

      toast.success('Proveedor creado exitosamente');
      router.push('/resources?tab=suppliers');
    } catch (error) {
      console.error('Error creating supplier:', error);
      toast.error(error instanceof Error ? error.message : 'Error al crear proveedor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nuevo Proveedor"
        icon={Plus}
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Recursos', href: '/resources?tab=suppliers' },
          { label: 'Nuevo proveedor' },
        ]}
        action={
          <Button variant="outline" onClick={() => router.push('/resources?tab=suppliers')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        }
      />

      <div className="rounded-lg border bg-white p-6">
        <SupplierForm
          onSubmit={handleSubmit}
          onCancel={() => router.push('/resources?tab=suppliers')}
          isSubmitting={isSubmitting}
          submitLabel="Crear Proveedor"
        />
      </div>
    </div>
  );
}
