import { Progress } from '@/components/ui/progress';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  label?: string;
}

export function ProgressIndicator({
  currentStep,
  totalSteps,
  label,
}: ProgressIndicatorProps) {
  const percentage = (currentStep / totalSteps) * 100;

  return (
    <div className="space-y-2">
      {label && (
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
      )}
      <div className="flex items-center gap-2">
        <Progress value={percentage} className="flex-1" />
        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
          Paso {currentStep} de {totalSteps}
        </span>
      </div>
    </div>
  );
}
