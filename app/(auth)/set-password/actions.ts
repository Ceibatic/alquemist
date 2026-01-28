'use server';

import { api } from '@/convex/_generated/api';
import { fetchAction } from 'convex/nextjs';
import { InvitationAcceptFormValues } from '@/lib/validations';

interface AcceptInvitationData extends InvitationAcceptFormValues {
  token: string;
}

interface AcceptInvitationResult {
  success: boolean;
  email?: string;
  userId?: string;
  companyId?: string;
  invitation?: {
    companyName: string;
    roleName: string;
    facilities: string[];
  };
  error?: string;
}

/**
 * Accepts an invitation and creates a user account
 */
export async function acceptInvitation(
  data: AcceptInvitationData
): Promise<AcceptInvitationResult> {
  try {
    const result = await fetchAction(api.invitations.accept, {
      token: data.token,
      password: data.password,
      phone: data.phone || undefined,
      language: data.language,
    });

    if (!result || !result.success) {
      return {
        success: false,
        error: 'Error al aceptar la invitación',
      };
    }

    return {
      success: true,
      email: result.email,
      userId: result.userId,
      companyId: result.companyId,
      invitation: result.invitation,
    };
  } catch (error) {
    console.error('Error accepting invitation:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error al crear la cuenta. Por favor intenta de nuevo.';
    return {
      success: false,
      error: errorMessage,
    };
  }
}
