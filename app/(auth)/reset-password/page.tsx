'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, KeyRound, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/shared/password-input';
import { verifyResetToken, resetPassword } from './actions';

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe incluir al menos una mayúscula')
    .regex(/[a-z]/, 'Debe incluir al menos una minúscula')
    .regex(/[0-9]/, 'Debe incluir al menos un número'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tokenValidation, setTokenValidation] = useState<{
    valid: boolean;
    email?: string;
    error?: string;
  } | null>(null);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  // Verify token on mount
  useEffect(() => {
    async function checkToken() {
      if (!token) {
        setTokenValidation({ valid: false, error: 'Código inválido' });
        setIsLoading(false);
        return;
      }

      const result = await verifyResetToken(token);
      setTokenValidation(result);
      setIsLoading(false);
    }

    checkToken();
  }, [token]);

  const onSubmit = async (data: ResetPasswordValues) => {
    if (!token) return;

    setIsSubmitting(true);
    setGlobalError(null);

    try {
      const result = await resetPassword(token, data.password);

      if (result.success) {
        setIsSuccess(true);
      } else {
        setGlobalError(result.error || 'Error al restablecer la contraseña');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setGlobalError('Error al restablecer la contraseña. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state
  if (isSuccess) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold">Contraseña actualizada</h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
          </p>
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={() => router.push('/login')}
        >
          Iniciar Sesión
        </Button>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-green-600 mx-auto" />
          <p className="text-sm text-muted-foreground">Verificando código...</p>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (!token || !tokenValidation?.valid) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold">Enlace inválido</h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            {tokenValidation?.error || 'El enlace de recuperación es inválido o ha expirado.'}
          </p>
        </div>

        <div className="space-y-3">
          <Button
            className="w-full"
            variant="outline"
            onClick={() => router.push('/forgot-password')}
          >
            Solicitar nuevo enlace
          </Button>
          <div className="text-center">
            <Link
              href="/login"
              className="inline-flex items-center text-sm text-primary hover:underline"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Form state
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-2">
          <KeyRound className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Nueva Contraseña</h2>
        <p className="text-sm text-muted-foreground">
          Ingresa tu nueva contraseña para <strong>{tokenValidation.email}</strong>
        </p>
      </div>

      {/* Form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* Global Error */}
        {globalError && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
            {globalError}
          </div>
        )}

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">Nueva Contraseña</Label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            {...form.register('password')}
            disabled={isSubmitting}
          />
          {form.formState.errors.password && (
            <p className="text-sm text-destructive">
              {form.formState.errors.password.message}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Debe incluir mayúsculas, minúsculas y números
          </p>
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            placeholder="Repite tu contraseña"
            {...form.register('confirmPassword')}
            disabled={isSubmitting}
          />
          {form.formState.errors.confirmPassword && (
            <p className="text-sm text-destructive">
              {form.formState.errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Actualizando...' : 'Restablecer Contraseña'}
        </Button>
      </form>

      {/* Footer */}
      <div className="text-center">
        <Link
          href="/login"
          className="inline-flex items-center text-sm text-primary hover:underline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Iniciar Sesión
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-green-600 mx-auto" />
            <p className="text-sm text-muted-foreground">Cargando...</p>
          </div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
