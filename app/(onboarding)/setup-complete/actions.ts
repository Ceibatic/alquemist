'use server';

import { cookies } from 'next/headers';
import { convex } from '@/lib/convex';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

/**
 * Establish session after completing onboarding
 * Creates a new session and sets HTTP-only cookies for server-side auth
 */
export async function establishSession(userId: string) {
  try {
    // Create session in Convex
    const result = await convex.mutation(api.registration.createOnboardingSession, {
      userId: userId as Id<'users'>,
    });

    if (!result.success) {
      return { success: false, error: 'Error al crear sesión' };
    }

    // Set HTTP-only cookies
    const cookieStore = await cookies();

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 días
    };

    // Session token cookie
    cookieStore.set('session_token', result.sessionToken, cookieOptions);

    // User data cookie for server components
    cookieStore.set(
      'user_data',
      JSON.stringify({
        userId: result.userId,
        email: result.email,
        companyId: result.companyId,
        roleId: result.roleId,
      }),
      cookieOptions
    );

    return { success: true };
  } catch (error) {
    console.error('Error establishing session:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
