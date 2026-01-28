'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, KeyRound, CheckCircle } from 'lucide-react';
import { useAuthActions } from '@convex-dev/auth/react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/shared/password-input';
import { CodeInput } from '@/components/shared/code-input';

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe incluir al menos una mayúscula')
    .regex(/[a-z]/, 'Debe incluir al menos una minúscula')
    .regex(/[0-9]/, 'Debe incluir al menos un número')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Debe incluir al menos un carácter especial'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuthActions();

  const [code, setCode] = useState(searchParams.get('token') || '');
  const [email] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('resetEmail') || '';
    }
    return '';
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ResetPasswordValues) => {
    if (code.length !== 6) {
      setGlobalError('Por favor ingresa el código de 6 dígitos');
      return;
    }

    if (!email) {
      setGlobalError('Email no encontrado. Por favor solicita un nuevo código.');
      return;
    }

    setIsSubmitting(true);
    setGlobalError(null);

    try {
      // Use Convex Auth to verify code and set new password
      await signIn('password', {
        email,
        code,
        newPassword: data.password,
        flow: 'reset-verification',
      });

      setIsSuccess(true);
    } catch (err: any) {
      setGlobalError(err?.message || 'Error al restablecer la contraseña. Código inválido o expirado.');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-2">
          <KeyRound className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Nueva Contraseña</h2>
        <p className="text-sm text-muted-foreground">
          Ingresa el código que recibiste y tu nueva contraseña
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

        {/* OTP Code */}
        <div className="space-y-2">
          <Label>Código de verificación</Label>
          <CodeInput
            length={6}
            value={code}
            onChange={setCode}
          />
        </div>

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
            Debe incluir mayúsculas, minúsculas, números y carácter especial
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
          disabled={isSubmitting || code.length !== 6}
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
