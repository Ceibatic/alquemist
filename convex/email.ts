/**
 * Email Service with Resend Integration
 * Handles all email communications
 */

import { action } from "./_generated/server";
import { v } from "convex/values";

/**
 * Email template for verification (Rich Text format for Bubble)
 * Returns plain text with rich formatting that Bubble can render
 */
export function generateVerificationEmailHTML(
  firstName: string,
  email: string,
  token: string,
  expiresInHours: number = 24
): { html: string; text: string } {
  const verificationLink = `${process.env.BUBBLE_APP_URL || "https://app.alquemist.com"}/email-verification?token=${token}&email=${encodeURIComponent(email)}`;

  // Rich text format (plain text with line breaks for Bubble to render)
  const richText = `🌱 VERIFICA TU EMAIL

¡Hola ${firstName || "Usuario"}!

Para completar tu registro en Alquemist, necesitamos verificar que esta es tu dirección de correo electrónico.

ENLACE DE VERIFICACIÓN:
${verificationLink}

---

O copia este código en la aplicación:

${token}

---

⏰ Código válido por ${expiresInHours} horas
❌ Si no solicitaste esta verificación, ignora este correo.

© 2024 Alquemist`;

  return { html: richText, text: richText };
}

/**
 * DEPRECATED: sendVerificationEmailWithResend removed in migration to Bubble native emails
 *
 * Migration to Bubble Native Email Sending:
 * - Email verification is now handled by Bubble's native "Send Email" action
 * - generateVerificationEmailHTML() generates the template
 * - Bubble handles the actual delivery via SendGrid
 * - No HTTP calls needed from Convex backend
 */

/**
 * DEPRECATED: sendWelcomeEmail removed in migration to Bubble native emails
 *
 * Welcome email now sent by Bubble after company creation:
 * 1. Convex: registerCompanyStep2 completes company setup
 * 2. Bubble: Receives success response
 * 3. Bubble: Sends welcome email via native "Send Email" action
 * 4. User: Receives welcome message with next steps
 *
 * This approach integrates better with Bubble's workflow automation
 * and gives frontend full control over email timing and behavior
 */
