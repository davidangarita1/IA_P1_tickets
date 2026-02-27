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
    const user = await this.deps.userRepository.findByEmail(credentials.email);

    if (!user) {
      throw new Error('User not found');
    }

    const matches = await this.deps.passwordHasher.compare(credentials.password, user.passwordHash);

    if (!matches) {
      throw new Error('Invalid credentials');
    }

    return this.deps.tokenService.generateToken({ sub: user.id, email: user.email });
  }
}