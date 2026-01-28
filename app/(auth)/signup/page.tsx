'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuthActions } from '@convex-dev/auth/react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

import { signupSchema, type SignupFormValues, allPasswordRequirementsMet } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { PasswordInput } from '@/components/shared/password-input';
import { PhoneInput } from '@/components/shared/phone-input';
import { PasswordRequirements } from '@/components/shared/password-requirements';
import { checkEmailAvailability } from './actions';

export default function SignupPage() {
  const router = useRouter();
  const { signIn } = useAuthActions();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [emailAvailable, setEmailAvailable] = React.useState<boolean | null>(null);
  const [checkingEmail, setCheckingEmail] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      termsAccepted: false,
    },
  });

  const watchPassword = form.watch('password');
  const watchEmail = form.watch('email');

  // Check email availability with debounce
  React.useEffect(() => {
    const timer = setTimeout(async () => {
      if (watchEmail && watchEmail.includes('@')) {
        setCheckingEmail(true);
        const result = await checkEmailAvailability(watchEmail);
        setEmailAvailable(result.available);
        setCheckingEmail(false);

        if (!result.available) {
          form.setError('email', {
            type: 'manual',
            message: 'Este email ya está registrado',
          });
        } else {
          form.clearErrors('email');
        }
      } else {
        setEmailAvailable(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [watchEmail, form]);

  const onSubmit = async (data: SignupFormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Store data for post-verification onboarding
      sessionStorage.setItem('signupEmail', data.email);
      sessionStorage.setItem('signupFirstName', data.firstName);
      sessionStorage.setItem('signupLastName', data.lastName);
      if (data.phone) sessionStorage.setItem('signupPhone', data.phone);

      // Use Convex Auth to sign up with password + email verification
      await signIn('password', {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || '',
        flow: 'signUp',
      });

      // Convex Auth sends OTP automatically via ResendOTP provider
      router.push('/verify-email');
    } catch (err: any) {
      const message = err?.message || 'Error inesperado. Por favor intenta de nuevo.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const allRequirementsMet = allPasswordRequirementsMet(watchPassword);
  const isFormValid =
    form.formState.isValid && emailAvailable === true && allRequirementsMet;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Crear Cuenta</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Comienza tu prueba gratuita de 30 días
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* First Name */}
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre *</FormLabel>
                <FormControl>
                  <Input placeholder="Juan" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Last Name */}
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellido *</FormLabel>
                <FormControl>
                  <Input placeholder="Pérez" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo Electrónico *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="email"
                      placeholder="juan@ejemplo.com"
                      {...field}
                    />
                    {checkingEmail && (
                      <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                </FormControl>
                {emailAvailable === true && (
                  <p className="text-xs text-green-600">
                    ✓ Email disponible
                  </p>
                )}
                {emailAvailable === false && (
                  <p className="text-xs text-destructive">
                    ✗ Email ya registrado
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña *</FormLabel>
                <FormControl>
                  <PasswordInput placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password Requirements */}
          {watchPassword && (
            <PasswordRequirements password={watchPassword} />
          )}

          {/* Confirm Password */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar Contraseña *</FormLabel>
                <FormControl>
                  <PasswordInput placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phone (Optional) */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono (opcional)</FormLabel>
                <FormControl>
                  <PhoneInput {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Terms Checkbox */}
          <FormField
            control={form.control}
            name="termsAccepted"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-normal">
                    Acepto los{' '}
                    <Link
                      href="/terms"
                      className="text-primary hover:underline"
                    >
                      Términos de Servicio
                    </Link>{' '}
                    y{' '}
                    <Link
                      href="/privacy"
                      className="text-primary hover:underline"
                    >
                      Política de Privacidad
                    </Link>
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-yellow hover:bg-yellow-700"
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando cuenta...
              </>
            ) : (
              'CREAR CUENTA'
            )}
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">¿Ya tienes cuenta? </span>
        <Link href="/login" className="text-primary hover:underline font-medium">
          Iniciar Sesión
        </Link>
      </div>
    </div>
  );
}
