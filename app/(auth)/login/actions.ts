'use server';

import { z } from 'zod';
import { loginSchema } from '@/lib/validations';
import { convex, getConvexErrorMessage } from '@/lib/convex';
import { api } from '@/convex/_generated/api';

export async function authenticateUser(
  data: z.infer<typeof loginSchema>,
  rememberMe: boolean = false
) {
  try {
    // Validate the data
    const validated = loginSchema.parse(data);

    // Call Convex login mutation
    const result = await convex.mutation(api.registration.login, {
      email: validated.email,
      password: validated.password,
    });

    if (!result.success) {
      return {
        success: false,
        error: 'Error al iniciar sesión',
      };
    }

    console.log('User authenticated:', {
      userId: result.userId,
      email: result.user.email,
      companyId: result.companyId,
    });

    return {
      success: true,
      sessionToken: result.token,
      userId: result.userId,
      companyId: result.companyId,
      user: result.user,
      company: result.company,
    };
  } catch (error) {
    console.error('Error authenticating user:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Datos inválidos. Por favor verifica el formulario.',
        details: error.errors,
      };
    }

    return {
      success: false,
      error: getConvexErrorMessage(error),
    };
  }
}
