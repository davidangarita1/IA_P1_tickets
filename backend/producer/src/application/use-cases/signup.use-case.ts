import { IUserRepository } from '../../domain/ports/IUserRepository';
import { IPasswordHasher } from '../ports/IPasswordHasher';

// Datos mínimos para registrar un nuevo usuario.
export interface SignupCredentials {
  email: string;
  password: string;
}

// Dependencias inyectadas para el flujo de registro.
export interface SignupDependencies {
  userRepository: IUserRepository;
  passwordHasher: IPasswordHasher;
}

// Orquesta la creación de nuevos usuarios asegurando datos válidos.
export class SignupUseCase {
  constructor(private readonly deps: SignupDependencies) {}

  // Ejecuta el registro: verifica unicidad, cifra la contraseña y persiste el usuario.
  async execute(credentials: SignupCredentials): Promise<string> {
    const existing = await this.deps.userRepository.findByEmail(credentials.email);

    if (existing) {
      throw new Error('Email already in use');
    }

    const passwordHash = await this.deps.passwordHasher.hash(credentials.password);
    const user = await this.deps.userRepository.create({
      email: credentials.email,
      passwordHash,
    });

    return user.id;
  }
}