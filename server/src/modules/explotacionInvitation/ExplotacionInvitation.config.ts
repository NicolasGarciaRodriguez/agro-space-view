export const EXPLOTACION_INVITATION_ROUTE_PREFIX =
  "/api/explotacion-invitations" as const;

export const INVITATION_EXPIRY_DAYS = 7 as const;
export const MAX_PENDING_INVITATIONS_PER_EXPLOTACION = 10 as const;

export const buildInvitationEmailHtml = (
  invitadoPorNombre: string,
  explotacionesNombres: string[],
  invitationUrl: string,
): string => `
<!DOCTYPE html>
<html>
  <body style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 32px;">
    <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px;">
      <h1 style="color: #2D6A4F; font-size: 20px;">Te han invitado a colaborar</h1>
      <p style="color: #444; font-size: 15px; line-height: 1.6;">
        <strong>${invitadoPorNombre}</strong> te ha invitado a colaborar en AgroSpaceView sobre:
      </p>
      <ul style="color: #444; font-size: 15px; line-height: 1.6;">
        ${explotacionesNombres.map((n) => `<li>${n}</li>`).join("")}
      </ul>
      <a href="${invitationUrl}" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #2D6A4F; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
        Ver invitación
      </a>
      <p style="color: #888; font-size: 13px; margin-top: 24px;">
        Este enlace caduca en 7 días. Si no tienes cuenta en AgroSpaceView, podrás crearla al aceptar.
      </p>
    </div>
  </body>
</html>
`;