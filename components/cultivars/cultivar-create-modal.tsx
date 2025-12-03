'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CultivarForm } from './cultivar-form';
import { Leaf } from 'lucide-react';
import type { CreateCustomCultivarInput } from '@/lib/validations/cultivar';

interface CropType {
  _id: string;
  name: string;
  display_name_es: string;
}

interface Supplier {
  _id: string;
  name: string;
}

interface CultivarCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cropTypes: CropType[];
  suppliers?: Supplier[];
  onSubmit: (data: CreateCustomCultivarInput) => Promise<void>;
  isSubmitting?: boolean;
}

export function CultivarCreateModal({
  open,
  onOpenChange,
  cropTypes,
  suppliers,
  onSubmit,
  isSubmitting,
}: CultivarCreateModalProps) {
  const handleSubmit = async (data: CreateCustomCultivarInput) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <Leaf className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <DialogTitle>Crear Cultivar Personalizado</DialogTitle>
              <DialogDescription>
                Agrega un cultivar personalizado para tu instalación. Los cultivares
                del sistema están disponibles en "Agregar de Sistema".
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <CultivarForm
          cropTypes={cropTypes}
          suppliers={suppliers}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
