import { describe, expect, it, vi } from "vitest";

import { SECURITY_HEADERS } from "@/shared/config/security-headers";
import nextConfig from "../../../next.config";

describe("SECURITY_HEADERS", () => {
  it("sets the exact defensive response policy without permissive sources", () => {
    expect(SECURITY_HEADERS).toEqual([
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
      {
        key: "Content-Security-Policy",
        value: "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';",
      },
    ]);
    expect(Object.isFrozen(SECURITY_HEADERS)).toBe(true);
    expect(SECURITY_HEADERS.every(Object.isFrozen)).toBe(true);
  });

  it("applies the policy to every response route", async () => {
    vi.stubEnv("NODE_ENV", "production");

    try {
      const routes = await nextConfig.headers?.();

      expect(routes).toEqual([{ source: "/(.*)", headers: SECURITY_HEADERS }]);
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("allows React diagnostics only while the development server is running", async () => {
    vi.stubEnv("NODE_ENV", "development");

    try {
      const routes = await nextConfig.headers?.();
      const contentSecurityPolicy = routes?.[0]?.headers.find(
        ({ key }) => key === "Content-Security-Policy",
      );

      expect(contentSecurityPolicy?.value).toContain(
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      );
    } finally {
      vi.unstubAllEnvs();
    }
  });
});
