export type UserRole = "admin" | "user";

export interface AuthUser {
  id: string;
  email: string;
  nombre: string;
  apellidos: string;
  role: UserRole;
}

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: AuthUser) => void;
  clearAuth: () => void;
}
