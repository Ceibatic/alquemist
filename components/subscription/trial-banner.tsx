'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Clock, AlertTriangle, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

interface TrialBannerProps {
  companyId: Id<'companies'>;
}

export function TrialBanner({ companyId }: TrialBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  const subscription = useQuery(api.subscription.getStatus, { companyId });

  // Don't show if loading, dismissed, or not a trial plan
  if (!subscription || isDismissed || !subscription.isTrialPlan) {
    return null;
  }

  // Don't show if more than 7 days remaining (only show warnings)
  if (subscription.daysRemaining !== null && subscription.daysRemaining > 7) {
    return null;
  }

  // Determine banner variant based on days remaining
  const isUrgent = subscription.showUrgentWarning || subscription.isExpired;
  const isWarning = subscription.showWarning;

  // Get appropriate styles
  const getBannerStyles = () => {
    if (subscription.isExpired) {
      return {
        variant: 'destructive' as const,
        icon: <AlertTriangle className="h-4 w-4" />,
        bgClass: 'bg-red-50 border-red-200',
        textClass: 'text-red-800',
      };
    }
    if (isUrgent) {
      return {
        variant: 'destructive' as const,
        icon: <AlertTriangle className="h-4 w-4" />,
        bgClass: 'bg-amber-50 border-amber-300',
        textClass: 'text-amber-800',
      };
    }
    if (isWarning) {
      return {
        variant: 'default' as const,
        icon: <Clock className="h-4 w-4" />,
        bgClass: 'bg-blue-50 border-blue-200',
        textClass: 'text-blue-800',
      };
    }
    return {
      variant: 'default' as const,
      icon: <Sparkles className="h-4 w-4" />,
      bgClass: 'bg-green-50 border-green-200',
      textClass: 'text-green-800',
    };
  };

  const styles = getBannerStyles();

  // Get message based on status
  const getMessage = () => {
    if (subscription.isExpired) {
      return {
        title: 'Tu prueba gratuita ha expirado',
        description:
          'Actualiza tu plan para continuar utilizando todas las funciones de Alquemist.',
      };
    }
    if (subscription.daysRemaining === 1) {
      return {
        title: 'Tu prueba gratuita expira manana',
        description:
          'Actualiza ahora para no perder acceso a tus datos y funcionalidades.',
      };
    }
    if (isUrgent) {
      return {
        title: `Tu prueba gratuita expira en ${subscription.daysRemaining} dias`,
        description:
          'Actualiza tu plan pronto para mantener acceso a todas las funciones.',
      };
    }
    return {
      title: `${subscription.daysRemaining} dias restantes de prueba`,
      description:
        'Explora todas las funciones. Actualiza cuando estes listo.',
    };
  };

  const message = getMessage();

  return (
    <Alert className={`relative ${styles.bgClass} border`}>
      <div className="flex items-start gap-3">
        <div className={styles.textClass}>{styles.icon}</div>
        <div className="flex-1">
          <AlertTitle className={`font-semibold ${styles.textClass}`}>
            {message.title}
          </AlertTitle>
          <AlertDescription className={`mt-1 ${styles.textClass} opacity-90`}>
            {message.description}
          </AlertDescription>
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              variant={subscription.isExpired || isUrgent ? 'default' : 'outline'}
              className={
                subscription.isExpired || isUrgent
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : ''
              }
              asChild
            >
              <Link href="/settings/subscription">Ver Planes</Link>
            </Button>
            {!subscription.isExpired && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsDismissed(true)}
                className={styles.textClass}
              >
                Recordar despues
              </Button>
            )}
          </div>
        </div>
        {!subscription.isExpired && (
          <button
            onClick={() => setIsDismissed(true)}
            className={`${styles.textClass} opacity-60 hover:opacity-100`}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </Alert>
  );
}
