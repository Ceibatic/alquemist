'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { DynamicFormRenderer } from '@/components/quality-checks/dynamic-form-renderer';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ClipboardCheck } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ExecutionStepQualityProps {
  qcTemplateId: Id<'quality_check_templates'>;
  entityType: string;
  entityId: string;
  performedBy: Id<'users'>;
  companyId: Id<'companies'>;
  facilityId: Id<'facilities'>;
  onCompleted: () => void;
  onSkip: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ExecutionStepQuality({
  qcTemplateId,
  entityType,
  entityId,
  performedBy,
  companyId,
  facilityId,
  onCompleted,
  onSkip,
}: ExecutionStepQualityProps) {
  const qcTemplate = useQuery(api.qualityCheckTemplates.getById, {
    templateId: qcTemplateId,
  });

  const createQualityCheck = useMutation(api.qualityChecks.create);
  const completeQualityCheck = useMutation(api.qualityChecks.complete);
  const recordUsage = useMutation(api.qualityCheckTemplates.recordUsage);

  // QC form state
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [overallResult, setOverallResult] = useState<string>('pass');
  const [notes, setNotes] = useState('');
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');

  if (!qcTemplate) return null;

  const templateStructure = qcTemplate.template_structure as {
    version: string;
    sections: unknown[];
  } | null;

  async function handleSubmit() {
    const checkId = await createQualityCheck({
      templateId: qcTemplateId,
      entityType,
      entityId,
      performedBy,
      companyId,
      facilityId,
      formData,
      notes: notes.trim() || undefined,
    });

    await completeQualityCheck({
      checkId,
      formData,
      overallResult,
      notes: notes.trim() || undefined,
      followUpRequired: followUpRequired || undefined,
      followUpDate:
        followUpRequired && followUpDate
          ? new Date(followUpDate).getTime()
          : undefined,
    });

    await recordUsage({ templateId: qcTemplateId });
    onCompleted();
  }

  // Expose handleSubmit for parent to call
  // We use a data attribute pattern so the parent can call it
  return (
    <div className="space-y-4" data-qc-step>
      {/* QC Form Header */}
      <div className="flex items-center gap-2">
        <ClipboardCheck className="h-4 w-4 text-amber-600" />
        <h4 className="text-sm font-medium uppercase tracking-wide">
          {qcTemplate.name}
        </h4>
      </div>

      {/* Dynamic QC form */}
      {templateStructure && (
        <DynamicFormRenderer
          template={templateStructure as Parameters<typeof DynamicFormRenderer>[0]['template']}
          initialValues={formData as Record<string, string>}
          onChange={setFormData as (values: Record<string, string>) => void}
          showSubmitButton={false}
          className="space-y-4"
        />
      )}

      {/* Overall result */}
      <div className="space-y-2">
        <Label>Resultado general</Label>
        <Select value={overallResult} onValueChange={setOverallResult}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pass">Aprobado</SelectItem>
            <SelectItem value="conditional">Condicional</SelectItem>
            <SelectItem value="fail">Rechazado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label>Notas de calidad</Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Observaciones del control de calidad..."
          rows={3}
        />
      </div>

      {/* Follow-up */}
      <div className="flex items-center gap-2">
        <Checkbox
          checked={followUpRequired}
          onCheckedChange={(c) => setFollowUpRequired(!!c)}
        />
        <Label className="cursor-pointer">Requiere seguimiento</Label>
      </div>

      {followUpRequired && (
        <div className="space-y-2">
          <Label>Fecha de seguimiento</Label>
          <Input
            type="date"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
          />
        </div>
      )}

      {/* Hidden submit handler reference */}
      <input
        type="hidden"
        data-qc-submit
        onClick={async () => {
          await handleSubmit();
        }}
      />
    </div>
  );
}

// Export the submit handler type for parent access
ExecutionStepQuality.displayName = 'ExecutionStepQuality';
