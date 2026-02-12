'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ActivityReportSheet } from '@/components/activities/activity-report-sheet';
import { useFacility } from '@/components/providers/facility-provider';
import { PhaseCard } from './phase-card';
import { Layers } from 'lucide-react';

interface AreaProductionTabProps {
  areaId: Id<'areas'>;
}

export function AreaProductionTab({ areaId }: AreaProductionTabProps) {
  const { currentCompanyId } = useFacility();
  const phaseGroups = useQuery(api.batches.listByAreaGroupedByPhase, { areaId });

  // Template selector and report sheet state
  const [templateSelectorOpen, setTemplateSelectorOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [reportSheetOpen, setReportSheetOpen] = useState(false);
  const [reportContext, setReportContext] = useState<{
    templateId: Id<'activity_templates'>;
    batchId: Id<'batches'>;
    cropPhase: string;
  } | null>(null);
  const [pendingBatch, setPendingBatch] = useState<{
    batchId: Id<'batches'>;
    cropPhase: string;
  } | null>(null);

  const activityTemplates = useQuery(
    api.activityTemplates.list,
    currentCompanyId ? { companyId: currentCompanyId, isActive: true } : 'skip' as any
  );

  const handleReportBatch = (batch: { _id: Id<'batches'> }, phase: string) => {
    setPendingBatch({ batchId: batch._id, cropPhase: phase });
    setSelectedTemplateId('');
    setTemplateSelectorOpen(true);
  };

  const handleTemplateSelectorConfirm = () => {
    if (!selectedTemplateId || !pendingBatch) return;
    setReportContext({
      templateId: selectedTemplateId as Id<'activity_templates'>,
      batchId: pendingBatch.batchId,
      cropPhase: pendingBatch.cropPhase,
    });
    setTemplateSelectorOpen(false);
    setReportSheetOpen(true);
  };

  if (phaseGroups === undefined) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (phaseGroups.length === 0) {
    return (
      <EmptyState
        icon={Layers}
        title="Sin produccion activa"
        description="No hay lotes activos en esta area. Los lotes agrupados por fase apareceran aqui."
      />
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {phaseGroups.map((group) => (
          <PhaseCard
            key={group.phase}
            phase={group.phase}
            batchCount={group.batchCount}
            totalPlants={group.totalPlants}
            avgDays={group.avgDays}
            batches={group.batches}
            areaId={areaId}
            onReportBatch={handleReportBatch}
          />
        ))}
      </div>

      {/* Template selector dialog */}
      <Dialog open={templateSelectorOpen} onOpenChange={setTemplateSelectorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Seleccionar template de actividad</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Template *</Label>
              <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar template..." />
                </SelectTrigger>
                <SelectContent>
                  {(activityTemplates ?? []).map((t) => (
                    <SelectItem key={t._id} value={t._id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTemplateSelectorOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleTemplateSelectorConfirm}
              disabled={!selectedTemplateId}
              className="bg-amber-500 hover:bg-amber-600"
            >
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activity Report Sheet */}
      {reportContext && (
        <ActivityReportSheet
          open={reportSheetOpen}
          onOpenChange={setReportSheetOpen}
          activityTemplateId={reportContext.templateId}
          entityType="batch"
          entityId={reportContext.batchId}
          areaId={areaId}
          batchId={reportContext.batchId}
          cropPhase={reportContext.cropPhase}
          onCompleted={() => {
            setReportSheetOpen(false);
            setReportContext(null);
          }}
        />
      )}
    </>
  );
}
