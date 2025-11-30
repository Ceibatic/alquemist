'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Mail, CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { CodeInput } from '@/components/shared/code-input';
import { CountdownTimer } from '@/components/shared/countdown-timer';
import { verifyEmailCode, resendVerificationEmail } from './actions';

export default function VerifyEmailPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState<string>('');
  const [userId, setUserId] = React.useState<string>('');
  const [code, setCode] = React.useState('');
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [isResending, setIsResending] = React.useState(false);
  const [isVerified, setIsVerified] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  // Get email and userId from sessionStorage
  React.useEffect(() => {
    const signupEmail = sessionStorage.getItem('signupEmail');
    const signupUserId = sessionStorage.getItem('signupUserId');

    if (!signupEmail) {
      // Redirect to signup if no email found
      router.push('/signup');
    } else {
      setEmail(signupEmail);
      if (signupUserId) {
        setUserId(signupUserId);
      }
    }
  }, [router]);

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError('Por favor ingresa el código completo de 6 dígitos');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const result = await verifyEmailCode(code);

      if (!result.success) {
        setError(result.error || 'Código inválido. Por favor intenta de nuevo.');
        setIsVerifying(false);
        return;
      }

      // Store userId for company setup
      if (result.userId) {
        sessionStorage.setItem('signupUserId', result.userId);
      }

      // Show success message
      setIsVerified(true);
      setIsVerifying(false);

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/company-setup');
      }, 2000);
    } catch (err) {
      console.error('Verification error:', err);
      setError('Error al verificar. Por favor intenta de nuevo.');
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;

    setIsResending(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await resendVerificationEmail(email);

      if (!result.success) {
        setError(result.error || 'Error al reenviar email');
        return;
      }

      // Log token for development
      if (result.verificationToken) {
        console.log('==============================================');
        console.log(`New verification code: ${result.verificationToken}`);
        console.log('==============================================');
      }

      setSuccess('Email de verificación reenviado. Revisa tu bandeja de entrada.');
    } catch (err) {
      console.error('Resend error:', err);
      setError('Error al reenviar email');
    } finally {
      setIsResending(false);
    }
  };

  // Expiration time: 24 hours from now
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

  if (!email) {
    return (
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
      </div>
    );
  }

  // Success screen after verification
  if (isVerified) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-700">Email Verificado</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Tu email ha sido verificado exitosamente.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Redirigiendo a configuración de empresa...
          </p>
          <Loader2 className="h-5 w-5 animate-spin mx-auto mt-4 text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
          <Mail className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Verifica tu Email</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Enviamos un código de verificación a:
        </p>
        <p className="text-sm font-medium mt-1">{email}</p>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md text-center">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 text-green-800 text-sm p-3 rounded-md text-center">
          {success}
        </div>
      )}

      <div className="space-y-4">
        <div className="bg-muted/50 p-4 rounded-md space-y-4">
          <p className="text-sm text-center">
            Ingresa el código de 6 dígitos que enviamos a tu correo:
          </p>

          <div>
            <p className="text-sm font-medium mb-2 text-center">
              Código de 6 dígitos:
            </p>
            <CodeInput
              length={6}
              value={code}
              onChange={setCode}
            />
          </div>
        </div>

        <CountdownTimer expiresAt={expiresAt} />

        <Button
          onClick={handleVerify}
          className="w-full"
          disabled={code.length !== 6 || isVerifying}
        >
          {isVerifying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verificando...
            </>
          ) : (
            'VERIFICAR EMAIL'
          )}
        </Button>

        <div className="bg-muted/50 p-4 rounded-md space-y-2">
          <p className="text-sm font-medium">¿No recibiste el email?</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Revisa tu carpeta de spam</li>
            <li>
              •{' '}
              <button
                onClick={handleResend}
                disabled={isResending}
                className="text-primary hover:underline disabled:opacity-50"
              >
                {isResending ? 'Reenviando...' : 'Reenviar Email de Verificación'}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
