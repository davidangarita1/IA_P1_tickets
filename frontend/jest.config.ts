import type { Config } from "jest";

const config: Config = {
    testEnvironment: "jsdom",
    transform: {
        "^.+\\.tsx?$": [
            "ts-jest",
            {
                tsconfig: "tsconfig.json",
                jsx: "react-jsx",
            },
        ],
    },
    moduleNameMapper: {
        "\\.(css)$": "<rootDir>/src/__mocks__/cssModuleMock.ts",
        "^@/(.*)$": "<rootDir>/src/$1",
    },
    setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.ts"],
    testMatch: ["<rootDir>/src/__tests__/**/*.test.ts", "<rootDir>/src/__tests__/**/*.test.tsx"],
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
};

export default config;
