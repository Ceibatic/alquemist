'use server';

import { cookies } from 'next/headers';
import { z } from 'zod';
import { loginSchema } from '@/lib/validations';
import { convex, getConvexErrorMessage } from '@/lib/convex';
import { api } from '@/convex/_generated/api';

/**
 * Set HTTP-only session cookies for authentication
 */
export async function setSessionCookies(data: {
  sessionToken: string;
  userId: string;
  email: string;
  companyId?: string;
  roleId: string;
  primaryFacilityId?: string;
}) {
  const cookieStore = await cookies();

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 días
  };

  // Session token cookie
  cookieStore.set('session_token', data.sessionToken, cookieOptions);

  // User data cookie for server components
  cookieStore.set(
    'user_data',
    JSON.stringify({
      userId: data.userId,
      email: data.email,
      companyId: data.companyId,
      roleId: data.roleId,
      primaryFacilityId: data.primaryFacilityId,
    }),
    cookieOptions
  );

  return { success: true };
}

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
      primaryFacilityId: result.primaryFacilityId,
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
