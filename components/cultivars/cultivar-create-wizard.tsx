'use client';

import { useState, useCallback } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useFacility } from '@/components/providers/facility-provider';
import { useQuery } from 'convex/react';
import { WizardStepBasic } from './wizard-step-basic';
import { WizardStepProducts } from './wizard-step-products';
import { getPhaseLabel } from '@/lib/constants/phases';
import {
  Info,
  Package,
  Check,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Save,
  Leaf,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PhaseProductConfig {
  phase: string;
  enabled: boolean;
  name: string;
  category: string;
}

export interface CultivarWizardFormData {
  name: string;
  crop_type_id: string;
  variety_type: string;
  genetic_lineage: string;
  supplier_id: string;
  flowering_time_days: number | undefined;
  thc_min: number | undefined;
  thc_max: number | undefined;
  cbd_min: number | undefined;
  cbd_max: number | undefined;
  notes: string;
  phaseProducts: PhaseProductConfig[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STEPS = [
  { key: 'basic', label: 'Datos basicos', icon: Info },
  { key: 'products', label: 'Productos por Fase', icon: Package },
] as const;

const INITIAL_FORM_DATA: CultivarWizardFormData = {
  name: '',
  crop_type_id: '',
  variety_type: '',
  genetic_lineage: '',
  supplier_id: '',
  flowering_time_days: undefined,
  thc_min: undefined,
  thc_max: undefined,
  cbd_min: undefined,
  cbd_max: undefined,
  notes: '',
  phaseProducts: [],
};

// ---------------------------------------------------------------------------
// SKU helpers
// ---------------------------------------------------------------------------

/**
 * Generate a prefix from cultivar name initials.
 * Single word: first 4 chars. Multiple words: first 2 chars of each, up to 4.
 */
function generateCultivarPrefix(name: string): string {
  const words = name.replace(/[^a-zA-Z0-9\s]/g, '').trim().split(/\s+/);
  if (words.length === 0 || !words[0]) return 'CULT';
  if (words.length === 1) {
    return words[0].substring(0, 4).toUpperCase();
  }
  return words
    .map((w) => w.substring(0, 2))
    .join('')
    .substring(0, 4)
    .toUpperCase();
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CultivarCreateWizard() {
  const router = useRouter();
  const { currentCompanyId, isLoading: facilityLoading } = useFacility();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<CultivarWizardFormData>(INITIAL_FORM_DATA);
  const [isSaving, setIsSaving] = useState(false);

  const cropTypes = useQuery(api.crops.getCropTypes, {});
  const createCultivar = useMutation(api.cultivars.create);
  const createProduct = useMutation(api.products.create);

  const updateField = useCallback(
    <K extends keyof CultivarWizardFormData>(field: K, value: CultivarWizardFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  /** Re-initialize phase products when crop type changes */
  const handleCropTypeChange = useCallback(
    (cropTypeId: string) => {
      const ct = cropTypes?.find((c) => c._id === cropTypeId);
      const rawPhases: any[] = ct?.default_phases ?? [];
      setFormData((prev) => ({
        ...prev,
        phaseProducts: rawPhases.map((phase: any) => ({
          phase: phase.name,
          enabled: false,
          name: '',
          category: 'plant_material',
        })),
      }));
    },
    [cropTypes]
  );

  const updatePhaseProduct = useCallback(
    (index: number, update: Partial<PhaseProductConfig>) => {
      setFormData((prev) => ({
        ...prev,
        phaseProducts: prev.phaseProducts.map((p, i) =>
          i === index ? { ...p, ...update } : p
        ),
      }));
    },
    []
  );

  /**
   * Generate SKU for the enabled product at the given index.
   * Uses cultivar prefix + sequential number across all enabled products.
   */
  const generateSkuForIndex = useCallback(
    (index: number): string => {
      const prefix = generateCultivarPrefix(formData.name);
      // Count how many enabled products come before this index
      let seq = 0;
      for (let i = 0; i <= index; i++) {
        if (formData.phaseProducts[i]?.enabled) seq++;
      }
      return `${prefix}-${String(seq).padStart(3, '0')}`;
    },
    [formData.name, formData.phaseProducts]
  );

  // Step validation
  const validateStep0 = (): string | null => {
    if (!formData.name.trim()) return 'El nombre del cultivar es requerido';
    if (!formData.crop_type_id) return 'Selecciona un tipo de cultivo';
    if (formData.thc_min !== undefined && formData.thc_max !== undefined) {
      if (formData.thc_min > formData.thc_max) return 'THC minimo no puede ser mayor que maximo';
    }
    if (formData.cbd_min !== undefined && formData.cbd_max !== undefined) {
      if (formData.cbd_min > formData.cbd_max) return 'CBD minimo no puede ser mayor que maximo';
    }
    return null;
  };

  const goNext = () => {
    const error = validateStep0();
    if (error) {
      toast.error(error);
      return;
    }
    // Auto-fill product names for phases that don't have one yet
    setFormData((prev) => ({
      ...prev,
      phaseProducts: prev.phaseProducts.map((pp) => ({
        ...pp,
        name: pp.name || `${prev.name} - ${getPhaseLabel(pp.phase)}`,
      })),
    }));
    setCurrentStep(1);
  };

  const goBack = () => setCurrentStep(0);

  const goToStep = (idx: number) => {
    if (idx < currentStep) setCurrentStep(idx);
  };

  const handleSave = async () => {
    if (!currentCompanyId) {
      toast.error('No se encontro la empresa activa');
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

      // 1. Create cultivar
      const cultivarId = await createCultivar({
        companyId: currentCompanyId,
        name: formData.name.trim(),
        cropTypeId: formData.crop_type_id as Id<'crop_types'>,
        varietyType: formData.variety_type || undefined,
        geneticLineage: formData.genetic_lineage.trim() || undefined,
        floweringTimeDays: formData.flowering_time_days,
        supplierId: formData.supplier_id
          ? (formData.supplier_id as Id<'suppliers'>)
          : undefined,
        thcMin: formData.thc_min,
        thcMax: formData.thc_max,
        cbdMin: formData.cbd_min,
        cbdMax: formData.cbd_max,
        notes: formData.notes.trim() || undefined,
      });

      // 2. Create products for enabled phases (sequentially for auto-chain)
      const enabledProducts = formData.phaseProducts.filter((p) => p.enabled);
      let seq = 0;
      for (const product of enabledProducts) {
        seq++;
        const prefix = generateCultivarPrefix(formData.name);
        const sku = `${prefix}-${String(seq).padStart(3, '0')}`;

        await createProduct({
          companyId: currentCompanyId as Id<'companies'>,
          name: product.name.trim() || `${formData.name} - ${getPhaseLabel(product.phase)}`,
          sku,
          category: product.category as any,
          cultivar_id: cultivarId,
          crop_phase: product.phase,
        });
      }

      const productCount = enabledProducts.length;
      toast.success(
        productCount > 0
          ? `${formData.name} creado con ${productCount} producto${productCount === 1 ? '' : 's'} de fase`
          : `${formData.name} creado correctamente`
      );
      router.push(`/cultivars/${cultivarId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al crear el cultivar');
    } finally {
      setIsSaving(false);
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
        title="Nuevo Cultivar"
        icon={Leaf}
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Cultivares', href: '/cultivars' },
          { label: 'Nuevo Cultivar' },
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
          <WizardStepBasic
            formData={formData}
            updateField={updateField}
            onCropTypeChange={handleCropTypeChange}
            companyId={currentCompanyId}
            isSaving={isSaving}
          />
        )}
        {currentStep === 1 && (
          <WizardStepProducts
            phaseProducts={formData.phaseProducts}
            onUpdatePhaseProduct={updatePhaseProduct}
            cultivarName={formData.name}
            generateSku={generateSkuForIndex}
            isSaving={isSaving}
          />
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between border-t pt-4">
        {currentStep === 0 ? (
          <Button variant="outline" onClick={() => router.push('/cultivars')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
        ) : (
          <Button variant="outline" onClick={goBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Atras
          </Button>
        )}

        {currentStep === 0 ? (
          <Button onClick={goNext} className="bg-amber-500 hover:bg-amber-600 text-white">
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
            {isSaving ? 'Creando...' : 'Crear Cultivar'}
          </Button>
        )}
      </div>
    </div>
  );
}
