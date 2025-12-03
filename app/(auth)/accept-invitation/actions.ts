'use server';

import { api } from '@/convex/_generated/api';
import { fetchQuery, fetchMutation } from 'convex/nextjs';

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

interface ValidationResult {
  success: boolean;
  data?: InvitationDetails;
  error?: string;
}

interface ActionResult {
  success: boolean;
  error?: string;
}

/**
 * Validates an invitation token and returns invitation details
 */
export async function validateInvitation(
  token: string
): Promise<ValidationResult> {
  try {
    const result = await fetchQuery(api.invitations.validate, { token });

    if (!result.valid) {
      return {
        success: false,
        error: result.error || 'Invitación no válida o expirada',
      };
    }

    return {
      success: true,
      data: result.invitation,
    };
  } catch (error) {
    console.error('Error validating invitation:', error);
    return {
      success: false,
      error: 'Error al validar la invitación',
    };
  }
}

/**
 * Rejects an invitation
 */
export async function rejectInvitation(token: string): Promise<ActionResult> {
  try {
    await fetchMutation(api.invitations.reject, { token });

    return { success: true };
  } catch (error) {
    console.error('Error rejecting invitation:', error);
    return {
      success: false,
      error: 'Error al rechazar la invitación',
    };
  }
}
