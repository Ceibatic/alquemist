'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, Building2, Factory, Loader2 } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';

export default function SetupCompletePage() {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const completeOnboarding = useMutation(api.users.completeOnboarding);

  useEffect(() => {
    // Verify that setup was actually completed
    const companyId = sessionStorage.getItem('companyId');
    const facilityId = sessionStorage.getItem('facilityId');

    if (!companyId || !facilityId) {
      router.push('/company-setup');
    }
  }, [router]);

  const handleContinue = async () => {
    setIsNavigating(true);

    try {
      // Mark onboarding as completed in the database
      await completeOnboarding();

      // Clear onboarding session data
      sessionStorage.removeItem('companyId');
      sessionStorage.removeItem('facilityId');
      sessionStorage.removeItem('signupUserId');
      sessionStorage.removeItem('signupEmail');
      sessionStorage.removeItem('signupFirstName');
      sessionStorage.removeItem('signupLastName');
      sessionStorage.removeItem('signupPhone');

      // Navigate to dashboard — user is already authenticated via Convex Auth
      router.push('/dashboard');
    } catch (error) {
      console.error('Error navigating to dashboard:', error);
      setIsNavigating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Icon */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>

        <h2 className="text-3xl font-bold text-green-600">
          ¡Configuración Completa!
        </h2>

        <p className="text-muted-foreground max-w-md mx-auto">
          Has completado exitosamente la configuración inicial de tu cuenta en
          Alquemist. Ya puedes comenzar a gestionar tu operación agrícola.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="space-y-3">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-900">
                Empresa Registrada
              </h3>
              <p className="text-sm text-green-700 mt-1">
                Tu empresa ha sido creada y configurada exitosamente
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <Factory className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-900">
                Instalación Configurada
              </h3>
              <p className="text-sm text-green-700 mt-1">
                Tu primera instalación agrícola está lista para operar
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-muted/50 rounded-lg p-5 space-y-3">
        <h3 className="font-semibold">Próximos Pasos</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">1.</span>
            <span>Crea tus áreas de cultivo (propagación, vegetativo, floración, etc.)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">2.</span>
            <span>Agrega los cultivares que produces (variedades, genéticas)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">3.</span>
            <span>Registra tu inventario inicial (plantas madre, semillas, nutrientes)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">4.</span>
            <span>Invita a tu equipo para comenzar a colaborar</span>
          </li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          onClick={handleContinue}
          className="w-full"
          size="lg"
          disabled={isNavigating}
        >
          {isNavigating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Preparando dashboard...
            </>
          ) : (
            <>
              Ir al Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Paso 4 de 4 - Configuración Completa
        </p>
      </div>

      {/* Help Link */}
      <div className="text-center pt-4 border-t">
        <p className="text-sm text-muted-foreground">
          ¿Necesitas ayuda?{' '}
          <Link href="/help" className="text-primary hover:underline">
            Visita nuestro centro de ayuda
          </Link>
        </p>
      </div>
    </div>
  );
}
