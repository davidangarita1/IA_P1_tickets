/**
 * @jest-environment jsdom
 */
import { HttpAuthAdapter } from "@/infrastructure/adapters/HttpAuthAdapter";
import type { AuthCredentials, SignUpData, AuthResult } from "@/domain/AuthCredentials";
import type { User } from "@/domain/User";
import * as httpClient from "@/infrastructure/http/httpClient";
import * as cookieUtils from "@/infrastructure/cookies/cookieUtils";

jest.mock("@/infrastructure/http/httpClient");
jest.mock("@/infrastructure/cookies/cookieUtils");

const mockedHttpPost = httpClient.httpPost as jest.MockedFunction<typeof httpClient.httpPost>;
const mockedSetCookie = cookieUtils.setAuthCookie as jest.MockedFunction<typeof cookieUtils.setAuthCookie>;
const mockedGetCookie = cookieUtils.getAuthCookie as jest.MockedFunction<typeof cookieUtils.getAuthCookie>;
const mockedRemoveCookie = cookieUtils.removeAuthCookie as jest.MockedFunction<typeof cookieUtils.removeAuthCookie>;

// getSession usa fetch nativo (necesita Authorization header que httpGet no soporta)
const mockFetch = jest.fn() as jest.MockedFunction<typeof global.fetch>;
global.fetch = mockFetch;

describe("HttpAuthAdapter", () => {
  const BASE = "http://localhost:3000";
  let adapter: HttpAuthAdapter;

  beforeEach(() => {
    jest.clearAllMocks();
    adapter = new HttpAuthAdapter(BASE);
  });

  // ─── signIn ──────────────────────────────────────────────────────────
  describe("signIn", () => {
    it("calls POST /auth/signIn, stores cookie, and maps response", async () => {
      // Arrange
      const backendResponse = {
        success: true,
        message: "Login exitoso",
        token: "jwt-token",
        usuario: { id: "u1", email: "admin@eps.com", nombre: "Admin", rol: "admin" },
      };
      mockedHttpPost.mockResolvedValue(backendResponse);
      const credentials: AuthCredentials = { email: "admin@eps.com", password: "secret" };

      // Act
      const result: AuthResult = await adapter.signIn(credentials);

      // Assert
      expect(mockedHttpPost).toHaveBeenCalledWith(
        `${BASE}/auth/signIn`,
        { email: "admin@eps.com", password: "secret" },
      );
      expect(mockedSetCookie).toHaveBeenCalledWith("jwt-token");
      expect(result).toEqual({
        success: true,
        message: "Login exitoso",
        token: "jwt-token",
        user: { id: "u1", email: "admin@eps.com", name: "Admin", role: "admin" },
      });
    });

    it("returns failure and does not set cookie when backend returns success: false", async () => {
      // Arrange
      const backendResponse = { success: false, message: "Invalid credentials" };
      mockedHttpPost.mockResolvedValue(backendResponse);

      // Act
      const result = await adapter.signIn({ email: "bad@eps.com", password: "wrong" });

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe("Invalid credentials");
      expect(mockedSetCookie).not.toHaveBeenCalled();
    });

    it("returns failure when httpPost throws", async () => {
      // Arrange
      mockedHttpPost.mockRejectedValue(new Error("TIMEOUT"));

      // Act
      const result = await adapter.signIn({ email: "a@b.com", password: "x" });

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe("TIMEOUT");
    });
  });

  // ─── signUp ──────────────────────────────────────────────────────────
  describe("signUp", () => {
    it("translates name→nombre, role→rol and calls POST /auth/signUp", async () => {
      // Arrange
      const backendResponse = {
        success: true,
        message: "Registro exitoso",
        token: "new-token",
        usuario: { id: "u2", email: "nurse@eps.com", nombre: "Enfermera", rol: "empleado" },
      };
      mockedHttpPost.mockResolvedValue(backendResponse);
      const signUpData: SignUpData = { email: "nurse@eps.com", password: "secret", name: "Enfermera", role: "employee" };

      // Act
      const result: AuthResult = await adapter.signUp(signUpData);

      // Assert — sent as Spanish fields for the backend
      expect(mockedHttpPost).toHaveBeenCalledWith(
        `${BASE}/auth/signUp`,
        { email: "nurse@eps.com", password: "secret", nombre: "Enfermera", rol: "empleado" },
      );
      expect(result.success).toBe(true);
      expect(result.user).toEqual({ id: "u2", email: "nurse@eps.com", name: "Enfermera", role: "employee" });
    });

    it("does not store cookie on signup (user redirects to signin)", async () => {
      // Arrange
      const backendResponse = {
        success: true,
        message: "Registro exitoso",
        token: "new-token",
        usuario: { id: "u2", email: "nurse@eps.com", nombre: "Enfermera", rol: "empleado" },
      };
      mockedHttpPost.mockResolvedValue(backendResponse);

      // Act
      await adapter.signUp({ email: "nurse@eps.com", password: "secret", name: "Enfermera", role: "employee" });

      // Assert — cookie not set on signup because user will sign in after
      expect(mockedSetCookie).not.toHaveBeenCalled();
    });

    it("returns failure when backend returns success: false", async () => {
      // Arrange
      mockedHttpPost.mockResolvedValue({ success: false, message: "Email already in use" });

      // Act
      const result = await adapter.signUp({ email: "dup@eps.com", password: "s", name: "X", role: "employee" });

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe("Email already in use");
    });
  });

  // ─── signOut ─────────────────────────────────────────────────────────
  describe("signOut", () => {
    it("calls POST /auth/signOut and removes the cookie", async () => {
      // Arrange
      mockedHttpPost.mockResolvedValue({ success: true, message: "Sesión cerrada" });

      // Act
      await adapter.signOut();

      // Assert
      expect(mockedHttpPost).toHaveBeenCalledWith(`${BASE}/auth/signOut`, {});
      expect(mockedRemoveCookie).toHaveBeenCalled();
    });

    it("removes cookie even when the backend call fails", async () => {
      // Arrange
      mockedHttpPost.mockRejectedValue(new Error("TIMEOUT"));

      // Act
      await adapter.signOut();

      // Assert
      expect(mockedRemoveCookie).toHaveBeenCalled();
    });
  });

  // ─── getSession ──────────────────────────────────────────────────────
  describe("getSession", () => {
    it("returns user when cookie exists and GET /auth/me succeeds", async () => {
      // Arrange
      mockedGetCookie.mockReturnValue("valid-token");
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: "u1", email: "admin@eps.com", nombre: "Admin", rol: "admin" }),
      } as Response);

      // Act
      const user: User | null = await adapter.getSession();

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(`${BASE}/auth/me`, {
        method: "GET",
        headers: { Authorization: "Bearer valid-token" },
        cache: "no-store",
      });
      expect(user).toEqual({ id: "u1", email: "admin@eps.com", name: "Admin", role: "admin" });
    });

    it("returns null when no cookie is present", async () => {
      // Arrange
      mockedGetCookie.mockReturnValue(null);

      // Act
      const user = await adapter.getSession();

      // Assert
      expect(user).toBeNull();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("returns null and removes cookie when GET /auth/me fails", async () => {
      // Arrange
      mockedGetCookie.mockReturnValue("expired-token");
      mockFetch.mockResolvedValue({ ok: false, status: 401 } as Response);

      // Act
      const user = await adapter.getSession();

      // Assert
      expect(user).toBeNull();
      expect(mockedRemoveCookie).toHaveBeenCalled();
    });
  });
});
