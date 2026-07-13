export interface RequestResetDTO {
  email: string;
}

export interface ConfirmResetDTO {
  token: string;
  newPassword: string;
}

export interface PasswordResetResponseDTO {
  message: string;
}