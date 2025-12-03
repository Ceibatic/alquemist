'use client';

import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function InvitationInvalidPage() {
  const router = useRouter();

  const handleGoToLogin = () => {
    router.push('/login');
  };

  return (
    <div className="space-y-6">
      {/* Error Icon */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full mb-4">
          <AlertTriangle className="w-12 h-12 text-amber-600" />
        </div>

        <h2 className="text-3xl font-bold text-amber-600">
          Invitación No Válida
        </h2>

        <p className="text-muted-foreground max-w-md mx-auto">
          No pudimos validar tu invitación. Por favor revisa los posibles
          motivos a continuación.
        </p>
      </div>

      {/* Reasons */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 space-y-3">
        <h3 className="font-semibold text-amber-900">Posibles Razones:</h3>
        <ul className="space-y-2 text-sm text-amber-800">
          <li className="flex items-start gap-2">
            <span className="text-amber-600 mt-0.5">•</span>
            <span>
              El enlace ha expirado (las invitaciones son válidas por 72 horas)
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 mt-0.5">•</span>
            <span>La invitación ya fue utilizada</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 mt-0.5">•</span>
            <span>El enlace es incorrecto o ha sido modificado</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 mt-0.5">•</span>
            <span>La invitación fue rechazada o cancelada</span>
          </li>
        </ul>
      </div>

      {/* Instructions */}
      <div className="bg-muted/50 rounded-lg p-5 space-y-3">
        <h3 className="font-semibold">¿Qué puedes hacer?</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>
              Contacta al administrador de tu empresa para recibir una nueva
              invitación
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>
              Verifica que estés usando el enlace más reciente de tu correo
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>
              Si ya tienes una cuenta, intenta iniciar sesión directamente
            </span>
          </li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button onClick={handleGoToLogin} className="w-full" size="lg">
          IR A INICIAR SESIÓN
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            ¿Necesitas ayuda?{' '}
            <a
              href="mailto:soporte@alquemist.com"
              className="text-primary hover:underline"
            >
              Contacta a soporte
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
