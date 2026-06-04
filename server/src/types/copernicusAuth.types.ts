export interface CopernicusTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type: "Bearer";
  scope: string;
}

export interface TokenCache {
  token: string;
  expiresAt: number;
}

export class CopernicusAuthError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "CopernicusAuthError";
  }
}
