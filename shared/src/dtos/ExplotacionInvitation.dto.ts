import { NivelAcceso } from "../enums/NivelAcceso.enum.js";

export interface CreateInvitationDTO {
  explotacionIds: string[];
  email: string;
  nivelAcceso: NivelAcceso;
}

export interface InvitationExplotacionDTO {
  id: string;
  nombre: string;
}

export interface InvitationDetailDTO {
  email: string;
  nivelAcceso: NivelAcceso;
  invitadoPorNombre: string;
  explotaciones: InvitationExplotacionDTO[];
}

export interface MiembroDTO {
  id: string;
  userId: string;
  nombre: string;
  email: string;
  nivelAcceso: NivelAcceso;
  createdAt: string;
}

export interface InvitationResponseDTO {
  message: string;
}