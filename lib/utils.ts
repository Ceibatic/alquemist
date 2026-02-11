import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Common Clerk error codes mapped to Spanish messages.
 * See: https://clerk.com/docs/errors/overview
 */
const clerkErrorMessages: Record<string, string> = {
  'form_identifier_not_found': 'No se encontró una cuenta con ese correo electrónico.',
  'form_password_incorrect': 'Contraseña incorrecta. Intenta de nuevo.',
  'form_password_pwned': 'Esta contraseña ha sido comprometida en una filtración de datos. Usa otra contraseña.',
  'form_password_length_too_short': 'La contraseña es demasiado corta.',
  'form_password_not_strong_enough': 'La contraseña no cumple con los requisitos de seguridad.',
  'form_password_size_in_bytes_exceeded': 'La contraseña es demasiado larga.',
  'form_identifier_exists': 'Este correo electrónico ya está registrado.',
  'form_code_incorrect': 'Código incorrecto. Verifica e intenta de nuevo.',
  'form_code_expired': 'El código ha expirado. Solicita uno nuevo.',
  'verification_failed': 'Verificación fallida. Intenta de nuevo.',
  'verification_expired': 'La verificación ha expirado. Solicita un nuevo código.',
  'too_many_requests': 'Demasiados intentos. Espera un momento antes de intentar de nuevo.',
  'session_exists': 'Ya tienes una sesión activa.',
  'not_allowed_access': 'No tienes acceso a este recurso.',
  'user_locked': 'Tu cuenta ha sido bloqueada temporalmente. Intenta más tarde.',
};

/**
 * Extract a user-friendly error message in Spanish from Clerk API errors.
 * Clerk throws ClerkAPIResponseError with an `errors` array containing
 * `{ code, message, longMessage }` objects.
 */
export function getClerkErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object') {
    const clerkErr = err as { errors?: Array<{ code?: string; longMessage?: string; message?: string }> };
    if (clerkErr.errors?.[0]) {
      const { code } = clerkErr.errors[0];
      // Try Spanish translation first, then fall back to Clerk's message
      if (code && clerkErrorMessages[code]) {
        return clerkErrorMessages[code];
      }
      return clerkErr.errors[0].longMessage || clerkErr.errors[0].message || fallback;
    }
    if ('message' in err && typeof (err as { message: unknown }).message === 'string') {
      const msg = (err as { message: string }).message;
      // Don't return bare "Error" — use fallback instead
      if (msg && msg !== 'Error') return msg;
    }
  }
  return fallback;
}
