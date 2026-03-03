'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useFacility } from '@/components/providers/facility-provider';
import { useUser } from '@/components/providers/user-provider';
import { OrderWizardStepBasic } from './order-wizard-step-basic';
import { OrderWizardStepPhases } from './order-wizard-step-phases';
import {
  FileText,
  Layers,
  Check,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Save,
  ClipboardList,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types (exported so step components can import them)
// ---------------------------------------------------------------------------

export interface OrderPhaseItem {
  id: string;
  name: string;
  durationDays: number;
  areaType: string;
}

export interface OrderWizardFormData {
  templateId: string;
  cropTypeId: string;
  cultivarId: string;
  orderType: string;
  sourceType: string;
  requestedQuantity: string;
  batchSize: string;
  plannedStartDate: string; // YYYY-MM-DD
  priority: string;
  notes: string;
  phases: OrderPhaseItem[];
  entryPhaseName: string;
  exitPhaseName: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STEPS = [
  { key: 'basic', label: 'Datos básicos', icon: FileText },
  { key: 'phases', label: 'Fases', icon: Layers },
] as const;

function todayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const INITIAL_FORM_DATA: OrderWizardFormData = {
  templateId: '',
  cropTypeId: '',
  cultivarId: '',
  orderType: 'standard',
  sourceType: 'seed',
  requestedQuantity: '100',
  batchSize: '50',
  plannedStartDate: todayStr(),
  priority: 'normal',
  notes: '',
  phases: [],
  entryPhaseName: '',
  exitPhaseName: '',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function OrderCreateWizard() {
  const router = useRouter();
  const { currentCompanyId, currentFacilityId, isLoading: facilityLoading } = useFacility();
  const { userId } = useUser();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<OrderWizardFormData>(INITIAL_FORM_DATA);
  const [isSaving, setIsSaving] = useState(false);

  const createOrder = useMutation(api.productionOrders.create);
  const createOrderPhase = useMutation(api.orderPhases.create);

  const updateField = useCallback(
    <K extends keyof OrderWizardFormData>(field: K, value: OrderWizardFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Validation for step 1
  const validateStep0 = (): string | null => {
    if (!formData.cropTypeId) return 'Selecciona un tipo de cultivo';
    if (!formData.requestedQuantity || parseInt(formData.requestedQuantity) < 1)
      return 'La cantidad solicitada debe ser mayor a 0';
    if (!formData.plannedStartDate) return 'Selecciona una fecha de inicio';
    return null;
  };

  const goNext = () => {
    const error = validateStep0();
    if (error) {
      toast.error(error);
      return;
    }
    setCurrentStep(1);
  };

  const goBack = () => {
    setCurrentStep(0);
  };

  const handleSave = async () => {
    if (!currentCompanyId || !currentFacilityId || !userId) {
      toast.error('Datos de sesión incompletos');
      return;
    }

    const stepError = validateStep0();
    if (stepError) {
      toast.error(stepError);
      setCurrentStep(0);
      return;
    }

    try {
      setIsSaving(true);

      // Parse the planned start date
      const [y, m, d] = formData.plannedStartDate.split('-').map(Number);
      const plannedStart = new Date(y, m - 1, d).getTime();

      // Create the order
      const orderId = await createOrder({
        companyId: currentCompanyId,
        facilityId: currentFacilityId,
        templateId: formData.templateId
          ? (formData.templateId as Id<'production_templates'>)
          : undefined,
        cropTypeId: formData.cropTypeId as Id<'crop_types'>,
        cultivarId: formData.cultivarId
          ? (formData.cultivarId as Id<'cultivars'>)
          : undefined,
        orderType: formData.orderType,
        sourceType: formData.sourceType,
        requestedQuantity: parseInt(formData.requestedQuantity),
        batchSize: parseInt(formData.batchSize) || undefined,
        priority: formData.priority,
        notes: formData.notes.trim() || undefined,
        plannedStartDate: plannedStart,
        requestedBy: userId as Id<'users'>,
        entryPhaseName: formData.entryPhaseName || undefined,
        exitPhaseName: formData.exitPhaseName || undefined,
      });

      // If no template selected, create manual phases
      if (!formData.templateId && formData.phases.length > 0) {
        const DAY_MS = 24 * 60 * 60 * 1000;
        let phaseStart = plannedStart;

        for (let i = 0; i < formData.phases.length; i++) {
          const phase = formData.phases[i];
          const phaseEnd = phaseStart + phase.durationDays * DAY_MS;

          await createOrderPhase({
            orderId,
            phaseName: phase.name,
            phaseOrder: i + 1,
            plannedStartDate: phaseStart,
            plannedEndDate: phaseEnd,
          });

          phaseStart = phaseEnd;
        }
      }

      toast.success('Orden creada correctamente');
      router.push(`/production/orders/${orderId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al crear la orden');
    } finally {
      setIsSaving(false);
    }
  };

  const goToStep = (idx: number) => {
    if (idx < currentStep) {
      setCurrentStep(idx);
    }
  };

  if (facilityLoading || !currentCompanyId) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Nueva Orden de Producción"
        icon={ClipboardList}
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Producción', href: '/production?tab=ordenes' },
          { label: 'Nueva Orden' },
        ]}
      />

      {/* Step indicator */}
      <nav className="flex items-center justify-center gap-2">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isActive = idx === currentStep;
          const isCompleted = idx < currentStep;
          return (
            <div key={step.key} className="flex items-center">
              {idx > 0 && (
                <div
                  className={cn(
                    'h-px w-8 mx-1',
                    idx <= currentStep ? 'bg-amber-500' : 'bg-gray-200'
                  )}
                />
              )}
              <button
                type="button"
                onClick={() => goToStep(idx)}
                className={cn(
                  'flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive && 'bg-amber-500 text-white',
                  isCompleted && 'bg-amber-100 text-amber-800 cursor-pointer',
                  !isActive && !isCompleted && 'bg-gray-100 text-gray-500 cursor-default'
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">{step.label}</span>
                <span className="sm:hidden">{idx + 1}</span>
              </button>
            </div>
          );
        })}
      </nav>

      {/* Step content */}
      <div className="min-h-[400px]">
        {currentStep === 0 && (
          <OrderWizardStepBasic
            formData={formData}
            updateField={updateField}
            companyId={currentCompanyId}
          />
        )}
        {currentStep === 1 && (
          <OrderWizardStepPhases
            formData={formData}
            onPhasesChange={(phases) => updateField('phases', phases)}
            onEntryPhaseChange={(name) => updateField('entryPhaseName', name)}
            onExitPhaseChange={(name) => updateField('exitPhaseName', name)}
            companyId={currentCompanyId}
          />
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between border-t pt-4">
        {currentStep === 0 ? (
          <Button
            variant="outline"
            onClick={() => router.push('/production?tab=ordenes')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
        ) : (
          <Button variant="outline" onClick={goBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Atrás
          </Button>
        )}

        {currentStep === 0 ? (
          <Button
            onClick={goNext}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            Siguiente
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isSaving ? 'Creando...' : 'Crear Orden'}
          </Button>
        )}
      </div>
    </div>
  );
}
