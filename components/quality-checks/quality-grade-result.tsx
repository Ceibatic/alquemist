'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Award,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface CriteriaScore {
  score: number;
  notes: string;
}

interface QualityGradeResultProps {
  result: {
    grade: 'A' | 'B' | 'C';
    score: number;
    gradeDescription: string;
    criteria: {
      color: CriteriaScore;
      texture: CriteriaScore;
      size: CriteriaScore;
      defects: CriteriaScore;
      maturity: CriteriaScore;
    };
    recommendations?: string[];
    comparisonToBatchAverage?: 'above_average' | 'average' | 'below_average';
  };
  className?: string;
}

const gradeConfig = {
  A: {
    label: 'Grado A',
    description: 'Premium',
    color: 'bg-green-100 text-green-900 border-green-300',
    badgeColor: 'bg-green-600 text-white',
    icon: Award,
  },
  B: {
    label: 'Grado B',
    description: 'Estándar',
    color: 'bg-amber-100 text-amber-900 border-amber-300',
    badgeColor: 'bg-amber-600 text-white',
    icon: Award,
  },
  C: {
    label: 'Grado C',
    description: 'Procesamiento',
    color: 'bg-orange-100 text-orange-900 border-orange-300',
    badgeColor: 'bg-orange-600 text-white',
    icon: Award,
  },
};

const comparisonConfig = {
  above_average: {
    label: 'Por encima del promedio',
    color: 'text-green-700',
    icon: TrendingUp,
    badgeColor: 'bg-green-100 text-green-800 border-green-200',
  },
  average: {
    label: 'En el promedio',
    color: 'text-blue-700',
    icon: Minus,
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  below_average: {
    label: 'Por debajo del promedio',
    color: 'text-orange-700',
    icon: TrendingDown,
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
  },
};

const criteriaLabels: Record<keyof QualityGradeResultProps['result']['criteria'], string> = {
  color: 'Color',
  texture: 'Textura',
  size: 'Tamaño',
  defects: 'Defectos',
  maturity: 'Madurez',
};

function CircularProgress({ value, size = 120 }: { value: number; size?: number }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-muted/20"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={cn(
            'transition-all duration-500',
            value >= 90 && 'text-green-600',
            value >= 70 && value < 90 && 'text-amber-600',
            value < 70 && 'text-orange-600'
          )}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold">{value}%</span>
        <span className="text-xs text-muted-foreground">Puntuación</span>
      </div>
    </div>
  );
}

function CriteriaRow({
  label,
  score,
  notes,
}: {
  label: string;
  score: number;
  notes: string;
}) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-amber-600';
    return 'text-orange-600';
  };

  const getProgressColor = (score: number) => {
    if (score >= 90) return '[&>div]:bg-green-600';
    if (score >= 70) return '[&>div]:bg-amber-600';
    return '[&>div]:bg-orange-600';
  };

  return (
    <div className="space-y-2 p-4 rounded-lg border bg-card">
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm">{label}</span>
        <span className={cn('font-semibold text-sm', getScoreColor(score))}>
          {score}%
        </span>
      </div>
      <Progress value={score} className={cn('h-2', getProgressColor(score))} />
      {notes && <p className="text-xs text-muted-foreground mt-1">{notes}</p>}
    </div>
  );
}

export function QualityGradeResult({ result, className }: QualityGradeResultProps) {
  const gradeInfo = gradeConfig[result.grade];
  const GradeIcon = gradeInfo.icon;

  const comparisonInfo = result.comparisonToBatchAverage
    ? comparisonConfig[result.comparisonToBatchAverage]
    : null;
  const ComparisonIcon = comparisonInfo?.icon;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Grade Overview Card */}
      <Card className={cn('border-2', gradeInfo.color)}>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <div className={cn('rounded-full p-3', gradeInfo.badgeColor)}>
                  <GradeIcon className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{gradeInfo.label}</CardTitle>
                  <CardDescription className="text-base">
                    {result.gradeDescription}
                  </CardDescription>
                </div>
              </div>

              {comparisonInfo && (
                <div className="flex items-center gap-2">
                  {ComparisonIcon && (
                    <ComparisonIcon className={cn('h-4 w-4', comparisonInfo.color)} />
                  )}
                  <Badge className={cn('border', comparisonInfo.badgeColor)}>
                    {comparisonInfo.label}
                  </Badge>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center">
              <CircularProgress value={result.score} />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Criteria Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-muted-foreground" />
            Desglose de Criterios
          </CardTitle>
          <CardDescription>
            Evaluación detallada de cada aspecto de calidad
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(result.criteria).map(([key, value]) => (
            <CriteriaRow
              key={key}
              label={criteriaLabels[key as keyof typeof criteriaLabels]}
              score={value.score}
              notes={value.notes}
            />
          ))}
        </CardContent>
      </Card>

      {/* Recommendations */}
      {result.recommendations && result.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              Recomendaciones
            </CardTitle>
            <CardDescription>
              Acciones sugeridas para mejorar la calidad
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <div className="rounded-full bg-amber-100 p-1 mt-0.5">
                    <AlertCircle className="h-3 w-3 text-amber-600" />
                  </div>
                  <span className="text-sm text-muted-foreground flex-1">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <p className="text-2xl font-bold">{result.grade}</p>
              <p className="text-xs text-muted-foreground">Grado</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold">{result.score}%</p>
              <p className="text-xs text-muted-foreground">Puntuación</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold">
                {Math.round(
                  Object.values(result.criteria).reduce(
                    (acc, curr) => acc + curr.score,
                    0
                  ) / Object.keys(result.criteria).length
                )}
                %
              </p>
              <p className="text-xs text-muted-foreground">Promedio Criterios</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
