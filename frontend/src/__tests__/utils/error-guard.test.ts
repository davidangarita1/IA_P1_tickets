import {
    isError,
    getErrorMessage,
    getSocketErrorMessage,
    getUserErrorMessage,
} from "@/utils/error-guard";
import type { SocketError } from "@/utils/error-guard";

describe("error-guard", () => {
    describe("isError", () => {
        it("should return true for Error instances", () => {
            expect(isError(new Error("test"))).toBe(true);
        });

        it("should return true for TypeError instances", () => {
            expect(isError(new TypeError("type error"))).toBe(true);
        });

        it("should return false for strings", () => {
            expect(isError("not an error")).toBe(false);
        });

        it("should return false for null", () => {
            expect(isError(null)).toBe(false);
        });

        it("should return false for undefined", () => {
            expect(isError(undefined)).toBe(false);
        });

        it("should return false for plain objects", () => {
            expect(isError({ message: "fake" })).toBe(false);
        });
    });

    describe("getErrorMessage", () => {
        it("should extract message from Error", () => {
            expect(getErrorMessage(new Error("boom"))).toBe("boom");
        });

        it("should return a string directly", () => {
            expect(getErrorMessage("direct message")).toBe("direct message");
        });

        it("should return UNKNOWN_ERROR for numbers", () => {
            expect(getErrorMessage(42)).toBe("UNKNOWN_ERROR");
        });

        it("should return UNKNOWN_ERROR for null", () => {
            expect(getErrorMessage(null)).toBe("UNKNOWN_ERROR");
        });

        it("should return UNKNOWN_ERROR for undefined", () => {
            expect(getErrorMessage(undefined)).toBe("UNKNOWN_ERROR");
        });
    });

    describe("getSocketErrorMessage", () => {
        it("should handle Error instances", () => {
            const err: SocketError = new Error("socket fail");
            expect(getSocketErrorMessage(err)).toBe("socket fail");
        });

        it("should handle string errors", () => {
            const err: SocketError = "connection refused";
            expect(getSocketErrorMessage(err)).toBe("connection refused");
        });

        it("should handle objects with message property", () => {
            const err: SocketError = { message: "timeout" };
            expect(getSocketErrorMessage(err)).toBe("timeout");
        });
    });

    describe("getUserErrorMessage", () => {
        it("should map TIMEOUT to user-friendly message", () => {
            const result = getUserErrorMessage(new Error("TIMEOUT"));
            expect(result).toContain("took too long");
        });

        it("should map RATE_LIMIT to user-friendly message", () => {
            const result = getUserErrorMessage(new Error("RATE_LIMIT"));
            expect(result).toContain("Too many requests");
        });

        it("should map SERVER_ERROR to user-friendly message", () => {
            const result = getUserErrorMessage(new Error("SERVER_ERROR"));
            expect(result).toContain("Server error");
        });

        it("should map HTTP_ERROR to user-friendly message", () => {
            const result = getUserErrorMessage(new Error("HTTP_ERROR"));
            expect(result).toContain("Server error");
        });

        it("should map CIRCUIT_OPEN to user-friendly message", () => {
            const result = getUserErrorMessage(new Error("CIRCUIT_OPEN"));
            expect(result).toContain("temporarily unavailable");
        });

        it("should return default message for unknown errors", () => {
            const result = getUserErrorMessage(new Error("SOMETHING_ELSE"));
            expect(result).toContain("Could not register");
        });

        it("should handle non-Error values", () => {
            const result = getUserErrorMessage("string error");
            expect(result).toContain("Could not register");
        });
    });
});
