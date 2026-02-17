/**
 * @jest-environment node
 */

describe("env", () => {
    const ORIGINAL_ENV = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...ORIGINAL_ENV };
    });

    afterAll(() => {
        process.env = ORIGINAL_ENV;
    });

    it("should export env with API_BASE_URL when variable is set", () => {
        process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:3000";
        process.env.NEXT_PUBLIC_WS_URL = "http://localhost:3000";

        const { env } = require("@/config/env");

        expect(env.API_BASE_URL).toBe("http://localhost:3000");
    });

    it("should export env with WS_URL when variable is set", () => {
        process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:3000";
        process.env.NEXT_PUBLIC_WS_URL = "ws://localhost:3000";

        const { env } = require("@/config/env");

        expect(env.WS_URL).toBe("ws://localhost:3000");
    });

    it("should throw when NEXT_PUBLIC_API_BASE_URL is missing", () => {
        delete process.env.NEXT_PUBLIC_API_BASE_URL;
        process.env.NEXT_PUBLIC_WS_URL = "ws://localhost:3000";

        expect(() => {
            require("@/config/env");
        }).toThrow("Missing env variable: NEXT_PUBLIC_API_BASE_URL");
    });

    it("should throw when NEXT_PUBLIC_WS_URL is missing", () => {
        process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:3000";
        delete process.env.NEXT_PUBLIC_WS_URL;

        expect(() => {
            require("@/config/env");
        }).toThrow("Missing env variable: NEXT_PUBLIC_WS_URL");
    });
});
