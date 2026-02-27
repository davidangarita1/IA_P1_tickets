import { IUserRecord, IUserRepository } from '../../domain/ports/IUserRepository';

// Repositorio mínimo en memoria para habilitar auth sin romper el flujo actual.
export class InMemoryUserRepository implements IUserRepository {
  private readonly usersByEmail = new Map<string, IUserRecord>();
  private sequence = 1;

  async findByEmail(email: string): Promise<IUserRecord | null> {
    return this.usersByEmail.get(email) ?? null;
  }

  async create(params: { email: string; passwordHash: string }): Promise<IUserRecord> {
    const user: IUserRecord = {
      id: String(this.sequence++),
      email: params.email,
      passwordHash: params.passwordHash,
      isActive: true,
    };

    this.usersByEmail.set(params.email, user);
    return user;
  }
}