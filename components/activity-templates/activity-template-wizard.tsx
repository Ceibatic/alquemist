'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { WizardStepBasic } from './wizard-step-basic';
import { WizardStepFields } from './wizard-step-fields';
import { WizardStepResources } from './wizard-step-resources';
import { WizardStepConfig } from './wizard-step-config';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  FileText,
  ListChecks,
  Package,
  Settings,
  ArrowLeft,
  ArrowRight,
  Save,
  Loader2,
  Check,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ResourceItem {
  /** Present for existing resources loaded from DB */
  _id?: string;
  productId: string;
  productName: string;
  productCode?: string;
  productCategory?: string;
  productUnit?: string;
  productPrice?: number;
  productCurrency?: string;
  productSupplier?: string;
  quantity: number;
  quantityBasis: string;
  direction: string;
  applicationRate: string;
  applicationMethod: string;
  isRequired: boolean;
  notes: string;
}

export interface ProductListItem {
  _id: string;
  name: string;
  code?: string;
  category?: string;
  defaultUnit?: string;
  defaultPrice?: number;
  priceCurrency?: string;
  supplierName?: string;
}

export interface WizardFormData {
  // Step 1 — Basic
  name: string;
  code: string;
  typeId: string;
  description: string;
  defaultPriority: string;
  applicablePhases: string[];
  cropTypeIds: string[];
  phaseDayStart: string;
  phaseDayEnd: string;

  // Step 2 — Form fields
  formFields: string[];

  // Step 3 — Resources
  resources: ResourceItem[];

  // Step 4 — Config
  frequencyType: string;
  frequencyIntervalDays: string;
  repeatCount: string;
  estimatedDurationMinutes: string;
  laborHoursPer1000Plants: string;
  qualityCheckTemplateId: string;
  requiresPhotos: boolean;
  requiresAttachments: boolean;
  dependsOnTemplateId: string;
  minDaysAfterDependency: string;
  regulatoryReference: string;
  requiresVerification: boolean;
}

const INITIAL_FORM_DATA: WizardFormData = {
  name: '',
  code: '',
  typeId: '',
  description: '',
  defaultPriority: 'routine',
  applicablePhases: [],
  cropTypeIds: [],
  phaseDayStart: '',
  phaseDayEnd: '',
  formFields: [],
  resources: [],
  frequencyType: 'once',
  frequencyIntervalDays: '',
  repeatCount: '',
  estimatedDurationMinutes: '',
  laborHoursPer1000Plants: '',
  qualityCheckTemplateId: '',
  requiresPhotos: false,
  requiresAttachments: false,
  dependsOnTemplateId: '',
  minDaysAfterDependency: '',
  regulatoryReference: '',
  requiresVerification: false,
};

const STEPS = [
  { key: 'basic', label: 'Tipo y basico', icon: FileText },
  { key: 'fields', label: 'Campos', icon: ListChecks },
  { key: 'resources', label: 'Recursos', icon: Package },
  { key: 'config', label: 'Configuracion', icon: Settings },
] as const;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ActivityTemplateWizardProps {
  companyId: Id<'companies'>;
  templateId?: Id<'activity_templates'>; // present in edit mode
  template?: any; // loaded template data for edit mode
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ActivityTemplateWizard({
  companyId,
  templateId,
  template,
}: ActivityTemplateWizardProps) {
  const router = useRouter();
  const isEdit = !!templateId;

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<WizardFormData>(INITIAL_FORM_DATA);
  const [isSaving, setIsSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Queries
  const activityTypes = useQuery(
    api.activityTypes.list,
    { companyId, status: 'active' }
  );
  const cropTypes = useQuery(api.crops.getCropTypes, {});
  const products = useQuery(
    api.products.list,
    { companyId, status: 'active' }
  );
  const allTemplates = useQuery(
    api.activityTemplates.list,
    { companyId, isActive: true }
  );

  // Mutations
  const createMutation = useMutation(api.activityTemplates.create);
  const updateMutation = useMutation(api.activityTemplates.update);
  const addResourceMutation = useMutation(api.activityTemplates.addResource);
  const removeResourceMutation = useMutation(api.activityTemplates.removeResource);

  const suppliers = useQuery(
    api.suppliers.list,
    { companyId }
  );

  // Normalize product list with enriched data
  const productList = useMemo(() => {
    const raw = products && 'products' in products
      ? (products as any).products
      : (products as any) ?? [];

    const supplierMap = new Map<string, string>();
    if (suppliers) {
      for (const s of suppliers) {
        supplierMap.set(s._id, s.name ?? s.primary_contact_name ?? 'Proveedor');
      }
    }

    return raw.map((p: any) => ({
      _id: p._id as string,
      name: p.name as string,
      code: (p.sku ?? p.code) as string | undefined,
      category: p.category as string | undefined,
      defaultUnit: p.default_unit as string | undefined,
      defaultPrice: p.default_price as number | undefined,
      priceCurrency: p.price_currency as string | undefined,
      supplierName: p.preferred_supplier_id
        ? supplierMap.get(p.preferred_supplier_id) ?? undefined
        : undefined,
    }));
  }, [products, suppliers]);

  // Load template data in edit mode
  useEffect(() => {
    if (template && !loaded) {
      // Map existing resources to local ResourceItem format
      const existingResources: ResourceItem[] = (template.resources ?? []).map((r: any) => {
        const product = productList.find((p: ProductListItem) => p._id === r.product_id);
        return {
          _id: r._id,
          productId: r.product_id,
          productName: product?.name ?? 'Producto desconocido',
          productCode: product?.code,
          productCategory: product?.category,
          productUnit: product?.defaultUnit,
          productPrice: product?.defaultPrice,
          productCurrency: product?.priceCurrency,
          productSupplier: product?.supplierName,
          quantity: r.quantity,
          quantityBasis: r.quantity_basis ?? 'fixed',
          direction: r.direction ?? 'consumed',
          applicationRate: r.application_rate ?? '',
          applicationMethod: r.application_method ?? '',
          isRequired: r.is_required ?? true,
          notes: r.notes ?? '',
        };
      });

      setFormData({
        name: template.name ?? '',
        code: template.code ?? '',
        typeId: template.type_id ?? '',
        description: template.description ?? '',
        defaultPriority: template.default_priority ?? 'routine',
        applicablePhases: template.applicable_phases ?? [],
        cropTypeIds: (template.crop_type_ids ?? []) as string[],
        phaseDayStart: template.phase_day_start?.toString() ?? '',
        phaseDayEnd: template.phase_day_end?.toString() ?? '',
        formFields: template.form_fields ?? [],
        resources: existingResources,
        frequencyType: template.frequency_type ?? 'once',
        frequencyIntervalDays: template.frequency_interval_days?.toString() ?? '',
        repeatCount: template.repeat_count?.toString() ?? '',
        estimatedDurationMinutes: template.estimated_duration_minutes?.toString() ?? '',
        laborHoursPer1000Plants: template.labor_hours_per_1000_plants?.toString() ?? '',
        qualityCheckTemplateId: template.quality_check_template_id ?? '',
        requiresPhotos: template.requires_photos ?? false,
        requiresAttachments: template.requires_attachments ?? false,
        dependsOnTemplateId: template.depends_on_template_id ?? '',
        minDaysAfterDependency: template.min_days_after_dependency?.toString() ?? '',
        regulatoryReference: template.regulatory_reference ?? '',
        requiresVerification: template.requires_verification ?? false,
      });
      setLoaded(true);
    }
  }, [template, loaded, productList]);

  // Auto-generate code from name (create only)
  useEffect(() => {
    if (!isEdit && formData.name && !formData.code) {
      const generated = formData.name
        .toUpperCase()
        .replace(/[^A-Z0-9\s]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .substring(0, 20);
      setFormData((prev) => ({ ...prev, code: generated }));
    }
  }, [isEdit, formData.name, formData.code]);

  const updateField = useCallback(
    <K extends keyof WizardFormData>(field: K, value: WizardFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Validation per step
  const validateStep = (step: number): string | null => {
    if (step === 0) {
      if (!formData.name.trim()) return 'El nombre es requerido';
      if (!formData.typeId) return 'Selecciona un tipo de actividad';
      if (formData.applicablePhases.length === 0) return 'Selecciona al menos una fase';
    }
    return null;
  };

  const goNext = () => {
    const error = validateStep(currentStep);
    if (error) {
      toast.error(error);
      return;
    }
    setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setCurrentStep((s) => Math.max(s - 1, 0));
  };

  const goToStep = (step: number) => {
    if (step < currentStep) {
      setCurrentStep(step);
      return;
    }
    for (let i = currentStep; i < step; i++) {
      const error = validateStep(i);
      if (error) {
        toast.error(error);
        return;
      }
    }
    setCurrentStep(step);
  };

  // Sync resources after template save
  const syncResources = async (targetTemplateId: Id<'activity_templates'>) => {
    const localResources = formData.resources;
    const existingIds = new Set(localResources.filter((r) => r._id).map((r) => r._id!));

    // Remove resources that were deleted from the cart
    if (template?.resources) {
      for (const existing of template.resources) {
        if (!existingIds.has(existing._id)) {
          await removeResourceMutation({
            resourceId: existing._id as Id<'activity_template_resources'>,
          });
        }
      }
    }

    // Add new resources (those without _id)
    for (let i = 0; i < localResources.length; i++) {
      const res = localResources[i];
      if (!res._id) {
        await addResourceMutation({
          templateId: targetTemplateId,
          productId: res.productId as Id<'products'>,
          quantity: res.quantity,
          quantityBasis: res.quantityBasis,
          direction: res.direction,
          applicationRate: res.applicationRate.trim() || undefined,
          applicationMethod: res.applicationMethod.trim() || undefined,
          isRequired: res.isRequired,
          notes: res.notes.trim() || undefined,
        });
      }
    }
  };

  const handleSave = async () => {
    const stepError = validateStep(0);
    if (stepError) {
      toast.error(stepError);
      setCurrentStep(0);
      return;
    }

    try {
      setIsSaving(true);

      const baseArgs = {
        name: formData.name.trim(),
        code: formData.code.trim() || undefined,
        description: formData.description.trim() || undefined,
        typeId: formData.typeId as Id<'activity_types'>,
        applicablePhases: formData.applicablePhases,
        cropTypeIds: formData.cropTypeIds.length > 0
          ? formData.cropTypeIds as Id<'crop_types'>[]
          : undefined,
        phaseDayStart: formData.phaseDayStart ? Number(formData.phaseDayStart) : undefined,
        phaseDayEnd: formData.phaseDayEnd ? Number(formData.phaseDayEnd) : undefined,
        estimatedDurationMinutes: formData.estimatedDurationMinutes
          ? Number(formData.estimatedDurationMinutes)
          : undefined,
        laborHoursPer1000Plants: formData.laborHoursPer1000Plants
          ? Number(formData.laborHoursPer1000Plants)
          : undefined,
        frequencyType: formData.frequencyType,
        frequencyIntervalDays: formData.frequencyIntervalDays
          ? Number(formData.frequencyIntervalDays)
          : undefined,
        repeatCount: formData.repeatCount ? Number(formData.repeatCount) : undefined,
        defaultPriority: formData.defaultPriority,
        requiresVerification: formData.requiresVerification,
        regulatoryReference: formData.regulatoryReference.trim() || undefined,
        dependsOnTemplateId: formData.dependsOnTemplateId
          ? (formData.dependsOnTemplateId as Id<'activity_templates'>)
          : undefined,
        minDaysAfterDependency: formData.minDaysAfterDependency
          ? Number(formData.minDaysAfterDependency)
          : undefined,
        formFields: formData.formFields.length > 0 ? formData.formFields : undefined,
        qualityCheckTemplateId: formData.qualityCheckTemplateId
          ? (formData.qualityCheckTemplateId as Id<'quality_check_templates'>)
          : undefined,
        requiresPhotos: formData.requiresPhotos || undefined,
        requiresAttachments: formData.requiresAttachments || undefined,
      };

      let savedTemplateId: Id<'activity_templates'>;

      if (isEdit && templateId) {
        await updateMutation({ templateId, ...baseArgs });
        savedTemplateId = templateId;
        // Sync resources
        await syncResources(savedTemplateId);
        toast.success('Template actualizado');
      } else {
        savedTemplateId = await createMutation({ companyId, ...baseArgs });
        // Add resources for new template
        await syncResources(savedTemplateId);
        toast.success('Template creado');
      }

      router.push('/templates?tab=activities');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
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
                  isCompleted && 'bg-amber-100 text-amber-800',
                  !isActive && !isCompleted && 'bg-gray-100 text-gray-500'
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
            activityTypes={activityTypes}
            cropTypes={cropTypes}
            isEdit={isEdit}
          />
        )}
        {currentStep === 1 && (
          <WizardStepFields
            formData={formData}
            updateField={updateField}
          />
        )}
        {currentStep === 2 && (
          <WizardStepResources
            formData={formData}
            updateField={updateField}
            productList={productList}
          />
        )}
        {currentStep === 3 && (
          <WizardStepConfig
            formData={formData}
            updateField={updateField}
            companyId={companyId}
            templateId={templateId}
            allTemplates={allTemplates}
          />
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between border-t pt-4">
        <Button
          variant="outline"
          onClick={currentStep === 0 ? () => router.back() : goBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {currentStep === 0 ? 'Cancelar' : 'Anterior'}
        </Button>

        <div className="flex gap-2">
          {currentStep < STEPS.length - 1 ? (
            <Button
              onClick={goNext}
              className="bg-amber-500 hover:bg-amber-600"
            >
              Siguiente
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isSaving ? 'Guardando...' : 'Guardar template'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
