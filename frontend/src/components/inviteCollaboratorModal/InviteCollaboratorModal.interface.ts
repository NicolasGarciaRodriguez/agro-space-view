import type { ExplotacionDTO } from "@agrospace/shared/dtos/Explotacion.dto";

export interface InviteCollaboratorModalProps {
  explotaciones: ExplotacionDTO[];
  onClose: () => void;
  onInvited: () => void;
}