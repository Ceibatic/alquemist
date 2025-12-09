'use client';

import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Building2, Users, Sparkles, ArrowRight } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';

// Plan definitions
const PLANS = [
  {
    id: 'trial',
    name: 'Prueba Gratuita',
    price: 'Gratis',
    period: '30 días',
    facilities: 1,
    users: 3,
    features: [
      'Gestión básica de áreas',
      'Registro de cultivares',
      'Control de inventario básico',
      'Reportes limitados',
    ],
    cta: 'Plan Actual',
    highlighted: false,
  },
  {
    id: 'starter',
    name: 'Inicial',
    price: '$X',
    period: '/mes',
    facilities: 5,
    users: 10,
    features: [
      'Todo lo de Prueba',
      'Múltiples instalaciones',
      'Gestión de equipo',
      'Reportes completos',
      'Soporte por email',
    ],
    cta: 'Próximamente',
    highlighted: true,
  },
  {
    id: 'pro',
    name: 'Profesional',
    price: '$Y',
    period: '/mes',
    facilities: 20,
    users: 50,
    features: [
      'Todo lo de Inicial',
      'Trazabilidad avanzada',
      'Integraciones API',
      'Reportes personalizados',
      'Soporte prioritario',
    ],
    cta: 'Próximamente',
    highlighted: false,
  },
  {
    id: 'enterprise',
    name: 'Empresarial',
    price: 'Contactar',
    period: '',
    facilities: -1, // Unlimited
    users: -1, // Unlimited
    features: [
      'Todo lo de Profesional',
      'Instalaciones ilimitadas',
      'Usuarios ilimitados',
      'Onboarding personalizado',
      'SLA garantizado',
    ],
    cta: 'Contactar Ventas',
    highlighted: false,
  },
];

export default function SubscriptionPage() {
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    const userDataCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('user_data='));

    if (userDataCookie) {
      try {
        const userData = JSON.parse(
          decodeURIComponent(userDataCookie.split('=')[1])
        );
        setCompanyId(userData.companyId);
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  const subscription = useQuery(
    api.subscription.getStatus,
    companyId ? { companyId: companyId as Id<'companies'> } : 'skip'
  );

  if (!companyId || !subscription) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suscripción"
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Configuración', href: '/settings/account' },
          { label: 'Suscripción' },
        ]}
        description="Gestiona tu plan y límites de uso"
      />

      {/* Current Plan Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Tu Plan Actual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{subscription.planDisplayName}</span>
                {subscription.isTrialPlan && (
                  <Badge variant="secondary">
                    {subscription.daysRemaining} días restantes
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mt-1">
                {subscription.isTrialPlan
                  ? 'Explora todas las funciones durante tu período de prueba'
                  : 'Tu suscripción está activa'}
              </p>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span className="text-sm">Instalaciones</span>
                </div>
                <p className="text-lg font-semibold">
                  {subscription.currentFacilities} / {subscription.maxFacilities}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Usuarios</span>
                </div>
                <p className="text-lg font-semibold">
                  {subscription.currentUsers} / {subscription.maxUsers}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Planes Disponibles</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => {
            const isCurrentPlan = subscription.plan === plan.id;

            return (
              <Card
                key={plan.id}
                className={`relative ${
                  plan.highlighted
                    ? 'border-amber-500 border-2 shadow-lg'
                    : ''
                } ${isCurrentPlan ? 'bg-muted/50' : ''}`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-amber-500 text-white">Recomendado</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>
                    <span className="text-2xl font-bold text-foreground">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-muted-foreground">{plan.period}</span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {plan.facilities === -1
                          ? 'Instalaciones ilimitadas'
                          : `${plan.facilities} instalación${plan.facilities > 1 ? 'es' : ''}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {plan.users === -1
                          ? 'Usuarios ilimitados'
                          : `${plan.users} usuario${plan.users > 1 ? 's' : ''}`}
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    variant={isCurrentPlan ? 'outline' : plan.highlighted ? 'default' : 'secondary'}
                    disabled={isCurrentPlan || plan.id !== 'trial'}
                  >
                    {isCurrentPlan ? (
                      'Plan Actual'
                    ) : plan.id === 'enterprise' ? (
                      <>
                        Contactar Ventas
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      plan.cta
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Coming Soon Notice */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="text-center">
            <Sparkles className="h-8 w-8 mx-auto text-amber-500 mb-2" />
            <h3 className="font-semibold mb-1">Próximamente</h3>
            <p className="text-sm text-muted-foreground">
              Los planes pagos estarán disponibles pronto. Por ahora, disfruta de todas
              las funciones durante tu período de prueba gratuita.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
