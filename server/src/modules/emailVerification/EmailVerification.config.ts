export const EMAIL_VERIFICATION_ROUTE_PREFIX = "/api/email-verification" as const;

export const TOKEN_EXPIRY_HOURS = 24 as const; // el enlace caduca en 24h

export const buildVerificationEmailHtml = (nombre: string, verificationUrl: string): string => `
<!DOCTYPE html>
<html>
  <body style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 32px;">
    <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px;">
      <h1 style="color: #2D6A4F; font-size: 20px;">Hola ${nombre},</h1>
      <p style="color: #444; font-size: 15px; line-height: 1.6;">
        Gracias por registrarte en AgroSpaceView. Confirma tu email para activar tu cuenta por completo.
      </p>
      <a href="${verificationUrl}" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #2D6A4F; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
        Verificar mi email
      </a>
      <p style="color: #888; font-size: 13px; margin-top: 24px;">
        Este enlace caduca en 24 horas. Si no has sido tú, ignora este correo.
      </p>
    </div>
  </body>
</html>
`;