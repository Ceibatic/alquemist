'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ArrowRight, Building2, UserCheck, Factory } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WelcomeData {
  companyName: string;
  roleName: string;
  facilities: string[];
}

export default function WelcomeInvitedPage() {
  const router = useRouter();
  const [welcomeData, setWelcomeData] = useState<WelcomeData | null>(null);

  useEffect(() => {
    // Retrieve welcome data from sessionStorage
    const storedData = sessionStorage.getItem('welcomeData');

    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        setWelcomeData(data);
      } catch {
        // Fallback to placeholder data if parsing fails
        setWelcomeData({
          companyName: 'Tu Empresa',
          roleName: 'Miembro del Equipo',
          facilities: [],
        });
      }
    } else {
      // Fallback to placeholder data
      setWelcomeData({
        companyName: 'Tu Empresa',
        roleName: 'Miembro del Equipo',
        facilities: [],
      });
    }

    // Clean up sessionStorage
    return () => {
      sessionStorage.removeItem('invitationToken');
      sessionStorage.removeItem('welcomeData');
    };
  }, []);

  const handleContinue = () => {
    router.push('/dashboard');
  };

  if (!welcomeData) {
    return (
      <div className="space-y-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Icon */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>

        <h2 className="text-3xl font-bold text-green-600">
          ¡Bienvenido a Alquemist!
        </h2>

        <p className="text-muted-foreground max-w-md mx-auto">
          Tu cuenta ha sido creada exitosamente. Ahora eres parte del equipo.
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
              <h3 className="font-semibold text-green-900">Empresa</h3>
              <p className="text-sm text-green-700 mt-1">
                {welcomeData.companyName}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-900">Tu Rol</h3>
              <p className="text-sm text-green-700 mt-1">{welcomeData.roleName}</p>
            </div>
          </div>
        </div>

        {welcomeData.facilities.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <Factory className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 mb-2">
                  Instalaciones Asignadas
                </h3>
                <ul className="space-y-1">
                  {welcomeData.facilities.map((facility, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 text-sm text-green-700"
                    >
                      <span className="text-green-600">•</span>
                      <span>{facility}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Next Steps */}
      <div className="bg-muted/50 rounded-lg p-5 space-y-3">
        <h3 className="font-semibold">Próximos Pasos</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>Explora el panel de control</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>Familiarízate con tus instalaciones asignadas</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>Revisa los permisos de tu rol</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>Contacta a tu administrador si tienes preguntas</span>
          </li>
        </ul>
      </div>

      {/* Action Button */}
      <div className="space-y-3">
        <Button
          onClick={handleContinue}
          className="w-full"
          size="lg"
        >
          IR AL PANEL DE CONTROL
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
