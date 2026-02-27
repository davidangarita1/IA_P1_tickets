// Contrato para validar tokens de acceso en endpoints protegidos.
export interface IAccessTokenVerifier {
  verifyToken(token: string): Record<string, unknown> | null;
}