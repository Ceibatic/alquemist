'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, TrendingUp, Factory } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FacilityForm } from './facility-form';
import { FacilityFormData, canCreateFacility, PlanType, getPlanLimit } from '@/lib/validations/facilities';

interface FacilityCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FacilityFormData) => Promise<void>;
  currentFacilityCount: number;
  planType: PlanType;
}

export function FacilityCreateModal({
  open,
  onOpenChange,
  onSubmit,
  currentFacilityCount,
  planType,
}: FacilityCreateModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canCreate = canCreateFacility(currentFacilityCount, planType);
  const limit = getPlanLimit(planType);

  const handleSubmit = async (data: FacilityFormData) => {
    if (!canCreate) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(data);
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating facility:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Factory className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <DialogTitle>Nueva Instalación</DialogTitle>
              <DialogDescription>
                Crea una nueva instalación para tu empresa
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Plan Limit Warning */}
        {!canCreate && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>
                Has alcanzado el límite de {limit} {limit === 1 ? 'instalación' : 'instalaciones'} de
                tu plan {planType}. Actualiza tu plan para crear más instalaciones.
              </span>
              <Button
                variant="outline"
                size="sm"
                className="ml-4 border-white text-white hover:bg-red-800"
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Actualizar Plan
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Near Limit Warning */}
        {canCreate && limit !== -1 && currentFacilityCount >= limit * 0.8 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Estás cerca del límite de tu plan. Te {limit === 1 ? 'queda' : 'quedan'}{' '}
              {limit - currentFacilityCount} {limit - currentFacilityCount === 1 ? 'instalación' : 'instalaciones'}{' '}
              disponibles.
            </AlertDescription>
          </Alert>
        )}

        {canCreate ? (
          <FacilityForm
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            isLoading={isSubmitting}
          />
        ) : (
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
