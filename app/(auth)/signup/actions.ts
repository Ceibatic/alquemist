'use server';

import { z } from 'zod';
import { signupSchema } from '@/lib/validations';
import { convex, getConvexErrorMessage } from '@/lib/convex';
import { api } from '@/convex/_generated/api';
import { sendVerificationEmail } from '@/lib/email';

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

/**
 * Register a new user (Step 1 of 2-step registration)
 * Creates user record and generates verification token
 */
export async function registerUser(data: z.infer<typeof signupSchema>) {
  try {
    // Validate data
    const validated = signupSchema.parse(data);

    // Call Convex action to create user
    const result = await convex.action(api.registration.registerUserStep1, {
      email: validated.email,
      password: validated.password,
      firstName: validated.firstName,
      lastName: validated.lastName,
      phone: validated.phone || undefined,
    });

    if (!result.success) {
      return {
        success: false,
        error: 'Error al crear la cuenta',
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
      console.log(`Verification code for ${result.email}: ${result.verificationToken}`);
      console.log('==============================================');
    } else {
      console.log(`Verification email sent to ${result.email}`);
    }

    return {
      success: true,
      userId: result.userId,
      sessionToken: result.token,
      email: result.email,
      emailSent: emailResult.success,
      message: result.message,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Datos de registro inválidos',
        details: error.errors,
      };
    }

    console.error('Error registering user:', error);
    return {
      success: false,
      error: getConvexErrorMessage(error),
    };
  }
}
