/**
 * Mock Auth Middleware
 *
 * Replaces the real Auth0 JWT validation middleware (checkJwt)
 * with a configurable passthrough. This file is mapped via
 * jest.config.ts moduleNameMapper to intercept all imports
 * of `middleware/auth_middleware`.
 *
 * Usage in tests:
 *   import { disableMockAuth, resetMockAuth } from "../mocks/auth";
 *   disableMockAuth();  // next request returns 401
 *   resetMockAuth();    // re-enable authentication
 */

import { Request, Response, NextFunction } from "express";

/** Default mock user payload attached to req.auth */
export const MOCK_USER = {
  sub: "auth0|test-user-123",
  email: "testuser@intellidoc.test",
  name: "Test User",
};

let _authEnabled = true;

/**
 * Disable authentication — subsequent requests through checkJwt
 * will receive a 401 Unauthorized response.
 */
export function disableMockAuth(): void {
  _authEnabled = false;
}

/**
 * Re-enable authentication (default state).
 */
export function enableMockAuth(): void {
  _authEnabled = true;
}

/**
 * Reset mock auth to its default state (enabled).
 * Call this in afterEach to prevent test bleed.
 */
export function resetMockAuth(): void {
  _authEnabled = true;
}

/**
 * Mock checkJwt middleware.
 * When enabled: attaches mock user payload to req.auth and calls next().
 * When disabled: returns 401 Unauthorized.
 */
export const checkJwt = (req: Request, res: Response, next: NextFunction): void => {
  if (!_authEnabled) {
    res.status(401).json({
      code: "invalid_token",
      message: "Unauthorized",
    });
    return;
  }

  // Attach the same shape as express-oauth2-jwt-bearer
  (req as any).auth = {
    payload: {
      sub: MOCK_USER.sub,
    },
  };

  next();
};
