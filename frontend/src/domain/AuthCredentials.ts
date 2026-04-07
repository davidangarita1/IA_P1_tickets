import type { UserRole, User } from '@/domain/User';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface AuthResult {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}
