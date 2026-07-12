import { getBaseUrl } from "../services/Http.service.js";
import HttpService from "../services/Http.service.js";
import type {
  LoginDTO,
  RegisterDTO,
  AuthResponseDTO,
  AuthUserDTO,
} from "../dtos/Auth.dto.js";

const BASE = () => `${getBaseUrl()}/auth`;

const login = async (params: LoginDTO): Promise<AuthResponseDTO> => {
  return HttpService.post(
    `${BASE()}/login`,
    params,
  ) as Promise<AuthResponseDTO>;
};

const register = async (params: RegisterDTO): Promise<AuthResponseDTO> => {
  return HttpService.post(
    `${BASE()}/register`,
    params,
  ) as Promise<AuthResponseDTO>;
};

const getMe = async (): Promise<AuthUserDTO> => {
  return HttpService.get(`${BASE()}/me`) as Promise<AuthUserDTO>;
};

export const AuthRepository = { login, register, getMe };