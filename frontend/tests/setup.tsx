/**
 * Vitest Global Setup — IntelliDoc Frontend
 *
 * =================================================================
 * SETUP ORDER — DO NOT REARRANGE
 * =================================================================
 * 1. DOM matchers (toBeInTheDocument, toHaveClass, etc.)
 * 2. Canvas mock (prevents Chart.js crashes in jsdom)
 * 3. Next.js module mocks (navigation, image, link)
 * 4. MSW server lifecycle (listen/reset/close)
 * =================================================================
 */

// ─── STEP 1: DOM matchers ────────────────────────────────────
import "@testing-library/jest-dom/vitest";

// ─── STEP 2: Canvas mock ────────────────────────────────────
// jsdom doesn't implement HTMLCanvasElement.getContext().
// Chart.js (react-chartjs-2) will crash without this.
HTMLCanvasElement.prototype.getContext = (() => {
  return {
    fillRect: () => {},
    clearRect: () => {},
    getImageData: () => ({ data: [] }),
    putImageData: () => {},
    createImageData: () => [],
    setTransform: () => {},
    drawImage: () => {},
    save: () => {},
    fillText: () => {},
    restore: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    closePath: () => {},
    stroke: () => {},
    translate: () => {},
    scale: () => {},
    rotate: () => {},
    arc: () => {},
    fill: () => {},
    measureText: () => ({ width: 0 }),
    transform: () => {},
    rect: () => {},
    clip: () => {},
    createLinearGradient: () => ({
      addColorStop: () => {},
    }),
    createRadialGradient: () => ({
      addColorStop: () => {},
    }),
    createPattern: () => ({}),
    canvas: { width: 300, height: 300 },
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as any;

// ─── STEP 3: Next.js module mocks ───────────────────────────

// --- next/navigation ---
// Used by: page.tsx (useRouter), NavBar.tsx (usePathname)
import { vi } from "vitest";

const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockBack = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
    prefetch: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/landingpage",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

// --- next/image ---
// Renders a plain <img> instead of the optimized Image component
vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    const { fill, priority, unoptimized, ...rest } = props;
    // suppress Next.js-specific props
    void fill;
    void priority;
    void unoptimized;
    return <img {...rest} />;
  },
}));

// --- next/link ---
// Renders a plain <a> instead of the prefetching Link component
vi.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
    ...rest
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a
      href={href}
      {...rest}>
      {children}
    </a>
  ),
}));

// Export mocks for per-test assertions
export { mockPush, mockReplace, mockBack };

// ─── STEP 4: MSW server lifecycle ───────────────────────────
import { server } from "./mocks/server";

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
