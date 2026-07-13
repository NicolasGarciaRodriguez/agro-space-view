export const PASSWORD_RESET_ROUTE_PREFIX = "/api/password-reset" as const;

export const RESET_TOKEN_EXPIRY_HOURS = 1 as const; // más corto que el de verificación, por seguridad

export const buildResetEmailHtml = (nombre: string, resetUrl: string): string => `
<!DOCTYPE html>
<html>
  <body style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 32px;">
    <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px;">
      <h1 style="color: #2D6A4F; font-size: 20px;">Hola ${nombre},</h1>
      <p style="color: #444; font-size: 15px; line-height: 1.6;">
        Hemos recibido una solicitud para restablecer tu contraseña de AgroSpaceView.
      </p>
      <a href="${resetUrl}" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #2D6A4F; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
        Restablecer contraseña
      </a>
      <p style="color: #888; font-size: 13px; margin-top: 24px;">
        Este enlace caduca en 1 hora. Si no has sido tú, ignora este correo — tu contraseña actual seguirá funcionando.
      </p>
    </div>
  </body>
</html>
`;