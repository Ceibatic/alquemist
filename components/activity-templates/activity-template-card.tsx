'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  MoreHorizontal,
  Copy,
  Archive,
  RotateCcw,
  Eye,
  Clock,
  Package,
  CheckSquare,
  Repeat,
} from 'lucide-react';
import { Doc } from '@/convex/_generated/dataModel';

const FREQUENCY_LABELS: Record<string, string> = {
  once: 'Una vez',
  daily: 'Diario',
  weekly: 'Semanal',
  biweekly: 'Bisemanal',
  monthly: 'Mensual',
  on_demand: 'A demanda',
  custom_days: 'Custom',
};

const PHASE_LABELS: Record<string, string> = {
  propagation: 'Propagacion',
  vegetative: 'Vegetativo',
  flowering: 'Floracion',
  harvest: 'Cosecha',
  drying: 'Secado',
  curing: 'Curado',
  post_harvest: 'Poscosecha',
  processing: 'Procesamiento',
  storage: 'Almacenamiento',
};

const PRIORITY_COLORS: Record<string, string> = {
  routine: 'bg-gray-100 text-gray-700',
  urgent: 'bg-amber-100 text-amber-700',
  critical: 'bg-red-100 text-red-700',
};

interface ActivityTemplateCardProps {
  template: Doc<'activity_templates'> & {
    resourceCount?: number;
    checklistCount?: number;
  };
  activityTypeName?: string;
  activityTypeColor?: string;
  onView: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
  onRestore: () => void;
}

export function ActivityTemplateCard({
  template,
  activityTypeName,
  activityTypeColor,
  onView,
  onDuplicate,
  onArchive,
  onRestore,
}: ActivityTemplateCardProps) {
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onView}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm truncate">{template.name}</h3>
            {template.code && (
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                {template.code}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(); }}>
                <Eye className="mr-2 h-4 w-4" /> Ver detalle
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate(); }}>
                <Copy className="mr-2 h-4 w-4" /> Duplicar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {template.is_active ? (
                <DropdownMenuItem
                  onClick={(e) => { e.stopPropagation(); onArchive(); }}
                  className="text-red-600"
                >
                  <Archive className="mr-2 h-4 w-4" /> Archivar
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRestore(); }}>
                  <RotateCcw className="mr-2 h-4 w-4" /> Restaurar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Type badge + priority */}
        <div className="flex flex-wrap gap-1.5">
          {activityTypeName && (
            <Badge variant="secondary" className="text-xs">
              {activityTypeName}
            </Badge>
          )}
          {template.default_priority && template.default_priority !== 'routine' && (
            <Badge className={`text-xs ${PRIORITY_COLORS[template.default_priority] ?? ''}`}>
              {template.default_priority}
            </Badge>
          )}
          {!template.is_active && (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              Archivado
            </Badge>
          )}
        </div>

        {/* Phases */}
        <div className="flex flex-wrap gap-1">
          {template.applicable_phases.map((phase) => (
            <Badge key={phase} variant="outline" className="text-xs">
              {PHASE_LABELS[phase] ?? phase}
            </Badge>
          ))}
        </div>

        {/* Description */}
        {template.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {template.description}
          </p>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Repeat className="h-3 w-3" />
            <span>{FREQUENCY_LABELS[template.frequency_type] ?? template.frequency_type}</span>
          </div>
          {template.estimated_duration_minutes && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{template.estimated_duration_minutes}min</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Package className="h-3 w-3" />
            <span>{template.resourceCount ?? 0} rec.</span>
          </div>
        </div>

        {/* Day range if applicable */}
        {(template.phase_day_start || template.phase_day_end) && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <CheckSquare className="h-3 w-3" />
            <span>
              Dias {template.phase_day_start ?? '?'} - {template.phase_day_end ?? 'fin'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
