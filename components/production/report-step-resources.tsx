'use client';

import type { UseFormReturn } from 'react-hook-form';
import type { ActivityExecutionInput } from '@/lib/validations/activity-execution';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ResourceEditorInline } from '@/components/activities/resource-editor-inline';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReportStepResourcesProps {
  form: UseFormReturn<ActivityExecutionInput>;
  productNames: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ReportStepResources({
  form,
  productNames,
}: ReportStepResourcesProps) {
  const resources = form.watch('resources') ?? [];
  const batchIds = form.watch('batchIds') ?? [];
  const resourceDistribution = form.watch('resourceDistribution');
  const isMultiBatch = batchIds.length > 1;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Recursos a utilizar</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {resources.length} {resources.length === 1 ? 'recurso' : 'recursos'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ResourceEditorInline
            resources={resources}
            onChange={(updated) => form.setValue('resources', updated)}
            productNames={productNames}
          />

          {/* Multi-batch distribution */}
          {isMultiBatch && resources.length > 0 && (
            <div className="space-y-2 pt-4 border-t">
              <Label>Distribucion de recursos</Label>
              <Select
                value={resourceDistribution}
                onValueChange={(val) =>
                  form.setValue(
                    'resourceDistribution',
                    val as 'identical' | 'split_proportional',
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="identical">
                    Identico por lote
                  </SelectItem>
                  <SelectItem value="split_proportional">
                    Dividir proporcional
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {resourceDistribution === 'identical'
                  ? 'Misma cantidad de cada recurso para cada lote'
                  : 'La cantidad total se divide entre los lotes'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
