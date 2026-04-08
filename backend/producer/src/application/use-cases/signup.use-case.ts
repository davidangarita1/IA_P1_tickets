import { IUserRepository } from '../../domain/ports/IUserRepository';
import { IPasswordHasher } from '../ports/IPasswordHasher';
import { ITokenService, UsuarioResponse } from './login.use-case';

export interface SignupCredentials {
  email: string;
  password: string;
  nombre: string;
  rol: string;
}

export interface SignupResult {
  token: string;
  usuario: UsuarioResponse;
}

export interface SignupDependencies {
  userRepository: IUserRepository;
  passwordHasher: IPasswordHasher;
  tokenService: ITokenService;
}

export class SignupUseCase {
  constructor(private readonly deps: SignupDependencies) {}

  async execute(credentials: SignupCredentials): Promise<SignupResult> {
    const existing = await this.deps.userRepository.findByEmail(credentials.email);

    if (existing) {
      throw new Error('Email already in use');
    }

    const passwordHash = await this.deps.passwordHasher.hash(credentials.password);
    const user = await this.deps.userRepository.create({
      email: credentials.email,
      passwordHash,
      nombre: credentials.nombre,
      rol: credentials.rol,
    });

    const tokenPayload = { sub: user.id, email: user.email, nombre: user.nombre, rol: user.rol };
    const token = this.deps.tokenService.generateToken(tokenPayload);

    return {
      token,
      usuario: { id: user.id, email: user.email, nombre: user.nombre, rol: user.rol },
    };
  }
}
