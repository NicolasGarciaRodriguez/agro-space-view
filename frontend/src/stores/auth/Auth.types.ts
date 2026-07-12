import { UserRole } from "@agrospace/shared/enums/UserRole.enum";
import { UserPlan } from "@agrospace/shared/enums/UserPlan.enum";
import { EmailVerificationStatus } from "@agrospace/shared/enums/EmailVerificationStatus.enum";

export interface AuthUser {
  id: string;
  email: string;
  nombre: string;
  apellidos: string;
  role: UserRole;
  plan: UserPlan;
  emailVerificationStatus: EmailVerificationStatus;
  emailVerificationDeadline: string;
}

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: AuthUser) => void;
  clearAuth: () => void;
}