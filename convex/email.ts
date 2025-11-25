/**
 * Email Service with Resend Integration
 * Handles all email communications
 */

import { action } from "./_generated/server";
import { v } from "convex/values";

/**
 * Email template for verification
 */
export function generateVerificationEmailHTML(
  firstName: string,
  email: string,
  token: string,
  expiresInHours: number = 24
): { html: string; text: string } {
  const verificationLink = `${process.env.BUBBLE_APP_URL || "https://app.alquemist.com"}/signup-verify-email?token=${token}&email=${encodeURIComponent(email)}`;

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verificar Email - Alquemist</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 5px 5px 0 0; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
    .message { font-size: 16px; color: #555; margin-bottom: 20px; }
    .cta-button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; font-weight: bold; }
    .cta-button:hover { background: #764ba2; }
    .token-box { background: white; border: 2px solid #ddd; padding: 15px; border-radius: 5px; margin: 20px 0; font-family: monospace; font-size: 14px; word-break: break-all; }
    .footer { color: #999; font-size: 12px; text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px 15px; margin: 20px 0; border-radius: 3px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌱 Alquemist</h1>
      <p>Verificación de Email</p>
    </div>

    <div class="content">
      <p class="message">¡Hola ${firstName || "Usuario"}!</p>

      <p class="message">
        Bienvenido a Alquemist. Para completar tu registro, necesitamos verificar que este correo electrónico es válido.
      </p>

      <div style="text-align: center;">
        <a href="${verificationLink}" class="cta-button">Verificar Email</a>
      </div>

      <p style="text-align: center; color: #666; font-size: 14px;">
        O copia y pega este código en la aplicación:
      </p>

      <div class="token-box">${token}</div>

      <div class="warning">
        <strong>⏰ Este código expira en ${expiresInHours} horas</strong>
        <p style="margin: 5px 0 0 0;">Si no solicitaste esta verificación, ignora este correo.</p>
      </div>

      <p style="color: #999; font-size: 13px;">
        Si tienes problemas con el enlace, copia la siguiente URL en tu navegador:<br/>
        <code style="background: #f0f0f0; padding: 2px 5px; border-radius: 3px; font-size: 11px; word-break: break-all;">
          ${verificationLink}
        </code>
      </p>
    </div>

    <div class="footer">
      <p>© 2024 Alquemist. Todos los derechos reservados.</p>
      <p>
        ¿Preguntas?
        <a href="mailto:support@alquemist.com" style="color: #667eea; text-decoration: none;">Contáctanos</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
¡Hola ${firstName || "Usuario"}!

Bienvenido a Alquemist. Para completar tu registro, necesitamos verificar que este correo electrónico es válido.

Código de verificación:
${token}

O visita este enlace:
${verificationLink}

Este código expira en ${expiresInHours} horas.

Si tienes problemas, copia y pega el código anterior en la aplicación.

---
© 2024 Alquemist. Todos los derechos reservados.
Para soporte: support@alquemist.com
  `.trim();

  return { html, text };
}

/**
 * Send verification email using Resend
 * This is an action because it makes HTTP calls to Resend API
 */
export const sendVerificationEmailWithResend = action({
  args: {
    email: v.string(),
    firstName: v.string(),
    token: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: boolean; messageId?: string; error?: string }> => {
    try {
      // Check if Resend API key is configured
      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey) {
        console.warn("[EMAIL] RESEND_API_KEY not configured. Email would be sent in production.");
        return {
          success: true,
          messageId: "dev-mode-" + Date.now(),
        };
      }

      const { html, text } = generateVerificationEmailHTML(args.firstName, args.email, args.token);

      // Call Resend API
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: "noreply@ceibatic.com",
          to: args.email,
          subject: "🌱 Verifica tu email - Alquemist",
          html,
          text,
          reply_to: "support@ceibatic.com",
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("[EMAIL] Resend API error:", error);
        return {
          success: false,
          error: "Error al enviar correo de verificación",
        };
      }

      const data = (await response.json()) as { id?: string };
      return {
        success: true,
        messageId: data.id,
      };
    } catch (error) {
      console.error("[EMAIL] Error sending verification email:", error);
      return {
        success: false,
        error: "Error al enviar correo de verificación",
      };
    }
  },
});

/**
 * Send welcome email
 * This is an action because it makes HTTP calls to Resend API
 */
export const sendWelcomeEmail = action({
  args: {
    email: v.string(),
    firstName: v.string(),
    companyName: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: boolean; messageId?: string; error?: string }> => {
    try {
      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey) {
        return { success: true, messageId: "dev-mode-" + Date.now() };
      }

      const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>¡Bienvenido a Alquemist!</title>
</head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 5px;">
      <h1 style="margin: 0;">🌱 ¡Bienvenido a Alquemist!</h1>
    </div>

    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px;">
      <p>Hola ${args.firstName},</p>
      <p>
        Tu cuenta ha sido creada exitosamente.
        <strong>${args.companyName}</strong> está lista para comenzar.
      </p>
      <p>
        Los próximos pasos incluyen:
        <ul>
          <li>Crear tu primera instalación</li>
          <li>Configurar tipos de cultivos</li>
          <li>Invitar a miembros del equipo</li>
        </ul>
      </p>
      <p>
        <a href="${process.env.BUBBLE_APP_URL || "https://app.alquemist.com"}/dashboard" style="background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Ir al Dashboard
        </a>
      </p>
      <p style="color: #999; font-size: 12px;">
        ¿Preguntas? Contacta a support@alquemist.com
      </p>
    </div>
  </div>
</body>
</html>
      `.trim();

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: "noreply@ceibatic.com",
          to: args.email,
          subject: `¡Bienvenido a Alquemist, ${args.firstName}!`,
          html,
          reply_to: "support@ceibatic.com",
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("[EMAIL] Welcome email error:", error);
        return { success: false, error: "Error sending welcome email" };
      }

      const data = (await response.json()) as { id?: string };
      return { success: true, messageId: data.id };
    } catch (error) {
      console.error("[EMAIL] Error sending welcome email:", error);
      return { success: false, error: "Error sending welcome email" };
    }
  },
});
