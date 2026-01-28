'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CultivarForm } from '@/components/cultivars/cultivar-form';
import { ArrowLeft } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { Id } from '@/convex/_generated/dataModel';
import type { CreateCustomCultivarInput } from '@/lib/validations/cultivar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function CultivarEditPage() {
  const router = useRouter();
  const params = useParams();
  const cultivarId = params.id as Id<'cultivars'>;
  const { toast } = useToast();

  // Fetch data
  const cultivar = useQuery(api.cultivars.get, { id: cultivarId });
  const cropTypes = useQuery(api.crops.getCropTypes, {});

  // Mutation
  const updateCultivar = useMutation(api.cultivars.update);

  if (!cultivar || !cropTypes) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center text-gray-500">
          <p>Cargando información del cultivar...</p>
        </div>
      </div>
    );
  }

  // Convert cultivar to form values - using direct fields now
  const defaultValues: Partial<CreateCustomCultivarInput> = {
    name: cultivar.name,
    crop_type_id: cultivar.crop_type_id,
    variety_type: cultivar.variety_type,
    genetic_lineage: cultivar.genetic_lineage,
    supplier_id: cultivar.supplier_id,
    flowering_time_days: cultivar.flowering_time_days,
    thc_min: cultivar.thc_min,
    thc_max: cultivar.thc_max,
    cbd_min: cultivar.cbd_min,
    cbd_max: cultivar.cbd_max,
    notes: cultivar.notes,
  };

  const handleSubmit = async (data: CreateCustomCultivarInput) => {
    try {
      await updateCultivar({
        id: cultivarId,
        name: data.name,
        varietyType: data.variety_type,
        geneticLineage: data.genetic_lineage,
        floweringTimeDays: data.flowering_time_days,
        supplierId: data.supplier_id ? (data.supplier_id as Id<'suppliers'>) : undefined,
        thcMin: data.thc_min,
        thcMax: data.thc_max,
        cbdMin: data.cbd_min,
        cbdMax: data.cbd_max,
        notes: data.notes,
      });
      toast({
        title: 'Cultivar actualizado',
        description: `${data.name} ha sido actualizado correctamente.`,
      });
      router.push(`/cultivars/${cultivarId}`);
    } catch (error) {
      console.error('Error updating cultivar:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo actualizar el cultivar. Intenta de nuevo.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={`Editar: ${cultivar.name}`}
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Cultivares', href: '/cultivars' },
          { label: cultivar.name, href: `/cultivars/${cultivarId}` },
          { label: 'Editar' },
        ]}
        action={
          <Button
            variant="outline"
            onClick={() => router.push(`/cultivars/${cultivarId}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
        }
      />

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Cultivar</CardTitle>
        </CardHeader>
        <CardContent>
          <CultivarForm
            cropTypes={cropTypes}
            onSubmit={handleSubmit}
            defaultValues={defaultValues}
          />
        </CardContent>
      </Card>
    </div>
  );
}
