import type { AuthCredentials, SignUpData, AuthResult } from "@/domain/AuthCredentials";
import type { User } from "@/domain/User";

export interface AuthService {
  signIn(credentials: AuthCredentials): Promise<AuthResult>;
  signUp(data: SignUpData): Promise<AuthResult>;
  signOut(): Promise<void>;
  getSession(): Promise<User | null>;
}
