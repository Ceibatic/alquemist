'use server';

import { z } from 'zod';
import { convex, getConvexErrorMessage } from '@/lib/convex';
import { api } from '@/convex/_generated/api';

export async function verifyResetToken(token: string) {
  try {
    if (!token) {
      return { valid: false, error: 'Código inválido' };
    }

    const result = await convex.query(api.registration.verifyPasswordResetToken, {
      token,
    });

    return result;
  } catch (error) {
    console.error('Error verifying reset token:', error);
    return {
      valid: false,
      error: getConvexErrorMessage(error),
    };
  }
}

export async function resetPassword(token: string, newPassword: string) {
  try {
    // Basic validation
    if (!token) {
      return { success: false, error: 'Código inválido' };
    }

    if (!newPassword || newPassword.length < 8) {
      return { success: false, error: 'La contraseña debe tener al menos 8 caracteres' };
    }

    const result = await convex.mutation(api.registration.resetPassword, {
      token,
      newPassword,
    });

    return {
      success: true,
      message: result.message || 'Contraseña actualizada exitosamente',
    };
  } catch (error) {
    console.error('Error resetting password:', error);
    return {
      success: false,
      error: getConvexErrorMessage(error),
    };
  }
}
