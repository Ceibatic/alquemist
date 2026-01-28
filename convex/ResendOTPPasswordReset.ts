import Resend from "@auth/core/providers/resend";
import { Resend as ResendAPI } from "resend";
import { alphabet, generateRandomString } from "./otpUtils";

export const ResendOTPPasswordReset = Resend({
  id: "resend-otp-password-reset",
  apiKey: process.env.AUTH_RESEND_KEY,
  async generateVerificationToken() {
    return generateRandomString(6, alphabet("0-9"));
  },
  async sendVerificationRequest({ identifier: email, provider, token }) {
    const resend = new ResendAPI(provider.apiKey);
    const { error } = await resend.emails.send({
      from: "Alquemist <noreply@alquemist.co>",
      to: [email],
      subject: "Restablecer contraseña - Alquemist",
      html: generatePasswordResetHTML(token),
      text: `Tu código para restablecer contraseña en Alquemist es: ${token}\n\nEste código es válido por 60 minutos.\nSi no solicitaste este cambio, ignora este correo.`,
    });
    if (error) {
      throw new Error("No se pudo enviar el correo de restablecimiento");
    }
  },
});

function generatePasswordResetHTML(token: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Restablecer Contraseña - Alquemist</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F5F5F5; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F5F5F5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); max-width: 600px;">
          <tr>
            <td style="background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%); padding: 32px 24px; text-align: center;">
              <h2 style="margin: 0; color: #FFFFFF; font-size: 24px; font-weight: 700;">Alquemist</h2>
            </td>
          </tr>
          <tr>
            <td style="padding: 48px 32px;">
              <h1 style="margin: 0 0 24px; color: #212121; font-size: 28px; font-weight: 700;">Restablecer Contraseña</h1>
              <p style="margin: 0 0 32px; color: #616161; font-size: 16px; line-height: 1.6;">
                Recibimos una solicitud para restablecer la contraseña de tu cuenta en Alquemist. Usa el código a continuación:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F5F5F5; border-radius: 12px; margin: 0 0 32px;">
                <tr>
                  <td style="padding: 32px; text-align: center;">
                    <p style="margin: 0 0 12px; color: #757575; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Tu código de verificación</p>
                    <p style="margin: 0; color: #1B5E20; font-size: 42px; font-weight: 700; letter-spacing: 12px; font-family: 'Courier New', monospace;">${token}</p>
                  </td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 1px solid #E0E0E0; padding-top: 24px;">
                <tr>
                  <td>
                    <p style="margin: 0; color: #9E9E9E; font-size: 13px; line-height: 1.6;">
                      Este código es válido por 60 minutos.<br>
                      Si no solicitaste restablecer tu contraseña, puedes ignorar este correo.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #FAFAFA; padding: 32px; text-align: center; border-top: 1px solid #E0E0E0;">
              <p style="margin: 0 0 8px; color: #757575; font-size: 14px;">Alquemist - Trazabilidad Agrícola</p>
              <p style="margin: 0; color: #9E9E9E; font-size: 12px;">&copy; 2025 Alquemist. Todos los derechos reservados.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}
