'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { toast } from 'sonner';
import { Power } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

interface SupplierStatusToggleProps {
  supplierId: Id<'suppliers'>;
  companyId: Id<'companies'>;
  isActive: boolean;
  onSuccess?: () => void;
  variant?: 'button' | 'icon';
}

export function SupplierStatusToggle({
  supplierId,
  companyId,
  isActive,
  onSuccess,
  variant = 'button',
}: SupplierStatusToggleProps) {
  const [open, setOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const toggleStatus = useMutation(api.suppliers.toggleStatus);

  const handleToggle = async () => {
    try {
      setIsUpdating(true);
      await toggleStatus({
        supplierId,
        companyId,
      });
      toast.success(
        isActive
          ? 'Proveedor desactivado exitosamente'
          : 'Proveedor activado exitosamente'
      );
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error toggling supplier status:', error);
      toast.error('Error al cambiar el estado del proveedor');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {variant === 'button' ? (
          <Button
            variant={isActive ? 'outline' : 'default'}
            className={cn(
              !isActive && 'bg-green-600 hover:bg-green-700'
            )}
          >
            <Power className="mr-2 h-4 w-4" />
            {isActive ? 'Desactivar' : 'Activar'}
          </Button>
        ) : (
          <Button variant="ghost" size="icon">
            <Power className="h-4 w-4" />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isActive ? 'Desactivar Proveedor' : 'Activar Proveedor'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isActive
              ? '¿Estás seguro de que deseas desactivar este proveedor? Los proveedores desactivados no aparecerán en las búsquedas activas.'
              : '¿Estás seguro de que deseas activar este proveedor? El proveedor estará disponible para nuevas operaciones.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isUpdating}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleToggle}
            disabled={isUpdating}
            className={cn(
              isActive
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-green-600 hover:bg-green-700'
            )}
          >
            {isUpdating
              ? 'Procesando...'
              : isActive
              ? 'Desactivar'
              : 'Activar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
