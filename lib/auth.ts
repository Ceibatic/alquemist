/**
 * Authentication utilities for server-side auth checks
 */

import { cookies } from 'next/headers';

export interface AuthUser {
  userId: string;
  email: string;
  companyId?: string;
  roleId: string;
  primaryFacilityId?: string;
}

/**
 * Get the current authenticated user from cookies
 * Returns null if not authenticated
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session_token');

  if (!sessionToken?.value) {
    return null;
  }

  // In a real implementation, we would validate the session token with Convex
  // For now, we'll decode the user data stored in the cookie
  try {
    const userData = cookieStore.get('user_data');
    if (!userData?.value) {
      return null;
    }

    const user = JSON.parse(userData.value);
    return user;
  } catch (error) {
    console.error('Failed to parse user data:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getAuthUser();
  return user !== null;
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}
