'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreVertical,
  Eye,
  Pencil,
  Copy,
  Archive,
  Leaf,
  ClipboardCheck,
  Brain,
  BarChart3,
  Clock,
} from 'lucide-react';

interface QCTemplateCardProps {
  template: {
    _id: string;
    name: string;
    cropTypeName?: string | null;
    procedure_type?: string;
    inspection_level?: string;
    regulatory_requirement?: boolean;
    compliance_standard?: string;
    ai_assisted?: boolean;
    ai_analysis_types?: string[];
    applicable_stages?: string[];
    frequency_recommendation?: string;
    usage_count: number;
    average_completion_time_minutes?: number;
    status: string;
  };
  onView: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onArchive?: () => void;
}

const procedureLabels: Record<string, string> = {
  health_check: 'Salud de Planta',
  pest_inspection: 'Inspeccion de Plagas',
  nutrient_check: 'Nutricion',
  harvest_quality: 'Calidad Cosecha',
  environmental: 'Ambiental',
  compliance: 'Cumplimiento',
};

const levelLabels: Record<string, string> = {
  basic: 'Basico',
  standard: 'Estandar',
  detailed: 'Detallado',
  comprehensive: 'Completo',
};

const stageLabels: Record<string, string> = {
  propagation: 'Propagacion',
  vegetative: 'Vegetativo',
  flowering: 'Floracion',
  harvest: 'Cosecha',
  drying: 'Secado',
  curing: 'Curado',
};

export function QCTemplateCard({
  template,
  onView,
  onEdit,
  onDuplicate,
  onArchive,
}: QCTemplateCardProps) {
  return (
    <Card
      className="group cursor-pointer hover:shadow-md transition-shadow"
      onClick={onView}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-base truncate">{template.name}</h3>
              {template.ai_assisted && (
                <Badge variant="outline" className="gap-1 text-xs text-purple-600 border-purple-200">
                  <Brain className="h-3 w-3" />
                  AI
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Leaf className="h-3.5 w-3.5" />
              <span>{template.cropTypeName || 'Todos los cultivos'}</span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(); }}>
                <Eye className="mr-2 h-4 w-4" />
                Ver Detalle
              </DropdownMenuItem>
              {onEdit && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              )}
              {onDuplicate && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate(); }}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicar
                </DropdownMenuItem>
              )}
              {onArchive && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => { e.stopPropagation(); onArchive(); }}
                    className="text-red-600"
                  >
                    <Archive className="mr-2 h-4 w-4" />
                    Archivar
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Badges Row */}
        <div className="flex flex-wrap gap-1.5">
          {template.procedure_type && (
            <Badge variant="secondary" className="text-xs">
              {procedureLabels[template.procedure_type] || template.procedure_type}
            </Badge>
          )}
          {template.inspection_level && (
            <Badge variant="outline" className="text-xs">
              {levelLabels[template.inspection_level] || template.inspection_level}
            </Badge>
          )}
          {template.regulatory_requirement && (
            <Badge className="text-xs bg-blue-100 text-blue-700">
              Regulatorio
            </Badge>
          )}
        </div>

        {/* Applicable Stages */}
        {template.applicable_stages && template.applicable_stages.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {template.applicable_stages.slice(0, 3).map((stage) => (
              <Badge key={stage} variant="outline" className="text-xs">
                {stageLabels[stage] || stage}
              </Badge>
            ))}
            {template.applicable_stages.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{template.applicable_stages.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <BarChart3 className="h-3.5 w-3.5" />
            </div>
            <p className="text-sm font-medium">{template.usage_count} usos</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Clock className="h-3.5 w-3.5" />
            </div>
            <p className="text-sm font-medium">
              {template.average_completion_time_minutes
                ? `${template.average_completion_time_minutes} min`
                : '-'}
            </p>
          </div>
        </div>

        {/* AI Analysis Types */}
        {template.ai_assisted && template.ai_analysis_types && template.ai_analysis_types.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-purple-600 pt-2 border-t">
            <Brain className="h-3.5 w-3.5" />
            <span>
              {template.ai_analysis_types.join(', ')}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
