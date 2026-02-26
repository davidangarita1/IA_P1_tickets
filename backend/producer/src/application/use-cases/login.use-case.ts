import { IUserRepository } from '../../domain/ports/IUserRepository';
import { IPasswordHasher } from '../ports/IPasswordHasher';

// Datos necesarios para intentar el inicio de sesión.
export interface LoginCredentials {
  email: string;
  password: string;
}

// Servicio que expone la generación de tokens firmados.
export interface ITokenService {
  generateToken(payload: Record<string, unknown>): string;
}

// Dependencias necesarias para ejecutar el flujo de login.
export interface LoginDependencies {
  userRepository: IUserRepository;
  passwordHasher: IPasswordHasher;
  tokenService: ITokenService;
}

// Maneja la autenticación de usuarios validando credenciales y emitiendo tokens.
export class LoginUseCase {
  constructor(private readonly deps: LoginDependencies) {}

  // Ejecuta el flujo de login, usando los adapters inyectados.
  async execute(credentials: LoginCredentials): Promise<string> {
    throw new Error('Login flow not implemented yet');
  }
}