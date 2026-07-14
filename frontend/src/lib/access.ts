import { ExplotacionAccessRole } from "@agrospace/shared/enums/ExplotacionAccessRole.enum";

export const canManage = (
  nivelAcceso: ExplotacionAccessRole | undefined,
): boolean =>
  nivelAcceso === ExplotacionAccessRole.OWNER ||
  nivelAcceso === ExplotacionAccessRole.GESTION;

export const isOwner = (
  nivelAcceso: ExplotacionAccessRole | undefined,
): boolean => nivelAcceso === ExplotacionAccessRole.OWNER;