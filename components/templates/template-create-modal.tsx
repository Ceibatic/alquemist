'use client';

import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface TemplateCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: Id<'companies'>;
  cropTypes: Array<{
    _id: Id<'crop_types'>;
    name: string;
    display_name_es: string;
  }>;
  onSuccess: (templateId: string) => void;
}

export function TemplateCreateModal({
  open,
  onOpenChange,
  companyId,
  cropTypes,
  onSuccess,
}: TemplateCreateModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [cropTypeId, setCropTypeId] = useState<string>('');
  const [cultivarId, setCultivarId] = useState<string>('');
  const [templateCategory, setTemplateCategory] = useState<string>('seed-to-harvest');
  const [productionMethod, setProductionMethod] = useState<string>('indoor');
  const [sourceType, setSourceType] = useState<string>('clone');

  // Fetch cultivars based on selected crop type
  const cultivars = useQuery(
    api.cultivars.list,
    cropTypeId ? { companyId, cropTypeId: cropTypeId as Id<'crop_types'> } : 'skip'
  );

  const createTemplate = useMutation(api.productionTemplates.create);

  const resetForm = () => {
    setName('');
    setDescription('');
    setCropTypeId('');
    setCultivarId('');
    setTemplateCategory('seed-to-harvest');
    setProductionMethod('indoor');
    setSourceType('clone');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'El nombre del template es requerido',
        variant: 'destructive',
      });
      return;
    }

    if (!cropTypeId) {
      toast({
        title: 'Error',
        description: 'Selecciona un tipo de cultivo',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const templateId = await createTemplate({
        companyId,
        name: name.trim(),
        cropTypeId: cropTypeId as Id<'crop_types'>,
        cultivarId: cultivarId ? (cultivarId as Id<'cultivars'>) : undefined,
        templateCategory,
        productionMethod,
        sourceType,
        description: description.trim() || undefined,
        defaultBatchSize: 50,
        enableIndividualTracking: false,
      });

      resetForm();
      onSuccess(templateId);
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear el template. Intenta de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Crear Template de Produccion</DialogTitle>
            <DialogDescription>
              Define la informacion basica del template. Podras agregar fases y actividades
              despues de crearlo.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Cannabis Indoor - Ciclo Completo"
                disabled={isSubmitting}
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Descripcion</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripcion del proceso de produccion..."
                rows={2}
                disabled={isSubmitting}
              />
            </div>

            {/* Crop Type */}
            <div className="grid gap-2">
              <Label htmlFor="cropType">Tipo de Cultivo *</Label>
              <Select
                value={cropTypeId}
                onValueChange={(value) => {
                  setCropTypeId(value);
                  setCultivarId(''); // Reset cultivar when crop type changes
                }}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo de cultivo" />
                </SelectTrigger>
                <SelectContent>
                  {cropTypes.map((ct) => (
                    <SelectItem key={ct._id} value={ct._id}>
                      {ct.display_name_es}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cultivar */}
            <div className="grid gap-2">
              <Label htmlFor="cultivar">Cultivar Especifico (Opcional)</Label>
              <Select
                value={cultivarId}
                onValueChange={setCultivarId}
                disabled={isSubmitting || !cropTypeId || !cultivars}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Cualquier cultivar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Cualquier cultivar</SelectItem>
                  {cultivars?.map((cv) => (
                    <SelectItem key={cv._id} value={cv._id}>
                      {cv.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category & Method Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Categoria</Label>
                <Select
                  value={templateCategory}
                  onValueChange={setTemplateCategory}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seed-to-harvest">Semilla a Cosecha</SelectItem>
                    <SelectItem value="propagation">Solo Propagacion</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Metodo</Label>
                <Select
                  value={productionMethod}
                  onValueChange={setProductionMethod}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="indoor">Interior</SelectItem>
                    <SelectItem value="outdoor">Exterior</SelectItem>
                    <SelectItem value="greenhouse">Invernadero</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Source Type */}
            <div className="grid gap-2">
              <Label>Fuente del Material</Label>
              <Select
                value={sourceType}
                onValueChange={setSourceType}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seed">Semilla</SelectItem>
                  <SelectItem value="clone">Clon / Esqueje</SelectItem>
                  <SelectItem value="tissue_culture">Cultivo de Tejido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear Template'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
