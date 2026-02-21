'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Check, Clock, Repeat, Shield } from 'lucide-react';
import type { ResourceItem } from './schedule-activity-wizard';

interface WizardStepSelectTemplateProps {
  companyId: Id<'companies'>;
  selectedTypeId: Id<'activity_types'> | null;
  selectedTemplateId: Id<'activity_templates'> | null;
  onTypeSelect: (typeId: Id<'activity_types'>) => void;
  onTemplateSelect: (
    templateId: Id<'activity_templates'>,
    templateName: string,
    resources: ResourceItem[],
    instructions: string | undefined,
    duration: number | undefined,
    qcTemplateId: Id<'quality_check_templates'> | undefined,
  ) => void;
}

const FREQUENCY_LABELS: Record<string, string> = {
  once: 'Una vez',
  daily: 'Diaria',
  weekly: 'Semanal',
  biweekly: 'Quincenal',
  monthly: 'Mensual',
  on_demand: 'A demanda',
  custom_days: 'Personalizada',
};

export function WizardStepSelectTemplate({
  companyId,
  selectedTypeId,
  selectedTemplateId,
  onTypeSelect,
  onTemplateSelect,
}: WizardStepSelectTemplateProps) {
  const activityTypes = useQuery(api.activityTypes.list, { companyId, status: 'active' });

  const templates = useQuery(
    api.activityTemplates.list,
    selectedTypeId
      ? { companyId, typeId: selectedTypeId, isActive: true }
      : 'skip'
  );

  // When a template is selected, fetch its full details including resources
  const selectedTemplate = useQuery(
    api.activityTemplates.getById,
    selectedTemplateId ? { templateId: selectedTemplateId } : 'skip'
  );

  const handleTemplateClick = (templateId: Id<'activity_templates'>) => {
    // Find the template in the list to get basic info immediately
    const tpl = templates?.find((t) => t._id === templateId);
    if (!tpl) return;

    // Map resources from template detail (if loaded) or empty
    const resources: ResourceItem[] = (selectedTemplate && selectedTemplate._id === templateId)
      ? (selectedTemplate.resources ?? []).map((r: any) => ({
          productId: r.product_id,
          templateResourceId: r._id,
          productName: r.productName ?? 'Producto',
          productCode: r.productCode ?? null,
          quantity: r.quantity,
          unitId: r.unit_id,
          unitSymbol: r.unitSymbol ?? undefined,
          quantityBasis: r.quantity_basis,
          direction: r.direction,
          applicationRate: r.application_rate,
          applicationMethod: r.application_method,
          isRequired: r.is_required,
          notes: r.notes,
        }))
      : [];

    onTemplateSelect(
      templateId,
      tpl.name,
      resources,
      tpl.description ?? undefined,
      tpl.estimated_duration_minutes ?? undefined,
      tpl.quality_check_template_id ?? undefined,
    );
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Selecciona el tipo de actividad y opcionalmente un template que pre-cargue la configuracion.
      </p>

      {/* Activity type selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Tipo de actividad *</label>
        <Select
          value={selectedTypeId ?? ''}
          onValueChange={(v) => onTypeSelect(v as Id<'activity_types'>)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar tipo..." />
          </SelectTrigger>
          <SelectContent>
            {activityTypes === undefined ? (
              <SelectItem value="_loading" disabled>Cargando...</SelectItem>
            ) : (
              activityTypes.map((type) => (
                <SelectItem key={type._id} value={type._id}>
                  {type.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Templates list */}
      {selectedTypeId && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Template de actividad (opcional)</label>

          {templates === undefined ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {[1, 2].map((i) => <Skeleton key={i} className="h-24" />)}
            </div>
          ) : templates.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No hay templates para este tipo. Puedes continuar sin template.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {templates.map((tpl) => {
                const isSelected = selectedTemplateId === tpl._id;
                return (
                  <Card
                    key={tpl._id}
                    className={cn(
                      'cursor-pointer transition-all hover:border-amber-300',
                      isSelected && 'border-amber-500 ring-1 ring-amber-500'
                    )}
                    onClick={() => handleTemplateClick(tpl._id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">{tpl.name}</p>
                          {tpl.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                              {tpl.description}
                            </p>
                          )}
                        </div>
                        {isSelected && (
                          <div className="h-5 w-5 rounded-full bg-amber-500 flex items-center justify-center shrink-0 ml-2">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Repeat className="h-3 w-3" />
                          {FREQUENCY_LABELS[tpl.frequency_type] ?? tpl.frequency_type}
                        </span>
                        {tpl.estimated_duration_minutes && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {tpl.estimated_duration_minutes} min
                          </span>
                        )}
                        {tpl.quality_check_template_id && (
                          <span className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            QC
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
