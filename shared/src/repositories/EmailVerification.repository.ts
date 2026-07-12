import HttpService, { getBaseUrl } from "../services/Http.service.js";
import type {
  VerifyEmailDTO,
  EmailVerificationResponseDTO,
} from "../dtos/EmailVerification.dto.js";

const BASE = () => `${getBaseUrl()}/api/email-verification`;

const verify = async (
  data: VerifyEmailDTO,
): Promise<EmailVerificationResponseDTO> => {
  return HttpService.post(
    `${BASE()}/verify`,
    data,
  ) as Promise<EmailVerificationResponseDTO>;
};

const resend = async (): Promise<EmailVerificationResponseDTO> => {
  return HttpService.post(
    `${BASE()}/resend`,
    {},
  ) as Promise<EmailVerificationResponseDTO>;
};

export const EmailVerificationRepository = { verify, resend };