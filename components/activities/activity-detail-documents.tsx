'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Download, File } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ActivityDetailDocumentsProps {
  activityId: Id<'activities'>;
}

const typeLabels: Record<string, string> = {
  document: 'Documento',
  certificate: 'Certificado',
  video: 'Video',
  lab_result: 'Resultado laboratorio',
  other: 'Otro',
};

export function ActivityDetailDocuments({
  activityId,
}: ActivityDetailDocumentsProps) {
  const attachments = useQuery(api.activityAttachments.listByActivity, {
    activityId,
  });

  if (attachments === undefined) {
    return <Skeleton className="h-48 w-full" />;
  }

  // Filter out photos (handled by the Fotos tab)
  const documents = attachments.filter(
    (att: any) => att.type !== 'photo' && att.type !== 'image'
  );

  if (documents.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="Sin documentos adjuntos"
        description="No hay documentos, certificados u otros archivos adjuntos en esta actividad."
      />
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((doc: any) => (
        <Card key={doc._id}>
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <File className="h-5 w-5 text-gray-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {doc.file_name ?? doc.title ?? 'Documento'}
                </p>
                <p className="text-xs text-gray-500">
                  {typeLabels[doc.type] ?? doc.type}
                  {doc.file_size
                    ? ` — ${(doc.file_size / 1024).toFixed(0)} KB`
                    : ''}
                </p>
              </div>
            </div>
            {doc.url && (
              <Button variant="ghost" size="sm" asChild>
                <a href={doc.url} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4" />
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
