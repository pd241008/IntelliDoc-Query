import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: [
    "**/tests/unit/**/*.test.ts",
    "**/tests/integration/**/*.test.ts",
  ],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  testTimeout: 30000,
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
  // Globally redirect auth middleware imports to the mock stub
  // so express-oauth2-jwt-bearer is never loaded in tests
  moduleNameMapper: {
    "^(.*)/middleware/auth_middleware$": "<rootDir>/tests/mocks/auth",
  },
};

export default config;
