'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useSignUp } from '@clerk/nextjs';
import {
  invitationAcceptSchema,
  type InvitationAcceptFormValues,
  allPasswordRequirementsMet,
} from '@/lib/validations';
import { getClerkErrorMessage } from '@/lib/utils';
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
import { acceptInvitation } from './actions';

export default function SetPasswordPage() {
  const router = useRouter();
  const { signUp, setActive, isLoaded } = useSignUp();
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
    if (!token || !isLoaded) {
      setError('Token de invitación no encontrado');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Step 1: Accept invitation in backend (validates token, marks invitation)
      const result = await acceptInvitation({ ...data, token });

      if (!result.success) {
        setError(result.error || 'Error al crear la cuenta');
        return;
      }

      // Step 2: Create Clerk account with the invitation email
      const invitationEmail = sessionStorage.getItem('invitationEmail');
      const invitationFirstName = sessionStorage.getItem('invitationFirstName');
      const invitationLastName = sessionStorage.getItem('invitationLastName');

      if (!invitationEmail) {
        setError('Email de invitación no encontrado');
        return;
      }

      await signUp.create({
        emailAddress: invitationEmail,
        password: data.password,
        firstName: invitationFirstName || undefined,
        lastName: invitationLastName || undefined,
      });

      // Step 3: Prepare and verify email (skip verification for invited users)
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      // Store invitation data for welcome page
      if (result.invitation) {
        sessionStorage.setItem('welcomeData', JSON.stringify({
          companyName: result.invitation.companyName,
          roleName: result.invitation.roleName,
          facilities: result.invitation.facilities,
        }));
      }

      // Navigate to verify-email page for the invited user
      sessionStorage.setItem('signupEmail', invitationEmail);
      sessionStorage.setItem('isInvitedUser', 'true');
      router.push('/verify-email');
    } catch (err: unknown) {
      console.error('Error accepting invitation:', err);
      setError(getClerkErrorMessage(err, 'Error inesperado. Por favor intenta de nuevo.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    // Use window.location for dynamic query params with typed routes
    window.location.href = `/accept-invitation?token=${token}`;
  };

  const isFormValid = form.formState.isValid && allRequirementsMet;

  if (!token || !isLoaded) {
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

          {/* Clerk CAPTCHA widget mount point (required for bot protection with custom flows) */}
          <div id="clerk-captcha" />

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
