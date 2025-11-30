'use server';

import { Resend } from 'resend';

// Default sender - using verified domain alquemist.co
const DEFAULT_FROM = 'Alquemist <noreply@alquemist.co>';

// Lazy initialization of Resend client
let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (resendClient) return resendClient;

  const apiKey = process.env.RESEND_API_KEY;
  console.log('[EMAIL] Checking RESEND_API_KEY:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT SET');

  if (!apiKey || apiKey === 'your_resend_api_key_here') {
    console.warn('[EMAIL] RESEND_API_KEY not configured - emails will not be sent');
    return null;
  }

  resendClient = new Resend(apiKey);
  console.log('[EMAIL] Resend client initialized successfully');
  return resendClient;
}

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const { to, subject, html, text, from = DEFAULT_FROM } = params;

  const resend = getResendClient();

  if (!resend) {
    console.warn('==============================================');
    console.warn('[EMAIL] NOT SENT - Resend not configured');
    console.warn(`[EMAIL] To: ${to}`);
    console.warn(`[EMAIL] Subject: ${subject}`);
    console.warn('==============================================');
    return {
      success: false,
      error: 'Email service not configured',
    };
  }

  try {
    console.log(`[EMAIL] Sending email to ${to}...`);
    const { data, error } = await resend.emails.send({
      from,
      to: [to],
      subject,
      html,
      text,
    });

    if (error) {
      console.error('[EMAIL] Error from Resend:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log(`[EMAIL] ✓ Sent successfully to ${to}, messageId:`, data?.id);
    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    console.error('[EMAIL] Exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<SendEmailResult> {
  return sendEmail({
    to,
    subject,
    html,
    text,
  });
}
