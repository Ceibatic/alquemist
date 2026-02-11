'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { PageHeader } from '@/components/layout/page-header';
import { useUser } from '@/components/providers/user-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { ActivityTypeList } from '@/components/settings/activity-type-list';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ActivityTypesSettingsPage() {
  const { userId } = useUser();
  const user = useQuery(api.users.getUserById, userId ? { userId } : 'skip' as any);
  const companyId = user?.companyId;

  const types = useQuery(
    api.activityTypes.list,
    companyId ? { companyId } : 'skip' as any
  );

  const seedDefaults = useMutation(api.activityTypes.seedDefaults);
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeed = async () => {
    if (!companyId) return;
    setIsSeeding(true);
    try {
      const result = await seedDefaults({ companyId });
      toast.success(`${result.created} tipos de actividad creados`);
    } catch {
      toast.error('Error al cargar tipos predeterminados');
    } finally {
      setIsSeeding(false);
    }
  };

  if (!companyId) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Tipos de Actividad"
          breadcrumbs={[
            { label: 'Inicio', href: '/dashboard' },
            { label: 'Configuracion', href: '/settings' },
            { label: 'Tipos de Actividad' },
          ]}
        />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  const isEmpty = types !== undefined && types.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tipos de Actividad"
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Configuracion', href: '/settings' },
          { label: 'Tipos de Actividad' },
        ]}
        description="Configura los tipos de actividad disponibles para tu empresa"
      />

      {isEmpty && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sin tipos de actividad</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            Carga los tipos predeterminados para comenzar a configurar las actividades de tu empresa.
          </p>
          <Button onClick={handleSeed} disabled={isSeeding}>
            {isSeeding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Cargar tipos predeterminados
          </Button>
        </div>
      )}

      {types === undefined && (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}

      {types && types.length > 0 && (
        <ActivityTypeList types={types} companyId={companyId} />
      )}
    </div>
  );
}
