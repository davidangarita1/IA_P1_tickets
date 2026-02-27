import { IUserRepository } from '../../domain/ports/IUserRepository';
import { IPasswordHasher } from '../ports/IPasswordHasher';
import { ITokenService, UsuarioResponse } from './login.use-case';

// Datos necesarios para registrar un nuevo usuario (alineado con front SignUpData).
export interface SignupCredentials {
  email: string;
  password: string;
  nombre: string;
  rol: string;
}

// Resultado del signup: token + datos de usuario para el frontend.
export interface SignupResult {
  token: string;
  usuario: UsuarioResponse;
}

// Dependencias inyectadas para el flujo de registro.
export interface SignupDependencies {
  userRepository: IUserRepository;
  passwordHasher: IPasswordHasher;
  tokenService: ITokenService;
}

// Orquesta la creación de nuevos usuarios asegurando datos válidos.
export class SignupUseCase {
  constructor(private readonly deps: SignupDependencies) {}

  // Ejecuta el registro: verifica unicidad, cifra la contraseña, persiste y retorna token + usuario.
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