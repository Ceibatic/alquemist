'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LogIn, Loader2 } from 'lucide-react';
import { useAuth, useSignIn } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { loginSchema, type LoginFormValues } from '@/lib/validations';
import { getClerkErrorMessage } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/shared/password-input';

export default function LoginPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { signIn, setActive, isLoaded } = useSignIn();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Check onboarding status if user is already authenticated
  const onboardingStatus = useQuery(
    authLoaded && isSignedIn ? api.users.getOnboardingStatus : 'skip' as any
  );

  // Auto-redirect authenticated users
  useEffect(() => {
    if (!authLoaded) return;
    if (!isSignedIn) return; // Show login form normally

    if (onboardingStatus === undefined) return; // Loading
    if (onboardingStatus === null) return; // No user in Convex (edge case)

    // Redirect based on onboarding status
    if (!onboardingStatus.hasCompany) {
      router.replace('/company-setup');
    } else if (!onboardingStatus.onboardingCompleted) {
      router.replace('/facility-basic');
    } else {
      router.replace('/dashboard');
    }
  }, [authLoaded, isSignedIn, onboardingStatus, router]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    if (!isLoaded) return;

    setIsSubmitting(true);
    setGlobalError(null);

    try {
      const result = await signIn.create({
        identifier: data.email,
        password: data.password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        // Full page redirect to force middleware re-evaluation of auth cookies
        // Dashboard layout will redirect to onboarding if not completed
        window.location.href = '/dashboard';
      }
    } catch (err: unknown) {
      setGlobalError(getClerkErrorMessage(err, 'Correo electrónico o contraseña incorrectos'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loader while checking auth status
  if (!authLoaded || !isLoaded) return null;

  if (isSignedIn && onboardingStatus === undefined) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Verificando sesión...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-2">
          <LogIn className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Iniciar Sesión</h2>
        <p className="text-sm text-muted-foreground">
          Accede a tu cuenta de Alquemist
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

        {/* Password */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Contraseña</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-primary hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            {...form.register('password')}
            disabled={isSubmitting}
          />
          {form.formState.errors.password && (
            <p className="text-sm text-destructive">
              {form.formState.errors.password.message}
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
          {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </Button>
      </form>

      {/* Footer */}
      <div className="text-center text-sm">
        <span className="text-muted-foreground">¿No tienes una cuenta? </span>
        <Link href="/signup" className="text-primary hover:underline font-medium">
          Regístrate
        </Link>
      </div>
    </div>
  );
}
