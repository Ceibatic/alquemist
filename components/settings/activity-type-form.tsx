'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id, Doc } from '@/convex/_generated/dataModel';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// ── Schema ───────────────────────────────────────────────────────────────────

const formSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  code: z.string().min(1, 'El codigo es requerido').regex(/^[a-z0-9_]+$/, 'Solo minusculas, numeros y guion bajo'),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  requires_zone: z.boolean(),
  requires_batch: z.boolean(),
  requires_resources: z.boolean(),
  requires_photos: z.boolean(),
  requires_verification: z.boolean(),
  triggers_transformation: z.boolean(),
  triggers_phase_change: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

// ── Color options ────────────────────────────────────────────────────────────

const COLOR_OPTIONS = [
  { value: 'green', label: 'Verde', hex: '#16a34a' },
  { value: 'blue', label: 'Azul', hex: '#2563eb' },
  { value: 'amber', label: 'Ambar', hex: '#d97706' },
  { value: 'violet', label: 'Violeta', hex: '#7c3aed' },
  { value: 'red', label: 'Rojo', hex: '#dc2626' },
  { value: 'cyan', label: 'Cyan', hex: '#0891b2' },
  { value: 'slate', label: 'Gris', hex: '#64748b' },
  { value: 'rose', label: 'Rosa', hex: '#e11d48' },
  { value: 'orange', label: 'Naranja', hex: '#ea580c' },
];

// ── Component ────────────────────────────────────────────────────────────────

interface ActivityTypeFormProps {
  open: boolean;
  onClose: () => void;
  companyId: Id<'companies'>;
  category: string;
  editingType: Doc<'activity_types'> | null;
}

export function ActivityTypeForm({
  open,
  onClose,
  companyId,
  category,
  editingType,
}: ActivityTypeFormProps) {
  const createMutation = useMutation(api.activityTypes.create);
  const updateMutation = useMutation(api.activityTypes.update);

  const isEditing = !!editingType;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      icon: '',
      color: 'gray',
      requires_zone: false,
      requires_batch: false,
      requires_resources: false,
      requires_photos: false,
      requires_verification: false,
      triggers_transformation: false,
      triggers_phase_change: false,
    },
  });

  // Load editing type data into form
  useEffect(() => {
    if (editingType) {
      reset({
        name: editingType.name,
        code: editingType.code,
        description: editingType.description ?? '',
        icon: editingType.icon ?? '',
        color: editingType.color ?? 'gray',
        requires_zone: editingType.requires_zone,
        requires_batch: editingType.requires_batch,
        requires_resources: editingType.requires_resources,
        requires_photos: editingType.requires_photos,
        requires_verification: editingType.requires_verification,
        triggers_transformation: editingType.triggers_transformation,
        triggers_phase_change: editingType.triggers_phase_change,
      });
    } else {
      reset({
        name: '',
        code: '',
        description: '',
        icon: '',
        color: 'gray',
        requires_zone: false,
        requires_batch: false,
        requires_resources: false,
        requires_photos: false,
        requires_verification: false,
        triggers_transformation: false,
        triggers_phase_change: false,
      });
    }
  }, [editingType, reset]);

  // Auto-generate code from name (only for new types)
  const nameValue = watch('name');
  useEffect(() => {
    if (!isEditing && nameValue) {
      const code = nameValue
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '');
      setValue('code', code, { shouldValidate: true });
    }
  }, [nameValue, isEditing, setValue]);

  const selectedColor = watch('color');

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditing) {
        await updateMutation({
          typeId: editingType._id,
          name: data.name,
          description: data.description || undefined,
          icon: data.icon || undefined,
          color: data.color || undefined,
          requires_zone: data.requires_zone,
          requires_batch: data.requires_batch,
          requires_resources: data.requires_resources,
          requires_photos: data.requires_photos,
          requires_verification: data.requires_verification,
          triggers_transformation: data.triggers_transformation,
          triggers_phase_change: data.triggers_phase_change,
        });
        toast.success('Tipo de actividad actualizado');
      } else {
        await createMutation({
          companyId,
          category,
          code: data.code,
          name: data.name,
          description: data.description || undefined,
          icon: data.icon || undefined,
          color: data.color || undefined,
          requires_zone: data.requires_zone,
          requires_batch: data.requires_batch,
          requires_resources: data.requires_resources,
          requires_photos: data.requires_photos,
          requires_verification: data.requires_verification,
          triggers_transformation: data.triggers_transformation,
          triggers_phase_change: data.triggers_phase_change,
        });
        toast.success('Tipo de actividad creado');
      }
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar');
    }
  };

  const toggleFields: { name: keyof FormData; label: string }[] = [
    { name: 'requires_zone', label: 'Requiere zona' },
    { name: 'requires_batch', label: 'Requiere lote' },
    { name: 'requires_resources', label: 'Requiere recursos' },
    { name: 'requires_photos', label: 'Requiere fotos' },
    { name: 'requires_verification', label: 'Requiere verificacion' },
    { name: 'triggers_transformation', label: 'Genera transformacion' },
    { name: 'triggers_phase_change', label: 'Cambia fase' },
  ];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar tipo de actividad' : 'Nuevo tipo de actividad'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" {...register('name')} placeholder="Ej: Riego por goteo" />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Code */}
          <div className="space-y-1.5">
            <Label htmlFor="code">Codigo</Label>
            <Input
              id="code"
              {...register('code')}
              placeholder="ej: riego_goteo"
              disabled={isEditing}
              className={isEditing ? 'bg-muted' : ''}
            />
            {errors.code && (
              <p className="text-xs text-destructive">{errors.code.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Descripcion (opcional)</Label>
            <Input id="description" {...register('description')} />
          </div>

          {/* Icon */}
          <div className="space-y-1.5">
            <Label htmlFor="icon">Icono Lucide (opcional)</Label>
            <Input id="icon" {...register('icon')} placeholder="Ej: Droplets" />
          </div>

          {/* Color */}
          <div className="space-y-1.5">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setValue('color', c.value)}
                  className={`h-7 w-7 rounded-full border-2 transition-all ${
                    selectedColor === c.value
                      ? 'border-foreground scale-110'
                      : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Toggle flags */}
          <div className="space-y-3 pt-2">
            <Label className="text-sm font-medium">Requerimientos y comportamiento</Label>
            {toggleFields.map((field) => (
              <div key={field.name} className="flex items-center justify-between">
                <Label htmlFor={field.name} className="text-sm font-normal cursor-pointer">
                  {field.label}
                </Label>
                <Switch
                  id={field.name}
                  checked={watch(field.name) as boolean}
                  onCheckedChange={(v) => setValue(field.name, v)}
                />
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Guardar cambios' : 'Crear tipo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
