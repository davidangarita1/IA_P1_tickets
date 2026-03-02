// Contrato para adaptar librerías de cifrado usadas en login/signup.
export interface IPasswordHasher {
  hash(value: string): Promise<string>;
  compare(candidate: string, hashed: string): Promise<boolean>;
}