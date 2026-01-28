'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Mail, Clock, X, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Id } from '@/convex/_generated/dataModel';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface InvitationCardData {
  id: Id<'invitations'>;
  email: string;
  roleName: string;
  facilityNames: string[];
  inviterName: string;
  expiresAt: number;
  createdAt: number;
}

interface InvitationCardProps {
  invitation: InvitationCardData;
}

export function InvitationCard({ invitation }: InvitationCardProps) {
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  const { toast } = useToast();
  const resendMutation = useMutation(api.invitations.resend);
  const cancelMutation = useMutation(api.invitations.cancel);

  // Calculate time until expiration
  const now = Date.now();
  const timeUntilExpiry = invitation.expiresAt - now;
  const hoursUntilExpiry = Math.floor(timeUntilExpiry / (1000 * 60 * 60));
  const isExpiringSoon = hoursUntilExpiry < 24;
  const isExpired = timeUntilExpiry < 0;

  const handleResend = async () => {
    setIsResending(true);
    try {
      await resendMutation({ invitationId: invitation.id });
      toast({
        title: 'Invitación reenviada',
        description: `Se ha reenviado la invitación a ${invitation.email}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo reenviar la invitación',
        variant: 'destructive',
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleCancel = async () => {
    setIsCanceling(true);
    try {
      await cancelMutation({ invitationId: invitation.id });
      toast({
        title: 'Invitación cancelada',
        description: `Se ha cancelado la invitación a ${invitation.email}`,
      });
      setIsCancelDialogOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo cancelar la invitación',
        variant: 'destructive',
      });
    } finally {
      setIsCanceling(false);
    }
  };

  return (
    <>
      <Card className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-[#FFC107]/10 p-2">
              <Mail className="h-5 w-5 text-[#FFC107]" />
            </div>

            <div className="space-y-2">
              <div>
                <div className="font-medium text-gray-900">{invitation.email}</div>
                <div className="text-sm text-gray-600">
                  Rol: <span className="font-medium">{invitation.roleName}</span>
                  {' · '}
                  Invitado por: <span className="font-medium">{invitation.inviterName}</span>
                </div>
              </div>

              {invitation.facilityNames.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {invitation.facilityNames.map((facility, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {facility}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>
                  Enviada: {formatDistanceToNow(new Date(invitation.createdAt), {
                    addSuffix: true,
                    locale: es
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {isExpired ? (
                    <span className="text-red-600">Expirada</span>
                  ) : (
                    <span className={isExpiringSoon ? 'text-orange-600' : ''}>
                      Expira en {hoursUntilExpiry}h
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isExpired && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResend}
                disabled={isResending}
              >
                {isResending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reenviar
                  </>
                )}
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCancelDialogOpen(true)}
              disabled={isCanceling}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
          </div>
        </div>
      </Card>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar invitación?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas cancelar la invitación para {invitation.email}?
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, mantener</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={isCanceling}
              className="bg-red-600 hover:bg-red-700"
            >
              {isCanceling ? 'Cancelando...' : 'Sí, cancelar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
