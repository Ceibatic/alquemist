'use client';

import { use } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { PageHeader } from '@/components/layout/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ActivityTemplateWizard } from '@/components/activity-templates/activity-template-wizard';
import { ResourceEditor } from '@/components/activity-templates/resource-editor';
import { ChecklistEditor } from '@/components/activity-templates/checklist-editor';
import { useRouter } from 'next/navigation';
import { FileText, ArrowLeft } from 'lucide-react';

export default function ActivityTemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const isNew = id === 'new';

  const template = useQuery(
    api.activityTemplates.getById,
    !isNew ? { templateId: id as Id<'activity_templates'> } : 'skip' as any
  );

  // Loading
  if (!isNew && template === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!isNew && template === null) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <h2 className="text-lg font-semibold">Template no encontrado</h2>
        <Button variant="link" onClick={() => router.push('/templates?tab=activities')}>
          Volver a templates
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isNew ? 'Crear Template de Actividad' : `Editar: ${template?.name ?? ''}`}
        icon={FileText}
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Templates', href: '/templates?tab=activities' },
          { label: isNew ? 'Nuevo' : (template?.name ?? '') },
        ]}
        action={
          <Button variant="outline" onClick={() => router.push('/templates?tab=activities')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        }
      />

      <ActivityTemplateWizard
        templateId={isNew ? undefined : (id as Id<'activity_templates'>)}
        isNew={isNew}
      />

      {/* Resources and Checklist — only for editing existing templates */}
      {!isNew && (
        <div className="space-y-6">
          <ResourceEditor templateId={id as Id<'activity_templates'>} />
          <ChecklistEditor templateId={id as Id<'activity_templates'>} />
        </div>
      )}
    </div>
  );
}
