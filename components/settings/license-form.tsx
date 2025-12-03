'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
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
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Loader2, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

const licenseSchema = z.object({
  license_number: z
    .string()
    .min(1, 'Número de licencia es requerido')
    .max(100, 'Número no puede exceder 100 caracteres'),
  license_type: z
    .string()
    .min(1, 'Tipo de licencia es requerido'),
  license_authority: z
    .string()
    .min(1, 'Autoridad emisora es requerida')
    .max(200, 'Autoridad no puede exceder 200 caracteres'),
  license_issued_date: z
    .string()
    .min(1, 'Fecha de emisión es requerida'),
  license_expiry_date: z
    .string()
    .min(1, 'Fecha de vencimiento es requerida'),
});

type LicenseFormData = z.infer<typeof licenseSchema>;

interface LicenseFormProps {
  facilityId: Id<'facilities'>;
  facility: any;
}

export function LicenseForm({ facilityId, facility }: LicenseFormProps) {
  const updateFacility = useMutation(api.facilities.update);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LicenseFormData>({
    resolver: zodResolver(licenseSchema),
    defaultValues: {
      license_number: facility.license_number || '',
      license_type: facility.license_type || '',
      license_authority: facility.license_authority || 'ICA',
      license_issued_date: facility.license_issued_date
        ? new Date(facility.license_issued_date).toISOString().split('T')[0]
        : '',
      license_expiry_date: facility.license_expiry_date
        ? new Date(facility.license_expiry_date).toISOString().split('T')[0]
        : '',
    },
  });

  const expiryDateStr = watch('license_expiry_date');

  // Calculate license status
  const getLicenseStatus = () => {
    if (!expiryDateStr) return null;

    const expiryDate = new Date(expiryDateStr);
    const today = new Date();
    const daysUntilExpiry = differenceInDays(expiryDate, today);

    if (daysUntilExpiry < 0) {
      return {
        status: 'expired',
        label: 'Vencida',
        color: 'destructive' as const,
        icon: AlertTriangle,
        message: `La licencia venció hace ${Math.abs(daysUntilExpiry)} días`,
      };
    } else if (daysUntilExpiry <= 90) {
      return {
        status: 'expiring',
        label: 'Por Vencer',
        color: 'warning' as const,
        icon: Clock,
        message: `La licencia vence en ${daysUntilExpiry} días`,
      };
    } else {
      return {
        status: 'valid',
        label: 'Vigente',
        color: 'success' as const,
        icon: CheckCircle2,
        message: `La licencia es válida por ${daysUntilExpiry} días más`,
      };
    }
  };

  const licenseStatus = getLicenseStatus();

  const onSubmit = async (data: LicenseFormData) => {
    try {
      await updateFacility({
        id: facilityId,
        companyId: facility.company_id,
        license_number: data.license_number,
        license_type: data.license_type,
        license_authority: data.license_authority,
        license_issued_date: new Date(data.license_issued_date).getTime(),
        license_expiry_date: new Date(data.license_expiry_date).getTime(),
      });

      toast.success('Información de licencia actualizada exitosamente');
    } catch (error) {
      toast.error('Error al actualizar licencia');
      console.error('Error updating license:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Licencias y Permisos</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Información sobre licencias y permisos regulatorios
        </p>
      </div>

      {/* License Status Alert */}
      {licenseStatus && (
        <Alert
          variant={
            licenseStatus.status === 'expired'
              ? 'destructive'
              : licenseStatus.status === 'expiring'
                ? 'default'
                : 'default'
          }
          className={
            licenseStatus.status === 'valid'
              ? 'border-green-200 bg-green-50 text-green-900'
              : licenseStatus.status === 'expiring'
                ? 'border-yellow-200 bg-yellow-50 text-yellow-900'
                : ''
          }
        >
          <licenseStatus.icon className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{licenseStatus.message}</span>
            <Badge
              variant={
                licenseStatus.status === 'expired'
                  ? 'destructive'
                  : licenseStatus.status === 'expiring'
                    ? 'outline'
                    : 'default'
              }
              className={
                licenseStatus.status === 'valid'
                  ? 'bg-green-600 hover:bg-green-700'
                  : licenseStatus.status === 'expiring'
                    ? 'border-yellow-600 text-yellow-700'
                    : ''
              }
            >
              {licenseStatus.label}
            </Badge>
          </AlertDescription>
        </Alert>
      )}

      {/* License Number */}
      <div className="space-y-2">
        <Label htmlFor="license_number">
          Número de Licencia <span className="text-destructive">*</span>
        </Label>
        <Input
          id="license_number"
          {...register('license_number')}
          placeholder="Ej: LIC-2024-001234"
        />
        {errors.license_number && (
          <p className="text-sm text-destructive">{errors.license_number.message}</p>
        )}
      </div>

      {/* License Type */}
      <div className="space-y-2">
        <Label htmlFor="license_type">
          Tipo de Licencia <span className="text-destructive">*</span>
        </Label>
        <Select
          defaultValue={facility.license_type}
          onValueChange={(value) => setValue('license_type', value)}
        >
          <SelectTrigger id="license_type">
            <SelectValue placeholder="Selecciona tipo de licencia" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cultivation">Cultivo</SelectItem>
            <SelectItem value="processing">Procesamiento</SelectItem>
            <SelectItem value="research">Investigación</SelectItem>
            <SelectItem value="production">Producción</SelectItem>
            <SelectItem value="distribution">Distribución</SelectItem>
            <SelectItem value="other">Otro</SelectItem>
          </SelectContent>
        </Select>
        {errors.license_type && (
          <p className="text-sm text-destructive">{errors.license_type.message}</p>
        )}
      </div>

      {/* License Authority */}
      <div className="space-y-2">
        <Label htmlFor="license_authority">
          Autoridad Emisora <span className="text-destructive">*</span>
        </Label>
        <Select
          defaultValue={facility.license_authority || 'ICA'}
          onValueChange={(value) => setValue('license_authority', value)}
        >
          <SelectTrigger id="license_authority">
            <SelectValue placeholder="Selecciona autoridad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ICA">ICA (Instituto Colombiano Agropecuario)</SelectItem>
            <SelectItem value="INVIMA">INVIMA</SelectItem>
            <SelectItem value="MinSalud">Ministerio de Salud</SelectItem>
            <SelectItem value="MinAgricultura">Ministerio de Agricultura</SelectItem>
            <SelectItem value="other">Otra</SelectItem>
          </SelectContent>
        </Select>
        {errors.license_authority && (
          <p className="text-sm text-destructive">{errors.license_authority.message}</p>
        )}
      </div>

      {/* License Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="license_issued_date">
            Fecha de Emisión <span className="text-destructive">*</span>
          </Label>
          <Input
            id="license_issued_date"
            type="date"
            {...register('license_issued_date')}
          />
          {errors.license_issued_date && (
            <p className="text-sm text-destructive">{errors.license_issued_date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="license_expiry_date">
            Fecha de Vencimiento <span className="text-destructive">*</span>
          </Label>
          <Input
            id="license_expiry_date"
            type="date"
            {...register('license_expiry_date')}
          />
          {errors.license_expiry_date && (
            <p className="text-sm text-destructive">{errors.license_expiry_date.message}</p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4 border-t">
        <Button type="submit" disabled={isSubmitting} className="bg-[#1B5E20] hover:bg-[#1B5E20]/90">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            'Guardar Cambios'
          )}
        </Button>
      </div>
    </form>
  );
}
