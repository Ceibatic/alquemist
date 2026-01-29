'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Bug,
  Virus,
  Droplet,
  CloudRain,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Plus,
} from 'lucide-react';

interface Detection {
  commonName: string;
  scientificName?: string;
  category: 'pest' | 'disease' | 'deficiency' | 'environmental';
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  affectedArea?: string;
  recommendations?: string[];
}

interface PestDetectionResultProps {
  result: {
    detections: Detection[];
    overallHealth: 'healthy' | 'minor_issues' | 'moderate_issues' | 'severe_issues';
    notes?: string;
  };
  onCreatePestRecord?: (detection: Detection) => void;
  className?: string;
}

const categoryConfig = {
  pest: {
    icon: Bug,
    label: 'Plaga',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  disease: {
    icon: Virus,
    label: 'Enfermedad',
    color: 'bg-red-100 text-red-800 border-red-200',
  },
  deficiency: {
    icon: Droplet,
    label: 'Deficiencia',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  environmental: {
    icon: CloudRain,
    label: 'Ambiental',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
  },
};

const severityConfig = {
  low: {
    label: 'Baja',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  },
  medium: {
    label: 'Media',
    color: 'bg-orange-100 text-orange-800 border-orange-300',
  },
  high: {
    label: 'Alta',
    color: 'bg-red-100 text-red-800 border-red-300',
  },
};

const healthConfig = {
  healthy: {
    label: 'Saludable',
    color: 'bg-green-100 text-green-800 border-green-300',
    icon: CheckCircle,
  },
  minor_issues: {
    label: 'Problemas Menores',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    icon: AlertTriangle,
  },
  moderate_issues: {
    label: 'Problemas Moderados',
    color: 'bg-orange-100 text-orange-800 border-orange-300',
    icon: AlertTriangle,
  },
  severe_issues: {
    label: 'Problemas Severos',
    color: 'bg-red-100 text-red-800 border-red-300',
    icon: AlertTriangle,
  },
};

function DetectionCard({
  detection,
  onCreatePestRecord,
}: {
  detection: Detection;
  onCreatePestRecord?: (detection: Detection) => void;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const categoryInfo = categoryConfig[detection.category];
  const severityInfo = severityConfig[detection.severity];
  const CategoryIcon = categoryInfo.icon;

  const canCreateRecord = detection.confidence > 80 && onCreatePestRecord;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <CategoryIcon className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">{detection.commonName}</CardTitle>
            </div>
            {detection.scientificName && (
              <CardDescription className="italic">
                {detection.scientificName}
              </CardDescription>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Badge className={cn('border', categoryInfo.color)}>
              {categoryInfo.label}
            </Badge>
            <Badge className={cn('border', severityInfo.color)}>
              Severidad: {severityInfo.label}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Confianza</span>
            <span className="text-muted-foreground">{detection.confidence}%</span>
          </div>
          <Progress
            value={detection.confidence}
            className={cn(
              detection.confidence >= 90 && 'bg-green-100',
              detection.confidence >= 70 &&
                detection.confidence < 90 &&
                'bg-amber-100',
              detection.confidence < 70 && 'bg-red-100'
            )}
          />
        </div>

        {detection.affectedArea && (
          <div className="space-y-1">
            <p className="text-sm font-medium">Área Afectada</p>
            <p className="text-sm text-muted-foreground">{detection.affectedArea}</p>
          </div>
        )}

        {detection.recommendations && detection.recommendations.length > 0 && (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <div className="space-y-2">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-between p-0 h-auto font-medium text-sm hover:bg-transparent"
                >
                  <span>Recomendaciones ({detection.recommendations.length})</span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="space-y-2 pt-2">
                  <Separator />
                  <ul className="space-y-2 pl-4">
                    {detection.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground list-disc">
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        )}

        {canCreateRecord && (
          <>
            <Separator />
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => onCreatePestRecord(detection)}
            >
              <Plus className="h-4 w-4" />
              Crear Registro de Plaga
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function PestDetectionResult({
  result,
  onCreatePestRecord,
  className,
}: PestDetectionResultProps) {
  const healthInfo = healthConfig[result.overallHealth];
  const HealthIcon = healthInfo.icon;

  if (result.detections.length === 0) {
    return (
      <Card className={cn('border-green-200 bg-green-50/50', className)}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-100 p-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-green-900">Sin Problemas Detectados</CardTitle>
              <CardDescription className="text-green-700">
                El análisis no encontró plagas, enfermedades o deficiencias
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        {result.notes && (
          <CardContent>
            <p className="text-sm text-green-800">{result.notes}</p>
          </CardContent>
        )}
      </Card>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <Card className={cn('border', healthInfo.color)}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-background p-2">
              <HealthIcon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base">Estado General de Salud</CardTitle>
              <CardDescription>{healthInfo.label}</CardDescription>
            </div>
            <Badge className={cn('border', healthInfo.color)}>{result.detections.length} detecciones</Badge>
          </div>
        </CardHeader>
        {result.notes && (
          <CardContent>
            <p className="text-sm text-muted-foreground">{result.notes}</p>
          </CardContent>
        )}
      </Card>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Detecciones
        </h3>
        <div className="grid gap-3">
          {result.detections.map((detection, idx) => (
            <DetectionCard
              key={idx}
              detection={detection}
              onCreatePestRecord={onCreatePestRecord}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
