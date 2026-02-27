import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  roots: ["<rootDir>/src"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.ts"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
        jsx: "react-jsx",
      },
    ],
    ".+\\.(css|styl|less|sass|scss)$": "jest-transform-stub",
  },
  testMatch: ["**/__tests__/**/*.spec.ts", "**/__tests__/**/*.spec.tsx"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/__tests__/**",
    "!src/app/layout.tsx",
    "!src/styles/**",
    "!src/config/env.ts",
    "!src/proxy.ts",
  ],
};

export default config;
