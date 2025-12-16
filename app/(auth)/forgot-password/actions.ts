'use server';

import { z } from 'zod';
import { convex, getConvexErrorMessage } from '@/lib/convex';
import { api } from '@/convex/_generated/api';

const forgotPasswordSchema = z.object({
  email: z.string().email('Ingresa un correo electrónico válido'),
});

export async function requestPasswordReset(email: string) {
  try {
    // Validate the email
    const validated = forgotPasswordSchema.parse({ email });

    // Call Convex action
    const result = await convex.action(api.registration.requestPasswordReset, {
      email: validated.email,
    });

    return {
      success: true,
      message: result.message || 'Si el correo existe, recibirás instrucciones para restablecer tu contraseña',
    };
  } catch (error) {
    console.error('Error requesting password reset:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Correo electrónico inválido',
      };
    }

    return {
      success: false,
      error: getConvexErrorMessage(error),
    };
  }
}
