'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Building2, User, Mail, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CountdownTimer } from '@/components/shared/countdown-timer';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { validateInvitation, rejectInvitation } from './actions';

interface InvitationDetails {
  companyName: string;
  roleName: string;
  inviterName: string;
  facilities: string[];
  email: string;
  expiresAt: number;
  expiresInHours: number;
  createdAt: number;
}

function AcceptInvitationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(true);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInvitation = async () => {
      if (!token) {
        router.push('/invitation-invalid');
        return;
      }

      setIsLoading(true);
      try {
        const result = await validateInvitation(token);

        if (!result.success || !result.data) {
          router.push('/invitation-invalid');
          return;
        }

        setInvitation(result.data);
        // Store token in sessionStorage for use in set-password page
        sessionStorage.setItem('invitationToken', token);
      } catch (err) {
        console.error('Error loading invitation:', err);
        router.push('/invitation-invalid');
      } finally {
        setIsLoading(false);
      }
    };

    loadInvitation();
  }, [token, router]);

  const handleAccept = () => {
    router.push('/set-password');
  };

  const handleRejectConfirm = async () => {
    if (!token) return;

    setIsRejecting(true);
    try {
      const result = await rejectInvitation(token);

      if (result.success) {
        sessionStorage.removeItem('invitationToken');
        router.push('/login');
      } else {
        setError(result.error || 'Error al rechazar la invitacion');
      }
    } catch (err) {
      console.error('Error rejecting invitation:', err);
      setError('Error inesperado. Por favor intenta de nuevo.');
    } finally {
      setIsRejecting(false);
      setShowRejectDialog(false);
    }
  };

  const handleExpire = () => {
    sessionStorage.removeItem('invitationToken');
    router.push('/invitation-invalid');
  };

  if (isLoading) {
    return (
      <div className="space-y-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground">Validando invitacion...</p>
      </div>
    );
  }

  if (!invitation) {
    return null;
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-2">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold">Invitacion de Equipo</h2>
          <p className="text-sm text-muted-foreground">
            Has sido invitado a unirte a una empresa en Alquemist
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
            {error}
          </div>
        )}

        {/* Invitation Details */}
        <div className="space-y-4">
          {/* Company Name */}
          <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
            <Building2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Empresa</p>
              <p className="font-semibold">{invitation.companyName}</p>
            </div>
          </div>

          {/* Role */}
          <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
            <User className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Rol Asignado</p>
              <p className="font-semibold">{invitation.roleName}</p>
            </div>
          </div>

          {/* Inviter */}
          <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
            <Mail className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Invitado por</p>
              <p className="font-semibold">{invitation.inviterName}</p>
            </div>
          </div>

          {/* Facilities */}
          {invitation.facilities.length > 0 && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                Instalaciones Asignadas
              </p>
              <ul className="space-y-1">
                {invitation.facilities.map((facility, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <span className="text-primary">•</span>
                    <span>{facility}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Email */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Tu correo electronico</p>
            <p className="font-medium">{invitation.email}</p>
          </div>

          {/* Countdown Timer */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <CountdownTimer
              expiresAt={invitation.expiresAt}
              onExpire={handleExpire}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Las invitaciones son validas por 72 horas
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleAccept}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white"
            size="lg"
          >
            ACEPTAR INVITACION
          </Button>

          <Button
            onClick={() => setShowRejectDialog(true)}
            variant="outline"
            className="w-full"
            size="lg"
          >
            RECHAZAR
          </Button>
        </div>
      </div>

      {/* Reject Confirmation Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-destructive" />
              Rechazar Invitacion
            </DialogTitle>
            <DialogDescription>
              Estas seguro que deseas rechazar esta invitacion? Esta accion no
              se puede deshacer. Si cambias de opinion, necesitaras que el
              administrador te envie una nueva invitacion.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
              disabled={isRejecting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={isRejecting}
            >
              {isRejecting ? 'Rechazando...' : 'Confirmar Rechazo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function LoadingFallback() {
  return (
    <div className="space-y-6 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      <p className="text-muted-foreground">Cargando...</p>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AcceptInvitationContent />
    </Suspense>
  );
}
