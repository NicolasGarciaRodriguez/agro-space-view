export interface HttpErrorShape {
  status?: number;
  message?: string;
  code?: string;
}

export function isHttpError(error: unknown): error is HttpErrorShape {
  return typeof error === "object" && error !== null && "message" in error;
}
