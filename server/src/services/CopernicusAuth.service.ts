import {
  CopernicusAuthError,
  type CopernicusTokenResponse,
  type TokenCache,
} from "../types/copernicusAuth.types.js";

const COPERNICUS_AUTH_CONFIG = {
  tokenUrl:
    "https://identity.dataspace.copernicus.eu/auth/realms/CDSE" +
    "/protocol/openid-connect/token",
  grantType: "client_credentials",
  expiryBufferMs: 30_000,
} as const;

let cache: TokenCache | null = null;

const fetchToken = async (): Promise<CopernicusTokenResponse> => {
  const params = new URLSearchParams({
    grant_type: COPERNICUS_AUTH_CONFIG.grantType,
    client_id: process.env.COPERNICUS_CLIENT_ID,
    client_secret: process.env.COPERNICUS_CLIENT_SECRET,
  });

  const res = await fetch(COPERNICUS_AUTH_CONFIG.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  if (!res.ok) {
    throw new CopernicusAuthError(
      `Error obteniendo token: ${res.status} ${res.statusText}`,
      res.status,
    );
  }

  return res.json() as Promise<CopernicusTokenResponse>;
};

const isExpired = (): boolean => {
  if (!cache) return true;
  return Date.now() >= cache.expiresAt;
};

const getToken = async (): Promise<string> => {
  if (!isExpired()) return cache!.token;

  const data = await fetchToken();

  cache = {
    token: data.access_token,
    expiresAt:
      Date.now() +
      data.expires_in * 1000 -
      COPERNICUS_AUTH_CONFIG.expiryBufferMs,
  };

  return cache.token;
};

const clearCache = (): void => {
  cache = null;
};

export const CopernicusAuthService = {
  getToken,
  clearCache,
};
