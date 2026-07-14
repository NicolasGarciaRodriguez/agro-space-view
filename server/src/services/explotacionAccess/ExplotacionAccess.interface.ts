import { ExplotacionAccessRole } from "@agrospace/shared/enums/ExplotacionAccessRole.enum";

export interface AccessResult {
  isOwner: boolean;
  nivelAcceso: ExplotacionAccessRole;
}

export class ExplotacionAccessDeniedError extends Error {
  constructor() {
    super("No tienes permiso para acceder a esta explotación");
    this.name = "ExplotacionAccessDeniedError";
  }
}

export class ExplotacionNotFoundForAccessError extends Error {
  constructor() {
    super("Explotación no encontrada");
    this.name = "ExplotacionNotFoundForAccessError";
  }
}