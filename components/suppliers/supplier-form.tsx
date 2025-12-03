'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  CategoryMultiSelect,
  CropSpecializationMultiSelect,
} from './category-multi-select';
import {
  COLOMBIAN_DEPARTMENTS,
  BUSINESS_TYPES,
  PAYMENT_TERMS,
  CROP_SPECIALIZATION,
} from '@/lib/constants/suppliers';
import { createSupplierSchema } from '@/lib/validations/supplier';
import {
  Building2,
  Phone,
  MapPin,
  Package,
  CreditCard,
  StickyNote,
  Loader2,
} from 'lucide-react';

type SupplierFormData = z.infer<typeof createSupplierSchema>;

interface SupplierFormProps {
  onSubmit: (data: SupplierFormData) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<SupplierFormData> & { is_active?: boolean; is_approved?: boolean };
  isSubmitting?: boolean;
  submitLabel?: string;
}

export function SupplierForm({
  onSubmit,
  onCancel,
  initialData,
  isSubmitting = false,
  submitLabel = 'Crear Proveedor',
}: SupplierFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SupplierFormData>({
    resolver: zodResolver(createSupplierSchema),
    defaultValues: {
      name: initialData?.name || '',
      legal_name: initialData?.legal_name || '',
      tax_id: initialData?.tax_id || '',
      business_type: initialData?.business_type,
      primary_contact_name: initialData?.primary_contact_name || '',
      primary_contact_email: initialData?.primary_contact_email || '',
      primary_contact_phone: initialData?.primary_contact_phone || '',
      address: initialData?.address || '',
      city: initialData?.city || '',
      administrative_division_1: initialData?.administrative_division_1,
      product_categories: initialData?.product_categories || [],
      crop_specialization: initialData?.crop_specialization || [],
      payment_terms: initialData?.payment_terms,
      notes: initialData?.notes || '',
    },
  });

  const productCategories = watch('product_categories');
  const cropSpecialization = watch('crop_specialization');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <Building2 className="h-4 w-4 text-green-700" />
          <h3 className="font-semibold text-gray-900">Información Básica</h3>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Nombre <span className="text-red-600">*</span>
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Nombre comercial del proveedor"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Legal Name */}
          <div className="space-y-2">
            <Label htmlFor="legal_name">Razón Social</Label>
            <Input
              id="legal_name"
              {...register('legal_name')}
              placeholder="Razón social completa"
            />
            {errors.legal_name && (
              <p className="text-sm text-red-600">{errors.legal_name.message}</p>
            )}
          </div>

          {/* NIT */}
          <div className="space-y-2">
            <Label htmlFor="tax_id">NIT</Label>
            <Input
              id="tax_id"
              {...register('tax_id')}
              placeholder="XXX.XXX.XXX-X"
            />
            {errors.tax_id && (
              <p className="text-sm text-red-600">{errors.tax_id.message}</p>
            )}
          </div>

          {/* Business Type */}
          <div className="space-y-2">
            <Label htmlFor="business_type">Tipo de Empresa</Label>
            <Select
              value={watch('business_type')}
              onValueChange={(value) => setValue('business_type', value as any)}
            >
              <SelectTrigger id="business_type">
                <SelectValue placeholder="Selecciona tipo de empresa" />
              </SelectTrigger>
              <SelectContent>
                {BUSINESS_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.business_type && (
              <p className="text-sm text-red-600">{errors.business_type.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <Phone className="h-4 w-4 text-green-700" />
          <h3 className="font-semibold text-gray-900">Información de Contacto</h3>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Contact Name */}
          <div className="space-y-2">
            <Label htmlFor="primary_contact_name">Nombre de Contacto</Label>
            <Input
              id="primary_contact_name"
              {...register('primary_contact_name')}
              placeholder="Nombre completo del contacto"
            />
            {errors.primary_contact_name && (
              <p className="text-sm text-red-600">
                {errors.primary_contact_name.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="primary_contact_email">Email</Label>
            <Input
              id="primary_contact_email"
              type="email"
              {...register('primary_contact_email')}
              placeholder="email@ejemplo.com"
            />
            {errors.primary_contact_email && (
              <p className="text-sm text-red-600">
                {errors.primary_contact_email.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="primary_contact_phone">Teléfono</Label>
            <Input
              id="primary_contact_phone"
              {...register('primary_contact_phone')}
              placeholder="+57 XXX XXX XXXX"
            />
            {errors.primary_contact_phone && (
              <p className="text-sm text-red-600">
                {errors.primary_contact_phone.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <MapPin className="h-4 w-4 text-green-700" />
          <h3 className="font-semibold text-gray-900">Ubicación</h3>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Address */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              {...register('address')}
              placeholder="Dirección completa"
            />
            {errors.address && (
              <p className="text-sm text-red-600">{errors.address.message}</p>
            )}
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label htmlFor="city">Ciudad</Label>
            <Input
              id="city"
              {...register('city')}
              placeholder="Ciudad"
            />
            {errors.city && (
              <p className="text-sm text-red-600">{errors.city.message}</p>
            )}
          </div>

          {/* Department */}
          <div className="space-y-2">
            <Label htmlFor="administrative_division_1">Departamento</Label>
            <Select
              value={watch('administrative_division_1')}
              onValueChange={(value) =>
                setValue('administrative_division_1', value)
              }
            >
              <SelectTrigger id="administrative_division_1">
                <SelectValue placeholder="Selecciona departamento" />
              </SelectTrigger>
              <SelectContent>
                {COLOMBIAN_DEPARTMENTS.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.administrative_division_1 && (
              <p className="text-sm text-red-600">
                {errors.administrative_division_1.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Products & Specialization */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <Package className="h-4 w-4 text-green-700" />
          <h3 className="font-semibold text-gray-900">Productos y Especialización</h3>
        </div>

        {/* Product Categories */}
        <div className="space-y-2">
          <Label>
            Categorías de Productos <span className="text-red-600">*</span>
          </Label>
          <CategoryMultiSelect
            value={productCategories}
            onChange={(value) => setValue('product_categories', value as any)}
            error={errors.product_categories?.message}
          />
        </div>

        {/* Crop Specialization */}
        <div className="space-y-2">
          <Label>
            Especialización de Cultivos <span className="text-red-600">*</span>
          </Label>
          <CropSpecializationMultiSelect
            value={cropSpecialization}
            onChange={(value) => setValue('crop_specialization', value)}
            error={errors.crop_specialization?.message}
            crops={[...CROP_SPECIALIZATION]}
          />
        </div>
      </div>

      {/* Financial */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <CreditCard className="h-4 w-4 text-green-700" />
          <h3 className="font-semibold text-gray-900">Información Financiera</h3>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Payment Terms */}
          <div className="space-y-2">
            <Label htmlFor="payment_terms">Términos de Pago</Label>
            <Select
              value={watch('payment_terms')}
              onValueChange={(value) => setValue('payment_terms', value)}
            >
              <SelectTrigger id="payment_terms">
                <SelectValue placeholder="Selecciona términos de pago" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_TERMS.map((term) => (
                  <SelectItem key={term.value} value={term.value}>
                    {term.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.payment_terms && (
              <p className="text-sm text-red-600">
                {errors.payment_terms.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <StickyNote className="h-4 w-4 text-green-700" />
          <h3 className="font-semibold text-gray-900">Notas</h3>
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Notas Adicionales</Label>
          <Textarea
            id="notes"
            {...register('notes')}
            placeholder="Notas, comentarios o información adicional..."
            rows={4}
          />
          {errors.notes && (
            <p className="text-sm text-red-600">{errors.notes.message}</p>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-4 border-t pt-6">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-amber-500 hover:bg-amber-600 text-white"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? 'Guardando...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
