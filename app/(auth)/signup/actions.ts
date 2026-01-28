'use server';

import { convex, getConvexErrorMessage } from '@/lib/convex';
import { api } from '@/convex/_generated/api';

/**
 * Check if email is available for registration
 */
export async function checkEmailAvailability(email: string) {
  try {
    const result = await convex.query(api.registration.checkEmailAvailability, {
      email,
    });

    return {
      available: result.available,
      email: result.email,
    };
  } catch (error) {
    console.error('Error checking email availability:', error);
    return {
      available: false,
      error: getConvexErrorMessage(error),
    };
  }
}
