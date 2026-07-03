import config from "../config/index.config.js";
import HttpService from "../services/Http.service.js";
import type {
  LoginDTO,
  RegisterDTO,
  AuthResponseDTO,
} from "../dtos/Auth.dto.js";

const login = async (params: LoginDTO): Promise<AuthResponseDTO> => {
  return HttpService.post(
    `${config.API_URL}/auth/login`,
    params,
  ) as Promise<AuthResponseDTO>;
};

const register = async (params: RegisterDTO): Promise<AuthResponseDTO> => {
  return HttpService.post(
    `${config.API_URL}/auth/register`,
    params,
  ) as Promise<AuthResponseDTO>;
};

export const AuthRepository = { login, register };
