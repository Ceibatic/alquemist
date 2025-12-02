/**
 * Email Service
 * Handles email template generation for Next.js app
 */

/**
 * Email template for verification (HTML format with Alquemist branding)
 * Returns professional HTML email with design system colors and logo
 */
export function generateVerificationEmailHTML(
  firstName: string,
  email: string,
  token: string,
  expiresInHours: number = 24
): { html: string; text: string } {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const verificationLink = `${appUrl}/verify-email?token=${token}`;
  const logoUrl = `${appUrl}/logo.svg`;

  // HTML email with Alquemist design system
  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verifica tu Email - Alquemist</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F5F5F5; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F5F5F5; padding: 40px 0;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); max-width: 600px;">

          <!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%); padding: 32px 24px; text-align: center;">
              <img src="${logoUrl}" alt="Alquemist" width="160" height="36" style="display: block; margin: 0 auto; max-width: 160px; height: auto;" />
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 48px 32px;">
              <h1 style="margin: 0 0 24px; color: #212121; font-size: 28px; font-weight: 700; line-height: 1.3;">
                Verifica tu Email
              </h1>

              <p style="margin: 0 0 16px; color: #424242; font-size: 18px; line-height: 1.5;">
                ¡Hola ${firstName || "Usuario"}!
              </p>

              <p style="margin: 0 0 32px; color: #616161; font-size: 16px; line-height: 1.6;">
                Para completar tu registro en Alquemist, necesitamos verificar que esta es tu dirección de correo electrónico.
              </p>

              <!-- Code Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F5F5F5; border-radius: 12px; margin: 0 0 32px;">
                <tr>
                  <td style="padding: 32px; text-align: center;">
                    <p style="margin: 0 0 12px; color: #757575; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
                      Tu código de verificación
                    </p>
                    <p style="margin: 0; color: #1B5E20; font-size: 42px; font-weight: 700; letter-spacing: 12px; font-family: 'Courier New', monospace;">
                      ${token}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding: 0 0 32px;">
                    <a href="${verificationLink}" style="display: inline-block; background-color: #FFC107; color: #212121; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 2px 8px rgba(255, 193, 7, 0.3);">
                      Verificar Email
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 8px; color: #757575; font-size: 14px; line-height: 1.5;">
                O copia este enlace en tu navegador:
              </p>
              <p style="margin: 0 0 32px; word-break: break-all;">
                <a href="${verificationLink}" style="color: #1B5E20; font-size: 13px; text-decoration: underline;">
                  ${verificationLink}
                </a>
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 1px solid #E0E0E0; padding-top: 24px;">
                <tr>
                  <td>
                    <p style="margin: 0; color: #9E9E9E; font-size: 13px; line-height: 1.6;">
                      ⏰ Este código es válido por ${expiresInHours} horas<br>
                      🔒 Si no solicitaste esta verificación, puedes ignorar este correo
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #FAFAFA; padding: 32px; text-align: center; border-top: 1px solid #E0E0E0;">
              <p style="margin: 0 0 8px; color: #757575; font-size: 14px;">
                🌱 Alquemist - Trazabilidad Agrícola
              </p>
              <p style="margin: 0; color: #9E9E9E; font-size: 12px;">
                © 2025 Alquemist. Todos los derechos reservados.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  // Plain text version for fallback
  const text = `VERIFICA TU EMAIL - ALQUEMIST

¡Hola ${firstName || "Usuario"}!

Para completar tu registro en Alquemist, necesitamos verificar que esta es tu dirección de correo electrónico.

Tu código de verificación:
${token}

O haz clic en este enlace:
${verificationLink}

⏰ Código válido por ${expiresInHours} horas
🔒 Si no solicitaste esta verificación, ignora este correo.

---
© 2025 Alquemist - Trazabilidad Agrícola`;

  return { html, text };
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

/**
 * Send email via Resend API
 * This function is compatible with Convex actions (uses fetch)
 */
export async function sendEmailViaResend(params: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error('[EMAIL] RESEND_API_KEY not configured');
    return {
      success: false,
      error: 'Email service not configured',
    };
  }

  const { to, subject, html, text, from = 'Alquemist <noreply@alquemist.co>' } = params;

  try {
    console.log(`[EMAIL] Sending email to ${to}...`);

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
        text: text || html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[EMAIL] Resend API error:', data);
      return {
        success: false,
        error: data.message || 'Failed to send email',
      };
    }

    console.log(`[EMAIL] ✓ Sent successfully to ${to}, messageId:`, data.id);
    return {
      success: true,
      messageId: data.id,
    };
  } catch (error) {
    console.error('[EMAIL] Exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
