import HttpService, { getBaseUrl } from "../services/Http.service.js";
import type {
  CreateInvitationDTO,
  InvitationDetailDTO,
  MiembroDTO,
  InvitationResponseDTO,
} from "../dtos/ExplotacionInvitation.dto.js";

const BASE = () => `${getBaseUrl()}/api/explotacion-invitations`;

const create = async (
  data: CreateInvitationDTO,
): Promise<InvitationResponseDTO> => {
  return HttpService.post(BASE(), data) as Promise<InvitationResponseDTO>;
};

const getByToken = async (token: string): Promise<InvitationDetailDTO> => {
  return HttpService.get(
    `${BASE()}/token/${token}`,
  ) as Promise<InvitationDetailDTO>;
};

const accept = async (token: string): Promise<InvitationResponseDTO> => {
  return HttpService.post(
    `${BASE()}/${token}/accept`,
    {},
  ) as Promise<InvitationResponseDTO>;
};

const getMiembros = async (explotacionId: string): Promise<MiembroDTO[]> => {
  return HttpService.get(
    `${BASE()}/explotacion/${explotacionId}/miembros`,
  ) as Promise<MiembroDTO[]>;
};

const removeMember = async (miembroId: string): Promise<void> => {
  await HttpService.delete(`${BASE()}/miembros/${miembroId}`);
};

export const ExplotacionInvitationRepository = {
  create,
  getByToken,
  accept,
  getMiembros,
  removeMember,
};