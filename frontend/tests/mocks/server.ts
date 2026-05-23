/**
 * MSW Node Server — used by Vitest (Node.js environment)
 *
 * The server intercepts fetch() calls made by React components
 * during jsdom-based unit tests.
 */

import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
