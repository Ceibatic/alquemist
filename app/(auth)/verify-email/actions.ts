'use server';

import { convex, getConvexErrorMessage } from '@/lib/convex';
import { api } from '@/convex/_generated/api';
import { sendVerificationEmail } from '@/lib/email';

/**
 * Verify email with 6-digit code
 */
export async function verifyEmailCode(code: string) {
  try {
    // Call Convex mutation to verify the token
    const result = await convex.mutation(api.emailVerification.verifyEmailToken, {
      token: code,
    });

    if (!result.success) {
      return {
        success: false,
        error: 'Código inválido o expirado',
      };
    }

    return {
      success: true,
      userId: result.userId,
      message: result.message,
    };
  } catch (error) {
    console.error('Error verifying email:', error);
    return {
      success: false,
      error: getConvexErrorMessage(error),
    };
  }
}

/**
 * Resend verification email
 */
export async function resendVerificationEmail(email: string) {
  try {
    // Call Convex action to resend verification email
    const result = await convex.action(api.emailVerification.resendVerificationEmail, {
      email,
    });

    if (!result.success) {
      return {
        success: false,
        error: 'Error al reenviar email',
      };
    }

    // Send verification email
    const emailResult = await sendVerificationEmail(
      result.email,
      result.emailSubject,
      result.emailHtml,
      result.emailText
    );

    if (!emailResult.success) {
      console.warn('Failed to send verification email:', emailResult.error);
      // Still log the token so user can verify manually
      console.log('==============================================');
      console.log(`Resent verification code for ${result.email}: ${result.token}`);
      console.log('==============================================');
    } else {
      console.log(`Verification email resent to ${result.email}`);
    }

    return {
      success: true,
      message: result.message,
      emailSent: emailResult.success,
    };
  } catch (error) {
    console.error('Error resending verification email:', error);
    return {
      success: false,
      error: getConvexErrorMessage(error),
    };
  }
}
