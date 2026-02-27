import { setAuthCookie, getAuthCookie, removeAuthCookie, AUTH_COOKIE_NAME } from "@/infrastructure/cookies/cookieUtils";

describe("cookieUtils", () => {
  beforeEach(() => {
    document.cookie = `${AUTH_COOKIE_NAME}=; Max-Age=0; path=/`;
  });

  describe("setAuthCookie", () => {
    it("stores the token in document.cookie with the expected name", () => {
      setAuthCookie("my-jwt-token");

      expect(document.cookie).toContain(AUTH_COOKIE_NAME);
    });

    it("overwrites the existing cookie when called again", () => {
      setAuthCookie("token-one");
      setAuthCookie("token-two");

      expect(getAuthCookie()).toBe("token-two");
    });

    it("sets Max-Age on the cookie string", () => {
      const cookieDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, "cookie");
      if (!cookieDescriptor) return;
      const setSpy = jest.fn();
      Object.defineProperty(document, "cookie", { set: setSpy, get: cookieDescriptor.get, configurable: true });

      setAuthCookie("token-with-expiry");

      expect(setSpy).toHaveBeenCalledWith(expect.stringContaining("Max-Age="));

      Object.defineProperty(document, "cookie", cookieDescriptor);
    });
  });

  describe("getAuthCookie", () => {
    it("returns the token value after it has been set", () => {
      setAuthCookie("test-token-123");

      expect(getAuthCookie()).toBe("test-token-123");
    });

    it("returns null when the cookie has not been set", () => {
      expect(getAuthCookie()).toBeNull();
    });

    it("returns null when the cookie exists but has an empty value", () => {
      document.cookie = `${AUTH_COOKIE_NAME}=; path=/`;

      expect(getAuthCookie()).toBeNull();
    });

    it("returns null after the cookie has been removed", () => {
      setAuthCookie("token-to-remove");
      removeAuthCookie();

      expect(getAuthCookie()).toBeNull();
    });
  });

  describe("removeAuthCookie", () => {
    it("removes the auth cookie from document.cookie", () => {
      setAuthCookie("remove-me");

      removeAuthCookie();

      expect(document.cookie).not.toContain(AUTH_COOKIE_NAME);
    });

    it("does not throw when called without a cookie set", () => {
      expect(() => removeAuthCookie()).not.toThrow();
    });
  });
});
