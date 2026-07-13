import HttpService, { getBaseUrl } from "../services/Http.service.js";
import type {
  RequestResetDTO,
  ConfirmResetDTO,
  PasswordResetResponseDTO,
} from "../dtos/PasswordReset.dto.js";

const BASE = () => `${getBaseUrl()}/api/password-reset`;

const requestReset = async (
  data: RequestResetDTO,
): Promise<PasswordResetResponseDTO> => {
  return HttpService.post(
    `${BASE()}/request`,
    data,
  ) as Promise<PasswordResetResponseDTO>;
};

const confirmReset = async (
  data: ConfirmResetDTO,
): Promise<PasswordResetResponseDTO> => {
  return HttpService.post(
    `${BASE()}/confirm`,
    data,
  ) as Promise<PasswordResetResponseDTO>;
};

export const PasswordResetRepository = { requestReset, confirmReset };