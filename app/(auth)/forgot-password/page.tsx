'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { requestPasswordReset } from './actions';

const forgotPasswordSchema = z.object({
  email: z.string().email('Ingresa un correo electrónico válido'),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    setIsSubmitting(true);
    setGlobalError(null);

    try {
      const result = await requestPasswordReset(data.email);

      if (result.success) {
        setIsSuccess(true);
      } else {
        setGlobalError(result.error || 'Error al procesar la solicitud');
      }
    } catch (error) {
      console.error('Error requesting password reset:', error);
      setGlobalError('Error al procesar la solicitud. Por favor intenta de nuevo.');
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
          <h2 className="text-2xl font-bold">Revisa tu correo</h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Si el correo electrónico está registrado, recibirás instrucciones para restablecer tu contraseña.
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-center text-muted-foreground">
            ¿No recibiste el correo? Revisa tu carpeta de spam o{' '}
            <button
              type="button"
              onClick={() => {
                setIsSuccess(false);
                form.reset();
              }}
              className="text-primary hover:underline font-medium"
            >
              intenta de nuevo
            </button>
          </p>

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-2">
          <Mail className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">¿Olvidaste tu contraseña?</h2>
        <p className="text-sm text-muted-foreground">
          Ingresa tu correo electrónico y te enviaremos instrucciones para restablecerla
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

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Correo Electrónico</Label>
          <Input
            id="email"
            type="email"
            placeholder="tu@email.com"
            autoComplete="email"
            {...form.register('email')}
            disabled={isSubmitting}
          />
          {form.formState.errors.email && (
            <p className="text-sm text-destructive">
              {form.formState.errors.email.message}
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
          {isSubmitting ? 'Enviando...' : 'Enviar Instrucciones'}
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
