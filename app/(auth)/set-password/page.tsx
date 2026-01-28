'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import {
  invitationAcceptSchema,
  type InvitationAcceptFormValues,
  allPasswordRequirementsMet,
} from '@/lib/validations';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { PasswordInput } from '@/components/shared/password-input';
import { PhoneInput } from '@/components/shared/phone-input';
import { PasswordRequirements } from '@/components/shared/password-requirements';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useAuthActions } from '@convex-dev/auth/react';
import { acceptInvitation } from './actions';

export default function SetPasswordPage() {
  const router = useRouter();
  const { signIn } = useAuthActions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const form = useForm<InvitationAcceptFormValues>({
    resolver: zodResolver(invitationAcceptSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
      phone: '',
      language: 'es',
    },
  });

  const watchPassword = form.watch('password');
  const allRequirementsMet = allPasswordRequirementsMet(watchPassword);

  useEffect(() => {
    // Retrieve token from sessionStorage
    const storedToken = sessionStorage.getItem('invitationToken');
    if (!storedToken) {
      router.push('/login');
      return;
    }
    setToken(storedToken);
  }, [router]);

  const onSubmit = async (data: InvitationAcceptFormValues) => {
    if (!token) {
      setError('Token de invitación no encontrado');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await acceptInvitation({ ...data, token });

      if (result.success && result.email) {
        // Sign in via Convex Auth to create a real session
        // The account was already created by the accept action using createAccount()
        await signIn('password', {
          email: result.email,
          password: data.password,
          flow: 'signIn',
        });

        // Store welcome data for the welcome page
        if (result.invitation) {
          sessionStorage.setItem('welcomeData', JSON.stringify({
            companyName: result.invitation.companyName,
            roleName: result.invitation.roleName,
            facilities: result.invitation.facilities,
          }));
        }

        // Navigate to welcome page
        router.push('/welcome-invited');
      } else {
        setError(result.error || 'Error al crear la cuenta');
      }
    } catch (err) {
      console.error('Error accepting invitation:', err);
      setError('Error inesperado. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    // Use window.location for dynamic query params with typed routes
    window.location.href = `/accept-invitation?token=${token}`;
  };

  const isFormValid = form.formState.isValid && allRequirementsMet;

  if (!token) {
    return (
      <div className="space-y-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Configurar tu Cuenta</h2>
        <p className="text-sm text-muted-foreground">
          Crea tu contraseña para completar el registro
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          {watchPassword && <PasswordRequirements password={watchPassword} />}

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

          {/* Language Preference */}
          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Idioma Preferido</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="es" id="es" />
                      <Label htmlFor="es" className="font-normal cursor-pointer">
                        Español
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="en" id="en" />
                      <Label htmlFor="en" className="font-normal cursor-pointer">
                        English
                      </Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleBack}
              disabled={isSubmitting}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              VOLVER
            </Button>

            <Button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-white"
              size="lg"
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
          </div>
        </form>
      </Form>
    </div>
  );
}
