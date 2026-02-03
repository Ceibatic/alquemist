import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Extract a user-friendly error message from Clerk API errors.
 * Clerk throws ClerkAPIResponseError with an `errors` array containing
 * `{ code, message, longMessage }` objects.
 */
export function getClerkErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object') {
    const clerkErr = err as { errors?: Array<{ longMessage?: string; message?: string }> };
    if (clerkErr.errors?.[0]) {
      return clerkErr.errors[0].longMessage || clerkErr.errors[0].message || fallback;
    }
    if ('message' in err && typeof (err as { message: unknown }).message === 'string') {
      return (err as { message: string }).message;
    }
  }
  return fallback;
}
