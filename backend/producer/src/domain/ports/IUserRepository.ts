// Representa un usuario persistido y sus campos mínimos de autenticación.
export interface IUserRecord {
  id: string;
  email: string;
  passwordHash: string;
  isActive: boolean;
}

// Puerto para desacoplar lógica de persistencia de usuarios.
export interface IUserRepository {
  findByEmail(email: string): Promise<IUserRecord | null>;
  create(params: { email: string; passwordHash: string }): Promise<IUserRecord>;
}