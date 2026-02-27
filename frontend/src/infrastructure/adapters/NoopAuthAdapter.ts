import type { AuthService } from "@/domain/ports/AuthService";
import type { AuthCredentials, SignUpData, AuthResult } from "@/domain/AuthCredentials";
import type { User } from "@/domain/User";

export class NoopAuthAdapter implements AuthService {
  async signIn(_credentials: AuthCredentials): Promise<AuthResult> {
    return { success: false, message: "Auth not configured" };
  }

  async signUp(_data: SignUpData): Promise<AuthResult> {
    return { success: false, message: "Auth not configured" };
  }

  async signOut(): Promise<void> {}

  async getSession(): Promise<User | null> {
    return null;
  }
}
